/**
 * chartUtils — shared primitives for SeatsChart / VotesChart / PartyBar.
 *
 * Ported from the vic-public-funding design bundle. The plateau-cursor
 * model mirrors the JudgementSlider in the article, but here cursor space
 * stays continuous so pointer drags translate directly.
 */

import {
  useRef,
  useState,
  useLayoutEffect,
  useCallback,
  type Ref,
  type RefObject,
  type PointerEvent as ReactPointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type CSSProperties,
} from "react";

// Pixel width of the dark party badge at the left of each row.
// Keep in sync with --pb-badge-w in the .party-bar CSS rule.
export const BADGE_PX = 78;

export function useElementWidth<T extends HTMLElement>(
  externalRef?: Ref<T> | null,
): [RefObject<T | null>, number] {
  const internalRef = useRef<T | null>(null);
  const ref =
    externalRef && typeof externalRef === "object" && "current" in externalRef
      ? (externalRef as RefObject<T | null>)
      : internalRef;
  const [w, setW] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setW(el.getBoundingClientRect().width);
    const ro = new ResizeObserver((entries) => {
      setW(entries[0].contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return [ref, w];
}

export function barEdgeCSS(fraction: number): string {
  const f = Math.max(0, Math.min(1, fraction));
  return `calc(${BADGE_PX}px + (100% - ${BADGE_PX}px) * ${f})`;
}

// Right margin to apply to a bar whose left edge sits at `barLeftPx`
// from the chart's left, so that the bar's midpoint coincides with
// `barEdgeCSS(fraction)` above it. The returned CSS resolves against
// the bar's containing block (e.g. the second grid track), so the
// `100%` referent is the track width — not the chart width.
// Clamped at 0 (when the chart is wide enough that the bar already
// straddles the alignment point, no nudging needed).
// barLeftPx default matches the OverUnderIndicator's `--ou-label-w`
// (132px) + `--ou-label-gap` (10px).
export function barCenterRightMarginCSS(
  fraction: number,
  barLeftPx = 142,
): string {
  const f = Math.max(0, Math.min(1, fraction));
  // r = trackW·(1−2f) + 2·(1−f)·(barLeftPx − BADGE_PX)
  const fixedPx = 2 * (1 - f) * (barLeftPx - BADGE_PX);
  const pct = 1 - 2 * f;
  return `max(0px, calc(${fixedPx}px + ${pct} * 100%))`;
}

// Cursor → value mapping with a sticky "plateau" of dwell stops at
// the default. The cursor sweeps [0, max + plateauWidth]; inside the
// plateau [defaultValue, defaultValue + plateauWidth] the value
// snaps to the default, and outside it the value tracks the cursor
// minus the plateau width past the default. Keeps the mapping
// continuous AND keeps the chart edges fully reachable.
export function applyPlateau(
  cursorFraction: number,
  max: number,
  defaultValue: number | null | undefined,
  plateauWidth: number,
): number {
  if (defaultValue == null || !(plateauWidth > 0)) {
    return cursorFraction * max;
  }
  const cursorPos = cursorFraction * (max + plateauWidth);
  if (cursorPos <= defaultValue) return cursorPos;
  if (cursorPos <= defaultValue + plateauWidth) return defaultValue;
  return cursorPos - plateauWidth;
}

export function rowStyleVars(
  color: string,
  darkColor?: string,
): CSSProperties {
  const base: CSSProperties & Record<string, string> = {
    "--party-c": color,
  };
  if (darkColor) base["--party-c-dark"] = darkColor;
  return base;
}

export interface UseBarDragArgs {
  rowRef: RefObject<HTMLElement | null>;
  max: number;
  defaultValue?: number | null;
  plateauWidth: number;
  onSet: (value: number) => void;
  enabled: boolean;
}

export function useBarDrag({
  rowRef,
  max,
  defaultValue,
  plateauWidth,
  onSet,
  enabled,
}: UseBarDragArgs) {
  const [dragging, setDragging] = useState(false);
  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (!enabled) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (!rowRef.current) return;
      e.preventDefault();
      rowRef.current.focus();
      const rect = rowRef.current.getBoundingClientRect();

      const apply = (clientX: number) => {
        const region = rect.width - BADGE_PX;
        const local = Math.max(
          0,
          Math.min(region, clientX - rect.left - BADGE_PX),
        );
        const cursorFraction = region > 0 ? local / region : 0;
        onSet(applyPlateau(cursorFraction, max, defaultValue, plateauWidth));
      };

      apply(e.clientX);
      setDragging(true);

      const move = (ev: PointerEvent) => apply(ev.clientX);
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        setDragging(false);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [enabled, rowRef, max, defaultValue, plateauWidth, onSet],
  );
  return { dragging, onPointerDown };
}

export interface UseBarKeyboardArgs {
  value: number;
  max: number;
  step: number;
  shiftStep: number;
  onSet: (value: number) => void;
  onReset?: () => void;
  enabled: boolean;
}

export function useBarKeyboard({
  value,
  max,
  step,
  shiftStep,
  onSet,
  onReset,
  enabled,
}: UseBarKeyboardArgs) {
  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLElement>) => {
      if (!enabled) return;
      const s = e.shiftKey || e.metaKey ? shiftStep : step;
      if (e.key === "ArrowLeft") {
        onSet(value - s);
        e.preventDefault();
      } else if (e.key === "ArrowRight") {
        onSet(value + s);
        e.preventDefault();
      } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        const bar = e.currentTarget;
        const chart = bar.closest(".seats-chart, .votes-chart");
        if (chart) {
          const bars = Array.from(
            chart.querySelectorAll<HTMLElement>(".party-bar.is-editable"),
          );
          const idx = bars.indexOf(bar);
          if (idx >= 0) {
            const next = e.key === "ArrowDown" ? idx + 1 : idx - 1;
            if (next >= 0 && next < bars.length) bars[next].focus();
          }
        }
        e.preventDefault();
      } else if (e.key === "Home") {
        onSet(0);
        e.preventDefault();
      } else if (e.key === "End") {
        onSet(max);
        e.preventDefault();
      } else if ((e.key === "r" || e.key === "R") && onReset) {
        onReset();
        e.preventDefault();
      }
    },
    [enabled, value, max, step, shiftStep, onSet, onReset],
  );
  return { onKeyDown };
}
