/**
 * Types for the Australian federal electorate hex cartogram.
 */

/** Raw grid entry: [col, row, state, name] */
export type GridEntry = [col: number, row: number, state: string, name: string];

/** A fully resolved electorate with pixel coordinates */
export interface Electorate {
  /** Short code (first 4 chars, uppercase) for compact labels */
  code: string;
  /** Full electorate name, e.g. "Kingsford Smith" */
  name: string;
  /** State/territory abbreviation: ACT, NSW, NT, QLD, SA, TAS, VIC, WA */
  state: string;
  /** Seat ID (uppercase, no separators), e.g. "KINGSFORDSMITH" */
  seatId: string;
  /** Grid column (integer) */
  col: number;
  /** Grid row (integer) */
  row: number;
  /** Pixel x (pre-computed from col/row via cellToPixel) */
  px: number;
  /** Pixel y (pre-computed from col/row via cellToPixel) */
  py: number;
}

/* -------------------------------------------------------------------------- */
/* Parliament arc (seat-dot) chart                                            */
/* -------------------------------------------------------------------------- */

/** A party (or grouping) to render in a parliament chart. */
export interface Party {
  /** Optional stable identifier (defaults to `name`). */
  id?: string;
  /** Display name, e.g. "Labor". */
  name: string;
  /** Fill colour for this party's seats (any CSS colour). */
  color: string;
  /** Number of seats held. Non-integers are floored; negatives ignored. */
  seats: number;
}

/** A single resolved seat dot in a parliament arc. */
export interface ArcSeat {
  /** Position in the overall left→right ordering (0 = leftmost seat). */
  index: number;
  /** Concentric row, 0 = innermost. */
  row: number;
  /** Angle in radians: π = far left, π/2 = top, 0 = far right. */
  angle: number;
  /** Pixel x relative to the arc centre (origin), +x = right. */
  x: number;
  /** Pixel y relative to the arc centre (origin), −y = up. */
  y: number;
  /** The party this seat belongs to. */
  party: Party;
  /** Index of `party` within the input `parties` array. */
  partyIndex: number;
}

/** Tuning options for {@link computeArcLayout}. */
export interface ArcLayoutOptions {
  /** Number of concentric rows. Auto-derived from the seat count if omitted. */
  rows?: number;
  /** Outer radius in pixels. Default 250. */
  outerRadius?: number;
  /** Inner radius as a fraction of the outer radius (0–1). Default 0.229. */
  innerRadiusRatio?: number;
  /** Seat dot radius as a fraction of the available spacing. Default 0.48. */
  seatRadiusRatio?: number;
  /** Explicit seat dot radius in pixels (overrides `seatRadiusRatio`). */
  seatRadius?: number;
  /**
   * Seats-per-row distribution. Default `"linear"`.
   *
   * - `"linear"`: counts proportional to row index (inner rows sparser than
   *   outer rows) — matches the ABC reference chart.
   * - `"proportional"`: counts proportional to row radius (≈ equal dot spacing
   *   in every row).
   */
  distribution?: "linear" | "proportional";
}

/** Fully resolved parliament arc layout. */
export interface ArcLayout {
  /** Every seat, ordered left→right (index 0 = leftmost). */
  seats: ArcSeat[];
  /** Number of concentric rows used. */
  rows: number;
  /** Number of seats in each row, innermost first. */
  seatsPerRow: number[];
  /** Seat dot radius in pixels. */
  seatRadius: number;
  /** Inner radius in pixels. */
  innerRadius: number;
  /** Outer radius in pixels. */
  outerRadius: number;
  /** Bounding-box width in pixels. */
  width: number;
  /** Bounding-box height in pixels. */
  height: number;
  /** Ready-to-use SVG `viewBox` string for the layout's bounding box. */
  viewBox: string;
}

/** Election-specific hex map dataset */
export interface ElectionMap {
  /** Election identifier, e.g. "2019-FED" */
  electionId: string;
  /** Human-readable label */
  label: string;
  /** Total seats in this election */
  seatCount: number;
  /** Raw grid entries */
  grid: GridEntry[];
  /** Pre-computed Electorate array */
  electorates: Electorate[];
}
