"""Compare our algorithm's dot layout against the reference chart.

Matches dots one-to-one by (row, left->right rank), finds the best-fit
similarity transform (uniform scale + translation, no rotation), and reports the
residual as an RMS error in % of the outer radius. Also renders an overlay PNG
(reference image + our dots as outlines + error vectors) for visual inspection.
"""
import numpy as np, json
from PIL import Image, ImageDraw, ImageFont
import fidelity
from layout import compute_layout

REF_IMG = "reference.png"
SIZES = fidelity.SIZES

def ref_dots_with_rank():
    dots = json.load(open("ref_dots.json"))
    X = np.array([d['x'] for d in dots]); Y = np.array([d['y'] for d in dots])
    cx, cy = fidelity.fit_center(X, Y, SIZES)
    rho = np.hypot(X - cx, Y - cy)
    ring = fidelity.split_by_sizes(rho, SIZES)
    Rout = rho[ring == len(SIZES) - 1].mean()
    out = {}
    for ri in range(len(SIZES)):
        m = np.where(ring == ri)[0]
        ang = np.degrees(np.arctan2(cy - Y[m], X[m] - cx))
        for rank, idx in enumerate(m[np.argsort(-ang)]):
            out[(ri, rank)] = (X[idx], Y[idx])
    dotR = np.median([d['r'] for d in dots])
    return out, dict(cx=cx, cy=cy, Rout=Rout, dotR=dotR)

def fit_similarity(P, Q):
    """min over s,t of |s*P + t - Q|^2 (uniform scale, translation; no rotation)."""
    P = np.asarray(P, float); Q = np.asarray(Q, float)
    Pm = P.mean(0); Qm = Q.mean(0)
    s = ((P - Pm) * (Q - Qm)).sum() / ((P - Pm) ** 2).sum()
    t = Qm - s * Pm
    return s, t

def compare(params, label, draw=True):
    refmap, geo = ref_dots_with_rank()
    L = compute_layout(150, **params)
    ours = {}
    for d in L['dots']:
        ours.setdefault(d['row'], []).append(d)
    our_map = {}
    for row, ds in ours.items():
        for rank, d in enumerate(sorted(ds, key=lambda d: -d['angle'])):
            our_map[(row, rank)] = d

    keys = [k for k in refmap if k in our_map]
    P = np.array([(our_map[k]['x'], -our_map[k]['y']) for k in keys])   # y-up
    Q = np.array([(refmap[k][0], -refmap[k][1]) for k in keys])          # y-up
    s, t = fit_similarity(P, Q)
    Pt = s * P + t
    resid = np.hypot(*(Pt - Q).T)
    rms = np.sqrt((resid ** 2).mean()); mx = resid.max()
    our_dotR = s * L['seat_r']
    rms_pct = rms / geo['Rout'] * 100; mx_pct = mx / geo['Rout'] * 100
    dotR_err = (our_dotR - geo['dotR']) / geo['dotR'] * 100

    # per-row mean residual (px in ref space)
    perrow = {}
    for k, r in zip(keys, resid):
        perrow.setdefault(k[0], []).append(r)
    print(f"[{label}] matched {len(keys)}/150  RMS={rms_pct:.2f}%  max={mx_pct:.2f}%"
          f"  dotR_err={dotR_err:+.1f}%  (scale={s:.3f})")
    print("   per-row mean resid (px): " +
          " ".join(f"r{ri}:{np.mean(perrow[ri]):.1f}" for ri in sorted(perrow)))

    if draw:
        img = Image.open(REF_IMG).convert("RGB")
        dr = ImageDraw.Draw(img)
        for k in keys:
            qx, qy = refmap[k]
            px, py = Pt[np.array(keys) == k][0] if False else (s*our_map[k]['x']+t[0], -(s*(-our_map[k]['y'])+t[1]))
        # redo cleanly
        for i, k in enumerate(keys):
            qx, qy = refmap[k]
            ptx, pty = Pt[i][0], -Pt[i][1]           # back to image coords
            dr.line([qx, qy, ptx, pty], fill=(0, 0, 0), width=1)
            r = our_dotR
            dr.ellipse([ptx-r, pty-r, ptx+r, pty+r], outline=(0, 200, 255), width=2)
            dr.ellipse([qx-2, qy-2, qx+2, qy+2], fill=(255, 0, 255))
        cap = f"{label}   RMS {rms_pct:.2f}%   max {mx_pct:.2f}%   dotR {dotR_err:+.1f}%"
        dr.rectangle([0, 0, img.width, 26], fill=(255, 255, 255))
        dr.text((8, 6), cap + "    (magenta=reference center, cyan=ours)", fill=(0, 0, 0))
        img.save(f"out_{label}.png")
    return dict(rms_pct=rms_pct, mx_pct=mx_pct, dotR_err=dotR_err)

if __name__ == "__main__":
    # "before": the first cut (inner 0.14, proportional fill, smaller dots)
    compare(dict(inner_ratio=0.14, seat_ratio=0.42, count_mode="prop_radius"), "cycle0")
    # "after": the shipped, reference-matched parameters
    compare(dict(inner_ratio=0.229, seat_ratio=0.48, count_mode="linear"), "final")
