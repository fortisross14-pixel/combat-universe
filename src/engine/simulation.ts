import type {
  AnnualAward,
  BrandStatLine,
  CareerArc,
  CareerStatLine,
  CombatEvent,
  EventBout,
  Fighter,
  GameState,
  Gender,
  Promotion,
  PromotionYearStat,
  Rarity,
  Rivalry,
  YearStatLine,
  YearSummary,
  PromotionMove,
} from '../types'
import { createProspectClass } from '../data/seed'
import {
  currentRank,
  divisionForFighter,
  divisionKey,
  getDivisionRanking,
  getPromotionDivisions,
  monthsSinceLastFight,
  weeksSinceLastFight,
  rankingScore,
} from './rankings'
import {
  createChronicle,
  freeAgents,
  monthName,
  rosterForPromotion,
  shortFighterName,
} from './universe'

const GENDERS: Gender[] = ['Male', 'Female']

const rarityFame: Record<Rarity, number> = {
  Generational: 11,
  Legend: 8,
  Epic: 5,
  Rare: 3,
  Uncommon: 1.5,
  Common: 0.5,
}

const socialFameMultiplier = {
  Fighter: 1.08,
  Rebel: 1.2,
  Classy: 1.05,
  Villain: 1.28,
  Showman: 1.35,
  Humble: 0.92,
} as const

const emptyCareerStats = (): CareerStatLine => ({
  fights: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  finishes: 0,
  titles: 0,
  titleDefenses: 0,
  fameEarned: 0,
})

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function isWrestlingPromotion(promotion: Promotion): boolean {
  return promotion.id === 'wwe' || promotion.id === 'aew' || promotion.id === 'tna'
}

function styleFamily(style: string): 'grappler' | 'wrestler' | 'striker' | 'power-striker' | 'all-rounder' {
  const s = style.toLowerCase()
  if (s.includes('all-rounder') || s.includes('boxer-wrestler')) return 'all-rounder'
  if (s.includes('submission') || s.includes('sambo') || s.includes('judo') || s.includes('grappler') || s.includes('scramble')) return 'grappler'
  if (s.includes('wrestler') || s.includes('wrestling')) return 'wrestler'
  if (s.includes('power') || s.includes('knockout')) return 'power-striker'
  return 'striker'
}

function styleAffinity(style: string, opponentStyle: string): number {
  const a = styleFamily(style)
  const b = styleFamily(opponentStyle)
  let edge = 0
  if ((a === 'grappler' || a === 'wrestler') && (b === 'striker' || b === 'power-striker')) edge += a === 'grappler' ? 6.5 : 5.2
  if ((a === 'striker' || a === 'power-striker') && (b === 'grappler' || b === 'wrestler')) edge -= b === 'grappler' ? 3.8 : 2.8
  if (a === 'grappler' && b === 'wrestler') edge += 1.8
  if (a === 'wrestler' && b === 'grappler') edge += 0.5
  if (a === 'all-rounder') edge += 1.5
  const styleText = style.toLowerCase()
  const opponentText = opponentStyle.toLowerCase()
  if (styleText.includes('counter') && opponentText.includes('pressure')) edge += 3.2
  if (styleText.includes('movement') && opponentText.includes('power')) edge += 2.4
  if (styleText.includes('volume') && opponentText.includes('movement')) edge += 1.6
  return edge
}

function careerFitMultiplier(fighter: Fighter): number {
  const distance = fighter.age - fighter.primeAge
  const primeHalfWindow = fighter.rarity === 'Generational' ? 1 : fighter.rarity === 'Legend' ? 1.5 : fighter.careerArc === 'Evergreen' ? 2 : 1.5
  const peak = fighter.rarity === 'Generational' ? 1.045 : fighter.rarity === 'Legend' ? 1.025 : fighter.rarity === 'Epic' ? 1.01 : 1.0
  if (Math.abs(distance) <= primeHalfWindow) return peak
  if (distance < -primeHalfWindow) {
    const yearsEarly = Math.abs(distance) - primeHalfWindow
    const growthSlope = fighter.careerArc === 'Prodigy' ? 0.015 : fighter.careerArc === 'Late Bloomer' ? 0.032 : 0.023
    return Math.max(0.88, peak - yearsEarly * growthSlope)
  }
  const yearsLate = distance - primeHalfWindow
  const declineSlope = fighter.careerArc === 'Evergreen' ? 0.018 : fighter.careerArc === 'Late Bloomer' ? 0.024 : fighter.careerArc === 'Early Peak' ? 0.045 : 0.032
  return Math.max(0.82, peak - yearsLate * declineSlope)
}

function ensureBrandStats(fighter: Fighter, promotion: Promotion): BrandStatLine {
  if (!fighter.brandStats[promotion.id]) {
    fighter.brandStats[promotion.id] = {
      promotionId: promotion.id,
      promotionName: promotion.name,
      ...emptyCareerStats(),
    }
  }
  fighter.brandStats[promotion.id].promotionName = promotion.name
  return fighter.brandStats[promotion.id]
}

function ensureYearStats(fighter: Fighter, year: number, promotion: Promotion): YearStatLine {
  const key = String(year)
  if (!fighter.yearStats[key]) {
    fighter.yearStats[key] = {
      year,
      promotionNames: [promotion.name],
      ...emptyCareerStats(),
    }
  }
  if (!fighter.yearStats[key].promotionNames.includes(promotion.name)) fighter.yearStats[key].promotionNames.push(promotion.name)
  return fighter.yearStats[key]
}

function applyStatDelta(fighter: Fighter, promotion: Promotion, year: number, delta: Partial<CareerStatLine>): void {
  const brand = ensureBrandStats(fighter, promotion)
  const yearStats = ensureYearStats(fighter, year, promotion)
  ;(Object.keys(delta) as (keyof CareerStatLine)[]).forEach((key) => {
    const amount = delta[key] ?? 0
    fighter.stats[key] += amount
    brand[key] += amount
    yearStats[key] += amount
  })
}

function personalityFightEdge(fighter: Fighter, opponent: Fighter, titleBout: boolean, importance: number): number {
  let edge = 0
  if (fighter.competitivePersonality === 'Fearless' && importance >= 65) edge += 2.2
  if (fighter.competitivePersonality === 'Legacy-Driven' && titleBout) edge += 1.8
  if (fighter.competitivePersonality === 'Calculated') edge += Math.max(-1.5, Math.min(1.5, styleAffinity(fighter.style, opponent.style) * 0.35))
  if (fighter.socialPersonality === 'Fighter' && fighter.currentStreak < 0) edge += 1.2
  return edge
}

function competitivePower(fighter: Fighter, opponent: Fighter, promotion: Promotion, titleBout: boolean, importance: number): number {
  const a = fighter.attributes
  if (isWrestlingPromotion(promotion)) {
    return (
      fighter.overall * 0.35 +
      fighter.charisma * 0.32 +
      fighter.form * 0.17 +
      Math.sqrt(Math.max(0, fighter.fame)) * 2.4 +
      Math.max(0, fighter.currentStreak) * 1.2 +
      personalityFightEdge(fighter, opponent, titleBout, importance)
    )
  }

  let skill = 0
  if (promotion.id === 'matchroom') {
    skill = a.power * 0.23 + a.speed * 0.2 + a.technique * 0.27 + a.chin * 0.14 + a.cardio * 0.16
  } else if (promotion.id === 'karate') {
    skill = a.power * 0.19 + a.speed * 0.23 + a.technique * 0.25 + a.chin * 0.13 + a.cardio * 0.14 + a.athleticism * 0.06
  } else {
    skill = a.power * 0.12 + a.speed * 0.11 + a.technique * 0.18 + a.wrestling * 0.15 + a.submissions * 0.12 + a.chin * 0.1 + a.cardio * 0.12 + a.athleticism * 0.1
  }
  return skill * careerFitMultiplier(fighter) + fighter.form * 0.12 + styleAffinity(fighter.style, opponent.style) + personalityFightEdge(fighter, opponent, titleBout, importance)
}

function chooseWinner(first: Fighter, second: Fighter, promotion: Promotion, titleBout: boolean, importance: number): Fighter {
  const firstPower = competitivePower(first, second, promotion, titleBout, importance) + randomBetween(-6.5, 6.5)
  const secondPower = competitivePower(second, first, promotion, titleBout, importance) + randomBetween(-6.5, 6.5)
  const difference = firstPower - secondPower
  const firstChance = 1 / (1 + Math.exp(-difference / 9.5))
  return Math.random() < firstChance ? first : second
}

function fightMethod(winner: Fighter, loser: Fighter, promotion: Promotion): string {
  const winnerFamily = styleFamily(winner.style)
  const loserFamily = styleFamily(loser.style)
  const submissionEdge = winner.attributes.submissions - loser.attributes.wrestling * 0.42
  const koEdge = winner.attributes.power - loser.attributes.chin * 0.52
  let submissionChance = Math.max(0.05, Math.min(0.38, 0.11 + submissionEdge / 165))
  let koChance = Math.max(0.12, Math.min(0.5, 0.24 + koEdge / 145 + promotion.risk / 100 * 0.06))
  if (winnerFamily === 'grappler') submissionChance += loserFamily === 'striker' || loserFamily === 'power-striker' ? 0.18 : 0.08
  if (winnerFamily === 'wrestler') submissionChance += loserFamily === 'striker' || loserFamily === 'power-striker' ? 0.07 : 0.02
  if (winnerFamily === 'power-striker') koChance += 0.15
  if (winnerFamily === 'striker') koChance += 0.06
  submissionChance = Math.min(0.58, submissionChance)
  koChance = Math.min(0.62, koChance)
  const roll = Math.random()
  if (roll < submissionChance) return 'Submission'
  if (roll < submissionChance + koChance) return Math.random() < 0.58 ? 'KO' : 'TKO'
  return 'Decision'
}


function clampRating(value: number): number {
  return Math.max(1, Math.min(100, Math.round(value)))
}

function ppvFactor(promotion: Promotion): number {
  if (promotion.id === 'matchroom') return 0.58
  if (promotion.id === 'ufc') return 0.5
  if (promotion.id === 'pfl') return 0.34
  if (promotion.id === 'one') return 0.3
  if (promotion.id === 'karate') return 0.24
  if (isWrestlingPromotion(promotion)) return 0.17
  return 0.25
}

function fightAudienceMillions(first: Fighter, second: Fighter, promotion: Promotion, importance: number, titleBout: boolean): number {
  const personalityBuzz = [first, second].reduce((sum, fighter) => sum + (fighter.socialPersonality === 'Showman' ? 0.12 : fighter.socialPersonality === 'Villain' ? 0.09 : fighter.socialPersonality === 'Rebel' ? 0.06 : 0), 0)
  const value = 0.06 + promotion.fame * 0.018 + (first.fame + second.fame) * 0.012 + importance * 0.0065 + (titleBout ? 0.18 : 0) + personalityBuzz
  return Number(Math.max(0.03, value).toFixed(2))
}

function fightQualityRating(first: Fighter, second: Fighter, promotion: Promotion, titleBout: boolean, importance: number, method: string, upset: boolean, rivalryScore: number): number {
  const firstSkill = competitivePower(first, second, promotion, titleBout, importance)
  const secondSkill = competitivePower(second, first, promotion, titleBout, importance)
  const competitiveBalance = Math.max(0, 20 - Math.abs(firstSkill - secondSkill) * 1.15)
  const finishBonus = method === 'Decision' ? 0 : 4
  const score = 37 + competitiveBalance + importance * 0.28 + rivalryScore * 0.09 + finishBonus + (upset ? 6 : 0)
  return clampRating(score)
}

function getRivalry(state: GameState, firstId: string, secondId: string): Rivalry | undefined {
  return state.rivalries.find((rivalry) =>
    (rivalry.fighterAId === firstId && rivalry.fighterBId === secondId) ||
    (rivalry.fighterAId === secondId && rivalry.fighterBId === firstId),
  )
}

function rivalryHeat(first: Fighter, second: Fighter): number {
  const socialHeat = (fighter: Fighter) => fighter.socialPersonality === 'Villain' ? 6 : fighter.socialPersonality === 'Rebel' ? 5 : fighter.socialPersonality === 'Showman' ? 4 : fighter.socialPersonality === 'Fighter' ? 2 : 1
  const competitiveHeat = (fighter: Fighter) => fighter.competitivePersonality === 'Fearless' ? 3 : fighter.competitivePersonality === 'Legacy-Driven' ? 3 : 1
  return socialHeat(first) + socialHeat(second) + competitiveHeat(first) + competitiveHeat(second)
}

function updateRivalry(
  state: GameState,
  first: Fighter,
  second: Fighter,
  winner: Fighter,
  promotion: Promotion,
  titleBout: boolean,
  finish: boolean,
  upset: boolean,
  importance: number,
  firstRank: number | null,
  secondRank: number | null,
): { rivalry: Rivalry; previousScore: number } {
  let rivalry = getRivalry(state, first.id, second.id)
  const previousScore = rivalry?.score ?? 0
  const closeRanks = firstRank != null && secondRank != null && Math.abs(firstRank - secondRank) <= 2
  const increment = 5 + (rivalry ? 8 : 0) + (titleBout ? 18 : 0) + (finish ? 4 : 0) + (upset ? 7 : 0) + (closeRanks ? 6 : 0) + Math.min(13, importance / 8) + rivalryHeat(first, second)

  if (!rivalry) {
    const ordered = [first, second].sort((a, b) => a.id.localeCompare(b.id))
    rivalry = {
      id: `rivalry-${ordered[0].id}-${ordered[1].id}`,
      fighterAId: ordered[0].id,
      fighterBId: ordered[1].id,
      fighterAName: shortFighterName(ordered[0]),
      fighterBName: shortFighterName(ordered[1]),
      meetings: 0,
      winsA: 0,
      winsB: 0,
      draws: 0,
      titleFights: 0,
      finishes: 0,
      upsets: 0,
      score: 0,
      peakImportance: 0,
      firstYear: state.currentYear,
      lastYear: state.currentYear,
      lastMonth: state.currentMonth,
      promotionIds: [],
    }
    state.rivalries.push(rivalry)
  }

  rivalry.meetings += 1
  if (winner.id === rivalry.fighterAId) rivalry.winsA += 1
  else rivalry.winsB += 1
  if (titleBout) rivalry.titleFights += 1
  if (finish) rivalry.finishes += 1
  if (upset) rivalry.upsets += 1
  rivalry.score = Math.min(100, Math.round(rivalry.score + increment))
  rivalry.peakImportance = Math.max(rivalry.peakImportance, importance)
  rivalry.lastYear = state.currentYear
  rivalry.lastMonth = state.currentMonth
  if (!rivalry.promotionIds.includes(promotion.id)) rivalry.promotionIds.push(promotion.id)
  return { rivalry, previousScore }
}

function importanceBeforeFight(state: GameState, promotion: Promotion, first: Fighter, second: Fighter, titleBout: boolean): number {
  const firstRank = currentRank(state, first, promotion)
  const secondRank = currentRank(state, second, promotion)
  const rivalry = getRivalry(state, first.id, second.id)
  let importance = 22
  if (titleBout) importance += 36
  if ((firstRank === 0 || (firstRank != null && firstRank <= 3)) && (secondRank === 0 || (secondRank != null && secondRank <= 3))) importance += 12
  importance += Math.min(15, (first.fame + second.fame) * 0.035)
  importance += Math.min(17, (rivalry?.score ?? 0) * 0.2)
  if (Math.abs(first.currentStreak) >= 4 || Math.abs(second.currentStreak) >= 4) importance += 5
  if (first.rarity === 'Generational' || second.rarity === 'Generational') importance += 4
  return Math.min(96, Math.round(importance))
}

function personalityFameBonus(fighter: Fighter, opponent: Fighter, importance: number): number {
  let multiplier = socialFameMultiplier[fighter.socialPersonality]
  if (fighter.competitivePersonality === 'Money-Driven' && opponent.fame >= 50) multiplier += 0.1
  if (fighter.competitivePersonality === 'Legacy-Driven' && importance >= 70) multiplier += 0.06
  return multiplier
}

function refreshFlagshipChampion(state: GameState, promotion: Promotion, gender: Gender): void {
  const championIds = Object.entries(promotion.divisionChampions)
    .filter(([key, id]) => key.startsWith(`${gender}:`) && Boolean(id))
    .map(([, id]) => id as string)
  const champion = championIds
    .map((id) => state.fighters.find((fighter) => fighter.id === id))
    .filter((fighter): fighter is Fighter => Boolean(fighter))
    .sort((a, b) => b.fame - a.fame || b.legacy - a.legacy)[0]
  promotion.currentChampions[gender] = champion?.id ?? null
}

interface BoutResult extends EventBout {
  winner: Fighter
  loser: Fighter
  headline: string
  body: string
  rivalry: Rivalry
  rivalryMilestone: boolean
}

function simulateBout(
  state: GameState,
  promotion: Promotion,
  first: Fighter,
  second: Fighter,
  titleBout: boolean,
  eventId: string,
): BoutResult {
  const division = divisionForFighter(first, promotion)
  const key = divisionKey(first.gender, division)
  const championId = promotion.divisionChampions[key] ?? null
  const firstRank = currentRank(state, first, promotion)
  const secondRank = currentRank(state, second, promotion)
  const importance = importanceBeforeFight(state, promotion, first, second, titleBout)
  const winner = chooseWinner(first, second, promotion, titleBout, importance)
  const loser = winner.id === first.id ? second : first
  const method = fightMethod(winner, loser, promotion)
  const finish = method !== 'Decision'
  const favorite = competitivePower(first, second, promotion, titleBout, importance) >= competitivePower(second, first, promotion, titleBout, importance) ? first : second
  const upset = favorite.id !== winner.id && favorite.overall - winner.overall >= 3

  applyStatDelta(winner, promotion, state.currentYear, { fights: 1, wins: 1, finishes: finish ? 1 : 0 })
  applyStatDelta(loser, promotion, state.currentYear, { fights: 1, losses: 1 })
  winner.currentStreak = winner.currentStreak >= 0 ? winner.currentStreak + 1 : 1
  loser.currentStreak = loser.currentStreak <= 0 ? loser.currentStreak - 1 : -1
  winner.lastFightYear = loser.lastFightYear = state.currentYear
  winner.lastFightMonth = loser.lastFightMonth = state.currentMonth
  winner.lastFightWeek = loser.lastFightWeek = state.currentWeek

  let titleChanged = false
  let titleDefense = false
  let titleFame = 0
  if (titleBout) {
    if (!championId || winner.id !== championId) {
      const defeatedChampion = championId ? state.fighters.find((fighter) => fighter.id === championId) ?? null : null
      const previousReign = promotion.titleHistory.find((title) => title.gender === winner.gender && title.weightClass === division && title.reignEndYear == null)
      if (previousReign) {
        previousReign.reignEndYear = state.currentYear
        previousReign.reignEndWeek = state.currentWeek
      }
      promotion.divisionChampions[key] = winner.id
      titleChanged = true
      titleFame += 15
      applyStatDelta(winner, promotion, state.currentYear, { titles: 1 })
      promotion.titleHistory.unshift({
        id: `title-${promotion.id}-${state.currentYear}-${state.currentWeek}-${winner.id}-${state.totalEvents}-${promotion.titleHistory.length}`,
        year: state.currentYear,
        month: state.currentMonth,
        week: state.currentWeek,
        gender: winner.gender,
        weightClass: division,
        fighterId: winner.id,
        fighterName: shortFighterName(winner),
        defeatedFighterId: defeatedChampion?.id ?? null,
        defeatedFighterName: defeatedChampion ? shortFighterName(defeatedChampion) : null,
        promotionName: promotion.name,
        defenses: 0,
        reignEndYear: null,
        reignEndWeek: null,
      })
    } else {
      titleDefense = true
      titleFame += 8
      applyStatDelta(winner, promotion, state.currentYear, { titleDefenses: 1 })
      const currentReign = promotion.titleHistory.find((title) => title.fighterId === winner.id && title.gender === winner.gender && title.weightClass === division && title.reignEndYear == null)
      if (currentReign) currentReign.defenses = (currentReign.defenses ?? 0) + 1
    }
    refreshFlagshipChampion(state, promotion, winner.gender)
  }

  const winnerBaseFame = 2 + rarityFame[winner.rarity] + (finish ? 2 : 0) + (upset ? 7 : 0) + importance / 18 + titleFame
  const loserBaseFame = Math.max(0.5, rarityFame[loser.rarity] * 0.13 + importance / 65)
  const winnerFame = Math.max(1, Math.round(winnerBaseFame * personalityFameBonus(winner, loser, importance)))
  const loserFame = Math.max(0, Math.round(loserBaseFame * personalityFameBonus(loser, winner, importance)))
  winner.fame += winnerFame
  loser.fame += loserFame
  applyStatDelta(winner, promotion, state.currentYear, { fameEarned: winnerFame })
  applyStatDelta(loser, promotion, state.currentYear, { fameEarned: loserFame })

  const opponentRank = winner.id === first.id ? secondRank : firstRank
  const legacyGain = 2 + importance / 16 + (opponentRank != null && opponentRank > 0 ? Math.max(0, 6 - opponentRank) : 0) + (titleChanged ? 10 : 0) + (titleDefense ? 5 : 0) + (upset ? 4 : 0)
  winner.legacy = Math.min(100, Number((winner.legacy + legacyGain).toFixed(1)))
  if (titleBout && importance >= 80) loser.legacy = Math.min(100, Number((loser.legacy + 1.5).toFixed(1)))

  winner.form = Math.min(100, winner.form + 4 + (upset ? 3 : 0))
  loser.form = Math.max(0, loser.form - 3)

  const { rivalry, previousScore } = updateRivalry(state, first, second, winner, promotion, titleBout, finish, upset, importance, firstRank, secondRank)
  const fightRating = fightQualityRating(first, second, promotion, titleBout, importance, method, upset, rivalry.score)
  const audience = fightAudienceMillions(first, second, promotion, importance, titleBout)
  const ppvBuys = Number((audience * ppvFactor(promotion)).toFixed(2))
  const rivalryMilestone = (previousScore < 45 && rivalry.score >= 45) || (previousScore < 70 && rivalry.score >= 70) || (previousScore < 90 && rivalry.score >= 90)
  const fightId = `fight-${eventId}-${first.id}-${second.id}`

  const historyBase = {
    id: fightId,
    eventId,
    year: state.currentYear,
    month: state.currentMonth,
    week: state.currentWeek,
    promotionId: promotion.id,
    promotionName: promotion.name,
    method,
    titleBout,
    titleChanged,
    titleDefense,
    upset,
    importance,
    fightRating,
    audience,
    ppvBuys,
    weightClass: division,
    rivalryScoreAfter: rivalry.score,
  }
  first.fightHistory.unshift({
    ...historyBase,
    opponentId: second.id,
    opponentName: shortFighterName(second),
    result: winner.id === first.id ? 'W' : 'L',
    rankBefore: firstRank,
    opponentRankBefore: secondRank,
  })
  second.fightHistory.unshift({
    ...historyBase,
    opponentId: first.id,
    opponentName: shortFighterName(first),
    result: winner.id === second.id ? 'W' : 'L',
    rankBefore: secondRank,
    opponentRankBefore: firstRank,
  })

  const stakes = titleChanged ? ` to capture the ${division} title` : titleDefense ? ` to defend the ${division} title` : ''
  const upsetText = upset ? ' in a major upset' : ''
  const rivalryText = rivalry.score >= 45 ? ` Their rivalry now stands at ${rivalry.score}/100 after ${rivalry.meetings} meeting${rivalry.meetings === 1 ? '' : 's'}.` : ''
  return {
    fightId,
    fighterAId: first.id,
    fighterBId: second.id,
    fighterAName: shortFighterName(first),
    fighterBName: shortFighterName(second),
    winnerId: winner.id,
    winnerName: shortFighterName(winner),
    loserId: loser.id,
    loserName: shortFighterName(loser),
    method,
    titleBout,
    titleChanged,
    titleDefense,
    upset,
    importance: Math.min(100, importance + (upset ? 5 : 0)),
    fightRating,
    audience,
    ppvBuys,
    weightClass: division,
    winner,
    loser,
    rivalry,
    rivalryMilestone,
    headline: `${shortFighterName(winner)} defeats ${shortFighterName(loser)}`,
    body: `${shortFighterName(winner)} defeats ${shortFighterName(loser)} by ${method}${upsetText}${stakes}. ${winner.id === first.id ? `#${firstRank ?? '—'} vs #${secondRank ?? '—'}` : `#${secondRank ?? '—'} vs #${firstRank ?? '—'}`} was decided on résumé and matchup rather than reputation alone.${rivalryText}`,
  }
}

function minRestWeeks(promotion: Promotion, fighter: Fighter, titleBout = false): number {
  if (isWrestlingPromotion(promotion)) return titleBout ? 6 : 3
  if (promotion.id === 'matchroom' && fighter.stats.fights < 6) return titleBout ? 14 : 8
  if (promotion.id === 'matchroom') return titleBout ? 18 : 12
  return titleBout ? 16 : 11
}

function eligibleToFight(state: GameState, fighter: Fighter, promotion: Promotion, titleBout = false): boolean {
  if (fighter.isRetired || fighter.promotionId !== promotion.id) return false
  const since = weeksSinceLastFight(state, fighter)
  return since >= minRestWeeks(promotion, fighter, titleBout) || since >= 999
}

function matchupDesire(fighter: Fighter, opponent: Fighter, state: GameState, promotion: Promotion): number {
  const fighterRank = currentRank(state, fighter, promotion)
  const opponentRank = currentRank(state, opponent, promotion)
  const rivalry = getRivalry(state, fighter.id, opponent.id)
  let score = 0
  if (fighterRank != null && opponentRank != null) score += Math.max(0, 12 - Math.abs(fighterRank - opponentRank) * 2)
  if (fighter.competitivePersonality === 'Fearless') score += opponentRank != null && opponentRank > 0 && opponentRank <= 3 ? 10 : 2
  if (fighter.competitivePersonality === 'Legacy-Driven') score += opponentRank != null && opponentRank > 0 && opponentRank <= 5 ? 9 : 0
  if (fighter.competitivePersonality === 'Calculated') score += styleAffinity(fighter.style, opponent.style) * 1.6
  if (fighter.competitivePersonality === 'Opportunist') score += opponent.currentStreak < 0 ? 7 : 0
  if (fighter.competitivePersonality === 'Money-Driven') score += Math.min(10, opponent.fame * 0.05)
  if (fighter.socialPersonality === 'Villain' || fighter.socialPersonality === 'Rebel' || fighter.socialPersonality === 'Showman') score += (rivalry?.score ?? 0) * 0.12
  return score
}

function selectTitleBout(state: GameState, promotion: Promotion, usedIds: Set<string>): [Fighter, Fighter] | null {
  const candidates = getPromotionDivisions(state, promotion)
    .map(({ gender, division }) => {
      const ranked = getDivisionRanking(state, promotion, gender, division)
      const champion = ranked.find((entry) => entry.isChampion)?.fighter ?? null
      const contenders = ranked.filter((entry) => !entry.isChampion && !usedIds.has(entry.fighter.id) && eligibleToFight(state, entry.fighter, promotion, true))
      if (champion) {
        if (usedIds.has(champion.id) || !eligibleToFight(state, champion, promotion, true) || contenders.length === 0) return null
        const challenger = contenders[0].fighter
        return { first: champion, second: challenger, priority: 25 + monthsSinceLastFight(state, champion) * 3 + challenger.fame * 0.04 + rankingScore(state, challenger, promotion) * 0.08 }
      }
      if (contenders.length >= 2) return { first: contenders[0].fighter, second: contenders[1].fighter, priority: 48 + contenders[0].score * 0.05 + contenders[1].score * 0.05 }
      return null
    })
    .filter((entry): entry is { first: Fighter; second: Fighter; priority: number } => Boolean(entry))
    .sort((a, b) => b.priority - a.priority)

  if (!candidates.length) return null
  const hasVacantTitle = candidates.some((entry) => !promotion.divisionChampions[divisionKey(entry.first.gender, divisionForFighter(entry.first, promotion))])
  const titleProbability = isWrestlingPromotion(promotion) ? 0.46 : 0.72
  if (!hasVacantTitle && Math.random() > titleProbability) return null
  return [candidates[0].first, candidates[0].second]
}

function selectRegularBout(state: GameState, promotion: Promotion, usedIds: Set<string>): [Fighter, Fighter] | null {
  const pairCandidates: { first: Fighter; second: Fighter; score: number }[] = []
  getPromotionDivisions(state, promotion).forEach(({ gender, division }) => {
    const ranked = getDivisionRanking(state, promotion, gender, division)
      .filter((entry) => !entry.isChampion)
      .filter((entry) => !usedIds.has(entry.fighter.id) && eligibleToFight(state, entry.fighter, promotion, false))
    for (let index = 0; index < ranked.length; index += 1) {
      for (let otherIndex = index + 1; otherIndex < Math.min(ranked.length, index + 4); otherIndex += 1) {
        const first = ranked[index].fighter
        const second = ranked[otherIndex].fighter
        const lastMeeting = first.fightHistory.find((fight) => fight.opponentId === second.id)
        const rivalry = getRivalry(state, first.id, second.id)
        const lastWeek = lastMeeting?.week ?? Math.min(52, Math.max(1, Math.round((lastMeeting?.month ?? 0) * 4.333) + 1))
        const tooSoon = lastMeeting && ((state.currentYear - lastMeeting.year) * 52 + state.currentWeek - lastWeek) < 24 && (rivalry?.score ?? 0) < 55
        if (tooSoon) continue
        const rankCloseness = 18 - Math.abs(ranked[index].rank - ranked[otherIndex].rank) * 4
        const desire = matchupDesire(first, second, state, promotion) + matchupDesire(second, first, state, promotion)
        const meaningful = (ranked[index].rank <= 5 ? 5 : 0) + (ranked[otherIndex].rank <= 5 ? 5 : 0) + (rivalry?.score ?? 0) * 0.08
        pairCandidates.push({ first, second, score: rankCloseness + desire + meaningful + Math.random() * 5 })
      }
    }
  })
  pairCandidates.sort((a, b) => b.score - a.score)
  return pairCandidates[0] ? [pairCandidates[0].first, pairCandidates[0].second] : null
}

function ensurePromotionYear(promotion: Promotion, year: number): PromotionYearStat {
  const key = String(year)
  if (!promotion.yearStats[key]) {
    promotion.yearStats[key] = { year, fame: 0, viewers: 0, revenue: 0, maleWins: 0, femaleWins: 0, maleTitles: 0, femaleTitles: 0, maleChampionName: null, femaleChampionName: null }
  }
  return promotion.yearStats[key]
}

function updatePromotionBusiness(state: GameState, promotion: Promotion, event: CombatEvent): void {
  const roster = rosterForPromotion(state, promotion.id)
  const rosterFame = roster.reduce((sum, fighter) => sum + fighter.fame, 0)
  const topStars = [...roster].sort((a, b) => b.fame - a.fame).slice(0, 5)
  const topFame = topStars.reduce((sum, fighter) => sum + fighter.fame, 0)
  const championBonus = GENDERS.reduce((sum, gender) => {
    const champion = state.fighters.find((fighter) => fighter.id === promotion.currentChampions[gender])
    return sum + (champion?.fame ?? 0) * 0.18
  }, 0)
  const eventBuzz = event.qualityRating * 0.22 + event.audience * 2.2
  promotion.fame = Math.max(0, Math.round(rosterFame * 0.14 + topFame * 0.08 + championBonus + promotion.titleHistory.length * 1.3 + eventBuzz))
  promotion.currentViewers = event.audience
  promotion.totalViewers = Number((promotion.totalViewers + promotion.currentViewers).toFixed(2))
  const eventRevenue = promotion.currentViewers * (0.42 + promotion.entertainment / 105) + event.ppvBuys * 0.62
  promotion.revenue = Number((promotion.revenue + eventRevenue).toFixed(2))

  const yearStats = ensurePromotionYear(promotion, state.currentYear)
  yearStats.fame = promotion.fame
  yearStats.viewers = Number((yearStats.viewers + promotion.currentViewers).toFixed(2))
  yearStats.revenue = Number((yearStats.revenue + eventRevenue).toFixed(2))
  event.bouts.forEach((bout) => {
    const winner = state.fighters.find((fighter) => fighter.id === bout.winnerId)
    if (!winner) return
    if (winner.gender === 'Male') yearStats.maleWins += 1
    else yearStats.femaleWins += 1
    if (bout.titleChanged) {
      if (winner.gender === 'Male') yearStats.maleTitles += 1
      else yearStats.femaleTitles += 1
    }
  })
  const maleChampion = state.fighters.find((fighter) => fighter.id === promotion.currentChampions.Male)
  const femaleChampion = state.fighters.find((fighter) => fighter.id === promotion.currentChampions.Female)
  yearStats.maleChampionName = maleChampion ? shortFighterName(maleChampion) : null
  yearStats.femaleChampionName = femaleChampion ? shortFighterName(femaleChampion) : null
}

function marketFit(promotion: Promotion, fighter: Fighter): number {
  const identity = fighter.overall * (promotion.competition / 100) + fighter.charisma * (promotion.entertainment / 100)
  let bonus = 0
  if (promotion.id === 'ufc') {
    bonus += fighter.rarity === 'Generational' ? 34 : fighter.rarity === 'Legend' ? 24 : fighter.rarity === 'Epic' ? 14 : 2
    bonus += Math.max(0, fighter.currentStreak) * 2.5 + fighter.stats.titleDefenses * 2
  }
  if (promotion.id === 'pfl') bonus += fighter.rarity === 'Epic' || fighter.rarity === 'Legend' ? 10 : 6
  if (promotion.id === 'one') bonus += fighter.nationality.includes('Japan') || fighter.nationality.includes('China') || fighter.nationality.includes('Thailand') || fighter.nationality.includes('Philippines') ? 12 : 5
  if (promotion.id === 'cage') bonus += fighter.age <= 25 ? 14 : fighter.rarity === 'Rare' || fighter.rarity === 'Uncommon' ? 8 : -4
  if (fighter.competitivePersonality === 'Legacy-Driven') bonus += promotion.competition * 0.12
  if (fighter.competitivePersonality === 'Money-Driven') bonus += promotion.entertainment * 0.08 + promotion.fame * 0.12
  if (fighter.competitivePersonality === 'Loyal') bonus += fighter.promotionId === promotion.id ? 8 : -2
  return identity + bonus + promotion.fame * 0.1 + Math.random() * 10
}


export function runSigningWindow(input: GameState, count = 8): GameState {
  if (input.phase !== 'universe') return input
  const state = structuredClone(input)
  const candidates = freeAgents(state)
    .sort((a, b) => b.overall + b.potential * 0.3 + b.charisma * 0.2 - (a.overall + a.potential * 0.3 + a.charisma * 0.2))
    .slice(0, count)

  candidates.forEach((fighter) => {
    const bidders = [...state.promotions].sort((a, b) => marketFit(b, fighter) - marketFit(a, fighter)).slice(0, 3)
    const winner = bidders[0]
    if (!winner) return
    fighter.promotionId = winner.id
    state.chronicles.unshift(createChronicle(state, {
      type: 'signing',
      headline: `${winner.name} wins the race for ${shortFighterName(fighter)}`,
      body: `${bidders.map((promotion) => promotion.name).join(', ')} competed for the ${fighter.rarity.toLowerCase()} ${fighter.style.toLowerCase()}. As a ${fighter.competitivePersonality.toLowerCase()} competitor, ${shortFighterName(fighter)} favored ${winner.name}'s mix of opportunity, identity and momentum.`,
      promotionIds: bidders.map((promotion) => promotion.id),
      fighterIds: [fighter.id],
      importance: fighter.rarity === 'Generational' ? 96 : fighter.rarity === 'Legend' ? 84 : fighter.rarity === 'Epic' ? 70 : fighter.rarity === 'Rare' ? 60 : 42,
    }))
  })
  return state
}

function simulatePromotionMonth(state: GameState, promotion: Promotion): void {
  const eventId = `event-${promotion.id}-${state.currentYear}-${state.currentMonth}-${state.totalEvents}`
  const event: CombatEvent = {
    id: eventId,
    year: state.currentYear,
    month: state.currentMonth,
    week: state.currentWeek,
    promotionId: promotion.id,
    promotionName: promotion.name,
    name: `${promotion.shortName} ${state.totalEvents + 1}`,
    bouts: [],
    headlineFightId: null,
    eventRating: 0,
    qualityRating: 0,
    audience: 0,
    ppvBuys: 0,
  }
  const usedIds = new Set<string>()
  const results: BoutResult[] = []
  const titleBout = selectTitleBout(state, promotion, usedIds)
  if (titleBout) {
    const [first, second] = titleBout
    usedIds.add(first.id); usedIds.add(second.id)
    results.push(simulateBout(state, promotion, first, second, true, eventId))
  }
  const targetBouts = isWrestlingPromotion(promotion) ? 4 : 3
  while (results.length < targetBouts) {
    const bout = selectRegularBout(state, promotion, usedIds)
    if (!bout) break
    const [first, second] = bout
    usedIds.add(first.id); usedIds.add(second.id)
    results.push(simulateBout(state, promotion, first, second, false, eventId))
  }

  event.bouts = results.map(({ winner, loser, headline, body, rivalry, rivalryMilestone, ...bout }) => bout)
  const biggest = [...results].sort((a, b) => b.importance - a.importance)[0]
  event.headlineFightId = biggest?.fightId ?? null
  const qualityAverage = results.length ? results.reduce((sum, result) => sum + result.fightRating, 0) / results.length : 0
  event.qualityRating = results.length ? clampRating(qualityAverage * 0.72 + (biggest?.fightRating ?? 0) * 0.28) : 0
  event.eventRating = event.qualityRating
  const sortedAudience = [...results].sort((a, b) => b.audience - a.audience)
  event.audience = Number(((sortedAudience[0]?.audience ?? 0) + sortedAudience.slice(1).reduce((sum, result) => sum + result.audience * 0.12, 0)).toFixed(2))
  event.ppvBuys = Number((event.audience * ppvFactor(promotion)).toFixed(2))
  state.events.unshift(event)
  state.totalEvents += 1

  results.forEach((result) => {
    if (result.titleChanged || result.titleDefense) {
      state.chronicles.unshift(createChronicle(state, {
        type: 'title',
        headline: result.titleChanged ? `${shortFighterName(result.winner)} captures ${promotion.name} ${result.weightClass} gold` : `${shortFighterName(result.winner)} retains ${promotion.name} ${result.weightClass} gold`,
        body: result.body,
        promotionIds: [promotion.id],
        fighterIds: [result.winner.id, result.loser.id],
        importance: Math.max(76, result.importance),
      }))
    } else if (result.rivalryMilestone) {
      const label = result.rivalry.score >= 90 ? 'historic' : result.rivalry.score >= 70 ? 'major' : 'heated'
      state.chronicles.unshift(createChronicle(state, {
        type: 'rivalry',
        headline: `${shortFighterName(result.winner)}–${shortFighterName(result.loser)} becomes a ${label} rivalry`,
        body: `${result.rivalry.meetings} meetings, ${result.rivalry.titleFights} title fights and a rivalry score of ${result.rivalry.score}/100 now make this one of the universe's meaningful recurring matchups.`,
        promotionIds: result.rivalry.promotionIds,
        fighterIds: [result.rivalry.fighterAId, result.rivalry.fighterBId],
        importance: result.rivalry.score,
      }))
    } else if (result.upset || result.importance >= 64) {
      state.chronicles.unshift(createChronicle(state, {
        type: result.upset ? 'record' : 'event',
        headline: result.headline,
        body: result.body,
        promotionIds: [promotion.id],
        fighterIds: [result.winner.id, result.loser.id],
        importance: result.importance,
      }))
    }
  })
  updatePromotionBusiness(state, promotion, event)
}

function adjustAttributesForOverallChange(fighter: Fighter, delta: number): void {
  if (!delta) return
  const keys = Object.keys(fighter.attributes) as (keyof Fighter['attributes'])[]
  keys.forEach((key) => {
    const sensitivity = key === 'speed' && delta < 0 ? 1.25 : key === 'technique' && delta < 0 ? 0.55 : 1
    fighter.attributes[key] = Math.max(35, Math.min(100, Math.round(fighter.attributes[key] + delta * sensitivity)))
  })
}

function declineChance(arc: CareerArc, yearsPastPrime: number): number {
  const base: Record<CareerArc, number> = { Prodigy: 0.42, 'Early Peak': 0.56, Balanced: 0.42, 'Late Bloomer': 0.32, Evergreen: 0.2 }
  return Math.min(0.88, base[arc] + Math.max(0, yearsPastPrime - 3) * 0.07)
}

function closeFighterReigns(state: GameState, fighter: Fighter): void {
  state.promotions.forEach((promotion) => {
    Object.entries(promotion.divisionChampions).forEach(([key, championId]) => {
      if (championId !== fighter.id) return
      promotion.divisionChampions[key] = null
      const [gender, division] = key.split(':')
      const reign = promotion.titleHistory.find((title) => title.fighterId === fighter.id && title.gender === gender && title.weightClass === division && title.reignEndYear == null)
      if (reign) {
        reign.reignEndYear = state.currentYear
        reign.reignEndWeek = state.currentWeek
      }
    })
    if (promotion.currentChampions[fighter.gender] === fighter.id) refreshFlagshipChampion(state, promotion, fighter.gender)
  })
}

function ageUniverse(state: GameState): { retired: Fighter[]; prospects: Fighter[] } {
  const retired: Fighter[] = []
  state.fighters.forEach((fighter) => {
    fighter.age += 1
    let delta = 0
    if (fighter.age <= fighter.primeAge && fighter.overall < fighter.potential) {
      const growthChance = fighter.careerArc === 'Prodigy' ? 0.82 : fighter.careerArc === 'Late Bloomer' ? 0.62 : 0.7
      if (Math.random() < growthChance) delta = fighter.age === fighter.primeAge ? 2 : 1
    } else if (fighter.age > fighter.primeAge + 1 && Math.random() < declineChance(fighter.careerArc, fighter.age - fighter.primeAge)) {
      delta = fighter.age >= 37 && fighter.careerArc !== 'Evergreen' ? -2 : -1
    }
    if (delta > 0) fighter.overall = Math.min(fighter.potential, fighter.overall + delta)
    if (delta < 0) fighter.overall = Math.max(40, fighter.overall + delta)
    adjustAttributesForOverallChange(fighter, delta)
    fighter.form = Math.max(35, Math.min(67, fighter.form + Math.round(randomBetween(-4, 4))))

    const retirementAge = fighter.careerArc === 'Evergreen' ? 44 : fighter.careerArc === 'Early Peak' ? 39 : 42
    if (fighter.age >= retirementAge && fighter.promotionId && Math.random() < 0.2 + Math.max(0, fighter.age - retirementAge) * 0.08) {
      const previousPromotion = state.promotions.find((candidate) => candidate.id === fighter.promotionId)
      closeFighterReigns(state, fighter)
      fighter.isRetired = true
      fighter.retiredYear = state.currentYear
      fighter.promotionId = null
      retired.push(fighter)
      state.chronicles.unshift(createChronicle(state, {
        type: 'record',
        headline: `${shortFighterName(fighter)} retires from the arena`,
        body: `${shortFighterName(fighter)} closes a ${fighter.careerArc.toLowerCase()} career with ${fighter.stats.wins} wins, ${fighter.stats.titles} title reigns, ${fighter.stats.titleDefenses} defenses, ${fighter.legacy.toFixed(0)} legacy and ${fighter.fame} fame.`,
        promotionIds: previousPromotion ? [previousPromotion.id] : [],
        fighterIds: [fighter.id],
        importance: fighter.rarity === 'Generational' ? 98 : fighter.rarity === 'Legend' ? 88 : fighter.legacy >= 80 ? 76 : 58,
      }))
    }
  })

  const prospects = createProspectClass(state.seed, state.currentYear + 1, state.fighters, 16)
  state.fighters.push(...prospects)
  const best = [...prospects].sort((a, b) => b.potential - a.potential || b.overall - a.overall)[0]
  if (best) {
    state.chronicles.unshift(createChronicle(state, {
      type: 'record',
      headline: `${state.currentYear + 1} prospect class enters the combat world`,
      body: `${shortFighterName(best)}, an ${best.age}-year-old ${best.rarity.toLowerCase()} ${best.weightClass} ${best.discipline.toLowerCase()} prospect from ${best.nationality}, leads 16 new fighters entering the world talent pool.`,
      promotionIds: [],
      fighterIds: prospects.slice(0, 4).map((fighter) => fighter.id),
      importance: best.rarity === 'Generational' ? 96 : best.rarity === 'Legend' ? 82 : best.rarity === 'Epic' ? 68 : 52,
    }))
  }
  return { retired, prospects }
}

function annualFighterScore(fighter: Fighter, year: number): number {
  const stats = fighter.yearStats[String(year)]
  if (!stats) return 0
  const wins = fighter.fightHistory.filter((fight) => fight.year === year && fight.result === 'W')
  return stats.wins * 10 + stats.titles * 30 + stats.titleDefenses * 14 + stats.fameEarned * 0.55 + wins.reduce((sum, fight) => sum + (fight.fightRating ?? fight.importance) * 0.12 + fight.importance * 0.08 + (fight.upset ? 4 : 0), 0)
}

function createAnnualAwards(state: GameState, year: number): void {
  const activeThatYear = state.fighters.filter((fighter) => fighter.yearStats[String(year)]?.fights)
  if (!activeThatYear.length) return
  const fighterOfYear = [...activeThatYear].sort((a, b) => annualFighterScore(b, year) - annualFighterScore(a, year))[0]
  const famous = [...state.fighters].sort((a, b) => b.fame - a.fame)[0]
  const breakthrough = [...activeThatYear]
    .filter((fighter) => fighter.age <= 27 && fighter.stats.fights - (fighter.yearStats[String(year)]?.fights ?? 0) <= 7)
    .sort((a, b) => annualFighterScore(b, year) - annualFighterScore(a, year))[0] ?? fighterOfYear
  const yearBouts = state.events.filter((event) => event.year === year).flatMap((event) => event.bouts)
  const bestFight = [...yearBouts].sort((a, b) => b.fightRating - a.fightRating || b.importance - a.importance)[0]
  const upset = [...yearBouts].filter((bout) => bout.upset).sort((a, b) => b.fightRating - a.fightRating || b.importance - a.importance)[0]

  const awards: AnnualAward[] = [
    { id: `award-${year}-fighter`, year, category: 'Fighter of the Year', fighterIds: [fighterOfYear.id], fighterNames: [shortFighterName(fighterOfYear)], description: `${fighterOfYear.yearStats[String(year)].wins} wins, ${fighterOfYear.yearStats[String(year)].titles} titles, ${fighterOfYear.yearStats[String(year)].titleDefenses} defenses and ${fighterOfYear.yearStats[String(year)].fameEarned} fame earned.` },
    { id: `award-${year}-breakthrough`, year, category: 'Breakthrough Fighter', fighterIds: [breakthrough.id], fighterNames: [shortFighterName(breakthrough)], description: `The year's strongest emerging résumé.` },
    { id: `award-${year}-famous`, year, category: 'Most Famous Fighter', fighterIds: [famous.id], fighterNames: [shortFighterName(famous)], description: `Closed the year at ${famous.fame} career fame.` },
  ]
  if (bestFight) awards.push({ id: `award-${year}-fight`, year, category: 'Fight of the Year', fighterIds: [bestFight.fighterAId, bestFight.fighterBId], fighterNames: [bestFight.fighterAName, bestFight.fighterBName], description: `${bestFight.fighterAName} vs ${bestFight.fighterBName}: ${bestFight.fightRating}/100 quality, ${bestFight.audience.toFixed(2)}M audience, ${bestFight.ppvBuys.toFixed(2)}M PPV.` })
  if (upset) awards.push({ id: `award-${year}-upset`, year, category: 'Upset of the Year', fighterIds: [upset.winnerId, upset.loserId], fighterNames: [upset.winnerName, upset.loserName], description: `${upset.winnerName} shocked ${upset.loserName} by ${upset.method} in a ${upset.fightRating}/100 fight.` })
  state.awards.unshift(...awards)
}

function promotionYearScore(promotion: Promotion, year: number): number {
  const stats = promotion.yearStats[String(year)]
  if (!stats) return 0
  return stats.revenue * 5 + stats.viewers * 2 + stats.fame * 3 + (stats.maleTitles + stats.femaleTitles) * 10
}

function directOffseasonMove(state: GameState, fighter: Fighter, target: Promotion): PromotionMove | null {
  const previous = state.promotions.find((promotion) => promotion.id === fighter.promotionId)
  if (!previous || previous.id === target.id) return null
  closeFighterReigns(state, fighter)
  fighter.promotionId = target.id
  const move: PromotionMove = {
    fighterId: fighter.id,
    fighterName: shortFighterName(fighter),
    fromPromotionId: previous.id,
    fromPromotionName: previous.name,
    toPromotionId: target.id,
    toPromotionName: target.name,
  }
  state.chronicles.unshift(createChronicle(state, {
    type: 'signing',
    headline: `${shortFighterName(fighter)} changes promotions`,
    body: `${shortFighterName(fighter)} leaves ${previous.name} for ${target.name} entering ${state.currentYear + 1}. The ${fighter.competitivePersonality.toLowerCase()} fighter opens a new career chapter while every prior result stays with ${previous.name}.`,
    promotionIds: [previous.id, target.id],
    fighterIds: [fighter.id],
    importance: fighter.rarity === 'Generational' ? 96 : fighter.rarity === 'Legend' ? 88 : fighter.fame >= 80 ? 82 : 66,
  }))
  return move
}

function runOffseasonMoves(state: GameState): PromotionMove[] {
  const promotionPower = (promotion: Promotion) => promotion.fame * 2 + promotion.competition + promotion.entertainment * 0.6 + promotion.revenue * 0.15
  const moves: PromotionMove[] = []
  const candidates = state.fighters
    .filter((fighter) => fighter.promotionId && !fighter.isRetired && fighter.stats.fights > 0 && fighter.age <= 38)
    .map((fighter) => {
      const current = state.promotions.find((promotion) => promotion.id === fighter.promotionId)!
      const personality = fighter.competitivePersonality === 'Money-Driven' ? 16 : fighter.competitivePersonality === 'Legacy-Driven' ? 14 : fighter.socialPersonality === 'Rebel' ? 12 : fighter.competitivePersonality === 'Loyal' ? -12 : 2
      const currentPower = promotionPower(current)
      const bestTarget = [...state.promotions]
        .filter((promotion) => promotion.id !== current.id)
        .sort((a, b) => (marketFit(b, fighter) + promotionPower(b) * 0.12) - (marketFit(a, fighter) + promotionPower(a) * 0.12))[0]
      const opportunity = bestTarget ? (promotionPower(bestTarget) - currentPower) * 0.11 : 0
      const rarityPressure = fighter.rarity === 'Generational' ? 18 : fighter.rarity === 'Legend' ? 11 : fighter.rarity === 'Epic' ? 6 : 0
      const recent = fighter.yearStats[String(state.currentYear)]
      const performancePressure = (recent?.wins ?? 0) * 2.5 + (recent?.titles ?? 0) * 8 + (recent?.titleDefenses ?? 0) * 4 + Math.max(0, fighter.currentStreak) * 1.5
      const ufcPull = bestTarget?.id === 'ufc' && current.id !== 'ufc' ? 8 : 0
      return { fighter, current, bestTarget, score: personality + opportunity + rarityPressure + performancePressure + ufcPull + fighter.fame * 0.025 + Math.random() * 8 }
    })
    .filter((entry) => entry.bestTarget && entry.score >= 11)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  candidates.forEach(({ fighter, bestTarget }) => {
    if (!bestTarget) return
    const move = directOffseasonMove(state, fighter, bestTarget)
    if (move) moves.push(move)
  })
  return moves
}

function buildYearSummary(state: GameState, year: number, retired: Fighter[], prospects: Fighter[], promotionMoves: PromotionMove[]): YearSummary {
  const topFighters = state.fighters
    .filter((fighter) => fighter.yearStats[String(year)]?.fights)
    .map((fighter) => ({
      fighterId: fighter.id,
      fighterName: shortFighterName(fighter),
      score: Number(annualFighterScore(fighter, year).toFixed(1)),
      wins: fighter.yearStats[String(year)]?.wins ?? 0,
      losses: fighter.yearStats[String(year)]?.losses ?? 0,
      titles: fighter.yearStats[String(year)]?.titles ?? 0,
      titleDefenses: fighter.yearStats[String(year)]?.titleDefenses ?? 0,
      fameEarned: fighter.yearStats[String(year)]?.fameEarned ?? 0,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)

  const yearEvents = state.events.filter((event) => event.year === year)
  const yearBouts = yearEvents.flatMap((event) => event.bouts)
  const historicalFightScore = (bout: EventBout) => bout.fightRating * 0.48 + bout.importance * 0.32 + bout.audience * 4 + bout.ppvBuys * 3
  const historicalEventScore = (event: CombatEvent) => event.qualityRating * 0.5 + event.audience * 4.5 + event.ppvBuys * 3.5
  const promotions = state.promotions.map((promotion) => ({ promotion, score: promotionYearScore(promotion, year) })).sort((a, b) => b.score - a.score)
  const leader = promotions[0]

  return {
    year,
    topFighters,
    topFightIds: [...yearBouts].sort((a, b) => historicalFightScore(b) - historicalFightScore(a)).slice(0, 10).map((bout) => bout.fightId),
    topQualityFightIds: [...yearBouts].sort((a, b) => b.fightRating - a.fightRating || b.importance - a.importance).slice(0, 10).map((bout) => bout.fightId),
    topAudienceFightIds: [...yearBouts].sort((a, b) => b.audience - a.audience || b.ppvBuys - a.ppvBuys).slice(0, 10).map((bout) => bout.fightId),
    topEventIds: [...yearEvents].sort((a, b) => historicalEventScore(b) - historicalEventScore(a)).slice(0, 10).map((event) => event.id),
    topQualityEventIds: [...yearEvents].sort((a, b) => b.qualityRating - a.qualityRating).slice(0, 10).map((event) => event.id),
    topAudienceEventIds: [...yearEvents].sort((a, b) => b.audience - a.audience || b.ppvBuys - a.ppvBuys).slice(0, 10).map((event) => event.id),
    topPromotionId: leader?.promotion.id ?? null,
    topPromotionName: leader?.promotion.name ?? '—',
    topPromotionScore: Number((leader?.score ?? 0).toFixed(1)),
    retiredFighterIds: retired.map((fighter) => fighter.id),
    retiredFighterNames: retired.map((fighter) => shortFighterName(fighter)),
    newProspectIds: prospects.map((fighter) => fighter.id),
    newProspectNames: prospects.map((fighter) => shortFighterName(fighter)),
    promotionMoves,
  }
}

function weekToMonth(week: number): number {
  return Math.min(11, Math.max(0, Math.floor((week - 1) / (52 / 12))))
}

function eventCadenceWeeks(promotion: Promotion): number {
  if (promotion.id === 'ufc') return 4
  if (promotion.id === 'pfl') return 5
  if (promotion.id === 'one') return 5
  return 6
}

function promotionRunsThisWeek(promotion: Promotion, promotionIndex: number, week: number): boolean {
  const cadence = eventCadenceWeeks(promotion)
  const offset = (promotionIndex * 2) % cadence
  return (week + offset) % cadence === 0
}

export function simulateWeek(input: GameState): GameState {
  if (input.phase !== 'universe') return input
  let state = structuredClone(input)
  state.currentMonth = weekToMonth(state.currentWeek)

  if ([13, 26, 39].includes(state.currentWeek) && freeAgents(state).length > 0) state = runSigningWindow(state, 2)
  state.promotions.forEach((promotion, index) => {
    if (promotionRunsThisWeek(promotion, index, state.currentWeek)) simulatePromotionMonth(state, promotion)
  })

  if (state.currentWeek >= 52) {
    const completedYear = state.currentYear
    createAnnualAwards(state, completedYear)
    const yearEvents = state.events.filter((event) => event.year === completedYear)
    const bestQualityEvent = [...yearEvents].sort((a, b) => b.qualityRating - a.qualityRating)[0]
    const biggestEvent = [...yearEvents].sort((a, b) => b.audience - a.audience)[0]
    const fighterOfYear = state.awards.find((award) => award.year === completedYear && award.category === 'Fighter of the Year')
    const topPromotion = [...state.promotions].sort((a, b) => promotionYearScore(b, completedYear) - promotionYearScore(a, completedYear))[0]
    state.chronicles.unshift(createChronicle(state, {
      type: 'record',
      headline: `${completedYear} enters the history books`,
      body: `${fighterOfYear?.fighterNames[0] ?? 'No fighter'} is Fighter of the Year and ${topPromotion?.name ?? 'no promotion'} leads the year. ${bestQualityEvent ? `${bestQualityEvent.name} was the highest-quality event at ${bestQualityEvent.qualityRating}/100.` : ''} ${biggestEvent ? `${biggestEvent.name} drew the year's largest audience at ${biggestEvent.audience.toFixed(2)}M.` : ''}`,
      promotionIds: topPromotion ? [topPromotion.id] : [],
      fighterIds: fighterOfYear?.fighterIds ?? [],
      importance: 94,
    }))

    const { retired, prospects } = ageUniverse(state)
    const promotionMoves = runOffseasonMoves(state)
    const beforeSignings = new Map(state.fighters.map((fighter) => [fighter.id, fighter.promotionId]))
    if (freeAgents(state).length > 0) state = runSigningWindow(state, Math.min(8, freeAgents(state).length))
    state.fighters.forEach((fighter) => {
      const before = beforeSignings.get(fighter.id)
      if (before == null && fighter.promotionId) {
        const target = state.promotions.find((promotion) => promotion.id === fighter.promotionId)
        if (target) promotionMoves.push({ fighterId: fighter.id, fighterName: shortFighterName(fighter), fromPromotionId: null, fromPromotionName: 'Free agency', toPromotionId: target.id, toPromotionName: target.name })
      }
    })

    const summary = buildYearSummary(state, completedYear, retired, prospects, promotionMoves)
    state.yearSummaries = [summary, ...state.yearSummaries.filter((item) => item.year !== completedYear)]
    state.currentYear += 1
    state.currentWeek = 1
    state.currentMonth = 0
    state.chronicles.unshift(createChronicle(state, {
      type: 'structural',
      headline: `${state.currentYear} begins with a reshaped combat world`,
      body: `${retired.length} fighters retired, ${prospects.length} new prospects spawned, and ${promotionMoves.length} fighters changed or joined promotions during the offseason. The new rankings now reflect the changed landscape.`,
      promotionIds: [...new Set(promotionMoves.map((move) => move.toPromotionId))],
      fighterIds: [...retired.slice(0, 3).map((fighter) => fighter.id), ...prospects.slice(0, 3).map((fighter) => fighter.id)],
      importance: 84,
    }))
  } else {
    state.currentWeek += 1
    state.currentMonth = weekToMonth(state.currentWeek)
  }
  return state
}

export function simulateWeeks(input: GameState, weeks: number): GameState {
  let state = input
  for (let index = 0; index < weeks; index += 1) state = simulateWeek(state)
  return state
}

// Compatibility wrappers for older UI/components.
export function simulateMonth(input: GameState): GameState {
  return simulateWeeks(input, 4)
}

export function simulateMonths(input: GameState, months: number): GameState {
  return simulateWeeks(input, Math.max(1, Math.round(months * 52 / 12)))
}
