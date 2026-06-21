"""Geometry fitting + structure extraction for hemicycle dot layouts.

Reverse-engineers the reference chart and compares it against our algorithm's
output. See README.md in this folder.
"""
import numpy as np, json

def split_by_sizes(rho, sizes):
    """Assign dots to rings (inner->outer) given known ring sizes, by sorted rho."""
    order = np.argsort(rho)
    ring = np.empty(len(rho), int); s = 0
    for ri, n in enumerate(sizes):
        ring[order[s:s + n]] = ri; s += n
    return ring

def ring_variance(X, Y, cx, cy, sizes):
    rho = np.hypot(X - cx, Y - cy)
    ring = split_by_sizes(rho, sizes)
    var = 0.0
    for ri in range(len(sizes)):
        m = ring == ri
        var += ((rho[m] - rho[m].mean()) ** 2).sum()
    return var

def fit_center(X, Y, sizes):
    """1-D coordinate descent with known ring sizes (robust, no degeneracy)."""
    cx = (X.min() + X.max()) / 2
    cy = (Y[X.argmin()] + Y[X.argmax()]) / 2   # baseline through the end-dots
    span = X.max() - X.min()
    for rng in (span * 0.1, span * 0.02, span * 0.005):
        for _ in range(3):
            ys = np.linspace(cy - rng, cy + rng, 61)
            cy = min(ys, key=lambda v: ring_variance(X, Y, cx, v, sizes))
            xs = np.linspace(cx - rng, cx + rng, 61)
            cx = min(xs, key=lambda v: ring_variance(X, Y, v, cy, sizes))
    return cx, cy

def describe(dots, sizes):
    X = np.array([d['x'] for d in dots]); Y = np.array([d['y'] for d in dots])
    Rd = np.median([d['r'] for d in dots])
    cx, cy = fit_center(X, Y, sizes)
    rho = np.hypot(X - cx, Y - cy)
    ring = split_by_sizes(rho, sizes)
    Rout = rho[ring == len(sizes) - 1].mean()
    rows = []
    for ri in range(len(sizes)):
        m = ring == ri
        ang = np.degrees(np.arctan2(cy - Y[m], X[m] - cx))
        ang_sorted = np.sort(ang)[::-1]
        margins = [180 - ang_sorted[0], ang_sorted[-1]]
        rows.append(dict(n=int(m.sum()), radius=float(rho[m].mean()),
                         r_ratio=float(rho[m].mean() / Rout),
                         end_margin_deg=float(np.mean(margins)),
                         rho_spread=float(rho[m].max() - rho[m].min())))
    return dict(cx=float(cx), cy=float(cy), Rout=float(Rout), dotR=float(Rd),
                dotR_ratio=float(Rd / Rout), n=len(dots), rows=rows)

SIZES = [4, 8, 13, 17, 21, 25, 29, 33]

if __name__ == "__main__":
    info = describe(json.load(open("ref_dots.json")), SIZES)
    json.dump(info, open("ref_geom.json", "w"), indent=2)
    print(f"center=({info['cx']:.1f},{info['cy']:.1f})  Rout={info['Rout']:.1f}"
          f"  dotR={info['dotR']:.2f}  dotR/Rout={info['dotR_ratio']:.4f}")
    print("baseline-to-center offset (px):", round(info['cy'] - 541.1, 1))
    print("row  n   radius  r/Rout  end_margin°  rho_spread")
    for i, r in enumerate(info['rows']):
        print(f"{i:2d}  {r['n']:2d}  {r['radius']:6.1f}  {r['r_ratio']:.3f}    {r['end_margin_deg']:4.1f}"
              f"        {r['rho_spread']:.1f}")
