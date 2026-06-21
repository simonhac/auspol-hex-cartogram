import { VotesChart } from "auspoligraphs/react";
import { Demo } from "../components/Demo";
import { Toggle } from "../components/Toggle";
import { useTwoState } from "../components/useTwoState";
import { VOTES_2018, VOTES_2022 } from "../fixtures/charts";

export function VotesChartPage() {
  const { value: parties, which, setWhich } = useTwoState(VOTES_2018, VOTES_2022, "b");

  const controls = (
    <Toggle
      label="Election"
      labelA="2018"
      labelB="2022"
      which={which}
      onChange={setWhich}
    />
  );

  return (
    <Demo
      title="Votes Chart"
      description={
        <>
          Primary-vote bar chart with vote counts, swing, and seats won. Toggle between
          elections to watch the bars and swing values animate. Hover a party badge for its
          full name. Data is illustrative.
        </>
      }
      controls={controls}
      maxWidth={680}
    >
      <VotesChart parties={parties} mode="fixed" />
    </Demo>
  );
}
