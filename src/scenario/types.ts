// Types for the seat-conversion / swing model. Ported from the
// open-tally-room engine (`@tally`), trimmed to the slice the swing +
// demographic panels need (the LC/STV/IRV/funding types are omitted).

export type PartyId = string; // e.g. "alp", "lib", "nat", "grn", "oth", "ind_<seat>"

export type PartyKind = "major" | "minor" | "indie" | "bucket";

export interface Party {
  label: string;
  colour: string;
  kind: PartyKind;
}

export interface FlowRow {
  source: string;
  assumption: string;
  measured?: boolean; // per-seat overrides set this; statewide rows omit it
  flows: Record<PartyId, number>; // sums to ~1
}

export interface PreferenceFlows {
  matrix: Record<PartyId, FlowRow>;
}

export interface TwoCp {
  winner: PartyId;
  loser: PartyId;
  winnerPct: number; // e.g. 51.6
}

export type Demographic =
  | "Inner Metropolitan"
  | "Outer Metropolitan"
  | "Provincial"
  | "Rural";

export interface SeatBaseline {
  id: string;
  name: string;
  region?: string;
  demographic?: Demographic;
  formal: number;
  primaries: Record<PartyId, number>; // votes, not percentages
  twoCp?: TwoCp;
  placeholder?: boolean;
  calibration?: string;
  // Per-seat preference flow overrides. Each entry replaces the
  // statewide matrix row for that source party when IRV runs in this
  // seat. (Unused by the panels, kept for shape compatibility.)
  preferenceOverrides?: Partial<Record<PartyId, FlowRow>>;
}

// --------------- Scenario state ---------------

export interface ScenarioState {
  // Per-party primary swing in percentage points (e.g. +2.5). Only parties
  // the user has pinned ("manual") appear here. Parties absent from the map
  // are "automatic": they absorb the redistribution required to keep totals
  // conserved, with the absorption split across them in proportion to their
  // existing share.
  manualSwings: Record<PartyId, number>;
  // Sparse overrides on the flow matrix. Shape:
  //   { srcPartyId: { destPartyId: fraction } }
  // Any present row replaces the entire baseline row.
  flowOverrides: Record<PartyId, Record<PartyId, number>>;
  // One Nation primary share (percent, 0..50) per demographic. Only the
  // demographics the user has pinned appear here; automatic demographics
  // are sized to keep the formal-vote-weighted average equal to the
  // statewide ON share implied by `manualSwings.onp`.
  onpDemographic: Partial<Record<Demographic, number>>;
}
