import { Toggle, type ToggleOption } from "./Toggle";
import { GEO_BOUNDS, type Geometry } from "../pages/parliament/url";

export interface GeometryControlsProps {
  value: Geometry;
  onChange: (next: Geometry) => void;
}

const DISTRIBUTION_OPTIONS: ToggleOption<Geometry["distribution"]>[] = [
  { value: "linear", label: "Linear" },
  { value: "proportional", label: "Proportional" },
];

/** Live geometry tuning for the Custom-mode arc: radii, seat size, row count
 *  and seat distribution. */
export function GeometryControls({ value, onChange }: GeometryControlsProps) {
  return (
    <div className="geometry-controls">
      <span className="gc-heading">Geometry</span>
      <div className="gc-grid">
        <Slider
          label="Outer radius"
          value={value.outerRadius}
          min={GEO_BOUNDS.outerRadius.min}
          max={GEO_BOUNDS.outerRadius.max}
          step={5}
          display={`${Math.round(value.outerRadius)}px`}
          onChange={(outerRadius) => onChange({ ...value, outerRadius })}
        />
        <Slider
          label="Inner radius"
          value={value.innerRadiusRatio}
          min={GEO_BOUNDS.innerRadiusRatio.min}
          max={GEO_BOUNDS.innerRadiusRatio.max}
          step={0.01}
          display={value.innerRadiusRatio.toFixed(2)}
          onChange={(innerRadiusRatio) => onChange({ ...value, innerRadiusRatio })}
        />
        <Slider
          label="Seat size"
          value={value.seatRadiusRatio}
          min={GEO_BOUNDS.seatRadiusRatio.min}
          max={GEO_BOUNDS.seatRadiusRatio.max}
          step={0.01}
          display={value.seatRadiusRatio.toFixed(2)}
          onChange={(seatRadiusRatio) => onChange({ ...value, seatRadiusRatio })}
        />

        <div className="gc-field">
          <div className="gc-field-head">
            <span className="gc-label">Rows</span>
            <label className="gc-auto">
              <input
                type="checkbox"
                checked={value.rows === "auto"}
                onChange={(e) =>
                  onChange({ ...value, rows: e.target.checked ? "auto" : 6 })
                }
              />
              Auto
            </label>
          </div>
          <input
            className="gc-range"
            type="range"
            min={GEO_BOUNDS.rows.min}
            max={GEO_BOUNDS.rows.max}
            step={1}
            value={value.rows === "auto" ? 6 : value.rows}
            disabled={value.rows === "auto"}
            aria-label="Rows"
            onChange={(e) => onChange({ ...value, rows: e.target.valueAsNumber })}
          />
        </div>

        <div className="gc-field gc-field--wide">
          <span className="gc-label">Distribution</span>
          <Toggle
            options={DISTRIBUTION_OPTIONS}
            value={value.distribution}
            onChange={(distribution) => onChange({ ...value, distribution })}
          />
        </div>
      </div>
    </div>
  );
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (value: number) => void;
}

function Slider({ label, value, min, max, step, display, onChange }: SliderProps) {
  return (
    <div className="gc-field">
      <div className="gc-field-head">
        <span className="gc-label">{label}</span>
        <span className="gc-value">{display}</span>
      </div>
      <input
        className="gc-range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(e.target.valueAsNumber)}
      />
    </div>
  );
}
