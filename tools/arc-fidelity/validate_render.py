"""End-to-end (bitmap vs bitmap) validation: detect dots in our rendered PNG and
in the reference, then compare. This exercises the REAL rendered output, not the
analytical model."""
import numpy as np, json
from PIL import Image, ImageDraw
import detect, fidelity
from compare import fit_similarity

REF_IMG = "reference.png"
OUR_IMG = "our_render.png"
SIZES = fidelity.SIZES

def ranked(dots):
    X=np.array([d['x'] for d in dots]); Y=np.array([d['y'] for d in dots])
    cx,cy=fidelity.fit_center(X,Y,SIZES)
    rho=np.hypot(X-cx,Y-cy); ring=fidelity.split_by_sizes(rho,SIZES)
    Rout=rho[ring==len(SIZES)-1].mean(); dotR=np.median([d['r'] for d in dots])
    out={}
    for ri in range(len(SIZES)):
        m=np.where(ring==ri)[0]
        ang=np.degrees(np.arctan2(cy-Y[m],X[m]-cx))
        for rank,idx in enumerate(m[np.argsort(-ang)]): out[(ri,rank)]=(X[idx],Y[idx])
    return out, dict(cx=cx,cy=cy,Rout=Rout,dotR=dotR)

# detect both (find arc band automatically for our render)
ref = detect.detect_dots(REF_IMG, 150, 595)
our_full = Image.open(OUR_IMG).convert("RGB"); 
# our arc sits in the upper area; detect across a generous band then keep the 150 dot-sized blobs
our = detect.detect_dots(OUR_IMG, 120, 760)
print(f"detected: reference={len(ref)} dots, our_render={len(our)} dots")

refmap,rg = ranked(ref); ourmap,og = ranked(our)
keys=[k for k in refmap if k in ourmap]
P=np.array([(ourmap[k][0],-ourmap[k][1]) for k in keys])
Q=np.array([(refmap[k][0],-refmap[k][1]) for k in keys])
s,t=fit_similarity(P,Q); Pt=s*P+t
resid=np.hypot(*(Pt-Q).T)
rms=np.sqrt((resid**2).mean())/rg['Rout']*100; mx=resid.max()/rg['Rout']*100
dotR_err=(s*og['dotR']-rg['dotR'])/rg['dotR']*100
print(f"BITMAP-vs-BITMAP  matched {len(keys)}/150  RMS={rms:.2f}%  max={mx:.2f}%  dotR_err={dotR_err:+.1f}%")
json.dump(our, open("our_dots.json","w"))
