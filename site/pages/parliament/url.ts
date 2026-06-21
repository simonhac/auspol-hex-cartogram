/**
 * Custom-mode configuration types + URL (de)serialisation for the Parliament
 * page. Pure and framework-free so it can be unit-tested in isolation; the
 * React wiring lives in {@link useCustomConfigUrl}.
 *
 * Encoding (kept short + human-tolerable):
 *   ?mode=custom
 *   ?g=<name>~<hex6>~<seats>|<name>~<hex6>~<seats>|…
 *   ?geo=<outerRadius>_<innerRadiusRatio>_<seatRadiusRatio>_<rows|auto>_<linear|proportional>
 *
 * Grouping ids are NOT serialised — they are regenerated on load (they only
 * need to be stable within a session for React/dnd-kit keys).
 */

import {
  ARC_OUTER_RADIUS,
  ARC_INNER_RATIO,
  ARC_SEAT_RATIO,
  ARC_DISTRIBUTION,
} from "auspoligraphs";

export interface Grouping {
  id: string;
  name: string;
  color: string;
  seats: number;
}

export interface Geometry {
  outerRadius: number;
  innerRadiusRatio: number;
  seatRadiusRatio: number;
  /** Concentric rows, or "auto" to let the arc derive a pleasing count. */
  rows: number | "auto";
  distribution: "linear" | "proportional";
}

export interface CustomConfig {
  groupings: Grouping[];
  geometry: Geometry;
}

/* ------------------------------- bounds -------------------------------- */

export const MAX_GROUPINGS = 40;
export const MAX_SEATS = 9999;
export const MAX_NAME = 60;

interface Range {
  min: number;
  max: number;
}

export const GEO_BOUNDS = {
  outerRadius: { min: 120, max: 360 } as Range,
  innerRadiusRatio: { min: 0.05, max: 0.95 } as Range,
  seatRadiusRatio: { min: 0.2, max: 0.8 } as Range,
  rows: { min: 1, max: 20 } as Range,
};

/** Seed geometry = the library's own defaults, so a fresh Custom arc looks
 *  identical to the read-only one until the user changes something. */
export const DEFAULT_GEOMETRY: Geometry = {
  outerRadius: ARC_OUTER_RADIUS,
  innerRadiusRatio: ARC_INNER_RATIO,
  seatRadiusRatio: ARC_SEAT_RATIO,
  rows: "auto",
  distribution: ARC_DISTRIBUTION,
};

/** URL parameter names. */
export const PARAM_MODE = "mode";
export const PARAM_GROUPINGS = "g";
export const PARAM_GEOMETRY = "geo";
/** Every param this feature owns — used to clear the URL when leaving custom. */
export const CUSTOM_PARAMS = [PARAM_MODE, PARAM_GROUPINGS, PARAM_GEOMETRY];

/* ------------------------------ helpers -------------------------------- */

/** A fresh, stable grouping id. */
export function newId(): string {
  return crypto.randomUUID();
}

function clampNum(value: number, { min, max }: Range, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function clampSeats(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(MAX_SEATS, Math.max(0, Math.floor(value)));
}

const HEX6 = /^[0-9a-fA-F]{6}$/;

// Escape only the structural delimiters ("~" between fields, "|" between rows)
// and the escape char itself, so a name can't break the split. We deliberately
// do NOT encodeURIComponent here: URLSearchParams applies exactly one layer of
// percent-encoding when the value is written/read, so pre-encoding would
// double-encode in the final URL (e.g. "One%2520Nation"). "*" is left
// untouched by the urlencoded serialiser, keeping shared links clean.
function escapeName(name: string): string {
  return name.replace(/\*/g, "*0").replace(/~/g, "*1").replace(/\|/g, "*2");
}

function unescapeName(s: string): string {
  return s.replace(/\*([012])/g, (_, d) => (d === "0" ? "*" : d === "1" ? "~" : "|"));
}

/* ------------------------------- encode -------------------------------- */

function encodeGrouping(g: Grouping): string {
  const hex6 = g.color.replace(/^#/, "").toLowerCase();
  return `${escapeName(g.name)}~${hex6}~${clampSeats(g.seats)}`;
}

function encodeGeometry(g: Geometry): string {
  const num = (n: number) => String(+n.toFixed(4));
  return [
    num(g.outerRadius),
    num(g.innerRadiusRatio),
    num(g.seatRadiusRatio),
    g.rows === "auto" ? "auto" : String(Math.round(g.rows)),
    g.distribution,
  ].join("_");
}

/** The params (key → value) that represent a custom config in the URL. */
export function encodeCustom(config: CustomConfig): Record<string, string> {
  return {
    [PARAM_MODE]: "custom",
    [PARAM_GROUPINGS]: config.groupings.map(encodeGrouping).join("|"),
    [PARAM_GEOMETRY]: encodeGeometry(config.geometry),
  };
}

/* ------------------------------- decode -------------------------------- */

function decodeGroupings(raw: string | null): Grouping[] {
  if (!raw) return [];
  const out: Grouping[] = [];
  for (const segment of raw.split("|")) {
    if (out.length >= MAX_GROUPINGS) break;
    const parts = segment.split("~");
    if (parts.length !== 3) continue; // malformed — skip
    const [rawName, rawHex, rawSeats] = parts;
    if (!HEX6.test(rawHex)) continue; // corrupt colour — skip
    out.push({
      id: newId(),
      name: unescapeName(rawName).slice(0, MAX_NAME),
      color: `#${rawHex.toLowerCase()}`,
      seats: clampSeats(Number(rawSeats)),
    });
  }
  return out;
}

function decodeGeometry(raw: string | null): Geometry {
  const d = DEFAULT_GEOMETRY;
  if (!raw) return { ...d };
  const [or, ir, sr, rows, dist] = raw.split("_");
  const parsedRows = Number(rows);
  return {
    outerRadius: clampNum(Number(or), GEO_BOUNDS.outerRadius, d.outerRadius),
    innerRadiusRatio: clampNum(Number(ir), GEO_BOUNDS.innerRadiusRatio, d.innerRadiusRatio),
    seatRadiusRatio: clampNum(Number(sr), GEO_BOUNDS.seatRadiusRatio, d.seatRadiusRatio),
    rows:
      rows === "auto" || !Number.isFinite(parsedRows)
        ? "auto"
        : clampNum(parsedRows, GEO_BOUNDS.rows, GEO_BOUNDS.rows.min),
    distribution: dist === "proportional" ? "proportional" : "linear",
  };
}

/** Decode a custom config from URL params, or null if the URL isn't custom or
 *  carries no usable groupings. Never throws. */
export function decodeCustom(params: URLSearchParams): CustomConfig | null {
  if (params.get(PARAM_MODE) !== "custom") return null;
  const groupings = decodeGroupings(params.get(PARAM_GROUPINGS));
  if (groupings.length === 0) return null;
  return { groupings, geometry: decodeGeometry(params.get(PARAM_GEOMETRY)) };
}
