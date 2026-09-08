import type { Fighter } from '../types'

export type PortraitFamily = 'european' | 'west-african' | 'east-asian' | 'southeast-asian' | 'south-asian' | 'latin-mixed'
export type PortraitTier = 'elite' | 'standard'

export interface PortraitAsset {
  id: string
  tier: PortraitTier
  family: PortraitFamily
  gender: Fighter['gender']
  file: string
  tags?: string[]
  accessories?: string[]
}

export interface AssignedPortrait {
  asset: PortraitAsset
  accessory?: string
}

const ELITE_PORTRAITS: PortraitAsset[] = [
  { id: 'eu_f_01', tier: 'elite', family: 'european', gender: 'Female', file: 'elite/european/female/eu_f_01.png', tags: ['fair','focused','athletic','clean'], accessories: ['scar-brow','glasses','headband-black','face-tape'] },
  { id: 'eu_f_02', tier: 'elite', family: 'european', gender: 'Female', file: 'elite/european/female/eu_f_02.png', tags: ['intense','fighter','braids','blonde'], accessories: ['scar-brow','headband-red','face-tape'] },
  { id: 'eu_f_03', tier: 'elite', family: 'european', gender: 'Female', file: 'elite/european/female/eu_f_03.png', tags: ['tough','scarred','blonde','fighter'], accessories: ['scar-cheek','headband-black'] },
  { id: 'eu_f_04', tier: 'elite', family: 'european', gender: 'Female', file: 'elite/european/female/eu_f_04.png', tags: ['platinum-hair','focused','cold','distinctive'], accessories: ['scar-cheek','headband-black','face-tape','glasses'] },
  { id: 'eu_f_05', tier: 'elite', family: 'european', gender: 'Female', file: 'elite/european/female/eu_f_05.png', tags: ['platinum-hair','pixie','ice-blue','veteran'], accessories: ['scar-cheek','glasses','face-tape'] },
  { id: 'eu_f_06', tier: 'elite', family: 'european', gender: 'Female', file: 'elite/european/female/eu_f_06.png', tags: ['blonde','braids','fighter','intense'], accessories: ['scar-brow','headband-black','face-tape'] },
  { id: 'eu_m_01', tier: 'elite', family: 'european', gender: 'Male', file: 'elite/european/male/eu_m_01.png', tags: ['veteran','stoic','bearded','gray-hair'], accessories: ['scar-cheek','headband-black'] },
  { id: 'eu_m_02', tier: 'elite', family: 'european', gender: 'Male', file: 'elite/european/male/eu_m_02.png', tags: ['villain','intense','tattoo','bearded'], accessories: ['scar-brow','sunglasses','face-tape'] },
  { id: 'eu_m_03', tier: 'elite', family: 'european', gender: 'Male', file: 'elite/european/male/eu_m_03.png', tags: ['wild','veteran','headband','long-hair'], accessories: ['scar-cheek','sunglasses'] },
  { id: 'eu_m_04', tier: 'elite', family: 'european', gender: 'Male', file: 'elite/european/male/eu_m_04.png', tags: ['rugged','veteran','auburn','scarred'], accessories: ['scar-cheek','headband-black'] },
  { id: 'eu_m_05', tier: 'elite', family: 'european', gender: 'Male', file: 'elite/european/male/eu_m_05.png', tags: ['auburn','scarred','veteran','fighter'], accessories: ['scar-cheek','headband-black'] },

  { id: 'wa_f_01', tier: 'elite', family: 'west-african', gender: 'Female', file: 'elite/west-african/female/wa_f_01.png', tags: ['deep','confident','braids','intense'], accessories: ['scar-cheek','headband-red','face-tape'] },
  { id: 'wa_f_02', tier: 'elite', family: 'west-african', gender: 'Female', file: 'elite/west-african/female/wa_f_02.png', tags: ['deep','calm','braids','classy'], accessories: ['scar-brow','headband-black','glasses'] },
  { id: 'wa_f_03', tier: 'elite', family: 'west-african', gender: 'Female', file: 'elite/west-african/female/wa_f_03.png', tags: ['calm','confident','platinum-hair','clean','showman'], accessories: ['glasses','sunglasses','scar-cheek'] },
  { id: 'wa_f_04', tier: 'elite', family: 'west-african', gender: 'Female', file: 'elite/west-african/female/wa_f_04.png', tags: ['graceful','confident','braids','classy'], accessories: ['scar-brow','headband-black'] },
  { id: 'wa_f_05', tier: 'elite', family: 'west-african', gender: 'Female', file: 'elite/west-african/female/wa_f_05.png', tags: ['showman','pink-hair','distinctive','confident'], accessories: ['glasses','sunglasses','face-tape'] },
  { id: 'wa_f_06', tier: 'elite', family: 'west-african', gender: 'Female', file: 'elite/west-african/female/wa_f_06.png', tags: ['braids','focused','power','clean'], accessories: ['scar-cheek','headband-red','face-tape'] },
  { id: 'wa_f_07', tier: 'elite', family: 'west-african', gender: 'Female', file: 'elite/west-african/female/wa_f_07.png', tags: ['platinum-hair','calm','confident','showman'], accessories: ['glasses','sunglasses','face-tape'] },
  { id: 'wa_f_08', tier: 'elite', family: 'west-african', gender: 'Female', file: 'elite/west-african/female/wa_f_08.png', tags: ['pink-hair','braids','showman','distinctive'], accessories: ['headband-red','glasses','face-tape'] },
  { id: 'wa_m_01', tier: 'elite', family: 'west-african', gender: 'Male', file: 'elite/west-african/male/wa_m_01.png', tags: ['power','intense','bearded','tattoo','fearless'], accessories: ['scar-cheek','headband-red','face-tape'] },
  { id: 'wa_m_02', tier: 'elite', family: 'west-african', gender: 'Male', file: 'elite/west-african/male/wa_m_02.png', tags: ['legacy','focused','headband','stoic'], accessories: ['scar-brow','face-tape'] },
  { id: 'wa_m_03', tier: 'elite', family: 'west-african', gender: 'Male', file: 'elite/west-african/male/wa_m_03.png', tags: ['power','stoic','platinum-hair','distinctive'], accessories: ['scar-brow','headband-black','face-tape'] },
  { id: 'wa_m_04', tier: 'elite', family: 'west-african', gender: 'Male', file: 'elite/west-african/male/wa_m_04.png', tags: ['power','platinum-hair','stoic','cold'], accessories: ['scar-brow','headband-black','face-tape'] },
  { id: 'wa_m_05', tier: 'elite', family: 'west-african', gender: 'Male', file: 'elite/west-african/male/wa_m_05.png', tags: ['bearded','villain','fearless','fighter'], accessories: ['scar-cheek','headband-red'] },

  { id: 'ea_m_01', tier: 'elite', family: 'east-asian', gender: 'Male', file: 'elite/east-asian/male/ea_m_01.png', tags: ['light-warm','focused','clean','black-hair'], accessories: ['scar-cheek','headband-black','face-tape'] },
  { id: 'ea_m_02', tier: 'elite', family: 'east-asian', gender: 'Male', file: 'elite/east-asian/male/ea_m_02.png', tags: ['warm','rugged','bearded','fighter'], accessories: ['scar-brow','sunglasses','headband-red'] },
  { id: 'ea_m_03', tier: 'elite', family: 'east-asian', gender: 'Male', file: 'elite/east-asian/male/ea_m_03.png', tags: ['stoic','focused','scarred','black-hair'], accessories: ['scar-cheek','headband-black'] },
  { id: 'ea_m_04', tier: 'elite', family: 'east-asian', gender: 'Male', file: 'elite/east-asian/male/ea_m_04.png', tags: ['veteran','stoic','buzz','legacy'], accessories: ['scar-brow','face-tape'] },
  { id: 'ea_m_05', tier: 'elite', family: 'east-asian', gender: 'Male', file: 'elite/east-asian/male/ea_m_05.png', tags: ['white-hair','showman','cold','distinctive'], accessories: ['sunglasses','scar-brow'] },
  { id: 'ea_m_06', tier: 'elite', family: 'east-asian', gender: 'Male', file: 'elite/east-asian/male/ea_m_06.png', tags: ['white-hair','stoic','scarred','distinctive'], accessories: ['scar-brow','face-tape'] },
  { id: 'ea_m_07', tier: 'elite', family: 'east-asian', gender: 'Male', file: 'elite/east-asian/male/ea_m_07.png', tags: ['spiky-hair','scarred','stoic','technical'], accessories: ['scar-cheek','headband-black'] },
  { id: 'ea_m_08', tier: 'elite', family: 'east-asian', gender: 'Male', file: 'elite/east-asian/male/ea_m_08.png', tags: ['blonde-hair','face-tape','cocky','showman'], accessories: ['face-tape','scar-cheek','sunglasses'] },
  { id: 'ea_m_09', tier: 'elite', family: 'east-asian', gender: 'Male', file: 'elite/east-asian/male/ea_m_09.png', tags: ['focused','scarred','clean','stoic'], accessories: ['scar-cheek','headband-black'] },
  { id: 'ea_m_10', tier: 'elite', family: 'east-asian', gender: 'Male', file: 'elite/east-asian/male/ea_m_10.png', tags: ['white-hair','showman','scarred','cold'], accessories: ['scar-brow','face-tape','sunglasses'] },
  { id: 'ea_m_11', tier: 'elite', family: 'east-asian', gender: 'Male', file: 'elite/east-asian/male/ea_m_11.png', tags: ['blonde-hair','technical','face-tape','calm'], accessories: ['face-tape','scar-cheek'] },
  { id: 'ea_f_01', tier: 'elite', family: 'east-asian', gender: 'Female', file: 'elite/east-asian/female/ea_f_01.png', tags: ['calm','technical','clean','black-hair'], accessories: ['glasses','scar-brow'] },
  { id: 'ea_f_02', tier: 'elite', family: 'east-asian', gender: 'Female', file: 'elite/east-asian/female/ea_f_02.png', tags: ['clean','calm','focused','black-hair'], accessories: ['headband-black','scar-cheek'] },
  { id: 'ea_f_03', tier: 'elite', family: 'east-asian', gender: 'Female', file: 'elite/east-asian/female/ea_f_03.png', tags: ['classy','technical','focused','ponytail'], accessories: ['glasses','scar-brow','headband-black'] },

  { id: 'sea_f_01', tier: 'elite', family: 'southeast-asian', gender: 'Female', file: 'elite/southeast-asian/female/sea_f_01.png', tags: ['medium-warm','calm','classy','clean'], accessories: ['scar-cheek','glasses','headband-black'] },
  { id: 'sea_f_02', tier: 'elite', family: 'southeast-asian', gender: 'Female', file: 'elite/southeast-asian/female/sea_f_02.png', tags: ['rebel','showman','pink-hair','freckles','distinctive'], accessories: ['sunglasses','scar-brow','face-tape'] },
  { id: 'sea_f_03', tier: 'elite', family: 'southeast-asian', gender: 'Female', file: 'elite/southeast-asian/female/sea_f_03.png', tags: ['classy','calm','focused','brown-hair'], accessories: ['scar-cheek','glasses','headband-black'] },
  { id: 'sea_f_04', tier: 'elite', family: 'southeast-asian', gender: 'Female', file: 'elite/southeast-asian/female/sea_f_04.png', tags: ['calm','determined','bun','technical'], accessories: ['glasses','headband-black'] },
  { id: 'sea_f_05', tier: 'elite', family: 'southeast-asian', gender: 'Female', file: 'elite/southeast-asian/female/sea_f_05.png', tags: ['calm','technical','brown-hair','focused'], accessories: ['glasses','headband-black','scar-cheek'] },
  { id: 'sea_m_01', tier: 'elite', family: 'southeast-asian', gender: 'Male', file: 'elite/southeast-asian/male/sea_m_01.png', tags: ['focused','tattoo','black-hair','fearless'], accessories: ['scar-cheek','headband-red'] },
  { id: 'sea_m_02', tier: 'elite', family: 'southeast-asian', gender: 'Male', file: 'elite/southeast-asian/male/sea_m_02.png', tags: ['rebel','distinctive','blonde','face-tape'], accessories: ['face-tape','scar-brow','sunglasses'] },

  { id: 'sa_f_01', tier: 'elite', family: 'south-asian', gender: 'Female', file: 'elite/south-asian/female/sa_f_01.png', tags: ['classy','calm','glasses','technical'], accessories: ['scar-brow','headband-black'] },
  { id: 'sa_m_01', tier: 'elite', family: 'south-asian', gender: 'Male', file: 'elite/south-asian/male/sa_m_01.png', tags: ['rugged','intense','bearded','fighter'], accessories: ['scar-cheek','face-tape'] },
  { id: 'sa_m_02', tier: 'elite', family: 'south-asian', gender: 'Male', file: 'elite/south-asian/male/sa_m_02.png', tags: ['villain','intense','bearded','long-hair'], accessories: ['scar-cheek','headband-black','face-tape'] },
  { id: 'sa_m_03', tier: 'elite', family: 'south-asian', gender: 'Male', file: 'elite/south-asian/male/sa_m_03.png', tags: ['bearded','warrior','intense','long-hair'], accessories: ['scar-cheek','headband-black'] },

  { id: 'la_m_01', tier: 'elite', family: 'latin-mixed', gender: 'Male', file: 'elite/latin-mixed/male/la_m_01.png', tags: ['tan','intense','clean','fighter'], accessories: ['scar-brow','sunglasses','headband-red','face-tape'] },
  { id: 'la_m_02', tier: 'elite', family: 'latin-mixed', gender: 'Male', file: 'elite/latin-mixed/male/la_m_02.png', tags: ['tan','focused','classy'], accessories: ['scar-cheek','glasses','headband-black'] },
  { id: 'la_m_03', tier: 'elite', family: 'latin-mixed', gender: 'Male', file: 'elite/latin-mixed/male/la_m_03.png', tags: ['young','cocky','curly','technical'], accessories: ['sunglasses','scar-brow'] },
  { id: 'la_m_04', tier: 'elite', family: 'latin-mixed', gender: 'Male', file: 'elite/latin-mixed/male/la_m_04.png', tags: ['young','calm','curly','clean'], accessories: ['glasses','headband-black'] },
  { id: 'la_m_05', tier: 'elite', family: 'latin-mixed', gender: 'Male', file: 'elite/latin-mixed/male/la_m_05.png', tags: ['clean','sharp','technical','veteran'], accessories: ['scar-cheek','headband-black'] },
  { id: 'la_m_06', tier: 'elite', family: 'latin-mixed', gender: 'Male', file: 'elite/latin-mixed/male/la_m_06.png', tags: ['curly','fighter','villain','scarred'], accessories: ['scar-cheek','headband-black'] },
  { id: 'la_m_07', tier: 'elite', family: 'latin-mixed', gender: 'Male', file: 'elite/latin-mixed/male/la_m_07.png', tags: ['clean','focused','technical','legacy'], accessories: ['scar-cheek','headband-black'] },
  { id: 'la_f_01', tier: 'elite', family: 'latin-mixed', gender: 'Female', file: 'elite/latin-mixed/female/la_f_01.png', tags: ['intense','tattoo','dark-hair','fighter'], accessories: ['scar-cheek','headband-red'] },
  { id: 'la_f_02', tier: 'elite', family: 'latin-mixed', gender: 'Female', file: 'elite/latin-mixed/female/la_f_02.png', tags: ['intense','freckles','curly','fighter'], accessories: ['scar-brow','headband-red','face-tape'] },
  { id: 'la_f_03', tier: 'elite', family: 'latin-mixed', gender: 'Female', file: 'elite/latin-mixed/female/la_f_03.png', tags: ['curly','focused','freckled','rebel'], accessories: ['scar-cheek','glasses'] },
  { id: 'la_f_04', tier: 'elite', family: 'latin-mixed', gender: 'Female', file: 'elite/latin-mixed/female/la_f_04.png', tags: ['curly','focused','freckled','fighter'], accessories: ['scar-cheek','glasses','headband-black'] },
]

const STANDARD_PORTRAITS: PortraitAsset[] = [
  { id: 'std_eu_m', tier: 'standard', family: 'european', gender: 'Male', file: 'standard/european/male/eur_m_01.png', tags: ['basic','clean'] },
  { id: 'std_eu_f', tier: 'standard', family: 'european', gender: 'Female', file: 'standard/european/female/eur_f_01.png', tags: ['basic','clean'] },
  { id: 'std_wa_m', tier: 'standard', family: 'west-african', gender: 'Male', file: 'standard/west-african/male/wes_m_01.png', tags: ['basic','clean'] },
  { id: 'std_wa_f', tier: 'standard', family: 'west-african', gender: 'Female', file: 'standard/west-african/female/wes_f_01.png', tags: ['basic','clean'] },
  { id: 'std_ea_m', tier: 'standard', family: 'east-asian', gender: 'Male', file: 'standard/east-asian/male/eas_m_01.png', tags: ['basic','clean'] },
  { id: 'std_ea_f', tier: 'standard', family: 'east-asian', gender: 'Female', file: 'standard/east-asian/female/eas_f_01.png', tags: ['basic','clean'] },
  { id: 'std_sea_m', tier: 'standard', family: 'southeast-asian', gender: 'Male', file: 'standard/southeast-asian/male/sea_m_01.png', tags: ['basic','clean'] },
  { id: 'std_sea_f', tier: 'standard', family: 'southeast-asian', gender: 'Female', file: 'standard/southeast-asian/female/sea_f_01.png', tags: ['basic','clean'] },
  { id: 'std_sa_m', tier: 'standard', family: 'south-asian', gender: 'Male', file: 'standard/south-asian/male/sou_m_01.png', tags: ['basic','clean'] },
  { id: 'std_sa_f', tier: 'standard', family: 'south-asian', gender: 'Female', file: 'standard/south-asian/female/sou_f_01.png', tags: ['basic','clean'] },
  { id: 'std_la_m', tier: 'standard', family: 'latin-mixed', gender: 'Male', file: 'standard/latin-mixed/male/lat_m_01.png', tags: ['basic','clean'] },
  { id: 'std_la_f', tier: 'standard', family: 'latin-mixed', gender: 'Female', file: 'standard/latin-mixed/female/lat_f_01.png', tags: ['basic','clean'] },
]

const FAMILY_OVERRIDES: Record<string, PortraitFamily> = {
  'jon jones': 'west-african',
  'demetrious johnson': 'west-african',
  'kamaru usman': 'west-african',
  'francis ngannou': 'west-african',
  'israel adesanya': 'west-african',
  'conor mcgregor': 'european',
  'stipe miocic': 'european',
  'joanna jędrzejczyk': 'european',
  'valentina shevchenko': 'european',
  'amanda nunes': 'latin-mixed',
  'anderson silva': 'latin-mixed',
  'josé aldo': 'latin-mixed',
  'alex pereira': 'latin-mixed',
  'charles oliveira': 'latin-mixed',
  'brandon moreno': 'latin-mixed',
  'zhang weili': 'east-asian',
}

const COUNTRY_FAMILY: Record<string, Array<[PortraitFamily, number]>> = {
  Japan: [['east-asian', 98], ['latin-mixed', 2]],
  China: [['east-asian', 96], ['latin-mixed', 4]],
  'South Korea': [['east-asian', 96], ['latin-mixed', 4]],
  Thailand: [['southeast-asian', 94], ['east-asian', 4], ['latin-mixed', 2]],
  Philippines: [['southeast-asian', 88], ['latin-mixed', 12]],
  Singapore: [['southeast-asian', 50], ['east-asian', 22], ['south-asian', 18], ['latin-mixed', 10]],
  Nigeria: [['west-african', 96], ['latin-mixed', 4]],
  Ghana: [['west-african', 96], ['latin-mixed', 4]],
  Cameroon: [['west-african', 94], ['latin-mixed', 6]],
  'South Africa': [['west-african', 72], ['european', 12], ['latin-mixed', 16]],
  Ireland: [['european', 97], ['latin-mixed', 3]],
  'United Kingdom': [['european', 80], ['west-african', 8], ['south-asian', 5], ['latin-mixed', 7]],
  France: [['european', 74], ['west-african', 9], ['latin-mixed', 17]],
  Italy: [['european', 94], ['latin-mixed', 6]],
  Germany: [['european', 96], ['latin-mixed', 4]],
  Spain: [['european', 90], ['latin-mixed', 10]],
  Poland: [['european', 97], ['latin-mixed', 3]],
  Ukraine: [['european', 97], ['latin-mixed', 3]],
  Russia: [['european', 82], ['east-asian', 6], ['latin-mixed', 12]],
  Georgia: [['european', 78], ['latin-mixed', 22]],
  India: [['south-asian', 98], ['latin-mixed', 2]],
  Pakistan: [['south-asian', 97], ['latin-mixed', 3]],
  Mexico: [['latin-mixed', 96], ['european', 4]],
  Brazil: [['latin-mixed', 62], ['west-african', 16], ['european', 14], ['south-asian', 2], ['east-asian', 2], ['southeast-asian', 4]],
  Argentina: [['latin-mixed', 70], ['european', 28], ['west-african', 2]],
  Chile: [['latin-mixed', 84], ['european', 16]],
  Colombia: [['latin-mixed', 86], ['west-african', 8], ['european', 6]],
  'Puerto Rico': [['latin-mixed', 80], ['west-african', 12], ['european', 8]],
  'Dominican Republic': [['latin-mixed', 60], ['west-african', 34], ['european', 6]],
  Canada: [['european', 58], ['west-african', 8], ['east-asian', 8], ['south-asian', 8], ['latin-mixed', 18]],
  Australia: [['european', 72], ['east-asian', 5], ['southeast-asian', 6], ['south-asian', 4], ['latin-mixed', 13]],
  'New Zealand': [['european', 62], ['southeast-asian', 7], ['latin-mixed', 31]],
  'United States': [['european', 34], ['west-african', 20], ['latin-mixed', 22], ['east-asian', 8], ['southeast-asian', 6], ['south-asian', 10]],
}

function hash(value: string): number {
  let result = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    result ^= value.charCodeAt(i)
    result = Math.imul(result, 16777619)
  }
  return result >>> 0
}

function weighted<T>(key: string, values: Array<[T, number]>): T {
  const total = values.reduce((sum, [, w]) => sum + w, 0)
  let cursor = (hash(key) / 4294967295) * total
  for (const [value, weight] of values) {
    cursor -= weight
    if (cursor <= 0) return value
  }
  return values[values.length - 1][0]
}

function nationalityParts(nationality: string): string[] {
  return nationality.split('/').map((part) => part.trim()).filter(Boolean)
}

export function portraitFamilyForFighter(fighter: Fighter): PortraitFamily {
  const identity = `${fighter.firstName} ${fighter.lastName}`.toLowerCase()
  if (FAMILY_OVERRIDES[identity]) return FAMILY_OVERRIDES[identity]
  const merged = new Map<PortraitFamily, number>()
  for (const country of nationalityParts(fighter.nationality)) {
    const dist = COUNTRY_FAMILY[country] ?? [['latin-mixed', 100] as [PortraitFamily, number]]
    for (const [family, weight] of dist) merged.set(family, (merged.get(family) ?? 0) + weight)
  }
  return weighted(`${fighter.id}|family`, [...merged.entries()])
}

export function portraitTierForFighter(fighter: Fighter): PortraitTier {
  return ['Generational','Legend','Epic'].includes(fighter.rarity) ? 'elite' : 'standard'
}

function personalityTags(fighter: Fighter): string[] {
  const social: Record<Fighter['socialPersonality'], string[]> = {
    Fighter: ['fighter','intense','rugged','tough','power'],
    Rebel: ['rebel','wild','pink-hair','platinum-hair','tattoo','headband','distinctive'],
    Classy: ['classy','clean','calm','graceful','technical'],
    Villain: ['villain','intense','scarred','tattoo','bearded','cold'],
    Showman: ['showman','distinctive','pink-hair','platinum-hair','white-hair','cocky'],
    Humble: ['calm','clean','stoic','focused'],
  }
  const competitive: Record<Fighter['competitivePersonality'], string[]> = {
    Fearless: ['fearless','intense','power','scarred','wild'],
    Calculated: ['technical','focused','calm','glasses','classy'],
    Opportunist: ['cocky','showman','rebel'],
    Loyal: ['stoic','calm','veteran'],
    'Money-Driven': ['showman','distinctive','glasses','sunglasses'],
    'Legacy-Driven': ['legacy','veteran','stoic','focused'],
  }
  return [...social[fighter.socialPersonality], ...competitive[fighter.competitivePersonality]]
}

function chooseAsset(fighter: Fighter, family: PortraitFamily, tier: PortraitTier): PortraitAsset {
  const source = tier === 'elite' ? ELITE_PORTRAITS : STANDARD_PORTRAITS
  let candidates = source.filter((p) => p.family === family && p.gender === fighter.gender)
  if (!candidates.length && tier === 'elite') {
    candidates = STANDARD_PORTRAITS.filter((p) => p.family === family && p.gender === fighter.gender)
  }
  if (!candidates.length) candidates = STANDARD_PORTRAITS.filter((p) => p.gender === fighter.gender)
  if (tier !== 'elite' || candidates.length <= 1) return candidates[hash(`${fighter.id}|portrait`) % candidates.length]

  const desired = new Set(personalityTags(fighter))
  const weightedCandidates: Array<[PortraitAsset, number]> = candidates.map((asset) => {
    let score = 3
    for (const tag of asset.tags ?? []) {
      if (desired.has(tag)) score += tag === 'distinctive' ? 4 : 2
    }
    // Fame/charisma makes expressive portraits more likely without changing the face dynamically.
    if (fighter.charisma >= 92 && (asset.tags?.includes('showman') || asset.tags?.includes('distinctive'))) score += 3
    if (fighter.age >= 31 && asset.tags?.includes('veteran')) score += 3
    return [asset, score]
  })
  return weighted(`${fighter.id}|portrait|personality`, weightedCandidates)
}

export function assignPortrait(fighter: Fighter): AssignedPortrait {
  const family = portraitFamilyForFighter(fighter)
  const tier = portraitTierForFighter(fighter)
  const asset = chooseAsset(fighter, family, tier)
  if (asset.tier !== 'elite' || !asset.accessories?.length) return { asset }

  let accessoryChance = 22
  if (fighter.socialPersonality === 'Showman' || fighter.socialPersonality === 'Rebel') accessoryChance = 46
  else if (fighter.socialPersonality === 'Villain') accessoryChance = 38
  else if (fighter.socialPersonality === 'Classy') accessoryChance = 24
  else if (fighter.socialPersonality === 'Humble') accessoryChance = 12

  const accessoryRoll = hash(`${fighter.id}|accessory-roll`) % 100
  if (accessoryRoll >= accessoryChance) return { asset }
  const accessory = asset.accessories[hash(`${fighter.id}|accessory`) % asset.accessories.length]
  return { asset, accessory }
}

export const PORTRAIT_LIBRARY_STATS = {
  eliteAvailable: ELITE_PORTRAITS.length,
  standardAvailable: STANDARD_PORTRAITS.length,
  eliteTargetFirstExpansion: 64,
  standardTarget: 24,
}
