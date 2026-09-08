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
SIZE=(120,120)
FAMILIES=['east-asian','southeast-asian','west-african','european','south-asian','latin-american','mixed']
BASES=[
 ('ea-m-rect','east-asian','Male','ea_m'),('ea-m-oval','east-asian','Male','ea_m'),('ea-f-heart','east-asian','Female','wa_f'),('ea-f-round','east-asian','Female','wa_f'),
 ('sea-m-rect','southeast-asian','Male','ea_m'),('sea-m-oval','southeast-asian','Male','ea_m'),('sea-f-heart','southeast-asian','Female','wa_f'),('sea-f-round','southeast-asian','Female','wa_f'),
 ('wa-m-square','west-african','Male','la_m'),('wa-m-softrect','west-african','Male','la_m'),('wa-f-heart','west-african','Female','wa_f'),('wa-f-diamond','west-african','Female','wa_f'),
 ('eu-m-rect','european','Male','la_m'),('eu-m-pear','european','Male','la_m'),('eu-f-oval','european','Female','wa_f'),('eu-f-softrect','european','Female','wa_f'),
 ('sa-m-oval','south-asian','Male','la_m'),('sa-m-square','south-asian','Male','la_m'),('sa-f-heart','south-asian','Female','wa_f'),('sa-f-round','south-asian','Female','wa_f'),
 ('la-m-softrect','latin-american','Male','la_m'),('la-m-diamond','latin-american','Male','la_m'),('la-f-oval','latin-american','Female','wa_f'),('la-f-diamond','latin-american','Female','wa_f'),
 ('mx-m-rect','mixed','Male','la_m'),('mx-m-oval','mixed','Male','la_m'),('mx-f-heart','mixed','Female','wa_f'),('mx-f-softrect','mixed','Female','wa_f')]

TONES={
 'east-asian': {'porcelain-warm':('#F6E5D4','#E4C9B3'),'light-warm':('#EAD0B8','#CFA889'),'golden-light':('#D8AF89','#BA8867')},
 'southeast-asian': {'golden-tan':('#D7A978','#B77A50'),'medium-warm':('#C38A5E','#9C603D'),'deep-tan':('#A86E49','#7F4A30')},
 'west-african': {'deep':('#8C5639','#5B3424'),'dark':('#6A3F2C','#43251A'),'ebony':('#4B2A1D','#2B1710')},
 'european': {'porcelain':('#F7E7DE','#DFC2B2'),'fair':('#EFD8C8','#CCAA96'),'light-olive':('#DAB89C','#B88C70'),'olive':('#C89D79','#9C7051')},
 'south-asian': {'golden-medium':('#D1A071','#A87349'),'brown':('#B67C51','#895535'),'deep-brown':('#8F5E3D','#643C28')},
 'latin-american': {'fair-tan':('#E4C1A4','#C69876'),'tan':('#CE9D76','#A87351'),'medium-brown':('#AE7652','#7F4C34'),'deep-brown':('#8B5A3B','#613924')},
 'mixed': {'fair':('#ECD4C1','#CBA58C'),'tan':('#D3A27E','#AA7656'),'medium-brown':('#B67C56','#86543A'),'deep-brown':('#8E5A3E','#603823'),'dark':('#603A28','#351E15')}
}
HAIR_COLORS={'black':('#141419','#3E3B43'),'dark-brown':('#2A1A17','#593A30'),'brown':('#503326','#815F4B'),'light-brown':('#76573F','#B18D70'),'blonde':('#A88456','#DFC48C'),'auburn':('#653227','#A4604D')}
HAIR_STYLES=['buzz','crop','quiff','side-part','messy','curly-top','afro-short','bob','ponytail','waves','updo','braids']
BEARDS=['stubble','short','full','goatee','moustache']
EYES=['eyes-almond-soft','eyes-round-open','eyes-hooded-serious','eyes-narrow-focused','eyes-monolid-clean']
NOSES=['nose-straight','nose-narrow','nose-broad','nose-aquiline','nose-soft']
MOUTHS=['mouth-firm','mouth-neutral','mouth-full','mouth-smirk','mouth-thin']
EARS=['ears-compact','ears-medium','ears-pronounced','ears-high','ears-wide']
for sub in ['bases','noses/male','noses/female','mouths/male','mouths/female','ears','hair','beards']:
    (ROOT/sub).mkdir(parents=True,exist_ok=True)
for fam in FAMILIES:
    for g in ['male','female']:
        (ROOT/'eyes'/fam/g).mkdir(parents=True,exist_ok=True)

def blank(): return Image.new('RGBA',SIZE,(0,0,0,0))
def load(path):
    im=Image.open(path).convert('RGBA'); b=im.getbbox(); im=im.crop(b) if b else im; im.thumbnail((112,112),Image.Resampling.LANCZOS)
    c=blank(); c.alpha_composite(im,((120-im.width)//2,120-im.height)); return c
S={k:load(v) for k,v in SRC.items()}

def mask_box(box,blur=4):
    m=Image.new('L',SIZE,0); ImageDraw.Draw(m).rounded_rectangle(box,radius=7,fill=255); return m.filter(ImageFilter.GaussianBlur(blur))
def mask_ellipse(box,blur=4):
    m=Image.new('L',SIZE,0); ImageDraw.Draw(m).ellipse(box,fill=255); return m.filter(ImageFilter.GaussianBlur(blur))
def comp(*ms):
    o=Image.new('L',SIZE,0)
    for m in ms:o=ImageChops.lighter(o,m)
    return o

def colorize_skin(src,family,tone,gender):
    gray=ImageOps.grayscale(src)
    hi,lo=TONES[family][tone]
    col=ImageOps.colorize(gray,black=lo,white=hi).convert('RGBA'); col.putalpha(src.getchannel('A'))
    # reduce harshness while preserving sculpted anatomy
    col=ImageEnhance.Contrast(col).enhance(0.88)
    col=ImageEnhance.Brightness(col).enhance(1.04 if gender=='Female' else 1.01)
    if gender=='Female':
        # explicitly neutralize beard/mustache shadows in the source base
        lower=mask_box((34,64,86,105),7)
        soft=col.filter(ImageFilter.GaussianBlur(4.5)); soft=ImageEnhance.Brightness(soft).enhance(1.08)
        col=Image.composite(soft,col,lower)
    # hair source should not remain in base
    hairmask=comp(mask_box((8,0,112,48),7),mask_box((4,31,31,99),7),mask_box((89,31,116,99),7))
    a=col.getchannel('A'); a=ImageChops.subtract(a,Image.eval(hairmask,lambda p:int(p*.84))); col.putalpha(a)
    return col

def extract(src,mask):
    o=blank(); o.paste(src,(0,0),mask); return o

def darkmask(src,region,threshold=145):
    gray=src.convert('L'); a=src.getchannel('A'); m=Image.new('L',SIZE,0); gp=gray.load(); ap=a.load(); mp=m.load()
    for y in range(120):
      for x in range(120):
        if ap[x,y]>12 and gp[x,y]<threshold: mp[x,y]=255
    return ImageChops.multiply(region,m.filter(ImageFilter.GaussianBlur(1)))

def recolor(layer,color):
    if color=='black':return layer
    b,h=HAIR_COLORS[color]; g=ImageOps.grayscale(layer); c=ImageOps.colorize(g,black=b,white=h).convert('RGBA'); c.putalpha(layer.getchannel('A')); return c

# bases: every base gets every family-valid tone, creating genuinely wider complexion pool
for base_id,fam,gender,src_key in BASES:
    for tone in TONES[fam]: colorize_skin(S[src_key],fam,tone,gender).save(ROOT/'bases'/f'{base_id}-{tone}.png')

# gender-specific eyes: female always sourced from female face, male from family-appropriate male source
for fam in FAMILIES:
    male_src='ea_m' if fam in ('east-asian','southeast-asian') else 'la_m'
    for gender,src_key in [('male',male_src),('female','wa_f')]:
      src=S[src_key]
      regions={
       'eyes-almond-soft':comp(mask_box((22,27,55,48),3),mask_box((65,27,98,48),3)),
       'eyes-round-open':comp(mask_box((20,25,57,49),3),mask_box((63,25,100,49),3)),
       'eyes-hooded-serious':comp(mask_box((22,29,55,46),3),mask_box((65,29,98,46),3)),
       'eyes-narrow-focused':comp(mask_box((23,31,55,44),3),mask_box((65,31,97,44),3)),
       'eyes-monolid-clean':comp(mask_box((23,31,55,43),3),mask_box((65,31,97,43),3)),}
      for eid,m in regions.items(): extract(src,m).save(ROOT/'eyes'/fam/gender/f'{eid}.png')

for gender,src_key in [('male','la_m'),('female','wa_f')]:
    src=S[src_key]
    for nid in NOSES:
      m=mask_ellipse((45 if nid=='nose-broad' else 48,40,77 if nid=='nose-broad' else 74,81),4); extract(src,m).save(ROOT/'noses'/gender/f'{nid}.png')
    for mid in MOUTHS:
      box=(39,70,83,92) if mid in ('mouth-full','mouth-smirk') else (42,71,80,90)
      extract(src,mask_box(box,4)).save(ROOT/'mouths'/gender/f'{mid}.png')
for e in EARS: blank().save(ROOT/'ears'/f'{e}.png')

hair_regions={
 'buzz':mask_box((20,2,100,25),4),'crop':mask_box((14,0,106,38),5),'quiff':mask_box((10,0,110,44),5),'side-part':mask_box((12,0,108,42),5),'messy':mask_box((7,0,113,50),6),'curly-top':mask_box((8,0,112,48),6),'afro-short':mask_box((5,0,115,52),7),
 'bob':comp(mask_box((10,0,110,44),5),mask_box((4,31,32,96),6),mask_box((88,31,116,96),6)),
 'ponytail':comp(mask_box((12,0,108,40),5),mask_box((90,31,116,99),6)),
 'waves':comp(mask_box((9,0,111,44),5),mask_box((4,32,31,90),6),mask_box((89,32,116,90),6)),
 'updo':comp(mask_box((20,0,100,33),5),mask_box((42,0,78,20),4)),
 'braids':comp(mask_box((10,0,110,44),5),mask_box((5,31,30,103),5),mask_box((90,31,115,103),5))}
hair_src={'afro-short':'wa_f','bob':'wa_f','ponytail':'wa_f','waves':'wa_f','updo':'wa_f','braids':'wa_f','side-part':'la_m','quiff':'la_m'}
for style in HAIR_STYLES:
    src=S[hair_src.get(style,'ea_m')]; layer=extract(src,darkmask(src,hair_regions[style],155))
    for color in HAIR_COLORS: recolor(layer,color).save(ROOT/'hair'/f'{style}-{color}.png')

# male beard only; rendering also has a gender guard
src=S['la_m']
beard_regions={'stubble':mask_box((38,64,83,102),5),'short':mask_box((37,63,84,104),5),'full':mask_box((34,60,87,108),6),'goatee':comp(mask_box((40,69,81,81),4),mask_box((48,83,73,105),4)),'moustache':mask_box((40,69,81,81),4)}
for style in BEARDS:
    layer=extract(src,darkmask(src,beard_regions[style],145));
    if style=='stubble': layer.putalpha(Image.eval(layer.getchannel('A'),lambda p:int(p*.38)))
    for color in HAIR_COLORS: recolor(layer,color).save(ROOT/'beards'/f'{style}-{color}.png')

manifest={'version':'3.0-gender-and-tone-assets','canvas':[120,120],'families':FAMILIES,'bases':[{'id':i,'family':f,'gender':g,'tones':list(TONES[f].keys())} for i,f,g,_ in BASES],'eyes':EYES,'noses':NOSES,'mouths':MOUTHS,'hairStyles':HAIR_STYLES,'hairColors':list(HAIR_COLORS.keys()),'beards':BEARDS}
(ROOT/'manifest.json').write_text(json.dumps(manifest,indent=2))
print('generated',sum(1 for _ in ROOT.rglob('*.png')),'png assets')
