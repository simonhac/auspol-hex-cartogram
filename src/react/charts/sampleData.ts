/**
 * Sample fixtures for the SeatsChart / VotesChart components.
 *
 * Lifted from the vic-public-funding design bundle (demo.jsx) — VIC
 * 2022 lower-house result, with the Nationals folded into
 * "Independents" per the design brief. Used by both the /gallery
 * showcase and the /victoria/modelling demo page so they share the
 * same canonical fixture.
 */

import type { SeatsParty } from "./SeatsChart";
import type { VotesParty } from "./VotesChart";

export type SampleParty = {
  id: string;
  code: string;
  name: string;
  color: string;
};

export const SAMPLE_PARTIES: SampleParty[] = [
  { id: "alp", code: "ALP", name: "Labor", color: "#d8232a" },
  { id: "lib", code: "LIB", name: "Liberal", color: "#1853bc" },
  { id: "grn", code: "GRN", name: "Greens", color: "#5bb01b" },
  { id: "onp", code: "ONP", name: "One Nation", color: "#ef6a1f" },
  { id: "ind", code: "IND", name: "Independents", color: "#1d9b9b" },
  { id: "oth", code: "OTH", name: "Other", color: "#8a8278" },
];

export const SAMPLE_SEATS: Record<string, number> = {
  alp: 56,
  lib: 19,
  grn: 4,
  onp: 0,
  ind: 9,
  oth: 0,
};
export const SAMPLE_TOTAL_SEATS = 88;
export const SAMPLE_MAJORITY = 45;

export const SAMPLE_VOTES: Record<
  string,
  { votePct: number; voteCount: number; swing: number; seatsWon: number }
> = {
  alp: { votePct: 36.6, voteCount: 1_339_496, swing: -6.2, seatsWon: 56 },
  lib: { votePct: 29.8, voteCount: 1_087_413, swing: -0.6, seatsWon: 19 },
  grn: { votePct: 11.5, voteCount: 420_201, swing: 0.8, seatsWon: 4 },
  onp: { votePct: 1.0, voteCount: 37_054, swing: 0.3, seatsWon: 0 },
  ind: { votePct: 4.7, voteCount: 172_687, swing: -0.1, seatsWon: 9 },
  oth: { votePct: 16.4, voteCount: 601_354, swing: 5.8, seatsWon: 0 },
};

export const sampleSeatsParties = (): SeatsParty[] =>
  SAMPLE_PARTIES.map((p) => ({ ...p, seats: SAMPLE_SEATS[p.id] ?? 0 }));

export const sampleVotesParties = (): VotesParty[] =>
  SAMPLE_PARTIES.map((p) => ({ ...p, ...SAMPLE_VOTES[p.id] }));
