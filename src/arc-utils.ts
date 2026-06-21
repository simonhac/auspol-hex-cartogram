/**
 * Pure utility functions for the parliament arc (seat-dot) chart.
 *
 * No framework dependencies — suitable for use in any JS/TS project.
 * All functions are pure and stateless.
 *
 * Seats are arranged on concentric semicircle rows (a half-donut). The number
 * of seats in each row is proportional to that row's arc length, so the dots
 * end up evenly spaced in both directions. Parties are then laid out as clean
 * left→right wedges by sorting all seats by angle.
 */

import type { ArcLayout, ArcLayoutOptions, ArcSeat, Party } from "./types";

/** Default outer radius of the arc in pixels. */
export const ARC_OUTER_RADIUS = 250;
/**
 * Default inner radius as a fraction of the outer radius.
 *
 * Reverse-engineered from the ABC reference chart (see `tools/arc-fidelity`):
 * the reference's inner row sits at 0.229·Rout. This controls only the visual
 * hole — the seats-per-row split is governed by {@link ArcLayoutOptions.distribution}.
 */
export const ARC_INNER_RATIO = 0.229;
/** Default seat dot radius as a fraction of the available spacing. */
export const ARC_SEAT_RATIO = 0.48;
/** Default seats-per-row distribution. See {@link ArcLayoutOptions.distribution}. */
export const ARC_DISTRIBUTION = "linear" as const;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Normalise a party's seat count to a non-negative integer. */
function seatCount(party: Party): number {
  return Math.max(0, Math.floor(party.seats));
}

/**
 * Auto-derive a pleasing number of rows for a given seat total.
 *
 * Seats per row are proportional to the row radius, so the per-seat angular
 * spacing is constant across rows. Setting that spacing roughly equal to the
 * radial spacing between rows yields `rows ≈ √(total · 2(1−f) / (π(1+f)))`,
 * where `f` is the inner-radius ratio.
 */
function autoRows(total: number, innerRatio: number): number {
  const k = (2 * (1 - innerRatio)) / (Math.PI * (1 + innerRatio));
  return Math.max(1, Math.round(Math.sqrt(total * k)));
}

/** Radii of each row, innermost first. */
function rowRadii(rows: number, innerRadius: number, outerRadius: number): number[] {
  if (rows === 1) return [(innerRadius + outerRadius) / 2];
  const radii: number[] = [];
  for (let i = 0; i < rows; i++) {
    radii.push(innerRadius + ((outerRadius - innerRadius) * i) / (rows - 1));
  }
  return radii;
}

/**
 * Distribute `total` across rows in proportion to `weights`, using the
 * largest-remainder method so the parts sum exactly to `total`.
 */
function largestRemainder(total: number, weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum === 0) return weights.map(() => 0);

  const raw = weights.map((w) => (total * w) / sum);
  const counts = raw.map(Math.floor);
  let remaining = total - counts.reduce((a, b) => a + b, 0);

  const byFraction = raw
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac);

  for (let k = 0; remaining > 0 && byFraction.length > 0; k++, remaining--) {
    counts[byFraction[k % byFraction.length].i]++;
  }
  return counts;
}

/**
 * Per-row seat counts (innermost first) for a given distribution.
 *
 * - `"linear"`: counts proportional to the row index (inner row → 1 share,
 *   outer row → `rows` shares). This makes the inner rows sparser than the outer
 *   rows — the look of the ABC reference chart, and the default.
 * - `"proportional"`: counts proportional to each row's radius (≈ equal dot
 *   spacing in every row).
 */
function distributeSeats(
  total: number,
  radii: number[],
  distribution: "linear" | "proportional",
): number[] {
  const weights =
    distribution === "proportional"
      ? radii
      : radii.map((_, i) => i + 1);
  return largestRemainder(total, weights);
}

/**
 * Compute a parliament arc layout for a list of parties.
 *
 * Parties are laid out left→right in array order: `parties[0]` occupies the
 * leftmost wedge. The returned seats are ordered left→right (`index` 0 is the
 * leftmost seat). Coordinates are relative to the arc centre (origin), with
 * `+x` pointing right and `−y` pointing up; use the returned `viewBox` to frame
 * them in an SVG.
 *
 * @param parties Parties in left→right order.
 * @param options Layout tuning. See {@link ArcLayoutOptions}.
 */
export function computeArcLayout(
  parties: Party[],
  options: ArcLayoutOptions = {},
): ArcLayout {
  const outerRadius = options.outerRadius ?? ARC_OUTER_RADIUS;
  const innerRatio = clamp(options.innerRadiusRatio ?? ARC_INNER_RATIO, 0.05, 0.95);
  const seatRatio = options.seatRadiusRatio ?? ARC_SEAT_RATIO;
  const distribution = options.distribution ?? ARC_DISTRIBUTION;
  const innerRadius = outerRadius * innerRatio;

  const total = parties.reduce((sum, p) => sum + seatCount(p), 0);

  if (total === 0) {
    return {
      seats: [],
      rows: 0,
      seatsPerRow: [],
      seatRadius: 0,
      innerRadius,
      outerRadius,
      width: 2 * outerRadius,
      height: outerRadius,
      viewBox: `${-outerRadius} ${-outerRadius} ${2 * outerRadius} ${outerRadius}`,
    };
  }

  // Choose a row count, shrinking it if rounding would empty an inner row.
  let rows = Math.max(1, options.rows ?? autoRows(total, innerRatio));
  rows = Math.min(rows, total);
  let radii = rowRadii(rows, innerRadius, outerRadius);
  let seatsPerRow = distributeSeats(total, radii, distribution);
  while (rows > 1 && seatsPerRow.some((n) => n === 0)) {
    rows--;
    radii = rowRadii(rows, innerRadius, outerRadius);
    seatsPerRow = distributeSeats(total, radii, distribution);
  }

  // Build seat positions row by row (angle runs π → 0, i.e. left → right).
  const placed: { row: number; angle: number; x: number; y: number }[] = [];
  for (let r = 0; r < rows; r++) {
    const n = seatsPerRow[r];
    const radius = radii[r];
    for (let j = 0; j < n; j++) {
      const frac = n === 1 ? 0.5 : (j + 0.5) / n;
      const angle = Math.PI * (1 - frac);
      placed.push({
        row: r,
        angle,
        x: radius * Math.cos(angle),
        y: -radius * Math.sin(angle),
      });
    }
  }

  // Order all seats left→right (largest angle first), then assign parties in
  // order so each party occupies a contiguous angular wedge.
  placed.sort((a, b) => b.angle - a.angle || a.row - b.row);

  const seats: ArcSeat[] = new Array(placed.length);
  let cursor = 0;
  parties.forEach((party, partyIndex) => {
    const count = seatCount(party);
    for (let c = 0; c < count; c++, cursor++) {
      const p = placed[cursor];
      seats[cursor] = {
        index: cursor,
        row: p.row,
        angle: p.angle,
        x: p.x,
        y: p.y,
        party,
        partyIndex,
      };
    }
  });

  // Seat dot radius: keep dots clear of both their row neighbours and the
  // adjacent rows. By construction these spacings are roughly equal.
  const radialSpacing =
    rows === 1 ? outerRadius - innerRadius : (outerRadius - innerRadius) / (rows - 1);
  const arcSpacings = radii.map((r, i) =>
    seatsPerRow[i] > 0 ? (Math.PI * r) / seatsPerRow[i] : Infinity,
  );
  const minSpacing = Math.min(radialSpacing, ...arcSpacings);
  const seatRadius = options.seatRadius ?? seatRatio * minSpacing;

  const pad = seatRadius;
  const width = 2 * (outerRadius + pad);
  const height = outerRadius + 2 * pad;
  const viewBox = `${-outerRadius - pad} ${-outerRadius - pad} ${width} ${height}`;

  return {
    seats,
    rows,
    seatsPerRow,
    seatRadius,
    innerRadius,
    outerRadius,
    width,
    height,
    viewBox,
  };
}
