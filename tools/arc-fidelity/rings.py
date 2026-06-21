import numpy as np, json
d=json.load(open("ref_dots.json"))
X=np.array([p['x'] for p in d]); Y=np.array([p['y'] for p in d]); R=np.array([p['r'] for p in d])
li=X.argmin(); ri=X.argmax()
cx=(X[li]+X[ri])/2; cy=(Y[li]+Y[ri])/2; Rout=(X[ri]-X[li])/2
rho=np.sqrt((X-cx)**2+(Y-cy)**2)
# assign rings by sorted-gap
s_idx=np.argsort(rho); rs=rho[s_idx]; gaps=np.diff(rs)
splits=np.where(gaps>8)[0]; rings=[]; start=0
for sp in list(splits)+[len(rs)-1]:
    rings.append(s_idx[start:sp+1]); start=sp+1
print(f"center cx={cx:.1f} cy={cy:.1f} Rout={Rout:.1f}; {len(rings)} rings")
for ri_,ring in enumerate(rings[:4]):
    print(f"\n--- ring {ri_}  n={len(ring)} ---")
    ang=np.degrees(np.arctan2(cy-Y[ring], X[ring]-cx))
    o=np.argsort(-ang)  # left(180)->right(0)
    for k in o:
        gi=ring[k]
        print(f"  ang={ang[k]:6.1f}  rho={rho[gi]:6.1f}  x-cx={X[gi]-cx:+6.1f}  cy-y={cy-Y[gi]:+6.1f}  (cy-y)/dotR={(cy-Y[gi])/np.median(R):+.2f}")
