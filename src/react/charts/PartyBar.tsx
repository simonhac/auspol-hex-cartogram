/**
 * PartyBar — the shared horizontal bar primitive used by SeatsChart
 * and VotesChart. Pure presentation + measurement; the consumer wires
 * drag/keyboard handlers (see useBarDrag / useBarKeyboard).
 *
 * Visual structure (z-index in parens):
 *   children            row-level overlays (e.g. seats majority line)
 *   default-mark   (5)  small ink notches top + bottom at defaultFraction
 *   fill           (2)  coloured pill from left edge to `fraction`
 *     └─ inside number  number rendered inside the fill when wide enough
 *   badge          (3)  dark cap with the party code, fixed width
 *   outside number (4)  same number, just past the fill end, when narrow
 *   thumb          (6)  drag-handle bar (editable only)
 */

"use client";

import React, {
  forwardRef,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import {
  useElementWidth,
  barEdgeCSS,
  rowStyleVars,
  BADGE_PX,
} from "./chartUtils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./Tooltip";

// Pure modifier keys — pressing them alone (e.g. Cmd before a screenshot
// shortcut, Shift while composing a chord) should not paint the focus ring.
const MODIFIER_KEYS = new Set([
  "Shift",
  "Control",
  "Alt",
  "Meta",
  "AltGraph",
  "CapsLock",
  "NumLock",
  "ScrollLock",
  "Fn",
  "FnLock",
  "Hyper",
  "Super",
]);

export interface PartyBarParty {
  code: string;
  name: string;
  color: string;
  darkColor?: string;
  // Optional second-line label shown under `name` in the badge tooltip.
  // E.g. for the "Independents" bucket: "Seats like Hawthorn, Kew and Mornington".
  subLabel?: string;
}

export interface PartyBarAria {
  label?: string;
  valuemin?: number;
  valuemax?: number;
  valuenow?: number;
  valuetext?: string;
}

// Five quantiles in fraction units (0..1, fraction of the chart's
// max). Used by SeatsChart to overlay a thin box-and-whisker on each
// bar, communicating Monte Carlo uncertainty around the deterministic
// point estimate.
export interface PartyBarWhisker {
  p05: number;
  p25: number;
  p50: number;
  p75: number;
  p95: number;
}

export interface PartyBarProps {
  party: PartyBarParty;
  fraction: number;
  valueLabel: string | number;
  insideThresholdPx?: number;
  defaultFraction?: number | null;
  defaultTitle?: string;
  atDefault?: boolean;
  editable?: boolean;
  dragging?: boolean;
  onPointerDown?: (e: ReactPointerEvent<HTMLElement>) => void;
  onKeyDown?: (e: ReactKeyboardEvent<HTMLElement>) => void;
  aria?: PartyBarAria;
  whisker?: PartyBarWhisker | null;
  // When true, suppress the inline numeric label on the bar (both
  // the inside-fill and the outside-of-fill positions). Used by
  // SeatsChart in uncertainty mode, where the number is rendered
  // in a dedicated column to the right of the bar instead.
  hideValueLabel?: boolean;
  children?: ReactNode;
}

const PartyBar = forwardRef<HTMLDivElement, PartyBarProps>(function PartyBar(
  {
    party,
    fraction,
    valueLabel,
    insideThresholdPx = 52,
    defaultFraction = null,
    defaultTitle,
    atDefault = false,
    editable = false,
    dragging = false,
    onPointerDown,
    onKeyDown,
    aria,
    whisker = null,
    hideValueLabel = false,
    children,
  },
  ref,
) {
  const [rowRef, rowWidth] = useElementWidth<HTMLDivElement>(ref);
  const f = Math.max(0, Math.min(1, fraction || 0));

  // `showFocusRing` drives the dashed outline. Set true on badge click,
  // first keystroke, or Tab-arrived focus; cleared on drag-pointerdown
  // and blur. We can't use :focus-visible because Chromium applies it
  // to role="slider" even on mouse-driven focus — so we distinguish
  // mouse-focus from Tab-focus via `recentPointerDownRef`.
  const [showFocusRing, setShowFocusRing] = useState(false);
  const recentPointerDownRef = useRef(false);

  const onBadgePointerDown = editable
    ? (e: ReactPointerEvent<HTMLElement>) => {
        e.stopPropagation();
        recentPointerDownRef.current = true;
        setShowFocusRing(true);
        rowRef.current?.focus();
      }
    : undefined;

  const onRowPointerDown = (e: ReactPointerEvent<HTMLElement>) => {
    recentPointerDownRef.current = true;
    setShowFocusRing(false);
    onPointerDown?.(e);
  };

  const onRowFocus = () => {
    if (!recentPointerDownRef.current) setShowFocusRing(true);
    recentPointerDownRef.current = false;
  };

  const onRowBlur = () => {
    setShowFocusRing(false);
    recentPointerDownRef.current = false;
  };

  const onRowKeyDown = (e: ReactKeyboardEvent<HTMLElement>) => {
    if (e.key === "Escape") {
      setShowFocusRing(false);
      e.preventDefault();
      return;
    }
    if (!MODIFIER_KEYS.has(e.key)) setShowFocusRing(true);
    onKeyDown?.(e);
  };

  // Pop the number outside the bar as soon as it stops fitting
  // cleanly inside the coloured fill.
  const barPx = BADGE_PX + (rowWidth - BADGE_PX) * f;
  const showInside = barPx >= BADGE_PX + insideThresholdPx;

  const cls = [
    "party-bar",
    editable && "is-editable",
    dragging && "is-dragging",
    showFocusRing && "show-focus-ring",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={rowRef}
      className={cls}
      style={rowStyleVars(party.color, party.darkColor)}
      onPointerDown={onRowPointerDown}
      onFocus={onRowFocus}
      onBlur={onRowBlur}
      onKeyDown={onRowKeyDown}
      tabIndex={editable ? 0 : -1}
      role={editable ? "slider" : undefined}
      aria-label={editable ? aria?.label : undefined}
      aria-valuemin={editable ? aria?.valuemin : undefined}
      aria-valuemax={editable ? aria?.valuemax : undefined}
      aria-valuenow={editable ? aria?.valuenow : undefined}
      aria-valuetext={editable ? aria?.valuetext : undefined}
    >
      {children}

      {defaultFraction != null && (
        <div
          className={`party-bar-default-mark${atDefault ? " is-at-default" : ""}`}
          style={{ left: barEdgeCSS(defaultFraction) }}
          title={defaultTitle}
        />
      )}

      <div className="party-bar-fill" style={{ width: barEdgeCSS(f) }}>
        {rowWidth > 0 && showInside && !hideValueLabel && (
          <span className="party-bar-num party-bar-num-inside">
            {valueLabel}
          </span>
        )}
      </div>

      {whisker && (
        <div className="party-bar-whisker">
          {/* Baseline line: thin horizontal stroke from p05 to p95. */}
          <div
            className="party-bar-whisker-line"
            style={{
              left: barEdgeCSS(whisker.p05),
              right: `calc(100% - ${barEdgeCSS(whisker.p95)})`,
            }}
          />
          {/* End caps: short vertical ticks at p05 and p95. */}
          <div
            className="party-bar-whisker-cap"
            style={{ left: barEdgeCSS(whisker.p05) }}
          />
          <div
            className="party-bar-whisker-cap"
            style={{ left: barEdgeCSS(whisker.p95) }}
          />
          {/* IQR box: outlined rectangle from p25 to p75. */}
          <div
            className="party-bar-whisker-box"
            style={{
              left: barEdgeCSS(whisker.p25),
              right: `calc(100% - ${barEdgeCSS(whisker.p75)})`,
            }}
          />
          {/* Median tick: bolder vertical inside the box. */}
          <div
            className="party-bar-whisker-median"
            style={{ left: barEdgeCSS(whisker.p50) }}
          />
        </div>
      )}

      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div
            className="party-bar-badge"
            onPointerDown={onBadgePointerDown}
          >
            <span className="party-bar-code">{party.code}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" align="start">
          <div className="party-bar-tooltip-name">{party.name}</div>
          {party.subLabel ? (
            <div className="party-bar-tooltip-sub">{party.subLabel}</div>
          ) : null}
        </TooltipContent>
      </Tooltip>

      {rowWidth > 0 && !showInside && !hideValueLabel && (
        <span
          className="party-bar-num party-bar-num-outside"
          style={{ left: `calc(${barEdgeCSS(f)} + 12px)` }}
        >
          {valueLabel}
        </span>
      )}

      {editable && (
        <div className="party-bar-thumb" style={{ left: barEdgeCSS(f) }} />
      )}
    </div>
  );
});

export default PartyBar;
