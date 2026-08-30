#!/usr/bin/env python3
"""Export L2 Clinic Highlands pack + oversized L1 cottage landmark."""
from __future__ import annotations

from pathlib import Path
from PIL import Image

SRC = Path("/Users/kalkikaul/.cursor/projects/Users-kalkikaul-Enrolment-Quest/assets")
ROOT = Path("/Users/kalkikaul/Enrolment Quest")
WIP = ROOT / "assets/sprites/_wip"
BG = (960, 540)
BG_HI = (1920, 1080)


def load(name: str) -> Image.Image:
    p = SRC / name
    if not p.exists():
        raise FileNotFoundError(p)
    return Image.open(p).convert("RGBA")


def make_seamless_x(im: Image.Image, blend: int = 48) -> Image.Image:
    im = im.convert("RGBA")
    w, h = im.size
    blend = min(blend, w // 4)
    out = im.copy()
    left = im.crop((0, 0, blend, h))
    right = im.crop((w - blend, 0, w, h))
    for i in range(blend):
        t = i / max(1, blend - 1)
        col_r = right.crop((i, 0, i + 1, h))
        col_l = left.crop((i, 0, i + 1, h))
        mixed_l = Image.blend(left.crop((i, 0, i + 1, h)), col_r, 1 - t)
        mixed_r = Image.blend(right.crop((i, 0, i + 1, h)), col_l, t)
        out.paste(mixed_l, (i, 0))
        out.paste(mixed_r, (w - blend + i, 0))
    return out


def sky_to_alpha(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    samples = []
    for x in range(0, w, max(1, w // 40)):
        for y in range(0, max(1, h // 8), 2):
            samples.append(px[x, y][:3])
    n = len(samples) or 1
    sr = sum(c[0] for c in samples) / n
    sg = sum(c[1] for c in samples) / n
    sb = sum(c[2] for c in samples) / n
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    opx = out.load()
    for y in range(h):
        yk = y / h
        for x in range(w):
            r, g, b, a = px[x, y]
            dist = ((r - sr) ** 2 + (g - sg) ** 2 + (b - sb) ** 2) ** 0.5
            is_pale = r > 170 and g > 185 and b > 195 and abs(r - b) < 70
            is_gold_sky = r > 200 and g > 170 and b < 160 and yk > 0.55
            is_groundish = g > r + 12 and g > b + 8
            is_warm = r > g + 18 and r > b + 18 and not is_gold_sky
            alpha = 255
            if yk < 0.40 and (dist < 58 or is_pale) and not is_groundish and not is_warm:
                alpha = 0
            elif yk < 0.55 and (dist < 42 or is_pale) and not is_groundish and not is_warm:
                alpha = 0
            elif yk < 0.65 and (dist < 30 or is_pale) and not is_groundish:
                alpha = max(0, int(255 * (yk - 0.50) / 0.15))
            opx[x, y] = (r, g, b, alpha)
    return out


def key_transparent_bg(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    w, h = im.size
    corners = [im.getpixel((2, 2)), im.getpixel((w - 3, 2)), im.getpixel((2, h - 3)), im.getpixel((w - 3, h - 3))]
    sr = sum(c[0] for c in corners) / 4
    sg = sum(c[1] for c in corners) / 4
    sb = sum(c[2] for c in corners) / 4
    px = im.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            dist = ((r - sr) ** 2 + (g - sg) ** 2 + (b - sb) ** 2) ** 0.5
            if dist < 42:
                px[x, y] = (0, 0, 0, 0)
    return im


def fit_landmark(im: Image.Image, size: tuple[int, int]) -> Image.Image:
    im = key_transparent_bg(im)
    bbox = im.getbbox() or (0, 0, im.width, im.height)
    im = im.crop(bbox)
    out = Image.new("RGBA", size, (0, 0, 0, 0))
    tw, th = im.size
    scale = min(size[0] / tw, size[1] / th) * 0.96
    nw, nh = max(1, int(tw * scale)), max(1, int(th * scale))
    fitted = im.resize((nw, nh), Image.Resampling.LANCZOS)
    out.paste(fitted, ((size[0] - nw) // 2, size[1] - nh), fitted)
    return out


def main():
    # --- Bigger L1 cottage into day + night packs ---
    cottage = fit_landmark(load("play_day_landmark_end_big.png"), (384, 448))
    for folder in ("l1_playable_day", "l1_playable_night"):
        out = WIP / folder
        out.mkdir(parents=True, exist_ok=True)
        cottage.save(out / "landmark_l1_end.png", optimize=True)
        print(f"updated {folder}/landmark_l1_end.png {cottage.size}")

    # --- L2 pack ---
    out = WIP / "l2_playable_day"
    out.mkdir(parents=True, exist_ok=True)

    sky = load("play_l2_sky.png").resize(BG, Image.Resampling.LANCZOS)
    sky.save(out / "bg_l2.png", optimize=True)
    load("play_l2_sky.png").resize(BG_HI, Image.Resampling.LANCZOS).save(out / "bg_l2_1920.png", optimize=True)

    for key, src in [
        ("parallax_l2_far", "play_l2_far_seamless.png"),
        ("parallax_l2_mid", "play_l2_mid_seamless_v2.png"),
        ("parallax_l2_near", "play_l2_near_seamless.png"),
    ]:
        raw = make_seamless_x(load(src).resize(BG, Image.Resampling.LANCZOS))
        raw.save(out / f"_src_{key.split('_')[-1]}.png", optimize=True)
        alpha = sky_to_alpha(raw)
        alpha.save(out / f"{key}.png", optimize=True)
        print(f"  {key} {alpha.size}")

    fit_landmark(load("play_l2_landmark_start.png"), (128, 128)).save(out / "landmark_l2_start.png", optimize=True)
    fit_landmark(load("play_l2_landmark_end.png"), (384, 448)).save(out / "landmark_l2_end.png", optimize=True)
    print("  landmarks ok")

    # preview
    comp = sky.convert("RGBA")
    for k in ("parallax_l2_far", "parallax_l2_mid", "parallax_l2_near"):
        comp = Image.alpha_composite(comp, Image.open(out / f"{k}.png").convert("RGBA"))
    lm = Image.open(out / "landmark_l2_end.png").convert("RGBA").resize((96, 112), Image.Resampling.NEAREST)
    prev = Image.new("RGBA", (960, 620), (12, 12, 20, 255))
    prev.paste(comp, (0, 0))
    prev.paste(lm, (820, 500), lm)
    prev.save(WIP / "l2_preview_playable_day.png", optimize=True)
    print("DONE")


if __name__ == "__main__":
    main()
