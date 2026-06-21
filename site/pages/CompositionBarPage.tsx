import { useState } from "react";
import { CompositionBar } from "auspoligraphs/react";
import { Demo } from "../components/Demo";
import { Toggle } from "../components/Toggle";
import {
  COMPOSITION_BY_YEAR,
  CHAMBER_BY_YEAR,
  ELECTION_YEARS,
  type ElectionYear,
} from "../fixtures/charts";

export function CompositionBarPage() {
  const [year, setYear] = useState<ElectionYear>("2025");
  const { total, majority } = CHAMBER_BY_YEAR[year];

  const controls = (
    <Toggle
      label="Election"
      options={ELECTION_YEARS.map((y) => ({ value: y, label: y }))}
      value={year}
      onChange={setYear}
    />
  );

  return (
    <Demo
      title="Composition Bar"
      description={
        <>
          The whole chamber as one bar — one coloured segment per party, sized by seats,
          with a triangle marking the majority threshold. Toggle between elections to watch
          the balance of power shift. Federal House of Representatives.
        </>
      }
      controls={controls}
      maxWidth={680}
    >
      <div className="scs-card">
        <div className="scs-title">House of Representatives</div>
        <div className="scs-sub">
          {total} single-member seats · {majority} for majority
        </div>
        <CompositionBar
          parties={COMPOSITION_BY_YEAR[year]}
          total={total}
          toWin={majority}
          ariaTitle="House of Representatives"
        />
      </div>
    </Demo>
  );
}
