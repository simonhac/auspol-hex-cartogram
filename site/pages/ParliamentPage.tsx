import { useMemo } from "react";
import type { Party } from "auspoligraphs";
import { ParliamentArc, ResultsTable } from "auspoligraphs/react";
import { Demo } from "../components/Demo";
import { Toggle, type ToggleOption } from "../components/Toggle";
import { GroupingsEditor } from "../components/GroupingsEditor";
import { GeometryControls } from "../components/GeometryControls";
import { useCustomConfigUrl, type Scenario } from "./parliament/useCustomConfigUrl";
import { newId, type Grouping } from "./parliament/url";
import {
  RESULTS_PARTIES,
  PREDICTED_PARTIES,
  PARLIAMENT_PARTIES,
  PRESET_PALETTE,
  RESULTS_COLUMN,
  PREDICTED_COLUMN,
} from "../fixtures/parliament";

const SCENARIO_OPTIONS: ToggleOption<Scenario>[] = [
  { value: "results", label: "Result" },
  { value: "predicted", label: "Predicted" },
  { value: "custom", label: "Custom" },
];

/** Seed the editor from the current chamber so Custom mode opens on real data. */
function makeDefaultGroupings(): Grouping[] {
  return PARLIAMENT_PARTIES.map((p) => ({
    id: newId(),
    name: p.name,
    color: p.color,
    seats: p.results,
  }));
}

export function ParliamentPage() {
  const { scenario, setScenario, groupings, setGroupings, geometry, setGeometry } =
    useCustomConfigUrl(makeDefaultGroupings);

  const customArcParties = useMemo<Party[]>(
    () =>
      groupings.map((g) => ({
        id: g.id,
        name: g.name,
        color: g.color,
        seats: Math.max(0, Math.floor(g.seats) || 0),
      })),
    [groupings],
  );

  const arcGeometryProps = useMemo(
    () => ({
      outerRadius: geometry.outerRadius,
      innerRadiusRatio: geometry.innerRadiusRatio,
      seatRadiusRatio: geometry.seatRadiusRatio,
      // "auto" → let the arc derive the row count.
      rows: geometry.rows === "auto" ? undefined : geometry.rows,
      distribution: geometry.distribution,
    }),
    [geometry],
  );

  const totalCustomSeats = customArcParties.reduce((sum, p) => sum + p.seats, 0);

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
          change. Switch to <strong>Custom</strong> to build your own chamber — add and
          reorder groupings, set seats and colours, tune the geometry, and share the
          result via the URL.
        </>
      }
      controls={controls}
      maxWidth={720}
    >
      {scenario === "custom" ? (
        <div className="parliament-panel">
          {totalCustomSeats > 0 ? (
            <ParliamentArc parties={customArcParties} {...arcGeometryProps} />
          ) : (
            <p className="pc-empty">Add seats to render the arc.</p>
          )}
          <GroupingsEditor
            groupings={groupings}
            onChange={setGroupings}
            presetColors={PRESET_PALETTE}
          />
          <GeometryControls value={geometry} onChange={setGeometry} />
        </div>
      ) : (
        <div className="parliament-panel">
          <ParliamentArc
            parties={scenario === "results" ? RESULTS_PARTIES : PREDICTED_PARTIES}
          />
          <ResultsTable
            parties={tableParties}
            columns={[RESULTS_COLUMN, PREDICTED_COLUMN]}
            changeBetween={[0, 1]}
          />
        </div>
      )}
    </Demo>
  );
}
