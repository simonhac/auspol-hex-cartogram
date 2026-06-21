import { useMemo, useState } from "react";
import type { ArcSeat, Party } from "../types";
import { computeArcLayout } from "../arc-utils";

export interface ParliamentArcProps {
  /** Parties in left→right order. `parties[0]` fills the leftmost wedge. */
  parties: Party[];
  /** Number of concentric rows. Auto-derived from the seat count if omitted. */
  rows?: number;
  /** Outer radius in pixels. Default 250. */
  outerRadius?: number;
  /** Inner radius as a fraction of the outer radius (0–1). Default 0.45. */
  innerRadiusRatio?: number;
  /** Seat dot radius as a fraction of the available spacing. Default 0.48. */
  seatRadiusRatio?: number;
  /** Explicit seat dot radius in pixels (overrides `seatRadiusRatio`). */
  seatRadius?: number;
  /** Seats-per-row distribution: `"linear"` (default) or `"proportional"`. */
  distribution?: "linear" | "proportional";
  /** Animate dots when seat counts change. Default true. */
  animate?: boolean;
  /** Transition duration in milliseconds when `animate` is set. Default 500. */
  transitionMs?: number;
  /** Dim other parties when a seat is hovered. Default true. */
  highlightOnHover?: boolean;
  /** Tooltip text per seat. Defaults to the party name. */
  tooltip?: (seat: ArcSeat) => string;
  /** Called when a seat is clicked. */
  onSeatClick?: (seat: ArcSeat) => void;
  /** Additional SVG style. */
  style?: React.CSSProperties;
  /** Additional SVG className. */
  className?: string;
}

/**
 * A parliament composition chart: a semicircular arc of seat dots, one per
 * seat, grouped into clean left→right party wedges.
 *
 * The component is theme-agnostic — it renders only the dots. Compose it with a
 * heading, caption, legend, or `<ResultsTable>` to build a full panel.
 */
export function ParliamentArc({
  parties,
  rows,
  outerRadius,
  innerRadiusRatio,
  seatRadiusRatio,
  seatRadius,
  distribution,
  animate = true,
  transitionMs = 500,
  highlightOnHover = true,
  tooltip,
  onSeatClick,
  style,
  className,
}: ParliamentArcProps) {
  const [hoveredPartyIndex, setHoveredPartyIndex] = useState<number | null>(null);

  const layout = useMemo(
    () =>
      computeArcLayout(parties, {
        rows,
        outerRadius,
        innerRadiusRatio,
        seatRadiusRatio,
        seatRadius,
        distribution,
      }),
    [parties, rows, outerRadius, innerRadiusRatio, seatRadiusRatio, seatRadius, distribution],
  );

  const getTooltip = tooltip ?? ((seat: ArcSeat) => seat.party.name);
  const transition = animate
    ? `transform ${transitionMs}ms ease, fill ${transitionMs}ms ease, opacity ${transitionMs}ms ease`
    : undefined;

  return (
    <svg
      viewBox={layout.viewBox}
      preserveAspectRatio="xMidYMid meet"
      style={{ width: "100%", ...style }}
      className={className}
    >
      {layout.seats.map((seat) => {
        const dimmed =
          highlightOnHover &&
          hoveredPartyIndex !== null &&
          hoveredPartyIndex !== seat.partyIndex;
        return (
          // Keyed by stable position so React reuses the node and the CSS
          // transition animates the dot recolouring / reflowing.
          <circle
            key={seat.index}
            r={layout.seatRadius}
            fill={seat.party.color}
            opacity={dimmed ? 0.25 : 1}
            style={{
              transform: `translate(${seat.x}px, ${seat.y}px)`,
              transition,
              cursor: onSeatClick ? "pointer" : undefined,
            }}
            onMouseEnter={() => setHoveredPartyIndex(seat.partyIndex)}
            onMouseLeave={() => setHoveredPartyIndex(null)}
            onClick={onSeatClick ? () => onSeatClick(seat) : undefined}
          >
            <title>{getTooltip(seat)}</title>
          </circle>
        );
      })}
    </svg>
  );
}
