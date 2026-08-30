#!/usr/bin/env python3
"""
Generate chunky Style-C playable world layers for L1 + L2.

No soft AI, no chroma-key: hard-edge pixel art with true alpha.
Authored at logical 960×540 (or 128×128 landmarks), nearest-upscaled to
native SPRITE_DEFS sizes (1920×1080 / 256×256).

Output: assets/sprites/_wip/chunky_world_{l1,l2}/
Install: python3 scripts/gen_chunky_world_layers.py --install
"""
from __future__ import annotations

import argparse
import math
import os
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT_L1 = ROOT / "assets/sprites/_wip/chunky_world_l1"
OUT_L2 = ROOT / "assets/sprites/_wip/chunky_world_l2"
PUBLIC = ROOT / "public/sprites"

W, H = 960, 540  # logical authoring
RES = 2


def nn_up(im: Image.Image, scale: int = RES) -> Image.Image:
    return im.resize((im.width * scale, im.height * scale), Image.Resampling.NEAREST)


def lerp(a: tuple, b: tuple, t: float) -> tuple:
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(len(a)))


def sky_plate(top: tuple, bottom: tuple, sun: tuple | None = None) -> Image.Image:
    """Opaque gradient sky — no hills (parallax owns silhouette)."""
    im = Image.new("RGBA", (W, H))
    px = im.load()
    for y in range(H):
        t = y / (H - 1)
        c = lerp(top, bottom, t)
        for x in range(W):
            px[x, y] = (*c, 255)
    if sun:
        cx, cy, r = int(W * 0.82), int(H * 0.14), 28
        draw = ImageDraw.Draw(im)
        # soft glow as flat rings (still hard pixels)
        for rr, a in ((r + 10, 40), (r + 4, 90), (r, 230)):
            draw.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], fill=(*sun, a))
    return im


def y_at(x: float, base: float, waves: list[dict]) -> float:
    y = base
    for wv in waves:
        y -= wv["a"] * (math.sin(2 * math.pi * wv["k"] * x / W + wv["p"]) + 1) / 2
    return y


def hill_layer(
    color: tuple,
    base: float,
    waves: list[dict],
    deco=None,
    outline: tuple | None = None,
) -> Image.Image:
    """Seamless hill fill (integer k) with transparent sky. Content stays low."""
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    px = im.load()
    # Precompute ridge
    ridge = [y_at(i, base, waves) for i in range(W)]
    for x in range(W):
        top = int(ridge[x])
        for y in range(max(0, top), H):
            px[x, y] = (*color, 255)
        if outline and 0 <= top < H:
            px[x, top] = (*outline, 255)
            if top + 1 < H:
                px[x, top + 1] = (*outline, 255)
    if deco:
        deco(im, ridge)
    return im


def put_px(im: Image.Image, x: int, y: int, c: tuple):
    if 0 <= x < im.width and 0 <= y < im.height:
        im.putpixel((x, y), c)


def fill_rect(im: Image.Image, x0, y0, w, h, c):
    draw = ImageDraw.Draw(im)
    draw.rectangle([x0, y0, x0 + w - 1, y0 + h - 1], fill=c)


def pine(im: Image.Image, cx: int, cy: int, sc: float, col: tuple, trunk: tuple):
    """Chucky pine — triangle stacks."""
    tw = max(2, int(2 * sc))
    fill_rect(im, cx - tw // 2, cy - int(4 * sc), tw, int(4 * sc), trunk)
    for t in range(3):
        wdt = int((14 - t * 4) * sc)
        hgt = int(8 * sc)
        py = cy - int(4 * sc) - (t + 1) * hgt + int(2 * t * sc)
        pts = [(cx - wdt // 2, py + hgt), (cx, py), (cx + wdt // 2, py + hgt)]
        ImageDraw.Draw(im).polygon(pts, fill=col)


def bush(im: Image.Image, cx: int, cy: int, sc: float, col: tuple, dark: tuple):
    """Blocky scrub — rect clusters only (no soft ellipses)."""
    s = max(1, int(round(sc)))
    chunks = [
        (-6 * s, -2 * s, 6 * s, 5 * s),
        (-2 * s, -6 * s, 6 * s, 6 * s),
        (4 * s, -2 * s, 6 * s, 5 * s),
        (-1 * s, -8 * s, 4 * s, 3 * s),
    ]
    for ox, oy, w, h in chunks:
        fill_rect(im, cx + ox, cy + oy, w, h, col)
    fill_rect(im, cx - 7 * s, cy + 2 * s, 14 * s, 3 * s, dark)


def marigold_dots(im: Image.Image, ridge, xs, color=(232, 140, 48, 255)):
    for i, x in enumerate(xs):
        y = int(ridge[x % W]) + 6 + (i % 3)
        fill_rect(im, x, y, 2, 2, color)


# ---------- L1 Neem Morning palettes ----------
L1 = {
    "sky_top": (92, 200, 255),
    "sky_bot": (198, 240, 255),
    "sun": (255, 248, 200),
    "far": (143, 212, 168),
    "far_line": (110, 180, 140),
    "mid": (87, 176, 110),
    "mid_line": (60, 140, 85),
    "pine": (47, 110, 70),
    "trunk": (90, 60, 40),
    "near": (47, 138, 76),
    "near_line": (30, 100, 55),
    "bush": (36, 110, 60),
    "bush_d": (28, 85, 48),
}

# ---------- L2 Clinic Highlands ----------
L2 = {
    "sky_top": (74, 168, 232),
    "sky_bot": (255, 233, 184),
    "sun": (255, 236, 160),
    "far": (159, 212, 184),
    "far_line": (120, 180, 155),
    "mid": (95, 184, 138),
    "mid_line": (60, 140, 110),
    "pine": (40, 120, 100),
    "trunk": (80, 70, 55),
    "near": (47, 138, 104),
    "near_line": (30, 100, 80),
    "bush": (36, 120, 95),
    "bush_d": (28, 90, 72),
}


def build_parallax(pal: dict) -> dict[str, Image.Image]:
    far = hill_layer(
        pal["far"],
        430,
        [{"a": 170, "k": 2, "p": 0.0}, {"a": 70, "k": 5, "p": 1.7}],
        outline=pal["far_line"],
    )
    mid = hill_layer(
        pal["mid"],
        470,
        [{"a": 120, "k": 3, "p": 2.4}, {"a": 46, "k": 7, "p": 0.6}],
        outline=pal["mid_line"],
        deco=lambda im, ridge: [
            pine(
                im,
                px,
                int(ridge[px]) + 14,
                1 + (i % 2) * 0.35,
                pal["pine"],
                pal["trunk"],
            )
            for i, px in enumerate([140, 290, 470, 650, 820])
        ],
    )
    near = hill_layer(
        pal["near"],
        505,
        [{"a": 64, "k": 4, "p": 4.2}, {"a": 26, "k": 9, "p": 1.2}],
        outline=pal["near_line"],
        deco=lambda im, ridge: (
            [
                bush(
                    im,
                    px,
                    int(ridge[px]) + 8,
                    0.9 + (i % 3) * 0.25,
                    pal["bush"],
                    pal["bush_d"],
                )
                for i, px in enumerate([90, 240, 410, 560, 730, 880])
            ]
            + [marigold_dots(im, ridge, [100, 250, 420, 570, 740, 890])]
        ),
    )
    return {"far": far, "mid": mid, "near": near}


# ---------- Start landmarks (logical 160×160 → 320×320) ----------
LW = LH = 160


def landmark_l1_neem_arch() -> Image.Image:
    """Terracotta garden arch + neem canopy — fills most of cell."""
    im = Image.new("RGBA", (LW, LH), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    terra = (196, 120, 74, 255)
    terra_d = (138, 85, 51, 255)
    terra_l = (220, 150, 100, 255)
    leaf = (47, 138, 76, 255)
    leaf_d = (30, 100, 55, 255)
    leaf_l = (90, 170, 100, 255)
    soil = (120, 78, 48, 255)

    d.rectangle([6, 146, 153, 159], fill=soil)

    for x0 in (14, 124):
        d.rectangle([x0, 48, x0 + 22, 146], fill=terra)
        d.rectangle([x0, 48, x0 + 5, 146], fill=terra_l)
        d.rectangle([x0 + 17, 48, x0 + 22, 146], fill=terra_d)
        d.rectangle([x0 - 5, 38, x0 + 27, 52], fill=terra_l)
        d.rectangle([x0 - 5, 38, x0 + 27, 42], fill=terra_d)

    d.rectangle([8, 28, 151, 48], fill=terra)
    d.rectangle([8, 28, 151, 34], fill=terra_l)
    d.rectangle([8, 42, 151, 48], fill=terra_d)

    for cx, cy, r in (
        (44, 22, 22),
        (80, 12, 30),
        (116, 22, 22),
        (62, 28, 16),
        (98, 28, 16),
        (80, 34, 14),
    ):
        d.rectangle([cx - r, cy - r // 2, cx + r, cy + r // 2], fill=leaf)
        d.rectangle([cx - r // 2, cy - r, cx + r // 2, cy + r // 3], fill=leaf)
    for cx, cy, r in ((60, 32, 12), (100, 32, 12), (80, 38, 14)):
        d.rectangle([cx - r, cy - r // 2, cx + r, cy + r // 2], fill=leaf_d)
    for x, y in ((54, 4), (80, 0), (106, 6), (70, 14), (90, 12), (62, 20)):
        d.rectangle([x, y, x + 4, y + 4], fill=leaf_l)

    for x in (28, 80, 128):
        d.rectangle([x, 138, x + 5, 143], fill=(232, 140, 48, 255))

    return im


def landmark_l2_trail_marker() -> Image.Image:
    """Highland cairn + clinic milepost — large in-frame."""
    im = Image.new("RGBA", (LW, LH), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    stone = (160, 168, 175, 255)
    stone_d = (110, 118, 128, 255)
    stone_l = (200, 206, 214, 255)
    wood = (138, 85, 51, 255)
    wood_d = (90, 55, 35, 255)
    teal = (47, 138, 104, 255)
    teal_l = (90, 190, 160, 255)
    gold = (232, 180, 64, 255)
    soil = (90, 100, 95, 255)

    d.rectangle([6, 148, 153, 159], fill=soil)

    blocks = [
        (16, 114, 50, 34),
        (12, 86, 58, 30),
        (18, 60, 48, 28),
        (26, 40, 34, 22),
        (34, 24, 22, 18),
    ]
    for i, (x, y, w, h) in enumerate(blocks):
        c = stone_l if i % 2 == 0 else stone
        d.rectangle([x, y, x + w, y + h], fill=c)
        d.rectangle([x, y + h - 5, x + w, y + h], fill=stone_d)
        d.rectangle([x, y, x + 4, y + h], fill=stone_l)

    d.rectangle([104, 32, 122, 148], fill=wood)
    d.rectangle([104, 32, 109, 148], fill=(180, 130, 80, 255))
    d.rectangle([117, 32, 122, 148], fill=wood_d)
    d.rectangle([72, 40, 152, 88], fill=teal)
    d.rectangle([72, 40, 152, 48], fill=teal_l)
    d.rectangle([72, 80, 152, 88], fill=(30, 100, 80, 255))
    d.polygon([(112, 48), (138, 58), (138, 76), (112, 84), (86, 76), (86, 58)], fill=gold)
    d.polygon([(112, 52), (130, 60), (130, 72), (112, 78), (94, 72), (94, 60)], fill=teal_l)

    for x in (70, 82, 94):
        d.rectangle([x, 142, x + 8, 148], fill=stone_d)

    return im


def assert_no_checkerboard(im: Image.Image, name: str):
    """Fail if classic light/dark checkerboard pattern dominates (baked preview)."""
    px = im.load()
    w, h = im.size
    # Sample for alternating gray pairs typical of transparency previews
    hits = 0
    samples = 0
    for y in range(0, h, 8):
        for x in range(0, w, 8):
            r, g, b, a = px[x, y]
            samples += 1
            if a > 200 and abs(r - g) < 8 and abs(g - b) < 8 and 180 <= r <= 220:
                # light gray cell
                nx, ny = min(w - 1, x + 8), min(h - 1, y + 8)
                r2, g2, b2, a2 = px[nx, ny]
                if a2 > 200 and abs(r2 - g2) < 8 and 100 <= r2 <= 160:
                    hits += 1
    if samples and hits / samples > 0.08:
        raise SystemExit(f"FAIL {name}: possible baked checkerboard ({hits}/{samples})")


def assert_alpha_ok(im: Image.Image, name: str, expect_clear_top: bool = False):
    if not expect_clear_top:
        return
    px = im.load()
    w, h = im.size
    clear = 0
    total = 0
    for y in range(0, h // 3, 4):
        for x in range(0, w, 4):
            total += 1
            if px[x, y][3] == 0:
                clear += 1
    if total and clear / total < 0.85:
        raise SystemExit(f"FAIL {name}: top third not mostly clear ({clear}/{total})")


def save_set(level: str, pal: dict, start_fn, out_dir: Path):
    out_dir.mkdir(parents=True, exist_ok=True)
    bg = sky_plate(pal["sky_top"], pal["sky_bot"], pal["sun"])
    layers = build_parallax(pal)
    start = start_fn()

    assets = {
        f"bg_{level}": nn_up(bg),
        f"parallax_{level}_far": nn_up(layers["far"]),
        f"parallax_{level}_mid": nn_up(layers["mid"]),
        f"parallax_{level}_near": nn_up(layers["near"]),
        f"landmark_{level}_start": nn_up(start),
    }

    for key, im in assets.items():
        assert_no_checkerboard(im, key)
        if "parallax" in key:
            assert_alpha_ok(im, key, expect_clear_top=True)
        path = out_dir / f"{key}.png"
        im.save(path, "PNG")
        print(f"  wrote {path.relative_to(ROOT)}  {im.size}")

    return assets


def install(assets_by_level: dict):
    PUBLIC.mkdir(parents=True, exist_ok=True)
    for assets in assets_by_level.values():
        for key, im in assets.items():
            dest = PUBLIC / f"{key}.png"
            im.save(dest, "PNG")
            print(f"  installed {dest.relative_to(ROOT)}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--install", action="store_true", help="Also copy into public/sprites")
    args = ap.parse_args()

    print("Generating L1 Neem Morning chunky layers…")
    a1 = save_set("l1", L1, landmark_l1_neem_arch, OUT_L1)
    print("Generating L2 Clinic Highlands chunky layers…")
    a2 = save_set("l2", L2, landmark_l2_trail_marker, OUT_L2)

    if args.install:
        print("Installing to public/sprites…")
        install({"l1": a1, "l2": a2})
        print("Done. Hard-refresh the game (Cmd+Shift+R).")
    else:
        print("Dry run complete. Re-run with --install to deploy.")


if __name__ == "__main__":
    main()
