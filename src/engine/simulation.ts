import type {
  BrandStatLine,
  CareerStatLine,
  Fighter,
  GameState,
  Gender,
  Promotion,
  PromotionYearStat,
  Rarity,
  YearStatLine,
} from '../types'
import {
  createChronicle,
  freeAgents,
  monthName,
  rosterForPromotion,
  shortFighterName,
} from './universe'

const GENDERS: Gender[] = ['Male', 'Female']

const rarityFame: Record<Rarity, number> = {
  Legend: 8,
  Epic: 5,
  Rare: 3,
  Uncommon: 1.5,
  Common: 0.5,
}

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

function styleAffinity(style: string, opponentStyle: string): number {
  const styleText = style.toLowerCase()
  const opponentText = opponentStyle.toLowerCase()
  let edge = 0

  if ((styleText.includes('wrestl') || styleText.includes('sambo')) && opponentText.includes('box')) edge += 3.5
  if (styleText.includes('submission') && opponentText.includes('wrestl')) edge += 2.5
  if ((styleText.includes('kick') || styleText.includes('muay')) && opponentText.includes('powerhouse')) edge += 2
  if (styleText.includes('counter') && opponentText.includes('pressure')) edge += 3
  if (styleText.includes('brawler') && opponentText.includes('technical')) edge -= 2

  return edge
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
  if (!fighter.yearStats[key].promotionNames.includes(promotion.name)) {
    fighter.yearStats[key].promotionNames.push(promotion.name)
  }
  return fighter.yearStats[key]
}

function applyStatDelta(
  fighter: Fighter,
  promotion: Promotion,
  year: number,
  delta: Partial<CareerStatLine>,
): void {
  const brand = ensureBrandStats(fighter, promotion)
  const yearStats = ensureYearStats(fighter, year, promotion)

  ;(Object.keys(delta) as (keyof CareerStatLine)[]).forEach((key) => {
    const amount = delta[key] ?? 0
    fighter.stats[key] += amount
    brand[key] += amount
    yearStats[key] += amount
  })
}

function fighterPower(fighter: Fighter, promotion: Promotion): number {
  const competitionWeight = promotion.competition / 100
  const entertainmentWeight = promotion.entertainment / 100
  return (
    fighter.overall * (0.78 + competitionWeight * 0.3) +
    fighter.charisma * entertainmentWeight * 0.17 +
    fighter.form * 0.18
  )
}

function chooseWinner(first: Fighter, second: Fighter, promotion: Promotion): Fighter {
  const firstPower =
    fighterPower(first, promotion) +
    styleAffinity(first.style, second.style) +
    randomBetween(-12, 12)
  const secondPower =
    fighterPower(second, promotion) +
    styleAffinity(second.style, first.style) +
    randomBetween(-12, 12)

  const difference = firstPower - secondPower
  const firstChance = 1 / (1 + Math.exp(-difference / 14))
  return Math.random() < firstChance ? first : second
}

interface BoutResult {
  winner: Fighter
  loser: Fighter
  finish: boolean
  titleChanged: boolean
  titleDefense: boolean
  upset: boolean
  headline: string
  body: string
}

function simulateBout(
  state: GameState,
  promotion: Promotion,
  first: Fighter,
  second: Fighter,
  titleBout: boolean,
): BoutResult {
  const championId = promotion.currentChampions[first.gender]
  const winner = chooseWinner(first, second, promotion)
  const loser = winner.id === first.id ? second : first
  const finish = Math.random() < 0.48 + promotion.risk / 450
  const favorite = fighterPower(first, promotion) >= fighterPower(second, promotion) ? first : second
  const upset = favorite.id !== winner.id && favorite.overall - winner.overall >= 4

  applyStatDelta(winner, promotion, state.currentYear, {
    fights: 1,
    wins: 1,
    finishes: finish ? 1 : 0,
  })
  applyStatDelta(loser, promotion, state.currentYear, {
    fights: 1,
    losses: 1,
  })

  const baseWinnerFame =
    3 + rarityFame[winner.rarity] + (finish ? 2 : 0) + (upset ? 7 : 0) + promotion.entertainment / 55
  const baseLoserFame = Math.max(0.5, rarityFame[loser.rarity] * 0.16 + promotion.entertainment / 180)
  let winnerFame = baseWinnerFame
  let titleChanged = false
  let titleDefense = false

  if (titleBout) {
    if (!championId || winner.id !== championId) {
      const defeatedChampion = championId
        ? state.fighters.find((fighter) => fighter.id === championId) ?? null
        : null
      promotion.currentChampions[winner.gender] = winner.id
      titleChanged = true
      winnerFame += 14
      applyStatDelta(winner, promotion, state.currentYear, { titles: 1 })
      promotion.titleHistory.unshift({
        id: `title-${promotion.id}-${state.currentYear}-${state.currentMonth}-${winner.id}-${state.totalEvents}`,
        year: state.currentYear,
        month: state.currentMonth,
        gender: winner.gender,
        fighterId: winner.id,
        fighterName: shortFighterName(winner),
        defeatedFighterId: defeatedChampion?.id ?? null,
        defeatedFighterName: defeatedChampion ? shortFighterName(defeatedChampion) : null,
        promotionName: promotion.name,
      })
    } else {
      titleDefense = true
      winnerFame += 7
      applyStatDelta(winner, promotion, state.currentYear, { titleDefenses: 1 })
    }
  }

  winner.fame += Math.round(winnerFame)
  loser.fame += Math.round(baseLoserFame)
  applyStatDelta(winner, promotion, state.currentYear, { fameEarned: Math.round(winnerFame) })
  applyStatDelta(loser, promotion, state.currentYear, { fameEarned: Math.round(baseLoserFame) })

  winner.form = Math.min(100, winner.form + 4 + (upset ? 3 : 0))
  loser.form = Math.max(0, loser.form - 3)

  const method = finish ? 'a decisive finish' : 'a hard-fought decision'
  const titleLanguage = titleChanged
    ? ` and becomes the new ${winner.gender.toLowerCase()} champion`
    : titleDefense
      ? ' and successfully defends the title'
      : ''
  const upsetLanguage = upset ? ' in a major upset' : ''

  return {
    winner,
    loser,
    finish,
    titleChanged,
    titleDefense,
    upset,
    headline: `${shortFighterName(winner)} defeats ${shortFighterName(loser)}`,
    body: `${shortFighterName(winner)} earns ${method}${upsetLanguage}${titleLanguage} at ${promotion.name}. The victory moves the winner to ${winner.stats.wins}-${winner.stats.losses} and raises their fame to ${winner.fame}.`,
  }
}

function selectTitleBout(roster: Fighter[], championId: string | null, promotion: Promotion): [Fighter, Fighter] | null {
  if (roster.length < 2) return null
  const ranked = [...roster].sort(
    (a, b) => fighterPower(b, promotion) + b.fame * 0.08 - (fighterPower(a, promotion) + a.fame * 0.08),
  )

  if (!championId) return [ranked[0], ranked[1]]
  const champion = ranked.find((fighter) => fighter.id === championId)
  const challenger = ranked.find((fighter) => fighter.id !== championId)
  return champion && challenger ? [champion, challenger] : [ranked[0], ranked[1]]
}

function selectRegularBout(
  roster: Fighter[],
  usedIds: Set<string>,
  promotion: Promotion,
): [Fighter, Fighter] | null {
  const available = roster.filter((fighter) => !usedIds.has(fighter.id))
  if (available.length < 2) return null

  const weighted = [...available].sort(
    (a, b) => fighterPower(b, promotion) + Math.random() * 18 - (fighterPower(a, promotion) + Math.random() * 18),
  )
  const first = weighted[0]
  const opponentPool = weighted.slice(1, 5)
  const second = opponentPool[Math.floor(Math.random() * opponentPool.length)] ?? weighted[1]
  return [first, second]
}

function ensurePromotionYear(promotion: Promotion, year: number): PromotionYearStat {
  const key = String(year)
  if (!promotion.yearStats[key]) {
    promotion.yearStats[key] = {
      year,
      fame: 0,
      viewers: 0,
      revenue: 0,
      maleWins: 0,
      femaleWins: 0,
      maleTitles: 0,
      femaleTitles: 0,
      maleChampionName: null,
      femaleChampionName: null,
    }
  }
  return promotion.yearStats[key]
}

function updatePromotionBusiness(state: GameState, promotion: Promotion): void {
  const roster = rosterForPromotion(state, promotion.id)
  const rosterFame = roster.reduce((sum, fighter) => sum + fighter.fame, 0)
  const topStars = [...roster].sort((a, b) => b.fame - a.fame).slice(0, 5)
  const topFame = topStars.reduce((sum, fighter) => sum + fighter.fame, 0)
  const championBonus = GENDERS.reduce((sum, gender) => {
    const champion = state.fighters.find((fighter) => fighter.id === promotion.currentChampions[gender])
    return sum + (champion?.fame ?? 0) * 0.18
  }, 0)

  promotion.fame = Math.max(
    0,
    Math.round(rosterFame * 0.14 + topFame * 0.08 + championBonus + promotion.titleHistory.length * 1.8),
  )
  const identityReach = promotion.entertainment * 0.003 + promotion.competition * 0.0015
  promotion.currentViewers = Math.max(
    0,
    Number((0.08 + promotion.fame * 0.025 + topFame * 0.004 + identityReach).toFixed(2)),
  )
  promotion.totalViewers = Number((promotion.totalViewers + promotion.currentViewers).toFixed(2))
  const monthlyRevenue = promotion.currentViewers * (0.42 + promotion.entertainment / 105)
  promotion.revenue = Number((promotion.revenue + monthlyRevenue).toFixed(2))

  const yearStats = ensurePromotionYear(promotion, state.currentYear)
  yearStats.fame = promotion.fame
  yearStats.viewers = Number((yearStats.viewers + promotion.currentViewers).toFixed(2))
  yearStats.revenue = Number((yearStats.revenue + monthlyRevenue).toFixed(2))
  const maleChampion = state.fighters.find((fighter) => fighter.id === promotion.currentChampions.Male)
  const femaleChampion = state.fighters.find((fighter) => fighter.id === promotion.currentChampions.Female)
  yearStats.maleChampionName = maleChampion ? shortFighterName(maleChampion) : null
  yearStats.femaleChampionName = femaleChampion ? shortFighterName(femaleChampion) : null
}

function marketFit(promotion: Promotion, fighter: Fighter): number {
  const identity =
    fighter.overall * (promotion.competition / 100) +
    fighter.charisma * (promotion.entertainment / 100)
  const style = fighter.style.toLowerCase()
  let styleBonus = 0
  if (promotion.id === 'matchroom' && style.includes('box')) styleBonus += 22
  if (promotion.id === 'karate' && (style.includes('karate') || style.includes('kick') || style.includes('muay'))) styleBonus += 17
  if ((promotion.id === 'wwe' || promotion.id === 'aew' || promotion.id === 'tna') && style.includes('wrestler')) styleBonus += 15
  if ((promotion.id === 'ufc' || promotion.id === 'pfl') && (style.includes('mma') || style.includes('grappl') || style.includes('sambo'))) styleBonus += 14
  return identity + styleBonus + promotion.fame * 0.12 + Math.random() * 18
}

export function runSigningWindow(input: GameState, count = 8): GameState {
  if (input.phase !== 'universe') return input
  const state = structuredClone(input)
  const candidates = freeAgents(state)
    .sort((a, b) => b.overall + b.charisma * 0.28 - (a.overall + a.charisma * 0.28))
    .slice(0, count)

  candidates.forEach((fighter) => {
    const bidders = [...state.promotions]
      .sort((a, b) => marketFit(b, fighter) - marketFit(a, fighter))
      .slice(0, 3)
    const winner = bidders[0]
    if (!winner) return
    fighter.promotionId = winner.id
    state.chronicles.unshift(
      createChronicle(state, {
        type: 'signing',
        headline: `${winner.name} wins the race for ${shortFighterName(fighter)}`,
        body: `${bidders.map((promotion) => promotion.name).join(', ')} competed for the ${fighter.rarity.toLowerCase()} ${fighter.style.toLowerCase()}. ${winner.name} offered the strongest combination of fit, opportunity, and current momentum.`,
        promotionIds: bidders.map((promotion) => promotion.id),
        fighterIds: [fighter.id],
        importance: fighter.rarity === 'Rare' ? 64 : fighter.rarity === 'Uncommon' ? 48 : 35,
      }),
    )
  })

  return state
}

function simulatePromotionMonth(state: GameState, promotion: Promotion): void {
  const monthlyWins: Record<Gender, number> = { Male: 0, Female: 0 }
  const monthlyTitles: Record<Gender, number> = { Male: 0, Female: 0 }
  const meaningfulResults: BoutResult[] = []

  GENDERS.forEach((gender) => {
    const roster = rosterForPromotion(state, promotion.id, gender)
    const usedIds = new Set<string>()
    const titleBout = selectTitleBout(roster, promotion.currentChampions[gender], promotion)

    if (titleBout) {
      const [first, second] = titleBout
      usedIds.add(first.id)
      usedIds.add(second.id)
      const result = simulateBout(state, promotion, first, second, true)
      meaningfulResults.push(result)
      monthlyWins[gender] += 1
      if (result.titleChanged) monthlyTitles[gender] += 1

      if (result.titleChanged) {
        state.chronicles.unshift(
          createChronicle(state, {
            type: 'title',
            headline: `${shortFighterName(result.winner)} captures ${promotion.name} gold`,
            body: result.body,
            promotionIds: [promotion.id],
            fighterIds: [result.winner.id, result.loser.id],
            importance: result.winner.rarity === 'Legend' ? 90 : 80,
          }),
        )
      }
    }

    for (let fightIndex = 0; fightIndex < 2; fightIndex += 1) {
      const bout = selectRegularBout(roster, usedIds, promotion)
      if (!bout) break
      const [first, second] = bout
      usedIds.add(first.id)
      usedIds.add(second.id)
      const result = simulateBout(state, promotion, first, second, false)
      meaningfulResults.push(result)
      monthlyWins[gender] += 1
    }
  })

  const biggestStory = meaningfulResults.sort((a, b) => {
    const scoreA = (a.upset ? 20 : 0) + (a.titleChanged ? 30 : 0) + a.winner.fame
    const scoreB = (b.upset ? 20 : 0) + (b.titleChanged ? 30 : 0) + b.winner.fame
    return scoreB - scoreA
  })[0]

  if (biggestStory && !biggestStory.titleChanged) {
    state.chronicles.unshift(
      createChronicle(state, {
        type: biggestStory.upset ? 'record' : 'event',
        headline: biggestStory.headline,
        body: biggestStory.body,
        promotionIds: [promotion.id],
        fighterIds: [biggestStory.winner.id, biggestStory.loser.id],
        importance: biggestStory.upset ? 70 : 44,
      }),
    )
  }

  const yearStats = ensurePromotionYear(promotion, state.currentYear)
  yearStats.maleWins += monthlyWins.Male
  yearStats.femaleWins += monthlyWins.Female
  yearStats.maleTitles += monthlyTitles.Male
  yearStats.femaleTitles += monthlyTitles.Female
  updatePromotionBusiness(state, promotion)
}

function ageUniverse(state: GameState): void {
  state.fighters.forEach((fighter) => {
    fighter.age += 1
    if (fighter.age <= 27 && fighter.overall < fighter.potential) {
      fighter.overall = Math.min(fighter.potential, fighter.overall + (Math.random() < 0.65 ? 1 : 0))
    } else if (fighter.age >= 35 && Math.random() < 0.55) {
      fighter.overall = Math.max(40, fighter.overall - 1)
    }
    fighter.form = Math.max(35, Math.min(65, fighter.form + Math.round(randomBetween(-4, 4))))

    if (fighter.age >= 42 && fighter.promotionId && Math.random() < 0.16) {
      const promotion = state.promotions.find((candidate) => candidate.id === fighter.promotionId)
      if (promotion?.currentChampions[fighter.gender] === fighter.id) {
        promotion.currentChampions[fighter.gender] = null
      }
      fighter.isRetired = true
      fighter.promotionId = null
      state.chronicles.unshift(
        createChronicle(state, {
          type: 'record',
          headline: `${shortFighterName(fighter)} retires from the arena`,
          body: `${shortFighterName(fighter)} closes a career with ${fighter.stats.wins} wins, ${fighter.stats.titles} title reigns, and ${fighter.fame} fame. The full career remains preserved in the Almanac.`,
          promotionIds: promotion ? [promotion.id] : [],
          fighterIds: [fighter.id],
          importance: fighter.rarity === 'Legend' ? 88 : 58,
        }),
      )
    }
  })
}

export function simulateMonth(input: GameState): GameState {
  if (input.phase !== 'universe') return input
  let state = structuredClone(input)

  if (state.currentMonth % 2 === 1 && freeAgents(state).length > 0) {
    state = runSigningWindow(state, 2)
  }

  state.promotions.forEach((promotion) => simulatePromotionMonth(state, promotion))
  state.totalEvents += state.promotions.length

  const month = monthName(state.currentMonth)
  const promotionLeader = [...state.promotions].sort((a, b) => b.fame - a.fame)[0]
  const fighterLeader = [...state.fighters]
    .filter((fighter) => !fighter.isRetired)
    .sort((a, b) => b.fame - a.fame || b.stats.wins - a.stats.wins)[0]

  state.chronicles.unshift(
    createChronicle(state, {
      type: 'event',
      headline: `${month} ${state.currentYear}: ${promotionLeader?.name ?? 'The field'} leads the promotion war`,
      body: `${promotionLeader?.name ?? 'No promotion'} closes the month with ${promotionLeader?.fame ?? 0} fame, while ${fighterLeader ? shortFighterName(fighterLeader) : 'no fighter'} is the most famous active star at ${fighterLeader?.fame ?? 0}.`,
      promotionIds: promotionLeader ? [promotionLeader.id] : [],
      fighterIds: fighterLeader ? [fighterLeader.id] : [],
      importance: 42,
    }),
  )

  if (state.currentMonth === 11) {
    const completedYear = state.currentYear
    const commercialLeader = [...state.promotions].sort(
      (a, b) => (b.yearStats[String(completedYear)]?.revenue ?? 0) - (a.yearStats[String(completedYear)]?.revenue ?? 0),
    )[0]
    const mostFamous = [...state.fighters].sort((a, b) => b.fame - a.fame)[0]
    state.chronicles.unshift(
      createChronicle(state, {
        type: 'record',
        headline: `${completedYear} enters the history books`,
        body: `${commercialLeader?.name ?? 'No promotion'} finishes as the revenue leader. ${mostFamous ? shortFighterName(mostFamous) : 'No fighter'} closes the year as the universe’s most famous star.`,
        promotionIds: commercialLeader ? [commercialLeader.id] : [],
        fighterIds: mostFamous ? [mostFamous.id] : [],
        importance: 82,
      }),
    )
    ageUniverse(state)
    state.currentMonth = 0
    state.currentYear += 1
  } else {
    state.currentMonth += 1
  }

  return state
}

export function simulateMonths(input: GameState, months: number): GameState {
  let state = input
  for (let index = 0; index < months; index += 1) {
    state = simulateMonth(state)
  }
  return state
}
