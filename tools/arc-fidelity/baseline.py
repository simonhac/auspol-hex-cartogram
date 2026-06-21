import numpy as np, json
from PIL import Image, ImageDraw
import fidelity
dots=json.load(open("ref_dots.json"))
X=np.array([d['x'] for d in dots]); Y=np.array([d['y'] for d in dots]); R=np.median([d['r'] for d in dots])
cx,cy=fidelity.fit_center(X,Y,fidelity.SIZES)
rho=np.hypot(X-cx,Y-cy); ring=fidelity.split_by_sizes(rho,fidelity.SIZES)
# baseline = bottom of the lowest dots (outer-row end dots), i.e. max dot-center y + R
base_y = Y.max()
print(f"center=({cx:.1f},{cy:.1f})  baseline_y(lowest dot center)={base_y:.1f}")
print("row  n  end_margin_deg  lowest_dot_y  gap_above_baseline(px)  gap/dotDia")
for ri in range(8):
    m=ring==ri; ymax=Y[m].max()
    ang=np.degrees(np.arctan2(cy-Y[m],X[m]-cx)); margin=min(180-ang.max(),ang.min())
    gap=base_y-ymax
    print(f"{ri:2d} {m.sum():2d}   {90/ fidelity.SIZES[ri]:5.1f}        {ymax:6.1f}      {gap:6.1f}              {gap/(2*R):.2f}")
# annotate
img=Image.open(fidelity.SIZES and "reference.png").convert("RGB")
dr=ImageDraw.Draw(img)
dr.line([40,base_y,900,base_y],fill=(255,0,0),width=2)          # baseline
for ri in (0,1):                                                 # inner two rows: mark lowest dots
    m=np.where(ring==ri)[0]
    for idx in m[np.argsort(-X[m])][:1]+0:
        pass
    for idx in [m[X[m].argmin()], m[X[m].argmax()]]:
        x,y=X[idx],Y[idx]
        dr.line([x,y,x,base_y],fill=(0,128,0),width=2)
        dr.ellipse([x-R,y-R,x+R,y+R],outline=(0,128,0),width=3)
dr.text((44,base_y+4),"baseline (outer rows sit here)",fill=(255,0,0))
img.save("ref_baseline.png")
print("saved ref_baseline.png")
