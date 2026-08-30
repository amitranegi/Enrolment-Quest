#!/usr/bin/env python3
"""
Export Level 3 Wellbeing Bazaar playable pack.

Parallax is a *small distant market ridge* (L1/L2 vertical occupancy),
built from side-facing stall façades so horizontal tiling does not
repeat a vanishing-point street tunnel.

Sources:
  - bg_l3_wellbeing_bazaar.png (Cursor assets)

Output: assets/sprites/_wip/l3_playable_day/ + storybook_world_l3/
Install: python3 scripts/export_l3_playable.py --install
"""
from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

SRC = Path("/Users/kalkikaul/.cursor/projects/Users-kalkikaul-Enrolment-Quest/assets")
ROOT = Path("/Users/kalkikaul/Enrolment Quest")
WIP = ROOT / "assets/sprites/_wip"
PUBLIC = ROOT / "public/sprites"
OUT = WIP / "l3_playable_day"
STORY = WIP / "storybook_world_l3"
BG_HI = (1920, 1080)
W, H = BG_HI
LM = (384, 448)


def load_bazaar() -> Image.Image:
    for name in ("bg_l3_wellbeing_bazaar.png",):
        p = SRC / name
        if p.exists():
            return Image.open(p).convert("RGBA")
    p2 = WIP / "world_neem_morning/bg_l3_1920.png"
    if p2.exists():
        return Image.open(p2).convert("RGBA")
    raise FileNotFoundError("No L3 bazaar source found")


def make_seamless_x(im: Image.Image, blend: int = 260) -> Image.Image:
    im = im.convert("RGBA")
    w, h = im.size
    blend = min(blend, w // 3)
    out = im.copy()
    left = im.crop((0, 0, blend, h))
    right = im.crop((w - blend, 0, w, h))
    for i in range(blend):
        t = i / max(1, blend - 1)
        s = t * t * (3 - 2 * t)
        mixed_l = Image.blend(left.crop((i, 0, i + 1, h)), right.crop((i, 0, i + 1, h)), 1 - s)
        mixed_r = Image.blend(right.crop((i, 0, i + 1, h)), left.crop((i, 0, i + 1, h)), s)
        out.paste(mixed_l, (i, 0))
        out.paste(mixed_r, (w - blend + i, 0))
    return out


def sky_plate(src: Image.Image) -> Image.Image:
    """Warm golden-hour sky only — no market silhouettes."""
    src = src.resize(BG_HI, Image.Resampling.LANCZOS)
    px = src.load()
    samples_top = [
        px[x, y][:3]
        for x in range(0, W, 40)
        for y in range(0, max(1, int(H * 0.08)), 4)
    ]
    samples_mid = [
        px[x, y][:3]
        for x in range(0, W, 40)
        for y in range(int(H * 0.10), int(H * 0.18), 4)
    ]

    def avg(samples):
        n = len(samples) or 1
        return tuple(int(sum(c[i] for c in samples) / n) for i in range(3))

    top = avg(samples_top) if samples_top else (255, 160, 70)
    mid = avg(samples_mid) if samples_mid else (255, 200, 120)
    bot = (255, 208, 140)

    out = Image.new("RGBA", BG_HI)
    op = out.load()
    for y in range(H):
        t = y / (H - 1)
        if t < 0.42:
            u = t / 0.42
            c = tuple(int(top[i] + (mid[i] - top[i]) * u) for i in range(3))
        else:
            u = (t - 0.42) / 0.58
            c = tuple(int(mid[i] + (bot[i] - mid[i]) * u) for i in range(3))
        for x in range(W):
            op[x, y] = (*c, 255)

    cx, cy, rad = int(W * 0.74), int(H * 0.24), 82
    for y in range(max(0, cy - rad - 60), min(H, cy + rad + 60)):
        for x in range(max(0, cx - rad - 60), min(W, cx + rad + 60)):
            dist = ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5
            if dist > rad + 60:
                continue
            strength = max(0.0, 1.0 - dist / (rad + 60)) ** 1.5
            r, g, b, _a = op[x, y]
            t = 0.52 * strength
            op[x, y] = (
                int(r * (1 - t) + 255 * t),
                int(g * (1 - t) + 236 * t),
                int(b * (1 - t) + 168 * t),
                255,
            )
    return ImageEnhance.Color(out).enhance(1.05)


def soft_top_alpha(im: Image.Image, fade_frac: float = 0.4) -> Image.Image:
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    top = 0
    for y in range(h):
        if any(px[x, y][3] > 25 for x in range(0, w, 10)):
            top = y
            break
    fade_h = max(6, int((h - top) * fade_frac))
    for y in range(top, min(h, top + fade_h)):
        t = (y - top) / fade_h
        s = t * t * (3 - 2 * t)
        for x in range(w):
            r, g, b, a = px[x, y]
            if a:
                px[x, y] = (r, g, b, int(a * s))
    return im


def sky_key(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    op = out.load()
    samples = []
    for x in range(0, w, max(1, w // 40)):
        for y in range(0, max(1, h // 6), 2):
            samples.append(px[x, y][:3])
    n = len(samples) or 1
    sr = sum(c[0] for c in samples) / n
    sg = sum(c[1] for c in samples) / n
    sb = sum(c[2] for c in samples) / n
    for y in range(h):
        yk = y / h
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 8:
                continue
            dist = ((r - sr) ** 2 + (g - sg) ** 2 + (b - sb) ** 2) ** 0.5
            is_gold = r > 188 and g > 135 and b < 172 and abs(r - g) < 95
            is_pale = r > 208 and g > 190 and b > 165
            is_struct = (
                (r + g + b) < 510
                or (r > g + 10 and r > b + 12 and g < 185)
                or (b > r + 3 and g > r - 22 and b > 70)
                or (g > r + 7 and g > b + 4 and g > 40)
            )
            if (is_gold or is_pale or dist < 40) and not is_struct and yk < 0.5:
                continue
            if (is_gold or is_pale) and not is_struct:
                alpha = max(0, min(255, int(255 * (dist - 18) / 48)))
                if alpha < 30:
                    continue
                op[x, y] = (r, g, b, alpha)
            else:
                op[x, y] = (r, g, b, 255)
    return out


def facade_strip(src: Image.Image, y0: float, y1: float, slice_w: int = 380) -> Image.Image:
    """Side-scrolling stall façades from left/right columns (no center path)."""
    src = src.resize(BG_HI, Image.Resampling.LANCZOS)
    ya, yb = int(H * y0), int(H * y1)
    slices = [
        src.crop((40, ya, 40 + slice_w, yb)),
        src.crop((120, ya, 120 + slice_w, yb)),
        src.crop((W - 40 - slice_w, ya, W - 40, yb)),
        src.crop((W - 160 - slice_w, ya, W - 160, yb)),
    ]
    slices.append(slices[0].transpose(Image.Transpose.FLIP_LEFT_RIGHT))
    th = max(s.height for s in slices)
    norm = []
    for s in slices:
        if s.height != th:
            s = s.resize((s.width, th), Image.Resampling.LANCZOS)
        norm.append(s)
    total = sum(s.width for s in norm)
    strip = Image.new("RGBA", (total, th), (0, 0, 0, 0))
    x = 0
    for s in norm:
        strip.paste(s, (x, 0), s)
        x += s.width
    return strip.resize((W, th), Image.Resampling.LANCZOS)


def place_ridge(
    strip: Image.Image,
    height_frac: float,
    bottom_y: int | None = None,
    haze: float = 0.0,
    blur: float = 0.0,
    fade: float = 0.4,
) -> Image.Image:
    """Scale strip small; sit just above ground so stalls peek behind the hero."""
    target_h = max(18, int(H * height_frac))
    scaled = strip.resize((W, target_h), Image.Resampling.LANCZOS)
    if blur > 0:
        scaled = scaled.filter(ImageFilter.GaussianBlur(radius=blur))
    if haze > 0:
        wash = Image.new("RGBA", scaled.size, (255, 198, 138, 255))
        scaled = Image.blend(scaled.convert("RGBA"), wash, haze * 0.5)
    keyed = soft_top_alpha(sky_key(scaled), fade_frac=fade)
    canvas = Image.new("RGBA", BG_HI, (0, 0, 0, 0))
    # Ground tops at ~GROUND_Y*2 on the 1920×1080 plate; keep ridge above that.
    by = bottom_y if bottom_y is not None else 872
    canvas.paste(keyed, (0, max(0, by - target_h)), keyed)
    return make_seamless_x(canvas, blend=260)


def draw_landmark_end() -> Image.Image:
    """Bazaar pavilion — doorway on LEFT (walk-in). 384×448."""
    im = Image.new("RGBA", LM, (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    _W, Hh = LM
    plaster = (238, 224, 198, 255)
    plaster_d = (210, 190, 160, 255)
    trim = (24, 148, 142, 255)
    trim_d = (16, 110, 106, 255)
    roof = (208, 100, 52, 255)
    roof_d = (170, 72, 36, 255)
    wood = (118, 74, 42, 255)
    door = (22, 24, 30, 255)
    step = (186, 154, 110, 255)

    d.rectangle([18, Hh - 40, _W - 18, Hh - 6], fill=(112, 82, 54, 255))
    d.rectangle([22, Hh - 34, _W - 22, Hh - 10], fill=(148, 112, 72, 255))
    d.rectangle([36, 110, 158, Hh - 40], fill=plaster)
    d.rectangle([36, 110, 46, Hh - 40], fill=trim)
    d.rectangle([148, 110, 158, Hh - 40], fill=trim)
    d.polygon([(30, 118), (97, 36), (164, 118)], fill=roof)
    d.polygon([(42, 118), (97, 54), (152, 118)], fill=trim)
    d.line([(30, 118), (97, 36), (164, 118)], fill=roof_d, width=2)
    d.rectangle([56, 168, 138, Hh - 40], fill=trim_d)
    d.pieslice([56, 128, 138, 210], 180, 0, fill=trim_d)
    d.rectangle([64, 178, 130, Hh - 40], fill=door)
    d.pieslice([64, 140, 130, 206], 180, 0, fill=door)
    d.rectangle([78, 210, 116, Hh - 52], fill=(40, 36, 28, 255))
    d.rectangle([52, Hh - 52, 142, Hh - 40], fill=step)
    d.rectangle([48, Hh - 46, 146, Hh - 40], fill=(168, 136, 92, 255))
    d.polygon([(78, 96), (116, 96), (116, 126), (97, 142), (78, 126)], fill=trim)
    d.ellipse([88, 106, 106, 124], fill=(255, 214, 90, 255))
    d.rectangle([158, 150, 348, Hh - 40], fill=plaster)
    d.rectangle([158, 150, 168, Hh - 40], fill=trim)
    d.rectangle([338, 150, 348, Hh - 40], fill=trim)
    d.rectangle([168, Hh - 70, 338, Hh - 40], fill=plaster_d)
    d.polygon([(152, 158), (253, 78), (354, 158)], fill=roof)
    d.polygon([(164, 158), (253, 94), (342, 158)], fill=roof_d)
    for wx in (188, 246, 304):
        d.rectangle([wx, 188, wx + 30, 232], fill=(36, 46, 56, 255))
        d.rectangle([wx, 188, wx + 30, 196], fill=trim)
        d.rectangle([wx, 188, wx + 5, 232], fill=trim)
        d.rectangle([wx + 25, 188, wx + 30, 232], fill=trim)
    d.polygon([(166, 168), (253, 138), (340, 168), (340, 188), (166, 188)], fill=(18, 158, 152, 255))
    for mx in range(176, 330, 14):
        d.ellipse([mx, 182, mx + 11, 198], fill=(255, 142, 42, 255))
    d.rectangle([180, Hh - 98, 262, Hh - 44], fill=wood)
    d.rectangle([272, Hh - 92, 328, Hh - 44], fill=(96, 58, 36, 255))
    for jx, col in ((190, (186, 72, 158)), (210, (226, 186, 52)), (230, (58, 154, 92)), (248, (70, 120, 180))):
        d.rectangle([jx, Hh - 122, jx + 14, Hh - 98], fill=(*col, 255))
    d.ellipse([308, Hh - 108, 352, Hh - 58], fill=(42, 128, 72, 255))
    d.rectangle([322, Hh - 62, 338, Hh - 40], fill=(164, 96, 54, 255))
    small = im.resize((LM[0] // 2, LM[1] // 2), Image.Resampling.BOX)
    return small.resize(LM, Image.Resampling.NEAREST)


def draw_landmark_start() -> Image.Image:
    """Market lane gate — start prop."""
    im = Image.new("RGBA", LM, (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    _W, Hh = LM
    stone = (148, 120, 88, 255)
    stone_d = (118, 92, 64, 255)
    trim = (28, 148, 142, 255)
    wood = (108, 70, 42, 255)
    for x0 in (64, 268):
        d.rectangle([x0, 150, x0 + 48, Hh - 18], fill=stone)
        d.rectangle([x0, 150, x0 + 48, 168], fill=trim)
        d.rectangle([x0 + 6, 180, x0 + 42, Hh - 24], fill=stone_d)
        d.rectangle([x0 - 6, 142, x0 + 54, 156], fill=stone)
    d.rectangle([64, 142, 316, 168], fill=wood)
    d.arc([86, 78, 294, 220], 180, 0, fill=wood, width=22)
    for mx in range(96, 290, 14):
        d.ellipse([mx, 148, mx + 12, 166], fill=(255, 148, 42, 255))
    for lx in (128, 236):
        d.rectangle([lx + 6, 168, lx + 10, 182], fill=(80, 50, 30, 255))
        d.rectangle([lx, 182, lx + 22, 218], fill=(255, 214, 96, 255))
    for px0 in (28, 320):
        d.ellipse([px0, Hh - 78, px0 + 48, Hh - 18], fill=(46, 132, 78, 255))
    small = im.resize((LM[0] // 2, LM[1] // 2), Image.Resampling.BOX)
    return small.resize(LM, Image.Resampling.NEAREST)


def assert_parallax(im: Image.Image, name: str, min_top_clear: float = 0.75):
    px = im.load()
    w, h = im.size
    clear = total = 0
    for y in range(0, h // 3, 4):
        for x in range(0, w, 8):
            total += 1
            if px[x, y][3] == 0:
                clear += 1
    ratio = clear / max(1, total)
    if ratio < min_top_clear:
        raise SystemExit(f"FAIL {name}: top-clear {ratio:.0%} < {min_top_clear:.0%}")
    print(f"  OK {name} {im.size} top-clear={ratio:.0%}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--install", action="store_true")
    args = ap.parse_args()

    OUT.mkdir(parents=True, exist_ok=True)
    STORY.mkdir(parents=True, exist_ok=True)

    bazaar = load_bazaar()
    print(f"source bazaar {bazaar.size}")

    sky = sky_plate(bazaar)
    sky.save(OUT / "bg_l3.png", optimize=True)
    sky.save(STORY / "bg_l3.png", optimize=True)
    print("  bg_l3 sky ok")

    # Small distant ridges sitting just above ground (not buried under terrain tiles).
    # Side façades tile without repeating a vanishing-point street.
    ground_plate_y = 852  # ~GROUND_Y * 2 on the hi-res plate
    layers = {
        "parallax_l3_far": place_ridge(
            facade_strip(bazaar, 0.28, 0.52, 440),
            height_frac=0.16,
            bottom_y=ground_plate_y + 10,
            haze=0.45,
            blur=1.2,
            fade=0.5,
        ),
        "parallax_l3_mid": place_ridge(
            facade_strip(bazaar, 0.32, 0.62, 420),
            height_frac=0.22,
            bottom_y=ground_plate_y + 30,
            haze=0.12,
            blur=0.35,
            fade=0.38,
        ),
        "parallax_l3_near": place_ridge(
            facade_strip(bazaar, 0.40, 0.68, 400),
            height_frac=0.13,
            bottom_y=ground_plate_y + 40,
            haze=0.0,
            blur=0.0,
            fade=0.32,
        ),
    }

    for k, im in layers.items():
        assert_parallax(im, k)
        im.save(OUT / f"{k}.png", optimize=True)
        im.save(STORY / f"{k}.png", optimize=True)

    start = draw_landmark_start()
    end = draw_landmark_end()
    start.save(OUT / "landmark_l3_start.png", optimize=True)
    end.save(OUT / "landmark_l3_end.png", optimize=True)
    start.save(STORY / "landmark_l3_start.png", optimize=True)
    end.save(STORY / "landmark_l3_end.png", optimize=True)
    print("  landmarks ok")

    comp = sky.convert("RGBA")
    for k in ("parallax_l3_far", "parallax_l3_mid", "parallax_l3_near"):
        comp = Image.alpha_composite(comp, layers[k])
    lm = end.resize((96, 112), Image.Resampling.NEAREST)
    prev = Image.new("RGBA", (960, 620), (20, 12, 8, 255))
    small = comp.resize((960, 540), Image.Resampling.LANCZOS)
    prev.paste(small, (0, 0))
    prev.paste(lm, (820, 400), lm)
    prev.save(WIP / "l3_preview_playable_day.png", optimize=True)
    print(f"  preview → {WIP / 'l3_preview_playable_day.png'}")

    if args.install:
        PUBLIC.mkdir(parents=True, exist_ok=True)
        keys = [
            "bg_l3",
            "parallax_l3_far",
            "parallax_l3_mid",
            "parallax_l3_near",
            "landmark_l3_start",
            "landmark_l3_end",
        ]
        for key in keys:
            src = OUT / f"{key}.png"
            dest = PUBLIC / f"{key}.png"
            Image.open(src).save(dest, "PNG", optimize=True)
            print(f"  installed {dest.relative_to(ROOT)}")
        print("Done. Hard-refresh (Cmd+Shift+R).")
    else:
        print("Dry run OK. Re-run with --install to deploy.")


if __name__ == "__main__":
    main()
