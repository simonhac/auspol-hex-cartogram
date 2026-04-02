# Australian Federal Electorate Hex Cartogram

Equal-area hex maps for Australian federal House of Representatives electorates, covering the 2019, 2022, and 2025 elections.

Each electorate is represented as a single hexagon on a unified grid. The layout approximates Australia's geography while giving every electorate exactly the same visual weight — unlike geographic maps where outback electorates dwarf inner-city ones.

Inspired by the [ABC News federal election hex map](https://www.abc.net.au/news/elections/federal-redistribution-2024/), which pioneered the equal-area hex cartogram format for Australian elections.

## Install

```bash
npm install auspol-hex-cartogram
```

## Quick start (React)

```tsx
import { FED_2025 } from "auspol-hex-cartogram";
import { Cartogram } from "auspol-hex-cartogram/react";

function App() {
  return (
    <Cartogram
      election={FED_2025}
      fill={(e) => e.state === "VIC" ? "#1D4ED8" : "#6B7280"}
      onElectorateClick={(e) => console.log(e.name)}
    />
  );
}
```

## Quick start (vanilla JS)

```javascript
import { FED_2022, HEX_SIZE, hexPoints, computeStateBorders } from "auspol-hex-cartogram";

const { electorates } = FED_2022; // 151 electorates

for (const e of electorates) {
  // e.name = "Kooyong", e.state = "VIC", e.col = 6, e.row = 13
  // e.px, e.py = pre-computed pixel coordinates for SVG rendering
  const points = hexPoints(e.px, e.py, HEX_SIZE);
  // → SVG polygon points string
}

// SVG path string for state boundary lines
const borderPath = computeStateBorders(electorates, HEX_SIZE);
```

Or load the raw JSON directly:

```javascript
import data from "auspol-hex-cartogram/data/elections.json";
const grid = data["2025-FED"].grid; // [[col, row, state, name], ...]
```

## Data format

All election data lives in `data/elections.json`. Each entry is a `[col, row, state, name]` tuple:

```json
[6, 13, "VIC", "Kooyong"]
```

The grid uses **pointy-top hexagons with odd-row offset**:

```
px = √3 × size × (col + 0.5 × (row & 1))
py = 1.5 × size × row
```

where `size = 14` pixels. Grid bounds: col 0–13, row 0–18.

## API reference

### Types

| Type | Description |
|------|-------------|
| `GridEntry` | Raw tuple: `[col, row, state, name]` |
| `Electorate` | Resolved object: `{ code, name, state, seatId, col, row, px, py }` |
| `ElectionMap` | Dataset: `{ electionId, label, seatCount, grid, electorates }` |

### Functions

| Function | Description |
|----------|-------------|
| `cellToPixel(col, row)` | Grid coords → `{ x, y }` pixel centre |
| `hexPoints(cx, cy, size)` | Pixel centre → SVG polygon points string |
| `computeStateBorders(hexes, size)` | Array of electorates → SVG `d` path for state borders |
| `resolveGrid(grid)` | Raw `GridEntry[]` → `Electorate[]` with computed pixels |
| `nameToSeatId(name)` | `"Kingsford Smith"` → `"KINGSFORDSMITH"` |

### Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `HEX_SIZE` | `14` | Default hex radius in pixels |
| `STATE_HEX_COLORS` | `Record<string, string>` | State → CSS colour map |

### Election datasets

| Export | Election | Seats |
|--------|----------|-------|
| `FED_2019` | 2019 Federal | 151 |
| `FED_2022` | 2022 Federal | 151 |
| `FED_2025` | 2025 Federal | 150 |

### React components

Import from `auspol-hex-cartogram/react`:

**`<Cartogram>`** — full SVG map with state borders and hover effects.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `election` | `ElectionMap` | `FED_2022` | Which election to render |
| `fill` | `(e: Electorate) => string` | State colours | Colour callback per electorate |
| `tooltip` | `(e: Electorate) => string` | `"Name (STATE)"` | Tooltip text callback |
| `onElectorateClick` | `(e: Electorate) => void` | — | Click handler |
| `showBorders` | `boolean` | `true` | Show state border lines |
| `hexSize` | `number` | `14` | Hex radius in pixels |
| `style` | `CSSProperties` | — | SVG inline styles |
| `className` | `string` | — | SVG class name |

**`<ElectorateCell>`** — single hex polygon with native SVG tooltip.

## Elections

| Election | Seats | Changes from previous |
|----------|-------|-----------------------|
| 2019 Federal | 151 | Baseline (derived backward from 2022) |
| 2022 Federal | 151 | +Hawke (VIC), −Stirling (WA) |
| 2025 Federal | 150 | −North Sydney (NSW), −Higgins (VIC), +Bullwinkel (WA) |

### Silhouette changes

**2019 → 2022**: VIC gains cell `[5,13]` for Hawke. WA loses cell `[0,8]` (Stirling abolished). All 150 surviving electorates keep their positions.

**2022 → 2025**: NSW loses `[13,9]` (North Sydney abolished). VIC loses `[8,15]` (Goldstein shifts to `[8,14]` to fill Higgins's vacated cell). WA gains `[0,8]` (Moore shifts from `[1,8]` to `[0,8]`; Bullwinkel takes `[1,8]`). 147 surviving electorates stay put; 2 forced moves.

## How the coordinates were derived

### 2022: hand-crafted baseline

The 2022 positions were manually placed to match the [ABC News equal-area election cartogram](https://www.abc.net.au/news/elections/federal-redistribution-2024/). Each electorate was positioned by hand on the hex grid to approximate its geographic location within Australia.

This is the canonical reference layout. All other elections are derived from it.

### 2019 and 2025: stability-first derivation

When electorates are added or removed between elections, we use a **stability-first** approach:

1. Start from the 2022 baseline positions.
2. **Abolished electorates**: remove the electorate and its cell from the silhouette (or free it for a neighbour).
3. **New electorates**: place on a new cell added to the state's region, or on a cell vacated in step 2.
4. **All surviving electorates keep their 2022 position.**

This produces minimal visual disruption between elections — critical for comparing results across years.

| Transition | Stayed | Moved | New | Removed |
|------------|--------|-------|-----|---------|
| 2019 → 2022 | 150 | **0** | 1 (Hawke) | 1 (Stirling) |
| 2022 → 2025 | 147 | **2** | 1 (Bullwinkel) | 2 (Higgins, North Sydney) |

## Why not the Hungarian algorithm?

We investigated using the [Hungarian algorithm](https://en.wikipedia.org/wiki/Hungarian_algorithm) to optimally assign electorates to hex cells based on geographic centroids. The results were instructive:

### Geographic accuracy: Hungarian wins slightly

| Metric | Hand-crafted | Hungarian | Difference |
|--------|-------------|-----------|------------|
| RMS positional error | 69.2 px | 61.5 px | +12.5% |
| Mean error | 58.1 px | 52.3 px | +11.1% |
| Max error | 201.5 px | 143.4 px | +40.6% |

The hand-crafted layout is ~12% worse on average — roughly 0.3 hex-widths per electorate. For a cartogram that inherently distorts geography (an electorate covering half of Western Australia is the same size as one covering 3 km² of inner Melbourne), this is a reasonable trade-off.

### Stability: Hungarian fails catastrophically

When run independently per election, the Hungarian algorithm produced **113 unnecessary moves** between 2019 and 2022 — reshuffling nearly every electorate even though only 2 seats changed.

| Transition | Stability-first | Hungarian |
|------------|----------------|-----------|
| 2019 → 2022 moves | **0** | 113 |
| Unnecessary moves | **0** | **112** |

This happens because the algorithm optimises each election in isolation. A tiny shift in centroid positions cascades into swaps across entire states.

### Our decision

**Stability over optimality.** The 12% geographic error is acceptable. The 113-electorate disruption is not. Users comparing election results across years need electorates in predictable positions.

The Hungarian algorithm remains useful for validation (checking the hand-crafted layout isn't wildly wrong) and for initial placement of new electorates. But for cross-election consistency, stability-first wins.

## Differences from the ABC

Our 2022 baseline was placed to match the ABC's hex map. To our knowledge, the coordinates are identical for the 2022 election. The ABC has not (to our knowledge) published hex maps for 2019 or 2025, so those are our own derivation using the stability-first method.

## Adding a new election

After a federal redistribution:

1. Identify added, removed, and renamed electorates.
2. For each state that gained/lost seats, decide which cells to add/remove from the silhouette.
3. Apply the stability-first rule: surviving electorates keep their positions.
4. For forced moves, prefer adjacent cells. Use Hungarian within the affected state if there are many.
5. Add the new election to `data/elections.json`.
6. Run tests: `npm test`

## Examples

- `examples/vanilla.html` — simple interactive cartogram with election switcher
- `examples/analysis.html` — transition analysis showing movements, geographic error, and state seat counts

## License

MIT
