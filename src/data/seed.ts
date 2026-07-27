import type { Fighter, Gender, Promotion, Rarity } from '../types'

export const PROMOTION_SEEDS: Omit<
  Promotion,
  | 'fame'
  | 'currentViewers'
  | 'totalViewers'
  | 'revenue'
  | 'currentChampions'
  | 'titleHistory'
  | 'yearStats'
>[] = [
  {
    id: 'ufc',
    name: 'UFC',
    shortName: 'UFC',
    archetype: 'Global MMA leader',
    region: 'North America',
    competition: 96,
    entertainment: 34,
    risk: 78,
    tone: 'Serious sport',
    color: '#c34848',
  },
  {
    id: 'pfl',
    name: 'PFL',
    shortName: 'PFL',
    archetype: 'Seasonal MMA league',
    region: 'North America',
    competition: 89,
    entertainment: 42,
    risk: 70,
    tone: 'Seasonal spectacle',
    color: '#4d8bd5',
  },
  {
    id: 'one',
    name: 'ONE Championship',
    shortName: 'ONE',
    archetype: 'Asian martial-arts hybrid',
    region: 'East & Southeast Asia',
    competition: 83,
    entertainment: 60,
    risk: 72,
    tone: 'Martial-arts prestige',
    color: '#c5a34a',
  },
  {
    id: 'wwe',
    name: 'WWE',
    shortName: 'WWE',
    archetype: 'Global sports-entertainment giant',
    region: 'Global',
    competition: 26,
    entertainment: 99,
    risk: 38,
    tone: 'Global entertainment',
    color: '#8c62d7',
  },
  {
    id: 'aew',
    name: 'AEW',
    shortName: 'AEW',
    archetype: 'Athletic entertainment challenger',
    region: 'North America',
    competition: 47,
    entertainment: 92,
    risk: 52,
    tone: 'Athletic entertainment',
    color: '#d4933f',
  },
  {
    id: 'tna',
    name: 'TNA Wrestling',
    shortName: 'TNA',
    archetype: 'Story-driven wrestling alternative',
    region: 'North America',
    competition: 38,
    entertainment: 88,
    risk: 47,
    tone: 'Chaotic drama',
    color: '#397ac5',
  },
  {
    id: 'matchroom',
    name: 'Matchroom Boxing',
    shortName: 'MRB',
    archetype: 'Global boxing promotion',
    region: 'Europe & Global',
    competition: 93,
    entertainment: 48,
    risk: 82,
    tone: 'Prizefight prestige',
    color: '#35a56f',
  },
  {
    id: 'karate',
    name: 'Karate Combat',
    shortName: 'KC',
    archetype: 'Hybrid striking spectacle',
    region: 'Global',
    competition: 74,
    entertainment: 73,
    risk: 76,
    tone: 'Underground spectacle',
    color: '#d96d43',
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
  rarity: 'Legend' | 'Epic'
  overall: number
  charisma: number
  potential: number
}

const SIGNATURE_STARS: StarSeed[] = [
  { firstName: 'Paul', lastName: 'Levesque', ringName: 'Triple H', gender: 'Male', nationality: 'United States', style: 'Powerhouse Wrestler', age: 28, rarity: 'Legend', overall: 91, charisma: 99, potential: 96 },
  { firstName: 'Daniel', lastName: 'Cormier', ringName: 'DC', gender: 'Male', nationality: 'United States', style: 'Olympic Wrestling', age: 29, rarity: 'Legend', overall: 97, charisma: 91, potential: 97 },
  { firstName: 'Ronda', lastName: 'Rousey', ringName: 'Rowdy', gender: 'Female', nationality: 'United States', style: 'Judo & Armbars', age: 27, rarity: 'Legend', overall: 95, charisma: 94, potential: 96 },
  { firstName: 'Amanda', lastName: 'Nunes', ringName: 'The Lioness', gender: 'Female', nationality: 'Brazil', style: 'MMA All-Rounder', age: 28, rarity: 'Legend', overall: 98, charisma: 84, potential: 97 },
  { firstName: 'Conor', lastName: 'McGregor', ringName: 'The Notorious', gender: 'Male', nationality: 'Ireland', style: 'Counter Striker', age: 27, rarity: 'Legend', overall: 93, charisma: 100, potential: 96 },
  { firstName: 'Jon', lastName: 'Jones', ringName: 'Bones', gender: 'Male', nationality: 'United States', style: 'Creative MMA', age: 27, rarity: 'Legend', overall: 99, charisma: 88, potential: 99 },
  { firstName: 'Georges', lastName: 'St-Pierre', ringName: 'GSP', gender: 'Male', nationality: 'Canada', style: 'MMA All-Rounder', age: 28, rarity: 'Legend', overall: 99, charisma: 91, potential: 99 },
  { firstName: 'Khabib', lastName: 'Nurmagomedov', ringName: 'The Eagle', gender: 'Male', nationality: 'Russia', style: 'Sambo Pressure', age: 27, rarity: 'Legend', overall: 98, charisma: 87, potential: 98 },
  { firstName: 'Anderson', lastName: 'Silva', ringName: 'The Spider', gender: 'Male', nationality: 'Brazil', style: 'Muay Thai Countering', age: 29, rarity: 'Legend', overall: 98, charisma: 92, potential: 98 },
  { firstName: 'Fedor', lastName: 'Emelianenko', ringName: 'The Last Emperor', gender: 'Male', nationality: 'Russia', style: 'Combat Sambo', age: 28, rarity: 'Legend', overall: 98, charisma: 83, potential: 98 },
  { firstName: 'Israel', lastName: 'Adesanya', ringName: 'The Last Stylebender', gender: 'Male', nationality: 'Nigeria / New Zealand', style: 'Kickboxing', age: 27, rarity: 'Epic', overall: 94, charisma: 97, potential: 97 },
  { firstName: 'Francis', lastName: 'Ngannou', ringName: 'The Predator', gender: 'Male', nationality: 'Cameroon', style: 'Knockout Power', age: 29, rarity: 'Epic', overall: 95, charisma: 90, potential: 96 },
  { firstName: 'Max', lastName: 'Holloway', ringName: 'Blessed', gender: 'Male', nationality: 'United States', style: 'Volume Boxing', age: 26, rarity: 'Epic', overall: 93, charisma: 91, potential: 96 },
  { firstName: 'José', lastName: 'Aldo', ringName: 'The King of Rio', gender: 'Male', nationality: 'Brazil', style: 'Muay Thai', age: 28, rarity: 'Legend', overall: 97, charisma: 86, potential: 97 },
  { firstName: 'Brock', lastName: 'Lesnar', ringName: 'The Beast', gender: 'Male', nationality: 'United States', style: 'Power Wrestling', age: 28, rarity: 'Legend', overall: 96, charisma: 96, potential: 97 },
  { firstName: 'Kurt', lastName: 'Angle', ringName: 'The Wrestling Machine', gender: 'Male', nationality: 'United States', style: 'Olympic Wrestling', age: 27, rarity: 'Legend', overall: 96, charisma: 96, potential: 97 },
  { firstName: 'Dwayne', lastName: 'Johnson', ringName: 'The Rock', gender: 'Male', nationality: 'United States', style: 'Showman Brawler', age: 28, rarity: 'Legend', overall: 88, charisma: 100, potential: 99 },
  { firstName: 'John', lastName: 'Cena', ringName: 'The Franchise', gender: 'Male', nationality: 'United States', style: 'Powerhouse Showman', age: 27, rarity: 'Legend', overall: 89, charisma: 100, potential: 99 },
  { firstName: 'Joe', lastName: 'Anoaʻi', ringName: 'Roman Reigns', gender: 'Male', nationality: 'United States / Samoa', style: 'Powerhouse Wrestler', age: 28, rarity: 'Legend', overall: 91, charisma: 99, potential: 98 },
  { firstName: 'Cody', lastName: 'Rhodes', ringName: 'The American Nightmare', gender: 'Male', nationality: 'United States', style: 'Technical Showman', age: 28, rarity: 'Epic', overall: 88, charisma: 98, potential: 96 },
  { firstName: 'Colby', lastName: 'Lopez', ringName: 'Seth Rollins', gender: 'Male', nationality: 'United States', style: 'Hybrid Wrestler', age: 27, rarity: 'Epic', overall: 91, charisma: 96, potential: 96 },
  { firstName: 'Randy', lastName: 'Orton', ringName: 'The Viper', gender: 'Male', nationality: 'United States', style: 'Methodical Wrestler', age: 28, rarity: 'Legend', overall: 92, charisma: 97, potential: 97 },
  { firstName: 'Tyson', lastName: 'Smith', ringName: 'Kenny Omega', gender: 'Male', nationality: 'Canada', style: 'Elite Hybrid Wrestling', age: 28, rarity: 'Epic', overall: 94, charisma: 94, potential: 96 },
  { firstName: 'Maxwell', lastName: 'Friedman', ringName: 'MJF', gender: 'Male', nationality: 'United States', style: 'Technical Villain', age: 25, rarity: 'Epic', overall: 86, charisma: 100, potential: 98 },
  { firstName: 'Phil', lastName: 'Brooks', ringName: 'CM Punk', gender: 'Male', nationality: 'United States', style: 'Submission Showman', age: 28, rarity: 'Epic', overall: 84, charisma: 99, potential: 93 },
  { firstName: 'Kazuchika', lastName: 'Okada', ringName: 'The Rainmaker', gender: 'Male', nationality: 'Japan', style: 'Strong Style', age: 27, rarity: 'Legend', overall: 95, charisma: 94, potential: 97 },
  { firstName: 'Tetsuya', lastName: 'Naito', ringName: 'El Ingobernable', gender: 'Male', nationality: 'Japan', style: 'Strong Style Showman', age: 28, rarity: 'Epic', overall: 91, charisma: 96, potential: 95 },
  { firstName: 'Saúl', lastName: 'Álvarez', ringName: 'Canelo', gender: 'Male', nationality: 'Mexico', style: 'Counter Boxing', age: 27, rarity: 'Legend', overall: 98, charisma: 94, potential: 98 },
  { firstName: 'Oleksandr', lastName: 'Usyk', ringName: 'The Cat', gender: 'Male', nationality: 'Ukraine', style: 'Technical Boxing', age: 28, rarity: 'Legend', overall: 98, charisma: 86, potential: 98 },
  { firstName: 'Tyson', lastName: 'Fury', ringName: 'The Gypsy King', gender: 'Male', nationality: 'United Kingdom', style: 'Heavyweight Boxing', age: 28, rarity: 'Legend', overall: 96, charisma: 99, potential: 97 },
  { firstName: 'Anthony', lastName: 'Joshua', ringName: 'AJ', gender: 'Male', nationality: 'United Kingdom', style: 'Power Boxing', age: 27, rarity: 'Epic', overall: 93, charisma: 95, potential: 96 },
  { firstName: 'Terence', lastName: 'Crawford', ringName: 'Bud', gender: 'Male', nationality: 'United States', style: 'Switch-Hitting Boxing', age: 28, rarity: 'Legend', overall: 98, charisma: 86, potential: 98 },
  { firstName: 'Naoya', lastName: 'Inoue', ringName: 'The Monster', gender: 'Male', nationality: 'Japan', style: 'Precision Boxing', age: 26, rarity: 'Legend', overall: 98, charisma: 87, potential: 99 },
  { firstName: 'Valentina', lastName: 'Shevchenko', ringName: 'Bullet', gender: 'Female', nationality: 'Kyrgyzstan', style: 'Muay Thai All-Rounder', age: 27, rarity: 'Legend', overall: 97, charisma: 86, potential: 97 },
  { firstName: 'Cris', lastName: 'Justino', ringName: 'Cyborg', gender: 'Female', nationality: 'Brazil', style: 'Pressure Striker', age: 28, rarity: 'Legend', overall: 96, charisma: 88, potential: 96 },
  { firstName: 'Joanna', lastName: 'Jędrzejczyk', ringName: 'Joanna Champion', gender: 'Female', nationality: 'Poland', style: 'Muay Thai Volume', age: 27, rarity: 'Legend', overall: 96, charisma: 91, potential: 97 },
  { firstName: 'Zhang', lastName: 'Weili', ringName: 'Magnum', gender: 'Female', nationality: 'China', style: 'Explosive MMA', age: 27, rarity: 'Epic', overall: 95, charisma: 86, potential: 97 },
  { firstName: 'Rose', lastName: 'Namajunas', ringName: 'Thug Rose', gender: 'Female', nationality: 'United States', style: 'Technical Kickboxing', age: 25, rarity: 'Epic', overall: 93, charisma: 90, potential: 96 },
  { firstName: 'Holly', lastName: 'Holm', ringName: 'The Preacher’s Daughter', gender: 'Female', nationality: 'United States', style: 'Boxing & Kicks', age: 28, rarity: 'Epic', overall: 92, charisma: 87, potential: 94 },
  { firstName: 'Kayla', lastName: 'Harrison', ringName: 'The Olympian', gender: 'Female', nationality: 'United States', style: 'Olympic Judo', age: 27, rarity: 'Epic', overall: 94, charisma: 88, potential: 97 },
  { firstName: 'Rebecca', lastName: 'Quin', ringName: 'Becky Lynch', gender: 'Female', nationality: 'Ireland', style: 'Technical Showman', age: 27, rarity: 'Legend', overall: 87, charisma: 100, potential: 98 },
  { firstName: 'Mercedes', lastName: 'Varnado', ringName: 'Mercedes Moné', gender: 'Female', nationality: 'United States', style: 'Technical Wrestler', age: 26, rarity: 'Epic', overall: 89, charisma: 98, potential: 97 },
  { firstName: 'Ashley', lastName: 'Fliehr', ringName: 'Charlotte Flair', gender: 'Female', nationality: 'United States', style: 'Athletic Wrestler', age: 28, rarity: 'Legend', overall: 92, charisma: 97, potential: 97 },
  { firstName: 'Demi', lastName: 'Bennett', ringName: 'Rhea Ripley', gender: 'Female', nationality: 'Australia', style: 'Powerhouse Wrestler', age: 25, rarity: 'Epic', overall: 90, charisma: 98, potential: 99 },
  { firstName: 'Bianca', lastName: 'Crawford', ringName: 'Bianca Belair', gender: 'Female', nationality: 'United States', style: 'Elite Athlete', age: 26, rarity: 'Epic', overall: 90, charisma: 96, potential: 98 },
  { firstName: 'Pamela', lastName: 'Martinez', ringName: 'Bayley', gender: 'Female', nationality: 'United States', style: 'Technical Storyteller', age: 27, rarity: 'Epic', overall: 88, charisma: 96, potential: 96 },
  { firstName: 'Masami', lastName: 'Odate', ringName: 'Iyo Sky', gender: 'Female', nationality: 'Japan', style: 'Aerial Wrestler', age: 26, rarity: 'Epic', overall: 92, charisma: 90, potential: 97 },
  { firstName: 'Kanako', lastName: 'Urai', ringName: 'Asuka', gender: 'Female', nationality: 'Japan', style: 'Submission Striker', age: 28, rarity: 'Legend', overall: 93, charisma: 95, potential: 96 },
  { firstName: 'Melissa', lastName: 'Cervantes', ringName: 'Thunder Rosa', gender: 'Female', nationality: 'Mexico / United States', style: 'Brawler Wrestler', age: 27, rarity: 'Epic', overall: 87, charisma: 94, potential: 95 },
  { firstName: 'Brittany', lastName: 'Baker', ringName: 'Britt Baker', gender: 'Female', nationality: 'United States', style: 'Submission Showman', age: 26, rarity: 'Epic', overall: 84, charisma: 96, potential: 94 },
  { firstName: 'Saraya', lastName: 'Bevis', ringName: 'Saraya', gender: 'Female', nationality: 'United Kingdom', style: 'Technical Rebel', age: 26, rarity: 'Epic', overall: 86, charisma: 97, potential: 95 },
  { firstName: 'Mami', lastName: 'Yamashita', ringName: 'The Crimson Ace', gender: 'Female', nationality: 'Japan', style: 'Strong Style', age: 24, rarity: 'Epic', overall: 91, charisma: 88, potential: 98 },
  { firstName: 'Claressa', lastName: 'Shields', ringName: 'T-Rex', gender: 'Female', nationality: 'United States', style: 'Power Boxing', age: 25, rarity: 'Legend', overall: 97, charisma: 91, potential: 98 },
  { firstName: 'Katie', lastName: 'Taylor', ringName: 'The Bray Bomber', gender: 'Female', nationality: 'Ireland', style: 'Technical Boxing', age: 27, rarity: 'Legend', overall: 97, charisma: 90, potential: 97 },
  { firstName: 'Amanda', lastName: 'Serrano', ringName: 'The Real Deal', gender: 'Female', nationality: 'Puerto Rico', style: 'Pressure Boxing', age: 27, rarity: 'Legend', overall: 96, charisma: 91, potential: 97 },
  { firstName: 'Savannah', lastName: 'Marshall', ringName: 'Silent Assassin', gender: 'Female', nationality: 'United Kingdom', style: 'Long-Range Boxing', age: 26, rarity: 'Epic', overall: 92, charisma: 87, potential: 95 },
  { firstName: 'Mikaela', lastName: 'Mayer', ringName: 'The Technician', gender: 'Female', nationality: 'United States', style: 'Technical Boxing', age: 25, rarity: 'Epic', overall: 91, charisma: 89, potential: 96 },
  { firstName: 'Seniesa', lastName: 'Estrada', ringName: 'Super Bad', gender: 'Female', nationality: 'United States', style: 'Speed Boxing', age: 25, rarity: 'Epic', overall: 91, charisma: 92, potential: 96 },
  { firstName: 'Stamp', lastName: 'Fairtex', ringName: 'Stamp', gender: 'Female', nationality: 'Thailand', style: 'Muay Thai', age: 24, rarity: 'Epic', overall: 92, charisma: 96, potential: 98 },
  { firstName: 'Angela', lastName: 'Lee', ringName: 'Unstoppable', gender: 'Female', nationality: 'Singapore / Canada', style: 'Submission MMA', age: 24, rarity: 'Epic', overall: 92, charisma: 92, potential: 97 },
  { firstName: 'Tiffany', lastName: 'Stratton', ringName: 'The Prodigy', gender: 'Female', nationality: 'United States', style: 'Athletic Showman', age: 23, rarity: 'Epic', overall: 84, charisma: 95, potential: 99 },
  { firstName: 'Jade', lastName: 'Cargill', ringName: 'The Storm', gender: 'Female', nationality: 'United States', style: 'Powerhouse Showman', age: 26, rarity: 'Epic', overall: 85, charisma: 97, potential: 97 },
  { firstName: 'Giulia', lastName: 'Matsudo', ringName: 'The Beautiful Madness', gender: 'Female', nationality: 'Japan / Italy', style: 'Strong Style Wrestler', age: 24, rarity: 'Epic', overall: 91, charisma: 95, potential: 98 },
  { firstName: 'Mayu', lastName: 'Iwatani', ringName: 'The Icon', gender: 'Female', nationality: 'Japan', style: 'Elite Technical Wrestling', age: 26, rarity: 'Legend', overall: 94, charisma: 93, potential: 97 },
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
  'MMA All-Rounder', 'Pressure Boxing', 'Counter Boxing', 'Kickboxing', 'Muay Thai', 'Olympic Wrestling', 'Sambo Pressure',
  'Submission Grappling', 'Judo & Throws', 'Karate Countering', 'Powerhouse Wrestler', 'Technical Wrestler', 'Aerial Wrestler',
  'Strong Style', 'Brawler', 'Showman', 'Hybrid Wrestler', 'Knockout Power', 'Volume Striking', 'Defensive Technician',
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
    promotionId: null,
    isDraftEligible: true,
    isRetired: false,
    stats: emptyStats(),
    brandStats: {},
    yearStats: {},
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
    Legend: [90, 97, 86, 99],
    Epic: [82, 91, 76, 98],
    Rare: [73, 83, 63, 92],
    Uncommon: [62, 75, 52, 86],
    Common: [50, 66, 42, 80],
  }
  const [overallMin, overallMax, charismaMin, charismaMax] = rarityRanges[rarity]
  const overall = between(random, overallMin, overallMax)
  const charisma = between(random, charismaMin, charismaMax)
  const potential = Math.min(99, Math.max(overall, overall + between(random, 2, 11)))
  const shouldHaveRingName = random() > 0.48
  const ringName = shouldHaveRingName ? `${pick(random, RING_PREFIX)} ${pick(random, RING_NOUN)}` : undefined

  return {
    id: `${isDraftEligible ? 'star' : 'free'}-${index}-${slug(`${firstName}-${lastName}`)}`,
    firstName,
    lastName,
    ringName,
    gender,
    age: between(random, isDraftEligible ? 21 : 19, isDraftEligible ? 33 : 36),
    nationality: pick(random, NATIONALITIES),
    style: pick(random, STYLES),
    rarity,
    overall,
    charisma,
    potential,
    form: between(random, 43, 57),
    fame: 0,
    promotionId: null,
    isDraftEligible,
    isRetired: false,
    stats: emptyStats(),
    brandStats: {},
    yearStats: {},
  }
}

export function createFighterPool(seed: number): Fighter[] {
  const random = mulberry32(seed)
  const signatures = SIGNATURE_STARS.map(seedToFighter)
  const usedNames = new Set(signatures.map((fighter) => `${fighter.firstName}-${fighter.lastName}`))
  const premium: Fighter[] = [...signatures]

  while (premium.length < 160) {
    const index = premium.length
    const gender: Gender = index % 2 === 0 ? 'Male' : 'Female'
    const rarity: Rarity = index % 7 === 0 ? 'Legend' : 'Epic'
    premium.push(createGeneratedFighter(random, index, gender, rarity, true, usedNames))
  }

  const freeAgents: Fighter[] = []
  for (let index = 0; index < 180; index += 1) {
    const gender: Gender = index % 2 === 0 ? 'Female' : 'Male'
    const roll = random()
    const rarity: Rarity = roll < 0.22 ? 'Rare' : roll < 0.62 ? 'Uncommon' : 'Common'
    freeAgents.push(createGeneratedFighter(random, index + 160, gender, rarity, false, usedNames))
  }

  return [...premium, ...freeAgents]
}
