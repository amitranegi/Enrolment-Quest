#!/usr/bin/env python3
"""Export seamless Day/Night L1 playable packs + landmarks."""
from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageChops, ImageFilter

SRC = Path("/Users/kalkikaul/.cursor/projects/Users-kalkikaul-Enrolment-Quest/assets")
ROOT = Path("/Users/kalkikaul/Enrolment Quest")
WIP = ROOT / "assets/sprites/_wip"

BG = (960, 540)
BG_HI = (1920, 1080)
TILE = (64, 64)
CLOUD = (128, 64)


def load(name: str) -> Image.Image:
    p = SRC / name
    if not p.exists():
        raise FileNotFoundError(p)
    return Image.open(p).convert("RGBA")


def resize_bg(im: Image.Image) -> Image.Image:
    return im.resize(BG, Image.Resampling.LANCZOS)


def resize_bg_hi(im: Image.Image) -> Image.Image:
    return im.resize(BG_HI, Image.Resampling.LANCZOS)


def resize_tile(im: Image.Image) -> Image.Image:
    w, h = im.size
    side = min(w, h)
    left, top = (w - side) // 2, (h - side) // 2
    return im.crop((left, top, left + side, top + side)).resize(TILE, Image.Resampling.LANCZOS)


def make_seamless_x(im: Image.Image, blend: int = 48) -> Image.Image:
    """Crossfade left/right edges so horizontal tiling is less obvious."""
    im = im.convert("RGBA")
    w, h = im.size
    blend = min(blend, w // 4)
    out = im.copy()
    left = im.crop((0, 0, blend, h))
    right = im.crop((w - blend, 0, w, h))
    # paste mirrored overlap with gradient alpha
    for i in range(blend):
        t = i / max(1, blend - 1)
        # mix right-edge column into left side and vice versa
        col_r = right.crop((i, 0, i + 1, h))
        col_l = left.crop((i, 0, i + 1, h))
        # left side gets contribution from right
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
            is_night_sky = b >= g and b >= r and (b - r) > 20 and yk < 0.55
            is_groundish = g > r + 12 and g > b + 8
            is_warm = r > g + 18 and r > b + 18
            alpha = 255
            if yk < 0.40 and (dist < 58 or is_pale or is_night_sky) and not is_groundish and not is_warm:
                alpha = 0
            elif yk < 0.55 and (dist < 42 or is_pale or is_night_sky) and not is_groundish and not is_warm:
                alpha = 0
            elif yk < 0.65 and (dist < 30 or is_pale) and not is_groundish:
                alpha = max(0, int(255 * (yk - 0.50) / 0.15))
            opx[x, y] = (r, g, b, alpha)
    return out


def extract_cloud(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    w, h = im.size
    crop = im.crop((int(w * 0.15), int(h * 0.15), int(w * 0.85), int(h * 0.75)))
    px = crop.load()
    cw, ch = crop.size
    for y in range(ch):
        for x in range(cw):
            r, g, b, a = px[x, y]
            is_sky = (b > r + 15 and b > g) or (r < 40 and g < 40 and b < 70)
            is_cloud = (r + g + b) > 400 and abs(r - g) < 45
            if is_sky and not is_cloud:
                px[x, y] = (0, 0, 0, 0)
            elif not is_cloud and (r + g + b) < 280:
                px[x, y] = (0, 0, 0, 0)
    bbox = crop.getbbox()
    if bbox:
        crop = crop.crop(bbox)
    out = Image.new("RGBA", CLOUD, (0, 0, 0, 0))
    tw, th = crop.size
    scale = min(CLOUD[0] / tw, CLOUD[1] / th)
    nw, nh = max(1, int(tw * scale)), max(1, int(th * scale))
    fitted = crop.resize((nw, nh), Image.Resampling.LANCZOS)
    out.paste(fitted, ((CLOUD[0] - nw) // 2, (CLOUD[1] - nh) // 2), fitted)
    return out


def key_transparent_bg(im: Image.Image) -> Image.Image:
    """Remove near-uniform corner/sky background for landmark sprites."""
    im = im.convert("RGBA")
    w, h = im.size
    corners = [im.getpixel((2, 2)), im.getpixel((w - 3, 2)), im.getpixel((2, h - 3)), im.getpixel((w - 3, h - 3))]
    # pick most common-ish avg
    sr = sum(c[0] for c in corners) / 4
    sg = sum(c[1] for c in corners) / 4
    sb = sum(c[2] for c in corners) / 4
    px = im.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            dist = ((r - sr) ** 2 + (g - sg) ** 2 + (b - sb) ** 2) ** 0.5
            if dist < 38:
                px[x, y] = (0, 0, 0, 0)
    return im


def fit_landmark(im: Image.Image, size: tuple[int, int]) -> Image.Image:
    im = key_transparent_bg(im)
    bbox = im.getbbox() or (0, 0, im.width, im.height)
    im = im.crop(bbox)
    out = Image.new("RGBA", size, (0, 0, 0, 0))
    tw, th = im.size
    scale = min(size[0] / tw, size[1] / th) * 0.92
    nw, nh = max(1, int(tw * scale)), max(1, int(th * scale))
    fitted = im.resize((nw, nh), Image.Resampling.LANCZOS)
    out.paste(fitted, ((size[0] - nw) // 2, size[1] - nh), fitted)  # feet on bottom
    return out


def export_set(tag: str, folder: str, mapping: dict):
    out = WIP / folder
    out.mkdir(parents=True, exist_ok=True)
    print(f"=== {tag} → {folder}")

    sky = load(mapping["sky"])
    resize_bg(sky).save(out / "bg_l1.png", optimize=True)
    resize_bg_hi(sky).save(out / "bg_l1_1920.png", optimize=True)

    layers = {}
    for key, src_name in [
        ("parallax_l1_far", mapping["far"]),
        ("parallax_l1_mid", mapping["mid"]),
        ("parallax_l1_near", mapping["near"]),
    ]:
        raw = make_seamless_x(resize_bg(load(src_name)))
        raw.save(out / f"_src_{key.split('_')[-1]}.png", optimize=True)
        alpha = sky_to_alpha(raw)
        alpha.save(out / f"{key}.png", optimize=True)
        layers[key] = alpha
        print(f"  {key} {alpha.size}")

    for key, src_name in [
        ("tile_top", mapping["tile_top"]),
        ("tile_ground", mapping["tile_ground"]),
        ("tile_platform", mapping["tile_platform"]),
        ("tile_brick", mapping["tile_brick"]),
        ("tile_metal", mapping["tile_metal"]),
    ]:
        t = resize_tile(load(src_name))
        t.save(out / f"{key}.png", optimize=True)

    cloud = extract_cloud(load(mapping["cloud"]))
    cloud.save(out / "cloud.png", optimize=True)

    if "landmark_start" in mapping:
        fit_landmark(load(mapping["landmark_start"]), (128, 128)).save(out / "landmark_l1_start.png", optimize=True)
        print("  landmark_l1_start 128x128")
    if "landmark_end" in mapping:
        fit_landmark(load(mapping["landmark_end"]), (192, 224)).save(out / "landmark_l1_end.png", optimize=True)
        print("  landmark_l1_end 192x224")

    comp = resize_bg(sky).convert("RGBA")
    for k in ("parallax_l1_far", "parallax_l1_mid", "parallax_l1_near"):
        comp = Image.alpha_composite(comp, layers[k])
    prev = Image.new("RGBA", (960, 620), (12, 12, 20, 255))
    prev.paste(comp, (0, 0))
    x = 16
    for t in ("tile_top", "tile_ground", "tile_platform", "tile_brick", "tile_metal"):
        im = Image.open(out / f"{t}.png").convert("RGBA")
        prev.paste(im, (x, 552), im)
        x += 72
    if (out / "landmark_l1_end.png").exists():
        lm = Image.open(out / "landmark_l1_end.png").convert("RGBA")
        lm = lm.resize((64, 74), Image.Resampling.NEAREST)
        prev.paste(lm, (860, 540), lm)
    prev.save(WIP / f"l1_preview_playable_{tag.lower()}.png", optimize=True)
    print(f"  preview ok")


def main():
    day_tiles = {
        "tile_top": "play_day_tile_top.png",
        "tile_ground": "play_day_tile_ground.png",
        "tile_platform": "play_day_tile_platform.png",
        "tile_brick": "play_day_tile_brick.png",
        "tile_metal": "play_day_tile_metal.png",
    }
    night_tiles = {
        "tile_top": "play_night_tile_top.png",
        "tile_ground": "play_night_tile_ground.png",
        "tile_platform": "play_night_tile_platform.png",
        "tile_brick": "play_night_tile_brick.png",
        "tile_metal": "play_night_tile_metal.png",
    }

    export_set(
        "Day",
        "l1_playable_day",
        {
            "sky": "play_day_sky_v2.png",
            "far": "play_day_far_seamless.png",
            "mid": "play_day_mid_seamless.png",
            "near": "play_day_near_seamless.png",
            "cloud": "play_day_sky_v2.png",
            "landmark_start": "play_day_landmark_start.png",
            "landmark_end": "play_day_landmark_end.png",
            **day_tiles,
        },
    )
    export_set(
        "Night",
        "l1_playable_night",
        {
            "sky": "play_night_sky.png",
            "far": "play_night_far_seamless.png",
            "mid": "play_night_mid_seamless.png",
            "near": "play_night_near_seamless.png",
            "cloud": "play_night_cloud.png",
            "landmark_start": "play_day_landmark_start.png",  # reuse shape; night tint later
            "landmark_end": "play_day_landmark_end.png",
            **night_tiles,
        },
    )
    print("DONE")


if __name__ == "__main__":
    main()
