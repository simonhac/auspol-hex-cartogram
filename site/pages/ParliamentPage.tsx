import { useState } from "react";
import { ParliamentArc, ResultsTable } from "auspoligraphs/react";
import { Demo } from "../components/Demo";
import { Toggle, type ToggleOption } from "../components/Toggle";
import {
  RESULTS_PARTIES,
  PREDICTED_PARTIES,
  PARLIAMENT_PARTIES,
  RESULTS_COLUMN,
  PREDICTED_COLUMN,
} from "../fixtures/parliament";

type Scenario = "results" | "predicted";

const SCENARIO_OPTIONS: ToggleOption<Scenario>[] = [
  { value: "results", label: "Result" },
  { value: "predicted", label: "Predicted" },
];

export function ParliamentPage() {
  const [scenario, setScenario] = useState<Scenario>("results");
  const arcParties = scenario === "results" ? RESULTS_PARTIES : PREDICTED_PARTIES;

  const tableParties = PARLIAMENT_PARTIES.map((p) => ({
    id: p.id,
    name: p.name,
    color: p.color,
    seats: p.results,
  }));

  const controls = (
    <Toggle
      label="Scenario"
      options={SCENARIO_OPTIONS}
      value={scenario}
      onChange={setScenario}
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
