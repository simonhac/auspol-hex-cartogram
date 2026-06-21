import numpy as np, json, sys
from PIL import Image
from scipy import ndimage

def detect_dots(path, y_lo, y_hi, white_thr=230, min_area=400, max_area=1600):
    img = Image.open(path).convert("RGB")
    a = np.asarray(img).astype(int)
    H,W,_ = a.shape
    minch = a.min(axis=2)
    nonwhite = minch < white_thr
    band = np.zeros_like(nonwhite); band[y_lo:y_hi,:] = True
    mask = nonwhite & band
    lbl, n = ndimage.label(mask)
    dots=[]; rejected=[]
    for i in range(1, n+1):
        ys,xs = np.where(lbl==i)
        area = len(xs)
        w = xs.max()-xs.min()+1; h = ys.max()-ys.min()+1
        if area < min_area or area > max_area:
            rejected.append((area,w,h)); continue
        fill = area/(w*h)            # ~0.785 for a circle
        aspect = w/h
        if fill < 0.6 or not (0.7 < aspect < 1.4):
            rejected.append((area,w,h,'shape')); continue
        cx, cy = xs.mean(), ys.mean()
        req = np.sqrt(area/np.pi)
        col = [int(np.median(a[ys,xs,c])) for c in range(3)]
        dots.append(dict(x=float(cx), y=float(cy), r=float(req), area=int(area),
                         w=int(w), h=int(h), color=col))
    return dots

if __name__=="__main__":
    dots = detect_dots(sys.argv[1], int(sys.argv[2]), int(sys.argv[3]))
    rs = sorted(d['r'] for d in dots)
    print(f"detected {len(dots)} dots; radius min/med/max = {rs[0]:.2f}/{rs[len(rs)//2]:.2f}/{rs[-1]:.2f}")
    # color clusters
    from collections import Counter
    def bucket(c):
        r,g,b=c
        return ('grey' if max(c)-min(c)<25 else
                'red' if r>150 and g<110 else
                'orange' if r>200 and 100<g<190 else
                'blue' if b>120 and r<120 else
                'green' if g>120 and r<120 and b<140 else
                'yellow' if r>200 and g>180 and b<120 else
                'maroon' if r<140 and r>60 and g<60 else 'other')
    print(Counter(bucket(d['color']) for d in dots))
    json.dump(dots, open(sys.argv[4],"w"))
