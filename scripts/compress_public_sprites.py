#!/usr/bin/env python3
"""Optimize public/sprites PNGs (lossless). Run: npm run compress:sprites"""
from pathlib import Path
from PIL import Image

SPR = Path(__file__).resolve().parents[1] / "public/sprites"

def compress(path: Path):
    before = path.stat().st_size
    if before < 40_000:
        return
    im = Image.open(path)
    im.load()
    if im.mode == "RGBA":
        a = im.getchannel("A")
        if a.getextrema() == (255, 255):
            im = im.convert("RGB")
    elif im.mode not in ("RGB", "P", "RGBA"):
        im = im.convert("RGBA")
    tmp = path.with_suffix(".tmp.png")
    im.save(tmp, format="PNG", optimize=True, compress_level=9)
    after = tmp.stat().st_size
    if after < before:
        tmp.replace(path)
        print(f"  {path.name}: {before/1e6:.2f}→{after/1e6:.2f} MB")
    else:
        tmp.unlink(missing_ok=True)


def main():
    for p in sorted(SPR.glob("*.png"), key=lambda x: -x.stat().st_size):
        compress(p)
    total = sum(p.stat().st_size for p in SPR.glob("*.png"))
    print(f"public/sprites total {total/1e6:.2f} MB")


if __name__ == "__main__":
    main()
