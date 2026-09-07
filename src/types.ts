export type Gender = 'Male' | 'Female'
export type Rarity = 'Generational' | 'Legend' | 'Epic' | 'Rare' | 'Uncommon' | 'Common'
export type GamePhase = 'draft' | 'universe'
export type Discipline = 'MMA' | 'Boxing' | 'Kickboxing' | 'Wrestling'
export type SocialPersonality = 'Fighter' | 'Rebel' | 'Classy' | 'Villain' | 'Showman' | 'Humble'
export type CompetitivePersonality = 'Fearless' | 'Calculated' | 'Opportunist' | 'Loyal' | 'Money-Driven' | 'Legacy-Driven'
export type CareerArc = 'Prodigy' | 'Early Peak' | 'Balanced' | 'Late Bloomer' | 'Evergreen'

export interface CombatAttributes {
  power: number
  speed: number
  technique: number
  wrestling: number
  submissions: number
  chin: number
  cardio: number
  athleticism: number
}

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

export interface FightHistoryEntry {
  id: string
  eventId: string
  year: number
  month: number
  week?: number
  promotionId: string
  promotionName: string
  opponentId: string
  opponentName: string
  result: 'W' | 'L' | 'D'
  method: string
  titleBout: boolean
  titleChanged: boolean
  titleDefense: boolean
  upset: boolean
  importance: number
  fightRating?: number
  audience?: number
  ppvBuys?: number
  weightClass: string
  rankBefore: number | null
  opponentRankBefore: number | null
  rivalryScoreAfter: number
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
  discipline: Discipline
  weightClass: string
  rarity: Rarity
  overall: number
  charisma: number
  potential: number
  form: number
  fame: number
  legacy: number
  socialPersonality: SocialPersonality
  competitivePersonality: CompetitivePersonality
  careerArc: CareerArc
  primeAge: number
  attributes: CombatAttributes
  promotionId: string | null
  isDraftEligible: boolean
  isRetired: boolean
  lastFightYear: number | null
  lastFightMonth: number | null
  lastFightWeek?: number | null
  retiredYear?: number | null
  currentStreak: number
  stats: CareerStatLine
  brandStats: Record<string, BrandStatLine>
  yearStats: Record<string, YearStatLine>
  fightHistory: FightHistoryEntry[]
}

export interface TitleChange {
  id: string
  year: number
  month: number
  week?: number
  gender: Gender
  weightClass: string
  fighterId: string
  fighterName: string
  defeatedFighterId: string | null
  defeatedFighterName: string | null
  promotionName: string
  defenses?: number
  reignEndYear?: number | null
  reignEndWeek?: number | null
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
  divisionChampions: Record<string, string | null>
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
  | 'rivalry'
  | 'ranking'
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

export interface Rivalry {
  id: string
  fighterAId: string
  fighterBId: string
  fighterAName: string
  fighterBName: string
  meetings: number
  winsA: number
  winsB: number
  draws: number
  titleFights: number
  finishes: number
  upsets: number
  score: number
  peakImportance: number
  firstYear: number
  lastYear: number
  lastMonth: number
  promotionIds: string[]
}

export interface EventBout {
  fightId: string
  fighterAId: string
  fighterBId: string
  fighterAName: string
  fighterBName: string
  winnerId: string
  winnerName: string
  loserId: string
  loserName: string
  method: string
  titleBout: boolean
  titleChanged: boolean
  titleDefense: boolean
  upset: boolean
  importance: number
  fightRating: number
  audience: number
  ppvBuys: number
  weightClass: string
}

export interface CombatEvent {
  id: string
  year: number
  month: number
  week: number
  promotionId: string
  promotionName: string
  name: string
  bouts: EventBout[]
  headlineFightId: string | null
  eventRating: number
  qualityRating: number
  audience: number
  ppvBuys: number
}

export interface AnnualAward {
  id: string
  year: number
  category: 'Fighter of the Year' | 'Fight of the Year' | 'Breakthrough Fighter' | 'Upset of the Year' | 'Most Famous Fighter'
  fighterIds: string[]
  fighterNames: string[]
  description: string
}

export interface YearRankingEntry {
  fighterId: string
  fighterName: string
  score: number
  wins: number
  losses: number
  titles: number
  titleDefenses: number
  fameEarned: number
}

export interface PromotionMove {
  fighterId: string
  fighterName: string
  fromPromotionId: string | null
  fromPromotionName: string
  toPromotionId: string
  toPromotionName: string
}

export interface YearSummary {
  year: number
  topFighters: YearRankingEntry[]
  topFightIds: string[]
  topQualityFightIds: string[]
  topAudienceFightIds: string[]
  topEventIds: string[]
  topQualityEventIds: string[]
  topAudienceEventIds: string[]
  topPromotionId: string | null
  topPromotionName: string
  topPromotionScore: number
  retiredFighterIds: string[]
  retiredFighterNames: string[]
  newProspectIds: string[]
  newProspectNames: string[]
  promotionMoves: PromotionMove[]
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
  currentWeek: number
  seed: number
  promotions: Promotion[]
  fighters: Fighter[]
  draft: DraftState
  chronicles: ChronicleEntry[]
  rivalries: Rivalry[]
  events: CombatEvent[]
  awards: AnnualAward[]
  yearSummaries: YearSummary[]
  totalEvents: number
}

export interface SaveSummary {
  slotId: number
  exists: boolean
  universeName?: string
  phase?: GamePhase
  year?: number
  month?: number
  week?: number
  promotions?: number
  fighters?: number
  updatedAt?: string
}

export type GameView =
  | 'universe'
  | 'promotions'
  | 'fighters'
  | 'rankings'
  | 'yearbook'
  | 'hall'
  | 'market'
  | 'chronicles'
  | 'almanac'
  | 'editor'
