import { useState } from "react";
import { Cartogram } from "auspoligraphs/react";
import { FED_2019, FED_2022, FED_2025 } from "auspoligraphs";
import type { ElectionMap } from "auspoligraphs";
import { Demo } from "../components/Demo";

const ELECTIONS: { key: string; label: string; map: ElectionMap }[] = [
  { key: "2019", label: "2019", map: FED_2019 },
  { key: "2022", label: "2022", map: FED_2022 },
  { key: "2025", label: "2025", map: FED_2025 },
];

export function CartogramPage() {
  const [idx, setIdx] = useState(1);
  const election = ELECTIONS[idx].map;

  const controls = (
    <div className="toggle-field">
      <span className="toggle-label">Election</span>
      <div className="seg" role="group" aria-label="Election">
        {ELECTIONS.map((e, i) => (
          <button
            type="button"
            key={e.key}
            className={`seg-btn${i === idx ? " is-active" : ""}`}
            aria-pressed={i === idx}
            onClick={() => setIdx(i)}
          >
            {e.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Demo
      title="Cartogram"
      description={
        <>
          An equal-area hex cartogram of Australia&rsquo;s {election.seatCount} federal
          electorates ({election.label}), coloured by state with state borders. Hover a cell
          for its name; switch elections to redraw the grid.
        </>
      }
      controls={controls}
      maxWidth={780}
    >
      <Cartogram election={election} />
    </Demo>
  );
}
