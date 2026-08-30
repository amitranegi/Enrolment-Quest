#!/usr/bin/env python3
"""
Restore storybook L1/L2 world art with smoother visuals:

- Sky: de-band / soft blur, opaque plate
- Parallax: silhouette alpha (no sky leftovers, no punched holes),
  near bushes scaled down into lower band
- Start gates: true alpha, sized for ~0.8 in-engine scale (384×448 source)

Usage: python3 scripts/fix_restore_storybook_world.py --install
"""
from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageFilter, ImageEnhance

SRC = Path("/Users/kalkikaul/.cursor/projects/Users-kalkikaul-Enrolment-Quest/assets")
ROOT = Path("/Users/kalkikaul/Enrolment Quest")
WIP = ROOT / "assets/sprites/_wip"
PUBLIC = ROOT / "public/sprites"
BG_HI = (1920, 1080)
START_SIZE = (384, 448)


def load(name: str) -> Image.Image:
    p = SRC / name
    if not p.exists():
        raise FileNotFoundError(p)
    return Image.open(p).convert("RGBA")


def is_checker_gray(r: int, g: int, b: int) -> bool:
    if abs(r - g) > 10 or abs(g - b) > 10:
        return False
    return (145 <= r <= 220) and (abs(r - 204) < 28 or abs(r - 153) < 28 or abs(r - 178) < 20)


def remove_checkerboard(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    opx = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if is_checker_gray(r, g, b):
                continue
            if r > 230 and g > 230 and b > 230 and (r + g + b) > 700:
                continue
            opx[x, y] = (r, g, b, 255)

    from collections import deque

    q: deque[tuple[int, int]] = deque()
    seen = [[False] * w for _ in range(h)]
    for sx, sy in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0)):
        q.append((sx, sy))
    while q:
        x, y = q.popleft()
        if x < 0 or y < 0 or x >= w or y >= h or seen[y][x]:
            continue
        seen[y][x] = True
        r, g, b, a = opx[x, y]
        if a == 0:
            for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                q.append((nx, ny))
            continue
        grayish = abs(r - g) < 18 and abs(g - b) < 18 and r > 140
        pale = r > 210 and g > 210 and b > 210
        if grayish or pale:
            opx[x, y] = (0, 0, 0, 0)
            for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                q.append((nx, ny))
    return out


def fit_landmark(im: Image.Image, size: tuple[int, int]) -> Image.Image:
    im = remove_checkerboard(im)
    bbox = im.getbbox()
    if not bbox:
        raise SystemExit("landmark fully transparent after checker removal")
    im = im.crop(bbox)
    out = Image.new("RGBA", size, (0, 0, 0, 0))
    tw, th = im.size
    scale = min(size[0] / tw, size[1] / th) * 0.98
    nw, nh = max(1, int(tw * scale)), max(1, int(th * scale))
    fitted = im.resize((nw, nh), Image.Resampling.LANCZOS)
    out.paste(fitted, ((size[0] - nw) // 2, size[1] - nh), fitted)
    px = out.load()
    for y in range(size[1]):
        for x in range(size[0]):
            r, g, b, a = px[x, y]
            if a and is_checker_gray(r, g, b):
                px[x, y] = (0, 0, 0, 0)
    return out


def make_seamless_x(im: Image.Image, blend: int = 96) -> Image.Image:
    im = im.convert("RGBA")
    w, h = im.size
    blend = min(blend, w // 4)
    out = im.copy()
    left = im.crop((0, 0, blend, h))
    right = im.crop((w - blend, 0, w, h))
    for i in range(blend):
        t = i / max(1, blend - 1)
        mixed_l = Image.blend(left.crop((i, 0, i + 1, h)), right.crop((i, 0, i + 1, h)), 1 - t)
        mixed_r = Image.blend(right.crop((i, 0, i + 1, h)), left.crop((i, 0, i + 1, h)), t)
        out.paste(mixed_l, (i, 0))
        out.paste(mixed_r, (w - blend + i, 0))
    return out


def sample_sky_rgb(im: Image.Image) -> tuple[float, float, float]:
    px = im.load()
    w, h = im.size
    samples = []
    for x in range(0, w, max(1, w // 60)):
        for y in range(0, max(1, int(h * 0.10)), 2):
            samples.append(px[x, y][:3])
    n = len(samples) or 1
    return (
        sum(c[0] for c in samples) / n,
        sum(c[1] for c in samples) / n,
        sum(c[2] for c in samples) / n,
    )


def is_sky_pixel(r, g, b, sr, sg, sb, yk: float) -> bool:
    dist = ((r - sr) ** 2 + (g - sg) ** 2 + (b - sb) ** 2) ** 0.5
    pale = r > 175 and g > 185 and b > 195 and abs(r - b) < 80
    gold = r > 200 and g > 175 and b < 170 and yk < 0.75
    mint_sky = g > 200 and b > 190 and r > 170 and abs(g - b) < 40 and g >= r
    groundish = g > r + 14 and g > b + 10 and g < 200
    warm = r > g + 20 and r > b + 20
    if groundish or warm:
        return False
    return dist < 48 or pale or gold or mint_sky


def silhouette_alpha(im: Image.Image, force_clear_above: float) -> Image.Image:
    """
    True silhouette cut:
    - above per-column ridge → fully clear (no sky leftovers)
    - below ridge → fully opaque (no punched holes)
    Soft 2px fringe at ridge only.
    """
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    sr, sg, sb = sample_sky_rgb(im)
    clear_floor = int(h * force_clear_above)

    # Per-column: first non-sky row from top (below force-clear)
    ridge = [h] * w
    for x in range(w):
        found = h
        for y in range(clear_floor, h):
            r, g, b, _ = px[x, y]
            if not is_sky_pixel(r, g, b, sr, sg, sb, y / h):
                found = y
                break
        ridge[x] = found

    # Smooth ridge horizontally to avoid jagged cut
    smooth = ridge[:]
    for x in range(w):
        vals = [ridge[max(0, min(w - 1, x + d))] for d in range(-6, 7)]
        vals.sort()
        smooth[x] = vals[len(vals) // 2]

    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    opx = out.load()
    for x in range(w):
        top = max(clear_floor, smooth[x])
        for y in range(top, h):
            r, g, b, _ = px[x, y]
            # fill holes: if this pixel was keyed as sky mid-hill, sample downward neighbor color
            if is_sky_pixel(r, g, b, sr, sg, sb, y / h) and y > top + 4:
                # borrow from denser nearby ground pixel
                rr, gg, bb = r, g, b
                for yy in range(y, min(h, y + 12)):
                    r2, g2, b2, _ = px[x, yy]
                    if not is_sky_pixel(r2, g2, b2, sr, sg, sb, yy / h):
                        rr, gg, bb = r2, g2, b2
                        break
                opx[x, y] = (rr, gg, bb, 255)
            else:
                dy = y - top
                a = 255 if dy > 2 else int(255 * (dy + 1) / 3)
                opx[x, y] = (r, g, b, a)
    return out


def shrink_near_band(im: Image.Image, height_scale: float = 0.58) -> Image.Image:
    """Keep only foliage band, scale it shorter so bushes don't dominate the hero."""
    bbox = im.getbbox()
    if not bbox:
        return im
    x0, y0, x1, y1 = bbox
    band = im.crop((0, y0, im.width, y1))
    # Strip pale sky fringe still glued to bush tops
    px = band.load()
    bw, bh = band.size
    for y in range(bh):
        for x in range(bw):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            pale = r > 190 and g > 190 and b > 160 and g >= r - 10
            mint = r > 180 and g > 210 and b > 200
            if pale or mint:
                px[x, y] = (0, 0, 0, 0)
    bbox2 = band.getbbox()
    if bbox2:
        band = band.crop((0, bbox2[1], bw, bbox2[3]))
    nh = max(1, int(band.height * height_scale))
    scaled = band.resize((im.width, nh), Image.Resampling.LANCZOS)
    scaled = scaled.filter(ImageFilter.GaussianBlur(radius=0.75))
    out = Image.new("RGBA", im.size, (0, 0, 0, 0))
    out.paste(scaled, (0, im.height - nh), scaled)
    return out


def clean_sky_plate(im: Image.Image) -> Image.Image:
    """Opaque sky with reduced banding (mild blur + slight contrast soften)."""
    im = im.convert("RGBA").resize(BG_HI, Image.Resampling.LANCZOS)
    # mild blur kills micro-banding / grain without killing clouds
    soft = im.filter(ImageFilter.GaussianBlur(radius=1.1))
    soft = ImageEnhance.Contrast(soft).enhance(0.96)
    soft = ImageEnhance.Color(soft).enhance(1.02)
    # ensure fully opaque
    px = soft.load()
    w, h = soft.size
    for y in range(h):
        for x in range(w):
            r, g, b, _ = px[x, y]
            px[x, y] = (r, g, b, 255)
    return soft


def assert_parallax_ok(im: Image.Image, name: str, min_top_clear: float = 0.92):
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
        raise SystemExit(f"FAIL {name}: top-third clear {ratio:.0%} < {min_top_clear:.0%}")
    # no pale-sky leftovers in upper half opaque pixels
    bad = 0
    for y in range(0, h // 2, 6):
        for x in range(0, w, 12):
            r, g, b, a = px[x, y]
            if a > 200 and r > 190 and g > 220 and b > 210:
                bad += 1
    if bad > 40:
        raise SystemExit(f"FAIL {name}: sky leftovers in upper half ({bad})")
    print(f"  OK {name} {im.size} top-clear={ratio:.0%} sky-leftovers={bad}")


def assert_landmark_ok(im: Image.Image, name: str):
    px = im.load()
    w, h = im.size
    checker = opaque = 0
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            r, g, b, a = px[x, y]
            if a:
                opaque += 1
                if is_checker_gray(r, g, b):
                    checker += 1
    if checker > 20:
        raise SystemExit(f"FAIL {name}: checker pixels ({checker})")
    print(f"  OK {name} {im.size} opaque~{opaque} checker={checker}")


def export_level(
    level: str,
    sky_name: str,
    far_name: str,
    mid_name: str,
    near_name: str,
    start_name: str,
    clear_far: float,
    clear_mid: float,
    clear_near: float,
    near_scale: float,
) -> dict[str, Image.Image]:
    out_dir = WIP / f"storybook_world_{level}"
    out_dir.mkdir(parents=True, exist_ok=True)
    print(f"=== {level}")

    sky = clean_sky_plate(load(sky_name))
    assets: dict[str, Image.Image] = {f"bg_{level}": sky}

    for key, src, clear, shrink in [
        (f"parallax_{level}_far", far_name, clear_far, None),
        (f"parallax_{level}_mid", mid_name, clear_mid, None),
        (f"parallax_{level}_near", near_name, clear_near, near_scale),
    ]:
        raw = make_seamless_x(load(src).resize(BG_HI, Image.Resampling.LANCZOS), blend=96)
        layer = silhouette_alpha(raw, force_clear_above=clear)
        if shrink:
            layer = shrink_near_band(layer, height_scale=shrink)
        assert_parallax_ok(layer, key, min_top_clear=0.90 if "far" in key else 0.95)
        assets[key] = layer

    start = fit_landmark(load(start_name), START_SIZE)
    assert_landmark_ok(start, f"landmark_{level}_start")
    assets[f"landmark_{level}_start"] = start

    for key, im in assets.items():
        path = out_dir / f"{key}.png"
        im.save(path, "PNG", optimize=True)
        print(f"  wrote {path.relative_to(ROOT)}")
    return assets


def install(all_assets: dict[str, Image.Image]):
    PUBLIC.mkdir(parents=True, exist_ok=True)
    for key, im in all_assets.items():
        dest = PUBLIC / f"{key}.png"
        im.save(dest, "PNG", optimize=True)
        print(f"  installed {dest.relative_to(ROOT)}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--install", action="store_true")
    args = ap.parse_args()

    a1 = export_level(
        "l1",
        sky_name="play_day_sky_v2.png",
        far_name="play_day_far_seamless.png",
        mid_name="play_day_mid_seamless.png",
        near_name="play_day_near_seamless.png",
        start_name="play_day_landmark_start.png",
        clear_far=0.32,
        clear_mid=0.42,
        clear_near=0.50,
        near_scale=0.48,
    )
    a2 = export_level(
        "l2",
        sky_name="play_l2_sky.png",
        far_name="play_l2_far_seamless.png",
        mid_name="play_l2_mid_seamless_v2.png",
        near_name="play_l2_near_seamless.png",
        start_name="play_l2_landmark_start.png",
        clear_far=0.34,
        clear_mid=0.44,
        clear_near=0.52,
        near_scale=0.48,
    )

    if args.install:
        print("Installing…")
        install({**a1, **a2})
        print("Done. Hard-refresh (Cmd+Shift+R).")
    else:
        print("Dry run OK.")


if __name__ == "__main__":
    main()
