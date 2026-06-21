/**
 * VotesChart — primary-vote chart. Shares the bar visual with
 * SeatsChart (via the PartyBar primitive) and adds a right-side
 * readout: vote count, swing, seats won.
 *
 * In editable mode the sum of votePct may differ from 100; an
 * OverUnderIndicator at the bottom surfaces the slack.
 */

"use client";

import React, { useRef } from "react";
import PartyBar, { type PartyBarParty } from "./PartyBar";
import OverUnderIndicator from "./OverUnderIndicator";
import { useBarDrag, useBarKeyboard } from "./chartUtils";

export interface VotesParty extends PartyBarParty {
  id: string;
  voteCount?: number;
  votePct: number; // 0..100
  swing?: number;
  seatsWon?: number;
}

export interface VotesDefault {
  id: string;
  votePct: number;
}

export interface VotesChartProps {
  parties: VotesParty[];
  mode?: "fixed" | "editable";
  defaults?: VotesDefault[] | null;
  showDefaults?: boolean;
  onChange?: (parties: VotesParty[]) => void;
  onReset?: () => void;
  totalVotes?: number;
  overUnderRange?: number;
  // When defined, the swing column is ALWAYS reserved (so the chart keeps a
  // constant size) and its content is faded in/out by this flag — instead of the
  // column appearing/disappearing with the data. Undefined = legacy behaviour
  // (column shown iff a party carries a swing).
  swingVisible?: boolean;
}

const fmtCount = (n: number | undefined) =>
  n == null ? "—" : Math.round(n).toLocaleString("en-AU");

const fmtSwing = (n: number | undefined) => {
  if (n == null) return "—";
  if (Math.abs(n) < 0.05) return "0.0%";
  const sign = n > 0 ? "+" : "−";
  return `${sign}${Math.abs(n).toFixed(1)}%`;
};

export default function VotesChart({
  parties,
  mode = "fixed",
  defaults = null,
  showDefaults = true,
  onChange,
  onReset,
  totalVotes,
  overUnderRange,
  swingVisible,
}: VotesChartProps) {
  const allocated = parties.reduce((a, p) => a + (p.votePct || 0), 0);
  const unallocated = +(100 - allocated).toFixed(2);
  const showOverUnder = mode === "editable" && Math.abs(unallocated) > 0.05;
  const ouRange = overUnderRange ?? 50;

  const defaultsMap: Record<string, number> = defaults
    ? Object.fromEntries(defaults.map((d) => [d.id, d.votePct]))
    : {};

  const showSeats = parties.some((p) => p.seatsWon != null);
  const showCount = parties.some((p) => p.voteCount != null);
  // Swing is also derived from defaults in editable mode, so the column
  // should appear whenever party.swing is present OR defaults are wired up
  // and we're editable.
  const autoShowSwing =
    parties.some((p) => p.swing != null) ||
    (mode === "editable" && defaults != null);
  // When swingVisible is set, always reserve the column so the chart holds one
  // size; the content fades rather than the column appearing/disappearing.
  const showSwing = swingVisible !== undefined ? true : autoShowSwing;
  const swingHidden = swingVisible === false;

  const baselineTotal = totalVotes ?? 0;

  // Auto-wire R-to-reset when caller supplies defaults + onChange but no
  // explicit handler: restore each party's votePct (and recompute voteCount
  // from totalVotes, matching the live-edit path). Callers that want
  // different reset semantics can still pass an explicit `onReset`.
  const effectiveReset =
    onReset ??
    (onChange && defaults
      ? () =>
          onChange(
            parties.map((p) => {
              if (!(p.id in defaultsMap)) return p;
              const next: VotesParty = { ...p, votePct: defaultsMap[p.id] };
              if (baselineTotal) {
                next.voteCount = (defaultsMap[p.id] / 100) * baselineTotal;
              }
              return next;
            }),
          )
      : undefined);

  const setVotePct = (id: string, value: number) => {
    if (!onChange) return;
    const clamped = Math.max(0, Math.min(100, +value.toFixed(2)));
    onChange(
      parties.map((p) => {
        if (p.id !== id) return p;
        const next: VotesParty = { ...p, votePct: clamped };
        if (baselineTotal) {
          next.voteCount = (clamped / 100) * baselineTotal;
        }
        return next;
      }),
    );
  };

  const gridCols = [
    "minmax(var(--votes-bar-min-w), 1fr)",
    showCount && "var(--votes-num-w)",
    showSwing && "var(--votes-swing-w)",
    showSeats && "var(--votes-seats-w)",
  ]
    .filter(Boolean)
    .join(" ");

  const rightMargin = [
    showCount && "var(--votes-num-w)",
    showSwing && "var(--votes-swing-w)",
    showSeats && "var(--votes-seats-w)",
  ]
    .filter(Boolean)
    .join(" + ");

  return (
    <div
      className="votes-chart"
      style={
        {
          "--votes-grid-cols": gridCols,
          "--votes-right-margin": rightMargin
            ? `calc(${rightMargin} + 66px)`
            : "66px",
        } as React.CSSProperties
      }
    >
      <div className="votes-grid">
        <div className="votes-header">
          <div />
          {showCount && <div className="votes-col-head">Vote count</div>}
          {showSwing && (
            <div
              className="votes-col-head"
              style={{ opacity: swingHidden ? 0 : 1, transition: "opacity 500ms ease" }}
            >
              Swing
            </div>
          )}
          {showSeats && <div className="votes-col-head">Seats Won</div>}
        </div>

        {parties.map((p) => (
          <VotesRow
            key={p.id}
            party={p}
            max={100}
            mode={mode}
            defaultValue={defaultsMap[p.id]}
            showDefault={showDefaults && mode === "editable"}
            showCount={showCount}
            showSwing={showSwing}
            swingHidden={swingHidden}
            showSeats={showSeats}
            onSet={(v) => setVotePct(p.id, v)}
            onReset={effectiveReset}
          />
        ))}
      </div>

      {mode === "editable" && (
        <OverUnderIndicator
          className="votes-balance"
          value={-unallocated}
          range={ouRange}
          visible={showOverUnder}
          format={(v) => `${v > 0 ? "+" : "−"}${Math.abs(v).toFixed(1)}%`}
        />
      )}
    </div>
  );
}

interface VotesRowProps {
  party: VotesParty;
  max: number;
  mode: "fixed" | "editable";
  defaultValue?: number;
  showDefault: boolean;
  showCount: boolean;
  showSwing: boolean;
  swingHidden?: boolean;
  showSeats: boolean;
  onSet: (value: number) => void;
  onReset?: () => void;
}

function VotesRow({
  party,
  max,
  mode,
  defaultValue,
  showDefault,
  showCount,
  showSwing,
  swingHidden,
  showSeats,
  onSet,
  onReset,
}: VotesRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const isEditable = mode === "editable";
  const value = party.votePct || 0;
  const fraction = value / max;

  const { dragging, onPointerDown } = useBarDrag({
    rowRef,
    max,
    defaultValue,
    // units: percentage points
    plateauWidth: 4,
    onSet,
    enabled: isEditable,
  });
  const { onKeyDown } = useBarKeyboard({
    value,
    max,
    step: 0.1,
    shiftStep: 1,
    onSet,
    onReset,
    enabled: isEditable,
  });

  const showDefaultMark = showDefault && defaultValue != null;
  const atDefault =
    defaultValue != null && Math.abs(defaultValue - value) <= 0.001;

  // In editable mode, treat swing as the deviation from default if a
  // default is known; falls back to the static swing field otherwise.
  const swing =
    isEditable && defaultValue != null ? value - defaultValue : party.swing;
  const swingCls =
    swing == null ? "" : swing > 0 ? "is-up" : swing < 0 ? "is-down" : "";

  return (
    <div className="votes-row-line">
      <PartyBar
        ref={rowRef}
        party={party}
        fraction={fraction}
        valueLabel={`${value.toFixed(1)}%`}
        insideThresholdPx={88}
        defaultFraction={showDefaultMark ? (defaultValue ?? 0) / max : null}
        defaultTitle={
          defaultValue != null
            ? `Default: ${defaultValue.toFixed(1)}%`
            : undefined
        }
        atDefault={atDefault}
        editable={isEditable}
        dragging={dragging}
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
        aria={{
          label: `${party.name} vote share`,
          valuemin: 0,
          valuemax: max,
          valuenow: value,
          valuetext: `${value.toFixed(1)} percent`,
        }}
      />

      {showCount && (
        <div className="votes-num">{fmtCount(party.voteCount)}</div>
      )}
      {showSwing && (
        <div
          className={`votes-num is-swing ${swingCls}`}
          style={{ opacity: swingHidden ? 0 : 1, transition: "opacity 500ms ease" }}
        >
          {fmtSwing(swing)}
        </div>
      )}
      {showSeats && (
        <div className="votes-num is-seats">
          {party.seatsWon == null ? "—" : party.seatsWon}
        </div>
      )}
    </div>
  );
}
