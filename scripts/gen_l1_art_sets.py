#!/usr/bin/env python3
"""Generate Level 1 background / parallax / terrain sets (game-ready sizes).

Set A — Neem Morning
Set B — Colony Park Dawn

Outputs under assets/sprites/_wip/l1_set_{a,b}/ with SPRITE_DEFS filenames.
"""
from __future__ import annotations

import math
import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WIP = ROOT / "assets" / "sprites" / "_wip"

W, H = 960, 540


def hex_to_rgba(h: str, a: int = 255) -> tuple[int, int, int, int]:
    h = h.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)


def shade(rgb: tuple[int, int, int, int], f: float) -> tuple[int, int, int, int]:
    r, g, b, a = rgb
    return (
        max(0, min(255, round(r * f))),
        max(0, min(255, round(g * f))),
        max(0, min(255, round(b * f))),
        a,
    )


def lerp(a: int, b: int, t: float) -> int:
    return int(a + (b - a) * t)


def lerp_rgb(c0, c1, t):
    return (
        lerp(c0[0], c1[0], t),
        lerp(c0[1], c1[1], t),
        lerp(c0[2], c1[2], t),
        255,
    )


def new_canvas(w=W, h=H, fill=(0, 0, 0, 0)):
    return [list(fill) for _ in range(w * h)], w, h


def idx(w, x, y):
    return y * w + x


def setpx(buf, w, h, x, y, c):
    if 0 <= x < w and 0 <= y < h:
        buf[idx(w, x, y)] = c


def getpx(buf, w, h, x, y):
    if 0 <= x < w and 0 <= y < h:
        return buf[idx(w, x, y)]
    return (0, 0, 0, 0)


def fill_rect(buf, w, h, x, y, rw, rh, c):
    for yy in range(y, y + rh):
        for xx in range(x, x + rw):
            setpx(buf, w, h, xx, yy, c)


def fill_circle(buf, w, h, cx, cy, r, c):
    r2 = r * r
    for yy in range(cy - r, cy + r + 1):
        for xx in range(cx - r, cx + r + 1):
            if (xx - cx) * (xx - cx) + (yy - cy) * (yy - cy) <= r2:
                setpx(buf, w, h, xx, yy, c)


def blend(dst, src):
    if src[3] == 0:
        return dst
    if src[3] == 255 or dst[3] == 0:
        return src
    a = src[3] / 255.0
    return (
        round(src[0] * a + dst[0] * (1 - a)),
        round(src[1] * a + dst[1] * (1 - a)),
        round(src[2] * a + dst[2] * (1 - a)),
        max(dst[3], src[3]),
    )


def put(buf, w, h, x, y, c):
    setpx(buf, w, h, x, y, blend(getpx(buf, w, h, x, y), c))


def save_png(path: Path, buf, w, h):
    path.parent.mkdir(parents=True, exist_ok=True)
    raw = bytearray()
    for y in range(h):
        raw.append(0)
        for x in range(w):
            r, g, b, a = buf[idx(w, x, y)]
            raw.extend((r, g, b, a))

    def chunk(tag: bytes, data: bytes):
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    ihdr = struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", zlib.compress(bytes(raw), 9)) + chunk(b"IEND", b"")
    path.write_bytes(png)


def hill_y(x, base, waves, width=W):
    y = float(base)
    for amp, k, phase in waves:
        y -= amp * (math.sin(2 * math.pi * k * x / width + phase) + 1) / 2
    return int(y)


def fill_hills(buf, w, h, color, base, waves):
    for x in range(w):
        y0 = hill_y(x, base, waves, w)
        for y in range(max(0, y0), h):
            setpx(buf, w, h, x, y, color)
    # flat top edge highlight
    hi = shade(color, 1.12)
    for x in range(w):
        y0 = hill_y(x, base, waves, w)
        if 0 <= y0 < h:
            setpx(buf, w, h, x, y0, hi)


def draw_neem(buf, w, h, cx, cy, scale, trunk, leaf, leaf_dk):
    # trunk
    tw = max(2, int(3 * scale))
    th = int(28 * scale)
    fill_rect(buf, w, h, cx - tw // 2, cy - th, tw, th, trunk)
    # compound canopy — layered ovals (neem-ish silhouette)
    clusters = [
        (0, -th - int(4 * scale), int(18 * scale)),
        (-int(12 * scale), -th + int(2 * scale), int(12 * scale)),
        (int(12 * scale), -th + int(2 * scale), int(12 * scale)),
        (-int(6 * scale), -th - int(10 * scale), int(10 * scale)),
        (int(6 * scale), -th - int(10 * scale), int(10 * scale)),
        (0, -th - int(16 * scale), int(9 * scale)),
    ]
    for ox, oy, r in clusters:
        fill_circle(buf, w, h, cx + ox, cy + oy, r, leaf)
        fill_circle(buf, w, h, cx + ox - r // 3, cy + oy - r // 4, max(2, r // 3), leaf_dk)


def draw_banyan_hint(buf, w, h, cx, cy, scale, trunk, leaf):
    tw = max(3, int(5 * scale))
    th = int(22 * scale)
    fill_rect(buf, w, h, cx - tw // 2, cy - th, tw, th, trunk)
    fill_circle(buf, w, h, cx, cy - th - int(2 * scale), int(16 * scale), leaf)
    fill_circle(buf, w, h, cx - int(10 * scale), cy - th + int(4 * scale), int(10 * scale), leaf)
    fill_circle(buf, w, h, cx + int(10 * scale), cy - th + int(4 * scale), int(10 * scale), leaf)
    # aerial roots
    root = shade(trunk, 0.85)
    for ox in (-8, -3, 4, 9):
        fill_rect(buf, w, h, cx + int(ox * scale), cy - th + int(6 * scale), 1, int(10 * scale), root)


def draw_bush(buf, w, h, cx, cy, scale, col, col_dk):
    r = int(7 * scale)
    fill_circle(buf, w, h, cx - int(6 * scale), cy, r, col)
    fill_circle(buf, w, h, cx, cy - int(4 * scale), r + 1, col)
    fill_circle(buf, w, h, cx + int(6 * scale), cy, r, col)
    fill_rect(buf, w, h, cx - int(12 * scale), cy, int(24 * scale), int(4 * scale), col)
    fill_circle(buf, w, h, cx - 2, cy - int(2 * scale), max(2, r // 2), col_dk)


def draw_pot(buf, w, h, cx, cy, terracotta, soil, plant):
    # terracotta planter (chunky, readable at parallax scale)
    fill_rect(buf, w, h, cx - 7, cy - 9, 14, 9, terracotta)
    fill_rect(buf, w, h, cx - 6, cy - 11, 12, 3, shade(terracotta, 1.12))
    fill_rect(buf, w, h, cx - 5, cy - 11, 10, 2, soil)
    fill_circle(buf, w, h, cx, cy - 18, 6, plant)
    fill_circle(buf, w, h, cx - 5, cy - 14, 4, plant)
    fill_circle(buf, w, h, cx + 5, cy - 14, 4, plant)
    fill_circle(buf, w, h, cx, cy - 20, 3, shade(plant, 1.15))


def draw_low_wall(buf, w, h, x0, y0, length, brick, mortar):
    fill_rect(buf, w, h, x0, y0, length, 8, brick)
    fill_rect(buf, w, h, x0, y0, length, 1, shade(brick, 1.15))
    for i in range(0, length, 10):
        fill_rect(buf, w, h, x0 + i, y0, 1, 8, mortar)
    fill_rect(buf, w, h, x0, y0 + 4, length, 1, mortar)


def draw_water_tower(buf, w, h, cx, cy, body, dark, accent):
    # distant colony water-tower silhouette
    fill_rect(buf, w, h, cx - 3, cy - 34, 6, 34, dark)
    fill_rect(buf, w, h, cx - 11, cy - 46, 22, 14, body)
    fill_rect(buf, w, h, cx - 10, cy - 44, 20, 4, accent)
    fill_rect(buf, w, h, cx - 2, cy - 54, 4, 8, dark)
    # tiny rail
    fill_rect(buf, w, h, cx - 11, cy - 46, 22, 1, dark)


def draw_apartment_sil(buf, w, h, x, y, bw, bh, col, win):
    fill_rect(buf, w, h, x, y - bh, bw, bh, col)
    for row in range(2, bh - 2, 5):
        for colx in range(2, bw - 2, 4):
            if (colx + row) % 8 < 4:
                setpx(buf, w, h, x + colx, y - bh + row, win)


def draw_marigold(buf, w, h, cx, cy):
    gold = hex_to_rgba("#ffd24a")
    orange = hex_to_rgba("#ff9e3d")
    fill_circle(buf, w, h, cx, cy, 2, gold)
    setpx(buf, w, h, cx, cy, orange)


# ─── Set A: Neem Morning ───────────────────────────────────────────
A = {
    "sky_top": hex_to_rgba("#5cc8ff"),
    "sky_bot": hex_to_rgba("#d8f4ff"),
    "sun": hex_to_rgba("#fff6c8"),
    "sun_glow": (255, 246, 200, 40),
    "cloud": (255, 255, 255, 210),
    "far": hex_to_rgba("#9fdcb4"),
    "mid": hex_to_rgba("#57b06e"),
    "near": hex_to_rgba("#2f8a4c"),
    "trunk": hex_to_rgba("#5a3a22"),
    "leaf": hex_to_rgba("#3f8f52"),
    "leaf_dk": hex_to_rgba("#2c6a3c"),
    "bush": hex_to_rgba("#247a40"),
    "bush_dk": hex_to_rgba("#1b5c30"),
    "terra": hex_to_rgba("#c4784a"),
    "soil": hex_to_rgba("#6a4126"),
    "grass1": hex_to_rgba("#5fae4a"),
    "grass2": hex_to_rgba("#7ed163"),
    "grass3": hex_to_rgba("#4c8f3c"),
    "dirt1": hex_to_rgba("#7a4b2c"),
    "dirt2": hex_to_rgba("#6a4126"),
    "dirt3": hex_to_rgba("#8a5834"),
    "plat": hex_to_rgba("#9a6b3a"),
    "plat_hi": hex_to_rgba("#c08b4e"),
    "plat_lo": hex_to_rgba("#6f4b28"),
    "brick": hex_to_rgba("#c4784a"),
    "brick_dk": hex_to_rgba("#9a5a35"),
    "brick_hi": hex_to_rgba("#d99268"),
    "metal": hex_to_rgba("#7f8699"),
    "metal_hi": hex_to_rgba("#a8afc4"),
    "metal_lo": hex_to_rgba("#565c6e"),
}


# ─── Set B: Colony Park Dawn ───────────────────────────────────────
B = {
    "sky_top": hex_to_rgba("#6eb8ef"),
    "sky_bot": hex_to_rgba("#ffe4c4"),
    "sun": hex_to_rgba("#ffd28a"),
    "sun_glow": (255, 210, 138, 50),
    "cloud": (255, 250, 240, 200),
    "far": hex_to_rgba("#8ec9a0"),
    "mid": hex_to_rgba("#4fa862"),
    "near": hex_to_rgba("#2d7a44"),
    "trunk": hex_to_rgba("#4a3220"),
    "leaf": hex_to_rgba("#3a8a4a"),
    "leaf_dk": hex_to_rgba("#2a6838"),
    "bush": hex_to_rgba("#286e3c"),
    "bush_dk": hex_to_rgba("#1d5230"),
    "terra": hex_to_rgba("#d4844e"),
    "soil": hex_to_rgba("#6a4126"),
    "sil": hex_to_rgba("#6a9078"),
    "sil_dk": hex_to_rgba("#4a6e58"),
    "sil_win": hex_to_rgba("#c8e0d0"),
    "wall": hex_to_rgba("#c9a882"),
    "mortar": hex_to_rgba("#a88868"),
    "grass1": hex_to_rgba("#62b84e"),
    "grass2": hex_to_rgba("#8ae06a"),
    "grass3": hex_to_rgba("#458a38"),
    "dirt1": hex_to_rgba("#8a5530"),
    "dirt2": hex_to_rgba("#6e4224"),
    "dirt3": hex_to_rgba("#9a6840"),
    "plat": hex_to_rgba("#a87840"),
    "plat_hi": hex_to_rgba("#d0a060"),
    "plat_lo": hex_to_rgba("#6e4824"),
    "brick": hex_to_rgba("#d07048"),
    "brick_dk": hex_to_rgba("#a05030"),
    "brick_hi": hex_to_rgba("#e89870"),
    "metal": hex_to_rgba("#8890a0"),
    "metal_hi": hex_to_rgba("#b0b8c8"),
    "metal_lo": hex_to_rgba("#586070"),
}


def make_sky(pal, dawn_warmth=False):
    buf, w, h = new_canvas()
    for y in range(h):
        t = y / (h - 1)
        # keep lower sky soft; hills sit on top via parallax
        c = lerp_rgb(pal["sky_top"], pal["sky_bot"], t ** 0.85)
        for x in range(w):
            setpx(buf, w, h, x, y, c)
    # sun
    sx, sy, sr = (820, 70, 28) if not dawn_warmth else (780, 90, 32)
    fill_circle(buf, w, h, sx, sy, sr + 8, pal["sun_glow"])
    fill_circle(buf, w, h, sx, sy, sr, pal["sun"])
    fill_circle(buf, w, h, sx - 6, sy - 6, 8, shade(pal["sun"], 1.08))
    # soft pixel clouds
    clouds = [(120, 70, 22), (200, 55, 16), (480, 90, 20), (600, 50, 14), (300, 110, 12)]
    if dawn_warmth:
        clouds += [(400, 75, 18), (700, 120, 10)]
    for cx, cy, r in clouds:
        fill_circle(buf, w, h, cx, cy, r, pal["cloud"])
        fill_circle(buf, w, h, cx + r, cy + 2, int(r * 0.75), pal["cloud"])
        fill_circle(buf, w, h, cx - r // 2, cy + 3, int(r * 0.65), pal["cloud"])
    # tiny sparkle birds optional — skip, engine has birds
    return buf, w, h


def make_parallax_far_a(pal):
    buf, w, h = new_canvas()
    waves = [(160, 2, 0.0), (60, 5, 1.7)]
    fill_hills(buf, w, h, pal["far"], 430, waves)
    return buf, w, h


def make_parallax_mid_a(pal):
    buf, w, h = new_canvas()
    waves = [(110, 3, 2.4), (40, 7, 0.6)]
    fill_hills(buf, w, h, pal["mid"], 470, waves)
    positions = [140, 290, 470, 650, 820]
    for i, px in enumerate(positions):
        cy = hill_y(px, 470, waves) + 8
        sc = 1.0 + (i % 2) * 0.35
        draw_neem(buf, w, h, px, cy, sc, pal["trunk"], pal["leaf"], pal["leaf_dk"])
    return buf, w, h


def make_parallax_near_a(pal):
    buf, w, h = new_canvas()
    waves = [(58, 4, 4.2), (22, 9, 1.2)]
    fill_hills(buf, w, h, pal["near"], 505, waves)
    bushes = [90, 240, 410, 560]
    for i, px in enumerate(bushes):
        cy = hill_y(px, 505, waves) + 6
        sc = 0.9 + (i % 3) * 0.25
        draw_bush(buf, w, h, px, cy, sc, pal["bush"], pal["bush_dk"])
    # home/garden plaza cues on the right third (family zone ~tile 64+)
    wall_y = hill_y(780, 505, waves) + 2
    draw_low_wall(buf, w, h, 660, wall_y, 260, shade(pal["terra"], 0.92), shade(pal["terra"], 0.75))
    for px in (690, 740, 800, 860, 910):
        draw_pot(buf, w, h, px, wall_y, pal["terra"], pal["soil"], pal["leaf"])
    # soft terracotta roof peak behind pots
    rx, ry = 920, wall_y - 4
    roof = pal["terra"]
    for i in range(18):
        fill_rect(buf, w, h, rx - 18 + i, ry - 14 + abs(i - 9), 1, 3, roof)
    fill_rect(buf, w, h, rx - 10, ry - 4, 20, 6, shade(pal["terra"], 0.85))
    return buf, w, h


def make_parallax_far_b(pal):
    buf, w, h = new_canvas()
    waves = [(150, 2, 0.3), (55, 5, 2.1)]
    fill_hills(buf, w, h, pal["far"], 435, waves)
    # distant colony silhouettes sitting on far ridge
    draw_water_tower(buf, w, h, 180, hill_y(180, 435, waves) + 2, pal["sil"], pal["sil_dk"], pal["sil_win"])
    draw_apartment_sil(buf, w, h, 520, hill_y(520, 435, waves) + 4, 28, 22, pal["sil"], pal["sil_win"])
    draw_apartment_sil(buf, w, h, 560, hill_y(560, 435, waves) + 4, 18, 16, pal["sil_dk"], pal["sil_win"])
    draw_water_tower(buf, w, h, 780, hill_y(780, 435, waves) + 2, pal["sil"], pal["sil_dk"], pal["sil_win"])
    return buf, w, h


def make_parallax_mid_b(pal):
    buf, w, h = new_canvas()
    waves = [(115, 3, 1.1), (42, 7, 3.0)]
    fill_hills(buf, w, h, pal["mid"], 472, waves)
    trees = [120, 260, 400, 540, 680, 840]
    for i, px in enumerate(trees):
        cy = hill_y(px, 472, waves) + 8
        sc = 0.9 + (i % 3) * 0.25
        if i % 2 == 0:
            draw_neem(buf, w, h, px, cy, sc, pal["trunk"], pal["leaf"], pal["leaf_dk"])
        else:
            draw_banyan_hint(buf, w, h, px, cy, sc * 0.9, pal["trunk"], pal["leaf"])
    # marigold accents along mid slope
    for px in (200, 350, 500, 650, 800):
        cy = hill_y(px, 472, waves) - 2
        draw_marigold(buf, w, h, px, cy)
        draw_marigold(buf, w, h, px + 6, cy + 1)
    return buf, w, h


def make_parallax_near_b(pal):
    buf, w, h = new_canvas()
    waves = [(60, 4, 0.8), (24, 9, 2.5)]
    fill_hills(buf, w, h, pal["near"], 508, waves)
    for i, px in enumerate([80, 200, 320, 450, 580, 720, 860]):
        cy = hill_y(px, 508, waves) + 6
        draw_bush(buf, w, h, px, cy, 0.85 + (i % 3) * 0.2, pal["bush"], pal["bush_dk"])
    # low boundary wall + pots in family plaza (right)
    wall_y = hill_y(750, 508, waves) + 2
    draw_low_wall(buf, w, h, 680, wall_y, 220, pal["wall"], pal["mortar"])
    for px in (700, 740, 790, 840, 890):
        draw_pot(buf, w, h, px, wall_y, pal["terra"], pal["soil"], pal["leaf"])
        draw_marigold(buf, w, h, px + 8, wall_y - 2)
    return buf, w, h


def make_tile_top(pal):
    buf, w, h = new_canvas(64, 64)
    fill_rect(buf, w, h, 0, 0, 64, 64, pal["dirt1"])
    fill_rect(buf, w, h, 0, 0, 64, 16, pal["grass1"])
    fill_rect(buf, w, h, 0, 0, 64, 6, pal["grass2"])
    # grass tufts
    for x, y in [(8, 12), (22, 10), (36, 12), (50, 11), (14, 14), (44, 14)]:
        fill_rect(buf, w, h, x, y, 5, 3, pal["grass3"])
    # dirt flecks
    for x, y in [(10, 28), (28, 40), (46, 32), (18, 50), (40, 54)]:
        fill_rect(buf, w, h, x, y, 6, 4, pal["dirt2"])
    for x, y in [(22, 36), (50, 48)]:
        fill_rect(buf, w, h, x, y, 4, 3, pal["dirt3"])
    return buf, w, h


def make_tile_ground(pal):
    buf, w, h = new_canvas(64, 64)
    fill_rect(buf, w, h, 0, 0, 64, 64, pal["dirt2"])
    for x, y in [(6, 8), (36, 16), (20, 36), (48, 44), (8, 52), (40, 28)]:
        fill_rect(buf, w, h, x, y, 8, 6, pal["dirt1"])
    for x, y in [(24, 12), (12, 40), (44, 52)]:
        fill_rect(buf, w, h, x, y, 6, 5, shade(pal["dirt2"], 0.85))
    return buf, w, h


def make_tile_platform(pal):
    buf, w, h = new_canvas(64, 64)
    fill_rect(buf, w, h, 0, 8, 64, 48, pal["plat"])
    fill_rect(buf, w, h, 0, 8, 64, 10, pal["plat_hi"])
    fill_rect(buf, w, h, 0, 48, 64, 8, pal["plat_lo"])
    fill_rect(buf, w, h, 16, 20, 4, 28, shade(pal["plat"], 0.85))
    fill_rect(buf, w, h, 44, 20, 4, 28, shade(pal["plat"], 0.85))
    # wood grain
    for y in (24, 32, 40):
        fill_rect(buf, w, h, 4, y, 56, 1, shade(pal["plat"], 0.92))
    return buf, w, h


def make_tile_brick(pal):
    buf, w, h = new_canvas(64, 64)
    fill_rect(buf, w, h, 0, 0, 64, 64, pal["brick"])
    # mortar lines
    for y in (14, 30, 46):
        fill_rect(buf, w, h, 0, y, 64, 3, pal["brick_dk"])
    for y0, offs in ((0, 0), (17, 16), (33, 0), (49, 16)):
        for x in range(offs, 64, 32):
            fill_rect(buf, w, h, x, y0, 3, 14, pal["brick_dk"])
    fill_rect(buf, w, h, 0, 0, 64, 3, pal["brick_hi"])
    # outline
    for x in range(64):
        setpx(buf, w, h, x, 0, shade(pal["brick_dk"], 0.7))
        setpx(buf, w, h, x, 63, shade(pal["brick_dk"], 0.7))
    for y in range(64):
        setpx(buf, w, h, 0, y, shade(pal["brick_dk"], 0.7))
        setpx(buf, w, h, 63, y, shade(pal["brick_dk"], 0.7))
    return buf, w, h


def make_tile_metal(pal):
    buf, w, h = new_canvas(64, 64)
    fill_rect(buf, w, h, 0, 0, 64, 64, pal["metal"])
    fill_rect(buf, w, h, 4, 4, 56, 8, pal["metal_hi"])
    fill_rect(buf, w, h, 4, 4, 8, 56, pal["metal_hi"])
    fill_rect(buf, w, h, 52, 8, 8, 52, pal["metal_lo"])
    fill_rect(buf, w, h, 8, 52, 52, 8, pal["metal_lo"])
    for x, y in ((10, 10), (48, 10), (10, 48), (48, 48)):
        fill_rect(buf, w, h, x, y, 6, 6, (223, 227, 240, 255))
    for x in range(64):
        setpx(buf, w, h, x, 0, shade(pal["metal_lo"], 0.7))
        setpx(buf, w, h, x, 63, shade(pal["metal_lo"], 0.7))
    for y in range(64):
        setpx(buf, w, h, 0, y, shade(pal["metal_lo"], 0.7))
        setpx(buf, w, h, 63, y, shade(pal["metal_lo"], 0.7))
    return buf, w, h


def write_set(name: str, folder: str, makers: dict):
    out = WIP / folder
    out.mkdir(parents=True, exist_ok=True)
    for key, fn in makers.items():
        buf, w, h = fn()
        path = out / f"{key}.png"
        save_png(path, buf, w, h)
        print(f"  {name}: {path.relative_to(ROOT)} ({w}x{h})")


def main():
    print("Generating Set A — Neem Morning")
    write_set(
        "A",
        "l1_set_a_neem",
        {
            "bg_l1": lambda: make_sky(A, dawn_warmth=False),
            "parallax_l1_far": lambda: make_parallax_far_a(A),
            "parallax_l1_mid": lambda: make_parallax_mid_a(A),
            "parallax_l1_near": lambda: make_parallax_near_a(A),
            "tile_top": lambda: make_tile_top(A),
            "tile_ground": lambda: make_tile_ground(A),
            "tile_platform": lambda: make_tile_platform(A),
            "tile_brick": lambda: make_tile_brick(A),
            "tile_metal": lambda: make_tile_metal(A),
        },
    )

    print("Generating Set B — Colony Park Dawn")
    write_set(
        "B",
        "l1_set_b_colony",
        {
            "bg_l1": lambda: make_sky(B, dawn_warmth=True),
            "parallax_l1_far": lambda: make_parallax_far_b(B),
            "parallax_l1_mid": lambda: make_parallax_mid_b(B),
            "parallax_l1_near": lambda: make_parallax_near_b(B),
            "tile_top": lambda: make_tile_top(B),
            "tile_ground": lambda: make_tile_ground(B),
            "tile_platform": lambda: make_tile_platform(B),
            "tile_brick": lambda: make_tile_brick(B),
            "tile_metal": lambda: make_tile_metal(B),
        },
    )

    # Composite preview strips (sky + layers stacked) for quick compare
    for folder, label in (("l1_set_a_neem", "A Neem Morning"), ("l1_set_b_colony", "B Colony Park Dawn")):
        from PIL import Image

        base = WIP / folder
        sky = Image.open(base / "bg_l1.png").convert("RGBA")
        for layer in ("parallax_l1_far", "parallax_l1_mid", "parallax_l1_near"):
            sky = Image.alpha_composite(sky, Image.open(base / f"{layer}.png").convert("RGBA"))
        # tile row under
        preview = Image.new("RGBA", (960, 540 + 72), (16, 16, 24, 255))
        preview.paste(sky, (0, 0))
        x = 16
        for t in ("tile_top", "tile_ground", "tile_platform", "tile_brick", "tile_metal"):
            im = Image.open(base / f"{t}.png").convert("RGBA")
            preview.paste(im, (x, 548), im)
            x += 72
        out = WIP / f"l1_preview_{folder}.png"
        preview.save(out)
        print(f"  preview: {out.relative_to(ROOT)} ({label})")


if __name__ == "__main__":
    main()
