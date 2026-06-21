/**
 * OverUnderIndicator — the over/under bar shown beneath an editable
 * chart when sum(values) ≠ target. A left-hand "Underallocated" /
 * "Overallocated" label sits beside a fixed-range ±gauge: 0 at centre,
 * positive (over) fills rightward in rust, negative (under) fills
 * leftward in grey. When |value| > range, the fill end becomes a
 * tapered triangle pointing in the run-off direction.
 */

"use client";

import React, { useLayoutEffect, useRef, useState } from "react";

export interface OverUnderIndicatorProps {
  value: number; // +ve = over, -ve = under
  range: number;
  format?: (value: number) => string;
  className?: string;
  style?: React.CSSProperties;
  underLabel?: string;
  overLabel?: string;
  // When false, the indicator still occupies its row so the page
  // doesn't reflow when balance drifts in and out of zero — but its
  // contents are visually hidden.
  visible?: boolean;
}

const defaultFormat = (v: number) => (v > 0 ? `+${v}` : `${v}`);

// Min gap between the value label and the end of the fill when the
// label is rendered inside the bar.
const LABEL_INSIDE_PADDING_PX = 16;

export default function OverUnderIndicator({
  value,
  range,
  format = defaultFormat,
  className,
  style,
  underLabel = "Underallocated",
  overLabel = "Overallocated",
  visible = true,
}: OverUnderIndicatorProps) {
  const gaugeRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLDivElement | null>(null);
  // Default to outside so the first paint is never visually broken.
  // The effect below upgrades to inside as soon as we can measure
  // that it comfortably fits.
  const [labelInside, setLabelInside] = useState(false);

  const valuePos = (() => {
    if (!(range > 0)) return 50;
    const clamped = Math.max(-range, Math.min(range, value));
    return 50 + (clamped / range) * 50; // 0..100
  })();

  useLayoutEffect(() => {
    const gaugeEl = gaugeRef.current;
    const labelEl = labelRef.current;
    if (!gaugeEl || !labelEl) {
      setLabelInside((prev) => (prev ? false : prev));
      return;
    }

    const recalc = () => {
      const gaugeWidthPx = gaugeEl.getBoundingClientRect().width;
      const labelWidthPx = labelEl.getBoundingClientRect().width;
      const fillWidthPx = (Math.abs(valuePos - 50) / 100) * gaugeWidthPx;
      const fits = fillWidthPx >= labelWidthPx + LABEL_INSIDE_PADDING_PX;
      setLabelInside((prev) => (prev === fits ? prev : fits));
    };

    recalc();
    const ro = new ResizeObserver(recalc);
    ro.observe(gaugeEl);
    return () => ro.disconnect();
  }, [valuePos, value, format]);

  if (!(range > 0)) return null;

  const isOver = value > range;
  const isUnder = value < -range;
  const isOverflow = isOver || isUnder;

  const fillLeft = Math.min(50, valuePos);
  const fillWidth = Math.abs(valuePos - 50);

  const dir =
    value > 0.0001
      ? "is-over"
      : value < -0.0001
        ? "is-under"
        : "is-zero";

  let labelEl: React.ReactNode = null;
  if (dir !== "is-zero") {
    const style: React.CSSProperties = !labelInside
      ? {
          left: `${valuePos}%`,
          transform:
            valuePos >= 50
              ? "translate(8px, -50%)"
              : "translate(calc(-100% - 8px), -50%)",
        }
      : value > 0
        ? { right: `calc(100% - ${Math.min(valuePos, 100)}% + 8px)` }
        : { left: `calc(${Math.max(valuePos, 0)}% + 8px)` };

    labelEl = (
      <div
        ref={labelRef}
        className={`over-under-value${labelInside ? " is-inside" : ""}`}
        style={style}
      >
        {format(value)}
      </div>
    );
  }

  const wrapperCls = ["over-under", value > 0 && "is-over", className]
    .filter(Boolean)
    .join(" ");

  const gaugeCls = ["over-under-gauge", dir, isOverflow && "is-overflow"]
    .filter(Boolean)
    .join(" ");

  const wrapperStyle: React.CSSProperties = {
    ...style,
    opacity: visible ? 1 : 0,
    transition: visible
      ? "opacity 0.15s ease"
      : "opacity 0.25s ease 0.25s",
  };

  return (
    <div
      className={wrapperCls}
      role="status"
      style={wrapperStyle}
      aria-hidden={!visible}
    >
      <div className="over-under-label">
        {value > 0 ? overLabel : underLabel}
      </div>
      <div className="over-under-bar">
        <div ref={gaugeRef} className={gaugeCls}>
          <div className="over-under-track" />
          <div className="over-under-zero" />
          <div
            className="over-under-fill"
            style={{ left: `${fillLeft}%`, width: `${fillWidth}%` }}
          />
          {labelEl}
        </div>
      </div>
    </div>
  );
}
