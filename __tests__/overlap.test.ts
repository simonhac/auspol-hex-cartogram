import { describe, it, expect } from "vitest";
import { FED_2019, FED_2022, FED_2025, HEX_SIZE } from "../src";

const ELECTIONS = [
  { name: "2019", data: FED_2019, seats: 151 },
  { name: "2022", data: FED_2022, seats: 151 },
  { name: "2025", data: FED_2025, seats: 150 },
];

for (const { name, data, seats } of ELECTIONS) {
  describe(`FED_${name}`, () => {
    it(`should have exactly ${seats} electorates`, () => {
      expect(data.electorates).toHaveLength(seats);
    });

    it("should have no duplicate grid positions", () => {
      const seen = new Map<string, string>();
      const dupes: string[] = [];
      for (const e of data.electorates) {
        const key = `${e.col},${e.row}`;
        if (seen.has(key)) {
          dupes.push(`${e.name} duplicates ${seen.get(key)} at [${e.col},${e.row}]`);
        }
        seen.set(key, e.name);
      }
      expect(dupes).toEqual([]);
    });

    it("should produce no overlapping hexagons", () => {
      const minDist = Math.sqrt(3) * HEX_SIZE * 0.99;
      const overlaps: string[] = [];
      for (let i = 0; i < data.electorates.length; i++) {
        for (let j = i + 1; j < data.electorates.length; j++) {
          const a = data.electorates[i];
          const b = data.electorates[j];
          const dx = a.px - b.px;
          const dy = a.py - b.py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDist) {
            overlaps.push(`${a.name} overlaps ${b.name}`);
          }
        }
      }
      expect(overlaps).toEqual([]);
    });

    it("should have correct state seat counts", () => {
      const counts: Record<string, number> = {};
      for (const e of data.electorates) {
        counts[e.state] = (counts[e.state] || 0) + 1;
      }
      // Every state should have at least 1 seat
      expect(Object.keys(counts).length).toBe(8);
    });
  });
}
