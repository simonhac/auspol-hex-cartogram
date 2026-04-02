import { hexPoints } from "../grid-utils";

export interface ElectorateCellProps {
  x: number;
  y: number;
  size: number;
  fill: string;
  label: string;
  sublabel?: string;
  onClick?: () => void;
  onHover?: (hovered: boolean) => void;
}

export function ElectorateCell({
  x,
  y,
  size,
  fill,
  label,
  sublabel,
  onClick,
  onHover,
}: ElectorateCellProps) {
  return (
    <g
      style={{ cursor: onClick ? "pointer" : undefined }}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      onClick={onClick}
    >
      <polygon
        points={hexPoints(x, y, size)}
        fill={fill}
        stroke="rgba(255,255,255,0.3)"
        strokeWidth={0.5}
      />
      <title>{sublabel ? `${label} (${sublabel})` : label}</title>
    </g>
  );
}
