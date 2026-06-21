"use client";

import type { Demographic, ScenarioState } from "../../scenario/types";
import {
  DEMOGRAPHICS,
  type DemoStats,
  ONP_DEMO_MAX,
  ONP_DEMO_MIN,
  type ScenarioAction,
} from "../../scenario/scenario";
import { SwingSlider, type SwingTick } from "./SwingSlider";

const FINE_STEP = 0.1;
const SHIFT_STEP = 1.0;
const POS_MAX = 1000;
const TICK_VALUES = [0, 10, 20, 30, 40, 50] as const;

const ONP_COLOR = "#f26722";

function abbrev(d: Demographic): string {
  return d.replace(/Metropolitan/g, "Metro");
}

function valueToPos(v: number): number {
  return Math.round((v / ONP_DEMO_MAX) * POS_MAX);
}

function posToValue(pos: number): number {
  const v = (pos / POS_MAX) * ONP_DEMO_MAX;
  return Math.round(v * 10) / 10;
}

export interface DemographicSkewPanelProps {
  scenario: ScenarioState;
  resolvedOnpDemo: Record<Demographic, number>;
  statewideOnpPct: number;
  demoStats: DemoStats;
  dispatch: (a: ScenarioAction) => void;
}

export function DemographicSkewPanel({
  scenario,
  resolvedOnpDemo,
  statewideOnpPct,
  demoStats,
  dispatch,
}: DemographicSkewPanelProps) {
  const isDirty = Object.keys(scenario.onpDemographic).length > 0;

  const autoCount = DEMOGRAPHICS.reduce(
    (n, d) => n + (d in scenario.onpDemographic ? 0 : 1),
    0,
  );

  let weightedAvg = 0;
  for (const d of DEMOGRAPHICS) {
    weightedAvg += resolvedOnpDemo[d] * demoStats.weights[d];
  }
  const onTarget = Math.abs(weightedAvg - statewideOnpPct) < 0.05;

  // The statewide-ON marker (emphasised tick) sits at the slider's target.
  const statewideTick: SwingTick = {
    value: Math.max(ONP_DEMO_MIN, Math.min(ONP_DEMO_MAX, statewideOnpPct)),
    zero: true,
  };
  const baseTicks: SwingTick[] = TICK_VALUES.map((v) => ({ value: v }));

  return (
    <div className="seats-panel" style={{ marginTop: 16 }}>
      <section>
        <div className="panel-head">
          <h2>One Nation by region</h2>
          <button
            className="btn"
            onClick={() => dispatch({ type: "reset-onp-demo" })}
            aria-hidden={!isDirty}
            tabIndex={isDirty ? 0 : -1}
            style={isDirty ? undefined : { visibility: "hidden" }}
          >
            Reset
          </button>
        </div>
        <div className="panel-sub">
          {onTarget ? (
            <>
              Primary share by demographic (weighted average tracks the One
              Nation swing: <b>{statewideOnpPct.toFixed(1)}%</b>)
            </>
          ) : (
            <>
              Primary share by demographic (weighted average{" "}
              <b>{weightedAvg.toFixed(1)}%</b> can&rsquo;t reach the One Nation
              swing of {statewideOnpPct.toFixed(1)}%)
            </>
          )}
        </div>
        <div className="swing-rows">
          {DEMOGRAPHICS.map((d) => {
            const isManual = d in scenario.onpDemographic;
            const value = isManual
              ? scenario.onpDemographic[d] ?? 0
              : resolvedOnpDemo[d];
            const isLastAuto = !isManual && autoCount === 1;
            const label = abbrev(d);
            return (
              <SwingSlider
                key={d}
                color={ONP_COLOR}
                label={label}
                value={value}
                min={ONP_DEMO_MIN}
                max={ONP_DEMO_MAX}
                valueToPos={valueToPos}
                posToValue={posToValue}
                ticks={[...baseTicks, statewideTick]}
                fineStep={FINE_STEP}
                shiftStep={SHIFT_STEP}
                formatValue={(v) => `${v.toFixed(1)}%`}
                mode={isManual ? "manual" : "auto"}
                locked={isLastAuto}
                ariaLabel={`${label} One Nation primary share (percent)`}
                ariaValueText={`${value.toFixed(1)} percent`}
                onChange={(v) =>
                  dispatch({ type: "set-onp-demo", demographic: d, value: v })
                }
                onRelease={() =>
                  dispatch({ type: "release-onp-demo", demographic: d })
                }
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
