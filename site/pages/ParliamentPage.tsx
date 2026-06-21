import { ParliamentArc, ResultsTable } from "auspoligraphs/react";
import { Demo } from "../components/Demo";
import { Toggle } from "../components/Toggle";
import { useTwoState } from "../components/useTwoState";
import {
  RESULTS_PARTIES,
  PREDICTED_PARTIES,
  PARLIAMENT_PARTIES,
  RESULTS_COLUMN,
  PREDICTED_COLUMN,
} from "../fixtures/parliament";

export function ParliamentPage() {
  const { value: arcParties, which, setWhich } = useTwoState(
    RESULTS_PARTIES,
    PREDICTED_PARTIES,
  );

  const tableParties = PARLIAMENT_PARTIES.map((p) => ({
    id: p.id,
    name: p.name,
    color: p.color,
    seats: p.results,
  }));

  const controls = (
    <Toggle
      label="Scenario"
      labelA="Result"
      labelB="Predicted"
      which={which}
      onChange={setWhich}
    />
  );

  return (
    <Demo
      title="Parliament Arc + Results Table"
      description={
        <>
          A seat-dot arc and its results table — two closely-related views of the same
          150-seat chamber. Toggle the scenario to animate the arc between the actual
          result and a hypothetical projection; the table lists both columns with the
          change.
        </>
      }
      controls={controls}
      maxWidth={720}
    >
      <div className="parliament-panel">
        <ParliamentArc parties={arcParties} />
        <ResultsTable
          parties={tableParties}
          columns={[RESULTS_COLUMN, PREDICTED_COLUMN]}
          changeBetween={[0, 1]}
        />
      </div>
    </Demo>
  );
}
