import type {
  VotesParty,
  SeatsParty,
  CompositionParty,
} from "auspoligraphs/react";

/**
 * Real Australian federal House of Representatives results for the last three
 * elections (2019, 2022, 2025), used as the toggle states for the Votes, Seats
 * and Composition Bar demos.
 *
 * Figures are first-preference (primary) vote shares/counts, swings, and seats
 * grouped into six rows: Labor, the Coalition (Liberal + National + LNP + CLP
 * combined), Greens, One Nation, all non-party Independents, and Other (Katter's
 * Australian Party, Centre Alliance, UAP and remaining minor parties). Compiled
 * from the AEC Tally Room national first-preferences-by-party pages and
 * cross-checked against Wikipedia's results articles. Seats sum to the chamber
 * total each year (151 in 2019/2022, 150 in 2025); majority is 76 throughout.
 */

export const ELECTION_YEARS = ["2019", "2022", "2025"] as const;
export type ElectionYear = (typeof ELECTION_YEARS)[number];

type PartyId = "alp" | "coa" | "grn" | "onp" | "ind" | "oth";

interface PartyMeta {
  id: PartyId;
  code: string;
  name: string;
  color: string;
}

/** Party identity/colour, shared across all three years. */
const FED_PARTIES: Record<PartyId, PartyMeta> = {
  alp: { id: "alp", code: "ALP", name: "Labor", color: "#DE3A30" },
  coa: { id: "coa", code: "COA", name: "Coalition", color: "#2E6DB4" },
  grn: { id: "grn", code: "GRN", name: "Greens", color: "#10A05F" },
  onp: { id: "onp", code: "ONP", name: "One Nation", color: "#F2811C" },
  ind: { id: "ind", code: "IND", name: "Independents", color: "#3D8E8E" },
  oth: { id: "oth", code: "OTH", name: "Other", color: "#8A8278" },
};

interface ResultRow {
  id: PartyId;
  /** First-preference vote share (%). */
  votePct: number;
  /** First-preference vote count. */
  voteCount: number;
  /** Primary-vote swing vs the previous election (percentage points). */
  swing: number;
  /** House seats won. */
  seats: number;
  /** Seat change vs the previous election. */
  change: number;
}

interface ElectionResult {
  total: number;
  majority: number;
  /** Rows in display order (major parties first). */
  rows: ResultRow[];
}

const RESULTS: Record<ElectionYear, ElectionResult> = {
  "2019": {
    total: 151,
    majority: 76,
    rows: [
      { id: "alp", votePct: 33.34, voteCount: 4_752_160, swing: -1.39, seats: 68, change: -1 },
      { id: "coa", votePct: 41.44, voteCount: 5_906_875, swing: -0.6, seats: 77, change: 1 },
      { id: "grn", votePct: 10.4, voteCount: 1_482_923, swing: 0.17, seats: 1, change: 0 },
      { id: "onp", votePct: 3.08, voteCount: 438_587, swing: 1.79, seats: 0, change: 0 },
      { id: "ind", votePct: 3.37, voteCount: 479_836, swing: 0.56, seats: 3, change: 1 },
      { id: "oth", votePct: 8.37, voteCount: 1_193_012, swing: -0.53, seats: 2, change: 0 },
    ],
  },
  "2022": {
    total: 151,
    majority: 76,
    rows: [
      { id: "alp", votePct: 32.58, voteCount: 4_776_030, swing: -0.76, seats: 77, change: 9 },
      { id: "coa", votePct: 35.7, voteCount: 5_233_334, swing: -5.73, seats: 58, change: -19 },
      { id: "grn", votePct: 12.25, voteCount: 1_795_985, swing: 1.85, seats: 4, change: 3 },
      { id: "onp", votePct: 4.96, voteCount: 727_464, swing: 1.88, seats: 0, change: 0 },
      { id: "ind", votePct: 5.29, voteCount: 776_169, swing: 1.92, seats: 10, change: 7 },
      { id: "oth", votePct: 9.21, voteCount: 1_350_060, swing: 0.16, seats: 2, change: 0 },
    ],
  },
  "2025": {
    total: 150,
    majority: 76,
    rows: [
      { id: "alp", votePct: 34.56, voteCount: 5_354_138, swing: 1.98, seats: 94, change: 17 },
      { id: "coa", votePct: 31.82, voteCount: 4_929_402, swing: -3.88, seats: 43, change: -15 },
      { id: "grn", votePct: 12.2, voteCount: 1_889_977, swing: -0.05, seats: 1, change: -3 },
      { id: "onp", votePct: 6.4, voteCount: 991_814, swing: 1.44, seats: 0, change: 0 },
      { id: "ind", votePct: 7.27, voteCount: 1_126_051, swing: 1.98, seats: 10, change: 0 },
      { id: "oth", votePct: 7.74, voteCount: 1_198_854, swing: -1.48, seats: 2, change: 0 },
    ],
  },
};

/** Left→right spectrum order for the composition bar. */
const COMPOSITION_ORDER: PartyId[] = ["grn", "alp", "ind", "oth", "coa", "onp"];

const byYear = <T>(fn: (r: ElectionResult) => T): Record<ElectionYear, T> =>
  Object.fromEntries(
    ELECTION_YEARS.map((y) => [y, fn(RESULTS[y])]),
  ) as Record<ElectionYear, T>;

export const VOTES_BY_YEAR: Record<ElectionYear, VotesParty[]> = byYear((r) =>
  r.rows.map((row) => ({
    ...FED_PARTIES[row.id],
    votePct: row.votePct,
    voteCount: row.voteCount,
    swing: row.swing,
    seatsWon: row.seats,
  })),
);

export const SEATS_BY_YEAR: Record<ElectionYear, SeatsParty[]> = byYear((r) =>
  r.rows.map((row) => ({
    ...FED_PARTIES[row.id],
    seats: row.seats,
    change: row.change,
  })),
);

export const COMPOSITION_BY_YEAR: Record<ElectionYear, CompositionParty[]> =
  byYear((r) => {
    const seatsById = Object.fromEntries(r.rows.map((row) => [row.id, row.seats]));
    return COMPOSITION_ORDER.map((id) => ({
      ...FED_PARTIES[id],
      seats: seatsById[id] ?? 0,
    }));
  });

export const CHAMBER_BY_YEAR: Record<
  ElectionYear,
  { total: number; majority: number }
> = byYear((r) => ({ total: r.total, majority: r.majority }));
