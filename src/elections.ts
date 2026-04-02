/**
 * All federal election hex map datasets, loaded from a single JSON file.
 */

import type { ElectionMap } from "./types";
import { resolveGrid } from "./grid-utils";
import data from "../data/elections.json";

type RawJSON = Record<string, { label: string; seatCount: number; grid: (number | string)[][] }>;

function load(electionId: string): ElectionMap {
  const entry = (data as RawJSON)[electionId];
  if (!entry) throw new Error(`Unknown election: ${electionId}`);
  return {
    electionId,
    label: entry.label,
    seatCount: entry.seatCount,
    grid: entry.grid as [number, number, string, string][],
    electorates: resolveGrid(entry.grid as [number, number, string, string][]),
  };
}

export const FED_2019 = load("2019-FED");
export const FED_2022 = load("2022-FED");
export const FED_2025 = load("2025-FED");
