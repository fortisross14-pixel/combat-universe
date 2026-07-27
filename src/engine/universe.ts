import { createFighterPool, mulberry32, PROMOTION_SEEDS } from '../data/seed'
import type {
  ChronicleEntry,
  DraftPick,
  Fighter,
  GameState,
  Gender,
  Promotion,
  Rarity,
} from '../types'

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export function monthName(month: number): string {
  return MONTH_NAMES[month] ?? MONTH_NAMES[0]
}

export function fighterDisplayName(fighter: Fighter): string {
  return fighter.ringName
    ? `${fighter.ringName} — ${fighter.firstName} ${fighter.lastName}`
    : `${fighter.firstName} ${fighter.lastName}`
}

export function shortFighterName(fighter: Fighter): string {
  return fighter.ringName ?? `${fighter.firstName} ${fighter.lastName}`
}

export function createPromotions(): Promotion[] {
  return PROMOTION_SEEDS.map((promotion) => ({
    ...promotion,
    fame: 0,
    currentViewers: 0,
    totalViewers: 0,
    revenue: 0,
    currentChampions: { Male: null, Female: null },
    titleHistory: [],
    yearStats: {},
  }))
}

function shuffle<T>(values: T[], random: () => number): T[] {
  const result = [...values]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1))
    ;[result[index], result[other]] = [result[other], result[index]]
  }
  return result
}

export function createUniverse(slotId: number, universeName?: string): GameState {
  const seed = Math.floor(Date.now() % 2_000_000_000) + slotId * 7919
  const promotions = createPromotions()
  const random = mulberry32(seed)
  const order = shuffle(
    promotions.map((promotion) => promotion.id),
    random,
  )

  return {
    version: 1,
    id: `universe-${seed}-${slotId}`,
    slotId,
    universeName: universeName?.trim() || `Combat Universe ${slotId}`,
    createdAt: new Date().toISOString(),
    phase: 'draft',
    currentYear: 2026,
    currentMonth: 0,
    seed,
    promotions,
    fighters: createFighterPool(seed + 101),
    draft: {
      rounds: 20,
      order,
      currentPickIndex: 0,
      picks: [],
    },
    chronicles: [],
    totalEvents: 0,
  }
}

export function getDraftSequence(state: GameState): string[] {
  const sequence: string[] = []
  for (let round = 0; round < state.draft.rounds; round += 1) {
    const roundOrder = round % 2 === 0 ? state.draft.order : [...state.draft.order].reverse()
    sequence.push(...roundOrder)
  }
  return sequence
}

export function getCurrentDraftPromotion(state: GameState): Promotion | null {
  const sequence = getDraftSequence(state)
  const promotionId = sequence[state.draft.currentPickIndex]
  if (!promotionId) return null
  return state.promotions.find((promotion) => promotion.id === promotionId) ?? null
}

export function getDraftRound(state: GameState): number {
  return Math.floor(state.draft.currentPickIndex / state.draft.order.length) + 1
}

export function draftFighter(state: GameState, fighterId: string): GameState {
  if (state.phase !== 'draft') return state
  const currentPromotion = getCurrentDraftPromotion(state)
  if (!currentPromotion) return state

  const fighter = state.fighters.find((candidate) => candidate.id === fighterId)
  if (!fighter || !fighter.isDraftEligible || fighter.promotionId) return state

  const next = structuredClone(state)
  const nextFighter = next.fighters.find((candidate) => candidate.id === fighterId)
  const nextPromotion = next.promotions.find((promotion) => promotion.id === currentPromotion.id)
  if (!nextFighter || !nextPromotion) return state

  nextFighter.promotionId = nextPromotion.id
  const round = getDraftRound(state)
  const pick: DraftPick = {
    pickNumber: next.draft.currentPickIndex + 1,
    round,
    promotionId: nextPromotion.id,
    promotionName: nextPromotion.name,
    fighterId: nextFighter.id,
    fighterName: shortFighterName(nextFighter),
    rarity: nextFighter.rarity,
    gender: nextFighter.gender,
  }
  next.draft.picks.push(pick)
  next.draft.currentPickIndex += 1

  const totalPicks = next.draft.rounds * next.draft.order.length
  if (next.draft.currentPickIndex >= totalPicks) {
    next.phase = 'universe'
    const legendCount = next.draft.picks.filter((draftPick) => draftPick.rarity === 'Legend').length
    next.chronicles.unshift({
      id: `chronicle-draft-${next.id}`,
      year: next.currentYear,
      month: next.currentMonth,
      type: 'draft',
      headline: 'The Founding Draft reshapes combat history',
      body: `All eight promotions completed a 20-round snake draft. ${legendCount} Legend-tier stars and ${totalPicks - legendCount} Epic-tier stars now begin with zero career statistics, zero fame, and everything to prove.`,
      promotionIds: next.promotions.map((promotion) => promotion.id),
      fighterIds: [],
      importance: 100,
    })
  }

  return next
}

function rarityValue(rarity: Rarity): number {
  const values: Record<Rarity, number> = {
    Legend: 16,
    Epic: 10,
    Rare: 5,
    Uncommon: 2,
    Common: 0,
  }
  return values[rarity]
}

function styleFit(promotion: Promotion, fighter: Fighter): number {
  const style = fighter.style.toLowerCase()
  let score = 0
  if (promotion.id === 'matchroom' && style.includes('box')) score += 18
  if (promotion.id === 'karate' && (style.includes('karate') || style.includes('kick') || style.includes('muay'))) score += 15
  if (promotion.id === 'one' && (style.includes('muay') || style.includes('kick') || style.includes('judo'))) score += 12
  if ((promotion.id === 'ufc' || promotion.id === 'pfl') && (style.includes('mma') || style.includes('sambo') || style.includes('grappl'))) score += 13
  if ((promotion.id === 'wwe' || promotion.id === 'aew' || promotion.id === 'tna') && style.includes('wrestler')) score += 13
  return score
}

export function scoreDraftFit(state: GameState, promotion: Promotion, fighter: Fighter): number {
  const roster = state.fighters.filter((candidate) => candidate.promotionId === promotion.id)
  const genderCount = roster.filter((candidate) => candidate.gender === fighter.gender).length
  const oppositeCount = roster.length - genderCount
  const balanceBonus = genderCount < oppositeCount ? 13 : genderCount === oppositeCount ? 6 : -genderCount * 0.7
  const identityScore =
    fighter.overall * (promotion.competition / 100) +
    fighter.charisma * (promotion.entertainment / 100)
  return identityScore + fighter.potential * 0.2 + rarityValue(fighter.rarity) + balanceBonus + styleFit(promotion, fighter)
}

export function autoDraftCurrentPick(state: GameState): GameState {
  const promotion = getCurrentDraftPromotion(state)
  if (!promotion) return state
  const available = state.fighters.filter((fighter) => fighter.isDraftEligible && !fighter.promotionId)
  const best = [...available].sort(
    (a, b) => scoreDraftFit(state, promotion, b) - scoreDraftFit(state, promotion, a),
  )[0]
  return best ? draftFighter(state, best.id) : state
}

export function autoDraftPicks(state: GameState, count: number): GameState {
  let next = state
  for (let index = 0; index < count && next.phase === 'draft'; index += 1) {
    next = autoDraftCurrentPick(next)
  }
  return next
}

export function createChronicle(
  state: GameState,
  entry: Omit<ChronicleEntry, 'id' | 'year' | 'month'>,
): ChronicleEntry {
  return {
    ...entry,
    id: `chronicle-${state.currentYear}-${state.currentMonth}-${state.totalEvents}-${Math.random().toString(36).slice(2, 8)}`,
    year: state.currentYear,
    month: state.currentMonth,
  }
}

export function rosterForPromotion(state: GameState, promotionId: string, gender?: Gender): Fighter[] {
  return state.fighters.filter(
    (fighter) => fighter.promotionId === promotionId && !fighter.isRetired && (!gender || fighter.gender === gender),
  )
}

export function freeAgents(state: GameState, gender?: Gender): Fighter[] {
  return state.fighters.filter(
    (fighter) => !fighter.promotionId && !fighter.isDraftEligible && !fighter.isRetired && (!gender || fighter.gender === gender),
  )
}

export function moveFighter(state: GameState, fighterId: string, targetPromotionId: string): GameState {
  const next = structuredClone(state)
  const fighter = next.fighters.find((candidate) => candidate.id === fighterId)
  const target = next.promotions.find((promotion) => promotion.id === targetPromotionId)
  if (!fighter || !target) return state
  const previous = next.promotions.find((promotion) => promotion.id === fighter.promotionId)
  if (previous?.currentChampions[fighter.gender] === fighter.id) {
    previous.currentChampions[fighter.gender] = null
  }
  fighter.promotionId = target.id
  next.chronicles.unshift(
    createChronicle(next, {
      type: 'signing',
      headline: `${shortFighterName(fighter)} joins ${target.name}`,
      body: `${shortFighterName(fighter)} leaves ${previous?.name ?? 'free agency'} for ${target.name}. The move creates a new career chapter without rewriting any prior results.`,
      promotionIds: [previous?.id, target.id].filter((value): value is string => Boolean(value)),
      fighterIds: [fighter.id],
      importance: fighter.rarity === 'Legend' ? 88 : fighter.rarity === 'Epic' ? 74 : 55,
    }),
  )
  return next
}

export function renamePromotion(state: GameState, promotionId: string, name: string): GameState {
  const trimmed = name.trim()
  if (!trimmed) return state
  const next = structuredClone(state)
  const promotion = next.promotions.find((candidate) => candidate.id === promotionId)
  if (!promotion) return state
  const oldName = promotion.name
  promotion.name = trimmed
  promotion.shortName = trimmed.length <= 5 ? trimmed.toUpperCase() : trimmed.slice(0, 4).toUpperCase()
  next.chronicles.unshift(
    createChronicle(next, {
      type: 'structural',
      headline: `${oldName} becomes ${trimmed}`,
      body: `The promotion enters a new institutional era under the ${trimmed} name. Its championships and complete historical lineage remain intact.`,
      promotionIds: [promotion.id],
      fighterIds: [],
      importance: 62,
    }),
  )
  return next
}

export function updatePromotionIdentity(
  state: GameState,
  promotionId: string,
  values: Pick<Promotion, 'competition' | 'entertainment' | 'risk' | 'tone'>,
): GameState {
  const next = structuredClone(state)
  const promotion = next.promotions.find((candidate) => candidate.id === promotionId)
  if (!promotion) return state
  promotion.competition = values.competition
  promotion.entertainment = values.entertainment
  promotion.risk = values.risk
  promotion.tone = values.tone
  next.chronicles.unshift(
    createChronicle(next, {
      type: 'structural',
      headline: `${promotion.name} changes its identity`,
      body: `${promotion.name} now operates at ${values.competition}% competitive intensity and ${values.entertainment}% entertainment intensity, adopting a ${values.tone.toLowerCase()} presentation.`,
      promotionIds: [promotion.id],
      fighterIds: [],
      importance: 58,
    }),
  )
  return next
}

export function mergePromotions(
  state: GameState,
  firstId: string,
  secondId: string,
  newName: string,
): GameState {
  if (firstId === secondId || state.promotions.length <= 2) return state
  const next = structuredClone(state)
  const first = next.promotions.find((promotion) => promotion.id === firstId)
  const second = next.promotions.find((promotion) => promotion.id === secondId)
  if (!first || !second) return state

  const mergedId = `merged-${Date.now().toString(36)}`
  const name = newName.trim() || `${first.name} ${second.name}`
  const merged: Promotion = {
    id: mergedId,
    name,
    shortName: name.slice(0, 4).toUpperCase(),
    archetype: 'Merged combat superpower',
    region: first.region === second.region ? first.region : 'Global',
    competition: Math.round((first.competition + second.competition) / 2),
    entertainment: Math.round((first.entertainment + second.entertainment) / 2),
    risk: Math.round((first.risk + second.risk) / 2),
    tone: 'Unified spectacle',
    color: first.color,
    fame: first.fame + second.fame,
    currentViewers: first.currentViewers + second.currentViewers,
    totalViewers: first.totalViewers + second.totalViewers,
    revenue: first.revenue + second.revenue,
    currentChampions: { Male: null, Female: null },
    titleHistory: [...first.titleHistory, ...second.titleHistory],
    yearStats: {},
  }

  ;(['Male', 'Female'] as Gender[]).forEach((gender) => {
    const candidates = [first.currentChampions[gender], second.currentChampions[gender]]
      .map((fighterId) => next.fighters.find((fighter) => fighter.id === fighterId))
      .filter((fighter): fighter is Fighter => Boolean(fighter))
      .sort((a, b) => b.fame - a.fame || b.overall - a.overall)
    merged.currentChampions[gender] = candidates[0]?.id ?? null
  })

  next.fighters.forEach((fighter) => {
    if (fighter.promotionId === firstId || fighter.promotionId === secondId) fighter.promotionId = mergedId
  })
  next.promotions = next.promotions.filter((promotion) => promotion.id !== firstId && promotion.id !== secondId)
  next.promotions.push(merged)
  next.chronicles.unshift(
    createChronicle(next, {
      type: 'structural',
      headline: `${first.name} and ${second.name} merge into ${name}`,
      body: `Two championship lineages and rival rosters now share one organization. The merger immediately changes the battle for talent, fame, viewers, and revenue.`,
      promotionIds: [mergedId],
      fighterIds: [],
      importance: 96,
    }),
  )
  return next
}

export function splitPromotion(state: GameState, sourceId: string, newName: string): GameState {
  const next = structuredClone(state)
  const source = next.promotions.find((promotion) => promotion.id === sourceId)
  if (!source) return state
  const roster = next.fighters
    .filter((fighter) => fighter.promotionId === sourceId)
    .sort((a, b) => b.fame - a.fame || b.overall - a.overall)
  if (roster.length < 8) return state

  const id = `split-${Date.now().toString(36)}`
  const name = newName.trim() || `${source.name} Alliance`
  const splinter: Promotion = {
    ...structuredClone(source),
    id,
    name,
    shortName: name.slice(0, 4).toUpperCase(),
    archetype: `Splinter from ${source.name}`,
    competition: Math.min(100, source.competition + 8),
    entertainment: Math.max(0, source.entertainment - 5),
    fame: 0,
    currentViewers: 0,
    totalViewers: 0,
    revenue: 0,
    currentChampions: { Male: null, Female: null },
    titleHistory: [],
    yearStats: {},
  }

  const movingIds = new Set(roster.filter((_, index) => index % 2 === 1).map((fighter) => fighter.id))
  next.fighters.forEach((fighter) => {
    if (movingIds.has(fighter.id)) fighter.promotionId = id
  })
  ;(['Male', 'Female'] as Gender[]).forEach((gender) => {
    if (source.currentChampions[gender] && movingIds.has(source.currentChampions[gender]!)) {
      source.currentChampions[gender] = null
    }
  })
  next.promotions.push(splinter)
  next.chronicles.unshift(
    createChronicle(next, {
      type: 'structural',
      headline: `${name} breaks away from ${source.name}`,
      body: `${movingIds.size} fighters leave in a historic split. Both organizations retain their prior records, but the new company begins at zero fame, viewers, and revenue.`,
      promotionIds: [source.id, splinter.id],
      fighterIds: [...movingIds].slice(0, 8),
      importance: 91,
    }),
  )
  return next
}
