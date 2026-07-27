export type Gender = 'Male' | 'Female'
export type Rarity = 'Legend' | 'Epic' | 'Rare' | 'Uncommon' | 'Common'
export type GamePhase = 'draft' | 'universe'

export interface CareerStatLine {
  fights: number
  wins: number
  losses: number
  draws: number
  finishes: number
  titles: number
  titleDefenses: number
  fameEarned: number
}

export interface BrandStatLine extends CareerStatLine {
  promotionId: string
  promotionName: string
}

export interface YearStatLine extends CareerStatLine {
  year: number
  promotionNames: string[]
}

export interface Fighter {
  id: string
  firstName: string
  lastName: string
  ringName?: string
  gender: Gender
  age: number
  nationality: string
  style: string
  rarity: Rarity
  overall: number
  charisma: number
  potential: number
  form: number
  fame: number
  promotionId: string | null
  isDraftEligible: boolean
  isRetired: boolean
  stats: CareerStatLine
  brandStats: Record<string, BrandStatLine>
  yearStats: Record<string, YearStatLine>
}

export interface TitleChange {
  id: string
  year: number
  month: number
  gender: Gender
  fighterId: string
  fighterName: string
  defeatedFighterId: string | null
  defeatedFighterName: string | null
  promotionName: string
}

export interface PromotionYearStat {
  year: number
  fame: number
  viewers: number
  revenue: number
  maleWins: number
  femaleWins: number
  maleTitles: number
  femaleTitles: number
  maleChampionName: string | null
  femaleChampionName: string | null
}

export interface Promotion {
  id: string
  name: string
  shortName: string
  archetype: string
  region: string
  competition: number
  entertainment: number
  risk: number
  tone: string
  color: string
  fame: number
  currentViewers: number
  totalViewers: number
  revenue: number
  currentChampions: Record<Gender, string | null>
  titleHistory: TitleChange[]
  yearStats: Record<string, PromotionYearStat>
}

export interface DraftPick {
  pickNumber: number
  round: number
  promotionId: string
  promotionName: string
  fighterId: string
  fighterName: string
  rarity: Rarity
  gender: Gender
}

export interface DraftState {
  rounds: number
  order: string[]
  currentPickIndex: number
  picks: DraftPick[]
}

export type ChronicleType =
  | 'draft'
  | 'event'
  | 'title'
  | 'signing'
  | 'record'
  | 'structural'

export interface ChronicleEntry {
  id: string
  year: number
  month: number
  type: ChronicleType
  headline: string
  body: string
  promotionIds: string[]
  fighterIds: string[]
  importance: number
}

export interface GameState {
  version: number
  id: string
  slotId: number
  universeName: string
  createdAt: string
  phase: GamePhase
  currentYear: number
  currentMonth: number
  seed: number
  promotions: Promotion[]
  fighters: Fighter[]
  draft: DraftState
  chronicles: ChronicleEntry[]
  totalEvents: number
}

export interface SaveSummary {
  slotId: number
  exists: boolean
  universeName?: string
  phase?: GamePhase
  year?: number
  month?: number
  promotions?: number
  fighters?: number
  updatedAt?: string
}

export type GameView =
  | 'universe'
  | 'promotions'
  | 'fighters'
  | 'market'
  | 'chronicles'
  | 'almanac'
  | 'editor'
