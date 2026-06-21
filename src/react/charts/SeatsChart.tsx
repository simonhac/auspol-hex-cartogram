/**
 * SeatsChart — horizontal seats-won bar chart.
 *
 * In editable mode, sum(seats) may differ from totalSeats; an
 * OverUnderIndicator at the bottom surfaces the slack.
 */

"use client";

import React, { useRef } from "react";
import PartyBar, {
  type PartyBarParty,
  type PartyBarWhisker,
} from "./PartyBar";
import OverUnderIndicator from "./OverUnderIndicator";
import {
  barCenterRightMarginCSS,
  barEdgeCSS,
  useBarDrag,
  useBarKeyboard,
} from "./chartUtils";

const fmtChange = (n: number | undefined) => {
  if (n == null) return "—";
  if (n === 0) return "0";
  const sign = n > 0 ? "+" : "−";
  return `${sign}${Math.abs(n)}`;
};

export interface SeatsParty extends PartyBarParty {
  id: string;
  seats: number;
  change?: number;
  // Animation-only: a continuous (fractional) seat value used SOLELY for the
  // bar width, so the fill can interpolate smoothly while `seats` (the label,
  // aria, Win/Loss cell, allocated sum) stays an integer. Falls back to `seats`
  // when absent — set by AnimatedSeatsChart's tween; undefined everywhere else.
  barSeats?: number;
  // Optional Monte Carlo uncertainty around `seats`, as a 5-number
  // summary in raw seat counts. When present, SeatsChart overlays a
  // box-and-whisker on the bar (and onto the empty track when the
  // range exceeds the deterministic point).
  uncertainty?: {
    p05: number;
    p25: number;
    p50: number;
    p75: number;
    p95: number;
  };
}

export interface SeatsDefault {
  id: string;
  seats: number;
}

export interface SeatsChartProps {
  parties: SeatsParty[];
  totalSeats?: number;
  toWin?: number;
  mode?: "fixed" | "editable";
  defaults?: SeatsDefault[] | null;
  showDefaults?: boolean;
  onChange?: (parties: SeatsParty[]) => void;
  onReset?: () => void;
  overUnderRange?: number;
}

export default function SeatsChart({
  parties,
  totalSeats = 88,
  toWin,
  mode = "fixed",
  defaults = null,
  showDefaults = true,
  onChange,
  onReset,
  overUnderRange,
}: SeatsChartProps) {
  const majority = toWin ?? Math.floor(totalSeats / 2) + 1;
  const allocated = parties.reduce((a, p) => a + p.seats, 0);
  const unallocated = totalSeats - allocated;
  const showOverUnder = mode === "editable" && unallocated !== 0;
  const ouRange = overUnderRange ?? Math.ceil(totalSeats / 2);

  const defaultsMap: Record<string, number> = defaults
    ? Object.fromEntries(defaults.map((d) => [d.id, d.seats]))
    : {};

  const showChange = parties.some((p) => p.change != null);
  const showUncertainty = parties.some((p) => p.uncertainty != null);

  // Auto-wire R-to-reset when caller supplies defaults + onChange but no
  // explicit handler: rewrite each party's `seats` to its default, preserve
  // everything else. Callers that want different reset semantics can still
  // pass an explicit `onReset`.
  const effectiveReset =
    onReset ??
    (onChange && defaults
      ? () =>
          onChange(
            parties.map((p) =>
              p.id in defaultsMap ? { ...p, seats: defaultsMap[p.id] } : p,
            ),
          )
      : undefined);

  const setSeats = (id: string, value: number) => {
    if (!onChange) return;
    const v = Math.max(0, Math.min(totalSeats, Math.round(value)));
    onChange(
      parties.map((p) => (p.id === id ? { ...p, seats: v } : p)),
    );
  };

  const chartClasses = [
    "seats-chart",
    showChange && "has-change",
    showUncertainty && "has-uncertainty",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={chartClasses}>
      <div className="seats-header">
        <div className="seats-header-bar">
          <div
            className="seats-towin"
            style={{ left: barEdgeCSS(majority / totalSeats) }}
          >
            <div className="seats-towin-label">{majority} to win</div>
          </div>
        </div>
        {showChange && <div className="seats-col-head">Win/Loss</div>}
        {showUncertainty && (
          <div className="seats-col-head">p05 – p50 – p95</div>
        )}
      </div>

      <div className="seats-body">
        {parties.map((p) => (
          <SeatsRow
            key={p.id}
            party={p}
            max={totalSeats}
            majority={majority}
            mode={mode}
            defaultValue={defaultsMap[p.id]}
            showDefault={showDefaults && mode === "editable"}
            showChange={showChange}
            showUncertainty={showUncertainty}
            onSet={(v) => setSeats(p.id, v)}
            onReset={effectiveReset}
          />
        ))}
      </div>

      {mode === "editable" && (
        <OverUnderIndicator
          className="seats-balance"
          style={
            {
              "--ou-bar-margin-right": barCenterRightMarginCSS(
                majority / totalSeats,
              ),
            } as React.CSSProperties
          }
          value={-unallocated}
          range={ouRange}
          visible={showOverUnder}
          format={(v) =>
            `${v > 0 ? "+" : "−"}${Math.abs(v)} seat${
              Math.abs(v) === 1 ? "" : "s"
            }`
          }
        />
      )}
    </div>
  );
}

interface SeatsRowProps {
  party: SeatsParty;
  max: number;
  majority: number;
  mode: "fixed" | "editable";
  defaultValue?: number;
  showDefault: boolean;
  showChange: boolean;
  showUncertainty: boolean;
  onSet: (value: number) => void;
  onReset?: () => void;
}

function SeatsRow({
  party,
  max,
  majority,
  mode,
  defaultValue,
  showDefault,
  showChange,
  showUncertainty,
  onSet,
  onReset,
}: SeatsRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const isEditable = mode === "editable";
  const value = party.seats;
  // Bar width tracks the continuous `barSeats` when present (smooth animation),
  // but the label/aria/change cell all read the integer `value`.
  const fraction = (party.barSeats ?? value) / max;

  const { dragging, onPointerDown } = useBarDrag({
    rowRef,
    max,
    defaultValue,
    // units: seats
    plateauWidth: 3,
    onSet,
    enabled: isEditable,
  });
  const { onKeyDown } = useBarKeyboard({
    value,
    max,
    step: 1,
    shiftStep: 5,
    onSet,
    onReset,
    enabled: isEditable,
  });

  const showDefaultMark = showDefault && defaultValue != null;
  const atDefault = defaultValue != null && defaultValue === value;

  const change = party.change;
  const changeCls =
    change == null ? "" : change > 0 ? "is-up" : change < 0 ? "is-down" : "";

  // Convert seat-count quantiles to fractions for PartyBar.
  const whisker: PartyBarWhisker | null = party.uncertainty
    ? {
        p05: party.uncertainty.p05 / max,
        p25: party.uncertainty.p25 / max,
        p50: party.uncertainty.p50 / max,
        p75: party.uncertainty.p75 / max,
        p95: party.uncertainty.p95 / max,
      }
    : null;

  return (
    <div className="seats-row-line">
      <PartyBar
        ref={rowRef}
        party={party}
        fraction={fraction}
        valueLabel={value}
        insideThresholdPx={52}
        defaultFraction={showDefaultMark ? (defaultValue ?? 0) / max : null}
        defaultTitle={
          defaultValue != null ? `Default: ${defaultValue}` : undefined
        }
        atDefault={atDefault}
        editable={isEditable}
        dragging={dragging}
        whisker={whisker}
        hideValueLabel={whisker != null}
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
        aria={{
          label: `${party.name} seats`,
          valuemin: 0,
          valuemax: max,
          valuenow: value,
          valuetext: `${value} seat${value === 1 ? "" : "s"}`,
        }}
      >
        <div
          className="seats-majority"
          style={{ left: barEdgeCSS(majority / max) }}
        />
      </PartyBar>
      {showChange && (
        <div className={`seats-num is-change ${changeCls}`}>
          {fmtChange(change)}
        </div>
      )}
      {showUncertainty && (
        <div className="seats-num is-quantile">
          {party.uncertainty ? (
            <>
              <span className="iq-left">
                <span className="is-pn">{party.uncertainty.p05}</span>
                <span className="is-sep" aria-hidden>–</span>
              </span>
              <span className="iq-mid is-pmed">{party.uncertainty.p50}</span>
              <span className="iq-right">
                <span className="is-sep" aria-hidden>–</span>
                <span className="is-pn">{party.uncertainty.p95}</span>
              </span>
            </>
          ) : (
            <span className="iq-mid">—</span>
          )}
        </div>
      )}
    </div>
  );
}
