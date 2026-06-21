import { ChamberCharts } from "auspoligraphs/react";
import { Demo } from "../components/Demo";
import { Toggle } from "../components/Toggle";
import { useTwoState } from "../components/useTwoState";
import {
  VOTES_2018,
  VOTES_2022,
  SEATS_2018,
  SEATS_2022,
  TOTAL_SEATS,
  MAJORITY,
} from "../fixtures/charts";

const STATE_A = { votes: VOTES_2018, seats: SEATS_2018 };
const STATE_B = { votes: VOTES_2022, seats: SEATS_2022 };

export function ChamberChartsPage() {
  const { value, which, setWhich } = useTwoState(STATE_A, STATE_B, "b");

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
      title="Chamber Charts"
      description={
        <>
          A votes chart and seats chart paired for a single chamber. Toggle between
          elections to animate both at once — the decoupled, props-driven version of the
          original chamber view. Data is illustrative.
        </>
      }
      controls={controls}
      maxWidth={680}
    >
      <ChamberCharts
        votesParties={value.votes}
        seatsParties={value.seats}
        totalSeats={TOTAL_SEATS}
        toWin={MAJORITY}
        votesTitle="Primary vote"
        seatsTitle="Seats won"
      />
    </Demo>
  );
}
