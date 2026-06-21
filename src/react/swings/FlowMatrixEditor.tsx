"use client";

import type {
  Party,
  PartyId,
  PreferenceFlows,
  ScenarioState,
} from "../../scenario/types";
import type { ScenarioAction } from "../../scenario/scenario";

export interface FlowMatrixEditorProps {
  flows: PreferenceFlows;
  scenario: ScenarioState;
  dispatch: (a: ScenarioAction) => void;
  parties: Record<PartyId, Party>;
  partyOrder: PartyId[];
}

export function FlowMatrixEditor({
  flows,
  scenario,
  dispatch,
  parties,
  partyOrder,
}: FlowMatrixEditorProps) {
  // One shared party axis for both rows and columns — keeps the diagonal
  // aligned. Start with partyOrder (slider order); append any extra ids that
  // appear only as flow sources or destinations, preserving discovery order.
  const axisSet = new Set<PartyId>(partyOrder);
  for (const src of Object.keys(flows.matrix)) axisSet.add(src);
  for (const row of Object.values(flows.matrix)) {
    for (const d of Object.keys(row.flows)) axisSet.add(d);
  }
  const axis = Array.from(axisSet);
  const sources = axis.filter((p) => flows.matrix[p] !== undefined);
  const destinations = axis;

  const shortLabel = (p: PartyId): string => {
    const lbl = parties[p]?.label ?? p;
    // Tighten common labels for column headers
    if (lbl.startsWith("Indep.")) {
      const m = /\(([^)]+)\)/.exec(lbl);
      return m ? `IND ${m[1].slice(0, 3).toUpperCase()}` : "IND";
    }
    if (lbl.startsWith("S. Sheed")) return "SHEED";
    return lbl.slice(0, 3).toUpperCase();
  };

  return (
    <div className="flow-matrix">
      <p className="flow-help">
        Each row redistributes the excluded party&apos;s votes across
        destinations. Values are percentages; rows should sum to ~100.
      </p>
      <div className="flow-matrix-scroll">
        <table className="flow-matrix-table">
          <thead>
            <tr>
              <th className="flow-corner">
                <span className="flow-corner-from">from ↓</span>
                <span className="flow-corner-to">to →</span>
              </th>
              {destinations.map((d) => (
                <th
                  key={d}
                  className="flow-col-head"
                  title={parties[d]?.label ?? d}
                >
                  <span
                    className="swing-chip"
                    style={{ background: parties[d]?.colour ?? "#777" }}
                  />
                  <span className="flow-col-label">{shortLabel(d)}</span>
                </th>
              ))}
              <th className="flow-sum-head">Σ</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((src) => {
              const baseRow = flows.matrix[src];
              const overrideRow = scenario.flowOverrides[src];
              const effective = overrideRow ?? baseRow.flows;
              const dirty = !!overrideRow;
              const rowSum = destinations
                .filter((d) => d !== src)
                .reduce((a, d) => a + (effective[d] ?? 0), 0);
              const rowSumPct = rowSum * 100;
              const sumClass =
                Math.abs(rowSumPct - 100) < 2
                  ? "ok"
                  : Math.abs(rowSumPct - 100) < 10
                    ? "warn"
                    : "bad";
              return (
                <tr key={src} className={dirty ? "dirty" : ""}>
                  <th
                    className="flow-row-head-cell"
                    title={`${parties[src]?.label ?? src} — ${baseRow.source}`}
                  >
                    <span
                      className="swing-chip"
                      style={{ background: parties[src]?.colour ?? "#777" }}
                    />
                    <span className="flow-row-label">
                      {parties[src]?.label ?? src}
                    </span>
                  </th>
                  {destinations.map((dest) => {
                    if (dest === src) {
                      return (
                        <td key={dest} className="flow-cell diag" aria-hidden>
                          —
                        </td>
                      );
                    }
                    const v = effective[dest] ?? 0;
                    const vPct = Math.round(v * 100);
                    return (
                      <td key={dest} className="flow-cell">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={1}
                          value={vPct}
                          onChange={(e) =>
                            dispatch({
                              type: "set-flow",
                              src,
                              dest,
                              value: Number(e.target.value) / 100,
                            })
                          }
                        />
                      </td>
                    );
                  })}
                  <td
                    className={`flow-sum mono ${sumClass}`}
                    title={`row sum ${rowSumPct.toFixed(1)}%`}
                  >
                    <span className="flow-sum-num">{Math.round(rowSumPct)}</span>
                    {dirty ? (
                      <button
                        className="link-btn flow-reset-btn"
                        onClick={() => dispatch({ type: "reset-flow-row", src })}
                        title="Reset this row to baseline"
                        aria-label="Reset this row to baseline"
                      >
                        ↺
                      </button>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
