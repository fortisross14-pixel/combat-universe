import type { CareerArc, CompetitivePersonality, Discipline, Fighter, Gender, Promotion, Rarity, SocialPersonality } from '../types'

export const PROMOTION_SEEDS: Omit<
  Promotion,
  | 'fame'
  | 'currentViewers'
  | 'totalViewers'
  | 'revenue'
  | 'currentChampions'
  | 'divisionChampions'
  | 'titleHistory'
  | 'yearStats'
>[] = [
  {
    id: 'ufc', name: 'UFC', shortName: 'UFC', archetype: 'Global MMA apex', region: 'Global',
    competition: 98, entertainment: 82, risk: 78, tone: 'Global championship sport', color: '#c34848',
  },
  {
    id: 'pfl', name: 'PFL', shortName: 'PFL', archetype: 'Major global challenger', region: 'North America & Global',
    competition: 84, entertainment: 68, risk: 72, tone: 'Tournament-driven MMA', color: '#4d8bd5',
  },
  {
    id: 'one', name: 'ONE Championship', shortName: 'ONE', archetype: 'Asian MMA power', region: 'East & Southeast Asia',
    competition: 82, entertainment: 72, risk: 70, tone: 'Martial-arts prestige', color: '#c5a34a',
  },
  {
    id: 'cage', name: 'Cage Warriors', shortName: 'CW', archetype: 'Regional development feeder', region: 'Europe',
    competition: 68, entertainment: 48, risk: 66, tone: 'Prospect proving ground', color: '#6b8f6b',
  },
]

type StarSeed = {
  firstName: string
  lastName: string
  ringName?: string
  gender: Gender
  nationality: string
  style: string
  age: number
  rarity: 'Generational' | 'Legend' | 'Epic'
  overall: number
  charisma: number
  potential: number
  weightClass?: string
}

const SIGNATURE_STARS: StarSeed[] = [
  // 3 Generational: intentionally scarce. Their placement creates or removes eras of competition.
  { firstName: 'Jon', lastName: 'Jones', ringName: 'Bones', gender: 'Male', nationality: 'United States', style: 'Creative All-Rounder', age: 27, rarity: 'Generational', overall: 99, charisma: 88, potential: 100, weightClass: 'Light Heavyweight' },
  { firstName: 'Georges', lastName: 'St-Pierre', ringName: 'GSP', gender: 'Male', nationality: 'Canada', style: 'Elite Wrestler', age: 28, rarity: 'Generational', overall: 99, charisma: 91, potential: 100, weightClass: 'Welterweight' },
  { firstName: 'Amanda', lastName: 'Nunes', ringName: 'The Lioness', gender: 'Female', nationality: 'Brazil', style: 'Power All-Rounder', age: 28, rarity: 'Generational', overall: 99, charisma: 86, potential: 100, weightClass: 'Bantamweight' },

  // ~12 Legends.
  { firstName: 'Khabib', lastName: 'Nurmagomedov', ringName: 'The Eagle', gender: 'Male', nationality: 'Russia', style: 'Sambo Grappler', age: 27, rarity: 'Legend', overall: 97, charisma: 87, potential: 99, weightClass: 'Lightweight' },
  { firstName: 'Anderson', lastName: 'Silva', ringName: 'The Spider', gender: 'Male', nationality: 'Brazil', style: 'Counter Striker', age: 29, rarity: 'Legend', overall: 97, charisma: 92, potential: 98, weightClass: 'Middleweight' },
  { firstName: 'Fedor', lastName: 'Emelianenko', ringName: 'The Last Emperor', gender: 'Male', nationality: 'Russia', style: 'Combat Sambo', age: 28, rarity: 'Legend', overall: 97, charisma: 83, potential: 98, weightClass: 'Heavyweight' },
  { firstName: 'Demetrious', lastName: 'Johnson', ringName: 'Mighty Mouse', gender: 'Male', nationality: 'United States', style: 'Speed All-Rounder', age: 27, rarity: 'Legend', overall: 97, charisma: 85, potential: 98, weightClass: 'Flyweight' },
  { firstName: 'José', lastName: 'Aldo', ringName: 'The King of Rio', gender: 'Male', nationality: 'Brazil', style: 'Muay Thai Wrestler', age: 28, rarity: 'Legend', overall: 96, charisma: 86, potential: 98, weightClass: 'Featherweight' },
  { firstName: 'Conor', lastName: 'McGregor', ringName: 'The Notorious', gender: 'Male', nationality: 'Ireland', style: 'Counter Striker', age: 27, rarity: 'Legend', overall: 94, charisma: 100, potential: 97, weightClass: 'Lightweight' },
  { firstName: 'Kamaru', lastName: 'Usman', ringName: 'The Nigerian Nightmare', gender: 'Male', nationality: 'Nigeria', style: 'Pressure Wrestler', age: 28, rarity: 'Legend', overall: 96, charisma: 88, potential: 98, weightClass: 'Welterweight' },
  { firstName: 'Alexander', lastName: 'Volkanovski', ringName: 'The Great', gender: 'Male', nationality: 'Australia', style: 'Volume All-Rounder', age: 27, rarity: 'Legend', overall: 96, charisma: 89, potential: 98, weightClass: 'Featherweight' },
  { firstName: 'Stipe', lastName: 'Miocic', ringName: 'Stipe', gender: 'Male', nationality: 'United States', style: 'Boxer-Wrestler', age: 29, rarity: 'Legend', overall: 96, charisma: 84, potential: 97, weightClass: 'Heavyweight' },
  { firstName: 'Valentina', lastName: 'Shevchenko', ringName: 'Bullet', gender: 'Female', nationality: 'Kyrgyzstan', style: 'Technical Striker', age: 27, rarity: 'Legend', overall: 96, charisma: 86, potential: 98, weightClass: 'Flyweight' },
  { firstName: 'Ronda', lastName: 'Rousey', ringName: 'Rowdy', gender: 'Female', nationality: 'United States', style: 'Judo Grappler', age: 27, rarity: 'Legend', overall: 95, charisma: 94, potential: 97, weightClass: 'Bantamweight' },
  { firstName: 'Joanna', lastName: 'Jędrzejczyk', ringName: 'Joanna Champion', gender: 'Female', nationality: 'Poland', style: 'Volume Striker', age: 27, rarity: 'Legend', overall: 95, charisma: 91, potential: 97, weightClass: 'Strawweight' },

  // 24 Epics. Strong enough to become champions; not protected from bad matchups or bad timing.
  { firstName: 'Israel', lastName: 'Adesanya', ringName: 'The Last Stylebender', gender: 'Male', nationality: 'Nigeria / New Zealand', style: 'Kickboxer', age: 27, rarity: 'Epic', overall: 93, charisma: 97, potential: 97, weightClass: 'Middleweight' },
  { firstName: 'Francis', lastName: 'Ngannou', ringName: 'The Predator', gender: 'Male', nationality: 'Cameroon', style: 'Power Striker', age: 29, rarity: 'Epic', overall: 94, charisma: 90, potential: 97, weightClass: 'Heavyweight' },
  { firstName: 'Max', lastName: 'Holloway', ringName: 'Blessed', gender: 'Male', nationality: 'United States', style: 'Volume Striker', age: 26, rarity: 'Epic', overall: 93, charisma: 91, potential: 96, weightClass: 'Featherweight' },
  { firstName: 'Charles', lastName: 'Oliveira', ringName: 'Do Bronx', gender: 'Male', nationality: 'Brazil', style: 'Submission Grappler', age: 27, rarity: 'Epic', overall: 93, charisma: 89, potential: 97, weightClass: 'Lightweight' },
  { firstName: 'Dustin', lastName: 'Poirier', ringName: 'The Diamond', gender: 'Male', nationality: 'United States', style: 'Boxer-Wrestler', age: 28, rarity: 'Epic', overall: 92, charisma: 91, potential: 95, weightClass: 'Lightweight' },
  { firstName: 'Justin', lastName: 'Gaethje', ringName: 'The Highlight', gender: 'Male', nationality: 'United States', style: 'Power Striker', age: 28, rarity: 'Epic', overall: 92, charisma: 93, potential: 95, weightClass: 'Lightweight' },
  { firstName: 'Leon', lastName: 'Edwards', ringName: 'Rocky', gender: 'Male', nationality: 'United Kingdom', style: 'Technical Striker', age: 27, rarity: 'Epic', overall: 92, charisma: 85, potential: 96, weightClass: 'Welterweight' },
  { firstName: 'Robert', lastName: 'Whittaker', ringName: 'The Reaper', gender: 'Male', nationality: 'Australia', style: 'Counter Wrestler', age: 28, rarity: 'Epic', overall: 93, charisma: 87, potential: 96, weightClass: 'Middleweight' },
  { firstName: 'Alex', lastName: 'Pereira', ringName: 'Poatan', gender: 'Male', nationality: 'Brazil', style: 'Power Kickboxer', age: 29, rarity: 'Epic', overall: 94, charisma: 91, potential: 97, weightClass: 'Light Heavyweight' },
  { firstName: 'Daniel', lastName: 'Cormier', ringName: 'DC', gender: 'Male', nationality: 'United States', style: 'Olympic Wrestler', age: 29, rarity: 'Epic', overall: 94, charisma: 91, potential: 96, weightClass: 'Light Heavyweight' },
  { firstName: 'Islam', lastName: 'Makhachev', ringName: 'Islam', gender: 'Male', nationality: 'Russia', style: 'Sambo Grappler', age: 27, rarity: 'Epic', overall: 94, charisma: 84, potential: 97, weightClass: 'Lightweight' },
  { firstName: 'Tony', lastName: 'Ferguson', ringName: 'El Cucuy', gender: 'Male', nationality: 'United States', style: 'Pressure Grappler', age: 28, rarity: 'Epic', overall: 91, charisma: 94, potential: 94, weightClass: 'Lightweight' },
  { firstName: 'Petr', lastName: 'Yan', ringName: 'No Mercy', gender: 'Male', nationality: 'Russia', style: 'Boxer-Wrestler', age: 27, rarity: 'Epic', overall: 92, charisma: 86, potential: 96, weightClass: 'Bantamweight' },
  { firstName: 'T.J.', lastName: 'Dillashaw', ringName: 'TJ', gender: 'Male', nationality: 'United States', style: 'Movement Striker', age: 28, rarity: 'Epic', overall: 91, charisma: 88, potential: 95, weightClass: 'Bantamweight' },
  { firstName: 'Dominick', lastName: 'Cruz', ringName: 'The Dominator', gender: 'Male', nationality: 'United States', style: 'Movement Striker', age: 28, rarity: 'Epic', overall: 92, charisma: 87, potential: 95, weightClass: 'Bantamweight' },
  { firstName: 'Aljamain', lastName: 'Sterling', ringName: 'Funk Master', gender: 'Male', nationality: 'United States', style: 'Submission Wrestler', age: 27, rarity: 'Epic', overall: 91, charisma: 89, potential: 95, weightClass: 'Bantamweight' },
  { firstName: 'Brandon', lastName: 'Moreno', ringName: 'The Assassin Baby', gender: 'Male', nationality: 'Mexico', style: 'Scramble Grappler', age: 26, rarity: 'Epic', overall: 91, charisma: 91, potential: 96, weightClass: 'Flyweight' },
  { firstName: 'Henry', lastName: 'Cejudo', ringName: 'Triple C', gender: 'Male', nationality: 'United States', style: 'Olympic Wrestler', age: 28, rarity: 'Epic', overall: 92, charisma: 93, potential: 96, weightClass: 'Flyweight' },
  { firstName: 'Zhang', lastName: 'Weili', ringName: 'Magnum', gender: 'Female', nationality: 'China', style: 'Power All-Rounder', age: 27, rarity: 'Epic', overall: 93, charisma: 86, potential: 97, weightClass: 'Strawweight' },
  { firstName: 'Rose', lastName: 'Namajunas', ringName: 'Thug Rose', gender: 'Female', nationality: 'United States', style: 'Technical Striker', age: 25, rarity: 'Epic', overall: 92, charisma: 90, potential: 96, weightClass: 'Strawweight' },
  { firstName: 'Cris', lastName: 'Justino', ringName: 'Cyborg', gender: 'Female', nationality: 'Brazil', style: 'Pressure Striker', age: 28, rarity: 'Epic', overall: 93, charisma: 88, potential: 96, weightClass: 'Featherweight' },
  { firstName: 'Holly', lastName: 'Holm', ringName: 'The Preacher’s Daughter', gender: 'Female', nationality: 'United States', style: 'Counter Striker', age: 28, rarity: 'Epic', overall: 90, charisma: 87, potential: 94, weightClass: 'Bantamweight' },
  { firstName: 'Kayla', lastName: 'Harrison', ringName: 'The Olympian', gender: 'Female', nationality: 'United States', style: 'Judo Grappler', age: 27, rarity: 'Epic', overall: 92, charisma: 88, potential: 97, weightClass: 'Featherweight' },
  { firstName: 'Julianna', lastName: 'Peña', ringName: 'The Venezuelan Vixen', gender: 'Female', nationality: 'United States', style: 'Pressure Grappler', age: 27, rarity: 'Epic', overall: 89, charisma: 91, potential: 94, weightClass: 'Bantamweight' },
]

const MALE_FIRST_NAMES = [
  'Mateo', 'Alejandro', 'Luca', 'Marco', 'Gabriel', 'Thiago', 'Rafael', 'Diego', 'Nicolás', 'Javier', 'Adrián', 'Sergio',
  'Viktor', 'Mikhail', 'Artem', 'Dmitri', 'Ivan', 'Tomasz', 'Liam', 'Declan', 'Connor', 'Callum', 'Ethan', 'Noah', 'Mason',
  'Darius', 'Malik', 'Jamal', 'Andre', 'Marcus', 'Jalen', 'Kenji', 'Haruto', 'Ren', 'Daichi', 'Min-jun', 'Ji-hoon', 'Wei',
  'Hao', 'Arjun', 'Rohan', 'Omar', 'Karim', 'Youssef', 'Kwame', 'Kofi', 'Chidi', 'Tendai', 'Santiago', 'Emiliano',
]

const FEMALE_FIRST_NAMES = [
  'Lucía', 'Sofía', 'Valeria', 'Camila', 'Elena', 'Marta', 'Natalia', 'Isabella', 'Chiara', 'Giulia', 'Ana', 'Marina',
  'Vera', 'Anya', 'Katya', 'Milena', 'Zofia', 'Freya', 'Aoife', 'Niamh', 'Chloe', 'Maya', 'Aaliyah', 'Imani', 'Zuri',
  'Naomi', 'Haruka', 'Aiko', 'Mei', 'Yuna', 'Sora', 'Ji-woo', 'Min-seo', 'Xinyi', 'Lian', 'Priya', 'Anika', 'Layla',
  'Noura', 'Salma', 'Ama', 'Adwoa', 'Nia', 'Thandi', 'Daniela', 'Mariana', 'Renata', 'Paula', 'Gabriela', 'Catalina',
]

const LAST_NAMES = [
  'Cruz', 'Vega', 'Santos', 'Ferreira', 'Silva', 'Costa', 'Pereira', 'Morales', 'Navarro', 'Ortega', 'Romero', 'Mendoza',
  'Bianchi', 'Romano', 'Conti', 'Moretti', 'Rossi', 'Kovač', 'Petrov', 'Volkov', 'Sokolov', 'Nowak', 'Kowalski', 'Murphy',
  'O’Connor', 'Walsh', 'Bennett', 'Hayes', 'Carter', 'Brooks', 'Washington', 'Jefferson', 'Okafor', 'Mensah', 'Boateng',
  'Adeyemi', 'Ndlovu', 'Moyo', 'Tanaka', 'Sato', 'Nakamura', 'Kobayashi', 'Park', 'Kim', 'Lee', 'Chen', 'Wang', 'Zhang',
  'Patel', 'Singh', 'Khan', 'Haddad', 'Mansour', 'Rahman', 'Ibrahim', 'Alvarez', 'Torres', 'Reyes', 'Castillo', 'Figueroa',
]

const NATIONALITIES = [
  'United States', 'Mexico', 'Brazil', 'Spain', 'Ireland', 'United Kingdom', 'France', 'Italy', 'Germany', 'Poland', 'Ukraine',
  'Russia', 'Georgia', 'Nigeria', 'Ghana', 'South Africa', 'Cameroon', 'Japan', 'South Korea', 'China', 'Thailand', 'Philippines',
  'India', 'Pakistan', 'Canada', 'Australia', 'New Zealand', 'Argentina', 'Chile', 'Colombia', 'Puerto Rico', 'Dominican Republic',
]

const STYLES = [
  'MMA All-Rounder', 'Counter Striker', 'Pressure Striker', 'Volume Striker', 'Power Striker', 'Technical Striker', 'Kickboxer',
  'Muay Thai Wrestler', 'Elite Wrestler', 'Olympic Wrestler', 'Pressure Wrestler', 'Sambo Grappler', 'Submission Grappler',
  'Submission Wrestler', 'Judo Grappler', 'Boxer-Wrestler', 'Counter Wrestler', 'Scramble Grappler', 'Power All-Rounder', 'Movement Striker',
]

const RING_PREFIX = ['The', 'El', 'La', 'Iron', 'Golden', 'Black', 'Crimson', 'Silent', 'Wild', 'Royal']
const RING_NOUN = ['Wolf', 'Cobra', 'Lion', 'Falcon', 'Storm', 'Phantom', 'Titan', 'Prodigy', 'Hammer', 'Viper', 'Ace', 'Dragon']

const emptyStats = () => ({
  fights: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  finishes: 0,
  titles: 0,
  titleDefenses: 0,
  fameEarned: 0,
})

export function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(random: () => number, values: T[]): T {
  return values[Math.floor(random() * values.length)]
}

function between(random: () => number, min: number, max: number): number {
  return Math.floor(random() * (max - min + 1)) + min
}

function slug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const SOCIAL_PERSONALITIES: SocialPersonality[] = ['Fighter', 'Rebel', 'Classy', 'Villain', 'Showman', 'Humble']
const COMPETITIVE_PERSONALITIES: CompetitivePersonality[] = ['Fearless', 'Calculated', 'Opportunist', 'Loyal', 'Money-Driven', 'Legacy-Driven']
const CAREER_ARCS: CareerArc[] = ['Prodigy', 'Early Peak', 'Balanced', 'Late Bloomer', 'Evergreen']

function hashText(value: string): number {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash >>> 0)
}

function clampRating(value: number): number {
  return Math.max(35, Math.min(100, Math.round(value)))
}

function inferDiscipline(_style: string): Discipline {
  return 'MMA'
}

function inferWeightClass(gender: Gender, key: string, style: string): string {
  const text = `${key} ${style}`.toLowerCase()
  if (gender === 'Female') {
    const classes = ['Strawweight', 'Flyweight', 'Bantamweight', 'Featherweight']
    return classes[hashText(key) % classes.length]
  }
  if (/(heavyweight|ngannou|miocic|fedor)/.test(text)) return 'Heavyweight'
  const classes = ['Flyweight', 'Bantamweight', 'Featherweight', 'Lightweight', 'Welterweight', 'Middleweight', 'Light Heavyweight', 'Heavyweight']
  return classes[hashText(key) % classes.length]
}

function inferSocialPersonality(key: string, style: string, charisma: number): SocialPersonality {
  const text = `${key} ${style}`.toLowerCase()
  if (/(mcgregor|punk|naito|rebel)/.test(text)) return 'Rebel'
  if (/(mjf|villain)/.test(text)) return 'Villain'
  if (/(rock|cena|reigns|lynch|showman|stratton|cargill)/.test(text)) return 'Showman'
  if (/(st-pierre|canelo|usyk|inoue|nunes|aldo|taylor|class)/.test(text)) return 'Classy'
  if (/(khabib|fedor|holloway|humble)/.test(text)) return 'Humble'
  if (charisma >= 95) return hashText(key) % 2 ? 'Showman' : 'Rebel'
  return SOCIAL_PERSONALITIES[hashText(`${key}-social`) % SOCIAL_PERSONALITIES.length]
}

function inferCompetitivePersonality(key: string, style: string): CompetitivePersonality {
  const text = `${key} ${style}`.toLowerCase()
  if (/(jones|silva|ngannou|cyborg|power|pressure)/.test(text)) return 'Fearless'
  if (/(st-pierre|canelo|counter|technical|defensive)/.test(text)) return 'Calculated'
  if (/(mcgregor|rock|cena|showman)/.test(text)) return 'Money-Driven'
  if (/(khabib|fedor|nunes|inoue|usyk|legacy)/.test(text)) return 'Legacy-Driven'
  return COMPETITIVE_PERSONALITIES[hashText(`${key}-competitive`) % COMPETITIVE_PERSONALITIES.length]
}

function inferCareerArc(key: string): { careerArc: CareerArc; primeAge: number } {
  const careerArc = CAREER_ARCS[hashText(`${key}-arc`) % CAREER_ARCS.length]
  const primeAgeByArc: Record<CareerArc, number> = {
    Prodigy: 25,
    'Early Peak': 27,
    Balanced: 29,
    'Late Bloomer': 32,
    Evergreen: 31,
  }
  return { careerArc, primeAge: primeAgeByArc[careerArc] + (hashText(`${key}-prime`) % 3 - 1) }
}

function buildAttributes(overall: number, style: string, key: string) {
  const text = style.toLowerCase()
  const jitter = (suffix: string) => (hashText(`${key}-${suffix}`) % 9) - 4
  const striking = text.includes('box') || text.includes('kick') || text.includes('muay') || text.includes('strik') || text.includes('karate')
  const grappling = text.includes('wrestl') || text.includes('sambo') || text.includes('grappl') || text.includes('judo') || text.includes('submission')
  const powerStyle = text.includes('power') || text.includes('knockout') || text.includes('brawler') || text.includes('heavyweight')
  const technical = text.includes('technical') || text.includes('counter') || text.includes('all-rounder') || text.includes('precision')
  return {
    power: clampRating(overall + jitter('power') + (powerStyle ? 7 : 0)),
    speed: clampRating(overall + jitter('speed') + (striking ? 3 : 0) - (text.includes('heavyweight') ? 5 : 0)),
    technique: clampRating(overall + jitter('technique') + (technical ? 7 : 0)),
    wrestling: clampRating(overall - 11 + jitter('wrestling') + (grappling ? 15 : 0)),
    submissions: clampRating(overall - 14 + jitter('submissions') + (text.includes('submission') ? 18 : grappling ? 9 : 0)),
    chin: clampRating(overall + jitter('chin') + (powerStyle ? 3 : 0)),
    cardio: clampRating(overall + jitter('cardio') + (text.includes('volume') || text.includes('pressure') ? 7 : 0)),
    athleticism: clampRating(overall + jitter('athleticism') + (text.includes('athletic') || text.includes('aerial') ? 8 : 0)),
  }
}

function enrichFighterBase<T extends Pick<Fighter, 'firstName' | 'lastName' | 'ringName' | 'gender' | 'style' | 'overall' | 'charisma'>>(base: T) {
  const key = `${base.firstName}-${base.lastName}-${base.ringName ?? ''}`
  const { careerArc, primeAge } = inferCareerArc(key)
  return {
    discipline: inferDiscipline(base.style),
    weightClass: inferWeightClass(base.gender, key, base.style),
    socialPersonality: inferSocialPersonality(key, base.style, base.charisma),
    competitivePersonality: inferCompetitivePersonality(key, base.style),
    careerArc,
    primeAge,
    attributes: buildAttributes(base.overall, base.style, key),
  }
}

function seedToFighter(seed: StarSeed, index: number): Fighter {
  return {
    id: `star-${slug(`${seed.firstName}-${seed.lastName}-${seed.ringName ?? index}`)}`,
    firstName: seed.firstName,
    lastName: seed.lastName,
    ringName: seed.ringName,
    gender: seed.gender,
    age: seed.age,
    nationality: seed.nationality,
    style: seed.style,
    rarity: seed.rarity,
    overall: seed.overall,
    charisma: seed.charisma,
    potential: seed.potential,
    form: 50,
    fame: 0,
    legacy: 0,
    ...enrichFighterBase(seed),
    discipline: 'MMA',
    weightClass: seed.weightClass ?? inferWeightClass(seed.gender, `${seed.firstName}-${seed.lastName}`, seed.style),
    promotionId: null,
    isDraftEligible: true,
    isRetired: false,
    lastFightYear: null,
    lastFightMonth: null,
    currentStreak: 0,
    stats: emptyStats(),
    brandStats: {},
    yearStats: {},
    fightHistory: [],
  }
}

function createGeneratedFighter(
  random: () => number,
  index: number,
  gender: Gender,
  rarity: Rarity,
  isDraftEligible: boolean,
  usedNames: Set<string>,
): Fighter {
  let firstName = pick(random, gender === 'Male' ? MALE_FIRST_NAMES : FEMALE_FIRST_NAMES)
  let lastName = pick(random, LAST_NAMES)
  let nameKey = `${firstName}-${lastName}`
  let attempts = 0

  while (usedNames.has(nameKey) && attempts < 30) {
    firstName = pick(random, gender === 'Male' ? MALE_FIRST_NAMES : FEMALE_FIRST_NAMES)
    lastName = pick(random, LAST_NAMES)
    nameKey = `${firstName}-${lastName}`
    attempts += 1
  }
  usedNames.add(nameKey)

  const rarityRanges: Record<Rarity, [number, number, number, number]> = {
    Generational: [95, 100, 88, 100],
    Legend: [90, 97, 86, 99],
    Epic: [82, 91, 76, 98],
    Rare: [73, 83, 63, 92],
    Uncommon: [62, 75, 52, 86],
    Common: [50, 66, 42, 80],
  }
  const [overallMin, overallMax, charismaMin, charismaMax] = rarityRanges[rarity]
  const overall = between(random, overallMin, overallMax)
  const charisma = between(random, charismaMin, charismaMax)
  const potential = Math.min(100, Math.max(overall, overall + between(random, 2, 11)))
  const shouldHaveRingName = random() > 0.48
  const ringName = shouldHaveRingName ? `${pick(random, RING_PREFIX)} ${pick(random, RING_NOUN)}` : undefined
  const style = pick(random, STYLES)

  return {
    id: `${isDraftEligible ? 'star' : 'free'}-${index}-${slug(`${firstName}-${lastName}`)}`,
    firstName,
    lastName,
    ringName,
    gender,
    age: between(random, isDraftEligible ? 21 : 19, isDraftEligible ? 33 : 36),
    nationality: pick(random, NATIONALITIES),
    style,
    rarity,
    overall,
    charisma,
    potential,
    form: between(random, 43, 57),
    fame: 0,
    legacy: 0,
    ...enrichFighterBase({ firstName, lastName, ringName, gender, style, overall, charisma }),
    promotionId: null,
    isDraftEligible,
    isRetired: false,
    lastFightYear: null,
    lastFightMonth: null,
    currentStreak: 0,
    stats: emptyStats(),
    brandStats: {},
    yearStats: {},
    fightHistory: [],
  }
}

export function createFighterPool(seed: number): Fighter[] {
  const random = mulberry32(seed)
  const signatures = SIGNATURE_STARS.map(seedToFighter)
  const usedNames = new Set(signatures.map((fighter) => `${fighter.firstName}-${fighter.lastName}`))
  const lowerTier: Fighter[] = []
  const targetCounts: Array<[Rarity, number]> = [['Rare', 34], ['Uncommon', 30], ['Common', 20]]
  let index = 1000
  targetCounts.forEach(([rarity, count]) => {
    for (let i = 0; i < count; i += 1) {
      const gender: Gender = i % 3 === 0 ? 'Female' : 'Male'
      lowerTier.push(createGeneratedFighter(random, index++, gender, rarity, false, usedNames))
    }
  })
  return [...signatures, ...lowerTier]
}

export function hydrateFighterData(fighter: Fighter): Fighter {
  const enriched = enrichFighterBase(fighter)
  return {
    ...fighter,
    discipline: fighter.discipline ?? enriched.discipline,
    weightClass: fighter.weightClass ?? enriched.weightClass,
    socialPersonality: fighter.socialPersonality ?? enriched.socialPersonality,
    competitivePersonality: fighter.competitivePersonality ?? enriched.competitivePersonality,
    careerArc: fighter.careerArc ?? enriched.careerArc,
    primeAge: fighter.primeAge ?? enriched.primeAge,
    attributes: fighter.attributes ?? enriched.attributes,
    legacy: fighter.legacy ?? 0,
    lastFightYear: fighter.lastFightYear ?? null,
    lastFightMonth: fighter.lastFightMonth ?? null,
    currentStreak: fighter.currentStreak ?? 0,
    fightHistory: fighter.fightHistory ?? [],
  }
}

export function createProspectClass(seed: number, year: number, existing: Fighter[], count = 8): Fighter[] {
  const random = mulberry32(seed + year * 104729)
  const usedNames = new Set(existing.map((fighter) => `${fighter.firstName}-${fighter.lastName}`))
  const active = existing.filter((fighter) => !fighter.isRetired)
  const current = (rarity: Rarity) => active.filter((fighter) => fighter.rarity === rarity).length
  let genSlots = Math.max(0, 3 - current('Generational'))
  let legendSlots = Math.max(0, 12 - current('Legend'))
  let epicSlots = Math.max(0, 24 - current('Epic'))
  const prospects: Fighter[] = []
  for (let index = 0; index < count; index += 1) {
    const gender: Gender = random() < 0.34 ? 'Female' : 'Male'
    const roll = random()
    let rarity: Rarity
    if (genSlots > 0 && roll < 0.018) { rarity = 'Generational'; genSlots -= 1 }
    else if (legendSlots > 0 && roll < 0.075) { rarity = 'Legend'; legendSlots -= 1 }
    else if (epicSlots > 0 && roll < 0.22) { rarity = 'Epic'; epicSlots -= 1 }
    else if (roll < 0.52) rarity = 'Rare'
    else if (roll < 0.82) rarity = 'Uncommon'
    else rarity = 'Common'
    const fighter = createGeneratedFighter(random, year * 1000 + index, gender, rarity, false, usedNames)
    fighter.id = `prospect-${year}-${index}-${slug(`${fighter.firstName}-${fighter.lastName}`)}`
    fighter.age = between(random, 18, 22)
    fighter.overall = Math.max(45, fighter.overall - between(random, 3, 9))
    fighter.potential = Math.max(fighter.overall + 2, fighter.potential)
    fighter.discipline = 'MMA'
    fighter.attributes = buildAttributes(fighter.overall, fighter.style, fighter.id)
    prospects.push(fighter)
  }
  return prospects
}

