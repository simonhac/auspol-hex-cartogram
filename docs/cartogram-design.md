# Cartogram design notes

How the hex-cartogram coordinates are derived, why the layout is hand-crafted rather
than solved algorithmically, its relationship to the ABC's map, and how to add a new
election. For installation and usage, see the [main README](../README.md).

## Silhouette changes

**2019 → 2022**: VIC gains cell `[5,12]` for Hawke (Wannon and Corangamite shift to fill it). WA loses cell `[1,7]` (Stirling abolished). 148 surviving electorates stay put; 2 forced moves.

**2022 → 2025**: NSW loses `[13,10]` (North Sydney abolished). VIC loses `[7,16]` (Higgins abolished). WA gains `[2,11]` for Bullwinkel (Curtin, Cowan, and Perth shift to accommodate). 146 surviving electorates stay put; 3 forced moves.

## How the coordinates were derived

### 2025: canonical baseline (from ABC News)

The 2025 positions are taken directly from the [ABC News 2025 federal election hex map](https://www.abc.net.au/news/elections/federal/2025/results) (`abcnews/elections-federal2025-lower-house` on GitHub). The ABC's per-state local coordinates are combined with their COUNTRY layout state offsets to produce a unified integer grid.

This is the canonical reference layout. All other elections are derived from it.

### 2022 and 2019: stability-first derivation (backwards)

When electorates are added or removed between elections, we use a **stability-first** approach, working backwards from the 2025 baseline:

1. Start from the 2025 baseline positions.
2. **Abolished electorates** (seats that existed in the earlier election but not 2025): add them back on a new cell adjacent to their state's silhouette.
3. **New electorates** (seats that exist in 2025 but not the earlier election): remove them and their cell.
4. **Surviving electorates keep their position** unless a forced move is needed to avoid leaving a hole in the silhouette. Forced moves cascade from the hole to the nearest edge cell.

This produces minimal visual disruption between elections — critical for comparing results across years.

| Transition | Stayed | Moved | New | Removed |
|------------|--------|-------|-----|---------|
| 2019 → 2022 | 148 | **2** | 1 (Hawke) | 1 (Stirling) |
| 2022 → 2025 | 146 | **3** | 1 (Bullwinkel) | 2 (Higgins, North Sydney) |

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

## Relationship to the ABC

Our 2025 baseline is taken directly from the ABC's hex map ([source](https://github.com/abcnews/elections-federal2025-lower-house)). The coordinates are identical for the 2025 election.

The ABC also published a hex map for the [2022 election](https://www.abc.net.au/news/2022-05-20/federal-election-map-lying/101076016), but our 2022 layout differs because it is derived backwards from 2025 using stability-first (all surviving electorates keep their 2025 positions). The ABC has not published a hex map for 2019.

## Adding a new election

After a federal redistribution:

1. Identify added, removed, and renamed electorates.
2. For each state that gained/lost seats, decide which cells to add/remove from the silhouette.
3. Apply the stability-first rule: surviving electorates keep their positions.
4. For forced moves, prefer adjacent cells. Use Hungarian within the affected state if there are many.
5. Add the new election to `data/elections.json`.
6. Run tests: `npm test`
