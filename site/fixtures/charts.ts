import {
  SAMPLE_PARTIES,
  type VotesParty,
  type SeatsParty,
} from "auspoligraphs/react";

/**
 * Two election snapshots (2018 → 2022) used as the A/B pair for the chart
 * demos. Party identity/colour comes from the library's SAMPLE_PARTIES; the
 * per-snapshot numbers are illustrative (a VIC-2022-style lower house) and
 * exist only to show the components animating between two states.
 */
const META = Object.fromEntries(SAMPLE_PARTIES.map((p) => [p.id, p]));
const m = (id: string) => META[id];

type VoteRow = {
  id: string;
  votePct: number;
  voteCount: number;
  swing: number;
  seatsWon: number;
};

const votesFrom = (rows: VoteRow[]): VotesParty[] =>
  rows.map((r) => ({ ...m(r.id), votePct: r.votePct, voteCount: r.voteCount, swing: r.swing, seatsWon: r.seatsWon }));

const seatsFrom = (rows: { id: string; seats: number; change: number }[]): SeatsParty[] =>
  rows.map((r) => ({ ...m(r.id), seats: r.seats, change: r.change }));

export const TOTAL_SEATS = 88;
export const MAJORITY = 45;

// --- Primary vote ---
export const VOTES_2018 = votesFrom([
  { id: "alp", votePct: 42.9, voteCount: 1_506_000, swing: 4.8, seatsWon: 55 },
  { id: "lib", votePct: 35.2, voteCount: 1_236_000, swing: -7.0, seatsWon: 27 },
  { id: "grn", votePct: 10.7, voteCount: 376_000, swing: -1.0, seatsWon: 1 },
  { id: "onp", votePct: 0.7, voteCount: 24_600, swing: 0.7, seatsWon: 0 },
  { id: "ind", votePct: 3.1, voteCount: 109_000, swing: 0.5, seatsWon: 5 },
  { id: "oth", votePct: 7.4, voteCount: 260_000, swing: 2.0, seatsWon: 0 },
]);

export const VOTES_2022 = votesFrom([
  { id: "alp", votePct: 36.6, voteCount: 1_339_496, swing: -6.3, seatsWon: 56 },
  { id: "lib", votePct: 29.8, voteCount: 1_087_413, swing: -5.4, seatsWon: 19 },
  { id: "grn", votePct: 11.5, voteCount: 420_201, swing: 0.8, seatsWon: 4 },
  { id: "onp", votePct: 1.0, voteCount: 37_054, swing: 0.3, seatsWon: 0 },
  { id: "ind", votePct: 4.7, voteCount: 172_687, swing: 1.6, seatsWon: 9 },
  { id: "oth", votePct: 16.4, voteCount: 601_354, swing: 9.0, seatsWon: 0 },
]);

// --- Seats won (change vs the previous election) ---
export const SEATS_2018 = seatsFrom([
  { id: "alp", seats: 55, change: 8 },
  { id: "lib", seats: 27, change: -10 },
  { id: "grn", seats: 1, change: 0 },
  { id: "onp", seats: 0, change: 0 },
  { id: "ind", seats: 5, change: 2 },
  { id: "oth", seats: 0, change: 0 },
]);

export const SEATS_2022 = seatsFrom([
  { id: "alp", seats: 56, change: 1 },
  { id: "lib", seats: 19, change: -8 },
  { id: "grn", seats: 4, change: 3 },
  { id: "onp", seats: 0, change: 0 },
  { id: "ind", seats: 9, change: 4 },
  { id: "oth", seats: 0, change: 0 },
]);
