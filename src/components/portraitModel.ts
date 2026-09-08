import type { CompetitivePersonality, Fighter, Rarity, SocialPersonality } from '../types'

export type AppearanceFamily = 'east-asian' | 'southeast-asian' | 'west-african' | 'european' | 'south-asian' | 'latin-american' | 'mixed'
export type FaceShape = 'oval' | 'square' | 'long' | 'round' | 'heart' | 'angular' | 'diamond' | 'rectangular' | 'soft-heart' | 'pear' | 'broad-rect' | 'soft-rect'
export type EyeShape = 'almond' | 'round' | 'hooded' | 'narrow' | 'monolid'
export type NoseShape = 'straight' | 'narrow' | 'broad' | 'aquiline' | 'soft'
export type MouthShape = 'firm' | 'neutral' | 'full' | 'smirk' | 'thin'
export type BrowShape = 'straight' | 'arched' | 'heavy' | 'sharp'
export type HairTexture = 'straight' | 'wavy' | 'curly' | 'coily'
export type HairStyle = 'shaved' | 'buzz' | 'crop' | 'quiff' | 'side-part' | 'messy' | 'curly-top' | 'afro-short' | 'braids' | 'locs' | 'bun' | 'ponytail' | 'bob' | 'pixie' | 'waves' | 'updo' | 'long'
export type HairColorName = 'black' | 'dark-brown' | 'brown' | 'light-brown' | 'blonde' | 'auburn'
export type BeardStyle = 'none' | 'stubble' | 'short' | 'full' | 'goatee' | 'moustache'
export type Accessory = 'none' | 'scar' | 'brow-scar' | 'earring' | 'headband' | 'glasses' | 'tattoo'
export type ExpressionPreset = 'stoic' | 'focused' | 'calm' | 'proud' | 'sly' | 'friendly' | 'intense'

export interface PortraitProfile {
  family: AppearanceFamily
  gender: Fighter['gender']
  faceShape: FaceShape
  eyeShape: EyeShape
  noseShape: NoseShape
  mouthShape: MouthShape
  browShape: BrowShape
  hairTexture: HairTexture
  hairStyle: HairStyle
  hairColorName: HairColorName
  beardStyle: BeardStyle
  accessory: Accessory
  expression: ExpressionPreset
  baseId: string
  skinToneId: string
  eyeSetId: string
  noseSetId: string
  mouthSetId: string
  earSetId: string
  skin: string
  skinShadow: string
  skinHighlight: string
  hair: string
  hairHighlight: string
  eyes: string
  headWidth: number
  headHeight: number
  templeWidth: number
  cheekWidth: number
  jawWidth: number
  chinLength: number
  earSize: number
  neckWidth: number
  shoulderWidth: number
  eyeGap: number
  eyeWidth: number
  eyeHeight: number
  eyeY: number
  eyeTilt: number
  eyeInset: number
  eyeOpenness: number
  browTilt: number
  browY: number
  browWeight: number
  browArchBias: number
  noseWidth: number
  noseLength: number
  noseBridge: number
  noseX: number
  mouthWidth: number
  mouthCurve: number
  mouthY: number
  mouthTilt: number
  lipFullness: number
  smileLift: number
  hairlineY: number
  hairVolume: number
  fringeDepth: number
  widowsPeak: number
  partShift: number
  asymmetry: number
  faceSoftness: number
  leftEyeScale: number
  rightEyeScale: number
  lashStrength: number
  ageLines: number
  grayAmount: number
  expressionIntensity: number
  rarityAccent: string
  rarityGlow: string
  clothing: string
  brandAccent: string
}

interface SkinPalette {
  base: string
  shadow: string
  highlight: string
}

interface HairPalette {
  base: string
  highlight: string
}

interface BaseHead {
  id: string
  family: AppearanceFamily
  gender: Fighter['gender']
  faceShape: FaceShape
  headWidth: [number, number]
  headHeight: [number, number]
  templeWidth: [number, number]
  cheekWidth: [number, number]
  jawWidth: [number, number]
  chinLength: [number, number]
  neckWidth: [number, number]
  shoulderWidth: [number, number]
  eyeY: [number, number]
  eyeGap: [number, number]
  mouthY: [number, number]
  hairlineY: [number, number]
  faceSoftness: [number, number]
}

interface EyeSet {
  id: string
  shape: EyeShape
  width: [number, number]
  height: [number, number]
  tilt: [number, number]
  browY: [number, number]
  browWeightMale: [number, number]
  browWeightFemale: [number, number]
  openness: [number, number]
}

interface NoseSet {
  id: string
  shape: NoseShape
  width: [number, number]
  length: [number, number]
  bridge: [number, number]
  x: [number, number]
}

interface MouthSet {
  id: string
  shape: MouthShape
  width: [number, number]
  curve: [number, number]
  tilt: [number, number]
  fullnessMale: [number, number]
  fullnessFemale: [number, number]
}

interface EarSet {
  id: string
  size: [number, number]
}

const SKIN_FAMILIES: Record<AppearanceFamily, SkinPalette[]> = {
  'east-asian': [
    { base: '#F1D8C7', shadow: '#CDA48C', highlight: '#FAEADF' },
    { base: '#E4C1A5', shadow: '#BC8D73', highlight: '#F2D4BE' },
    { base: '#D39F7C', shadow: '#A56F52', highlight: '#E8BC9B' },
  ],
  'southeast-asian': [
    { base: '#E0B890', shadow: '#B98560', highlight: '#F0C9A4' },
    { base: '#C99870', shadow: '#986845', highlight: '#E1B087' },
    { base: '#B57F59', shadow: '#855438', highlight: '#CE9870' },
  ],
  'west-african': [
    { base: '#A86646', shadow: '#75412D', highlight: '#C5815E' },
    { base: '#875035', shadow: '#57301F', highlight: '#A96B4B' },
    { base: '#6D3F2B', shadow: '#43251A', highlight: '#8C563D' },
    { base: '#563122', shadow: '#321C14', highlight: '#744630' },
  ],
  european: [
    { base: '#F3D8C6', shadow: '#CAA18A', highlight: '#FCEBE0' },
    { base: '#EAC3A9', shadow: '#C28F74', highlight: '#F6D7C1' },
    { base: '#D8AA89', shadow: '#A8775D', highlight: '#EBBF9D' },
  ],
  'south-asian': [
    { base: '#D6A17E', shadow: '#A66F52', highlight: '#E8BA98' },
    { base: '#C1845F', shadow: '#8E593F', highlight: '#D9A17C' },
    { base: '#A86646', shadow: '#75412D', highlight: '#C5815E' },
  ],
  'latin-american': [
    { base: '#E6BEA1', shadow: '#BB896C', highlight: '#F2D2BC' },
    { base: '#D6A17E', shadow: '#A66F52', highlight: '#E8BA98' },
    { base: '#C1845F', shadow: '#8E593F', highlight: '#D9A17C' },
    { base: '#A86646', shadow: '#75412D', highlight: '#C5815E' },
  ],
  mixed: [
    { base: '#F2D5C3', shadow: '#C99F88', highlight: '#FBE7DB' },
    { base: '#E6BEA1', shadow: '#BB896C', highlight: '#F2D2BC' },
    { base: '#D6A17E', shadow: '#A66F52', highlight: '#E8BA98' },
    { base: '#A86646', shadow: '#75412D', highlight: '#C5815E' },
    { base: '#6D3F2B', shadow: '#43251A', highlight: '#8C563D' },
  ],
}

const HAIR_PALETTES: Record<HairColorName, HairPalette> = {
  black: { base: '#141419', highlight: '#43414A' },
  'dark-brown': { base: '#2B1C18', highlight: '#5B3D33' },
  brown: { base: '#55382B', highlight: '#856355' },
  'light-brown': { base: '#7A5A42', highlight: '#B38D72' },
  blonde: { base: '#AB8757', highlight: '#E0C58E' },
  auburn: { base: '#66352A', highlight: '#A76553' },
}

const EYE_COLORS = ['#2D2521', '#4A3527', '#6A523E', '#314C59', '#48603B']

const RARITY: Record<Rarity, { accent: string; glow: string }> = {
  Common: { accent: '#7C8595', glow: '#222833' },
  Uncommon: { accent: '#58B97A', glow: '#153225' },
  Rare: { accent: '#5AA2E8', glow: '#142B45' },
  Epic: { accent: '#9871E8', glow: '#2C1D49' },
  Legend: { accent: '#E2B354', glow: '#493316' },
  Generational: { accent: '#D95050', glow: '#491A1D' },
}

const KNOWN_FAMILY_OVERRIDES: Record<string, AppearanceFamily> = {
  'jon jones': 'west-african',
  'demetrious johnson': 'west-african',
  'kamaru usman': 'west-african',
  'francis ngannou': 'west-african',
  'israel adesanya': 'west-african',
  'conor mcgregor': 'european',
  'stipe miocic': 'european',
  'joanna jędrzejczyk': 'european',
  'valentina shevchenko': 'mixed',
  'khabib nurmagomedov': 'mixed',
  'islam makhachev': 'mixed',
  'petr yan': 'european',
  'alexander volkanovski': 'european',
  'amanda nunes': 'latin-american',
  'anderson silva': 'latin-american',
  'josé aldo': 'latin-american',
  'alex pereira': 'latin-american',
  'charles oliveira': 'latin-american',
  'brandon moreno': 'latin-american',
  'zhang weili': 'east-asian',
}

const KNOWN_TONE_OVERRIDES: Record<string, string> = {
  'jon jones': 'dark',
  'demetrious johnson': 'deep',
  'kamaru usman': 'dark',
  'francis ngannou': 'ebony',
  'israel adesanya': 'deep',
  'conor mcgregor': 'porcelain',
  'joanna jędrzejczyk': 'porcelain',
  'stipe miocic': 'fair',
  'amanda nunes': 'tan',
  'anderson silva': 'medium-brown',
  'josé aldo': 'tan',
  'alex pereira': 'medium-brown',
  'zhang weili': 'light-warm',
}

const COUNTRY_FAMILY: Record<string, Array<[AppearanceFamily, number]>> = {
  Japan: [['east-asian', 98], ['mixed', 2]],
  China: [['east-asian', 96], ['mixed', 4]],
  'South Korea': [['east-asian', 96], ['mixed', 4]],
  Thailand: [['southeast-asian', 92], ['east-asian', 4], ['mixed', 4]],
  Philippines: [['southeast-asian', 90], ['mixed', 10]],
  Singapore: [['southeast-asian', 54], ['east-asian', 18], ['south-asian', 16], ['mixed', 12]],
  Nigeria: [['west-african', 95], ['mixed', 5]],
  Ghana: [['west-african', 95], ['mixed', 5]],
  Cameroon: [['west-african', 92], ['mixed', 8]],
  'South Africa': [['west-african', 70], ['european', 10], ['mixed', 20]],
  Ireland: [['european', 94], ['mixed', 6]],
  'United Kingdom': [['european', 76], ['west-african', 7], ['south-asian', 6], ['mixed', 11]],
  France: [['european', 70], ['west-african', 8], ['mixed', 22]],
  Italy: [['european', 94], ['mixed', 6]],
  Germany: [['european', 94], ['mixed', 6]],
  Spain: [['european', 86], ['latin-american', 4], ['mixed', 10]],
  Poland: [['european', 95], ['mixed', 5]],
  Ukraine: [['european', 95], ['mixed', 5]],
  Russia: [['european', 78], ['east-asian', 5], ['mixed', 17]],
  Georgia: [['european', 56], ['mixed', 44]],
  India: [['south-asian', 97], ['mixed', 3]],
  Pakistan: [['south-asian', 94], ['mixed', 6]],
  Mexico: [['latin-american', 94], ['mixed', 6]],
  Brazil: [['latin-american', 58], ['west-african', 12], ['european', 10], ['mixed', 20]],
  Argentina: [['latin-american', 72], ['european', 18], ['mixed', 10]],
  Chile: [['latin-american', 88], ['mixed', 12]],
  Colombia: [['latin-american', 82], ['west-african', 6], ['mixed', 12]],
  'Puerto Rico': [['latin-american', 72], ['west-african', 8], ['mixed', 20]],
  'Dominican Republic': [['latin-american', 58], ['west-african', 24], ['mixed', 18]],
  Canada: [['european', 56], ['mixed', 44]],
  Australia: [['european', 70], ['mixed', 30]],
  'New Zealand': [['european', 52], ['mixed', 48]],
  Samoa: [['mixed', 100]],
  'United States': [['european', 35], ['west-african', 18], ['latin-american', 13], ['east-asian', 5], ['south-asian', 4], ['mixed', 25]],
}

const BASE_HEADS: BaseHead[] = [
  { id: 'ea-m-rect', family: 'east-asian', gender: 'Male', faceShape: 'rectangular', headWidth: [39, 44], headHeight: [57, 61], templeWidth: [30, 34], cheekWidth: [37, 42], jawWidth: [28, 33], chinLength: [8, 11], neckWidth: [15, 18], shoulderWidth: [70, 82], eyeY: [55, 58], eyeGap: [18, 20.5], mouthY: [85, 88], hairlineY: [22, 26], faceSoftness: [0.22, 0.38] },
  { id: 'ea-m-oval', family: 'east-asian', gender: 'Male', faceShape: 'oval', headWidth: [38, 43], headHeight: [56, 60], templeWidth: [30, 34], cheekWidth: [38, 43], jawWidth: [27, 31], chinLength: [7, 10], neckWidth: [14, 17], shoulderWidth: [69, 80], eyeY: [54, 57], eyeGap: [18, 20], mouthY: [84, 87], hairlineY: [21.5, 25], faceSoftness: [0.32, 0.52] },
  { id: 'ea-f-heart', family: 'east-asian', gender: 'Female', faceShape: 'heart', headWidth: [36, 40], headHeight: [53, 57], templeWidth: [30, 34], cheekWidth: [37, 41], jawWidth: [22, 27], chinLength: [6.5, 8.5], neckWidth: [10.5, 13], shoulderWidth: [58, 68], eyeY: [54, 57], eyeGap: [17, 19], mouthY: [83.5, 86.5], hairlineY: [20, 24], faceSoftness: [0.68, 0.92] },
  { id: 'ea-f-round', family: 'east-asian', gender: 'Female', faceShape: 'round', headWidth: [36, 41], headHeight: [52.5, 56.5], templeWidth: [29, 34], cheekWidth: [38, 42], jawWidth: [23, 27], chinLength: [6, 8], neckWidth: [10.5, 13], shoulderWidth: [57, 67], eyeY: [54, 57], eyeGap: [17, 19], mouthY: [83.5, 86], hairlineY: [20, 24], faceSoftness: [0.76, 0.96] },

  { id: 'sea-m-rect', family: 'southeast-asian', gender: 'Male', faceShape: 'rectangular', headWidth: [39, 44], headHeight: [56, 60], templeWidth: [30, 34], cheekWidth: [38, 43], jawWidth: [28, 33], chinLength: [7, 10], neckWidth: [15, 18], shoulderWidth: [69, 81], eyeY: [54, 57], eyeGap: [18, 20], mouthY: [84, 87], hairlineY: [21, 25], faceSoftness: [0.3, 0.5] },
  { id: 'sea-m-oval', family: 'southeast-asian', gender: 'Male', faceShape: 'oval', headWidth: [38, 43], headHeight: [55, 59], templeWidth: [29, 33], cheekWidth: [38, 43], jawWidth: [27, 31], chinLength: [7, 9.5], neckWidth: [14.5, 17.5], shoulderWidth: [68, 80], eyeY: [54, 57], eyeGap: [18, 20], mouthY: [84, 87], hairlineY: [21, 25], faceSoftness: [0.38, 0.58] },
  { id: 'sea-f-heart', family: 'southeast-asian', gender: 'Female', faceShape: 'heart', headWidth: [35, 40], headHeight: [52, 56], templeWidth: [29, 33], cheekWidth: [37, 41], jawWidth: [22, 26], chinLength: [6, 8], neckWidth: [10, 12.5], shoulderWidth: [55, 65], eyeY: [53.5, 56.5], eyeGap: [17, 19], mouthY: [83, 86], hairlineY: [20, 24], faceSoftness: [0.76, 0.97] },
  { id: 'sea-f-round', family: 'southeast-asian', gender: 'Female', faceShape: 'round', headWidth: [35, 40], headHeight: [52, 56], templeWidth: [29, 33], cheekWidth: [38, 42], jawWidth: [22.5, 26.5], chinLength: [5.5, 7.5], neckWidth: [10, 12.5], shoulderWidth: [55, 65], eyeY: [53.5, 56.5], eyeGap: [17, 19], mouthY: [83, 86], hairlineY: [20, 24], faceSoftness: [0.8, 0.98] },

  { id: 'wa-m-square', family: 'west-african', gender: 'Male', faceShape: 'square', headWidth: [40, 46], headHeight: [56, 60], templeWidth: [31, 35], cheekWidth: [39, 45], jawWidth: [30, 36], chinLength: [7, 10], neckWidth: [16, 20], shoulderWidth: [72, 84], eyeY: [54, 57], eyeGap: [18, 21], mouthY: [84.5, 87.5], hairlineY: [21, 25], faceSoftness: [0.2, 0.36] },
  { id: 'wa-m-softrect', family: 'west-african', gender: 'Male', faceShape: 'soft-rect', headWidth: [39, 45], headHeight: [56, 60], templeWidth: [30, 34], cheekWidth: [40, 46], jawWidth: [29, 34], chinLength: [7.5, 10.5], neckWidth: [16, 20], shoulderWidth: [71, 83], eyeY: [54, 57], eyeGap: [18, 21], mouthY: [84.5, 87.5], hairlineY: [21, 25], faceSoftness: [0.34, 0.52] },
  { id: 'wa-f-heart', family: 'west-african', gender: 'Female', faceShape: 'heart', headWidth: [36, 41], headHeight: [53, 57], templeWidth: [29, 33], cheekWidth: [38, 43], jawWidth: [23, 28], chinLength: [6.5, 8.5], neckWidth: [10.5, 13.5], shoulderWidth: [57, 69], eyeY: [54, 57], eyeGap: [17, 19.5], mouthY: [83.5, 86], hairlineY: [20.5, 24.5], faceSoftness: [0.74, 0.96] },
  { id: 'wa-f-diamond', family: 'west-african', gender: 'Female', faceShape: 'diamond', headWidth: [36, 40.5], headHeight: [53, 57], templeWidth: [28.5, 32.5], cheekWidth: [39, 43], jawWidth: [23, 27], chinLength: [6, 8], neckWidth: [10.5, 13.5], shoulderWidth: [57, 69], eyeY: [54, 57], eyeGap: [17, 19.5], mouthY: [83.5, 86.5], hairlineY: [20, 24.5], faceSoftness: [0.7, 0.94] },

  { id: 'eu-m-rect', family: 'european', gender: 'Male', faceShape: 'rectangular', headWidth: [39, 45], headHeight: [56, 61], templeWidth: [30, 35], cheekWidth: [38, 44], jawWidth: [29, 35], chinLength: [8, 11], neckWidth: [15, 18.5], shoulderWidth: [70, 83], eyeY: [54.5, 58], eyeGap: [18, 21], mouthY: [84.5, 87.5], hairlineY: [21.5, 26], faceSoftness: [0.22, 0.45] },
  { id: 'eu-m-pear', family: 'european', gender: 'Male', faceShape: 'pear', headWidth: [38.5, 43], headHeight: [56, 60], templeWidth: [28, 32], cheekWidth: [37, 42], jawWidth: [30, 35], chinLength: [8, 10.5], neckWidth: [15, 18], shoulderWidth: [70, 82], eyeY: [54.5, 58], eyeGap: [18, 20.5], mouthY: [84.5, 87.5], hairlineY: [22, 26], faceSoftness: [0.24, 0.44] },
  { id: 'eu-f-oval', family: 'european', gender: 'Female', faceShape: 'oval', headWidth: [35.5, 40.5], headHeight: [53, 57], templeWidth: [29, 34], cheekWidth: [37, 42], jawWidth: [22, 27], chinLength: [6, 8], neckWidth: [10, 13], shoulderWidth: [56, 68], eyeY: [54, 57.5], eyeGap: [17, 19.5], mouthY: [83.5, 86.5], hairlineY: [20, 24.5], faceSoftness: [0.72, 0.96] },
  { id: 'eu-f-softrect', family: 'european', gender: 'Female', faceShape: 'soft-rect', headWidth: [35.5, 40.5], headHeight: [53, 57], templeWidth: [28.5, 33], cheekWidth: [36.5, 41], jawWidth: [23, 28], chinLength: [6.5, 8.5], neckWidth: [10, 13], shoulderWidth: [56, 68], eyeY: [54, 57.5], eyeGap: [17, 19.5], mouthY: [83.5, 86.5], hairlineY: [20.5, 24.5], faceSoftness: [0.62, 0.86] },

  { id: 'sa-m-oval', family: 'south-asian', gender: 'Male', faceShape: 'oval', headWidth: [39, 44], headHeight: [56, 60], templeWidth: [29.5, 34], cheekWidth: [38.5, 43], jawWidth: [28, 33], chinLength: [8, 10.5], neckWidth: [15, 18], shoulderWidth: [69, 82], eyeY: [54.5, 57.5], eyeGap: [18, 20.5], mouthY: [84.5, 87.5], hairlineY: [21.5, 25.5], faceSoftness: [0.3, 0.48] },
  { id: 'sa-m-square', family: 'south-asian', gender: 'Male', faceShape: 'square', headWidth: [39, 45], headHeight: [56, 60], templeWidth: [30, 35], cheekWidth: [39, 44], jawWidth: [29, 35], chinLength: [8, 10.5], neckWidth: [15, 18.5], shoulderWidth: [70, 82], eyeY: [54.5, 57.5], eyeGap: [18, 20.5], mouthY: [84.5, 87.5], hairlineY: [21.5, 25.5], faceSoftness: [0.2, 0.38] },
  { id: 'sa-f-heart', family: 'south-asian', gender: 'Female', faceShape: 'heart', headWidth: [36, 41], headHeight: [53, 57], templeWidth: [29, 33], cheekWidth: [37.5, 42], jawWidth: [22.5, 27], chinLength: [6, 8], neckWidth: [10.5, 13], shoulderWidth: [57, 69], eyeY: [54, 57], eyeGap: [17, 19.5], mouthY: [83.5, 86.5], hairlineY: [20.5, 24.5], faceSoftness: [0.72, 0.94] },
  { id: 'sa-f-round', family: 'south-asian', gender: 'Female', faceShape: 'round', headWidth: [36, 41], headHeight: [53, 57], templeWidth: [29, 33], cheekWidth: [38, 42.5], jawWidth: [23, 27], chinLength: [6, 8], neckWidth: [10.5, 13], shoulderWidth: [57, 69], eyeY: [54, 57], eyeGap: [17, 19.5], mouthY: [83.5, 86.5], hairlineY: [20, 24], faceSoftness: [0.76, 0.98] },

  { id: 'la-m-softrect', family: 'latin-american', gender: 'Male', faceShape: 'soft-rect', headWidth: [39, 45], headHeight: [56, 60], templeWidth: [29.5, 34], cheekWidth: [39, 44], jawWidth: [28.5, 34], chinLength: [7.5, 10.5], neckWidth: [15, 18.5], shoulderWidth: [70, 82], eyeY: [54.5, 57.5], eyeGap: [18, 20.5], mouthY: [84.5, 87.5], hairlineY: [21.5, 25.5], faceSoftness: [0.28, 0.48] },
  { id: 'la-m-diamond', family: 'latin-american', gender: 'Male', faceShape: 'diamond', headWidth: [38.5, 43.5], headHeight: [56, 60], templeWidth: [28.5, 32.5], cheekWidth: [39.5, 44.5], jawWidth: [27, 31], chinLength: [7, 10], neckWidth: [14.5, 18], shoulderWidth: [69, 81], eyeY: [54.5, 57.5], eyeGap: [18, 20.5], mouthY: [84.5, 87], hairlineY: [21.5, 25.5], faceSoftness: [0.34, 0.54] },
  { id: 'la-f-oval', family: 'latin-american', gender: 'Female', faceShape: 'oval', headWidth: [35.5, 40.5], headHeight: [53, 57], templeWidth: [29, 33.5], cheekWidth: [37, 42], jawWidth: [22.5, 27.5], chinLength: [6, 8.5], neckWidth: [10.5, 13], shoulderWidth: [56, 68], eyeY: [54, 57], eyeGap: [17, 19.5], mouthY: [83.5, 86.5], hairlineY: [20.5, 24.5], faceSoftness: [0.72, 0.94] },
  { id: 'la-f-diamond', family: 'latin-american', gender: 'Female', faceShape: 'diamond', headWidth: [35.5, 40.5], headHeight: [53, 57], templeWidth: [28.5, 32.5], cheekWidth: [38, 42.5], jawWidth: [22.5, 27.5], chinLength: [6, 8], neckWidth: [10.5, 13], shoulderWidth: [56, 68], eyeY: [54, 57], eyeGap: [17, 19.5], mouthY: [83.5, 86.5], hairlineY: [20.5, 24.5], faceSoftness: [0.68, 0.92] },

  { id: 'mx-m-rect', family: 'mixed', gender: 'Male', faceShape: 'rectangular', headWidth: [39, 45], headHeight: [56, 60], templeWidth: [29, 34], cheekWidth: [38, 44], jawWidth: [28, 35], chinLength: [7.5, 10.5], neckWidth: [15, 18.5], shoulderWidth: [70, 82], eyeY: [54.5, 58], eyeGap: [18, 21], mouthY: [84.5, 87.5], hairlineY: [21.5, 25.5], faceSoftness: [0.24, 0.5] },
  { id: 'mx-m-oval', family: 'mixed', gender: 'Male', faceShape: 'oval', headWidth: [38.5, 44], headHeight: [56, 60], templeWidth: [29, 34], cheekWidth: [38.5, 44], jawWidth: [27, 33], chinLength: [7.5, 10.5], neckWidth: [14.5, 18], shoulderWidth: [69, 81], eyeY: [54.5, 58], eyeGap: [18, 21], mouthY: [84.5, 87.5], hairlineY: [21, 25.5], faceSoftness: [0.32, 0.54] },
  { id: 'mx-f-heart', family: 'mixed', gender: 'Female', faceShape: 'heart', headWidth: [36, 41], headHeight: [53, 57], templeWidth: [29, 33], cheekWidth: [37.5, 42], jawWidth: [22.5, 27.5], chinLength: [6, 8.5], neckWidth: [10.5, 13], shoulderWidth: [56, 68], eyeY: [54, 57], eyeGap: [17, 19.5], mouthY: [83.5, 86.5], hairlineY: [20.5, 24.5], faceSoftness: [0.72, 0.94] },
  { id: 'mx-f-softrect', family: 'mixed', gender: 'Female', faceShape: 'soft-rect', headWidth: [35.5, 40.5], headHeight: [53, 57], templeWidth: [28.5, 33], cheekWidth: [36.5, 41.5], jawWidth: [23, 28], chinLength: [6.5, 8.5], neckWidth: [10.5, 13], shoulderWidth: [56, 68], eyeY: [54, 57], eyeGap: [17, 19.5], mouthY: [83.5, 86.5], hairlineY: [20.5, 24.5], faceSoftness: [0.64, 0.88] },
]

const EYE_SETS: EyeSet[] = [
  { id: 'eyes-almond-soft', shape: 'almond', width: [8.2, 10.4], height: [2.1, 3.2], tilt: [-0.6, 0.8], browY: [47.8, 50.8], browWeightMale: [2.2, 3.1], browWeightFemale: [1.3, 2.1], openness: [0.96, 1.08] },
  { id: 'eyes-round-open', shape: 'round', width: [8.2, 10.2], height: [3.1, 4.2], tilt: [-0.3, 0.5], browY: [48, 50.7], browWeightMale: [2.1, 3], browWeightFemale: [1.2, 2.0], openness: [1.02, 1.14] },
  { id: 'eyes-hooded-serious', shape: 'hooded', width: [8.1, 9.8], height: [2.0, 2.9], tilt: [-0.8, 0.6], browY: [47.4, 50.2], browWeightMale: [2.4, 3.3], browWeightFemale: [1.4, 2.1], openness: [0.9, 1.02] },
  { id: 'eyes-narrow-focused', shape: 'narrow', width: [8.2, 10.0], height: [1.5, 2.3], tilt: [-1.0, 0.5], browY: [47.6, 50.6], browWeightMale: [2.4, 3.2], browWeightFemale: [1.3, 2.1], openness: [0.88, 0.99] },
  { id: 'eyes-monolid-clean', shape: 'monolid', width: [8.1, 10.0], height: [1.6, 2.4], tilt: [-0.4, 0.9], browY: [48.1, 50.9], browWeightMale: [2.1, 3], browWeightFemale: [1.2, 2.0], openness: [0.94, 1.04] },
  { id: 'eyes-soft-female', shape: 'almond', width: [8.2, 10.0], height: [2.4, 3.5], tilt: [-0.2, 0.7], browY: [48.4, 51.0], browWeightMale: [1.8, 2.6], browWeightFemale: [1.0, 1.7], openness: [1.02, 1.12] },
  { id: 'eyes-round-female', shape: 'round', width: [8.4, 10.4], height: [3.3, 4.5], tilt: [-0.2, 0.5], browY: [48.5, 51.1], browWeightMale: [1.7, 2.5], browWeightFemale: [0.9, 1.6], openness: [1.05, 1.16] },
  { id: 'eyes-hooded-female', shape: 'hooded', width: [8.1, 9.9], height: [2.3, 3.1], tilt: [-0.5, 0.6], browY: [48.2, 50.8], browWeightMale: [1.8, 2.5], browWeightFemale: [1.0, 1.7], openness: [0.98, 1.08] },
]

const NOSE_SETS: NoseSet[] = [
  { id: 'nose-straight', shape: 'straight', width: [6.3, 8.4], length: [11.5, 14.2], bridge: [0.2, 0.9], x: [-1.0, 1.0] },
  { id: 'nose-narrow', shape: 'narrow', width: [5.0, 6.7], length: [11.0, 14.0], bridge: [0.25, 1.0], x: [-1.0, 1.0] },
  { id: 'nose-broad', shape: 'broad', width: [8.4, 10.8], length: [11.2, 14.0], bridge: [0.1, 0.8], x: [-0.9, 0.9] },
  { id: 'nose-aquiline', shape: 'aquiline', width: [6.8, 8.8], length: [13.0, 16.0], bridge: [0.75, 1.5], x: [-1.1, 1.1] },
  { id: 'nose-soft', shape: 'soft', width: [6.0, 8.0], length: [11.0, 13.5], bridge: [0.1, 0.6], x: [-1.0, 1.0] },
]

const MOUTH_SETS: MouthSet[] = [
  { id: 'mouth-firm', shape: 'firm', width: [18.0, 23.5], curve: [-0.9, -0.15], tilt: [-0.4, 0.4], fullnessMale: [0.82, 1.02], fullnessFemale: [0.92, 1.12] },
  { id: 'mouth-neutral', shape: 'neutral', width: [17.5, 23.0], curve: [-0.1, 0.45], tilt: [-0.4, 0.4], fullnessMale: [0.84, 1.04], fullnessFemale: [0.96, 1.2] },
  { id: 'mouth-full', shape: 'full', width: [17.5, 22.8], curve: [0.2, 0.9], tilt: [-0.4, 0.45], fullnessMale: [0.96, 1.18], fullnessFemale: [1.1, 1.38] },
  { id: 'mouth-smirk', shape: 'smirk', width: [18.0, 23.0], curve: [0.65, 1.3], tilt: [-0.5, 0.5], fullnessMale: [0.82, 1.04], fullnessFemale: [0.96, 1.2] },
  { id: 'mouth-thin', shape: 'thin', width: [17.8, 23.5], curve: [-0.15, 0.25], tilt: [-0.4, 0.4], fullnessMale: [0.68, 0.86], fullnessFemale: [0.74, 0.94] },
  { id: 'mouth-soft-female', shape: 'neutral', width: [18.2, 23.5], curve: [0.12, 0.55], tilt: [-0.25, 0.25], fullnessMale: [0.9, 1.05], fullnessFemale: [1.06, 1.28] },
  { id: 'mouth-full-female', shape: 'full', width: [18.0, 23.8], curve: [0.25, 0.85], tilt: [-0.2, 0.25], fullnessMale: [1.0, 1.12], fullnessFemale: [1.2, 1.45] },
  { id: 'mouth-smirk-female', shape: 'smirk', width: [18.2, 23.4], curve: [0.55, 1.1], tilt: [-0.3, 0.35], fullnessMale: [0.9, 1.08], fullnessFemale: [1.02, 1.24] },
]

const EAR_SETS: EarSet[] = [
  { id: 'ears-compact', size: [0.88, 0.98] },
  { id: 'ears-medium', size: [0.96, 1.08] },
  { id: 'ears-pronounced', size: [1.06, 1.18] },
  { id: 'ears-high', size: [0.92, 1.04] },
  { id: 'ears-wide', size: [1.0, 1.14] },
]

function hash(value: string): number {
  let result = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    result ^= value.charCodeAt(i)
    result = Math.imul(result, 16777619)
  }
  return result >>> 0
}

function rand(seed: string, label: string): number {
  return hash(`${seed}|${label}`) / 4294967295
}

function between(seed: string, label: string, min: number, max: number): number {
  return min + rand(seed, label) * (max - min)
}

function pick<T>(seed: string, label: string, values: readonly T[]): T {
  return values[Math.min(values.length - 1, Math.floor(rand(seed, label) * values.length))]
}

function weightedPick<T>(seed: string, label: string, values: Array<[T, number]>): T {
  const total = values.reduce((sum, [, weight]) => sum + weight, 0)
  let cursor = rand(seed, label) * total
  for (const [value, weight] of values) {
    cursor -= weight
    if (cursor <= 0) return value
  }
  return values[values.length - 1][0]
}

function weightedPool<T extends { id: string }>(seed: string, label: string, pool: T[], weights: Record<string, number>): T {
  return weightedPick(seed, label, pool.map((item) => [item, weights[item.id] ?? 1]))
}

function countryParts(nationality: string): string[] {
  return nationality.split('/').map((part) => part.trim()).filter(Boolean)
}

function resolveFamily(seed: string, nationality: string): AppearanceFamily {
  const parts = countryParts(nationality)
  const combined = new Map<AppearanceFamily, number>()
  for (const part of parts) {
    const dist = COUNTRY_FAMILY[part] ?? [['mixed', 100] as [AppearanceFamily, number]]
    for (const [family, weight] of dist) {
      combined.set(family, (combined.get(family) ?? 0) + weight / parts.length)
    }
  }
  return weightedPick(seed, 'family', [...combined.entries()])
}

function selectBase(seed: string, family: AppearanceFamily, gender: Fighter['gender']): BaseHead {
  const candidates = BASE_HEADS.filter((entry) => entry.family === family && entry.gender === gender)
  if (candidates.length) {
    const female = gender === 'Female'
    const weights: Record<string, number> = {}
    for (const candidate of candidates) {
      let weight = 1
      if (candidate.faceShape === 'oval' || candidate.faceShape === 'heart' || candidate.faceShape === 'round') weight += female ? 2.2 : 0.5
      if (candidate.faceShape === 'soft-rect' || candidate.faceShape === 'diamond') weight += female ? 1.4 : 0.8
      if (candidate.faceShape === 'square' || candidate.faceShape === 'rectangular' || candidate.faceShape === 'pear') weight += female ? 0.2 : 1.1
      if (female && candidate.id.includes('softrect')) weight += 1.5
      if (female && candidate.id.includes('heart')) weight += 1.4
      if (!female && candidate.id.includes('square')) weight += 1.0
      if (!female && candidate.id.includes('rect')) weight += 0.8
      weights[candidate.id] = weight
    }
    return weightedPool(seed, 'base', candidates, weights)
  }
  return pick(seed, 'base-fallback', BASE_HEADS.filter((entry) => entry.family === 'mixed' && entry.gender === gender))
}

function selectSkin(seed: string, family: AppearanceFamily): SkinPalette {
  return pick(seed, 'skin', SKIN_FAMILIES[family])
}

function selectHairTexture(seed: string, family: AppearanceFamily): HairTexture {
  const pools: Record<AppearanceFamily, HairTexture[]> = {
    'east-asian': ['straight', 'straight', 'straight', 'wavy'],
    'southeast-asian': ['straight', 'straight', 'wavy', 'wavy'],
    'west-african': ['coily', 'coily', 'curly', 'coily'],
    european: ['straight', 'wavy', 'wavy', 'curly'],
    'south-asian': ['straight', 'wavy', 'wavy', 'curly'],
    'latin-american': ['straight', 'wavy', 'curly', 'wavy'],
    mixed: ['straight', 'wavy', 'curly', 'coily'],
  }
  return pick(seed, 'hair-texture', pools[family])
}

function selectHairColor(seed: string, family: AppearanceFamily, nationality: string): HairColorName {
  const weightsByFamily: Record<AppearanceFamily, Array<[HairColorName, number]>> = {
    'east-asian': [['black', 90], ['dark-brown', 8], ['brown', 2], ['light-brown', 0], ['blonde', 0], ['auburn', 0]],
    'southeast-asian': [['black', 82], ['dark-brown', 14], ['brown', 4], ['light-brown', 0], ['blonde', 0], ['auburn', 0]],
    'west-african': [['black', 92], ['dark-brown', 7], ['brown', 1], ['light-brown', 0], ['blonde', 0], ['auburn', 0]],
    european: [['brown', 28], ['dark-brown', 24], ['light-brown', 18], ['blonde', 22], ['black', 5], ['auburn', 3]],
    'south-asian': [['black', 76], ['dark-brown', 18], ['brown', 6], ['light-brown', 0], ['blonde', 0], ['auburn', 0]],
    'latin-american': [['black', 36], ['dark-brown', 24], ['brown', 24], ['light-brown', 8], ['blonde', 5], ['auburn', 3]],
    mixed: [['black', 26], ['dark-brown', 22], ['brown', 22], ['light-brown', 12], ['blonde', 12], ['auburn', 6]],
  }
  const parts = countryParts(nationality)
  if (parts.includes('Japan') || parts.includes('China') || parts.includes('South Korea')) {
    return weightedPick(seed, 'hair-color-ea-country', [['black', 95], ['dark-brown', 5]])
  }
  if (parts.includes('Nigeria') || parts.includes('Ghana') || parts.includes('Cameroon')) {
    return weightedPick(seed, 'hair-color-wa-country', [['black', 94], ['dark-brown', 6]])
  }
  if (parts.includes('Ireland')) {
    return weightedPick(seed, 'hair-color-ireland', [['brown', 32], ['blonde', 32], ['light-brown', 22], ['auburn', 10], ['black', 4]])
  }
  if (parts.includes('Spain') || parts.includes('Italy') || parts.includes('Mexico')) {
    return weightedPick(seed, 'hair-color-southern', [['black', 34], ['dark-brown', 28], ['brown', 24], ['light-brown', 8], ['blonde', 4], ['auburn', 2]])
  }
  if (parts.includes('Brazil') || parts.includes('United States') || parts.includes('Canada')) {
    return weightedPick(seed, 'hair-color-mixed-country', [['black', 24], ['dark-brown', 23], ['brown', 22], ['light-brown', 13], ['blonde', 13], ['auburn', 5]])
  }
  return weightedPick(seed, 'hair-color', weightsByFamily[family].filter(([, weight]) => weight > 0))
}

function selectHairStyle(seed: string, fighter: Fighter, family: AppearanceFamily, texture: HairTexture): HairStyle {
  const male = fighter.gender === 'Male'
  if (male) {
    const weights: Array<[HairStyle, number]> = [
      ['buzz', fighter.age > 34 ? 14 : 8],
      ['crop', 18],
      ['quiff', 14],
      ['side-part', 14],
      ['messy', fighter.socialPersonality === 'Showman' || fighter.socialPersonality === 'Rebel' ? 17 : 11],
      ['curly-top', texture === 'curly' || texture === 'coily' ? 15 : 5],
      ['afro-short', family === 'west-african' ? 17 : texture === 'coily' ? 8 : 0],
      ['waves', texture === 'wavy' ? 9 : 2],
      ['braids', fighter.socialPersonality === 'Showman' || fighter.socialPersonality === 'Rebel' ? (family === 'west-african' ? 7 : 3) : (family === 'west-african' ? 3 : 0)],
      ['bob', 0],
      ['ponytail', fighter.socialPersonality === 'Showman' ? 2 : 1],
      ['updo', 0],
    ]
    return weightedPick(seed, 'hair-style', weights.filter(([, weight]) => weight > 0))
  }
  const femaleWeights: Array<[HairStyle, number]> = [
    ['buzz', fighter.socialPersonality === 'Rebel' ? 3 : 1],
    ['crop', 4],
    ['quiff', 0],
    ['side-part', 5],
    ['messy', 7],
    ['curly-top', texture === 'curly' || texture === 'coily' ? 8 : 3],
    ['afro-short', family === 'west-african' ? 7 : texture === 'coily' ? 3 : 0],
    ['bob', 18],
    ['ponytail', 24],
    ['waves', 16],
    ['updo', 10],
    ['braids', family === 'west-african' ? 15 : 6],
  ]
  return weightedPick(seed, 'hair-style', femaleWeights.filter(([, weight]) => weight > 0))
}

function selectBeard(seed: string, fighter: Fighter): BeardStyle {
  if (fighter.gender !== 'Male' || fighter.age < 20) return 'none'
  const roll = rand(seed, 'beard-roll')
  if (roll < 0.36) return 'none'
  return weightedPick(seed, 'beard-style', [['stubble', 34], ['short', 28], ['goatee', 18], ['moustache', 20]])
}

function selectAccessory(seed: string, fighter: Fighter): Accessory {
  const chance = fighter.socialPersonality === 'Rebel' || fighter.socialPersonality === 'Showman' ? 0.34 : 0.2
  if (rand(seed, 'acc-roll') > chance) return 'none'
  return weightedPick(seed, 'acc-type', [
    ['scar', 26],
    ['brow-scar', 20],
    ['earring', fighter.socialPersonality === 'Showman' ? 24 : 12],
    ['headband', fighter.discipline === 'Wrestling' ? 20 : 10],
    ['glasses', fighter.socialPersonality === 'Classy' && fighter.competitivePersonality === 'Calculated' ? 8 : 2],
  ])
}

function selectExpression(fighter: Fighter): ExpressionPreset {
  const bySocial: Record<SocialPersonality, ExpressionPreset> = {
    Fighter: 'focused',
    Rebel: 'sly',
    Classy: 'proud',
    Villain: 'intense',
    Showman: 'friendly',
    Humble: 'calm',
  }
  const base = bySocial[fighter.socialPersonality]
  if (fighter.competitivePersonality === 'Fearless' && base === 'focused') return 'intense'
  return base
}

function expressionTuning(expression: ExpressionPreset, competitive: CompetitivePersonality) {
  const map: Record<ExpressionPreset, { mouth: number; smile: number; brow: number; eyes: number; arch: number }> = {
    stoic: { mouth: -0.2, smile: -0.05, brow: 0.2, eyes: 0.96, arch: 0.02 },
    focused: { mouth: -0.45, smile: -0.12, brow: 1.0, eyes: 0.94, arch: -0.04 },
    calm: { mouth: 0.12, smile: 0.08, brow: 0.1, eyes: 1.03, arch: 0.06 },
    proud: { mouth: 0.35, smile: 0.18, brow: -0.1, eyes: 1.02, arch: 0.12 },
    sly: { mouth: 0.78, smile: 0.35, brow: 0.45, eyes: 0.99, arch: 0.15 },
    friendly: { mouth: 0.7, smile: 0.45, brow: -0.15, eyes: 1.08, arch: 0.14 },
    intense: { mouth: -0.6, smile: -0.14, brow: 1.4, eyes: 0.92, arch: -0.1 },
  }
  const byCompetitive: Record<CompetitivePersonality, number> = {
    Fearless: 0.15,
    Calculated: -0.05,
    Opportunist: 0.06,
    Loyal: 0,
    'Money-Driven': 0.04,
    'Legacy-Driven': 0.08,
  }
  const base = map[expression]
  return { ...base, intensity: 0.45 + byCompetitive[competitive] + Math.abs(base.brow) * 0.14 + Math.abs(base.smile) * 0.12 }
}

function selectSkinToneId(seed: string, family: AppearanceFamily, nationality: string): string {
  const parts = countryParts(nationality)
  if (family === 'west-african') {
    if (parts.includes('Nigeria') || parts.includes('Ghana')) return weightedPick(seed, 'skin-tone-wa-ng', [['dark', 42], ['deep', 35], ['ebony', 23]])
    return weightedPick(seed, 'skin-tone-wa', [['dark', 36], ['deep', 40], ['ebony', 24]])
  }
  if (family === 'east-asian') {
    if (parts.includes('Japan') || parts.includes('South Korea')) return weightedPick(seed, 'skin-tone-ea-jp', [['porcelain-warm', 30], ['light-warm', 52], ['golden-light', 18]])
    return weightedPick(seed, 'skin-tone-ea', [['porcelain-warm', 24], ['light-warm', 48], ['golden-light', 28]])
  }
  if (family === 'southeast-asian') return weightedPick(seed, 'skin-tone-sea', [['golden-tan', 34], ['medium-warm', 42], ['deep-tan', 24]])
  if (family === 'south-asian') return weightedPick(seed, 'skin-tone-sa', [['golden-medium', 20], ['brown', 46], ['deep-brown', 34]])
  if (family === 'european') {
    if (parts.includes('Ireland') || parts.includes('Poland') || parts.includes('Germany') || parts.includes('Ukraine')) return weightedPick(seed, 'skin-tone-eu-north', [['porcelain', 28], ['fair', 52], ['light-olive', 18], ['olive', 2]])
    if (parts.includes('Spain') || parts.includes('Italy')) return weightedPick(seed, 'skin-tone-eu-south', [['fair', 26], ['light-olive', 50], ['olive', 24]])
    return weightedPick(seed, 'skin-tone-eu', [['porcelain', 18], ['fair', 42], ['light-olive', 28], ['olive', 12]])
  }
  if (family === 'latin-american') {
    if (parts.includes('Brazil')) return weightedPick(seed, 'skin-tone-la-br', [['fair-tan', 12], ['tan', 36], ['medium-brown', 34], ['deep-brown', 18]])
    return weightedPick(seed, 'skin-tone-la', [['fair-tan', 16], ['tan', 40], ['medium-brown', 30], ['deep-brown', 14]])
  }
  return weightedPick(seed, 'skin-tone-mixed', [['fair', 12], ['tan', 22], ['medium-brown', 28], ['deep-brown', 23], ['dark', 15]])
}

function clothingColor(fighter: Fighter, brandAccent: string): string {
  if (brandAccent) return brandAccent
  if (fighter.discipline === 'Boxing') return '#71373B'
  if (fighter.discipline === 'Kickboxing') return '#35527A'
  if (fighter.discipline === 'Wrestling') return '#513967'
  return '#315B4A'
}

export function createPortraitProfile(fighter: Fighter, brandAccent = ''): PortraitProfile {
  const seed = `chronicle-portrait-v2|${fighter.id}|${fighter.firstName}|${fighter.lastName}|${fighter.nationality}|${fighter.gender}`
  const identityKey = `${fighter.firstName} ${fighter.lastName}`.toLowerCase()
  const family = KNOWN_FAMILY_OVERRIDES[identityKey] ?? resolveFamily(seed, fighter.nationality)
  const base = selectBase(seed, family, fighter.gender)
  const skinToneId = KNOWN_TONE_OVERRIDES[identityKey] ?? selectSkinToneId(seed, family, fighter.nationality)
  const skin = selectSkin(seed, family)
  const hairTexture = selectHairTexture(seed, family)
  const hairColorName = selectHairColor(seed, family, fighter.nationality)
  const hairPalette = HAIR_PALETTES[hairColorName]
  const hairStyle = selectHairStyle(seed, fighter, family, hairTexture)
  const beardStyle = selectBeard(seed, fighter)
  const accessory = selectAccessory(seed, fighter)
  const expression = selectExpression(fighter)
  const tuning = expressionTuning(expression, fighter.competitivePersonality)

  const eyeCandidates = EYE_SETS.filter((entry) => {
    if (fighter.gender === 'Female') {
      if (family === 'east-asian') return ['eyes-soft-female', 'eyes-round-female', 'eyes-hooded-female', 'eyes-monolid-clean'].includes(entry.id)
      return ['eyes-soft-female', 'eyes-round-female', 'eyes-hooded-female'].includes(entry.id)
    }
    if (family === 'east-asian') return ['almond', 'monolid', 'narrow', 'hooded'].includes(entry.shape)
    if (family === 'southeast-asian') return ['almond', 'round', 'hooded', 'narrow', 'monolid'].includes(entry.shape)
    if (family === 'west-african') return ['almond', 'round', 'hooded'].includes(entry.shape)
    if (family === 'south-asian') return ['almond', 'hooded', 'round'].includes(entry.shape)
    return !entry.id.endsWith('-female')
  })
  const eyeWeights: Record<string, number> = fighter.gender === 'Female' ? {
    'eyes-soft-female': 5 + (expression === 'calm' || expression === 'proud' ? 1 : 0),
    'eyes-round-female': 4 + (expression === 'friendly' ? 2 : 0),
    'eyes-hooded-female': 3 + (expression === 'intense' || expression === 'focused' ? 1 : 0),
    'eyes-monolid-clean': family === 'east-asian' ? 3 : 0,
    'eyes-almond-soft': 0,
    'eyes-round-open': 0,
    'eyes-hooded-serious': 0,
    'eyes-narrow-focused': 0,
  } : {
    'eyes-almond-soft': (family === 'east-asian' || family === 'southeast-asian' || family === 'south-asian' ? 3 : 2) + (expression === 'calm' || expression === 'proud' ? 2 : 0),
    'eyes-round-open': (family === 'west-african' ? 3 : 1) + (expression === 'friendly' ? 4 : expression === 'calm' ? 1 : 0),
    'eyes-hooded-serious': 2 + (expression === 'intense' || expression === 'focused' ? 3 : 0),
    'eyes-narrow-focused': (family === 'east-asian' ? 3 : 1) + (expression === 'intense' || expression === 'focused' ? 4 : expression === 'sly' ? 2 : 0),
    'eyes-monolid-clean': family === 'east-asian' ? 3 + (expression === 'calm' ? 1 : 0) : family === 'southeast-asian' ? 1 : 0,
    'eyes-soft-female': 0,
    'eyes-round-female': 0,
    'eyes-hooded-female': 0,
  }
  const eyeSet = weightedPool(seed, 'eyeset', eyeCandidates, eyeWeights)

  const noseWeights: Record<string, number> = {
    'nose-straight': family === 'east-asian' || family === 'southeast-asian' || family === 'european' ? 3 : 2,
    'nose-narrow': family === 'european' ? 2 : 1,
    'nose-broad': family === 'west-african' ? 4 : 1,
    'nose-aquiline': family === 'european' || family === 'south-asian' ? 2 : 1,
    'nose-soft': family === 'east-asian' || family === 'southeast-asian' ? 3 : 2,
  }
  const noseSet = weightedPool(seed, 'noseset', NOSE_SETS, noseWeights)

  const mouthSet = weightedPool(seed, 'mouthset', MOUTH_SETS, fighter.gender === 'Female' ? {
    'mouth-firm': 0,
    'mouth-neutral': 0,
    'mouth-full': 0,
    'mouth-smirk': 0,
    'mouth-thin': 0,
    'mouth-soft-female': 5,
    'mouth-full-female': 5,
    'mouth-smirk-female': fighter.socialPersonality === 'Showman' || fighter.socialPersonality === 'Rebel' ? 4 : 2,
  } : {
    'mouth-firm': fighter.socialPersonality === 'Fighter' || fighter.socialPersonality === 'Villain' ? 3 : 1,
    'mouth-neutral': 3,
    'mouth-full': 2,
    'mouth-smirk': fighter.socialPersonality === 'Showman' || fighter.socialPersonality === 'Rebel' ? 4 : 1,
    'mouth-thin': fighter.socialPersonality === 'Classy' ? 2 : 1,
    'mouth-soft-female': 0,
    'mouth-full-female': 0,
    'mouth-smirk-female': 0,
  })

  const earSet = weightedPool(seed, 'earset', EAR_SETS, {
    'ears-compact': fighter.gender === 'Female' ? 2 : 1,
    'ears-medium': 3,
    'ears-pronounced': fighter.discipline === 'Wrestling' ? 2 : 1,
    'ears-high': 1,
    'ears-wide': 1,
  })

  const male = fighter.gender === 'Male'
  const rarity = RARITY[fighter.rarity]

  const mouthFullnessRange = male ? mouthSet.fullnessMale : mouthSet.fullnessFemale
  const browWeightRange = male ? eyeSet.browWeightMale : eyeSet.browWeightFemale

  return {
    family,
    gender: fighter.gender,
    faceShape: base.faceShape,
    eyeShape: eyeSet.shape,
    noseShape: noseSet.shape,
    mouthShape: mouthSet.shape,
    browShape: pick(seed, 'brow-shape', fighter.socialPersonality === 'Villain' || fighter.socialPersonality === 'Fighter' ? ['heavy', 'sharp', 'sharp', 'straight'] as const : fighter.gender === 'Female' ? ['arched', 'arched', 'straight', 'sharp'] as const : ['straight', 'arched', 'heavy', 'sharp'] as const),
    hairTexture,
    hairStyle,
    hairColorName,
    beardStyle,
    accessory,
    expression,
    baseId: base.id,
    skinToneId,
    eyeSetId: eyeSet.id,
    noseSetId: noseSet.id,
    mouthSetId: mouthSet.id,
    earSetId: earSet.id,
    skin: skin.base,
    skinShadow: skin.shadow,
    skinHighlight: skin.highlight,
    hair: hairPalette.base,
    hairHighlight: hairPalette.highlight,
    eyes: pick(seed, 'eye-color', EYE_COLORS),
    headWidth: between(seed, 'head-width', ...base.headWidth) * (male ? 1 : 0.985),
    headHeight: between(seed, 'head-height', ...base.headHeight),
    templeWidth: between(seed, 'temple-width', ...base.templeWidth),
    cheekWidth: between(seed, 'cheek-width', ...base.cheekWidth) * (male ? 1 : 1.01),
    jawWidth: between(seed, 'jaw-width', ...base.jawWidth) * (male ? 1 : 0.93),
    chinLength: between(seed, 'chin-length', ...base.chinLength) * (male ? 1 : 0.9),
    earSize: between(seed, 'ear-size', ...earSet.size),
    neckWidth: between(seed, 'neck-width', ...base.neckWidth),
    shoulderWidth: between(seed, 'shoulder-width', ...base.shoulderWidth),
    eyeGap: between(seed, 'eye-gap', ...base.eyeGap),
    eyeWidth: between(seed, 'eye-width', ...eyeSet.width) * (male ? 1 : 1.03),
    eyeHeight: between(seed, 'eye-height', ...eyeSet.height) * (male ? 1 : 1.08),
    eyeY: between(seed, 'eye-y', ...base.eyeY),
    eyeTilt: between(seed, 'eye-tilt', ...eyeSet.tilt) + (eyeSet.shape === 'monolid' ? 0.2 : 0),
    eyeInset: between(seed, 'eye-inset', -1.2, 1.2),
    eyeOpenness: between(seed, 'eye-open', ...eyeSet.openness) * tuning.eyes,
    browTilt: tuning.brow + between(seed, 'brow-tilt', -0.45, 0.45),
    browY: between(seed, 'brow-y', ...eyeSet.browY),
    browWeight: between(seed, 'brow-weight', ...browWeightRange) * (male ? 1 : 0.82),
    browArchBias: between(seed, 'brow-arch', -0.08, 0.15) + tuning.arch,
    noseWidth: between(seed, 'nose-width', ...noseSet.width) * (male ? 1 : 0.92),
    noseLength: between(seed, 'nose-length', ...noseSet.length) * (male ? 1 : 0.95),
    noseBridge: between(seed, 'nose-bridge', ...noseSet.bridge),
    noseX: between(seed, 'nose-x', ...noseSet.x),
    mouthWidth: between(seed, 'mouth-width', ...mouthSet.width) * (male ? 1 : 0.98),
    mouthCurve: between(seed, 'mouth-curve', ...mouthSet.curve) + tuning.mouth + (male ? 0 : 0.08),
    mouthY: between(seed, 'mouth-y', ...base.mouthY),
    mouthTilt: between(seed, 'mouth-tilt', ...mouthSet.tilt),
    lipFullness: between(seed, 'lip-fullness', ...mouthFullnessRange) * (male ? 1 : 1.12),
    smileLift: tuning.smile + between(seed, 'smile-lift', -0.08, 0.08),
    hairlineY: between(seed, 'hairline', ...base.hairlineY),
    hairVolume: between(seed, 'hair-volume', fighter.gender === 'Female' ? 1.0 : 0.92, fighter.gender === 'Female' ? 1.35 : 1.22),
    fringeDepth: between(seed, 'fringe-depth', hairStyle === 'buzz' ? 0.3 : 1.2, hairStyle === 'ponytail' || hairStyle === 'bob' ? 4.6 : 5.8),
    widowsPeak: between(seed, 'widows-peak', male ? 0.1 : 0, male ? 3.8 : 1.4),
    partShift: between(seed, 'part-shift', -7, 7),
    asymmetry: between(seed, 'asymmetry', -0.09, 0.09),
    faceSoftness: Math.min(1, between(seed, 'face-softness', ...base.faceSoftness) + (male ? 0 : 0.08)),
    leftEyeScale: between(seed, 'left-eye-scale', 0.94, 1.08),
    rightEyeScale: between(seed, 'right-eye-scale', 0.94, 1.08),
    lashStrength: between(seed, 'lashes', fighter.gender === 'Female' ? 0.44 : 0.1, fighter.gender === 'Female' ? 0.8 : 0.28),
    ageLines: Math.max(0, Math.min(1, (fighter.age - 30) / 16)),
    grayAmount: 0,
    expressionIntensity: Math.min(1, tuning.intensity),
    rarityAccent: rarity.accent,
    rarityGlow: rarity.glow,
    clothing: clothingColor(fighter, brandAccent),
    brandAccent: brandAccent || rarity.accent,
  }
}
