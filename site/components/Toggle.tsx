import type { Which } from "./useTwoState";

export interface ToggleProps {
  labelA: string;
  labelB: string;
  which: Which;
  onChange: (which: Which) => void;
  /** Optional caption shown before the control. */
  label?: string;
}

/** A two-option segmented control driving the A/B animation toggle. */
export function Toggle({ labelA, labelB, which, onChange, label }: ToggleProps) {
  return (
    <div className="toggle-field">
      {label && <span className="toggle-label">{label}</span>}
      <div className="seg" role="group" aria-label={label ?? "state"}>
        <button
          type="button"
          className={`seg-btn${which === "a" ? " is-active" : ""}`}
          aria-pressed={which === "a"}
          onClick={() => onChange("a")}
        >
          {labelA}
        </button>
        <button
          type="button"
          className={`seg-btn${which === "b" ? " is-active" : ""}`}
          aria-pressed={which === "b"}
          onClick={() => onChange("b")}
        >
          {labelB}
        </button>
      </div>
    </div>
  );
}
