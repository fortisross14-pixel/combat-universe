from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageOps, ImageEnhance, ImageChops
import json

ROOT = Path(__file__).resolve().parents[1] / 'public' / 'portraits'
SOURCE_ROOT = Path(__file__).resolve().parent / 'portrait_sources'
SRC = {
    'ea_m': SOURCE_ROOT / 'east_asian_male.png',
    'wa_f': SOURCE_ROOT / 'west_african_female.png',
    'la_m': SOURCE_ROOT / 'latino_euro_male.png',
}
SIZE = (120, 120)

BASES = [
    ('ea-m-rect','east-asian','Male','ea_m'),('ea-m-oval','east-asian','Male','ea_m'),('ea-f-heart','east-asian','Female','wa_f'),('ea-f-round','east-asian','Female','wa_f'),
    ('wa-m-square','west-african','Male','wa_f'),('wa-m-softrect','west-african','Male','wa_f'),('wa-f-heart','west-african','Female','wa_f'),('wa-f-diamond','west-african','Female','wa_f'),
    ('eu-m-rect','european','Male','la_m'),('eu-m-pear','european','Male','la_m'),('eu-f-oval','european','Female','wa_f'),('eu-f-softrect','european','Female','wa_f'),
    ('sa-m-oval','south-asian','Male','la_m'),('sa-m-square','south-asian','Male','la_m'),('sa-f-heart','south-asian','Female','wa_f'),('sa-f-round','south-asian','Female','wa_f'),
    ('la-m-softrect','latin-american','Male','la_m'),('la-m-diamond','latin-american','Male','la_m'),('la-f-oval','latin-american','Female','wa_f'),('la-f-diamond','latin-american','Female','wa_f'),
    ('mx-m-rect','mixed','Male','la_m'),('mx-m-oval','mixed','Male','la_m'),('mx-f-heart','mixed','Female','wa_f'),('mx-f-softrect','mixed','Female','wa_f'),
]

FAMILIES = ['east-asian','west-african','european','south-asian','latin-american','mixed']
EYE_IDS = ['eyes-almond-soft','eyes-round-open','eyes-hooded-serious','eyes-narrow-focused','eyes-monolid-clean']
NOSE_IDS = ['nose-straight','nose-narrow','nose-broad','nose-aquiline','nose-soft']
MOUTH_IDS = ['mouth-firm','mouth-neutral','mouth-full','mouth-smirk','mouth-thin']
EAR_IDS = ['ears-compact','ears-medium','ears-pronounced','ears-high','ears-wide']
HAIR_STYLES = ['buzz','crop','quiff','side-part','messy','curly-top','afro-short','bob','ponytail','waves','updo','braids']
HAIR_COLORS = {
    'black': ('#141419','#43414A'),
    'dark-brown': ('#2B1C18','#5B3D33'),
    'brown': ('#55382B','#856355'),
    'light-brown': ('#7A5A42','#B38D72'),
    'blonde': ('#AB8757','#E0C58E'),
    'auburn': ('#66352A','#A76553'),
}
BEARDS = ['stubble','short','full','goatee','moustache']

for sub in ['bases','noses','mouths','ears','hair','beards']:
    (ROOT/sub).mkdir(parents=True, exist_ok=True)
for fam in FAMILIES:
    (ROOT/'eyes'/fam).mkdir(parents=True, exist_ok=True)


def load_source(path: Path) -> Image.Image:
    img = Image.open(path).convert('RGBA')
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    img.thumbnail((112, 112), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', SIZE, (0, 0, 0, 0))
    x = (SIZE[0] - img.size[0]) // 2
    y = max(0, SIZE[1] - img.size[1] - 1)
    canvas.alpha_composite(img, (x, y))
    return canvas

SOURCES = {key: load_source(path) for key, path in SRC.items()}


def feather_box(box, blur=4, radius=None):
    m = Image.new('L', SIZE, 0)
    d = ImageDraw.Draw(m)
    d.rounded_rectangle(box, radius=radius if radius is not None else max(2, blur), fill=255)
    return m.filter(ImageFilter.GaussianBlur(blur))


def feather_ellipse(box, blur=4):
    m = Image.new('L', SIZE, 0)
    d = ImageDraw.Draw(m)
    d.ellipse(box, fill=255)
    return m.filter(ImageFilter.GaussianBlur(blur))


def composite_mask(*masks):
    out = Image.new('L', SIZE, 0)
    for m in masks:
        out = ImageChops.lighter(out, m)
    return out


def scaled_mask(mask: Image.Image, factor: float) -> Image.Image:
    return Image.eval(mask, lambda p: max(0, min(255, int(p * factor))))


def region_mask(kind: str) -> Image.Image:
    masks = {
        'eyes': feather_box((23, 26, 97, 52), blur=5),
        'nose': feather_ellipse((42, 41, 78, 79), blur=6),
        'mouth': feather_box((35, 71, 85, 95), blur=6),
        'beard': feather_box((35, 64, 85, 107), blur=7),
        'hair_messy': feather_box((10, 0, 110, 52), blur=8),
        'hair_crop': feather_box((18, 1, 102, 36), blur=6),
        'hair_buzz': feather_box((22, 3, 98, 24), blur=5),
        'hair_quiff': feather_box((15, 0, 106, 40), blur=7),
        'hair_sidepart': feather_box((13, 0, 108, 42), blur=7),
        'hair_curly': feather_box((10, 0, 109, 44), blur=8),
        'hair_afro': feather_box((9, 0, 111, 49), blur=8),
        'hair_bob': composite_mask(feather_box((13, 0, 108, 43), blur=7), feather_box((6, 35, 33, 92), blur=7), feather_box((87, 35, 114, 92), blur=7)),
        'hair_ponytail': composite_mask(feather_box((16, 0, 106, 38), blur=7), feather_box((8, 33, 29, 95), blur=7), feather_box((91, 33, 112, 95), blur=7)),
        'hair_waves': composite_mask(feather_box((11, 0, 109, 42), blur=7), feather_box((5, 34, 31, 86), blur=7), feather_box((89, 34, 115, 86), blur=7)),
        'hair_updo': composite_mask(feather_box((20, 0, 100, 33), blur=6), feather_box((43, 0, 77, 20), blur=5)),
        'hair_braids': composite_mask(feather_box((14, 0, 106, 42), blur=7), feather_box((7, 32, 30, 100), blur=6), feather_box((90, 32, 113, 100), blur=6)),
        'female_soften': composite_mask(feather_box((33, 68, 87, 103), blur=9), feather_ellipse((18, 53, 102, 103), blur=10)),
        'shadow_lift': composite_mask(feather_ellipse((12, 35, 108, 112), blur=16), feather_box((22, 70, 98, 118), blur=10)),
    }
    return masks[kind]


def blank():
    return Image.new('RGBA', SIZE, (0, 0, 0, 0))


def dark_select(img: Image.Image, threshold=112, y_limit=None):
    gray = img.convert('L')
    alpha = img.getchannel('A')
    pixels = gray.load(); a = alpha.load()
    m = Image.new('L', SIZE, 0); mp = m.load()
    for y in range(SIZE[1]):
        if y_limit is not None and (y < y_limit[0] or y > y_limit[1]):
            continue
        for x in range(SIZE[0]):
            if a[x, y] > 15 and pixels[x, y] < threshold:
                mp[x, y] = 255
    return m.filter(ImageFilter.GaussianBlur(1.2))


def brightness_lift(img: Image.Image, mask: Image.Image, amount=0.12):
    lifted = ImageEnhance.Brightness(img).enhance(1 + amount)
    return Image.composite(lifted, img, mask)


def soften_region(img: Image.Image, mask: Image.Image, blur=1.4, amount=0.32):
    soft = img.filter(ImageFilter.GaussianBlur(blur))
    blended = Image.blend(img, soft, amount)
    return Image.composite(blended, img, mask)


def tint_region(img: Image.Image, mask: Image.Image, color, opacity=0.16):
    overlay = Image.new('RGBA', SIZE, color)
    tinted = Image.blend(img, overlay, opacity)
    return Image.composite(tinted, img, mask)


def alpha_multiply(img: Image.Image, factor: float):
    out = img.copy()
    alpha = out.getchannel('A')
    out.putalpha(scaled_mask(alpha, factor))
    return out


def recolor_hair(img: Image.Image, color_name: str) -> Image.Image:
    if color_name == 'black':
        return img.copy()
    base_color, hi_color = HAIR_COLORS[color_name]
    alpha = img.getchannel('A')
    gray = ImageOps.grayscale(img)
    colorized = ImageOps.colorize(gray, black=base_color, white=hi_color).convert('RGBA')
    colorized.putalpha(alpha)
    mix = 0.08 if color_name == 'brown' else 0.05
    return Image.blend(colorized, img, mix)


def extract_feature(source_key: str, feature_kind: str, mask_kind: str) -> Image.Image:
    src = SOURCES[source_key]
    base_mask = region_mask(mask_kind)
    if feature_kind == 'hair':
        dark = dark_select(src, threshold=145, y_limit=(0, 96))
        mask = ImageChops.multiply(base_mask, dark)
    elif feature_kind == 'beard':
        dark = dark_select(src, threshold=132, y_limit=(62, 109))
        mask = ImageChops.multiply(base_mask, dark)
    else:
        mask = base_mask
    out = blank()
    out.paste(src, (0, 0), mask)
    return out


def make_base(img: Image.Image, family: str, gender: str, variant_index: int) -> Image.Image:
    out = img.copy()
    out = ImageEnhance.Color(out).enhance(0.94)
    out = ImageEnhance.Contrast(out).enhance(0.95)
    # Slightly cleaner busts / less muddy shadows.
    out = brightness_lift(out, region_mask('shadow_lift'), amount=0.04 if gender == 'Male' else 0.05)
    out = soften_region(out, region_mask('shadow_lift'), blur=1.0, amount=0.12 if gender == 'Male' else 0.18)

    # Stronger family-linked skin rendering.
    family_tones = {
        'east-asian': ((244, 226, 205, 255), 0.22),
        'west-african': ((95, 63, 44, 255), 0.28),
        'european': ((247, 233, 221, 255), 0.18),
        'south-asian': ((185, 136, 101, 255), 0.26),
        'latin-american': ((205, 157, 118, 255), 0.24),
        'mixed': ((214, 172, 140, 255), 0.18),
    }
    skin_mask = composite_mask(feather_ellipse((12, 16, 108, 112), blur=10), feather_box((22, 76, 98, 119), blur=8))
    color, opacity = family_tones[family]
    out = tint_region(out, skin_mask, color, opacity=opacity)

    # Reduce embedded feature dominance but do not fully remove realism.
    out = alpha_multiply(out, 1.0)
    if gender == 'Female':
        out = brightness_lift(out, region_mask('female_soften'), amount=0.05)
        out = soften_region(out, region_mask('female_soften'), blur=1.2, amount=0.24)

    # Lower opacity where modular assets will sit, especially hair/beard.
    removal = composite_mask(
        scaled_mask(region_mask('hair_messy' if gender == 'Male' else 'hair_bob'), 0.52),
        scaled_mask(region_mask('beard'), 0.28 if gender == 'Male' else 0.12),
    )
    alpha = out.getchannel('A')
    alpha = ImageChops.subtract(alpha, removal)
    out.putalpha(alpha)

    if variant_index % 2 == 1:
        shifted = blank()
        shifted.alpha_composite(out, (-1, 0))
        out = shifted
    return out

# generate bases
for idx, (base_id, family, gender, source_key) in enumerate(BASES):
    base = make_base(SOURCES[source_key], family, gender, idx)
    base.save(ROOT / 'bases' / f'{base_id}.png')

# Eyes family-linked
family_eye_source = {
    'east-asian': 'ea_m',
    'west-african': 'wa_f',
    'european': 'la_m',
    'south-asian': 'la_m',
    'latin-american': 'la_m',
    'mixed': 'la_m',
}
for family in FAMILIES:
    src_key = family_eye_source[family]
    base_eye = extract_feature(src_key, 'eyes', 'eyes')
    for eye_id in EYE_IDS:
        variant = base_eye.copy()
        if eye_id == 'eyes-round-open':
            variant = variant.resize((120, 124), Image.Resampling.BICUBIC).crop((0, 1, 120, 121)).resize(SIZE, Image.Resampling.LANCZOS)
        elif eye_id == 'eyes-hooded-serious':
            variant = Image.composite(blank(), variant, ImageChops.invert(feather_box((18, 28, 102, 48), blur=4)))
        elif eye_id == 'eyes-narrow-focused':
            mask = feather_box((22, 30, 98, 46), blur=5)
            tmp = blank(); tmp.paste(variant, (0, 0), mask); variant = tmp
        elif eye_id == 'eyes-monolid-clean':
            mask = feather_box((21, 31, 99, 45), blur=5)
            tmp = blank(); tmp.paste(variant, (0, 0), mask); variant = tmp
        variant.save(ROOT / 'eyes' / family / f'{eye_id}.png')

# Noses
nose_sources = {
    'nose-straight': 'la_m',
    'nose-narrow': 'ea_m',
    'nose-broad': 'wa_f',
    'nose-aquiline': 'la_m',
    'nose-soft': 'wa_f',
}
for nose_id, src_key in nose_sources.items():
    extract_feature(src_key, 'nose', 'nose').save(ROOT / 'noses' / f'{nose_id}.png')

# Mouths
mouth_sources = {
    'mouth-firm': 'ea_m',
    'mouth-neutral': 'la_m',
    'mouth-full': 'wa_f',
    'mouth-smirk': 'la_m',
    'mouth-thin': 'ea_m',
}
for mouth_id, src_key in mouth_sources.items():
    extract_feature(src_key, 'mouth', 'mouth').save(ROOT / 'mouths' / f'{mouth_id}.png')

# Ear detail overlays remain transparent because bases already include ears.
for ear_id in EAR_IDS:
    blank().save(ROOT / 'ears' / f'{ear_id}.png')

# Hair
hair_sources = {
    'buzz': ('ea_m', 'hair_buzz'),
    'crop': ('ea_m', 'hair_crop'),
    'quiff': ('la_m', 'hair_quiff'),
    'side-part': ('la_m', 'hair_sidepart'),
    'messy': ('ea_m', 'hair_messy'),
    'curly-top': ('ea_m', 'hair_curly'),
    'afro-short': ('wa_f', 'hair_afro'),
    'bob': ('wa_f', 'hair_bob'),
    'ponytail': ('wa_f', 'hair_ponytail'),
    'waves': ('wa_f', 'hair_waves'),
    'updo': ('wa_f', 'hair_updo'),
    'braids': ('wa_f', 'hair_braids'),
}
for style, (src_key, mask_kind) in hair_sources.items():
    img = extract_feature(src_key, 'hair', mask_kind)
    if style == 'buzz':
        img = alpha_multiply(img, 0.72)
    elif style == 'crop':
        img = alpha_multiply(img, 0.92)
    elif style == 'waves':
        img = soften_region(img, region_mask('hair_waves'), blur=0.7, amount=0.18)
    elif style == 'updo':
        img = alpha_multiply(img, 0.88)
    elif style == 'braids':
        img = ImageEnhance.Contrast(img).enhance(1.08)
    for color_name in HAIR_COLORS:
        recolor_hair(img, color_name).save(ROOT / 'hair' / f'{style}-{color_name}.png')

# Beards - only used for male fighters.
beard_base_main = extract_feature('la_m', 'beard', 'beard')
beard_base_ea = extract_feature('ea_m', 'beard', 'beard')
for style in BEARDS:
    base = beard_base_main.copy() if style in ('short', 'full', 'moustache') else beard_base_ea.copy()
    if style == 'stubble':
        base = alpha_multiply(base, 0.42)
    elif style == 'moustache':
        mask = feather_box((40, 69, 80, 82), blur=4)
        tmp = blank(); tmp.paste(base, (0, 0), mask); base = tmp
    elif style == 'goatee':
        mask = composite_mask(feather_box((41, 69, 80, 82), blur=4), feather_box((48, 83, 73, 105), blur=5))
        tmp = blank(); tmp.paste(base, (0, 0), mask); base = tmp
    elif style == 'short':
        base = alpha_multiply(base, 0.76)
    elif style == 'full':
        base = alpha_multiply(base, 0.98)
    for color_name in HAIR_COLORS:
        recolor_hair(base, color_name).save(ROOT / 'beards' / f'{style}-{color_name}.png')

manifest = {
    'version': '2.2-realistic-cleanup-pass',
    'canvas': [120, 120],
    'format': 'png-layers',
    'notes': 'Cleaner realistic portrait asset library with stronger family-linked skin variation, female-safe bases, lighter facial shading, and expanded hair-color variety.',
    'bases': [{'id': i, 'family': f, 'gender': g, 'file': f'bases/{i}.png'} for i, f, g, _ in BASES],
    'eyes': [{'id': eye, 'family': fam, 'file': f'eyes/{fam}/{eye}.png'} for fam in FAMILIES for eye in EYE_IDS],
    'noses': [{'id': k, 'file': f'noses/{k}.png'} for k in NOSE_IDS],
    'mouths': [{'id': k, 'file': f'mouths/{k}.png'} for k in MOUTH_IDS],
    'ears': [{'id': k, 'file': f'ears/{k}.png'} for k in EAR_IDS],
    'hair': [{'style': s, 'color': c, 'file': f'hair/{s}-{c}.png'} for s in HAIR_STYLES for c in HAIR_COLORS],
    'beards': [{'style': s, 'color': c, 'file': f'beards/{s}-{c}.png'} for s in BEARDS for c in HAIR_COLORS],
}
(ROOT / 'manifest.json').write_text(json.dumps(manifest, indent=2))
print('Generated realistic expanded assets')
print('Total PNG assets:', sum(1 for _ in ROOT.rglob('*.png')))
