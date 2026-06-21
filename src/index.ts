/**
 * Australian Federal Electorate Hex Cartogram
 *
 * Equal-area hex maps for Australian federal House of Representatives electorates.
 * No framework dependencies — just data and pure utility functions.
 *
 * Usage:
 *   import { FED_2025, cellToPixel, computeStateBorders } from "auspoligraphs";
 *   const { electorates } = FED_2025;
 */

// Types
export type { GridEntry, Electorate, ElectionMap } from "./types";
export type { Party, ArcSeat, ArcLayout, ArcLayoutOptions } from "./types";

// Utilities
export {
  HEX_SIZE,
  nameToSeatId,
  cellToPixel,
  resolveGrid,
  hexPoints,
  computeStateBorders,
  STATE_HEX_COLORS,
} from "./grid-utils";

// Parliament arc (seat-dot) chart
export {
  computeArcLayout,
  ARC_OUTER_RADIUS,
  ARC_INNER_RATIO,
  ARC_SEAT_RATIO,
  ARC_DISTRIBUTION,
} from "./arc-utils";

// Election datasets (all loaded from elections.json)
export { FED_2019, FED_2022, FED_2025 } from "./elections";

// --- Scenario engine (swings, demographic resolution, reducer) ---
// Framework-agnostic; ported from the wallofadvantage / open-tally-room engine.
export {
  DEMOGRAPHICS,
  ONP_DEMO_MIN,
  ONP_DEMO_MAX,
  emptyScenario,
  applySwing,
  autoSwingDisplay,
  computeDemoStats,
  resolveOnpDemographic,
  applySwingForSeat,
  mergeFlowOverrides,
  scenarioReducer,
} from "./scenario/scenario";
export type { DemoStats, ScenarioAction } from "./scenario/scenario";
export { bucketParty, aggregateLaPrimaries } from "./scenario/aggregate";
export type { AggregateOptions } from "./scenario/aggregate";
export type {
  PartyId,
  PartyKind,
  // Aliased to avoid colliding with the arc `Party` exported above.
  Party as ScenarioParty,
  FlowRow,
  PreferenceFlows,
  TwoCp,
  Demographic,
  SeatBaseline,
  ScenarioState,
} from "./scenario/types";
