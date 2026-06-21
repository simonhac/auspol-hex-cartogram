"use client";

/**
 * ChamberCharts — a labelled pairing of a VotesChart (primary vote) and a
 * SeatsChart (seats won) for a single chamber.
 *
 * Decoupled port of the wallofadvantage app's ChamberCharts: the original
 * derived its rows from the `@tally` election model (aggregating primaries,
 * folding Lib+Nat into a Coalition row, etc.). That domain logic is now the
 * caller's responsibility — this component is purely presentational and takes
 * the already-built `votesParties` / `seatsParties` arrays as props.
 */

import VotesChart, { type VotesParty } from "./VotesChart";
import SeatsChart, { type SeatsParty } from "./SeatsChart";

export interface ChamberChartsProps {
  /** Primary-vote rows, already ordered/folded by the caller. */
  votesParties: VotesParty[];
  /** Seats-won rows, already ordered/folded by the caller. */
  seatsParties: SeatsParty[];
  /** Total seats in the chamber; drives the SeatsChart scale. Default 88. */
  totalSeats?: number;
  /** Override the majority line; defaults to floor(totalSeats / 2) + 1. */
  toWin?: number;
  /** Heading above the votes chart. Default "Votes". */
  votesTitle?: string;
  /** Heading above the seats chart. Default "Seats". */
  seatsTitle?: string;
  /** Optional className passthrough on the wrapper. */
  className?: string;
}

export function ChamberCharts({
  votesParties,
  seatsParties,
  totalSeats = 88,
  toWin,
  votesTitle = "Votes",
  seatsTitle = "Seats",
  className,
}: ChamberChartsProps) {
  const majority = toWin ?? Math.floor(totalSeats / 2) + 1;

  return (
    <div className={["chamber-charts", className].filter(Boolean).join(" ")}>
      <section className="seats-section-head">
        <h2>{votesTitle}</h2>
      </section>
      <VotesChart parties={votesParties} mode="fixed" />
      <section className="seats-section-head">
        <h2>{seatsTitle}</h2>
      </section>
      <SeatsChart
        parties={seatsParties}
        totalSeats={totalSeats}
        toWin={majority}
        mode="fixed"
      />
    </div>
  );
}

export default ChamberCharts;
