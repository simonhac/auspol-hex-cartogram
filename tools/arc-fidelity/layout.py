"""Python port of computeArcLayout (src/arc-utils.ts) with extra knobs, used to
search for the parameters that best match the reference. The winning parameters
were ported back into the TypeScript source, so the defaults here mirror the
shipped algorithm (inner_ratio=0.229, seat_ratio=0.48, count_mode="linear").

Knobs:
  inner_ratio        inner row radius / outer row radius (display radii)
  seat_ratio         dot radius / min(spacing)            (dot size)
  count_mode         "linear"     -> counts proportional to (row index + 1)
                     "prop_radius"-> counts proportional to row radius
  count_inner_ratio  for count_mode="prop_radius", inner ratio used ONLY for the
                     seats-per-row split; if None, uses inner_ratio
"""
import numpy as np

def largest_remainder(total, weights):
    w = np.asarray(weights, float); raw = total * w / w.sum()
    base = np.floor(raw).astype(int); rem = total - base.sum()
    for i in np.argsort(-(raw - base))[:rem]:
        base[i] += 1
    return base

def auto_rows(total, f):
    k = 2 * (1 - f) / (np.pi * (1 + f))
    return max(1, round(np.sqrt(total * k)))

def compute_layout(total, inner_ratio=0.229, seat_ratio=0.48, outer=250.0,
                   rows=None, count_inner_ratio=None, count_mode="linear"):
    if rows is None:
        rows = auto_rows(total, inner_ratio)
    rows = min(rows, total)
    inner = inner_ratio * outer
    radii = (np.array([(inner + (outer - inner) * i / (rows - 1)) for i in range(rows)])
             if rows > 1 else np.array([(inner + outer) / 2]))
    # seats-per-row split (optionally decoupled from display radii)
    if count_mode == "linear":
        weights = np.arange(1, rows + 1, dtype=float)          # counts proportional to (row index + 1)
    else:
        cf = inner_ratio if count_inner_ratio is None else count_inner_ratio
        weights = (np.array([(cf + (1 - cf) * i / (rows - 1)) for i in range(rows)])
                   if rows > 1 else np.array([1.0]))
    per_row = largest_remainder(total, weights)
    while rows > 1 and (per_row == 0).any():
        rows -= 1
        return compute_layout(total, inner_ratio, seat_ratio, outer, rows, count_inner_ratio, count_mode)
    dots = []
    for r in range(rows):
        n = int(per_row[r]); rad = radii[r]
        for j in range(n):
            frac = 0.5 if n == 1 else (j + 0.5) / n
            ang = np.pi * (1 - frac)
            dots.append(dict(row=r, rank=j, angle=ang,
                             x=rad * np.cos(ang), y=-rad * np.sin(ang)))
    radial = (outer - inner) if rows == 1 else (outer - inner) / (rows - 1)
    arc = [np.pi * radii[i] / per_row[i] if per_row[i] else np.inf for i in range(rows)]
    seat_r = seat_ratio * min(radial, *arc)
    return dict(dots=dots, seat_r=float(seat_r), outer=float(outer),
                per_row=[int(x) for x in per_row], rows=rows)
