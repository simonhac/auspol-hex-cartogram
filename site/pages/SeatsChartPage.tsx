import { SeatsChart } from "auspoligraphs/react";
import { Demo } from "../components/Demo";
import { Toggle } from "../components/Toggle";
import { useTwoState } from "../components/useTwoState";
import { SEATS_2018, SEATS_2022, TOTAL_SEATS, MAJORITY } from "../fixtures/charts";

export function SeatsChartPage() {
  const { value: parties, which, setWhich } = useTwoState(SEATS_2018, SEATS_2022, "b");

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
      title="Seats Chart"
      description={
        <>
          Seats-won bar chart with a majority line and a win/loss column. Toggle between
          elections to watch the bars grow and shrink across the {MAJORITY}-to-win line.
          Data is illustrative.
        </>
      }
      controls={controls}
      maxWidth={680}
    >
      <SeatsChart
        parties={parties}
        totalSeats={TOTAL_SEATS}
        toWin={MAJORITY}
        mode="fixed"
      />
    </Demo>
  );
}
