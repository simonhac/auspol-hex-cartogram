// Chamber-aggregate primary tallies. Ported from the open-tally-room
// engine (`@tally` aggregate.ts), trimmed to the lower-house (LA) path the
// panels use — the upper-house `aggregateLcPrimaries` needs the LC region
// types and is omitted.

import { applySwingForSeat } from "./scenario";
import type { Demographic, PartyId, ScenarioState, SeatBaseline } from "./types";

// Map raw primary keys to the display buckets used in charts/tallies.
// coa → lib (joint-LNP ticket folded into Liberal) by default; with
// `groupCoalition` true, both lib and nat fold into coa so the chart
// shows a single Coalition row. ind_<anything> → ind when bucketIndies
// is true; with bucketIndies false, ind_country and ind_teal pass
// through as themselves (the funding table shows them as separate rows).
export function bucketParty(
  id: PartyId,
  opts: { bucketIndies?: boolean; groupCoalition?: boolean } = {},
): PartyId {
  const { bucketIndies = true, groupCoalition = false } = opts;
  if (groupCoalition && (id === "lib" || id === "nat" || id === "coa"))
    return "coa";
  if (id === "coa") return "lib";
  if (bucketIndies && id.startsWith("ind_")) return "ind";
  return id;
}

export interface AggregateOptions {
  bucketIndies?: boolean;
  // Fold lib + nat into a single `coa` row.
  groupCoalition?: boolean;
  // When supplied, ON's per-seat share is set to this value for each
  // seat's demographic (instead of receiving the uniform `manualSwings.onp`
  // swing). Seats without a `demographic` keep the uniform behaviour.
  resolvedOnpDemo?: Record<Demographic, number>;
  // Pre-computed per-seat primaries (seatId → primaries). When present, a
  // seat's row is summed directly instead of recomputing the per-seat
  // swing — so an external aggregate and the seat count share one source
  // of truth.
  rakedPrimaries?: Map<string, Record<PartyId, number>>;
}

export function aggregateLaPrimaries(
  seats: SeatBaseline[],
  scenario?: ScenarioState,
  opts: AggregateOptions = {},
): Record<PartyId, number> {
  const out: Record<PartyId, number> = {};
  for (const seat of seats) {
    const prim =
      opts.rakedPrimaries?.get(seat.id) ??
      (scenario
        ? applySwingForSeat(seat, scenario.manualSwings, opts.resolvedOnpDemo)
        : seat.primaries);
    for (const [k, v] of Object.entries(prim)) {
      const key = bucketParty(k, opts);
      out[key] = (out[key] ?? 0) + v;
    }
  }
  return out;
}
