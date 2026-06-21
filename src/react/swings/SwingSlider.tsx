"use client";

import {
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

// Pure modifier keys — pressing them alone (e.g. Shift while composing a
// chord) should not paint the focus ring.
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

// Extra non-value tick mark (e.g. the statewide-ON marker on the
// demographic sliders). `zero` styles it like the central zero tick.
export interface SwingTick {
  value: number;
  zero?: boolean;
}

export interface SwingSliderProps {
  /** Colour chip swatch (party / demographic colour). */
  color: string;
  /** Row label text. */
  label: string;
  /** Current value, in value space (pp for swings, % for ON share). */
  value: number;
  /** Value-space clamp bounds. */
  min: number;
  max: number;
  /**
   * Value ⇄ slider-position mapping. The native `<input type=range>` runs in
   * integer position space; swings use a quadratic curve (most of the track
   * near zero), ON share is linear. Provide both directions.
   */
  valueToPos: (value: number) => number;
  posToValue: (pos: number) => number;
  /** Tick marks, in value space. */
  ticks: SwingTick[];
  /** Keyboard step sizes (default fine, Shift/Meta coarse). */
  fineStep: number;
  shiftStep: number;
  /** Format the right-hand readout (sign, decimals, "%"…). */
  formatValue: (value: number) => string;
  /** "manual" = user-pinned (solid thumb); "auto" = algorithm-driven (hollow). */
  mode: "auto" | "manual";
  /** Pinned-as-absorber: can't be dragged but still shown. */
  locked?: boolean;
  /** Greyed out — value persists but has no effect in the current context. */
  inert?: boolean;
  inertReason?: string;
  ariaLabel: string;
  ariaValueText: string;
  onChange: (value: number) => void;
  onRelease: () => void;
}

// Edge-correct a percent along the track for the 9px thumb inset so the
// thumb / ticks line up with the visible track ends.
function edgeLeft(pct: number): string {
  return `calc(${pct}% + ${((50 - pct) / 50) * 9}px)`;
}

export function SwingSlider({
  color,
  label,
  value,
  min,
  max,
  valueToPos,
  posToValue,
  ticks,
  fineStep,
  shiftStep,
  formatValue,
  mode,
  locked = false,
  inert = false,
  inertReason,
  ariaLabel,
  ariaValueText,
  onChange,
  onRelease,
}: SwingSliderProps) {
  const isManual = mode === "manual";
  const inputRef = useRef<HTMLInputElement>(null);

  // `showFocusRing` drives the dashed outline on the row. Set true on
  // chip/label click (intentional focus), first keystroke, or Tab-arrived
  // focus; cleared on slider pointerdown (drag intent), Escape, and blur.
  const [showFocusRing, setShowFocusRing] = useState(false);
  const recentPointerDownRef = useRef(false);

  // Position-space track bounds for percent/edge math.
  const posLo = valueToPos(min);
  const posHi = valueToPos(max);
  const pctForValue = (v: number) =>
    ((valueToPos(v) - posLo) / (posHi - posLo)) * 100;

  const focusFromLabel = (e: ReactPointerEvent<HTMLElement>) => {
    e.preventDefault();
    recentPointerDownRef.current = true;
    setShowFocusRing(true);
    inputRef.current?.focus();
  };

  const onInputPointerDown = () => {
    recentPointerDownRef.current = true;
    setShowFocusRing(false);
  };

  const onInputFocus = () => {
    if (!recentPointerDownRef.current) setShowFocusRing(true);
    recentPointerDownRef.current = false;
  };

  const onInputBlur = () => {
    setShowFocusRing(false);
    recentPointerDownRef.current = false;
  };

  const onInputKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setShowFocusRing(false);
      e.preventDefault();
      return;
    }
    if (!MODIFIER_KEYS.has(e.key)) setShowFocusRing(true);

    // Up/Down: roving focus across sibling swing sliders.
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      const container = e.currentTarget.closest(".swing-rows");
      if (container) {
        const inputs = Array.from(
          container.querySelectorAll<HTMLInputElement>(".swing-slider"),
        );
        const idx = inputs.indexOf(e.currentTarget);
        if (idx >= 0) {
          const next = e.key === "ArrowDown" ? idx + 1 : idx - 1;
          if (next >= 0 && next < inputs.length) inputs[next].focus();
        }
      }
      e.preventDefault();
      return;
    }

    // Override native arrow stepping: the slider runs in position space and
    // a single position step is sub-0.001 near zero, so we step in value
    // space instead. Shift/Meta is coarser, default is fine.
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      if (locked || inert) {
        e.preventDefault();
        return;
      }
      const step = e.shiftKey || e.metaKey ? shiftStep : fineStep;
      const delta = e.key === "ArrowLeft" ? -step : step;
      const next = Math.max(min, Math.min(max, value + delta));
      onChange(Number(next.toFixed(1)));
      e.preventDefault();
      return;
    }

    // R: release this row back to automatic (only meaningful if pinned).
    if (e.key === "r" || e.key === "R") {
      if (isManual) onRelease();
      e.preventDefault();
      return;
    }
  };

  const cls = `swing-row${showFocusRing ? " show-focus-ring" : ""}${
    inert ? " swing-row--inert" : ""
  }`;
  const thumbCls = `slider-thumb-overlay ${isManual ? "manual" : "auto"}${
    locked ? " locked" : ""
  }${inert ? " inert" : ""}`;

  return (
    <div className={cls} title={inert ? inertReason : undefined}>
      <span
        className="swing-chip"
        style={{ background: color }}
        onPointerDown={inert ? undefined : focusFromLabel}
      />
      <span
        className="swing-label"
        onPointerDown={inert ? undefined : focusFromLabel}
      >
        {label}
      </span>
      <span className="judgement-slider-wrap">
        {ticks.map((tick, i) => {
          const pct = pctForValue(tick.value);
          return (
            <span
              key={i}
              aria-hidden
              className={`swing-tick${tick.zero ? " swing-tick--zero" : ""}`}
              style={{ left: edgeLeft(pct) }}
            />
          );
        })}
        <input
          ref={inputRef}
          type="range"
          min={posLo}
          max={posHi}
          step={1}
          value={valueToPos(value)}
          onChange={(e) => {
            if (locked || inert) return;
            onChange(posToValue(Number(e.target.value)));
          }}
          onPointerDown={inert ? (e) => e.preventDefault() : onInputPointerDown}
          onFocus={onInputFocus}
          onBlur={onInputBlur}
          onKeyDown={onInputKeyDown}
          onDoubleClick={isManual && !inert ? onRelease : undefined}
          className="swing-slider judgement-slider"
          aria-label={ariaLabel}
          aria-valuetext={ariaValueText}
          aria-disabled={locked || inert || undefined}
        />
        <span
          className={thumbCls}
          aria-hidden
          style={{ left: edgeLeft(pctForValue(value)) }}
        />
      </span>
      <span className="swing-value mono">{formatValue(value)}</span>
    </div>
  );
}
