/**
 * Pure utility functions for the hex cartogram.
 *
 * No framework dependencies — suitable for use in any JS/TS project.
 * All functions are pure and stateless.
 */

import type { GridEntry, Electorate } from "./types";

/** Default hex cell radius in pixels */
export const HEX_SIZE = 14;

const HEX_W = Math.sqrt(3) * HEX_SIZE;
const HEX_H = 2 * HEX_SIZE;

/** Convert an electorate name to its seat ID (uppercase, strip non-alpha) */
export function nameToSeatId(name: string): string {
  return name.toUpperCase().replace(/[^A-Z]/g, "");
}

/** Pointy-top hex, odd-row offset → pixel centre */
export function cellToPixel(col: number, row: number): { x: number; y: number } {
  return {
    x: HEX_W * (col + 0.5 * (row & 1)),
    y: 0.75 * HEX_H * row,
  };
}

/** Convert a raw grid array into fully resolved Electorate objects */
export function resolveGrid(grid: GridEntry[]): Electorate[] {
  return grid.map(([col, row, state, name]) => {
    const { x, y } = cellToPixel(col, row);
    return {
      code: name.substring(0, 4).toUpperCase(),
      name,
      state,
      seatId: nameToSeatId(name),
      col,
      row,
      px: x,
      py: y,
    };
  });
}

/** Generate SVG pointy-top hexagon points string centred at (cx, cy) */
export function hexPoints(cx: number, cy: number, size: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    pts.push(`${cx + size * Math.cos(angle)},${cy + size * Math.sin(angle)}`);
  }
  return pts.join(" ");
}

/**
 * Compute SVG path segments for state borders.
 * Returns a `d` attribute string of M/L segments for every hex edge
 * where the neighbour is absent or belongs to a different state.
 */
export function computeStateBorders(
  hexes: Pick<Electorate, "col" | "row" | "state" | "px" | "py">[],
  size: number,
): string {
  const evenNeighbors: [number, number][] = [
    [0, -1], [1, 0], [0, 1], [-1, 1], [-1, 0], [-1, -1],
  ];
  const oddNeighbors: [number, number][] = [
    [1, -1], [1, 0], [1, 1], [0, 1], [-1, 0], [0, -1],
  ];

  const stateAt = new Map<string, string>();
  for (const h of hexes) {
    stateAt.set(`${h.col},${h.row}`, h.state);
  }

  const segments: string[] = [];

  for (const h of hexes) {
    const neighbors = h.row & 1 ? oddNeighbors : evenNeighbors;
    for (let dir = 0; dir < 6; dir++) {
      const [dc, dr] = neighbors[dir];
      const neighborState = stateAt.get(`${h.col + dc},${h.row + dr}`);
      if (neighborState === h.state) continue;

      const a0 = (Math.PI / 3) * dir - Math.PI / 2;
      const a1 = (Math.PI / 3) * ((dir + 1) % 6) - Math.PI / 2;
      const x0 = h.px + size * Math.cos(a0);
      const y0 = h.py + size * Math.sin(a0);
      const x1 = h.px + size * Math.cos(a1);
      const y1 = h.py + size * Math.sin(a1);
      segments.push(`M${x0.toFixed(2)},${y0.toFixed(2)}L${x1.toFixed(2)},${y1.toFixed(2)}`);
    }
  }

  return segments.join("");
}

/** State → fill colour for the default (no-election) view */
export const STATE_HEX_COLORS: Record<string, string> = {
  ACT: "#8B5CF6",
  NSW: "#3B82F6",
  NT: "#F97316",
  QLD: "#991B1B",
  SA: "#EF4444",
  TAS: "#06B6D4",
  VIC: "#1D4ED8",
  WA: "#EAB308",
};
