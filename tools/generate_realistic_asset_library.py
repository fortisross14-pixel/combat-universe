from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageOps, ImageChops
import json

ROOT = Path(__file__).resolve().parents[1] / 'public' / 'portraits'
SRC = {
    'ea_m': Path('/mnt/data/ghostwriter_images/generated/a_clean_high_resolution_studio_style_illustrated_1.png'),
    'wa_f': Path('/mnt/data/ghostwriter_images/generated/studio_like_close_up_portrait_on_a_transparent_che_2_batch_1.png'),
    'la_m': Path('/mnt/data/ghostwriter_images/generated/a_highly_detailed_realistic_studio_like_head_and_3_batch_2.png'),
}
SIZE = (120, 120)

BASES = [
    ('ea-m-rect','east-asian','Male','ea_m'),('ea-m-oval','east-asian','Male','ea_m'),('ea-f-heart','east-asian','Female','wa_f'),('ea-f-round','east-asian','Female','wa_f'),
    ('wa-m-square','west-african','Male','la_m'),('wa-m-softrect','west-african','Male','la_m'),('wa-f-heart','west-african','Female','wa_f'),('wa-f-diamond','west-african','Female','wa_f'),
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
HAIR_STYLES = ['buzz','crop','side-part','messy','curly-top','afro-short','bob','ponytail']
HAIR_COLORS = {
    'black': ('#17171B','#3B3842'),
    'brown': ('#57392A','#81604C'),
    'blonde': ('#B8925D','#DFC18A'),
}
BEARDS = ['stubble','short','goatee','moustache']

for sub in ['bases','noses','mouths','ears','hair','beards']:
    (ROOT/sub).mkdir(parents=True, exist_ok=True)
for fam in FAMILIES:
    (ROOT/'eyes'/fam).mkdir(parents=True, exist_ok=True)


def load_source(path: Path) -> Image.Image:
    img = Image.open(path).convert('RGBA')
    return img.resize(SIZE, Image.Resampling.LANCZOS)

SOURCES = {key: load_source(path) for key, path in SRC.items()}

# ---------- helpers ----------
def feather_box(box, blur=4):
    m = Image.new('L', SIZE, 0)
    d = ImageDraw.Draw(m)
    d.rounded_rectangle(box, radius=max(2, blur), fill=255)
    return m.filter(ImageFilter.GaussianBlur(blur))


def feather_ellipse(box, blur=4):
    m = Image.new('L', SIZE, 0)
    d = ImageDraw.Draw(m)
    d.ellipse(box, fill=255)
    return m.filter(ImageFilter.GaussianBlur(blur))


def apply_color_grade(img: Image.Image, family: str, gender: str) -> Image.Image:
    # gentle family/gender grading so not every duplicated asset looks identical.
    out = img.copy()
    overlay = Image.new('RGBA', SIZE, (0, 0, 0, 0))
    tone = {
        'east-asian': (250, 226, 210, 18),
        'west-african': (120, 80, 52, 16),
        'european': (245, 223, 210, 10),
        'south-asian': (214, 170, 140, 16),
        'latin-american': (224, 188, 160, 14),
        'mixed': (228, 194, 168, 14),
    }[family]
    ImageDraw.Draw(overlay).rectangle((0, 0, 120, 120), fill=tone)
    out = Image.alpha_composite(out, overlay)
    if gender == 'Female':
        # soften slightly and lift highlights a bit.
        softened = out.filter(ImageFilter.GaussianBlur(0.35))
        out = Image.blend(out, softened, 0.12)
    return out


def region_mask(kind: str, variant: str = '') -> Image.Image:
    # masks deliberately broad and feathered because layers are aligned to same portrait pose.
    if kind == 'eyes':
        mask = feather_box((23, 25, 97, 56), blur=6)
    elif kind == 'nose':
        mask = feather_ellipse((43, 43, 77, 79), blur=6)
    elif kind == 'mouth':
        mask = feather_box((36, 72, 84, 94), blur=7)
    elif kind == 'beard':
        mask = feather_box((37, 70, 84, 105), blur=6)
    elif kind == 'hair_messy':
        mask = feather_box((12, 0, 108, 46), blur=7)
    elif kind == 'hair_crop':
        mask = feather_box((18, 0, 102, 38), blur=6)
    elif kind == 'hair_buzz':
        mask = feather_box((22, 4, 98, 28), blur=5)
    elif kind == 'hair_sidepart':
        mask = feather_box((13, 0, 107, 43), blur=7)
    elif kind == 'hair_curly':
        mask = feather_box((12, 0, 108, 42), blur=7)
    elif kind == 'hair_afro':
        mask = feather_box((11, 0, 109, 48), blur=8)
    elif kind == 'hair_bob':
        m1 = feather_box((12, 0, 108, 45), blur=7)
        m2 = feather_box((8, 34, 32, 91), blur=8)
        m3 = feather_box((88, 34, 112, 91), blur=8)
        mask = ImageChops.lighter(m1, ImageChops.lighter(m2, m3))
    elif kind == 'hair_ponytail':
        m1 = feather_box((15, 0, 105, 38), blur=7)
        m2 = feather_box((86, 32, 112, 88), blur=7)
        mask = ImageChops.lighter(m1, m2)
    else:
        mask = Image.new('L', SIZE, 0)
    return mask


def dark_select(img: Image.Image, threshold=105, y_limit=None):
    gray = img.convert('L')
    alpha = img.getchannel('A')
    pixels = gray.load()
    a = alpha.load()
    m = Image.new('L', SIZE, 0)
    mp = m.load()
    for y in range(SIZE[1]):
        if y_limit is not None and y < y_limit[0] or y_limit is not None and y > y_limit[1]:
            continue
        for x in range(SIZE[0]):
            if a[x, y] > 10 and pixels[x, y] < threshold:
                mp[x, y] = 255
    return m.filter(ImageFilter.GaussianBlur(1.2))


def composite_mask(*masks):
    out = Image.new('L', SIZE, 0)
    for m in masks:
        out = ImageChops.lighter(out, m)
    return out


def extract_feature(source_key: str, feature: str, variant: str = '') -> Image.Image:
    src = SOURCES[source_key]
    base_mask = region_mask(feature if not variant else f'{feature}_{variant}')
    if feature == 'beard':
        dark = dark_select(src, threshold=120, y_limit=(66, 106))
        mask = ImageChops.multiply(base_mask, dark)
    elif feature == 'hair':
        dark = dark_select(src, threshold=135, y_limit=(0, 90))
        mask = ImageChops.multiply(base_mask, dark)
    else:
        mask = base_mask
    out = Image.new('RGBA', SIZE, (0, 0, 0, 0))
    out.paste(src, (0, 0), mask)
    return out


def blank() -> Image.Image:
    return Image.new('RGBA', SIZE, (0, 0, 0, 0))


def recolor_hair(img: Image.Image, color_name: str) -> Image.Image:
    if color_name == 'black':
        return img
    base_color, hi_color = HAIR_COLORS[color_name]
    alpha = img.getchannel('A')
    gray = ImageOps.grayscale(img)
    colorized = ImageOps.colorize(gray, black=base_color, white=hi_color).convert('RGBA')
    colorized.putalpha(alpha)
    # keep some source shading.
    return Image.blend(colorized, img, 0.15 if color_name == 'brown' else 0.05)


def stylize_base(img: Image.Image, family: str, gender: str, variant_index: int) -> Image.Image:
    out = apply_color_grade(img, family, gender)
    # remove modular areas so overlays define the face.
    removal = composite_mask(
        region_mask('eyes'),
        region_mask('nose'),
        region_mask('mouth'),
        region_mask('hair_messy'),
        region_mask('hair_bob') if gender == 'Female' else Image.new('L', SIZE, 0),
        region_mask('beard') if gender == 'Male' else Image.new('L', SIZE, 0),
    )
    # preserve a bit of forehead and cheek structure by reducing, not fully deleting, some zones.
    alpha = out.getchannel('A')
    reduced = Image.eval(removal, lambda p: int(p * 0.86))
    alpha = ImageChops.subtract(alpha, reduced)
    out.putalpha(alpha)
    if variant_index % 2 == 1:
        # tiny left/right asymmetry crop shift for paired base IDs.
        shifted = Image.new('RGBA', SIZE, (0, 0, 0, 0))
        shifted.alpha_composite(out, (-1, 0))
        out = shifted
    return out

# ---------- bases ----------
for idx, (base_id, family, gender, source_key) in enumerate(BASES):
    base = stylize_base(SOURCES[source_key], family, gender, idx)
    base.save(ROOT / 'bases' / f'{base_id}.png')

# ---------- eyes ----------
family_source = {
    'east-asian': 'ea_m',
    'west-african': 'wa_f',
    'european': 'la_m',
    'south-asian': 'la_m',
    'latin-american': 'la_m',
    'mixed': 'la_m',
}
for family in FAMILIES:
    src_key = family_source[family]
    eye_img = extract_feature(src_key, 'eyes')
    for idx, eye_id in enumerate(EYE_IDS):
        variant = eye_img.copy()
        # subtle per-eye-set distinction with crop/scale.
        if eye_id == 'eyes-round-open':
            variant = variant.resize((120, 124), Image.Resampling.BICUBIC).crop((0, 2, 120, 122)).resize(SIZE, Image.Resampling.LANCZOS)
        elif eye_id == 'eyes-hooded-serious':
            mask = feather_box((20, 27, 100, 51), blur=5)
            tmp = Image.new('RGBA', SIZE, (0, 0, 0, 0)); tmp.paste(variant, (0, 0), mask); variant = tmp
        elif eye_id == 'eyes-narrow-focused':
            variant = variant.resize((120, 110), Image.Resampling.BICUBIC)
            c = Image.new('RGBA', SIZE, (0, 0, 0, 0)); c.alpha_composite(variant, (0, 4)); variant = c
        elif eye_id == 'eyes-monolid-clean':
            mask = feather_box((22, 31, 98, 49), blur=5)
            tmp = Image.new('RGBA', SIZE, (0, 0, 0, 0)); tmp.paste(variant, (0, 0), mask); variant = tmp
        variant.save(ROOT / 'eyes' / family / f'{eye_id}.png')

# ---------- noses ----------
for idx, nose_id in enumerate(NOSE_IDS):
    src_key = 'la_m' if nose_id in ('nose-aquiline', 'nose-straight', 'nose-narrow') else ('wa_f' if nose_id == 'nose-broad' else 'ea_m')
    img = extract_feature(src_key, 'nose')
    img.save(ROOT / 'noses' / f'{nose_id}.png')

# ---------- mouths ----------
mouth_source = {
    'mouth-firm': 'ea_m',
    'mouth-neutral': 'la_m',
    'mouth-full': 'wa_f',
    'mouth-smirk': 'la_m',
    'mouth-thin': 'ea_m',
}
for mouth_id in MOUTH_IDS:
    img = extract_feature(mouth_source[mouth_id], 'mouth')
    img.save(ROOT / 'mouths' / f'{mouth_id}.png')

# ---------- ears (transparent because ears are embedded in the realistic base busts) ----------
for ear_id in EAR_IDS:
    blank().save(ROOT / 'ears' / f'{ear_id}.png')

# ---------- hair ----------
hair_sources = {
    'buzz': ('ea_m', 'buzz'),
    'crop': ('ea_m', 'crop'),
    'side-part': ('la_m', 'sidepart'),
    'messy': ('ea_m', 'messy'),
    'curly-top': ('ea_m', 'curly'),
    'afro-short': ('wa_f', 'afro'),
    'bob': ('wa_f', 'bob'),
    'ponytail': ('wa_f', 'ponytail'),
}
for style in HAIR_STYLES:
    src_key, variant = hair_sources[style]
    img = extract_feature(src_key, 'hair', variant)
    # clean up a few style-specific masks
    if style == 'buzz':
        # subtle density to simulate a cropped top.
        img = Image.blend(img, blank(), 0.25)
    for color in HAIR_COLORS:
        recolor_hair(img, color).save(ROOT / 'hair' / f'{style}-{color}.png')

# ---------- beards ----------
beard_source = extract_feature('la_m', 'beard')
ea_beard = extract_feature('ea_m', 'beard')
for style in BEARDS:
    base = beard_source.copy() if style in ('short','moustache') else ea_beard.copy()
    if style == 'stubble':
        base = Image.blend(base, blank(), 0.55)
    elif style == 'moustache':
        m = feather_box((43, 71, 77, 82), blur=4)
        tmp = Image.new('RGBA', SIZE, (0,0,0,0)); tmp.paste(base, (0,0), m); base = tmp
    elif style == 'goatee':
        m1 = feather_box((44, 71, 77, 82), blur=4)
        m2 = feather_box((49, 83, 72, 104), blur=5)
        m = composite_mask(m1, m2)
        tmp = Image.new('RGBA', SIZE, (0,0,0,0)); tmp.paste(base, (0,0), m); base = tmp
    for color in HAIR_COLORS:
        recolor_hair(base, color).save(ROOT / 'beards' / f'{style}-{color}.png')

# ---------- manifest ----------
manifest = {
    'version': '2.0-realistic-starter',
    'canvas': [120, 120],
    'format': 'png-layers',
    'notes': 'Starter realistic portrait asset library derived from painted roster portraits; rarity styling handled separately by FighterPortrait.',
    'bases': [{'id': i, 'family': f, 'gender': g, 'file': f'bases/{i}.png'} for i, f, g, _ in BASES],
    'eyes': [{'id': eye, 'family': fam, 'file': f'eyes/{fam}/{eye}.png'} for fam in FAMILIES for eye in EYE_IDS],
    'noses': [{'id': k, 'file': f'noses/{k}.png'} for k in NOSE_IDS],
    'mouths': [{'id': k, 'file': f'mouths/{k}.png'} for k in MOUTH_IDS],
    'ears': [{'id': k, 'file': f'ears/{k}.png'} for k in EAR_IDS],
    'hair': [{'style': s, 'color': c, 'file': f'hair/{s}-{c}.png'} for s in HAIR_STYLES for c in HAIR_COLORS],
    'beards': [{'style': s, 'color': c, 'file': f'beards/{s}-{c}.png'} for s in BEARDS for c in HAIR_COLORS],
}
(ROOT / 'manifest.json').write_text(json.dumps(manifest, indent=2))
print('Realistic assets generated')
print('PNG count:', sum(1 for _ in ROOT.rglob('*.png')))
