#!/usr/bin/env python3
"""
Cut the cover engravings from the plates in public/plates (all public domain, see content/plates.json).

Each cover is a 2:1 crop, its hand colouring lifted out (each pixel takes its lightest channel, so the
red and blue washes go pale and the engraved line stays dark), set in greyscale on white and saved as
a small WebP. The app prints it on the theme's paper colour (CSS multiply), so one file serves both
themes. It also cuts the engraving for the share image (scripts/brand/, used by brand-assets.cjs).
Run: python3 scripts/engravings.py
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parent.parent
PLATES = ROOT / 'public' / 'plates'
OUT = PLATES / 'covers'
WIDTH = 780  # 390 px at 2x

# name: (plate, x0, x1, y0, lift) as fractions of the plate; the height follows from the 2:1 shape.
# lift > 1 lightens the midtones where deep washes (the red of cut muscle) would print too heavy.
COVERS = {
    'spine': ('vertebral-veins', 0.04, 0.96, 0.24, 1.0),
    'ribcage': ('great-vessels', 0.15, 0.85, 0.28, 1.0),
    'great-vessels': ('great-vessels', 0.20, 0.80, 0.12, 1.0),
    'heart': ('heart-nerves', 0.20, 0.95, 0.56, 1.1),
    'lungs': ('vagus-lungs', 0.10, 0.90, 0.40, 1.1),
    'stomach': ('vagus-lungs', 0.15, 0.85, 0.66, 1.2),
    'axilla': ('axilla', 0.12, 0.88, 0.26, 1.2),
    'thigh': ('foot-and-sections', 0.30, 0.98, 0.17, 4.0),
    'neck': ('neck-section', 0.12, 0.50, 0.53, 1.4),
    'neck-vessels': ('neck-lymphatics', 0.00, 0.75, 0.10, 1.2),
    'chest-wall': ('lateral-chest', 0.20, 0.80, 0.33, 1.3),
    'abdomen': ('diaphragm', 0.18, 0.82, 0.38, 1.4),
}


# Creases in a scan, as rows of the plate (first, last), mended from the rows either side.
CREASES = {'vagus-lungs': [(957, 962)]}


def mend(im: Image.Image, creases: list[tuple[int, int]]) -> Image.Image:
    a = np.asarray(im).astype(np.float32)
    for first, last in creases:
        above, below = a[first - 1], a[last + 1]
        for y in range(first, last + 1):
            k = (y - first + 1) / (last - first + 2)
            a[y] = above * (1 - k) + below * k
    return Image.fromarray(a.round().astype(np.uint8))


# The share image's engraving (1200 x 630 card, right-hand panel): taller than a cover.
SHARE = ('heart-nerves', 0.02, 0.98, 0.03, 1.15)
SHARE_SIZE = (1040, 1260)


def cover(plate: str, x0: float, x1: float, y0: float, lift: float, size: tuple[int, int] = (WIDTH, WIDTH // 2)) -> Image.Image:
    im = mend(Image.open(PLATES / f'{plate}.webp').convert('RGB'), CREASES.get(plate, []))
    w, h = im.size
    left, right = round(x0 * w), round(x1 * w)
    top = round(y0 * h)
    bottom = top + round((right - left) * size[1] / size[0])
    if bottom > h:
        raise SystemExit(f'{plate}: crop runs off the bottom of the plate')
    r, g, b = im.crop((left, top, right, bottom)).split()
    lightest = ImageChops.lighter(ImageChops.lighter(r, g), b)
    grey = ImageOps.autocontrast(lightest, cutoff=(1, 0.5))
    if lift != 1:
        grey = grey.point(lambda v: round(255 * (v / 255) ** (1 / lift)))
    # A touch of smoothing keeps the paper's grain from costing kilobytes; the engraved line survives it.
    return grey.filter(ImageFilter.GaussianBlur(0.5)).resize(size, Image.LANCZOS)


def main() -> None:
    OUT.mkdir(exist_ok=True)
    for name, spec in COVERS.items():
        path = OUT / f'{name}.webp'
        cover(*spec).save(path, 'WEBP', quality=55, method=6)
        print(f'{path.relative_to(ROOT)}  {path.stat().st_size // 1024} KB')
    # Not served: scripts/brand-assets.cjs prints it into the share image.
    share = ROOT / 'scripts' / 'brand' / 'share-engraving.jpg'
    share.parent.mkdir(exist_ok=True)
    cover(*SHARE, size=SHARE_SIZE).save(share, quality=88, optimize=True)
    print(f'{share.relative_to(ROOT)}  {share.stat().st_size // 1024} KB')


if __name__ == '__main__':
    main()
