import { useMemo, useState } from "react";
import type { ElectionMap, Electorate } from "../types";
import { HEX_SIZE, STATE_HEX_COLORS, computeStateBorders, hexPoints } from "../grid-utils";
import { FED_2022 } from "../elections";
import { ElectorateCell } from "./ElectorateCell";

export interface CartogramProps {
  /** Which election to render. Defaults to FED_2022. */
  election?: ElectionMap;
  /** Return a fill color for each electorate. Defaults to state colors. */
  fill?: (electorate: Electorate) => string;
  /** Return tooltip text for each electorate. Defaults to "Name (STATE)". */
  tooltip?: (electorate: Electorate) => string;
  /** Called when an electorate is clicked. */
  onElectorateClick?: (electorate: Electorate) => void;
  /** Show state border lines. Default true. */
  showBorders?: boolean;
  /** Hex cell size in pixels. Default 14. */
  hexSize?: number;
  /** Additional SVG style. */
  style?: React.CSSProperties;
  /** Additional SVG className. */
  className?: string;
}

export function Cartogram({
  election = FED_2022,
  fill,
  tooltip,
  onElectorateClick,
  showBorders = true,
  hexSize = HEX_SIZE,
  style,
  className,
}: CartogramProps) {
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);

  const { electorates } = election;

  const viewBox = useMemo(() => {
    const padding = hexSize * 2;
    const xs = electorates.map((e) => e.px);
    const ys = electorates.map((e) => e.py);
    const minX = Math.min(...xs) - padding;
    const minY = Math.min(...ys) - padding;
    const maxX = Math.max(...xs) + padding;
    const maxY = Math.max(...ys) + padding;
    return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
  }, [electorates, hexSize]);

  const borderPath = useMemo(
    () => (showBorders ? computeStateBorders(electorates, hexSize) : ""),
    [electorates, showBorders, hexSize],
  );

  const hoveredElectorate = hoveredCode
    ? electorates.find((e) => e.code === hoveredCode)
    : null;

  const defaultFill = (e: Electorate) => STATE_HEX_COLORS[e.state] || "#6B7280";
  const defaultTooltip = (e: Electorate) => `${e.name} (${e.state})`;
  const getFill = fill || defaultFill;
  const getTooltip = tooltip || defaultTooltip;

  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      style={{ width: "100%", ...style }}
      className={className}
    >
      {electorates.map((electorate) => (
        <ElectorateCell
          key={electorate.code}
          x={electorate.px}
          y={electorate.py}
          size={hexSize}
          fill={getFill(electorate)}
          label={getTooltip(electorate)}
          onClick={
            onElectorateClick
              ? () => onElectorateClick(electorate)
              : undefined
          }
          onHover={(h) => setHoveredCode(h ? electorate.code : null)}
        />
      ))}
      {borderPath && (
        <path
          d={borderPath}
          fill="none"
          stroke="rgba(0,0,0,0.6)"
          strokeWidth={2}
          strokeLinecap="round"
          pointerEvents="none"
        />
      )}
      {hoveredElectorate && (
        <polygon
          points={hexPoints(hoveredElectorate.px, hoveredElectorate.py, hexSize)}
          fill="none"
          stroke="white"
          strokeWidth={3}
          pointerEvents="none"
        />
      )}
    </svg>
  );
}
