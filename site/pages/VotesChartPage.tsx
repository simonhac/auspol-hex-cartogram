import { useState } from "react";
import { VotesChart } from "auspoligraphs/react";
import { Demo } from "../components/Demo";
import { Toggle } from "../components/Toggle";
import {
  VOTES_BY_YEAR,
  ELECTION_YEARS,
  type ElectionYear,
} from "../fixtures/charts";

export function VotesChartPage() {
  const [year, setYear] = useState<ElectionYear>("2025");

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
      title="Votes Chart"
      description={
        <>
          Primary-vote bar chart with vote counts, swing, and seats won. Toggle between
          elections to watch the bars and swing values animate. Hover a party badge for its
          full name. Federal House of Representatives first-preference vote.
        </>
      }
      controls={controls}
      maxWidth={680}
    >
      <VotesChart parties={VOTES_BY_YEAR[year]} mode="fixed" />
    </Demo>
  );
}
