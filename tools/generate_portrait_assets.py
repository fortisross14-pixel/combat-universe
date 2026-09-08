from pathlib import Path
import json, html

ROOT = Path(__file__).resolve().parents[1] / 'public' / 'portraits'
for d in ['bases','eyes','noses','mouths','ears','hair','beards','accessories']:
    (ROOT/d).mkdir(parents=True, exist_ok=True)

FAMILY_SKINS = {
    'east-asian': ('#E7C6AC','#B9856B','#F5DAC5'),
    'west-african': ('#7B4931','#4B2A1D','#A66749'),
    'european': ('#E9C5AB','#B8876D','#F8DCC7'),
    'south-asian': ('#BC805C','#86543C','#D9A27E'),
    'latin-american': ('#C99370','#8F6047','#E0B08C'),
    'mixed': ('#C08A69','#85583F','#DEAD88'),
}

BASES = [
    ('ea-m-rect','east-asian','Male','rectangular'),('ea-m-oval','east-asian','Male','oval'),('ea-f-heart','east-asian','Female','heart'),('ea-f-round','east-asian','Female','round'),
    ('wa-m-square','west-african','Male','square'),('wa-m-softrect','west-african','Male','soft-rect'),('wa-f-heart','west-african','Female','heart'),('wa-f-diamond','west-african','Female','diamond'),
    ('eu-m-rect','european','Male','rectangular'),('eu-m-pear','european','Male','pear'),('eu-f-oval','european','Female','oval'),('eu-f-softrect','european','Female','soft-rect'),
    ('sa-m-oval','south-asian','Male','oval'),('sa-m-square','south-asian','Male','square'),('sa-f-heart','south-asian','Female','heart'),('sa-f-round','south-asian','Female','round'),
    ('la-m-softrect','latin-american','Male','soft-rect'),('la-m-diamond','latin-american','Male','diamond'),('la-f-oval','latin-american','Female','oval'),('la-f-diamond','latin-american','Female','diamond'),
    ('mx-m-rect','mixed','Male','rectangular'),('mx-m-oval','mixed','Male','oval'),('mx-f-heart','mixed','Female','heart'),('mx-f-softrect','mixed','Female','soft-rect'),
]

SHAPE_POINTS = {
    'oval':       (38,36, 39,57, 44,79, 52,96, 60,102, 68,96, 76,79, 81,57, 82,36),
    'round':      (37,37, 38,58, 42,80, 51,96, 60,101, 69,96, 78,80, 82,58, 83,37),
    'heart':      (36,36, 38,58, 43,79, 52,96, 60,103, 68,96, 77,79, 82,58, 84,36),
    'diamond':    (39,35, 37,57, 42,77, 51,95, 60,103, 69,95, 78,77, 83,57, 81,35),
    'square':     (37,35, 36,58, 39,80, 49,97, 60,102, 71,97, 81,80, 84,58, 83,35),
    'rectangular':(39,33, 37,57, 40,81, 50,99, 60,105, 70,99, 80,81, 83,57, 81,33),
    'soft-rect':  (38,34, 37,57, 40,80, 50,98, 60,104, 70,98, 80,80, 83,57, 82,34),
    'pear':       (41,34, 38,57, 40,79, 49,98, 60,104, 71,98, 80,79, 82,57, 79,34),
}


def svg_wrap(body, defs=''):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">{defs}{body}</svg>'''


def face_path(shape):
    p=SHAPE_POINTS[shape]
    # Smooth symmetric-ish cubic path using the stored landmarks.
    return (
        f"M{p[0]} {p[1]} "
        f"C{p[0]-4} {p[1]+8} {p[2]-3} {p[3]-8} {p[2]} {p[3]} "
        f"C{p[2]} {p[3]+9} {p[4]} {p[5]-7} {p[4]} {p[5]} "
        f"C{p[4]} {p[5]+8} {p[6]-3} {p[7]-5} {p[6]} {p[7]} "
        f"Q{p[8]} {p[9]+4} {p[10]} {p[11]} "
        f"C{p[12]+3} {p[13]-5} {p[12]} {p[13]+8} {p[12]} {p[13]} "
        f"C{p[14]} {p[15]-7} {p[14]} {p[15]+9} {p[14]} {p[15]} "
        f"C{p[16]+4} {p[17]+8} {p[16]} {p[17]} {p[16]} {p[17]} "
        f"Q60 23 {p[0]} {p[1]} Z"
    )


def base_asset(base_id, family, gender, shape):
    skin, shadow, hi = FAMILY_SKINS[family]
    female = gender == 'Female'
    path = face_path(shape)
    neck_w = 13 if female else 17
    shoulder = 32 if female else 38
    outline = '#251C19'
    defs = f'''
    <defs>
      <linearGradient id="skin" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="{hi}"/>
        <stop offset="48%" stop-color="{skin}"/>
        <stop offset="100%" stop-color="{shadow}"/>
      </linearGradient>
      <linearGradient id="neck" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="{shadow}"/>
        <stop offset="45%" stop-color="{skin}"/>
        <stop offset="70%" stop-color="{hi}"/>
        <stop offset="100%" stop-color="{shadow}"/>
      </linearGradient>
      <linearGradient id="shirt" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#243044"/>
        <stop offset="100%" stop-color="#111722"/>
      </linearGradient>
      <clipPath id="head"><path d="{path}"/></clipPath>
    </defs>'''
    body = f'''
      <path d="M{60-shoulder} 120 Q{28 if female else 22} 106 {60-neck_w-4} 94 L{60-neck_w} 87 Q60 92 {60+neck_w} 87 L{60+neck_w+4} 94 Q{92 if female else 98} 106 {60+shoulder} 120Z" fill="url(#shirt)"/>
      <path d="M{60-neck_w} 87 Q{60-neck_w+2} 100 60 105 Q{60+neck_w-2} 100 {60+neck_w} 87 L{60+neck_w+2} 110 Q60 116 {60-neck_w-2} 110Z" fill="url(#neck)"/>
      <ellipse cx="34" cy="64" rx="5.3" ry="8.4" fill="{shadow}"/>
      <ellipse cx="86" cy="64" rx="5.3" ry="8.4" fill="{shadow}"/>
      <path d="{path}" fill="url(#skin)" stroke="{outline}" stroke-width="0.7" stroke-opacity="0.35"/>
      <g clip-path="url(#head)">
        <path d="M41 44 Q47 34 59 33 Q52 48 51 69 Q51 84 56 96 Q46 90 41 72Z" fill="{hi}" opacity="0.14"/>
        <path d="M79 45 Q85 59 80 80 Q75 93 66 98 Q76 84 75 66 Q74 51 69 38 Q77 42 79 45Z" fill="{shadow}" opacity="0.16"/>
        <ellipse cx="49" cy="75" rx="8" ry="10" fill="{hi}" opacity="{0.07 if female else 0.04}"/>
        <ellipse cx="71" cy="75" rx="8" ry="10" fill="{hi}" opacity="{0.07 if female else 0.04}"/>
        <path d="M45 87 Q48 100 60 104 Q72 100 75 87 Q72 106 60 111 Q48 106 45 87Z" fill="{shadow}" opacity="0.09"/>
        <path d="M47 43 Q60 37 73 43" fill="none" stroke="{hi}" stroke-width="1.2" opacity="0.14" stroke-linecap="round"/>
      </g>
      <path d="M51 90 Q60 95 69 90" fill="none" stroke="{shadow}" stroke-width="1.0" opacity="0.18" stroke-linecap="round"/>
      <path d="M50 104 Q60 108 70 104" fill="none" stroke="{shadow}" stroke-width="1.0" opacity="0.22" stroke-linecap="round"/>
    '''
    return svg_wrap(body, defs)

# Generate base heads
for base_id,family,gender,shape in BASES:
    (ROOT/'bases'/f'{base_id}.svg').write_text(base_asset(base_id,family,gender,shape))

# Feature database: eyes are family-specific, other facial features are common.
EYE_IDS = ['eyes-almond-soft','eyes-round-open','eyes-hooded-serious','eyes-narrow-focused','eyes-monolid-clean']
FAMILIES = list(FAMILY_SKINS.keys())

def eye_asset(family, eye_id):
    # family only influences eye anatomy treatment; iris remains universal.
    if eye_id == 'eyes-round-open':
        h=3.5; lid=0.2; lift=0.0
    elif eye_id == 'eyes-hooded-serious':
        h=2.3; lid=1.3; lift=-0.25
    elif eye_id == 'eyes-narrow-focused':
        h=1.75; lid=0.9; lift=-0.5
    elif eye_id == 'eyes-monolid-clean':
        h=1.9; lid=1.1; lift=0.1
    else:
        h=2.7; lid=0.35; lift=0.15
    if family == 'east-asian':
        h *= 0.88
        lift += 0.25
    if family == 'west-african' and eye_id == 'eyes-round-open':
        h *= 1.05
    parts=[]
    for x,side in [(50,-1),(70,1)]:
        top = 56-h-lid + lift*side
        bottom = 56+h*0.78
        parts.append(f'<path d="M{x-8} 56.2 Q{x} {top} {x+8} 56.2 Q{x} {bottom} {x-8} 56.2Z" fill="#F5F1EA"/>')
        parts.append(f'<ellipse cx="{x}" cy="56.3" rx="2.1" ry="1.75" fill="#4A3527"/>')
        parts.append(f'<ellipse cx="{x}" cy="56.4" rx="0.9" ry="1.15" fill="#171519"/>')
        parts.append(f'<circle cx="{x-0.5}" cy="55.7" r="0.42" fill="#fff" opacity="0.9"/>')
        parts.append(f'<path d="M{x-8.3} 56 Q{x} {top-0.45} {x+8.3} 56" fill="none" stroke="#2C201D" stroke-width="1.15" stroke-linecap="round"/>')
        brow_y = 49.2 if eye_id in ['eyes-hooded-serious','eyes-narrow-focused'] else 49.8
        brow_arch = 1.0 if eye_id == 'eyes-round-open' else 0.3 if eye_id == 'eyes-monolid-clean' else 1.8 if eye_id == 'eyes-almond-soft' else 0.2
        brow_tilt = 1.4 if eye_id in ['eyes-hooded-serious','eyes-narrow-focused'] else 0.2
        if side < 0:
            parts.append(f'<path d="M{x-7} {brow_y+brow_tilt} Q{x} {brow_y-brow_arch} {x+7} {brow_y-brow_tilt*0.3}" fill="none" stroke="#2B211F" stroke-width="2.2" stroke-linecap="round"/>')
        else:
            parts.append(f'<path d="M{x-7} {brow_y-brow_tilt*0.3} Q{x} {brow_y-brow_arch} {x+7} {brow_y+brow_tilt}" fill="none" stroke="#2B211F" stroke-width="2.2" stroke-linecap="round"/>')
        if eye_id == 'eyes-monolid-clean':
            parts.append(f'<path d="M{x-7.1} 54.7 Q{x} {top-0.8} {x+7.1} 54.6" fill="none" stroke="#76584A" stroke-width="0.65" opacity="0.45"/>')
    return svg_wrap(''.join(parts))

for family in FAMILIES:
    d=ROOT/'eyes'/family
    d.mkdir(parents=True,exist_ok=True)
    for eye_id in EYE_IDS:
        (d/f'{eye_id}.svg').write_text(eye_asset(family,eye_id))

NOSES = {
 'nose-straight': '<path d="M59 61 Q58.2 68.5 59.1 75.5" stroke="#62483D" stroke-width="1.25" fill="none" opacity="0.78" stroke-linecap="round"/><path d="M55.7 76 Q60 79.2 64.3 76" stroke="#62483D" stroke-width="1.1" fill="none" opacity="0.78" stroke-linecap="round"/><path d="M60 62 Q59.8 69 60 75" stroke="#F6DCC8" stroke-width="0.72" fill="none" opacity="0.35"/>',
 'nose-narrow': '<path d="M59.3 61 Q58.8 69 59.2 75.5" stroke="#60463B" stroke-width="1.15" fill="none" opacity="0.8" stroke-linecap="round"/><path d="M56.8 76.2 Q60 78.4 63.2 76.2" stroke="#60463B" stroke-width="1.0" fill="none" opacity="0.8" stroke-linecap="round"/><path d="M60.2 62 Q60 69 60.1 75" stroke="#F6DCC8" stroke-width="0.65" fill="none" opacity="0.34"/>',
 'nose-broad': '<path d="M58.5 61 Q57.5 68.5 58 74.8" stroke="#5A4035" stroke-width="1.25" fill="none" opacity="0.78" stroke-linecap="round"/><path d="M53.8 76 Q60 80.2 66.2 76" stroke="#5A4035" stroke-width="1.25" fill="none" opacity="0.84" stroke-linecap="round"/><ellipse cx="55.4" cy="76.4" rx="1.2" ry="0.65" fill="#4D352D" opacity="0.55"/><ellipse cx="64.6" cy="76.4" rx="1.2" ry="0.65" fill="#4D352D" opacity="0.55"/>',
 'nose-aquiline': '<path d="M58.8 61 Q62.2 67 61.2 72.8 Q63.2 75 64.2 76" stroke="#5F443A" stroke-width="1.35" fill="none" opacity="0.8" stroke-linecap="round"/><path d="M55.4 76 Q60 79.3 64.7 76" stroke="#5F443A" stroke-width="1.05" fill="none" opacity="0.78" stroke-linecap="round"/><path d="M59.3 62 Q59.5 68 59.4 74" stroke="#F6DCC8" stroke-width="0.65" fill="none" opacity="0.3"/>',
 'nose-soft': '<path d="M59 62 Q58.5 69 59.2 74.8" stroke="#654B3F" stroke-width="1.0" fill="none" opacity="0.64" stroke-linecap="round"/><path d="M56.2 76 Q60 78.8 63.8 76" stroke="#654B3F" stroke-width="1.0" fill="none" opacity="0.68" stroke-linecap="round"/><ellipse cx="60" cy="75.5" rx="3.1" ry="1.3" fill="#8A6252" opacity="0.12"/>',
}
for k,v in NOSES.items(): (ROOT/'noses'/f'{k}.svg').write_text(svg_wrap(v))

MOUTHS = {
 'mouth-firm': '<path d="M50 85 Q55 83.7 60 84.4 Q65 83.7 70 85" fill="none" stroke="#743F3B" stroke-width="1.25" stroke-linecap="round"/><path d="M51 86 Q60 87.7 69 86" fill="none" stroke="#9A625C" stroke-width="1.05" opacity="0.8" stroke-linecap="round"/>',
 'mouth-neutral': '<path d="M50 84.8 Q55 83.4 60 84.2 Q65 83.4 70 84.8" fill="#8B5750" opacity="0.84"/><path d="M51 85.5 Q60 88.3 69 85.5 Q60 86.4 51 85.5Z" fill="#A96E68" opacity="0.86"/><path d="M50 85 Q60 86.3 70 85" fill="none" stroke="#6F403A" stroke-width="0.8"/>',
 'mouth-full': '<path d="M49.5 84.8 Q55 82.9 60 84.2 Q65 82.9 70.5 84.8" fill="#965C57"/><path d="M50.4 85.6 Q60 90 69.6 85.6 Q60 86.2 50.4 85.6Z" fill="#BF7A75"/><path d="M50 85 Q60 86.3 70 85" fill="none" stroke="#6F403A" stroke-width="0.85"/>',
 'mouth-smirk': '<path d="M50 85 Q55 83.7 60 84.4 Q66 83.1 70 83.9" fill="#8E5751" opacity="0.9"/><path d="M51 85.6 Q60 88 69.5 84.8" fill="none" stroke="#6F403A" stroke-width="1.0" stroke-linecap="round"/>',
 'mouth-thin': '<path d="M49.5 85 Q55 84.1 60 84.5 Q65 84.1 70.5 85" fill="none" stroke="#774640" stroke-width="1.0" stroke-linecap="round"/><path d="M51 85.7 Q60 86.8 69 85.7" fill="none" stroke="#A06760" stroke-width="0.65" opacity="0.75"/>',
}
for k,v in MOUTHS.items(): (ROOT/'mouths'/f'{k}.svg').write_text(svg_wrap(v))

EARS = {
 'ears-compact': '<path d="M33 60 Q30 64 33 69 Q35 70 36 66 Q34 64 35 61" fill="none" stroke="#6A4A3F" stroke-width="0.9" opacity="0.45"/><path d="M87 60 Q90 64 87 69 Q85 70 84 66 Q86 64 85 61" fill="none" stroke="#6A4A3F" stroke-width="0.9" opacity="0.45"/>',
 'ears-medium': '<path d="M32 59 Q28.5 64 32 70 Q35 72 36 67 Q33 64 35 60" fill="none" stroke="#6A4A3F" stroke-width="1.0" opacity="0.45"/><path d="M88 59 Q91.5 64 88 70 Q85 72 84 67 Q87 64 85 60" fill="none" stroke="#6A4A3F" stroke-width="1.0" opacity="0.45"/>',
 'ears-pronounced': '<path d="M31 58 Q27 64 31 72 Q35 74 36.5 68 Q33 64 35 59" fill="none" stroke="#6A4A3F" stroke-width="1.1" opacity="0.5"/><path d="M89 58 Q93 64 89 72 Q85 74 83.5 68 Q87 64 85 59" fill="none" stroke="#6A4A3F" stroke-width="1.1" opacity="0.5"/>',
 'ears-high': '<path d="M32 57 Q29 61 32 67 Q35 69 36 64 Q34 62 35 58" fill="none" stroke="#6A4A3F" stroke-width="1.0" opacity="0.45"/><path d="M88 57 Q91 61 88 67 Q85 69 84 64 Q86 62 85 58" fill="none" stroke="#6A4A3F" stroke-width="1.0" opacity="0.45"/>',
 'ears-wide': '<path d="M30.5 59 Q27 64 31 70 Q35 72 36.5 67 Q33 64 35 60" fill="none" stroke="#6A4A3F" stroke-width="1.0" opacity="0.5"/><path d="M89.5 59 Q93 64 89 70 Q85 72 83.5 67 Q87 64 85 60" fill="none" stroke="#6A4A3F" stroke-width="1.0" opacity="0.5"/>',
}
for k,v in EARS.items(): (ROOT/'ears'/f'{k}.svg').write_text(svg_wrap(v))

HAIR_COLORS = {
  'black': ('#17171B','#3B3842'),
  'brown': ('#57392A','#81604C'),
  'blonde': ('#B8925D','#DFC18A'),
}
HAIR_STYLES = ['buzz','crop','side-part','messy','curly-top','afro-short','bob','ponytail']

def hair_asset(style,color):
    c,h = HAIR_COLORS[color]
    if style=='buzz': body=f'<path d="M36 39 Q36 21 60 18 Q84 21 84 39 Q75 30 60 30 Q45 30 36 39Z" fill="{c}"/><path d="M42 28 Q60 19 78 28" stroke="{h}" stroke-width="1.2" fill="none" opacity="0.35"/>'
    elif style=='crop': body=f'<path d="M35 40 Q37 21 60 19 Q84 21 85 40 Q75 29 60 31 Q45 29 35 40Z" fill="{c}"/><path d="M40 29 Q49 23 58 29 Q68 23 79 30" stroke="{h}" stroke-width="1.3" fill="none" opacity="0.38"/>'
    elif style=='side-part': body=f'<path d="M35 40 Q38 19 61 18 Q80 20 86 39 Q73 30 54 30 Q43 34 35 40Z" fill="{c}"/><path d="M54 22 Q58 28 58 34" stroke="{h}" stroke-width="1.6" fill="none" opacity="0.5"/>'
    elif style=='messy': body=f'<path d="M34 41 Q31 27 40 26 Q38 17 48 20 Q51 11 58 20 Q65 10 70 20 Q79 14 78 25 Q88 24 85 41 Q73 31 60 33 Q46 30 34 41Z" fill="{c}"/><path d="M41 27 Q51 21 56 28 M61 23 Q70 17 76 27" stroke="{h}" stroke-width="1.45" fill="none" opacity="0.45"/>'
    elif style=='curly-top': body=''.join([f'<circle cx="{x}" cy="{y}" r="{r}" fill="{c}"/>' for x,y,r in [(39,31,7),(47,25,8),(57,22,8),(67,23,8),(77,29,8),(82,37,6),(35,38,6)]]) + f'<path d="M40 28 Q48 22 55 27 M60 25 Q68 20 76 27" stroke="{h}" stroke-width="1.3" fill="none" opacity="0.3"/>'
    elif style=='afro-short': body=f'<path d="M31 42 C24 33 30 23 39 23 C39 13 50 11 55 17 C63 9 74 15 75 22 C86 19 92 30 86 39 C92 46 86 54 79 52 L40 52 C30 55 24 48 31 42Z" fill="{c}"/><g fill="{h}" opacity="0.2"><circle cx="40" cy="29" r="3"/><circle cx="51" cy="22" r="3"/><circle cx="64" cy="21" r="3"/><circle cx="76" cy="28" r="3"/></g>'
    elif style=='bob': body=f'<path d="M34 42 Q34 21 60 19 Q86 21 86 42 Q77 33 60 31 Q43 33 34 42Z" fill="{c}"/><path d="M34 39 Q31 58 37 83 Q41 72 46 64 L43 42Z" fill="{c}"/><path d="M86 39 Q89 58 83 83 Q79 72 74 64 L77 42Z" fill="{c}"/><path d="M42 28 Q60 21 78 29" stroke="{h}" stroke-width="1.35" fill="none" opacity="0.35"/>'
    else: body=f'<path d="M35 42 Q35 21 60 19 Q85 21 85 42 Q76 33 60 31 Q44 33 35 42Z" fill="{c}"/><path d="M82 33 Q102 41 92 79 Q90 59 78 53Z" fill="{c}"/><path d="M84 38 Q96 47 91 65" stroke="{h}" stroke-width="2" fill="none" opacity="0.45"/>'
    return svg_wrap(body)

for style in HAIR_STYLES:
    for color in HAIR_COLORS:
        (ROOT/'hair'/f'{style}-{color}.svg').write_text(hair_asset(style,color))

BEARDS = ['stubble','short','goatee','moustache']
def beard_asset(style,color):
    c,h=HAIR_COLORS[color]
    if style=='stubble': body=f'<path d="M43 75 Q47 91 60 95 Q73 91 77 75 Q74 98 60 101 Q46 98 43 75Z" fill="{c}" opacity="0.15"/>'
    elif style=='short': body=f'<path d="M42 72 Q44 82 49 88 Q54 93 60 96 Q66 93 71 88 Q76 82 78 72 Q75 94 60 101 Q45 94 42 72Z" fill="{c}" opacity="0.9"/><path d="M48 78 Q60 75 72 78" stroke="{h}" stroke-width="0.8" fill="none" opacity="0.2"/>'
    elif style=='goatee': body=f'<path d="M51 88 Q60 98 69 88 Q67 103 60 106 Q53 103 51 88Z" fill="{c}"/><path d="M51 79 Q60 76 69 79" stroke="{c}" stroke-width="2.4" fill="none" stroke-linecap="round"/>'
    else: body=f'<path d="M50 79 Q55.5 76 60 79 Q64.5 76 70 79" stroke="{c}" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
    return svg_wrap(body)

for style in BEARDS:
    for color in HAIR_COLORS:
        (ROOT/'beards'/f'{style}-{color}.svg').write_text(beard_asset(style,color))

ACCESSORIES = {
 'scar':'<path d="M77 58 L72 70" stroke="#B77872" stroke-width="1.6" stroke-linecap="round" opacity="0.82"/>',
 'brow-scar':'<path d="M42 49 L45 54" stroke="#E3B8A7" stroke-width="1.7" stroke-linecap="round" opacity="0.9"/>',
 'earring':'<circle cx="86" cy="69" r="2.2" fill="none" stroke="#E3C274" stroke-width="1.25"/>',
 'headband':'<path d="M34 36 Q60 27 86 36" stroke="#EFE6D1" stroke-width="4.8" fill="none" opacity="0.9"/><path d="M34 36 Q60 29 86 36" stroke="#A94848" stroke-width="2" fill="none" opacity="0.9"/>',
 'glasses':'<g stroke="#D7DDEB" stroke-width="1.2" fill="none" opacity="0.9"><circle cx="50" cy="56" r="6"/><circle cx="70" cy="56" r="6"/><path d="M56 56 H64"/><path d="M44 56 H40"/><path d="M76 56 H80"/></g>',
}
for k,v in ACCESSORIES.items(): (ROOT/'accessories'/f'{k}.svg').write_text(svg_wrap(v))

manifest = {
  'version':'1.0',
  'canvas':[120,120],
  'bases':[{'id':i,'family':f,'gender':g,'shape':s,'file':f'bases/{i}.svg'} for i,f,g,s in BASES],
  'eyes':[{ 'id':eye,'family':fam,'file':f'eyes/{fam}/{eye}.svg'} for fam in FAMILIES for eye in EYE_IDS],
  'noses':[{'id':k,'file':f'noses/{k}.svg'} for k in NOSES],
  'mouths':[{'id':k,'file':f'mouths/{k}.svg'} for k in MOUTHS],
  'ears':[{'id':k,'file':f'ears/{k}.svg'} for k in EARS],
  'hair':[{'style':s,'color':c,'file':f'hair/{s}-{c}.svg'} for s in HAIR_STYLES for c in HAIR_COLORS],
  'beards':[{'style':s,'color':c,'file':f'beards/{s}-{c}.svg'} for s in BEARDS for c in HAIR_COLORS],
  'accessories':[{'id':k,'file':f'accessories/{k}.svg'} for k in ACCESSORIES],
}
(ROOT/'manifest.json').write_text(json.dumps(manifest,indent=2))
print('Generated', sum(1 for _ in ROOT.rglob('*.svg')), 'SVG assets')
