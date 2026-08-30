#!/usr/bin/env python3
"""
Re-export L1+L2 world art at native 1920×1080 and fix landmarks:
- Magenta-key only (no eating white walls)
- Doorway faces LEFT (player approach)
- Solid opaque buildings
"""
from __future__ import annotations

from pathlib import Path
from PIL import Image

SRC = Path("/Users/kalkikaul/.cursor/projects/Users-kalkikaul-Enrolment-Quest/assets")
ROOT = Path("/Users/kalkikaul/Enrolment Quest")
WIP = ROOT / "assets/sprites/_wip"
BG = (1920, 1080)  # native device pixels — systemic contract


def load(name: str) -> Image.Image:
    p = SRC / name
    if not p.exists():
        # also try WIP scenic
        p2 = WIP / "world_neem_morning" / name
        if p2.exists():
            return Image.open(p2).convert("RGBA")
        raise FileNotFoundError(name)
    return Image.open(p).convert("RGBA")


def make_seamless_x(im: Image.Image, blend: int = 64) -> Image.Image:
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
    for x in range(0, w, max(1, w // 50)):
        for y in range(0, max(1, h // 10), 2):
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
            is_pale = r > 175 and g > 190 and b > 200 and abs(r - b) < 70
            is_groundish = g > r + 14 and g > b + 10
            is_warm_struct = r > g + 20 and r > b + 15
            alpha = 255
            if yk < 0.42 and (dist < 55 or is_pale) and not is_groundish and not is_warm_struct:
                alpha = 0
            elif yk < 0.56 and (dist < 40 or is_pale) and not is_groundish and not is_warm_struct:
                alpha = 0
            elif yk < 0.66 and (dist < 28 or is_pale) and not is_groundish:
                alpha = max(0, int(255 * (yk - 0.52) / 0.14))
            opx[x, y] = (r, g, b, alpha)
    return out


def magenta_key(im: Image.Image) -> Image.Image:
    """Remove only magenta (#FF00FF-ish) — never key black/white (that ate clinic walls)."""
    im = im.convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            # strong magenta / hot pink key
            if r >= 180 and b >= 180 and g <= 90:
                px[x, y] = (0, 0, 0, 0)
            elif r >= 200 and b >= 160 and g <= 120 and (r + b) > g * 3:
                px[x, y] = (0, 0, 0, 0)
    return im


def fit_landmark(im: Image.Image, size: tuple[int, int], flip: bool = False) -> Image.Image:
    im = magenta_key(im)
    if flip:
        im = im.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    bbox = im.getbbox()
    if not bbox:
        return Image.new("RGBA", size, (0, 0, 0, 0))
    im = im.crop(bbox)
    # Ensure fully opaque building pixels (fix soft holes)
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a > 40:
                px[x, y] = (r, g, b, 255)
            else:
                px[x, y] = (0, 0, 0, 0)
    out = Image.new("RGBA", size, (0, 0, 0, 0))
    tw, th = im.size
    scale = min(size[0] / tw, size[1] / th) * 0.96
    nw, nh = max(1, int(tw * scale)), max(1, int(th * scale))
    # NEAREST after integer-ish scale keeps harder edges for landmarks
    fitted = im.resize((nw, nh), Image.Resampling.LANCZOS)
    out.paste(fitted, ((size[0] - nw) // 2, size[1] - nh), fitted)
    return out


def export_level_pack(folder: str, sky: str, far: str, mid: str, near: str, extras: dict | None = None):
    out = WIP / folder
    out.mkdir(parents=True, exist_ok=True)
    print(f"=== {folder} @ {BG}")

    sky_im = load(sky).resize(BG, Image.Resampling.LANCZOS)
    # detect bg key from folder
    bg_key = "bg_l2" if "l2" in folder else "bg_l1"
    sky_im.save(out / f"{bg_key}.png", optimize=True)
    # also keep 960 preview companion? skip — native only

    for key, src in [
        (f"parallax_{'l2' if 'l2' in folder else 'l1'}_far", far),
        (f"parallax_{'l2' if 'l2' in folder else 'l1'}_mid", mid),
        (f"parallax_{'l2' if 'l2' in folder else 'l1'}_near", near),
    ]:
        raw = make_seamless_x(load(src).resize(BG, Image.Resampling.LANCZOS))
        alpha = sky_to_alpha(raw)
        alpha.save(out / f"{key}.png", optimize=True)
        print(f"  {key} {alpha.size}")

    if extras:
        for name, (src, size, flip) in extras.items():
            fit_landmark(load(src), size, flip=flip).save(out / f"{name}.png", optimize=True)
            print(f"  {name} {size} flip={flip}")


def main():
    # L1 day — native BGs + fixed left-door cottage
    export_level_pack(
        "l1_playable_day",
        sky="play_day_sky_v2.png",
        far="play_day_far_seamless.png",
        mid="play_day_mid_seamless.png",
        near="play_day_near_seamless.png",
        extras={
            "landmark_l1_end": ("play_l1_cottage_left_door.png", (384, 448), False),
        },
    )
    # keep existing start gate if present; refresh from day pack file if we have source
    start_src = SRC / "play_day_landmark_start.png"
    if start_src.exists():
        fit_landmark(Image.open(start_src).convert("RGBA"), (128, 128)).save(
            WIP / "l1_playable_day" / "landmark_l1_start.png", optimize=True
        )

    # Copy tiles/cloud from previous day pack if missing in this pass
    day = WIP / "l1_playable_day"
    # tiles already there from prior export — leave them

    # L2 day
    export_level_pack(
        "l2_playable_day",
        sky="play_l2_sky.png",
        far="play_l2_far_seamless.png",
        mid="play_l2_mid_seamless_v2.png",
        near="play_l2_near_seamless.png",
        extras={
            "landmark_l2_end": ("play_l2_clinic_left_door.png", (384, 448), False),
            "landmark_l2_start": ("play_l2_landmark_start.png", (128, 128), False),
        },
    )

    # bg_complete at native if scenic 1920 exists
    scenic = WIP / "world_neem_morning"
    complete_hi = scenic / "bg_complete_1920.png"
    complete_lo = scenic / "bg_complete.png"
    dest_complete = scenic / "bg_complete.png"
    if complete_hi.exists():
        Image.open(complete_hi).convert("RGBA").resize(BG, Image.Resampling.LANCZOS).save(dest_complete, optimize=True)
        print("bg_complete → 1920")
    elif complete_lo.exists():
        Image.open(complete_lo).convert("RGBA").resize(BG, Image.Resampling.LANCZOS).save(dest_complete, optimize=True)
        print("bg_complete upscaled → 1920")

    # Night pack BGs native too (reuse night sources if present)
    try:
        export_level_pack(
            "l1_playable_night",
            sky="play_night_sky.png",
            far="play_night_far_seamless.png",
            mid="play_night_mid_seamless.png",
            near="play_night_near_seamless.png",
            extras={
                "landmark_l1_end": ("play_l1_cottage_left_door.png", (384, 448), False),
            },
        )
    except FileNotFoundError as e:
        print("night skip:", e)

    print("DONE")


if __name__ == "__main__":
    main()
