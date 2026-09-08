from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageOps
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
GALLERY = Image.open(ROOT / 'tools' / 'portrait_sources' / 'elite_gallery.png').convert('RGBA')
PORTRAIT_ROOT = ROOT / 'public' / 'portraits-v11'

# Card positions from the existing 20-face showcase. We crop tightly to the head/neck,
# then use a feathered vignette so no old card text/background survives visibly.
X = [13, 216, 419, 619, 821]
Y = [151, 456, 761, 1065]
CARD_W, CARD_H = 190, 260

# Gallery fighter index -> (family, gender, asset id, tags)
ELITE = {
    1: ('east-asian', 'male', 'ea_m_03', ['stoic','focused','scarred','black-hair']),
    2: ('european', 'female', 'eu_f_02', ['intense','fighter','braids','blonde']),
    3: ('west-african', 'male', 'wa_m_01', ['power','intense','bearded','tattoo']),
    4: ('southeast-asian', 'female', 'sea_f_02', ['rebel','showman','pink-hair','freckles']),
    5: ('european', 'male', 'eu_m_01', ['veteran','stoic','bearded','gray-hair']),
    6: ('west-african', 'female', 'wa_f_03', ['calm','confident','platinum-hair','clean']),
    7: ('latin-mixed', 'male', 'la_m_03', ['young','cocky','curly','technical']),
    8: ('east-asian', 'female', 'ea_f_01', ['calm','technical','clean','black-hair']),
    9: ('european', 'male', 'eu_m_02', ['villain','intense','tattoo','bearded']),
    10: ('south-asian', 'female', 'sa_f_01', ['classy','calm','glasses','technical']),
    11: ('south-asian', 'male', 'sa_m_01', ['rugged','intense','bearded','fighter']),
    12: ('east-asian', 'female', 'ea_f_02', ['clean','calm','focused','black-hair']),
    13: ('west-african', 'male', 'wa_m_02', ['legacy','focused','headband','stoic']),
    14: ('european', 'female', 'eu_f_03', ['tough','scarred','blonde','fighter']),
    15: ('southeast-asian', 'male', 'sea_m_01', ['focused','tattoo','black-hair','fearless']),
    16: ('latin-mixed', 'male', 'la_m_04', ['young','calm','curly','clean']),
    17: ('latin-mixed', 'female', 'la_f_01', ['intense','tattoo','dark-hair','fighter']),
    18: ('east-asian', 'male', 'ea_m_04', ['veteran','stoic','buzz','legacy']),
    19: ('west-african', 'female', 'wa_f_04', ['graceful','confident','braids','classy']),
    20: ('european', 'male', 'eu_m_03', ['wild','veteran','headband','long-hair']),
}

# one same-art-style generic face per family/gender for Common/Uncommon/Rare.
STANDARD_FROM_ELITE = {
    ('european','male'): 16,
    ('european','female'): 14,
    ('west-african','male'): 3,
    ('west-african','female'): 19,
    ('east-asian','male'): 1,
    ('east-asian','female'): 12,
    ('southeast-asian','male'): 15,
    ('southeast-asian','female'): 8,
    ('south-asian','male'): 11,
    ('south-asian','female'): 17,
    ('latin-mixed','male'): 7,
    ('latin-mixed','female'): 17,
}

PREFIX = {
    'european':'eur', 'west-african':'wes', 'east-asian':'eas',
    'southeast-asian':'sea', 'south-asian':'sou', 'latin-mixed':'lat'
}


def extract_face(index: int) -> Image.Image:
    r, c = divmod(index-1, 5)
    x0, y0 = X[c], Y[r]
    # Tight crop; most old side-notes fall outside this box.
    crop = GALLERY.crop((x0+28, y0+23, x0+CARD_W-26, y0+CARD_H-10))
    w, h = crop.size
    mask = Image.new('L', (w,h), 0)
    d = ImageDraw.Draw(mask)
    # Face/hair oval + neck/shoulders. Edges feather into the new rarity background.
    d.ellipse((w*0.11, h*0.0, w*0.89, h*0.78), fill=255)
    d.polygon([(w*0.25,h*0.57),(w*0.75,h*0.57),(w*0.98,h),(w*0.02,h)], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(5.2))
    crop.putalpha(mask)
    out = Image.new('RGBA', (120,120), (0,0,0,0))
    fitted = ImageOps.fit(crop, (120,120), Image.Resampling.LANCZOS, centering=(0.5,0.43))
    out.alpha_composite(fitted)
    # Trim tiny old annotation fragments at the very outer edges.
    arr = np.array(out)
    alpha = arr[:,:,3]
    alpha[:, :15] = (alpha[:, :15] * np.linspace(0,1,15)[None,:]).astype(np.uint8)
    alpha[:, -15:] = (alpha[:, -15:] * np.linspace(1,0,15)[None,:]).astype(np.uint8)
    arr[:,:,3] = alpha
    return Image.fromarray(arr)


for idx, (family, gender, asset_id, tags) in ELITE.items():
    folder = PORTRAIT_ROOT / 'elite' / family / gender
    folder.mkdir(parents=True, exist_ok=True)
    extract_face(idx).save(folder / f'{asset_id}.png')

# Explicit white/silver-haired East Asian male variant, created only by recoloring the
# baked-in hair region of an existing finished portrait; no face reconstruction.
base_path = PORTRAIT_ROOT / 'elite' / 'east-asian' / 'male' / 'ea_m_01.png'
if base_path.exists():
    im = Image.open(base_path).convert('RGBA')
    arr = np.array(im)
    h,w = arr.shape[:2]
    yy,xx = np.mgrid[0:h,0:w]
    rgb = arr[:,:,:3].astype(np.int16)
    alpha = arr[:,:,3]
    luminance = rgb.mean(axis=2)
    # top/head dark-pixel mask; avoids skin and eyes.
    mask = (yy < 58) & (xx > 18) & (xx < 103) & (alpha > 20) & (luminance < 95)
    # silver/white hair with preserved source luminance texture.
    lum = np.clip(luminance[mask], 0, 110)
    target = np.stack([
        np.clip(195 + lum*0.42, 0, 255),
        np.clip(200 + lum*0.42, 0, 255),
        np.clip(210 + lum*0.40, 0, 255),
    ], axis=1).astype(np.uint8)
    arr[:,:,:3][mask] = target
    out = Image.fromarray(arr)
    out.save(PORTRAIT_ROOT / 'elite' / 'east-asian' / 'male' / 'ea_m_05.png')

# Replace the old geometric standard portraits with same-style finished faces.
for (family, gender), idx in STANDARD_FROM_ELITE.items():
    prefix = PREFIX[family]
    g = 'm' if gender == 'male' else 'f'
    folder = PORTRAIT_ROOT / 'standard' / family / gender
    folder.mkdir(parents=True, exist_ok=True)
    extract_face(idx).save(folder / f'{prefix}_{g}_01.png')

print('Built portrait expansion:', len(ELITE)+1, 'elite additions and', len(STANDARD_FROM_ELITE), 'standard replacements')
