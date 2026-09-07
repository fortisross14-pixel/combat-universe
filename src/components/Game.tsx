import { useEffect, useMemo, useState } from 'react'
import {
  fighterDisplayName,
  freeAgents,
  mergePromotions,
  monthName,
  moveFighter,
  renamePromotion,
  rosterForPromotion,
  shortFighterName,
  splitPromotion,
  updatePromotionIdentity,
} from '../engine/universe'
import { runSigningWindow, simulateWeek, simulateWeeks } from '../engine/simulation'
import { divisionForFighter, getDivisionRanking, getPromotionDivisions } from '../engine/rankings'
import type { Fighter, GameState, GameView, Gender, Promotion, Rarity } from '../types'
import FighterModal from './FighterModal'
import PromotionModal from './PromotionModal'
import FighterPortrait from './FighterPortrait'

interface GameProps {
  game: GameState
  onChange: (game: GameState) => void
  onExit: () => void
}

const NAV_ITEMS: { id: GameView; label: string; icon: string; description: string }[] = [
  { id: 'universe', label: 'Universe', icon: '◈', description: 'World overview' },
  { id: 'promotions', label: 'Promotions', icon: '◆', description: 'Organizations & titles' },
  { id: 'fighters', label: 'Fighters', icon: '✦', description: 'Careers & talent' },
  { id: 'rankings', label: 'Rankings', icon: '№', description: 'Résumé-based ladders' },
  { id: 'yearbook', label: 'Yearbook', icon: 'Y', description: 'Year-by-year history' },
  { id: 'hall', label: 'Hall of Fame', icon: '★', description: 'Historical greatness' },
  { id: 'market', label: 'Market', icon: '⇄', description: 'Limited resources' },
  { id: 'chronicles', label: 'Chronicles', icon: '≡', description: 'Permanent stories' },
  { id: 'almanac', label: 'Almanac', icon: '▥', description: 'Records & history' },
  { id: 'editor', label: 'Universe Editor', icon: '◇', description: 'Shape institutions' },
]

const rarityOrder: Record<Rarity, number> = {
  Generational: 6,
  Legend: 5,
  Epic: 4,
  Rare: 3,
  Uncommon: 2,
  Common: 1,
}

function formatMillions(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(2)}B`
  return `${value.toFixed(value >= 100 ? 0 : 2)}M`
}

function formatDate(game: GameState): string {
  return `Week ${game.currentWeek} · ${monthName(game.currentMonth)} ${game.currentYear}`
}

function promotionPower(promotion: Promotion): number {
  return Math.round(
    promotion.fame * 0.45 +
      promotion.currentViewers * 16 +
      promotion.revenue * 0.08 +
      promotion.competition * 0.28 +
      promotion.entertainment * 0.22,
  )
}

function championName(game: GameState, promotion: Promotion, gender: Gender): string {
  const champion = game.fighters.find((fighter) => fighter.id === promotion.currentChampions[gender])
  return champion ? shortFighterName(champion) : 'Vacant'
}


function promotionIdentityTag(promotion: Promotion): string {
  if (promotion.entertainment - promotion.competition >= 16) return 'Spectacle-first'
  if (promotion.competition - promotion.entertainment >= 16) return 'Competition-first'
  if (promotion.risk >= 75) return 'High risk'
  return 'Balanced prestige'
}

function promotionFlavorClass(promotion: Promotion): string {
  if (promotion.tone.toLowerCase().includes('chaotic') || promotion.entertainment >= 82) return 'flavor-spectacle'
  if (promotion.tone.toLowerCase().includes('prestige') || promotion.competition >= 82) return 'flavor-prestige'
  if (promotion.risk >= 75) return 'flavor-volatile'
  return 'flavor-classic'
}

function rivalryTier(score: number): string {
  if (score >= 90) return 'Historic'
  if (score >= 70) return 'Major'
  if (score >= 45) return 'Heated'
  return 'Developing'
}


function goatScore(fighter: Fighter): number {
  return Math.round(fighter.legacy * 10 + fighter.fame * 1.2 + fighter.stats.wins * 4 + fighter.stats.titles * 22 + fighter.stats.titleDefenses * 10 + fighter.stats.finishes * 1.5)
}

export default function Game({ game, onChange, onExit }: GameProps) {
  const [view, setView] = useState<GameView>('universe')
  const [fighterModalId, setFighterModalId] = useState<string | null>(null)
  const [promotionModalId, setPromotionModalId] = useState<string | null>(null)
  const [fighterSearch, setFighterSearch] = useState('')
  const [fighterGender, setFighterGender] = useState<'All' | Gender>('All')
  const [fighterPromotion, setFighterPromotion] = useState('All')
  const [fighterRarity, setFighterRarity] = useState<'All' | Rarity>('All')
  const [almanacGender, setAlmanacGender] = useState<'All' | Gender>('All')
  const [chronicleFilter, setChronicleFilter] = useState('All')
  const [yearbookYear, setYearbookYear] = useState(game.yearSummaries[0]?.year ?? game.currentYear)
  const [almanacSection, setAlmanacSection] = useState<'records' | 'belts' | 'eras'>('records')
  const [almanacPromotionId, setAlmanacPromotionId] = useState(game.promotions[0]?.id ?? '')
  const [rankingPromotionId, setRankingPromotionId] = useState(game.promotions[0]?.id ?? '')
  const [rankingGender, setRankingGender] = useState<Gender>('Male')
  const [rankingDivision, setRankingDivision] = useState('')

  const [editPromotionId, setEditPromotionId] = useState(game.promotions[0]?.id ?? '')
  const editPromotion = game.promotions.find((promotion) => promotion.id === editPromotionId) ?? game.promotions[0]
  const [competition, setCompetition] = useState(editPromotion?.competition ?? 50)
  const [entertainment, setEntertainment] = useState(editPromotion?.entertainment ?? 50)
  const [risk, setRisk] = useState(editPromotion?.risk ?? 50)
  const [tone, setTone] = useState(editPromotion?.tone ?? 'Prestige spectacle')
  const [renameValue, setRenameValue] = useState(editPromotion?.name ?? '')
  const [moveFighterId, setMoveFighterId] = useState(game.fighters.find((fighter) => fighter.promotionId)?.id ?? '')
  const [moveTargetId, setMoveTargetId] = useState(game.promotions[1]?.id ?? game.promotions[0]?.id ?? '')
  const [mergeA, setMergeA] = useState(game.promotions[0]?.id ?? '')
  const [mergeB, setMergeB] = useState(game.promotions[1]?.id ?? '')
  const [mergeName, setMergeName] = useState('Unified Combat Group')
  const [splitSource, setSplitSource] = useState(game.promotions[0]?.id ?? '')
  const [splitName, setSplitName] = useState('Rebel Combat Alliance')

  useEffect(() => {
    if (!editPromotion) return
    setCompetition(editPromotion.competition)
    setEntertainment(editPromotion.entertainment)
    setRisk(editPromotion.risk)
    setTone(editPromotion.tone)
    setRenameValue(editPromotion.name)
  }, [editPromotion])

  useEffect(() => {
    const firstPromotion = game.promotions[0]?.id ?? ''
    if (!game.promotions.some((promotion) => promotion.id === editPromotionId)) setEditPromotionId(firstPromotion)
    if (!game.promotions.some((promotion) => promotion.id === mergeA)) setMergeA(firstPromotion)
    if (!game.promotions.some((promotion) => promotion.id === mergeB)) setMergeB(game.promotions[1]?.id ?? firstPromotion)
    if (!game.promotions.some((promotion) => promotion.id === splitSource)) setSplitSource(firstPromotion)
    if (!game.promotions.some((promotion) => promotion.id === moveTargetId)) setMoveTargetId(firstPromotion)
  }, [editPromotionId, game.promotions, mergeA, mergeB, moveTargetId, splitSource])

  const selectedFighter = game.fighters.find((fighter) => fighter.id === fighterModalId) ?? null
  const selectedPromotion = game.promotions.find((promotion) => promotion.id === promotionModalId) ?? null
  const rankingPromotion = game.promotions.find((promotion) => promotion.id === rankingPromotionId) ?? game.promotions[0]
  const availableRankingDivisions = useMemo(() => rankingPromotion
    ? getPromotionDivisions(game, rankingPromotion).filter((entry) => entry.gender === rankingGender).map((entry) => entry.division)
    : [], [game, rankingGender, rankingPromotion])
  useEffect(() => {
    if (!rankingPromotion) return
    if (!availableRankingDivisions.includes(rankingDivision)) setRankingDivision(availableRankingDivisions[0] ?? '')
  }, [availableRankingDivisions, rankingDivision, rankingPromotion])
  const rankingRows = useMemo(() => rankingPromotion && rankingDivision
    ? getDivisionRanking(game, rankingPromotion, rankingGender, rankingDivision)
    : [], [game, rankingDivision, rankingGender, rankingPromotion])

  const promotionRanking = useMemo(
    () => [...game.promotions].sort((a, b) => promotionPower(b) - promotionPower(a)),
    [game.promotions],
  )

  const activeFighters = useMemo(
    () => game.fighters.filter((fighter) => fighter.promotionId && !fighter.isRetired),
    [game.fighters],
  )

  const fighterRanking = useMemo(
    () => [...activeFighters].sort((a, b) => b.fame - a.fame || b.stats.wins - a.stats.wins || b.overall - a.overall),
    [activeFighters],
  )

  const filteredFighters = useMemo(() => {
    const query = fighterSearch.trim().toLowerCase()
    return game.fighters
      .filter((fighter) => !fighter.isDraftEligible || fighter.promotionId)
      .filter((fighter) => fighterGender === 'All' || fighter.gender === fighterGender)
      .filter((fighter) => fighterPromotion === 'All' || fighter.promotionId === fighterPromotion || (fighterPromotion === 'Free Agents' && !fighter.promotionId && !fighter.isRetired))
      .filter((fighter) => fighterRarity === 'All' || fighter.rarity === fighterRarity)
      .filter((fighter) => {
        if (!query) return true
        return fighterDisplayName(fighter).toLowerCase().includes(query) || fighter.style.toLowerCase().includes(query) || fighter.nationality.toLowerCase().includes(query)
      })
      .sort((a, b) => b.fame - a.fame || rarityOrder[b.rarity] - rarityOrder[a.rarity] || b.overall - a.overall)
  }, [fighterGender, fighterPromotion, fighterRarity, fighterSearch, game.fighters])

  const freeAgentList = useMemo(
    () => freeAgents(game).sort((a, b) => rarityOrder[b.rarity] - rarityOrder[a.rarity] || b.overall - a.overall || b.charisma - a.charisma),
    [game],
  )

  const filteredChronicles = useMemo(
    () => game.chronicles.filter((entry) => chronicleFilter === 'All' || entry.type === chronicleFilter),
    [chronicleFilter, game.chronicles],
  )

  const almanacFighters = useMemo(
    () => game.fighters
      .filter((fighter) => fighter.stats.fights > 0 || fighter.promotionId)
      .filter((fighter) => almanacGender === 'All' || fighter.gender === almanacGender)
      .sort((a, b) => {
        const scoreA = a.legacy * 10 + a.fame + a.stats.wins * 4 + a.stats.titles * 18 + a.stats.titleDefenses * 8
        const scoreB = b.legacy * 10 + b.fame + b.stats.wins * 4 + b.stats.titles * 18 + b.stats.titleDefenses * 8
        return scoreB - scoreA
      }),
    [almanacGender, game.fighters],
  )

  const almanacPromotions = useMemo(() => {
    return game.promotions
      .map((promotion) => {
        const roster = rosterForPromotion(game, promotion.id).filter((fighter) => almanacGender === 'All' || fighter.gender === almanacGender)
        return {
          promotion,
          rosterFame: roster.reduce((sum, fighter) => sum + fighter.fame, 0),
          wins: roster.reduce((sum, fighter) => sum + fighter.stats.wins, 0),
          titles: roster.reduce((sum, fighter) => sum + fighter.stats.titles, 0),
          stars: roster.length,
        }
      })
      .sort((a, b) => b.rosterFame - a.rosterFame || b.wins - a.wins)
  }, [almanacGender, game])

  const selectedYearSummary = game.yearSummaries.find((summary) => summary.year === yearbookYear) ?? game.yearSummaries[0] ?? null
  const allBouts = useMemo(() => game.events.flatMap((event) => event.bouts.map((bout) => ({ bout, event }))), [game.events])
  const topQualityFights = useMemo(() => [...allBouts].sort((a, b) => b.bout.fightRating - a.bout.fightRating || b.bout.importance - a.bout.importance), [allBouts])
  const topAudienceFights = useMemo(() => [...allBouts].sort((a, b) => b.bout.audience - a.bout.audience || b.bout.ppvBuys - a.bout.ppvBuys), [allBouts])
  const topQualityEvents = useMemo(() => [...game.events].sort((a, b) => b.qualityRating - a.qualityRating || b.eventRating - a.eventRating), [game.events])
  const topAudienceEvents = useMemo(() => [...game.events].sort((a, b) => b.audience - a.audience || b.ppvBuys - a.ppvBuys), [game.events])
  const hallFighters = useMemo(() => game.fighters.filter((fighter) => fighter.isRetired).sort((a, b) => goatScore(b) - goatScore(a)), [game.fighters])
  const hallWatchlist = useMemo(() => game.fighters.filter((fighter) => !fighter.isRetired && fighter.stats.fights > 0).sort((a, b) => goatScore(b) - goatScore(a)).slice(0, 15), [game.fighters])
  const lineagePromotion = game.promotions.find((promotion) => promotion.id === almanacPromotionId) ?? game.promotions[0]
  const lineageGroups = useMemo(() => {
    if (!lineagePromotion) return [] as { key: string; gender: string; division: string; reigns: Promotion['titleHistory'] }[]
    const groups = new Map<string, Promotion['titleHistory']>()
    lineagePromotion.titleHistory.forEach((title) => {
      if (almanacGender !== 'All' && title.gender !== almanacGender) return
      const key = `${title.gender}:${title.weightClass}`
      groups.set(key, [...(groups.get(key) ?? []), title])
    })
    return [...groups.entries()].map(([key, reigns]) => ({ key, gender: key.split(':')[0], division: key.split(':').slice(1).join(':'), reigns: [...reigns].sort((a, b) => a.year - b.year || (a.week ?? 1) - (b.week ?? 1)) }))
  }, [almanacGender, lineagePromotion])

  const topPromotion = promotionRanking[0]
  const topFighter = fighterRanking[0]
  const latestStory = game.chronicles[0]
  const latestEvent = game.events[0] ?? null
  const topRivalry = useMemo(() => [...game.rivalries].sort((a, b) => b.score - a.score || b.meetings - a.meetings)[0] ?? null, [game.rivalries])
  const topAward = useMemo(() => [...game.awards].sort((a, b) => b.year - a.year)[0] ?? null, [game.awards])
  const totalRevenue = game.promotions.reduce((sum, promotion) => sum + promotion.revenue, 0)
  const totalViewers = game.promotions.reduce((sum, promotion) => sum + promotion.totalViewers, 0)
  const totalTitleChanges = game.promotions.reduce((sum, promotion) => sum + promotion.titleHistory.length, 0)

  const openFighter = (fighterId: string) => {
    setPromotionModalId(null)
    setFighterModalId(fighterId)
  }

  const openPromotion = (promotionId: string) => {
    setFighterModalId(null)
    setPromotionModalId(promotionId)
  }

  const applyIdentity = () => {
    if (!editPromotion) return
    onChange(updatePromotionIdentity(game, editPromotion.id, { competition, entertainment, risk, tone }))
  }

  const applyRename = () => {
    if (!editPromotion || !renameValue.trim()) return
    onChange(renamePromotion(game, editPromotion.id, renameValue))
  }

  const applyMove = () => {
    if (!moveFighterId || !moveTargetId) return
    onChange(moveFighter(game, moveFighterId, moveTargetId))
  }

  const applyMerge = () => {
    if (mergeA === mergeB) {
      window.alert('Choose two different promotions.')
      return
    }
    if (!window.confirm('Merge these promotions and permanently combine their rosters and history?')) return
    onChange(mergePromotions(game, mergeA, mergeB, mergeName))
  }

  const applySplit = () => {
    if (!window.confirm('Create a splinter promotion and move approximately half of the roster?')) return
    onChange(splitPromotion(game, splitSource, splitName))
  }

  const renderUniverse = () => (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">The Combat Observer</p>
          <h1>The universe at a glance</h1>
          <p>Follow only the stories, records, movements, and institutional battles that matter.</p>
        </div>
        <span className="page-date">{formatDate(game)}</span>
      </div>

      <section className="observer-hero">
        <article className="lead-story" style={{ '--promotion-color': topPromotion?.color } as React.CSSProperties}>
          <span className="lead-story-label">Top story</span>
          <h2>{latestStory?.headline ?? 'The Founding Draft is complete'}</h2>
          <p>{latestStory?.body ?? 'The first events will crown champions and begin every permanent career record.'}</p>
          <div className="lead-story-footer">
            <span>{latestStory ? `${monthName(latestStory.month)} ${latestStory.year}` : formatDate(game)}</span>
            <span>{latestStory?.type ?? 'draft'}</span>
          </div>
        </article>

        <div className="observer-side-stories">
          {game.chronicles.slice(1, 5).map((story) => (
            <article className="observer-story" key={story.id}>
              <span>{story.type}</span>
              <strong>{story.headline}</strong>
              <p>{story.body}</p>
            </article>
          ))}
          {game.chronicles.length < 2 && (
            <article className="observer-story empty-story">
              <span>Next chapter</span>
              <strong>Sixteen inaugural titles are waiting</strong>
              <p>Simulate the first month to crown a male and female champion in every promotion.</p>
            </article>
          )}
        </div>
      </section>

      <section className="metric-grid world-metric-grid">
        <article className="metric-card">
          <span>Promotion leader</span>
          <strong>{topPromotion?.shortName ?? '—'}</strong>
          <small>{topPromotion?.fame ?? 0} fame · {promotionPower(topPromotion ?? game.promotions[0])} power</small>
        </article>
        <article className="metric-card">
          <span>Most famous fighter</span>
          <strong>{topFighter ? shortFighterName(topFighter) : 'No leader yet'}</strong>
          <small>{topFighter?.fame ?? 0} fame · {topFighter?.stats.wins ?? 0} wins</small>
        </article>
        <article className="metric-card">
          <span>Universe viewers</span>
          <strong>{formatMillions(totalViewers)}</strong>
          <small>{formatMillions(game.promotions.reduce((sum, promotion) => sum + promotion.currentViewers, 0))} this month</small>
        </article>
        <article className="metric-card">
          <span>Universe revenue</span>
          <strong>${formatMillions(totalRevenue)}</strong>
          <small>{totalTitleChanges} championship changes</small>
        </article>
      </section>

      <section className="showcase-grid">
        <article className="showcase-panel fighter-spotlight">
          <div className="showcase-heading">
            <span className="showcase-kicker">Face of the era</span>
            <strong>{topFighter ? shortFighterName(topFighter) : 'No leader yet'}</strong>
          </div>
          {topFighter ? (
            <div className="showcase-body">
              <FighterPortrait fighter={topFighter} size="lg" accent={game.promotions.find((promotion) => promotion.id === topFighter.promotionId)?.color} />
              <div className="showcase-copy">
                <p>{topFighter.socialPersonality} · {topFighter.competitivePersonality}</p>
                <h3>{topFighter.fame} Fame · {topFighter.legacy.toFixed(0)} Legacy</h3>
                <small>{topFighter.stats.wins}-{topFighter.stats.losses}-{topFighter.stats.draws} · {topFighter.style} · {topFighter.weightClass}</small>
              </div>
            </div>
          ) : <p className="empty-copy">Simulate the first months to create stars.</p>}
        </article>
        <article className="showcase-panel rivalry-spotlight">
          <div className="showcase-heading">
            <span className="showcase-kicker">Hottest rivalry</span>
            <strong>{topRivalry ? `${topRivalry.fighterAName} vs ${topRivalry.fighterBName}` : 'No rivalry yet'}</strong>
          </div>
          {topRivalry ? (
            <div className="rivalry-duel">
              <div className="rivalry-duel-fighter">
                {(() => { const fighter = game.fighters.find((entry) => entry.id === topRivalry.fighterAId); return fighter ? <FighterPortrait fighter={fighter} size="md" accent={game.promotions.find((promotion) => promotion.id === fighter.promotionId)?.color} /> : null })()}
                <span>{topRivalry.fighterAName}</span>
                <small>{topRivalry.winsA} wins</small>
              </div>
              <div className="rivalry-duel-center">
                <b>{topRivalry.score}</b>
                <small>{topRivalry.meetings} meetings</small>
                <em>{topRivalry.titleFights} title fights</em>
              </div>
              <div className="rivalry-duel-fighter">
                {(() => { const fighter = game.fighters.find((entry) => entry.id === topRivalry.fighterBId); return fighter ? <FighterPortrait fighter={fighter} size="md" accent={game.promotions.find((promotion) => promotion.id === fighter.promotionId)?.color} /> : null })()}
                <span>{topRivalry.fighterBName}</span>
                <small>{topRivalry.winsB} wins</small>
              </div>
            </div>
          ) : <p className="empty-copy">Meaningful repeat fights will heat up over time.</p>}
        </article>
        <article className="showcase-panel award-spotlight">
          <div className="showcase-heading">
            <span className="showcase-kicker">Latest yearbook</span>
            <strong>{game.yearSummaries[0] ? `Year ${game.yearSummaries[0].year}` : `Year ${game.currentYear} in progress`}</strong>
          </div>
          <div className="showcase-copy">
            <h3>{game.yearSummaries[0] ? `${game.yearSummaries[0].topFighters[0]?.fighterName ?? '—'} · ${game.yearSummaries[0].topPromotionName}` : `Week ${game.currentWeek} of 52`}</h3>
            <small>{game.yearSummaries[0] ? `${game.yearSummaries[0].retiredFighterNames.length} retirements · ${game.yearSummaries[0].newProspectNames.length} prospects · ${game.yearSummaries[0].promotionMoves.length} promotion moves` : 'Every week is feeding the first permanent Yearbook page.'}</small>
            {topAward ? <small className="inline-highlight">Latest award: {topAward.category} — {topAward.fighterNames.join(' · ')}</small> : null}
          </div>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-panel span-two">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Promotion war</p>
              <h2>Current power ranking</h2>
            </div>
            <button className="text-button" type="button" onClick={() => setView('promotions')}>Open all promotions →</button>
          </div>
          <div className="ranking-list">
            {promotionRanking.map((promotion, index) => (
              <button className="ranking-row" type="button" key={promotion.id} onClick={() => openPromotion(promotion.id)}>
                <span className="ranking-position">{index + 1}</span>
                <span className="promotion-dot" style={{ background: promotion.color }}>{promotion.shortName}</span>
                <span className="ranking-name">
                  <strong>{promotion.name}</strong>
                  <small>{promotion.archetype}</small>
                  <em className="promotion-identity-tag">{promotionIdentityTag(promotion)}</em>
                </span>
                <span className="ranking-stat"><small>Fame</small><strong>{promotion.fame}</strong></span>
                <span className="ranking-stat"><small>Viewers</small><strong>{formatMillions(promotion.currentViewers)}</strong></span>
                <span className="ranking-stat"><small>Revenue</small><strong>${formatMillions(promotion.revenue)}</strong></span>
                <span className="power-score">{promotionPower(promotion)}</span>
              </button>
            ))}
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Stars of the era</p>
              <h2>Fame leaders</h2>
            </div>
          </div>
          <div className="mini-leaderboard">
            {fighterRanking.slice(0, 8).map((fighter, index) => (
              <button type="button" key={fighter.id} onClick={() => openFighter(fighter.id)}>
                <span>{index + 1}</span>
                <FighterPortrait fighter={fighter} size="xs" accent={game.promotions.find((promotion) => promotion.id === fighter.promotionId)?.color} />
                <div className="mini-leaderboard-copy">
                  <b>{shortFighterName(fighter)}</b>
                  <small>{fighter.gender} · {fighter.stats.wins}-{fighter.stats.losses}</small>
                </div>
                <strong>{fighter.fame}</strong>
              </button>
            ))}
          </div>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Championship picture</p>
              <h2>Current champions</h2>
            </div>
          </div>
          <div className="champion-list">
            {promotionRanking.map((promotion) => (
              <button type="button" key={promotion.id} onClick={() => openPromotion(promotion.id)}>
                <span className="promotion-dot small" style={{ background: promotion.color }}>{promotion.shortName}</span>
                <span><small>Male</small><strong>{championName(game, promotion, 'Male')}</strong></span>
                <span><small>Female</small><strong>{championName(game, promotion, 'Female')}</strong></span>
              </button>
            ))}
          </div>
        </article>

        <article className="dashboard-panel span-two">
          <div className="section-heading">
            <div>
              <p className="eyebrow">History in motion</p>
              <h2>Latest chronicles</h2>
            </div>
            <button className="text-button" type="button" onClick={() => setView('chronicles')}>Read all →</button>
          </div>
          <div className="chronicle-preview-grid">
            {game.chronicles.slice(0, 6).map((entry) => (
              <article key={entry.id}>
                <span>{monthName(entry.month)} {entry.year}</span>
                <strong>{entry.headline}</strong>
                <p>{entry.body}</p>
              </article>
            ))}
          </div>
        </article>
      </section>
    </>
  )

  const renderPromotions = () => (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Organizations are characters</p>
          <h1>Promotions</h1>
          <p>Compare fame, viewers, revenue, identity, rosters, champions, and complete institutional histories.</p>
        </div>
      </div>
      <section className="promotion-card-grid">
        {promotionRanking.map((promotion, index) => {
          const roster = rosterForPromotion(game, promotion.id)
          return (
            <button
              className={`promotion-card ${promotionFlavorClass(promotion)}`}
              type="button"
              key={promotion.id}
              onClick={() => openPromotion(promotion.id)}
              style={{ '--promotion-color': promotion.color } as React.CSSProperties}
            >
              <span className="promotion-rank">#{index + 1}</span>
              <div className="promotion-card-heading">
                <span className="promotion-large-logo">{promotion.shortName}</span>
                <span>
                  <strong>{promotion.name}</strong>
                  <small>{promotion.archetype}</small>
                  <em className="promotion-identity-tag">{promotionIdentityTag(promotion)}</em>
                </span>
              </div>
              <div className="promotion-card-metrics">
                <span><small>Fame</small><strong>{promotion.fame}</strong></span>
                <span><small>Viewers</small><strong>{formatMillions(promotion.currentViewers)}</strong></span>
                <span><small>Revenue</small><strong>${formatMillions(promotion.revenue)}</strong></span>
                <span><small>Roster</small><strong>{roster.length}</strong></span>
              </div>
              <div className="promotion-champions">
                <span><small>Male champion</small><strong>{championName(game, promotion, 'Male')}</strong></span>
                <span><small>Female champion</small><strong>{championName(game, promotion, 'Female')}</strong></span>
              </div>
              <div className="identity-spectrum">
                <span>Competition {promotion.competition}</span>
                <div><i style={{ width: `${promotion.competition}%` }} /></div>
                <span>Entertainment {promotion.entertainment}</span>
                <div><i style={{ width: `${promotion.entertainment}%` }} /></div>
              </div>
            </button>
          )
        })}
      </section>
    </>
  )

  const renderFighters = () => (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Every career begins at zero</p>
          <h1>Fighters</h1>
          <p>Open any fighter to inspect rarity, style, ratings, promotion history, brand breakdown, and year-by-year statistics.</p>
        </div>
        <span className="page-date">{filteredFighters.length} results</span>
      </div>

      <div className="filter-panel fighter-filter-panel">
        <label>
          <span>Search</span>
          <input className="text-input" value={fighterSearch} onChange={(event) => setFighterSearch(event.target.value)} placeholder="Name, ring name, style, country…" />
        </label>
        <label>
          <span>Gender</span>
          <select className="select-input" value={fighterGender} onChange={(event) => setFighterGender(event.target.value as 'All' | Gender)}>
            <option value="All">All</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </label>
        <label>
          <span>Promotion</span>
          <select className="select-input" value={fighterPromotion} onChange={(event) => setFighterPromotion(event.target.value)}>
            <option value="All">All</option>
            {game.promotions.map((promotion) => <option key={promotion.id} value={promotion.id}>{promotion.name}</option>)}
            <option value="Free Agents">Free agents</option>
          </select>
        </label>
        <label>
          <span>Rarity</span>
          <select className="select-input" value={fighterRarity} onChange={(event) => setFighterRarity(event.target.value as 'All' | Rarity)}>
            <option value="All">All</option>
            <option value="Generational">Generational</option>
            <option value="Legend">Legend</option>
            <option value="Epic">Epic</option>
            <option value="Rare">Rare</option>
            <option value="Uncommon">Uncommon</option>
            <option value="Common">Common</option>
          </select>
        </label>
      </div>

      <section className="fighter-card-grid">
        {filteredFighters.slice(0, 160).map((fighter) => {
          const promotion = game.promotions.find((candidate) => candidate.id === fighter.promotionId)
          const isChampion = promotion?.currentChampions[fighter.gender] === fighter.id
          return (
            <button className="fighter-card" type="button" key={fighter.id} onClick={() => openFighter(fighter.id)}>
              <span className={`fighter-rarity-stripe ${fighter.rarity.toLowerCase()}`} />
              <FighterPortrait fighter={fighter} size="sm" accent={promotion?.color} className="fighter-card-avatar" />
              <span className="fighter-card-content">
                <span className="fighter-card-tags">
                  <b className={`rarity-badge ${fighter.rarity.toLowerCase()}`}>{fighter.rarity}</b>
                  <small>{fighter.gender}</small>
                  {isChampion && <small className="champion-badge">Champion</small>}
                </span>
                <strong>{shortFighterName(fighter)}</strong>
                <small>{fighter.ringName ? `${fighter.firstName} ${fighter.lastName}` : fighter.nationality}</small>
                <span className="fighter-style-line">{fighter.style} · {fighter.weightClass} · Age {fighter.age}</span>
                <span className="fighter-personality-line">{fighter.socialPersonality} · {fighter.competitivePersonality}</span>
              </span>
              <span className="fighter-card-stats">
                <b>{fighter.fame}<small>Fame</small></b>
                <b>{fighter.stats.wins}<small>Wins</small></b>
                <b>{fighter.stats.titles}<small>Titles</small></b>
                <b>{promotion?.shortName ?? (fighter.isRetired ? 'RET' : 'FA')}<small>Brand</small></b>
              </span>
            </button>
          )
        })}
      </section>
    </>
  )

  const renderRankings = () => {
    const champion = rankingRows.find((entry) => entry.isChampion)
    const contenders = rankingRows.filter((entry) => !entry.isChampion)
    const divisionFighterIds = new Set(rankingRows.map((entry) => entry.fighter.id))
    const divisionRivalry = [...game.rivalries]
      .filter((rivalry) => divisionFighterIds.has(rivalry.fighterAId) && divisionFighterIds.has(rivalry.fighterBId))
      .sort((a, b) => b.score - a.score)[0]
    return (
      <>
        <div className="page-heading">
          <div>
            <p className="eyebrow">Results create opportunity</p>
            <h1>Rankings</h1>
            <p>OVR does not determine position. Wins, opponent rank, recency, title results, streaks and activity build the résumé.</p>
          </div>
          <span className="page-date">{rankingPromotion?.name ?? '—'}</span>
        </div>

        <div className="filter-panel rankings-filter-panel">
          <label><span>Promotion</span><select className="select-input" value={rankingPromotion?.id ?? ''} onChange={(event) => setRankingPromotionId(event.target.value)}>{game.promotions.map((promotion) => <option key={promotion.id} value={promotion.id}>{promotion.name}</option>)}</select></label>
          <label><span>Gender</span><select className="select-input" value={rankingGender} onChange={(event) => setRankingGender(event.target.value as Gender)}><option value="Male">Male</option><option value="Female">Female</option></select></label>
          <label><span>Division</span><select className="select-input" value={rankingDivision} onChange={(event) => setRankingDivision(event.target.value)}>{availableRankingDivisions.map((division) => <option key={division} value={division}>{division}</option>)}</select></label>
        </div>

        <section className="rankings-podium">
          {rankingRows.slice(0, 3).map((entry, index) => {
            const promotionColor = rankingPromotion?.color
            return (
              <button
                type="button"
                key={entry.fighter.id}
                className={`podium-card ${index === 0 ? 'is-first' : index === 1 ? 'is-second' : 'is-third'}`}
                onClick={() => openFighter(entry.fighter.id)}
                style={{ '--promotion-color': promotionColor } as React.CSSProperties}
              >
                <span className="podium-rank">{entry.isChampion ? 'Champion' : `#${entry.rank}`}</span>
                <FighterPortrait fighter={entry.fighter} size={index === 0 ? 'lg' : 'md'} accent={promotionColor} champion={entry.isChampion} />
                <strong>{shortFighterName(entry.fighter)}</strong>
                <small>{entry.fighter.rarity} · {entry.fighter.style}</small>
                <em>{entry.fighter.socialPersonality} · {entry.fighter.competitivePersonality}</em>
                <div className="podium-stats">
                  <span><b>{entry.score.toFixed(0)}</b><small>Résumé</small></span>
                  <span><b>{entry.fighter.fame}</b><small>Fame</small></span>
                  <span><b>{entry.fighter.stats.wins}-{entry.fighter.stats.losses}</b><small>Record</small></span>
                </div>
              </button>
            )
          })}
        </section>

        {divisionRivalry ? (
          <section className="rivalry-heat-panel">
            <div className="section-heading">
              <div><p className="eyebrow">Division pulse</p><h2>{rivalryTier(divisionRivalry.score)} rivalry</h2></div>
              <span>{divisionRivalry.score}/100 heat</span>
            </div>
            <div className="rivalry-heat-layout">
              <div className="rivalry-heat-copy">
                <strong>{divisionRivalry.fighterAName} vs {divisionRivalry.fighterBName}</strong>
                <p>{divisionRivalry.meetings} meetings · {divisionRivalry.winsA}-{divisionRivalry.winsB} series · {divisionRivalry.titleFights} title fights</p>
                <div className="heat-meter"><i style={{ width: `${divisionRivalry.score}%` }} /></div>
              </div>
            </div>
          </section>
        ) : null}

        <section className="metric-grid rankings-highlights">
          <article className="metric-card"><span>Champion</span><strong>{champion ? shortFighterName(champion.fighter) : 'Vacant'}</strong><small>{champion ? `${champion.fighter.legacy.toFixed(0)} legacy · ${champion.fighter.stats.titleDefenses} defenses` : 'Top contenders can fight for vacant gold'}</small></article>
          <article className="metric-card"><span>#1 contender</span><strong>{contenders[0] ? shortFighterName(contenders[0].fighter) : '—'}</strong><small>{contenders[0] ? `${contenders[0].score.toFixed(0)} résumé pts` : 'No ranked contender'}</small></article>
          <article className="metric-card"><span>Hottest rivalry</span><strong>{divisionRivalry ? `${divisionRivalry.fighterAName} / ${divisionRivalry.fighterBName}` : '—'}</strong><small>{divisionRivalry ? `${divisionRivalry.score}/100 · ${divisionRivalry.meetings} fights` : 'No meaningful rivalry yet'}</small></article>
          <article className="metric-card"><span>Division depth</span><strong>{rankingRows.length}</strong><small>{rankingDivision || 'No division'} fighters</small></article>
        </section>

        <section className="dashboard-panel rankings-panel">
          <div className="section-heading"><div><p className="eyebrow">Current ladder</p><h2>{rankingGender} {rankingDivision}</h2></div><span>Résumé score</span></div>
          <div className="table-scroll">
            <table className="data-table interactive-table rankings-table">
              <thead><tr><th>Rank</th><th>Fighter</th><th>Record</th><th>Streak</th><th>Résumé</th><th>Legacy</th><th>Fame</th><th>Personality</th><th>OVR</th></tr></thead>
              <tbody>
                {rankingRows.length === 0 ? <tr><td colSpan={9} className="empty-table-cell">No active fighters in this division.</td></tr> : rankingRows.map((entry) => (
                  <tr key={entry.fighter.id} onClick={() => openFighter(entry.fighter.id)}>
                    <td><strong>{entry.isChampion ? 'C' : `#${entry.rank}`}</strong></td>
                    <td><strong>{shortFighterName(entry.fighter)}</strong><small>{entry.fighter.rarity} · {entry.fighter.style}</small></td>
                    <td>{entry.fighter.stats.wins}-{entry.fighter.stats.losses}-{entry.fighter.stats.draws}</td>
                    <td>{entry.fighter.currentStreak > 0 ? `${entry.fighter.currentStreak}W` : entry.fighter.currentStreak < 0 ? `${Math.abs(entry.fighter.currentStreak)}L` : '—'}</td>
                    <td><strong>{entry.score.toFixed(0)}</strong></td>
                    <td>{entry.fighter.legacy.toFixed(0)}</td>
                    <td>{entry.fighter.fame}</td>
                    <td><span>{entry.fighter.socialPersonality}</span><small>{entry.fighter.competitivePersonality}</small></td>
                    <td>{entry.fighter.overall}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </>
    )
  }

  const renderMarket = () => (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Promotions fight for limited resources</p>
          <h1>Talent Market</h1>
          <p>Rare, Uncommon, and Common talent begins outside the draft. Promotions compete based on identity fit, opportunity, fame, and momentum.</p>
        </div>
        <button className="button primary" type="button" onClick={() => onChange(runSigningWindow(game, 8))} disabled={freeAgentList.length === 0}>
          Run eight-player signing window
        </button>
      </div>

      <section className="metric-grid market-metrics">
        <article className="metric-card"><span>Free agents</span><strong>{freeAgentList.length}</strong><small>Limited pool remaining</small></article>
        <article className="metric-card"><span>Rare</span><strong>{freeAgentList.filter((fighter) => fighter.rarity === 'Rare').length}</strong><small>Highest non-draft tier</small></article>
        <article className="metric-card"><span>Uncommon</span><strong>{freeAgentList.filter((fighter) => fighter.rarity === 'Uncommon').length}</strong><small>Development talent</small></article>
        <article className="metric-card"><span>Common</span><strong>{freeAgentList.filter((fighter) => fighter.rarity === 'Common').length}</strong><small>Depth and surprises</small></article>
      </section>

      <section className="dashboard-grid market-layout">
        <article className="dashboard-panel span-two">
          <div className="section-heading">
            <div><p className="eyebrow">Available now</p><h2>Free-agent board</h2></div>
          </div>
          <div className="table-scroll">
            <table className="data-table interactive-table">
              <thead><tr><th>#</th><th>Fighter</th><th>Gender</th><th>Rarity</th><th>Style</th><th>Age</th><th>OVR</th><th>CHA</th><th>POT</th></tr></thead>
              <tbody>
                {freeAgentList.slice(0, 100).map((fighter, index) => (
                  <tr key={fighter.id} onClick={() => openFighter(fighter.id)}>
                    <td>{index + 1}</td>
                    <td><strong>{shortFighterName(fighter)}</strong><small>{fighter.nationality}</small></td>
                    <td>{fighter.gender}</td>
                    <td><span className={`rarity-badge ${fighter.rarity.toLowerCase()}`}>{fighter.rarity}</span></td>
                    <td>{fighter.style}</td>
                    <td>{fighter.age}</td>
                    <td>{fighter.overall}</td>
                    <td>{fighter.charisma}</td>
                    <td>{fighter.potential}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="section-heading"><div><p className="eyebrow">Recent competition</p><h2>Market moves</h2></div></div>
          <div className="market-feed">
            {game.chronicles.filter((entry) => entry.type === 'signing').slice(0, 12).map((entry) => (
              <article key={entry.id}><span>{monthName(entry.month)} {entry.year}</span><strong>{entry.headline}</strong><p>{entry.body}</p></article>
            ))}
            {game.chronicles.every((entry) => entry.type !== 'signing') && <p className="empty-copy">No post-draft signings yet.</p>}
          </div>
        </article>
      </section>
    </>
  )

  const renderChronicles = () => (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">History with memory</p>
          <h1>Chronicles</h1>
          <p>Title changes, upsets, signings, records, mergers, splits, and institutional shifts remain readable forever.</p>
        </div>
        <select className="select-input compact-select" value={chronicleFilter} onChange={(event) => setChronicleFilter(event.target.value)}>
          <option value="All">All stories</option>
          <option value="title">Titles</option>
          <option value="event">Events</option>
          <option value="signing">Signings</option>
          <option value="record">Records</option>
          <option value="rivalry">Rivalries</option>
          <option value="ranking">Rankings</option>
          <option value="structural">Structural</option>
          <option value="draft">Draft</option>
        </select>
      </div>
      {latestEvent && (() => {
        const mainEvent = latestEvent.bouts.find((bout) => bout.fightId === latestEvent.headlineFightId) ?? latestEvent.bouts[0]
        const promotion = game.promotions.find((entry) => entry.id === latestEvent.promotionId)
        return (
          <section className={`event-spotlight ${promotion ? promotionFlavorClass(promotion) : ''}`} style={{ '--promotion-color': promotion?.color ?? '#d8a14a' } as React.CSSProperties}>
            <div className="event-spotlight-copy">
              <p className="eyebrow">Featured event</p>
              <h2>{latestEvent.name}</h2>
              <p>{latestEvent.promotionName} staged {latestEvent.bouts.length} bouts and posted an event rating of {latestEvent.eventRating}.</p>
              {mainEvent ? <div className="event-headline-card"><strong>{mainEvent.fighterAName} vs {mainEvent.fighterBName}</strong><small>{mainEvent.weightClass} · {mainEvent.titleBout ? 'Title fight' : 'Main attraction'} · {mainEvent.method}</small></div> : null}
            </div>
            <div className="event-spotlight-side">
              <span>{monthName(latestEvent.month)} {latestEvent.year}</span>
              <b>{latestEvent.eventRating}</b>
              <small>Event rating</small>
            </div>
          </section>
        )
      })()}
      <section className="chronicle-timeline">
        {filteredChronicles.map((entry) => (
          <article className={`chronicle-entry importance-${entry.importance >= 80 ? 'high' : entry.importance >= 55 ? 'medium' : 'normal'}`} key={entry.id}>
            <div className="chronicle-date"><strong>{entry.year}</strong><span>{monthName(entry.month)}</span></div>
            <div className="chronicle-marker"><i /></div>
            <div className="chronicle-card">
              <div className="chronicle-card-top"><span>{entry.type}</span><small>Importance {entry.importance}</small></div>
              <h2>{entry.headline}</h2>
              <p>{entry.body}</p>
              <div className="chronicle-links">
                {entry.promotionIds.map((promotionId) => {
                  const promotion = game.promotions.find((candidate) => candidate.id === promotionId)
                  return promotion ? <button type="button" key={promotionId} onClick={() => openPromotion(promotionId)}>{promotion.name}</button> : null
                })}
                {entry.fighterIds.slice(0, 4).map((fighterId) => {
                  const fighter = game.fighters.find((candidate) => candidate.id === fighterId)
                  return fighter ? <button type="button" key={fighterId} onClick={() => openFighter(fighterId)}>{shortFighterName(fighter)}</button> : null
                })}
              </div>
            </div>
          </article>
        ))}
      </section>
    </>
  )

  const renderYearbook = () => {
    const summary = selectedYearSummary
    const yearAwards = summary ? game.awards.filter((award) => award.year === summary.year) : []
    const fightRows = summary ? summary.topFightIds.map((id) => allBouts.find((entry) => entry.bout.fightId === id)).filter(Boolean) : []
    const eventRows = summary ? summary.topEventIds.map((id) => game.events.find((event) => event.id === id)).filter(Boolean) : []
    return (
      <>
        <div className="page-heading">
          <div>
            <p className="eyebrow">Permanent annual history</p>
            <h1>Yearbook</h1>
            <p>One page per completed year: the best fighters, fights, events and promotion — plus the offseason that reshaped the following season.</p>
          </div>
          <select className="select-input compact-select" value={summary?.year ?? game.currentYear} onChange={(event) => setYearbookYear(Number(event.target.value))}>
            {game.yearSummaries.length === 0 ? <option value={game.currentYear}>{game.currentYear} · in progress</option> : game.yearSummaries.map((item) => <option value={item.year} key={item.year}>Year {item.year}</option>)}
          </select>
        </div>

        {!summary ? (
          <section className="history-empty-state">
            <p className="eyebrow">Year {game.currentYear} in progress</p>
            <h2>The first permanent Yearbook page will close at Week 52.</h2>
            <p>Current results are already feeding rankings, career statistics, belt lineages and the all-time Almanac.</p>
          </section>
        ) : (
          <>
            <section className="yearbook-hero">
              <div>
                <p className="eyebrow">Year {summary.year} in review</p>
                <h2>{summary.topFighters[0]?.fighterName ?? 'No fighter'} defined the year</h2>
                <p>{summary.topPromotionName} finished as the leading promotion. The complete top ten, fight ratings, audiences and historical event rankings are preserved below.</p>
              </div>
              <div className="yearbook-hero-score">
                <span>Promotion score</span>
                <strong>{summary.topPromotionScore.toFixed(0)}</strong>
                <small>{summary.topPromotionName}</small>
              </div>
            </section>

            <section className="metric-grid yearbook-metrics">
              <article className="metric-card"><span>Fighter of the year</span><strong>{summary.topFighters[0]?.fighterName ?? '—'}</strong><small>{summary.topFighters[0]?.score.toFixed(0) ?? 0} annual score</small></article>
              <article className="metric-card"><span>Retirements</span><strong>{summary.retiredFighterNames.length}</strong><small>{summary.retiredFighterNames.slice(0, 2).join(' · ') || 'No retirements'}</small></article>
              <article className="metric-card"><span>New prospects</span><strong>{summary.newProspectNames.length}</strong><small>{summary.newProspectNames.slice(0, 2).join(' · ') || 'No new class'}</small></article>
              <article className="metric-card"><span>Promotion moves</span><strong>{summary.promotionMoves.length}</strong><small>{summary.promotionMoves.slice(0, 1).map((move) => move.fighterName).join('') || 'No major moves'}</small></article>
            </section>

            <section className="dashboard-grid yearbook-grid">
              <article className="dashboard-panel span-two">
                <div className="section-heading"><div><p className="eyebrow">Annual hierarchy</p><h2>Top fighters</h2></div><span>Year {summary.year}</span></div>
                <div className="table-scroll">
                  <table className="data-table interactive-table">
                    <thead><tr><th>#</th><th>Fighter</th><th>W-L</th><th>Titles</th><th>Defenses</th><th>Fame earned</th><th>Year score</th></tr></thead>
                    <tbody>{summary.topFighters.map((entry, index) => <tr key={entry.fighterId} onClick={() => openFighter(entry.fighterId)}><td>{index + 1}</td><td><strong>{entry.fighterName}</strong></td><td>{entry.wins}-{entry.losses}</td><td>{entry.titles}</td><td>{entry.titleDefenses}</td><td>{entry.fameEarned}</td><td><strong>{entry.score.toFixed(0)}</strong></td></tr>)}</tbody>
                  </table>
                </div>
              </article>
              <article className="dashboard-panel">
                <div className="section-heading"><div><p className="eyebrow">Annual honors</p><h2>Awards</h2></div></div>
                <div className="market-feed">{yearAwards.map((award) => <article key={award.id}><span>{award.category}</span><strong>{award.fighterNames.join(' vs ')}</strong><p>{award.description}</p></article>)}</div>
              </article>
            </section>

            <section className="dashboard-grid yearbook-grid">
              <article className="dashboard-panel">
                <div className="section-heading"><div><p className="eyebrow">Historical fights</p><h2>Top fights</h2></div><span>quality + significance</span></div>
                <div className="history-ranking-list">{fightRows.slice(0, 8).map((entry: any, index) => <button type="button" key={entry.bout.fightId} onClick={() => openFighter(entry.bout.winnerId)}><span>{index + 1}</span><div><strong>{entry.bout.fighterAName} vs {entry.bout.fighterBName}</strong><small>{entry.event.name} · {entry.bout.method}</small></div><b>{entry.bout.fightRating}<small>Q</small></b><b>{entry.bout.audience.toFixed(2)}M<small>Audience</small></b></button>)}</div>
              </article>
              <article className="dashboard-panel">
                <div className="section-heading"><div><p className="eyebrow">Historical cards</p><h2>Top events</h2></div><span>quality + reach</span></div>
                <div className="history-ranking-list">{eventRows.slice(0, 8).map((event: any, index) => <article key={event.id}><span>{index + 1}</span><div><strong>{event.name}</strong><small>{event.promotionName} · Week {event.week}</small></div><b>{event.qualityRating}<small>Q</small></b><b>{event.audience.toFixed(2)}M<small>Audience</small></b></article>)}</div>
              </article>
              <article className="dashboard-panel">
                <div className="section-heading"><div><p className="eyebrow">Entering {summary.year + 1}</p><h2>Offseason report</h2></div></div>
                <div className="offseason-groups">
                  <div><span>Retired</span>{summary.retiredFighterNames.length ? summary.retiredFighterNames.slice(0, 8).map((name, index) => <button type="button" key={summary.retiredFighterIds[index]} onClick={() => openFighter(summary.retiredFighterIds[index])}>{name}</button>) : <small>None</small>}</div>
                  <div><span>New class</span>{summary.newProspectNames.slice(0, 8).map((name, index) => <button type="button" key={summary.newProspectIds[index]} onClick={() => openFighter(summary.newProspectIds[index])}>{name}</button>)}</div>
                  <div><span>Promotion changes</span>{summary.promotionMoves.slice(0, 10).map((move) => <button type="button" key={`${move.fighterId}-${move.toPromotionId}`} onClick={() => openFighter(move.fighterId)}>{move.fighterName}<small>{move.fromPromotionName} → {move.toPromotionName}</small></button>)}</div>
                </div>
              </article>
            </section>
          </>
        )}
      </>
    )
  }

  const renderHallOfFame = () => {
    const displayFighters = hallFighters.length ? hallFighters : hallWatchlist
    return (
      <>
        <div className="page-heading">
          <div><p className="eyebrow">Historical greatness</p><h1>Hall of Fame</h1><p>Career greatness is built from legacy, championships, defenses, victories, fame and longevity — not OVR.</p></div>
          <span className="page-date">{hallFighters.length} inducted · {hallWatchlist.length} active watchlist</span>
        </div>

        <section className="hall-podium">
          {displayFighters.slice(0, 3).map((fighter, index) => <button type="button" key={fighter.id} className={`hall-card hall-${index + 1}`} onClick={() => openFighter(fighter.id)}><span className="hall-rank">#{index + 1}</span><FighterPortrait fighter={fighter} size={index === 0 ? 'lg' : 'md'} /><strong>{shortFighterName(fighter)}</strong><small>{fighter.rarity} · {fighter.isRetired ? `Class of ${fighter.retiredYear ?? '—'}` : 'Active watchlist'}</small><div><b>{goatScore(fighter)}</b><span>HOF score</span></div></button>)}
        </section>

        <section className="dashboard-panel">
          <div className="section-heading"><div><p className="eyebrow">Pantheon</p><h2>{hallFighters.length ? 'Inducted fighters' : 'No retirements yet — active Hall watchlist'}</h2></div><span>All-time career value</span></div>
          <div className="table-scroll"><table className="data-table interactive-table"><thead><tr><th>#</th><th>Fighter</th><th>Class</th><th>Record</th><th>Titles</th><th>Defenses</th><th>Legacy</th><th>Fame</th><th>HOF score</th></tr></thead><tbody>{displayFighters.slice(0, 100).map((fighter, index) => <tr key={fighter.id} onClick={() => openFighter(fighter.id)}><td>{index + 1}</td><td><strong>{shortFighterName(fighter)}</strong><small>{fighter.rarity} · {fighter.socialPersonality}</small></td><td>{fighter.isRetired ? fighter.retiredYear ?? '—' : 'Active'}</td><td>{fighter.stats.wins}-{fighter.stats.losses}-{fighter.stats.draws}</td><td>{fighter.stats.titles}</td><td>{fighter.stats.titleDefenses}</td><td>{fighter.legacy.toFixed(0)}</td><td>{fighter.fame}</td><td><strong>{goatScore(fighter)}</strong></td></tr>)}</tbody></table></div>
        </section>
      </>
    )
  }

  const renderAlmanac = () => {
    const allFighters = game.fighters.filter((fighter) => fighter.stats.fights > 0).filter((fighter) => almanacGender === 'All' || fighter.gender === almanacGender).sort((a, b) => goatScore(b) - goatScore(a))
    const eraSummaries = [...game.yearSummaries].sort((a, b) => a.year - b.year)
    const promotionEras: { promotionId: string | null; name: string; start: number; end: number; years: number }[] = []
    eraSummaries.forEach((summary) => {
      const last = promotionEras[promotionEras.length - 1]
      if (last && last.promotionId === summary.topPromotionId && last.end === summary.year - 1) { last.end = summary.year; last.years += 1 }
      else promotionEras.push({ promotionId: summary.topPromotionId, name: summary.topPromotionName, start: summary.year, end: summary.year, years: 1 })
    })
    const peakMap = new Map<string, { fighterId: string; fighterName: string; year: number; score: number }>()
    game.yearSummaries.forEach((summary) => summary.topFighters.forEach((entry) => { const current = peakMap.get(entry.fighterId); if (!current || entry.score > current.score) peakMap.set(entry.fighterId, { fighterId: entry.fighterId, fighterName: entry.fighterName, year: summary.year, score: entry.score }) }))
    const fighterPeaks = [...peakMap.values()].sort((a, b) => b.score - a.score)
    return (
      <>
        <div className="page-heading">
          <div><p className="eyebrow">The permanent record</p><h1>Almanac</h1><p>All-time records, historical fights and audiences, belt lineage, promotion eras and individual career peaks.</p></div>
          <div className="segmented-control"><button type="button" className={almanacSection === 'records' ? 'active' : ''} onClick={() => setAlmanacSection('records')}>Records</button><button type="button" className={almanacSection === 'belts' ? 'active' : ''} onClick={() => setAlmanacSection('belts')}>Belt lineage</button><button type="button" className={almanacSection === 'eras' ? 'active' : ''} onClick={() => setAlmanacSection('eras')}>Peaks & eras</button></div>
        </div>
        <div className="almanac-toolbar"><div className="segmented-control">{(['All','Male','Female'] as const).map((gender) => <button type="button" key={gender} className={almanacGender === gender ? 'active' : ''} onClick={() => setAlmanacGender(gender)}>{gender}</button>)}</div>{almanacSection === 'belts' ? <select className="select-input compact-select" value={lineagePromotion?.id ?? ''} onChange={(event) => setAlmanacPromotionId(event.target.value)}>{game.promotions.map((promotion) => <option key={promotion.id} value={promotion.id}>{promotion.name}</option>)}</select> : null}</div>

        {almanacSection === 'records' ? <>
          <section className="metric-grid almanac-highlights"><article className="metric-card"><span>Career leader</span><strong>{allFighters[0] ? shortFighterName(allFighters[0]) : '—'}</strong><small>{allFighters[0] ? goatScore(allFighters[0]) : 0} HOF score</small></article><article className="metric-card"><span>Most wins</span><strong>{[...allFighters].sort((a,b)=>b.stats.wins-a.stats.wins)[0] ? shortFighterName([...allFighters].sort((a,b)=>b.stats.wins-a.stats.wins)[0]) : '—'}</strong><small>{[...allFighters].sort((a,b)=>b.stats.wins-a.stats.wins)[0]?.stats.wins ?? 0} wins</small></article><article className="metric-card"><span>Most titles</span><strong>{[...allFighters].sort((a,b)=>b.stats.titles-a.stats.titles)[0] ? shortFighterName([...allFighters].sort((a,b)=>b.stats.titles-a.stats.titles)[0]) : '—'}</strong><small>{[...allFighters].sort((a,b)=>b.stats.titles-a.stats.titles)[0]?.stats.titles ?? 0} reigns</small></article><article className="metric-card"><span>Most defenses</span><strong>{[...allFighters].sort((a,b)=>b.stats.titleDefenses-a.stats.titleDefenses)[0] ? shortFighterName([...allFighters].sort((a,b)=>b.stats.titleDefenses-a.stats.titleDefenses)[0]) : '—'}</strong><small>{[...allFighters].sort((a,b)=>b.stats.titleDefenses-a.stats.titleDefenses)[0]?.stats.titleDefenses ?? 0} defenses</small></article></section>
          <section className="dashboard-grid almanac-record-grid"><article className="dashboard-panel span-two"><div className="section-heading"><div><p className="eyebrow">Career record</p><h2>All-time fighter ranking</h2></div></div><div className="table-scroll"><table className="data-table interactive-table"><thead><tr><th>#</th><th>Fighter</th><th>Record</th><th>Titles</th><th>Defenses</th><th>Legacy</th><th>Fame</th><th>HOF score</th></tr></thead><tbody>{allFighters.slice(0,100).map((fighter,index)=><tr key={fighter.id} onClick={()=>openFighter(fighter.id)}><td>{index+1}</td><td><strong>{shortFighterName(fighter)}</strong><small>{fighter.rarity} · {fighter.style}</small></td><td>{fighter.stats.wins}-{fighter.stats.losses}-{fighter.stats.draws}</td><td>{fighter.stats.titles}</td><td>{fighter.stats.titleDefenses}</td><td>{fighter.legacy.toFixed(0)}</td><td>{fighter.fame}</td><td><strong>{goatScore(fighter)}</strong></td></tr>)}</tbody></table></div></article><article className="dashboard-panel"><div className="section-heading"><div><p className="eyebrow">Quality record</p><h2>Greatest fights</h2></div></div><div className="history-ranking-list">{topQualityFights.slice(0,10).map((entry,index)=><button type="button" key={entry.bout.fightId} onClick={()=>openFighter(entry.bout.winnerId)}><span>{index+1}</span><div><strong>{entry.bout.fighterAName} vs {entry.bout.fighterBName}</strong><small>{entry.event.name}</small></div><b>{entry.bout.fightRating}<small>Q</small></b><b>{entry.bout.audience.toFixed(2)}M<small>Audience</small></b></button>)}</div></article></section>
          <section className="dashboard-grid almanac-record-grid"><article className="dashboard-panel"><div className="section-heading"><div><p className="eyebrow">Audience record</p><h2>Biggest fights</h2></div></div><div className="history-ranking-list">{topAudienceFights.slice(0,10).map((entry,index)=><button type="button" key={entry.bout.fightId} onClick={()=>openFighter(entry.bout.winnerId)}><span>{index+1}</span><div><strong>{entry.bout.fighterAName} vs {entry.bout.fighterBName}</strong><small>{entry.event.name}</small></div><b>{entry.bout.audience.toFixed(2)}M<small>Audience</small></b><b>{entry.bout.ppvBuys.toFixed(2)}M<small>PPV</small></b></button>)}</div></article><article className="dashboard-panel"><div className="section-heading"><div><p className="eyebrow">Event quality</p><h2>Highest-rated events</h2></div></div><div className="history-ranking-list">{topQualityEvents.slice(0,10).map((event,index)=><article key={event.id}><span>{index+1}</span><div><strong>{event.name}</strong><small>{event.promotionName} · Y{event.year}</small></div><b>{event.qualityRating}<small>Q</small></b><b>{event.audience.toFixed(2)}M<small>Audience</small></b></article>)}</div></article><article className="dashboard-panel"><div className="section-heading"><div><p className="eyebrow">Event reach</p><h2>Biggest events</h2></div></div><div className="history-ranking-list">{topAudienceEvents.slice(0,10).map((event,index)=><article key={event.id}><span>{index+1}</span><div><strong>{event.name}</strong><small>{event.promotionName} · Y{event.year}</small></div><b>{event.audience.toFixed(2)}M<small>Audience</small></b><b>{event.ppvBuys.toFixed(2)}M<small>PPV</small></b></article>)}</div></article></section>
        </> : null}

        {almanacSection === 'belts' ? <section className="belt-lineage-grid">{lineageGroups.length ? lineageGroups.map((group) => <article className="belt-lineage-card" key={group.key}><div className="section-heading"><div><p className="eyebrow">{group.gender}</p><h2>{group.division}</h2></div><span>{group.reigns.length} reigns</span></div><div className="belt-reign-list">{group.reigns.map((reign,index)=><button type="button" key={reign.id} onClick={()=>openFighter(reign.fighterId)}><span className="belt-reign-index">{index+1}</span><div><strong>{reign.fighterName}</strong><small>Started W{reign.week ?? 1} {reign.year} · {reign.reignEndYear ? `ended W${reign.reignEndWeek ?? 1} ${reign.reignEndYear}` : 'current reign'}</small></div><b>{reign.defenses ?? 0}<small>defenses</small></b></button>)}</div></article>) : <div className="history-empty-state"><h2>No title lineage yet.</h2><p>Championship reigns will appear after belts are first won.</p></div>}</section> : null}

        {almanacSection === 'eras' ? <><section className="dashboard-grid"><article className="dashboard-panel"><div className="section-heading"><div><p className="eyebrow">Institutional history</p><h2>Promotion eras</h2></div></div><div className="era-list">{promotionEras.slice().sort((a,b)=>b.years-a.years || b.end-a.end).map((era,index)=><article key={`${era.name}-${era.start}`}><span>{index+1}</span><div><strong>{era.name}</strong><small>{era.start === era.end ? `Year ${era.start}` : `Years ${era.start}–${era.end}`} · {era.years} year{era.years===1?'':'s'} on top</small></div><b>{era.years}</b></article>)}</div></article><article className="dashboard-panel span-two"><div className="section-heading"><div><p className="eyebrow">Individual apex</p><h2>Greatest single-year peaks</h2></div></div><div className="table-scroll"><table className="data-table"><thead><tr><th>#</th><th>Fighter</th><th>Year</th><th>Peak score</th></tr></thead><tbody>{fighterPeaks.slice(0,50).map((peak,index)=><tr key={peak.fighterId}><td>{index+1}</td><td><button className="table-link" type="button" onClick={()=>openFighter(peak.fighterId)}>{peak.fighterName}</button></td><td>{peak.year}</td><td><strong>{peak.score.toFixed(0)}</strong></td></tr>)}</tbody></table></div></article></section><section className="dashboard-panel"><div className="section-heading"><div><p className="eyebrow">Promotion peaks</p><h2>Strongest single seasons</h2></div></div><div className="history-ranking-list">{[...game.yearSummaries].sort((a,b)=>b.topPromotionScore-a.topPromotionScore).slice(0,12).map((summary,index)=><article key={summary.year}><span>{index+1}</span><div><strong>{summary.topPromotionName}</strong><small>Year {summary.year}</small></div><b>{summary.topPromotionScore.toFixed(0)}<small>score</small></b></article>)}</div></section></> : null}
      </>
    )
  }

  const renderEditor = () => (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">You shape institutions, not outcomes</p>
          <h1>Universe Editor</h1>
          <p>Redirect identities, move stars, combine rivals, or create splinter organizations. Fight results remain unscripted.</p>
        </div>
      </div>

      <section className="editor-grid">
        <article className="editor-panel">
          <div className="section-heading"><div><p className="eyebrow">Identity</p><h2>Promotion direction</h2></div></div>
          <label><span>Promotion</span><select className="select-input" value={editPromotionId} onChange={(event) => setEditPromotionId(event.target.value)}>{game.promotions.map((promotion) => <option value={promotion.id} key={promotion.id}>{promotion.name}</option>)}</select></label>
          <label className="range-control"><span>Competition <strong>{competition}</strong></span><input type="range" min="0" max="100" value={competition} onChange={(event) => setCompetition(Number(event.target.value))} /></label>
          <label className="range-control"><span>Entertainment <strong>{entertainment}</strong></span><input type="range" min="0" max="100" value={entertainment} onChange={(event) => setEntertainment(Number(event.target.value))} /></label>
          <label className="range-control"><span>Risk tolerance <strong>{risk}</strong></span><input type="range" min="0" max="100" value={risk} onChange={(event) => setRisk(Number(event.target.value))} /></label>
          <label><span>Presentation tone</span><select className="select-input" value={tone} onChange={(event) => setTone(event.target.value)}><option>Serious sport</option><option>Seasonal spectacle</option><option>Martial-arts prestige</option><option>Global entertainment</option><option>Athletic entertainment</option><option>Chaotic drama</option><option>Prizefight prestige</option><option>Underground spectacle</option><option>Celebrity-driven</option></select></label>
          <button className="button primary wide" type="button" onClick={applyIdentity}>Apply identity shift</button>
          <div className="editor-divider" />
          <label><span>Promotion name</span><input className="text-input" value={renameValue} onChange={(event) => setRenameValue(event.target.value)} /></label>
          <button className="button wide" type="button" onClick={applyRename}>Rename promotion</button>
        </article>

        <article className="editor-panel">
          <div className="section-heading"><div><p className="eyebrow">Career crossover</p><h2>Move a fighter</h2></div></div>
          <p className="editor-note">Moving a champion vacates the former title. The fighter keeps every prior brand and yearly statistic.</p>
          <label><span>Fighter</span><select className="select-input" value={moveFighterId} onChange={(event) => setMoveFighterId(event.target.value)}>{game.fighters.filter((fighter) => fighter.promotionId && !fighter.isRetired).sort((a,b) => shortFighterName(a).localeCompare(shortFighterName(b))).map((fighter) => <option value={fighter.id} key={fighter.id}>{shortFighterName(fighter)} — {game.promotions.find((promotion) => promotion.id === fighter.promotionId)?.shortName}</option>)}</select></label>
          <label><span>Target promotion</span><select className="select-input" value={moveTargetId} onChange={(event) => setMoveTargetId(event.target.value)}>{game.promotions.map((promotion) => <option value={promotion.id} key={promotion.id}>{promotion.name}</option>)}</select></label>
          <button className="button primary wide" type="button" onClick={applyMove}>Create crossover move</button>
        </article>

        <article className="editor-panel danger-panel">
          <div className="section-heading"><div><p className="eyebrow">Structural intervention</p><h2>Merge promotions</h2></div></div>
          <p className="editor-note">Rosters, revenue, viewers, and championship histories combine. The stronger current champion remains for each gender.</p>
          <label><span>Promotion A</span><select className="select-input" value={mergeA} onChange={(event) => setMergeA(event.target.value)}>{game.promotions.map((promotion) => <option value={promotion.id} key={promotion.id}>{promotion.name}</option>)}</select></label>
          <label><span>Promotion B</span><select className="select-input" value={mergeB} onChange={(event) => setMergeB(event.target.value)}>{game.promotions.map((promotion) => <option value={promotion.id} key={promotion.id}>{promotion.name}</option>)}</select></label>
          <label><span>New name</span><input className="text-input" value={mergeName} onChange={(event) => setMergeName(event.target.value)} /></label>
          <button className="button danger wide" type="button" onClick={applyMerge}>Merge organizations</button>
        </article>

        <article className="editor-panel danger-panel">
          <div className="section-heading"><div><p className="eyebrow">Structural intervention</p><h2>Create a splinter</h2></div></div>
          <p className="editor-note">Approximately half the roster breaks away. The new promotion begins with zero fame, viewers, revenue, and vacant titles.</p>
          <label><span>Source promotion</span><select className="select-input" value={splitSource} onChange={(event) => setSplitSource(event.target.value)}>{game.promotions.map((promotion) => <option value={promotion.id} key={promotion.id}>{promotion.name}</option>)}</select></label>
          <label><span>Splinter name</span><input className="text-input" value={splitName} onChange={(event) => setSplitName(event.target.value)} /></label>
          <button className="button danger wide" type="button" onClick={applySplit}>Trigger historic split</button>
        </article>
      </section>
    </>
  )

  const renderView = () => {
    switch (view) {
      case 'promotions': return renderPromotions()
      case 'fighters': return renderFighters()
      case 'rankings': return renderRankings()
      case 'yearbook': return renderYearbook()
      case 'hall': return renderHallOfFame()
      case 'market': return renderMarket()
      case 'chronicles': return renderChronicles()
      case 'almanac': return renderAlmanac()
      case 'editor': return renderEditor()
      default: return renderUniverse()
    }
  }

  return (
    <div className="game-shell">
      <header className="game-topbar">
        <button className="brand-button" type="button" onClick={onExit}>
          <span className="brand-mark">CU</span>
          <span><strong>Combat Universe</strong><small>{game.universeName} · Slot {game.slotId}</small></span>
        </button>
        <div className="topbar-date"><small>Current date</small><strong>{formatDate(game)}</strong></div>
        <div className="simulation-controls">
          <button className="button" type="button" onClick={() => onChange(simulateWeek(game))}>1 week</button>
          <button className="button" type="button" onClick={() => onChange(simulateWeeks(game, 4))}>4 weeks</button>
          <button className="button primary" type="button" onClick={() => onChange(simulateWeeks(game, 52))}>1 year</button>
        </div>
      </header>

      <div className="game-layout">
        <aside className="game-sidebar">
          <nav className="main-nav" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <button className={view === item.id ? 'active' : ''} type="button" key={item.id} onClick={() => setView(item.id)}>
                <span className="nav-icon">{item.icon}</span>
                <span><strong>{item.label}</strong><small>{item.description}</small></span>
              </button>
            ))}
          </nav>
          <div className="sidebar-divider" />
          <section className="sidebar-status">
            <p className="eyebrow">World status</p>
            <div><span>Promotions</span><strong>{game.promotions.length}</strong></div>
            <div><span>Active fighters</span><strong>{activeFighters.length}</strong></div>
            <div><span>Free agents</span><strong>{freeAgentList.length}</strong></div>
            <div><span>Stories recorded</span><strong>{game.chronicles.length}</strong></div>
            <small>Autosaved locally</small>
          </section>
          <button className="exit-button" type="button" onClick={onExit}>Save &amp; return to slots</button>
        </aside>

        <main className="game-main">{renderView()}</main>
      </div>

      {selectedFighter && (
        <FighterModal fighter={selectedFighter} game={game} onClose={() => setFighterModalId(null)} onPromotionOpen={openPromotion} onFighterOpen={openFighter} />
      )}
      {selectedPromotion && (
        <PromotionModal promotion={selectedPromotion} game={game} onClose={() => setPromotionModalId(null)} onFighterOpen={openFighter} />
      )}
    </div>
  )
}
