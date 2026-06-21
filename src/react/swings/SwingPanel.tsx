"use client";

import type {
  Party,
  PartyId,
  PreferenceFlows,
  ScenarioState,
} from "../../scenario/types";
import { autoSwingDisplay, type ScenarioAction } from "../../scenario/scenario";
import { SwingSlider, type SwingTick } from "./SwingSlider";
import { FlowMatrixEditor } from "./FlowMatrixEditor";

const SWING_MIN = -30;
const SWING_MAX = 30;
const SWING_FINE_STEP = 0.1;
const SWING_SHIFT_STEP = 1.0;

// Slider position is an integer in [-POS_MAX, POS_MAX]; swing in pp is mapped
// via a quadratic curve so most of the track sits near zero. Inverse is a
// square root.
const POS_MAX = 1000;

function posToSwing(pos: number): number {
  const t = pos / POS_MAX;
  const s = Math.sign(t) * t * t * SWING_MAX;
  return Math.round(s * 10) / 10;
}

function swingToPos(swing: number): number {
  const sgn = Math.sign(swing);
  const p = sgn * Math.sqrt(Math.abs(swing) / SWING_MAX);
  return Math.round(p * POS_MAX);
}

// Tick marks at every 5pp; the central zero tick gets the emphasised style.
const TICK_VALUES = [-25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25] as const;
const SWING_TICKS: SwingTick[] = TICK_VALUES.map((v) => ({
  value: v,
  zero: v === 0,
}));

export interface SwingPanelProps {
  scenario: ScenarioState;
  dispatch: (a: ScenarioAction) => void;
  parties: Record<PartyId, Party>;
  partyOrder: PartyId[];
  aggregatedPrimaries: Record<PartyId, number>;
  flows: PreferenceFlows;
  // Sliders to render greyed out — the swing still persists in scenario
  // state but has no effect on the current chamber's count.
  inertParties?: Set<PartyId>;
  inertReason?: string;
  hidePreferenceMatrix?: boolean;
}

export function SwingPanel({
  scenario,
  dispatch,
  parties,
  partyOrder,
  aggregatedPrimaries,
  flows,
  inertParties,
  inertReason,
  hidePreferenceMatrix = false,
}: SwingPanelProps) {
  const isDirty =
    Object.keys(scenario.manualSwings).length > 0 ||
    Object.keys(scenario.flowOverrides).length > 0;

  // Per-party absorbed pp shown on automatic sliders.
  const autoDisplay = autoSwingDisplay(
    aggregatedPrimaries,
    scenario.manualSwings,
  );

  // Count of auto sliders in the rendered set — used to lock the last
  // auto so there's always somewhere for redistribution to land.
  const autoCount = partyOrder.reduce(
    (n, p) => n + (p in scenario.manualSwings ? 0 : 1),
    0,
  );

  return (
    <div className="seats-panel">
      <section>
        <div className="panel-head">
          <h2>Swings</h2>
          {/* Always render so the row reserves space; hide visually + from a11y
              when nothing is dirty so the panel doesn't shift on first edit. */}
          <button
            className="btn"
            onClick={() => dispatch({ type: "reset-all" })}
            aria-hidden={!isDirty}
            tabIndex={isDirty ? 0 : -1}
            style={isDirty ? undefined : { visibility: "hidden" }}
          >
            Reset
          </button>
        </div>
        <div className="panel-sub">Primary swing (percentage points)</div>
        <div className="swing-rows">
          {partyOrder.map((p) => {
            const isManual = p in scenario.manualSwings;
            const displayValue = isManual
              ? scenario.manualSwings[p]
              : autoDisplay[p] ?? 0;
            // The last remaining auto slider can't be pinned — otherwise
            // there's no absorber and dialled swings stop landing exactly.
            const isLastAuto = !isManual && autoCount === 1;
            const inert = inertParties?.has(p) ?? false;
            const party = parties[p];
            const label = party?.label ?? p;
            return (
              <SwingSlider
                key={p}
                color={party?.colour ?? "#777"}
                label={label}
                value={displayValue}
                min={SWING_MIN}
                max={SWING_MAX}
                valueToPos={swingToPos}
                posToValue={posToSwing}
                ticks={SWING_TICKS}
                fineStep={SWING_FINE_STEP}
                shiftStep={SWING_SHIFT_STEP}
                formatValue={(v) => `${v > 0 ? "+" : ""}${v.toFixed(1)}`}
                mode={isManual ? "manual" : "auto"}
                locked={isLastAuto}
                inert={inert}
                inertReason={inert ? inertReason : undefined}
                ariaLabel={`${label} primary swing (percentage points)`}
                ariaValueText={`${displayValue > 0 ? "+" : ""}${displayValue.toFixed(1)} percentage points`}
                onChange={(v) =>
                  dispatch({ type: "set-swing", party: p, value: v })
                }
                onRelease={() => dispatch({ type: "release-swing", party: p })}
              />
            );
          })}
        </div>
      </section>

      {!hidePreferenceMatrix && (
        <section>
          <div className="panel-head">
            <h2>Preference flows</h2>
          </div>
          <FlowMatrixEditor
            flows={flows}
            scenario={scenario}
            dispatch={dispatch}
            parties={parties}
            partyOrder={partyOrder}
          />
        </section>
      )}
    </div>
  );
}
