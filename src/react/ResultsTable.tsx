import type { Party } from "../types";

/** A named numeric column of per-party values, aligned to the `parties` array. */
export interface ResultsColumn {
  /** Column header, e.g. "2025" or "Predicted". */
  header: string;
  /** One value per party, in the same order as `parties`. */
  values: number[];
}

export interface ResultsTableProps {
  /** Parties in display order, providing name, colour and (default) seat count. */
  parties: Party[];
  /**
   * Numeric columns to show. Defaults to a single "Seats" column taken from
   * each party's `seats`. Provide multiple for comparisons (e.g. 2025 vs
   * Predicted).
   */
  columns?: ResultsColumn[];
  /**
   * Render a "Change" column equal to `columns[b] − columns[a]` for the given
   * `[a, b]` column indices, with ▲ / ▼ indicators.
   */
  changeBetween?: [number, number];
  /** Header for the first (party) column. Default "Party". */
  partyHeader?: string;
  /** Header for the change column. Default "Change". */
  changeHeader?: string;
  /** Colour for positive changes. Default "#16a34a". */
  positiveColor?: string;
  /** Colour for negative changes. Default "#dc2626". */
  negativeColor?: string;
  /** Called when a party row is clicked. */
  onPartyClick?: (party: Party, index: number) => void;
  /** Additional table style. */
  style?: React.CSSProperties;
  /** Additional table className. */
  className?: string;
}

/**
 * A results / legend table for a set of parties: a colour swatch and name per
 * party, one or more numeric columns, and an optional ▲/▼ change column.
 *
 * Theme-agnostic: structural styles only. Target the `parliament-results-table`
 * class (and its `<th>` / `<td>`) from your own CSS to colour and space it.
 */
export function ResultsTable({
  parties,
  columns,
  changeBetween,
  partyHeader = "Party",
  changeHeader = "Change",
  positiveColor = "#16a34a",
  negativeColor = "#dc2626",
  onPartyClick,
  style,
  className,
}: ResultsTableProps) {
  const cols: ResultsColumn[] =
    columns ?? [{ header: "Seats", values: parties.map((p) => Math.max(0, Math.floor(p.seats))) }];

  const numStyle: React.CSSProperties = {
    textAlign: "right",
    fontVariantNumeric: "tabular-nums",
  };

  return (
    <table
      className={["parliament-results-table", className].filter(Boolean).join(" ")}
      style={style}
    >
      <thead>
        <tr>
          <th style={{ textAlign: "left" }}>{partyHeader}</th>
          {cols.map((col) => (
            <th key={col.header} style={numStyle}>
              {col.header}
            </th>
          ))}
          {changeBetween && <th style={numStyle}>{changeHeader}</th>}
        </tr>
      </thead>
      <tbody>
        {parties.map((party, i) => {
          const change = changeBetween
            ? cols[changeBetween[1]].values[i] - cols[changeBetween[0]].values[i]
            : null;
          return (
            <tr
              key={party.id ?? party.name}
              onClick={onPartyClick ? () => onPartyClick(party, i) : undefined}
              style={{ cursor: onPartyClick ? "pointer" : undefined }}
            >
              <td>
                <span
                  className="party-swatch"
                  style={{
                    display: "inline-block",
                    width: "0.7em",
                    height: "0.7em",
                    borderRadius: "50%",
                    background: party.color,
                    marginRight: "0.5em",
                    verticalAlign: "baseline",
                  }}
                />
                {party.name}
              </td>
              {cols.map((col) => (
                <td key={col.header} style={numStyle}>
                  {col.values[i]}
                </td>
              ))}
              {change !== null && (
                <td
                  style={{
                    ...numStyle,
                    color:
                      change > 0 ? positiveColor : change < 0 ? negativeColor : undefined,
                  }}
                >
                  {change === 0 ? "—" : `${change > 0 ? "▲" : "▼"} ${change > 0 ? "+" : "−"}${Math.abs(change)}`}
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
