#!/usr/bin/env python3
"""Export the contemporary Bangalore garden-bazaar Level 3 world pack.

The source plates are intentionally independent:
  - sky: atmosphere only
  - far: Bangalore skyline behind a broad tree canopy
  - mid: airy contemporary garden-market kiosks
  - near: restrained planters, benches, and market accents

Generated source art is copied into the repository on first run so later
exports do not depend on Cursor's temporary asset directory.
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
SOURCE_DIR = WIP / "l3_modern_sources"
OUT = WIP / "l3_playable_day"
STORY = WIP / "storybook_world_l3"
PUBLIC = ROOT / "public/sprites"

PLATE = (1920, 1080)
LANDMARK = (512, 576)
SOURCE_FILES = {
    "sky": "l3_bangalore_sky_source.png",
    "far": "l3_bangalore_far_source.png",
    "mid": "l3_bangalore_mid_source.png",
    "near": "l3_bangalore_near_source.png",
    "landmarks": "l3_bangalore_landmark_options.png",
}


def ensure_sources() -> dict[str, Path]:
    SOURCE_DIR.mkdir(parents=True, exist_ok=True)
    result: dict[str, Path] = {}
    for key, filename in SOURCE_FILES.items():
        local = SOURCE_DIR / filename
        if not local.exists():
            generated = CURSOR_ASSETS / filename
            if not generated.exists():
                raise FileNotFoundError(
                    f"Missing {filename}. Generate it or place it in {SOURCE_DIR}."
                )
            Image.open(generated).save(local, "PNG", optimize=True)
            print(f"  archived source {local.relative_to(ROOT)}")
        result[key] = local
    return result


def resize_preserve_bottom(im: Image.Image, size: tuple[int, int]) -> Image.Image:
    """Cover target dimensions while preserving lower architecture."""
    tw, th = size
    scale = max(tw / im.width, th / im.height)
    resized = im.resize(
        (max(1, round(im.width * scale)), max(1, round(im.height * scale))),
        Image.Resampling.LANCZOS,
    )
    left = max(0, (resized.width - tw) // 2)
    top = max(0, resized.height - th)
    return resized.crop((left, top, left + tw, top + th))


def resize_sky(im: Image.Image) -> Image.Image:
    """Cover the frame with the authored atmospheric sky."""
    tw, th = PLATE
    scale = max(tw / im.width, th / im.height)
    resized = im.resize(
        (max(1, round(im.width * scale)), max(1, round(im.height * scale))),
        Image.Resampling.LANCZOS,
    )
    left = max(0, (resized.width - tw) // 2)
    top = max(0, (resized.height - th) // 2)
    return resized.crop((left, top, left + tw, top + th)).convert("RGBA")


def background_colour(im: Image.Image) -> tuple[float, float, float]:
    """Estimate the generated peach matte from the upper image."""
    rgb = im.convert("RGB")
    samples: list[tuple[int, int, int]] = []
    for fy in (0.03, 0.12, 0.24, 0.38):
        y = min(rgb.height - 1, int(rgb.height * fy))
        for fx in (0.02, 0.18, 0.50, 0.82, 0.98):
            x = min(rgb.width - 1, int(rgb.width * fx))
            samples.append(rgb.getpixel((x, y)))
    return tuple(sum(c[i] for c in samples) / len(samples) for i in range(3))


def matte_to_alpha(im: Image.Image, feather: tuple[float, float] = (14, 52)) -> Image.Image:
    """Remove the generated peach matte with a feathered colour-distance key."""
    rgba = im.convert("RGBA")
    bg = background_colour(rgba)
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


def make_seamless_x(im: Image.Image, blend: int = 180) -> Image.Image:
    """Cross-blend plate edges so the engine's horizontal repeat has no hard seam."""
    im = im.convert("RGBA")
    w, h = im.size
    blend = min(blend, w // 4)
    out = im.copy()
    left = im.crop((0, 0, blend, h))
    right = im.crop((w - blend, 0, w, h))
    for i in range(blend):
        t = i / max(1, blend - 1)
        smooth = t * t * (3 - 2 * t)
        left_mix = Image.blend(
            left.crop((i, 0, i + 1, h)),
            right.crop((i, 0, i + 1, h)),
            1 - smooth,
        )
        right_mix = Image.blend(
            right.crop((i, 0, i + 1, h)),
            left.crop((i, 0, i + 1, h)),
            smooth,
        )
        out.paste(left_mix, (i, 0))
        out.paste(right_mix, (w - blend + i, 0))
    return out


def export_layer(source: Path, lift: int = 0) -> Image.Image:
    authored = resize_preserve_bottom(Image.open(source).convert("RGBA"), PLATE)
    keyed = make_seamless_x(matte_to_alpha(authored))
    if lift <= 0:
        return keyed
    raised = Image.new("RGBA", PLATE, (0, 0, 0, 0))
    raised.alpha_composite(keyed, (0, -lift))
    return raised


def neutral_sheet_to_alpha(im: Image.Image) -> Image.Image:
    """Key the light neutral option-sheet background without harming warm walls."""
    rgba = im.convert("RGBA")
    corners = [
        rgba.getpixel((8, 8))[:3],
        rgba.getpixel((rgba.width - 9, 8))[:3],
        rgba.getpixel((8, rgba.height - 9))[:3],
        rgba.getpixel((rgba.width - 9, rgba.height - 9))[:3],
    ]
    bg = tuple(sum(c[i] for c in corners) / len(corners) for i in range(3))
    px = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, _ = px[x, y]
            distance = math.sqrt(
                (r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2
            )
            alpha = max(0, min(255, round((distance - 10) / 34 * 255)))
            px[x, y] = (r, g, b, alpha)
    return rgba


def extract_option(
    sheet_path: Path,
    box: tuple[int, int, int, int],
    target: tuple[int, int] = LANDMARK,
) -> Image.Image:
    sheet = neutral_sheet_to_alpha(Image.open(sheet_path))
    option = sheet.crop(box)
    alpha = option.getchannel("A")
    bbox = alpha.point(lambda value: 255 if value > 24 else 0).getbbox()
    if not bbox:
        raise RuntimeError(f"No landmark artwork found in {sheet_path.name} {box}")
    option = option.crop(bbox)

    tw, th = target
    scale = min((tw * 0.94) / option.width, (th * 0.94) / option.height)
    fitted = option.resize(
        (max(1, round(option.width * scale)), max(1, round(option.height * scale))),
        Image.Resampling.LANCZOS,
    )
    out = Image.new("RGBA", target, (0, 0, 0, 0))
    out.alpha_composite(fitted, ((tw - fitted.width) // 2, th - fitted.height))
    return out


def validate_layer(name: str, im: Image.Image) -> None:
    if im.size != PLATE:
        raise RuntimeError(f"{name}: expected {PLATE}, got {im.size}")
    alpha = im.getchannel("A")
    top = alpha.crop((0, 0, im.width, im.height // 2))
    transparent = sum(top.histogram()[:8])
    ratio = transparent / (top.width * top.height)
    if ratio < 0.92:
        raise RuntimeError(f"{name}: upper-half transparency only {ratio:.0%}")
    print(f"  {name}: upper-half clear {ratio:.0%}")


def write_pack(install: bool) -> None:
    sources = ensure_sources()
    OUT.mkdir(parents=True, exist_ok=True)
    STORY.mkdir(parents=True, exist_ok=True)

    assets = {
        "bg_l3": resize_sky(Image.open(sources["sky"])),
        # Raise the skyline above the kiosk roofline so Bangalore remains legible.
        "parallax_l3_far": export_layer(sources["far"], lift=150),
        "parallax_l3_mid": export_layer(sources["mid"]),
        "parallax_l3_near": export_layer(sources["near"]),
        # Top-left: tall contemporary garden-bazaar arrival gateway.
        "landmark_l3_start": extract_option(
            sources["landmarks"], (0, 0, 768, 512)
        ),
        # Bottom-right: large planted destination pavilion leading toward summary.
        "landmark_l3_end": extract_option(
            sources["landmarks"], (768, 512, 1536, 1024)
        ),
    }

    for key in ("parallax_l3_far", "parallax_l3_mid", "parallax_l3_near"):
        validate_layer(key, assets[key])

    for key, image in assets.items():
        image.save(OUT / f"{key}.png", "PNG", optimize=True)
        image.save(STORY / f"{key}.png", "PNG", optimize=True)

    preview = assets["bg_l3"].copy()
    for key in ("parallax_l3_far", "parallax_l3_mid", "parallax_l3_near"):
        preview = Image.alpha_composite(preview, assets[key])
    preview = preview.resize((960, 540), Image.Resampling.LANCZOS)
    start = assets["landmark_l3_start"].resize((96, 112), Image.Resampling.LANCZOS)
    end = assets["landmark_l3_end"].resize((96, 112), Image.Resampling.LANCZOS)
    preview.alpha_composite(start, (30, 410))
    preview.alpha_composite(end, (830, 410))
    preview.save(WIP / "l3_preview_bangalore_bazaar.png", "PNG", optimize=True)

    if install:
        PUBLIC.mkdir(parents=True, exist_ok=True)
        for key, image in assets.items():
            image.save(PUBLIC / f"{key}.png", "PNG", optimize=True)
            print(f"  installed public/sprites/{key}.png")

    print(f"  preview {WIP / 'l3_preview_bangalore_bazaar.png'}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--install", action="store_true")
    args = parser.parse_args()
    write_pack(args.install)


if __name__ == "__main__":
    main()
