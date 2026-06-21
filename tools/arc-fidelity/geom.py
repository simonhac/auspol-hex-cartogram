import numpy as np, json
from scipy.optimize import minimize

def kmeans1d(v, k, iters=100):
    v=np.sort(v); c=np.quantile(v, np.linspace(0,1,k))
    for _ in range(iters):
        d=np.abs(v[:,None]-c[None,:]); a=d.argmin(1)
        nc=np.array([v[a==j].mean() if np.any(a==j) else c[j] for j in range(k)])
        if np.allclose(nc,c): break
        c=nc
    inertia=((v-c[a])**2).sum()
    return c,a,inertia

def fit_center(X,Y,k=8):
    cx0=X.mean(); cy0=Y.max()
    def cost(p):
        cx,cy=p
        rho=np.sqrt((X-cx)**2+(Y-cy)**2)
        _,_,inertia=kmeans1d(rho,k)
        return inertia
    res=minimize(cost,[cx0,cy0],method="Nelder-Mead",
                 options=dict(xatol=0.05,fatol=0.5,maxiter=2000))
    return res.x

def analyze(path, k=8):
    d=json.load(open(path))
    X=np.array([p['x'] for p in d]); Y=np.array([p['y'] for p in d]); R=np.array([p['r'] for p in d])
    cx,cy=fit_center(X,Y,k)
    rho=np.sqrt((X-cx)**2+(Y-cy)**2)
    centers,assign,_=kmeans1d(rho,k)
    order=np.argsort(centers); ring_of={old:new for new,old in enumerate(order)}
    ring=np.array([ring_of[a] for a in assign])
    Rout=centers[order[-1]]
    print(f"cx={cx:.1f} cy={cy:.1f} Rout={Rout:.1f} dotR={np.median(R):.2f} dotR/Rout={np.median(R)/Rout:.4f}")
    print(f"{k} rings (inner->outer):")
    print("ring  n   radius  r/Rout  angMin angMax  loDot_y-cy(/dotR)")
    rows=[]
    for ri in range(k):
        m=ring==ri; n=m.sum(); rr=rho[m].mean()
        ang=np.degrees(np.arctan2(cy-Y[m], X[m]-cx))
        loy=Y[m].max(); off=(loy-cy)/np.median(R)
        rows.append(dict(n=int(n), r=float(rr), r_ratio=float(rr/Rout)))
        print(f"{ri:3d}  {n:2d}  {rr:6.1f}  {rr/Rout:.3f}  {ang.min():6.1f} {ang.max():6.1f}   {off:+.2f}")
    return dict(cx=float(cx),cy=float(cy),Rout=float(Rout),dotR=float(np.median(R)),rows=rows)

if __name__=="__main__":
    import sys
    info=analyze("ref_dots.json", int(sys.argv[1]) if len(sys.argv)>1 else 8)
    json.dump(info, open("ref_geom.json","w"), indent=2)
