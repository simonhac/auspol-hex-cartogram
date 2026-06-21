import numpy as np
from PIL import Image

REF = "reference.png"
img = Image.open(REF).convert("RGB")
a = np.asarray(img)
print("image size (HxWxC):", a.shape)

# Non-white mask
white = (a > 245).all(axis=2)
nonwhite = ~white
# Column/row extents of non-white content
ys, xs = np.where(nonwhite)
print("nonwhite bbox: x", xs.min(), xs.max(), "y", ys.min(), ys.max())

# Look at saturation to separate colored dots from grey text/rules
r,g,b = a[:,:,0].astype(int), a[:,:,1].astype(int), a[:,:,2].astype(int)
mx = np.maximum(np.maximum(r,g),b); mn = np.minimum(np.minimum(r,g),b)
sat = mx - mn
colored = sat > 40   # saturated pixels = colored dots (and maybe colored text)
ys2, xs2 = np.where(colored)
print("colored pixels:", colored.sum())
print("colored bbox: x", xs2.min(), xs2.max(), "y", ys2.min(), ys2.max())

# histogram of colored pixels by row band (to find arc vs table swatches)
hist = np.zeros(a.shape[0])
for y in range(a.shape[0]):
    hist[y] = colored[y].sum()
# print rows with many colored pixels
band_start=None
for y in range(a.shape[0]):
    if hist[y] > 5 and band_start is None: band_start=y
    if hist[y] <= 5 and band_start is not None:
        if y-band_start>4: print(f"colored band rows {band_start}..{y}  (h={y-band_start})")
        band_start=None
