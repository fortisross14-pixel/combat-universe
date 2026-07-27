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
import { runSigningWindow, simulateMonth, simulateMonths } from '../engine/simulation'
import type { Fighter, GameState, GameView, Gender, Promotion, Rarity } from '../types'
import FighterModal from './FighterModal'
import PromotionModal from './PromotionModal'

interface GameProps {
  game: GameState
  onChange: (game: GameState) => void
  onExit: () => void
}

const NAV_ITEMS: { id: GameView; label: string; icon: string; description: string }[] = [
  { id: 'universe', label: 'Universe', icon: '◈', description: 'World overview' },
  { id: 'promotions', label: 'Promotions', icon: '◆', description: 'Organizations & titles' },
  { id: 'fighters', label: 'Fighters', icon: '✦', description: 'Careers & talent' },
  { id: 'market', label: 'Market', icon: '⇄', description: 'Limited resources' },
  { id: 'chronicles', label: 'Chronicles', icon: '≡', description: 'Permanent stories' },
  { id: 'almanac', label: 'Almanac', icon: '▥', description: 'Records & history' },
  { id: 'editor', label: 'Universe Editor', icon: '◇', description: 'Shape institutions' },
]

const rarityOrder: Record<Rarity, number> = {
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
  return `${monthName(game.currentMonth)} ${game.currentYear}`
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
        const scoreA = a.fame + a.stats.wins * 8 + a.stats.titles * 30 + a.stats.titleDefenses * 12
        const scoreB = b.fame + b.stats.wins * 8 + b.stats.titles * 30 + b.stats.titleDefenses * 12
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

  const topPromotion = promotionRanking[0]
  const topFighter = fighterRanking[0]
  const latestStory = game.chronicles[0]
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
                <b>{shortFighterName(fighter)}</b>
                <small>{fighter.gender} · {fighter.stats.wins}-{fighter.stats.losses}</small>
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
              className="promotion-card"
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
              <span className="fighter-card-avatar">{shortFighterName(fighter).slice(0, 2).toUpperCase()}</span>
              <span className="fighter-card-content">
                <span className="fighter-card-tags">
                  <b className={`rarity-badge ${fighter.rarity.toLowerCase()}`}>{fighter.rarity}</b>
                  <small>{fighter.gender}</small>
                  {isChampion && <small className="champion-badge">Champion</small>}
                </span>
                <strong>{shortFighterName(fighter)}</strong>
                <small>{fighter.ringName ? `${fighter.firstName} ${fighter.lastName}` : fighter.nationality}</small>
                <span className="fighter-style-line">{fighter.style} · Age {fighter.age}</span>
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
          <option value="structural">Structural</option>
          <option value="draft">Draft</option>
        </select>
      </div>
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

  const renderAlmanac = () => (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Records and historical comparison</p>
          <h1>Almanac</h1>
          <p>Filter the entire historical record by All, Male, or Female without losing promotion-level context.</p>
        </div>
        <div className="segmented-control" role="group" aria-label="Almanac gender filter">
          {(['All', 'Male', 'Female'] as const).map((gender) => (
            <button className={almanacGender === gender ? 'active' : ''} type="button" key={gender} onClick={() => setAlmanacGender(gender)}>{gender}</button>
          ))}
        </div>
      </div>

      <section className="metric-grid almanac-highlights">
        <article className="metric-card"><span>Most fame</span><strong>{almanacFighters[0] ? shortFighterName(almanacFighters[0]) : '—'}</strong><small>{almanacFighters[0]?.fame ?? 0} fame</small></article>
        <article className="metric-card"><span>Most wins</span><strong>{[...almanacFighters].sort((a, b) => b.stats.wins - a.stats.wins)[0] ? shortFighterName([...almanacFighters].sort((a, b) => b.stats.wins - a.stats.wins)[0]) : '—'}</strong><small>{[...almanacFighters].sort((a, b) => b.stats.wins - a.stats.wins)[0]?.stats.wins ?? 0} wins</small></article>
        <article className="metric-card"><span>Most titles</span><strong>{[...almanacFighters].sort((a, b) => b.stats.titles - a.stats.titles)[0] ? shortFighterName([...almanacFighters].sort((a, b) => b.stats.titles - a.stats.titles)[0]) : '—'}</strong><small>{[...almanacFighters].sort((a, b) => b.stats.titles - a.stats.titles)[0]?.stats.titles ?? 0} reigns</small></article>
        <article className="metric-card"><span>Promotion fame leader</span><strong>{almanacPromotions[0]?.promotion.shortName ?? '—'}</strong><small>{almanacPromotions[0]?.rosterFame ?? 0} {almanacGender.toLowerCase()} roster fame</small></article>
      </section>

      <section className="dashboard-grid almanac-layout">
        <article className="dashboard-panel span-two">
          <div className="section-heading"><div><p className="eyebrow">Fighter history</p><h2>Era-adjusted career ranking</h2></div><span>{almanacGender}</span></div>
          <div className="table-scroll">
            <table className="data-table interactive-table">
              <thead><tr><th>#</th><th>Fighter</th><th>Gender</th><th>Brand</th><th>Record</th><th>Titles</th><th>Defenses</th><th>Fame</th><th>GOAT score</th></tr></thead>
              <tbody>
                {almanacFighters.slice(0, 100).map((fighter, index) => {
                  const promotion = game.promotions.find((candidate) => candidate.id === fighter.promotionId)
                  const goatScore = fighter.fame + fighter.stats.wins * 8 + fighter.stats.titles * 30 + fighter.stats.titleDefenses * 12
                  return (
                    <tr key={fighter.id} onClick={() => openFighter(fighter.id)}>
                      <td>{index + 1}</td>
                      <td><strong>{shortFighterName(fighter)}</strong><small>{fighter.rarity} · {fighter.style}</small></td>
                      <td>{fighter.gender}</td>
                      <td>{promotion?.shortName ?? (fighter.isRetired ? 'Retired' : 'FA')}</td>
                      <td>{fighter.stats.wins}-{fighter.stats.losses}-{fighter.stats.draws}</td>
                      <td>{fighter.stats.titles}</td>
                      <td>{fighter.stats.titleDefenses}</td>
                      <td>{fighter.fame}</td>
                      <td><strong>{goatScore}</strong></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="section-heading"><div><p className="eyebrow">Promotion history</p><h2>{almanacGender} contribution</h2></div></div>
          <div className="promotion-almanac-list">
            {almanacPromotions.map((entry, index) => (
              <button type="button" key={entry.promotion.id} onClick={() => openPromotion(entry.promotion.id)}>
                <span>{index + 1}</span>
                <b style={{ background: entry.promotion.color }}>{entry.promotion.shortName}</b>
                <strong>{entry.promotion.name}</strong>
                <small>{entry.stars} stars · {entry.wins} wins · {entry.titles} titles</small>
                <em>{entry.rosterFame}</em>
              </button>
            ))}
          </div>
        </article>
      </section>

      <section className="dashboard-panel yearbook-panel">
        <div className="section-heading"><div><p className="eyebrow">Promotion yearbook</p><h2>Historical performance by year</h2></div></div>
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>Promotion</th><th>Year</th><th>Fame</th><th>Viewers</th><th>Revenue</th><th>Male champion</th><th>Female champion</th><th>M / F wins</th></tr></thead>
            <tbody>
              {game.promotions.flatMap((promotion) => Object.values(promotion.yearStats).map((year) => ({ promotion, year })))
                .sort((a, b) => b.year.year - a.year.year || b.year.revenue - a.year.revenue)
                .slice(0, 120)
                .map(({ promotion, year }) => (
                  <tr key={`${promotion.id}-${year.year}`}>
                    <td><button className="table-link" type="button" onClick={() => openPromotion(promotion.id)}>{promotion.name}</button></td>
                    <td>{year.year}</td>
                    <td>{year.fame}</td>
                    <td>{formatMillions(year.viewers)}</td>
                    <td>${formatMillions(year.revenue)}</td>
                    <td>{year.maleChampionName ?? 'Vacant'}</td>
                    <td>{year.femaleChampionName ?? 'Vacant'}</td>
                    <td>{year.maleWins} / {year.femaleWins}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )

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
          <button className="button" type="button" onClick={() => onChange(simulateMonth(game))}>Next month</button>
          <button className="button primary" type="button" onClick={() => onChange(simulateMonths(game, 12))}>Simulate year</button>
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
        <FighterModal fighter={selectedFighter} game={game} onClose={() => setFighterModalId(null)} onPromotionOpen={openPromotion} />
      )}
      {selectedPromotion && (
        <PromotionModal promotion={selectedPromotion} game={game} onClose={() => setPromotionModalId(null)} onFighterOpen={openFighter} />
      )}
    </div>
  )
}
