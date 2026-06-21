import { useState } from "react";
import { SeatsChart } from "auspoligraphs/react";
import { Demo } from "../components/Demo";
import { Toggle } from "../components/Toggle";
import {
  SEATS_BY_YEAR,
  CHAMBER_BY_YEAR,
  ELECTION_YEARS,
  type ElectionYear,
} from "../fixtures/charts";

export function SeatsChartPage() {
  const [year, setYear] = useState<ElectionYear>("2025");
  const { total, majority } = CHAMBER_BY_YEAR[year];

  const controls = (
    <Toggle
      label="Election"
      options={ELECTION_YEARS.map((y) => ({ value: y, label: y }))}
      value={year}
      onChange={setYear}
    />
  );

  return (
    <Demo
      title="Seats Chart"
      description={
        <>
          Seats-won bar chart with a majority line and a win/loss column. Toggle between
          elections to watch the bars grow and shrink across the {majority}-to-win line.
          Federal House of Representatives seats.
        </>
      }
      controls={controls}
      maxWidth={680}
    >
      <SeatsChart
        parties={SEATS_BY_YEAR[year]}
        totalSeats={total}
        toWin={majority}
        mode="fixed"
      />
    </Demo>
  );
}
