import { useMemo, useReducer } from "react";
import {
  scenarioReducer,
  emptyScenario,
  computeDemoStats,
  resolveOnpDemographic,
  aggregateLaPrimaries,
  type ScenarioParty,
  type PartyId,
  type PreferenceFlows,
  type SeatBaseline,
} from "auspoligraphs";
import { SwingPanel, DemographicSkewPanel } from "auspoligraphs/react";
import { Demo } from "../components/Demo";
import vic2022 from "../fixtures/vic2022.json";

// The real wallofadvantage default dataset (VIC 2022 lower house), generated
// from the source `vic-result-2022.yaml`. Cast the structural JSON types to
// the engine's nominal types.
const parties = vic2022.parties as unknown as Record<PartyId, ScenarioParty>;
const seats = vic2022.seats as unknown as SeatBaseline[];
const flows = vic2022.preferenceFlows as unknown as PreferenceFlows;

// Party display order — mirrors SeatsModel's `partyUniverse`: the parties that
// actually appear in seat primaries (+ ONP), majors first, Other last.
const partyUniverse: PartyId[] = (() => {
  const set = new Set<PartyId>();
  for (const s of seats) for (const k of Object.keys(s.primaries)) set.add(k);
  set.add("onp");
  const order = (p: string) => {
    if (p === "alp") return 0;
    if (p === "lib") return 1;
    if (p === "nat") return 2;
    if (p === "grn") return 3;
    if (p === "onp") return 4;
    if (p === "oth") return 6;
    return 5;
  };
  return Array.from(set).sort((a, b) => order(a) - order(b) || a.localeCompare(b));
})();

export function SwingsPage() {
  // Self-managing: the panels drive a single scenario reducer (the
  // wallofadvantage default — custom mode, no preset).
  const [scenario, dispatch] = useReducer(scenarioReducer, undefined, emptyScenario);

  // Per-demographic formal-vote weights — stable for a given dataset.
  const demoStats = useMemo(() => computeDemoStats(seats), []);

  // Statewide ON % implied by the swing panel: the target the four
  // demographic sliders must average to. Reactive to the ONP swing slider.
  const statewideOnpPct = useMemo(() => {
    const agg = aggregateLaPrimaries(seats, scenario, { bucketIndies: false });
    const total = Object.values(agg).reduce((a, b) => a + b, 0);
    if (total <= 0) return 0;
    return ((agg.onp ?? 0) / total) * 100;
  }, [scenario]);

  const resolvedOnpDemo = useMemo(
    () => resolveOnpDemographic(statewideOnpPct, scenario.onpDemographic, demoStats),
    [statewideOnpPct, scenario.onpDemographic, demoStats],
  );

  // Chamber-aggregate primaries — drives the pp each automatic swing slider
  // is shown absorbing.
  const aggregatedPrimaries = useMemo<Record<PartyId, number>>(() => {
    const out: Record<PartyId, number> = {};
    for (const seat of seats) {
      for (const [k, v] of Object.entries(seat.primaries)) {
        out[k] = (out[k] ?? 0) + v;
      }
    }
    return out;
  }, []);

  return (
    <Demo
      title="Swing Panels"
      description={
        <>
          Interactive primary-swing sliders with auto/manual redistribution, an
          editable preference-flow matrix, and a demographic-skew panel whose
          weighted average tracks the One Nation swing. Drag a slider — the
          automatic (hollow) sliders move to absorb it and totals stay
          conserved. Backed by the full wallofadvantage scenario engine over the
          VIC 2022 lower-house dataset.
        </>
      }
      maxWidth={520}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <SwingPanel
          scenario={scenario}
          dispatch={dispatch}
          parties={parties}
          partyOrder={partyUniverse}
          aggregatedPrimaries={aggregatedPrimaries}
          flows={flows}
        />
        <DemographicSkewPanel
          scenario={scenario}
          resolvedOnpDemo={resolvedOnpDemo}
          statewideOnpPct={statewideOnpPct}
          demoStats={demoStats}
          dispatch={dispatch}
        />
      </div>
    </Demo>
  );
}
