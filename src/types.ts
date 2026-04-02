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
