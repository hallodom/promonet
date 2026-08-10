#!/usr/bin/env python3
"""Generate branded Open Graph / LinkedIn / social share assets."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'public'
BRAND = ROOT / 'brand-assets'

W, H = 1200, 630
BONE = (245, 245, 242)
OBSIDIAN = (10, 10, 15)
VOLTAGE = (37, 64, 232)
EMERGENCE = (255, 74, 28)
GRAPHITE = (107, 114, 128)


def load_font(paths: list[str], size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for path in paths:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def build_og() -> Image.Image:
    serif = load_font(
        ['/System/Library/Fonts/Supplemental/Georgia Bold.ttf'],
        64,
    )
    sans = load_font(
        ['/System/Library/Fonts/SFNS.ttf', '/System/Library/Fonts/Helvetica.ttc'],
        54,
    )
    sans_md = load_font(
        ['/System/Library/Fonts/SFNS.ttf', '/System/Library/Fonts/Helvetica.ttc'],
        32,
    )
    sans_sm = load_font(
        ['/System/Library/Fonts/SFNS.ttf', '/System/Library/Fonts/Helvetica.ttc'],
        28,
    )

    img = Image.new('RGB', (W, H), BONE)
    overlay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    for i in range(0, 420, 2):
        alpha = max(0, 28 - i // 18)
        od.polygon(
            [(780 + i, 0), (1200, 0), (1200, 630), (520 + i, 630)],
            fill=(*VOLTAGE, alpha),
        )
    img = Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB')
    d = ImageDraw.Draw(img)

    d.rectangle([0, 0, 12, H], fill=VOLTAGE)
    d.rectangle([W - 48, H - 48, W - 20, H - 20], fill=EMERGENCE)

    pad_x, pad_y = 72, 64
    word = 'Promonet'
    d.text((pad_x, pad_y), word, font=serif, fill=OBSIDIAN)
    wb = d.textbbox((pad_x, pad_y), word, font=serif)
    sq = 14
    sq_x = wb[2] + 8
    sq_y = wb[3] - sq - 4
    d.rectangle([sq_x, sq_y, sq_x + sq, sq_y + sq], fill=EMERGENCE)

    hy = 220
    d.text((pad_x, hy), 'Your software finally', font=sans, fill=OBSIDIAN)
    h1b = d.textbbox((pad_x, hy), 'Your software finally', font=sans)
    hy2 = h1b[3] + 8
    d.text((pad_x, hy2), 'talking together.', font=sans, fill=VOLTAGE)
    d.text(
        (pad_x, hy2 + 90),
        'CRM & tool integrations for small businesses.',
        font=sans_md,
        fill=GRAPHITE,
    )
    d.rectangle([pad_x, H - 88, pad_x + 64, H - 84], fill=EMERGENCE)
    d.text((pad_x, H - 72), 'promonetconsulting.com', font=sans_sm, fill=GRAPHITE)
    return img


def build_logo() -> Image.Image:
    size = 512
    logo = Image.new('RGB', (size, size), BONE)
    d = ImageDraw.Draw(logo)
    font = load_font(['/System/Library/Fonts/Supplemental/Georgia Bold.ttf'], 280)
    tb = d.textbbox((0, 0), 'P', font=font)
    tw, th = tb[2] - tb[0], tb[3] - tb[1]
    sq = max(36, int(th * 0.16))
    gap = int(sq * 0.55)
    gw = tw + gap + sq
    gx = (size - gw) // 2 - tb[0]
    gy = (size - th) // 2 - tb[1] - int(th * 0.03)
    d.text((gx, gy), 'P', font=font, fill=OBSIDIAN)
    d.rectangle(
        [gx + tb[0] + tw + gap, gy + tb[3] - sq, gx + tb[0] + tw + gap + sq, gy + tb[3]],
        fill=EMERGENCE,
    )
    return logo


def build_linkedin_banner(width: int, height: int) -> Image.Image:
    """Simple LinkedIn cover: bone bg, slogan right-aligned clear of avatar."""
    img = Image.new('RGB', (width, height), BONE)
    d = ImageDraw.Draw(img)

    # Small brand mark top-right (matches avatar square accent)
    mark = max(10, int(height * 0.055))
    margin = max(28, int(width * 0.035))
    d.rectangle(
        [width - margin - mark, margin, width - margin, margin + mark],
        fill=EMERGENCE,
    )

    # Slogan dominates — right side, clear of LinkedIn avatar (bottom-left)
    h1_f = load_font(
        ['/System/Library/Fonts/SFNS.ttf', '/System/Library/Fonts/Helvetica.ttc'],
        max(30, int(height * 0.175)),
    )
    sub_f = load_font(
        ['/System/Library/Fonts/SFNS.ttf', '/System/Library/Fonts/Helvetica.ttc'],
        max(15, int(height * 0.075)),
    )

    line1 = 'Your software finally'
    line2 = 'talking together.'
    sub = 'CRM & tool integrations for small businesses.'

    b1 = d.textbbox((0, 0), line1, font=h1_f)
    b2 = d.textbbox((0, 0), line2, font=h1_f)
    b3 = d.textbbox((0, 0), sub, font=sub_f)
    h1h, h2h, h3h = b1[3] - b1[1], b2[3] - b2[1], b3[3] - b3[1]
    gap12 = max(2, int(height * 0.015))
    gap23 = max(8, int(height * 0.045))
    block_h = h1h + gap12 + h2h + gap23 + h3h

    right = width - margin
    y = (height - block_h) // 2 - b1[1]

    d.text((right - (b1[2] - b1[0]), y), line1, font=h1_f, fill=OBSIDIAN)
    y2 = y + h1h + gap12
    d.text((right - (b2[2] - b2[0]), y2), line2, font=h1_f, fill=VOLTAGE)
    y3 = y2 + h2h + gap23
    d.text((right - (b3[2] - b3[0]), y3), sub, font=sub_f, fill=GRAPHITE)

    return img


def main() -> None:
    PUBLIC.mkdir(parents=True, exist_ok=True)
    BRAND.mkdir(parents=True, exist_ok=True)

    og = build_og()
    og.save(PUBLIC / 'og-default.jpg', 'JPEG', quality=90, optimize=True, progressive=True)
    og.save(PUBLIC / 'og-default.png', 'PNG', optimize=True)
    og.save(BRAND / 'promonet-og-default.jpg', 'JPEG', quality=90, optimize=True)
    og.save(BRAND / 'promonet-og-default.png', 'PNG', optimize=True)

    logo = build_logo()
    logo.save(PUBLIC / 'logo.png', 'PNG', optimize=True)
    logo.save(BRAND / 'promonet-logo.png', 'PNG', optimize=True)

    personal = build_linkedin_banner(1584, 396)
    personal.save(PUBLIC / 'linkedin-banner.jpg', 'JPEG', quality=92, optimize=True, progressive=True)
    personal.save(PUBLIC / 'linkedin-banner.png', 'PNG', optimize=True)
    personal.save(BRAND / 'linkedin-banner.jpg', 'JPEG', quality=92, optimize=True)
    personal.save(BRAND / 'linkedin-banner.png', 'PNG', optimize=True)

    company = build_linkedin_banner(1128, 191)
    company.save(
        PUBLIC / 'linkedin-banner-company.jpg',
        'JPEG',
        quality=92,
        optimize=True,
        progressive=True,
    )
    company.save(PUBLIC / 'linkedin-banner-company.png', 'PNG', optimize=True)
    company.save(BRAND / 'linkedin-banner-company.jpg', 'JPEG', quality=92, optimize=True)
    company.save(BRAND / 'linkedin-banner-company.png', 'PNG', optimize=True)

    print('Generated og-default, logo, and simple LinkedIn banners')


if __name__ == '__main__':
    main()
