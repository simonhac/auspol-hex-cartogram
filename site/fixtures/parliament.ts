import type { Party } from "auspoligraphs";
import type { ResultsColumn } from "auspoligraphs/react";

/**
 * Parliament composition fixture, ported from the project's original
 * examples/parliament.html. Two scenarios per party — an actual `results`
 * seat count and a hypothetical `predicted` one — form the A/B pair the
 * ParliamentArc animates between, while the ResultsTable shows both columns
 * plus the change. House of Representatives = 150 seats. Illustrative data.
 */
export interface ScenarioParty {
  id: string;
  name: string;
  color: string;
  results: number;
  predicted: number;
}

export const PARLIAMENT_PARTIES: ScenarioParty[] = [
  { id: "alp", name: "Labor", color: "#DE3A30", results: 94, predicted: 76 },
  { id: "onp", name: "One Nation", color: "#F2811C", results: 0, predicted: 53 },
  { id: "coa", name: "Coalition", color: "#2E6DB4", results: 43, predicted: 12 },
  { id: "ind", name: "Independent", color: "#8C8C8C", results: 10, predicted: 8 },
  { id: "kap", name: "Katter's Australian Party", color: "#6E1A1A", results: 1, predicted: 1 },
  { id: "grn", name: "Greens", color: "#10A05F", results: 1, predicted: 0 },
  { id: "ca", name: "Centre Alliance", color: "#F2C200", results: 1, predicted: 0 },
];

const seatsFor = (key: "results" | "predicted"): Party[] =>
  PARLIAMENT_PARTIES.map((p) => ({
    id: p.id,
    name: p.name,
    color: p.color,
    seats: p[key],
  }));

/** ParliamentArc seat data for each scenario. */
export const RESULTS_PARTIES = seatsFor("results");
export const PREDICTED_PARTIES = seatsFor("predicted");

/** ResultsTable columns + change. */
export const RESULTS_COLUMN: ResultsColumn = {
  header: "Result",
  values: PARLIAMENT_PARTIES.map((p) => p.results),
};
export const PREDICTED_COLUMN: ResultsColumn = {
  header: "Predicted",
  values: PARLIAMENT_PARTIES.map((p) => p.predicted),
};

export const HOUSE_TOTAL = 150;
