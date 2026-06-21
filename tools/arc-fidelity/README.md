# arc-fidelity — measuring our parliament arc against the reference

This is a throwaway-but-kept analysis harness used to reverse-engineer the
reference "House of Representatives composition" chart (`reference.png`) and tune
`computeArcLayout` (`../../src/arc-utils.ts`) until our dot layout matches it.

It works by **detecting the dots in an image** (centre, radius, colour), fitting
the hemicycle geometry, and comparing the reference against our algorithm's
output dot-for-dot.

## Result

Looping on the parameters drove the positional error to the detector-noise floor:

| stage | params | RMS error | max | dot size |
|------|--------|-----------|-----|----------|
| before (`cycle0`) | inner 0.14, proportional fill, ratio 0.42 | **3.21%** | 8.34% | −12.9% |
| after (`final`)   | inner 0.229, **linear** fill, ratio 0.48  | **0.02%** | 0.05% | −0.2% |

"Error" = RMS distance between matched dots after a best-fit similarity
(uniform scale + translation, no rotation), expressed as a **% of the outer
radius**. 0.02% ≈ 0.075px on a 374px-radius chart — i.e. only rounding/detection
noise remains. Confirmed both analytically and **bitmap-vs-bitmap** on the real
rendered example (`validate_render.py`).

## What the reference actually is (the model)

- **8 rows**, seat counts `[4, 8, 13, 17, 21, 25, 29, 33]` (inner→outer).
- **Distribution = linear**: counts proportional to row index (so inner rows are
  sparse, outer rows full). *Not* proportional to radius.
- **Row radii**: linear from **0.229·Rout** (inner) to Rout (outer).
- **Dot radius**: **0.046·Rout**.
- **Angular placement**: dot `j` of `n` at fraction `(j+0.5)/n` ⇒ per-row margin
  `90°/n`. This is why the inner two rows float **15px / 7px** off the baseline
  (the 4-dot row insets 22.5°). The reference does this; we reproduce it.

See `ref_baseline.png` for the baseline annotation and `out_final.png` for the
overlay of our dots (cyan) on the reference (magenta centres).

## Setup

```bash
pip install -r requirements.txt
```

## Pipeline (run in this order)

| script | what it does |
|--------|--------------|
| `detect.py`   | detect dots in an image → `*_dots.json` (`python3 detect.py reference.png 150 595 ref_dots.json`) |
| `fidelity.py` | fit the hemicycle centre/radii with the known ring sizes → `ref_geom.json` |
| `compare.py`  | generate our layout, match by (row, rank), best-fit transform, print RMS + write `out_<label>.png`. `python3 compare.py` runs the before/after cases |
| `validate_render.py` | end-to-end: detect dots in our rendered PNG (`our_render.png`) and compare to the reference (bitmap-vs-bitmap) |
| `layout.py`   | Python port of `computeArcLayout` with extra knobs; defaults mirror the shipped TS algorithm |
| `loop.py`     | convenience driver that runs a list of parameter cycles |

`our_render.png` is produced by screenshotting `examples/parliament.html`
(headless Chromium); regenerate it if the example changes.

### Exploratory scripts (kept for reference, not part of the pipeline)
`explore.py`, `geom.py`, `rho_hist.py`, `rings.py`, `analyze_ref.py`,
`baseline.py` — the dead-ends and one-off diagnostics used while working out the
model (e.g. discovering the centre sits ~18px below the end-dots, and that the
rings are `[4,8,13,17,21,25,29,33]`).

## Saved artefacts
- `reference.png` — the source screenshot (so this is reproducible offline).
- `ref_dots.json` / `our_dots.json` — recorded detections.
- `ref_geom.json` — fitted reference geometry.
- `ref_baseline.png`, `out_cycle0.png`, `out_final.png`, `our_render.png` —
  comparison images kept for posterity.
