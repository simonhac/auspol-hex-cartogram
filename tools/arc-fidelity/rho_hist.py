import numpy as np, json
d=json.load(open("ref_dots.json"))
X=np.array([p['x'] for p in d]); Y=np.array([p['y'] for p in d]); R=np.array([p['r'] for p in d])
li=X.argmin(); ri=X.argmax()
cx=(X[li]+X[ri])/2; cy=(Y[li]+Y[ri])/2; Rout=(X[ri]-X[li])/2
print(f"end-dot center: cx={cx:.1f} cy={cy:.1f} Rout={Rout:.1f}")
print(f"left end dot  ({X[li]:.0f},{Y[li]:.0f})  right end dot ({X[ri]:.0f},{Y[ri]:.0f})")
rho=np.sqrt((X-cx)**2+(Y-cy)**2)
print("\nsorted rho (and r/Rout):")
s=np.sort(rho)
# print in groups, show gaps
prev=None
for v in s:
    tag=""
    if prev is not None and v-prev>8: tag=" <== gap"
    print(f"  {v:6.1f}  {v/Rout:.3f}{tag}")
    prev=v
