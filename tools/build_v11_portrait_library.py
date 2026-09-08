from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public' / 'portraits-v11'
OUT.mkdir(parents=True, exist_ok=True)

ELITE_SIZE = 384
STD_SIZE = 384


def ensure(path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)


def load_rgba(path: str) -> Image.Image:
    return Image.open(path).convert('RGBA')


def crop_with_mask(seg_path: str, mask_path: str, out_path: Path):
    seg = load_rgba(seg_path)
    mask = Image.open(mask_path).convert('L')
    if mask.size != seg.size:
        mask = mask.resize(seg.size, Image.Resampling.LANCZOS)
    seg.putalpha(mask)
    bbox = mask.getbbox()
    if bbox:
        seg = seg.crop(bbox)
    seg.thumbnail((ELITE_SIZE-18, ELITE_SIZE-12), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', (ELITE_SIZE, ELITE_SIZE), (0,0,0,0))
    x = (ELITE_SIZE - seg.width)//2
    y = ELITE_SIZE - seg.height + 2
    canvas.alpha_composite(seg, (x,y))
    ensure(out_path)
    canvas.save(out_path)


def copy_alpha_source(src_path: str, out_path: Path):
    im = load_rgba(src_path)
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
    im.thumbnail((ELITE_SIZE-12, ELITE_SIZE-10), Image.Resampling.LANCZOS)
    canvas = Image.new('RGBA', (ELITE_SIZE, ELITE_SIZE), (0,0,0,0))
    x = (ELITE_SIZE-im.width)//2
    y = ELITE_SIZE-im.height+2
    canvas.alpha_composite(im,(x,y))
    ensure(out_path)
    canvas.save(out_path)

# Curated elite starter faces from the strong reference set / prior approved renders.
elite = [
    ('/mnt/data/crop_test/irish_seg.png','/mnt/data/crop_test/irish_mask.png', OUT/'elite/european/female/eu_f_01.png'),
    ('/mnt/data/crop_test/nigerian_seg.png','/mnt/data/crop_test/nigerian_mask.png', OUT/'elite/west-african/female/wa_f_01.png'),
    ('/mnt/data/crop_test/japanese_seg.png','/mnt/data/crop_test/japanese_mask.png', OUT/'elite/east-asian/male/ea_m_01.png'),
    ('/mnt/data/crop_test/thai_seg.png','/mnt/data/crop_test/thai_mask.png', OUT/'elite/southeast-asian/female/sea_f_01.png'),
    ('/mnt/data/crop_test/brazilian_seg.png','/mnt/data/crop_test/brazilian_mask.png', OUT/'elite/latin-mixed/male/la_m_01.png'),
]
for seg,mask,out in elite:
    crop_with_mask(seg,mask,out)

copy_alpha_source('/mnt/data/rugged_east_asian_fighter_portrait.png', OUT/'elite/east-asian/male/ea_m_02.png')
copy_alpha_source('/mnt/data/intense_braided_athlete_portrait.png', OUT/'elite/west-african/female/wa_f_02.png')
copy_alpha_source('/mnt/data/intense_fighter_portrait_cutout.png', OUT/'elite/latin-mixed/male/la_m_02.png')

# ---------- Standard portraits: one reliable generic portrait per family + gender ----------
FAMILY_COLORS = {
    'european': {'skin':'#E9C6AF','shadow':'#C79C82','hair':'#6A4B39'},
    'west-african': {'skin':'#70432F','shadow':'#4C2C20','hair':'#161419'},
    'east-asian': {'skin':'#DAB08D','shadow':'#B98566','hair':'#17151A'},
    'southeast-asian': {'skin':'#C48E68','shadow':'#966449','hair':'#20161A'},
    'south-asian': {'skin':'#A66F50','shadow':'#754A36','hair':'#211719'},
    'latin-mixed': {'skin':'#B77F5D','shadow':'#855842','hair':'#3D2A24'},
}


def standard_portrait(family: str, gender: str, path: Path):
    c = FAMILY_COLORS[family]
    W=H=STD_SIZE
    im = Image.new('RGBA',(W,H),(0,0,0,0))
    d = ImageDraw.Draw(im)
    female = gender == 'female'
    cx=192
    # shoulders / neck
    shoulder_y = 318 if female else 305
    shoulder_w = 126 if female else 150
    d.ellipse((cx-shoulder_w, shoulder_y-22, cx+shoulder_w, H+95), fill=c['shadow'])
    neck_w = 64 if female else 78
    d.rounded_rectangle((cx-neck_w//2, 250, cx+neck_w//2, 346), radius=24, fill=c['skin'])
    # face
    if female:
        face_box=(105,60,279,292)
        d.ellipse(face_box, fill=c['skin'])
        # jaw softening
        d.polygon([(125,196),(259,196),(244,268),(212,294),(172,294),(140,268)], fill=c['skin'])
    else:
        face_box=(96,52,288,292)
        d.ellipse(face_box, fill=c['skin'])
        d.polygon([(113,178),(271,178),(260,265),(224,298),(160,298),(124,265)], fill=c['skin'])
    # ears
    d.ellipse((84,145,120,205), fill=c['skin'])
    d.ellipse((264,145,300,205), fill=c['skin'])
    # subtle cheeks
    shade = Image.new('RGBA',(W,H),(0,0,0,0))
    sd=ImageDraw.Draw(shade)
    sd.ellipse((118,175,173,224), fill=(0,0,0,16))
    sd.ellipse((211,175,266,224), fill=(0,0,0,16))
    shade=shade.filter(ImageFilter.GaussianBlur(11))
    im=Image.alpha_composite(im,shade)
    d=ImageDraw.Draw(im)
    # eyes
    eye_y=163 if female else 168
    eye_w=28 if female else 30
    for ex in (151,233):
        d.ellipse((ex-eye_w//2, eye_y-6, ex+eye_w//2, eye_y+7), fill='#EFEAE2')
        d.ellipse((ex-5, eye_y-4, ex+5, eye_y+6), fill='#4C3C31' if family!='east-asian' else '#2D2928')
        d.ellipse((ex-2, eye_y-2, ex+2, eye_y+4), fill='#111111')
    # brows
    brow_col=c['hair']
    brow_w=5 if female else 7
    d.line((133,142,170,138 if female else 140), fill=brow_col, width=brow_w)
    d.line((214,138 if female else 140,251,142), fill=brow_col, width=brow_w)
    # nose
    d.line((192,170,188,215), fill=(83,50,40,120), width=3)
    d.arc((177,205,207,226), 15,165, fill=(83,50,40,130), width=3)
    # mouth
    mouth_y=242 if female else 244
    lip='#9D625D' if female else '#79554D'
    d.arc((159,mouth_y-8,225,mouth_y+14), 200,340, fill=lip, width=4)
    d.arc((163,mouth_y-2,221,mouth_y+16), 20,160, fill=lip, width=3)
    # hair built into generic portrait
    if female:
        if family in ('west-african','south-asian'):
            d.ellipse((102,35,282,150), fill=c['hair'])
            d.rectangle((105,95,130,270), fill=c['hair'])
            d.rectangle((254,95,279,270), fill=c['hair'])
        else:
            d.ellipse((98,28,286,144), fill=c['hair'])
            d.polygon([(98,105),(118,48),(155,70),(192,52),(233,70),(286,105),(270,137),(116,137)], fill=c['hair'])
    else:
        d.ellipse((102,24,282,128), fill=c['hair'])
        d.polygon([(100,103),(126,42),(161,60),(196,40),(237,61),(282,103),(270,129),(112,129)], fill=c['hair'])
    # simple family cues
    if family == 'east-asian':
        # reduce visible sclera with top lid
        for ex in (151,233):
            d.line((ex-16,eye_y,ex+16,eye_y-1), fill='#3A2822', width=4)
    if family == 'west-african':
        # slightly fuller lips
        d.arc((155,mouth_y-10,229,mouth_y+17), 200,340, fill='#83534E', width=5)
    ensure(path)
    im.save(path)

for family in FAMILY_COLORS:
    for gender in ('male','female'):
        standard_portrait(family, gender, OUT/f'standard/{family}/{gender}/{family[:3]}_{gender[0]}_01.png')

# ---------- Safe accessory overlays ----------
# All overlays use 384x384 canvas and are intentionally simple/aligned.
def accessory_svg(name: str, body: str):
    path=OUT/'accessories'/f'{name}.svg'
    ensure(path)
    path.write_text(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 384">{body}</svg>''')

accessory_svg('scar-brow', '<path d="M118 124 L139 154" stroke="#D8B1A0" stroke-width="5" stroke-linecap="round" opacity="0.8"/>')
accessory_svg('scar-cheek', '<path d="M268 184 L244 229" stroke="#C59686" stroke-width="5" stroke-linecap="round" opacity="0.78"/>')
accessory_svg('glasses', '<g fill="none" stroke="#222" stroke-width="6" opacity="0.9"><rect x="92" y="134" width="76" height="49" rx="20"/><rect x="216" y="134" width="76" height="49" rx="20"/><path d="M168 151 Q192 141 216 151"/></g>')
accessory_svg('sunglasses', '<g fill="#17181B" stroke="#37393D" stroke-width="5" opacity="0.92"><rect x="90" y="132" width="80" height="53" rx="18"/><rect x="214" y="132" width="80" height="53" rx="18"/><path d="M168 149 Q192 141 216 149" fill="none"/></g>')
accessory_svg('headband-black', '<path d="M86 90 Q192 54 298 90 L296 112 Q192 80 88 112 Z" fill="#18191C" opacity="0.93"/>')
accessory_svg('headband-red', '<path d="M86 90 Q192 54 298 90 L296 112 Q192 80 88 112 Z" fill="#8B262B" opacity="0.93"/>')
accessory_svg('face-tape', '<rect x="263" y="179" width="51" height="13" rx="4" transform="rotate(-23 288 185)" fill="#E7DFCE" opacity="0.92"/>')

print('v11 portrait starter built')
