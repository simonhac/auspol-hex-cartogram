import numpy as np, json
d = json.load(open("ref_dots.json"))
X = np.array([p['x'] for p in d]); Y = np.array([p['y'] for p in d]); R = np.array([p['r'] for p in d])

# Center x = midpoint of horizontal extent; baseline y = y of the extreme (end) dots
cx = (X.min()+X.max())/2
Rout = (X.max()-X.min())/2
# baseline: average y of the leftmost & rightmost few dots (they sit on the diameter)
order_l = np.argsort(X)[:3]; order_r = np.argsort(-X)[:3]
cy = Y[np.concatenate([order_l,order_r])].mean()
print(f"cx={cx:.1f}  cy(baseline)={cy:.1f}  Rout={Rout:.1f}  dotR={np.median(R):.2f}  dotR/Rout={np.median(R)/Rout:.4f}")

rho = np.sqrt((X-cx)**2 + (Y-cy)**2)
ang = np.degrees(np.arctan2(cy-Y, X-cx))   # 0=right,90=top,180=left

# cluster rho into rows via sorted gaps
idx = np.argsort(rho); rs = rho[idx]
gaps = np.diff(rs)
splits = np.where(gaps > 0.5*np.median(R))[0]
rows=[]; start=0
for s in list(splits)+[len(rs)-1]:
    rows.append(idx[start:s+1]); start=s+1
print(f"\n{len(rows)} rows (inner->outer):")
print("row  n   radius   r/Rout   angMin  angMax   baseY_off(lo dot)")
for ri,row in enumerate(rows):
    rr = rho[row].mean(); a_ = np.sort(ang[row])
    # lowest dot in this row = max Y; offset from baseline in dot-radii
    loy = Y[row].max(); off=(loy-cy)/np.median(R)
    print(f"{ri:2d}  {len(row):2d}  {rr:6.1f}  {rr/Rout:.3f}   {a_.min():5.1f}  {a_.max():5.1f}    {off:+.2f}")
print("\ntotal dots:", len(d))
