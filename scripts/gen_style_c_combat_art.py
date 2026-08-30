#!/usr/bin/env python3
"""Generate Style-C sprite strips for Claim Denier, Premium Spike, and combat powers.

Matches the authored enemy look in public/sprites (thick ink outlines, top-left
highlights, cute eyes, soft volume). Installs into public/sprites/.
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "sprites"

INK = (16, 16, 24, 255)
INK2 = (10, 10, 18, 255)
CREAM = (244, 238, 218, 255)
CREAM2 = (239, 231, 207, 255)
CREAM_SH = (200, 194, 176, 255)
WHITE = (255, 255, 255, 255)
RED = (255, 93, 108, 255)
RED2 = (200, 50, 70, 255)
REDL = (255, 176, 186, 255)
GOLD = (255, 210, 74, 255)
GOLD2 = (232, 184, 32, 255)
GOLDL = (255, 233, 168, 255)
TEAL = (92, 200, 255, 255)
TEAL2 = (63, 154, 212, 255)
TEALL = (184, 255, 248, 255)
SLATE = (106, 122, 154, 255)
SLATE2 = (80, 94, 120, 255)
PAPER_LINE = (200, 194, 176, 255)


def blank(w: int, h: int) -> Image.Image:
    return Image.new("RGBA", (w, h), (0, 0, 0, 0))


def px(draw: ImageDraw.ImageDraw, c, x, y, w=1, h=1):
    draw.rectangle([x, y, x + w - 1, y + h - 1], fill=c)


def oval(draw: ImageDraw.ImageDraw, c, x, y, w, h):
    draw.ellipse([x, y, x + w - 1, y + h - 1], fill=c)


def outline_rect(draw, x, y, w, h, fill, ink=INK):
    px(draw, ink, x, y, w, h)
    if w > 2 and h > 2:
        px(draw, fill, x + 1, y + 1, w - 2, h - 2)


def eyes_googly(draw, x0, y0, gap=7):
    """Junk / Sneezy style: white circles + black pupils + white glint."""
    for dx in (0, gap):
        oval(draw, WHITE, x0 + dx, y0, 6, 6)
        oval(draw, INK, x0 + dx + 2, y0 + 2, 3, 3)
        px(draw, WHITE, x0 + dx + 3, y0 + 2, 1, 1)


def eyes_bill(draw, x0, y0, gap=8):
    """Bill style: solid shiny black ovals."""
    for dx in (0, gap):
        oval(draw, INK, x0 + dx, y0, 5, 6)
        px(draw, WHITE, x0 + dx + 1, y0 + 1, 1, 1)


def draw_denier_frame(f: int) -> Image.Image:
    """64×80 — walking clipboard of denied claims (paper family like Bill)."""
    im = blank(64, 80)
    d = ImageDraw.Draw(im)
    lean = [0, 1, 2, 1, 0][f]
    bob = [0, 1, 2, 1, 0][f]
    foot = [0, 2, 4, 2, 0][f]
    ox, oy = 16 + lean, 8 + bob

    # clipboard back (rounded slab)
    outline_rect(d, ox + 6, oy + 8, 28, 48, SLATE, INK)
    px(d, SLATE2, ox + 7, oy + 48, 26, 6)  # bottom shade
    px(d, (138, 154, 184, 255), ox + 7, oy + 9, 26, 4)  # top light

    # cream claim stack
    outline_rect(d, ox + 9, oy + 14, 22, 38, CREAM, INK)
    px(d, CREAM2, ox + 10, oy + 14, 20, 3)
    px(d, CREAM_SH, ox + 10, oy + 48, 20, 3)
    for ly in (20, 24, 28):
        px(d, PAPER_LINE, ox + 12, oy + ly, 14, 1)

    # DENIED stamp blot
    outline_rect(d, ox + 11, oy + 32, 18, 12, RED, INK)
    px(d, REDL, ox + 13, oy + 34, 14, 3)
    px(d, CREAM, ox + 14, oy + 37, 12, 4)
    # tiny "X" mark in stamp
    px(d, RED2, ox + 17, oy + 38, 2, 2)
    px(d, RED2, ox + 21, oy + 38, 2, 2)

    # gold clip hat
    outline_rect(d, ox + 14, oy + 2, 12, 10, GOLD, INK)
    px(d, GOLDL, ox + 15, oy + 3, 10, 3)
    px(d, GOLD2, ox + 17, oy + 7, 6, 3)

    # face
    eyes_bill(d, ox + 14, oy + 18, gap=9)
    # tiny smile
    px(d, INK, ox + 18, oy + 27, 6, 1)
    px(d, INK, ox + 17, oy + 26, 1, 1)
    px(d, INK, ox + 24, oy + 26, 1, 1)

    # front rubber-stamp "shield" (held out)
    sx = ox + 34
    outline_rect(d, sx, oy + 22, 12, 18, RED, INK)
    px(d, REDL, sx + 2, oy + 24, 8, 10)
    px(d, CREAM, sx + 3, oy + 28, 6, 5)
    px(d, GOLD, sx + 4, oy + 30, 4, 2)

    # stick legs like Bill
    ly = oy + 56
    px(d, INK, ox + 14 + foot, ly, 3, 10)
    px(d, INK, ox + 26 - foot, ly, 3, 10)
    px(d, INK, ox + 12 + foot, ly + 9, 6, 3)
    px(d, INK, ox + 24 - foot, ly + 9, 6, 3)

    # highlight speck on paper
    px(d, WHITE, ox + 11, oy + 16, 2, 2)
    return im


def draw_spike_frame(f: int) -> Image.Image:
    """64×64 — chubby gold premium-tag with hike spike (Junk roundness)."""
    im = blank(64, 64)
    d = ImageDraw.Draw(im)
    sq = [0, 1, 2, 1, 0][f]
    foot = [0, 2, 3, 2, 0][f]
    ox, oy = 10, 6 + sq

    # spike hat (cone)
    # outline cone with stacked rects
    for i, (w, yoff) in enumerate([(4, 0), (6, 3), (8, 6), (10, 9), (12, 12)]):
        x = ox + 18 - w // 2
        y = oy + yoff
        px(d, INK, x - 1, y, w + 2, 4)
        px(d, RED if i < 4 else RED2, x, y + 1, w, 2)
        if i < 2:
            px(d, REDL, x + 1, y + 1, max(1, w - 2), 1)

    # tag body (rounded)
    bx, by = ox + 4, oy + 16
    # ink shell
    oval(d, INK, bx, by, 40, 30)
    oval(d, GOLD, bx + 2, by + 2, 36, 26)
    # volume
    px(d, GOLD2, bx + 4, by + 20, 32, 6)
    px(d, GOLDL, bx + 6, by + 4, 10, 6)  # top-left shine
    # punch hole
    oval(d, INK, bx + 6, by + 8, 8, 8)
    oval(d, CREAM, bx + 7, by + 9, 6, 6)

    # face
    eyes_googly(d, bx + 14, by + 8, gap=10)
    # grin
    px(d, INK, bx + 18, by + 18, 6, 1)
    px(d, RED, bx + 19, by + 19, 4, 1)

    # ₹ belly mark
    px(d, RED2, bx + 20, by + 21, 2, 5)
    px(d, RED2, bx + 18, by + 21, 6, 1)
    px(d, RED2, bx + 18, by + 23, 5, 1)

    # stubby feet
    fy = by + 28
    outline_rect(d, bx + 8 + foot, fy, 10, 6, GOLD2, INK)
    outline_rect(d, bx + 22 - foot, fy, 10, 6, GOLD2, INK)
    return im


def draw_pickup_seal() -> Image.Image:
    """40×40 Seal Shot kit — cream pad + red wax (kit silhouette)."""
    im = blank(40, 40)
    d = ImageDraw.Draw(im)
    # pad
    outline_rect(d, 4, 16, 32, 18, CREAM, INK)
    px(d, CREAM2, 5, 17, 30, 3)
    px(d, CREAM_SH, 5, 30, 30, 3)
    # handle
    outline_rect(d, 14, 8, 12, 10, GOLD, INK)
    px(d, GOLDL, 15, 9, 10, 3)
    # wax seal
    oval(d, INK, 10, 18, 20, 16)
    oval(d, RED, 12, 20, 16, 12)
    oval(d, REDL, 14, 22, 8, 5)
    px(d, GOLD, 16, 25, 8, 3)
    px(d, WHITE, 15, 22, 2, 2)
    return im


def draw_pickup_beam() -> Image.Image:
    """40×40 Coverage Beam — cute teal claim-lamp."""
    im = blank(40, 40)
    d = ImageDraw.Draw(im)
    outline_rect(d, 12, 4, 16, 22, CREAM, INK)
    px(d, CREAM2, 13, 5, 14, 3)
    px(d, CREAM_SH, 13, 20, 14, 4)
    # gold switch
    outline_rect(d, 16, 10, 8, 8, GOLD, INK)
    px(d, WHITE, 18, 12, 2, 2)
    # lens
    outline_rect(d, 6, 24, 28, 12, TEAL, INK)
    px(d, TEALL, 8, 26, 24, 4)
    px(d, WHITE, 12, 27, 10, 2)
    px(d, TEAL2, 8, 32, 24, 3)
    return im


def draw_pickup_shield() -> Image.Image:
    """40×40 Coverage Shield — cream badge, teal rim."""
    im = blank(40, 40)
    d = ImageDraw.Draw(im)
    oval(d, INK, 6, 2, 28, 34)
    oval(d, TEAL, 8, 4, 24, 30)
    oval(d, TEAL2, 8, 4, 24, 8)
    oval(d, CREAM, 11, 10, 18, 20)
    px(d, GOLDL, 14, 12, 4, 4)  # shine
    # gold chevron
    px(d, GOLD, 16, 16, 8, 3)
    px(d, GOLD, 17, 19, 6, 3)
    px(d, GOLD, 18, 22, 4, 3)
    px(d, GOLD2, 16, 25, 8, 2)
    return im


def draw_fx_seal() -> Image.Image:
    im = blank(28, 28)
    d = ImageDraw.Draw(im)
    oval(d, INK, 2, 2, 24, 24)
    oval(d, RED, 4, 4, 20, 20)
    oval(d, REDL, 7, 7, 10, 8)
    oval(d, CREAM, 9, 10, 10, 8)
    px(d, GOLD, 11, 12, 6, 4)
    px(d, WHITE, 8, 8, 2, 2)
    return im


def draw_fx_beam() -> Image.Image:
    """48×16 — rolled teal ribbon bolt (same construction language as fx_bill)."""
    im = blank(48, 16)
    d = ImageDraw.Draw(im)
    outline_rect(d, 2, 3, 38, 10, TEAL, INK)
    px(d, TEAL2, 3, 4, 36, 2)
    px(d, TEALL, 6, 6, 28, 3)
    px(d, WHITE, 10, 7, 12, 1)
    # gold band
    outline_rect(d, 16, 4, 10, 8, GOLD, INK)
    px(d, GOLDL, 17, 5, 8, 2)
    # glow tip
    oval(d, INK, 38, 2, 10, 12)
    oval(d, TEALL, 40, 4, 6, 8)
    px(d, WHITE, 41, 5, 2, 2)
    return im


def strip(frames: list[Image.Image]) -> Image.Image:
    w, h = frames[0].size
    out = blank(w * len(frames), h)
    for i, fr in enumerate(frames):
        out.paste(fr, (i * w, 0), fr)
    return out


def nearest_scale(im: Image.Image, scale: int) -> Image.Image:
    """Authored enemies are drawn ~32 logical then ×2. We draw at display size already."""
    return im


def main():
    OUT.mkdir(parents=True, exist_ok=True)

    denier = strip([draw_denier_frame(f) for f in range(5)])
    spike = strip([draw_spike_frame(f) for f in range(5)])

    assets = {
        "enemy_denier.png": denier,
        "enemy_spike.png": spike,
        "pickup_kit.png": draw_pickup_seal(),
        "pickup_beam.png": draw_pickup_beam(),
        "pickup_shield.png": draw_pickup_shield(),
        "fx_seal.png": draw_fx_seal(),
        "fx_beam.png": draw_fx_beam(),
    }
    for name, im in assets.items():
        path = OUT / name
        im.save(path)
        print(f"wrote {path.relative_to(ROOT)} {im.size}")


if __name__ == "__main__":
    main()
