#!/usr/bin/env python3
"""Export final native-1080p Level 1 and Level 2 world art.

The source plates use a uniform matte above the scenery. This exporter removes
that matte across the full frame, builds mathematically matching horizontal
edges, validates the result, and installs native 1920x1080 assets.
"""
from __future__ import annotations

import argparse
import math
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
CURSOR_ASSETS = Path(
    "/Users/kalkikaul/.cursor/projects/Users-kalkikaul-Enrolment-Quest/assets"
)
WIP = ROOT / "assets/sprites/_wip"
SOURCE_DIR = WIP / "l12_final_sources"
PUBLIC = ROOT / "public/sprites"
PLATE = (1920, 1080)

LEVELS = {
    1: {
        "folder": "l1_playable_day",
        "sky": "l1_final_sky_source.png",
        "far": "l1_final_far_source.png",
        "mid": "l1_final_mid_source.png",
        "near": "l1_final_near_source.png",
    },
    2: {
        "folder": "l2_playable_day",
        "sky": "l2_final_sky_source.png",
        "far": "l2_final_far_source.png",
        "mid": "l2_final_mid_source.png",
        "near": "l2_final_near_source.png",
    },
}


def archive_source(filename: str) -> Path:
    SOURCE_DIR.mkdir(parents=True, exist_ok=True)
    local = SOURCE_DIR / filename
    if local.exists():
        return local
    generated = CURSOR_ASSETS / filename
    if not generated.exists():
        raise FileNotFoundError(f"Missing generated source: {filename}")
    Image.open(generated).save(local, "PNG", optimize=True)
    print(f"  archived {local.relative_to(ROOT)}")
    return local


def resize_cover(im: Image.Image, preserve_bottom: bool) -> Image.Image:
    """Cover 16:9 without stretching; scenery plates retain their baseline."""
    tw, th = PLATE
    scale = max(tw / im.width, th / im.height)
    resized = im.resize(
        (max(1, round(im.width * scale)), max(1, round(im.height * scale))),
        Image.Resampling.LANCZOS,
    )
    left = max(0, (resized.width - tw) // 2)
    if preserve_bottom:
        top = max(0, resized.height - th)
    else:
        top = max(0, (resized.height - th) // 2)
    return resized.crop((left, top, left + tw, top + th)).convert("RGBA")


def matte_colour(im: Image.Image) -> tuple[float, float, float]:
    rgb = im.convert("RGB")
    samples: list[tuple[int, int, int]] = []
    for fy in (0.02, 0.08, 0.16, 0.28, 0.42):
        y = min(rgb.height - 1, round(rgb.height * fy))
        for fx in (0.01, 0.18, 0.50, 0.82, 0.99):
            x = min(rgb.width - 1, round(rgb.width * fx))
            samples.append(rgb.getpixel((x, y)))
    return tuple(sum(c[i] for c in samples) / len(samples) for i in range(3))


def matte_to_alpha(
    im: Image.Image, feather: tuple[float, float] = (12, 48)
) -> Image.Image:
    """Remove the generated matte everywhere, including below the old 55% cutoff."""
    rgba = im.convert("RGBA")
    bg = matte_colour(rgba)
    low, high = feather
    px = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, _ = px[x, y]
            distance = math.sqrt(
                (r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2
            )
            if distance <= low:
                alpha = 0
            elif distance >= high:
                alpha = 255
            else:
                t = (distance - low) / (high - low)
                t = t * t * (3 - 2 * t)
                alpha = round(255 * t)
            px[x, y] = (r, g, b, alpha)
    return rgba


def make_seamless_x(im: Image.Image, blend: int = 260) -> Image.Image:
    """Feather mirrored edge pairs; first and last columns become identical."""
    source = im.convert("RGBA")
    out = source.copy()
    w, h = source.size
    blend = min(blend, w // 4)
    for i in range(blend):
        t = i / max(1, blend - 1)
        smooth = t * t * (3 - 2 * t)
        edge_weight = 0.5 * (1 - smooth)
        left = source.crop((i, 0, i + 1, h))
        right = source.crop((w - 1 - i, 0, w - i, h))
        out.paste(Image.blend(left, right, edge_weight), (i, 0))
        out.paste(Image.blend(right, left, edge_weight), (w - 1 - i, 0))
    return out


def validate_layer(name: str, im: Image.Image) -> None:
    if im.size != PLATE:
        raise RuntimeError(f"{name}: expected {PLATE}, got {im.size}")
    alpha = im.getchannel("A")
    top = alpha.crop((0, 0, im.width, im.height // 2))
    clear_ratio = sum(top.histogram()[:8]) / (top.width * top.height)
    if clear_ratio < 0.985:
        raise RuntimeError(f"{name}: upper half only {clear_ratio:.1%} clear")
    left = list(im.crop((0, 0, 1, im.height)).getdata())
    right = list(im.crop((im.width - 1, 0, im.width, im.height)).getdata())
    mismatch = max(
        abs(a - b)
        for left_px, right_px in zip(left, right)
        for a, b in zip(left_px, right_px)
    )
    if mismatch > 1:
        raise RuntimeError(f"{name}: edge mismatch {mismatch}")
    print(f"  {name}: 1920x1080 · upper clear {clear_ratio:.1%} · edge Δ{mismatch}")


def write_level(level: int, install: bool) -> None:
    config = LEVELS[level]
    out = WIP / str(config["folder"])
    story = WIP / f"storybook_world_l{level}"
    out.mkdir(parents=True, exist_ok=True)
    story.mkdir(parents=True, exist_ok=True)

    sources = {
        key: archive_source(str(config[key]))
        for key in ("sky", "far", "mid", "near")
    }
    assets = {
        f"bg_l{level}": resize_cover(Image.open(sources["sky"]), False),
        f"parallax_l{level}_far": make_seamless_x(
            matte_to_alpha(resize_cover(Image.open(sources["far"]), True))
        ),
        f"parallax_l{level}_mid": make_seamless_x(
            matte_to_alpha(resize_cover(Image.open(sources["mid"]), True))
        ),
        f"parallax_l{level}_near": make_seamless_x(
            matte_to_alpha(resize_cover(Image.open(sources["near"]), True))
        ),
    }

    for name in (
        f"parallax_l{level}_far",
        f"parallax_l{level}_mid",
        f"parallax_l{level}_near",
    ):
        validate_layer(name, assets[name])

    for name, image in assets.items():
        image.save(out / f"{name}.png", "PNG", optimize=True)
        image.save(story / f"{name}.png", "PNG", optimize=True)
        if install:
            PUBLIC.mkdir(parents=True, exist_ok=True)
            image.save(PUBLIC / f"{name}.png", "PNG", optimize=True)
            print(f"  installed public/sprites/{name}.png")

    preview = assets[f"bg_l{level}"].copy()
    for depth in ("far", "mid", "near"):
        preview = Image.alpha_composite(
            preview, assets[f"parallax_l{level}_{depth}"]
        )
    preview.resize((960, 540), Image.Resampling.LANCZOS).save(
        WIP / f"l{level}_preview_final.png", "PNG", optimize=True
    )

    # Put an actual layer boundary in the centre for visual seam inspection.
    repeated = assets[f"bg_l{level}"].resize((3840, 1080), Image.Resampling.LANCZOS)
    for depth in ("far", "mid", "near"):
        layer = assets[f"parallax_l{level}_{depth}"]
        repeated.alpha_composite(layer, (0, 0))
        repeated.alpha_composite(layer, (1920, 0))
    repeated.crop((960, 0, 2880, 1080)).resize(
        (960, 540), Image.Resampling.LANCZOS
    ).save(WIP / f"l{level}_preview_repeat_seam.png", "PNG", optimize=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--level", choices=("1", "2", "all"), default="all")
    parser.add_argument("--install", action="store_true")
    args = parser.parse_args()
    levels = (1, 2) if args.level == "all" else (int(args.level),)
    for level in levels:
        print(f"=== Level {level} final world art ===")
        write_level(level, args.install)


if __name__ == "__main__":
    main()
