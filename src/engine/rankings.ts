import type { Fighter, GameState, Gender, Promotion } from '../types'

export function divisionForFighter(fighter: Fighter, promotion: Promotion): string {
  if (promotion.id === 'wwe' || promotion.id === 'aew' || promotion.id === 'tna') return 'Openweight'
  return fighter.weightClass
}

export function divisionKey(gender: Gender, division: string): string {
  return `${gender}:${division}`
}

export function monthsBetween(yearA: number, monthA: number, yearB: number, monthB: number): number {
  return (yearB - yearA) * 12 + (monthB - monthA)
}

export function weeksBetween(yearA: number, weekA: number, yearB: number, weekB: number): number {
  return (yearB - yearA) * 52 + (weekB - weekA)
}

export function weeksSinceLastFight(state: GameState, fighter: Fighter): number {
  if (fighter.lastFightYear == null) return 999
  if (fighter.lastFightWeek != null) return weeksBetween(fighter.lastFightYear, fighter.lastFightWeek, state.currentYear, state.currentWeek)
  if (fighter.lastFightMonth == null) return 999
  return Math.round(monthsBetween(fighter.lastFightYear, fighter.lastFightMonth, state.currentYear, state.currentMonth) * 4.333)
}

export function monthsSinceLastFight(state: GameState, fighter: Fighter): number {
  const weeks = weeksSinceLastFight(state, fighter)
  return weeks >= 999 ? 99 : weeks / 4.333
}

function brandStatsFor(fighter: Fighter, promotionId: string) {
  return fighter.brandStats[promotionId]
}

export function rankingScore(state: GameState, fighter: Fighter, promotion: Promotion): number {
  if (fighter.promotionId !== promotion.id || fighter.isRetired) return -9999
  const division = divisionForFighter(fighter, promotion)
  const brand = brandStatsFor(fighter, promotion.id)
  let score = 0

  const relevant = fighter.fightHistory
    .filter((fight) => fight.promotionId === promotion.id && fight.weightClass === division)
    .slice(0, 14)

  relevant.forEach((fight) => {
    const fightWeek = fight.week ?? Math.min(52, Math.max(1, Math.round(fight.month * 4.333) + 1))
    const ageMonths = Math.max(0, weeksBetween(fight.year, fightWeek, state.currentYear, state.currentWeek) / 4.333)
    const recency = Math.max(0.25, 1 - ageMonths / 30)
    const opponentQuality = fight.opponentRankBefore == null
      ? 1
      : Math.max(1, 12 - (fight.opponentRankBefore - 1) * 1.25)

    if (fight.result === 'W') {
      score += (17 + opponentQuality + fight.importance * 0.11 + (fight.upset ? 7 : 0)) * recency
      if (fight.titleChanged) score += 24 * recency
      if (fight.titleDefense) score += 13 * recency
    } else if (fight.result === 'L') {
      score -= (7 + Math.max(0, 5 - opponentQuality * 0.25)) * recency
      if (fight.titleBout) score += 2 * recency
    }
  })

  if (fighter.currentStreak > 0) score += Math.min(30, fighter.currentStreak * 6)
  if (fighter.currentStreak < 0) score += Math.max(-22, fighter.currentStreak * 5)
  score += (brand?.titles ?? 0) * 12 + (brand?.titleDefenses ?? 0) * 7

  const inactivity = monthsSinceLastFight(state, fighter)
  if (inactivity <= 4) score += 8
  else if (inactivity > 8 && inactivity < 99) score -= Math.min(38, (inactivity - 8) * 4)
  else if (inactivity >= 99 && fighter.stats.fights === 0) score -= 8

  // Fame is only a tiny tiebreaker: rankings are résumé-first, not popularity/OVR-first.
  score += Math.min(5, fighter.fame * 0.015)
  return Number(score.toFixed(2))
}

export interface RankedFighter {
  fighter: Fighter
  rank: number
  score: number
  isChampion: boolean
}

export function getDivisionRanking(
  state: GameState,
  promotion: Promotion,
  gender: Gender,
  division: string,
): RankedFighter[] {
  const key = divisionKey(gender, division)
  const championId = promotion.divisionChampions[key] ?? null
  const roster = state.fighters
    .filter((fighter) => fighter.promotionId === promotion.id && fighter.gender === gender && !fighter.isRetired)
    .filter((fighter) => divisionForFighter(fighter, promotion) === division)
    .sort((a, b) => rankingScore(state, b, promotion) - rankingScore(state, a, promotion) || b.form - a.form || b.fame - a.fame)

  const champion = roster.find((fighter) => fighter.id === championId)
  const contenders = roster.filter((fighter) => fighter.id !== championId)
  const ordered = champion ? [champion, ...contenders] : contenders
  let contenderRank = 1
  return ordered.map((fighter) => {
    const isChampion = fighter.id === championId
    return {
      fighter,
      rank: isChampion ? 0 : contenderRank++,
      score: rankingScore(state, fighter, promotion),
      isChampion,
    }
  })
}

export function getPromotionDivisions(state: GameState, promotion: Promotion): { gender: Gender; division: string }[] {
  const seen = new Set<string>()
  const divisions: { gender: Gender; division: string }[] = []
  state.fighters
    .filter((fighter) => fighter.promotionId === promotion.id && !fighter.isRetired)
    .forEach((fighter) => {
      const division = divisionForFighter(fighter, promotion)
      const key = divisionKey(fighter.gender, division)
      if (!seen.has(key)) {
        seen.add(key)
        divisions.push({ gender: fighter.gender, division })
      }
    })
  return divisions.sort((a, b) => a.gender.localeCompare(b.gender) || a.division.localeCompare(b.division))
}

export function currentRank(
  state: GameState,
  fighter: Fighter,
  promotion?: Promotion | null,
): number | null {
  if (!promotion || fighter.promotionId !== promotion.id) return null
  const division = divisionForFighter(fighter, promotion)
  const found = getDivisionRanking(state, promotion, fighter.gender, division).find((entry) => entry.fighter.id === fighter.id)
  return found?.rank ?? null
}

export function resumeLabel(score: number): string {
  if (score >= 120) return 'Elite résumé'
  if (score >= 75) return 'Title contention'
  if (score >= 35) return 'Ranked momentum'
  if (score >= 5) return 'Building résumé'
  return 'Unproven'
}
