"use client";

/**
 * CompositionBar — a single horizontal bar showing the seat composition of a
 * chamber: one coloured segment per party (width ∝ seats), with a small
 * triangle marker beneath the bar at the majority threshold.
 *
 * Decoupled port of the wallofadvantage app's CompositionBar: the original
 * derived its rows and left→right spectrum order from the `@tally` election
 * model. That domain logic is now the caller's responsibility — pass the
 * `parties` already ordered left→right; this component is purely
 * presentational.
 */

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./Tooltip";

export interface CompositionParty {
  /** Stable key. Falls back to `code` when absent. */
  id?: string;
  code: string;
  name: string;
  color: string;
  seats: number;
}

export interface CompositionBarProps {
  /** Parties in left→right (spectrum) order. Zero-seat rows are skipped. */
  parties: CompositionParty[];
  /** Total seats in the chamber; drives each segment's width and the marker. */
  total: number;
  /** Seats needed for majority; positions the triangle marker. */
  toWin: number;
  /** Accessible label prefix, e.g. "House of Representatives". */
  ariaTitle?: string;
  className?: string;
}

export function CompositionBar({
  parties,
  total,
  toWin,
  ariaTitle = "Chamber",
  className,
}: CompositionBarProps) {
  const present = parties.filter((p) => p.seats > 0);
  const ariaLabel = `${ariaTitle} seat counts: ${present
    .map((p) => `${p.name} ${p.seats}`)
    .join(", ")}`;

  return (
    <div
      className={["composition-bar", className].filter(Boolean).join(" ")}
    >
      <div className="scs-bar" role="img" aria-label={ariaLabel}>
        {present.map((p) => (
          <Tooltip key={p.id ?? p.code} delayDuration={300}>
            <TooltipTrigger asChild>
              <span
                className="scs-seg"
                style={{
                  width: `${(p.seats / total) * 100}%`,
                  background: p.color,
                }}
              />
            </TooltipTrigger>
            <TooltipContent side="top" align="center">
              <div className="party-bar-tooltip-name">{p.name}</div>
              <div className="party-bar-tooltip-sub">
                {p.seats} {p.seats === 1 ? "seat" : "seats"}
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
        <span
          className="scs-majority"
          style={{ left: `${(toWin / total) * 100}%` }}
          title={`Majority threshold: ${toWin}`}
        />
      </div>
    </div>
  );
}

export default CompositionBar;
