import { useMemo, useState } from 'react'
import {
  autoDraftCurrentPick,
  autoDraftPicks,
  draftFighter,
  fighterDisplayName,
  getCurrentDraftPromotion,
  getDraftRound,
  getDraftSequence,
  scoreDraftFit,
  shortFighterName,
} from '../engine/universe'
import type { Fighter, GameState, Gender, Rarity } from '../types'

interface DraftScreenProps {
  game: GameState
  onChange: (game: GameState) => void
  onExit: () => void
}

const rarityRank: Record<Rarity, number> = {
  Legend: 5,
  Epic: 4,
  Rare: 3,
  Uncommon: 2,
  Common: 1,
}

export default function DraftScreen({ game, onChange, onExit }: DraftScreenProps) {
  const [query, setQuery] = useState('')
  const [gender, setGender] = useState<'All' | Gender>('All')
  const [rarity, setRarity] = useState<'All' | Rarity>('All')
  const [sort, setSort] = useState<'fit' | 'overall' | 'charisma' | 'potential'>('fit')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const currentPromotion = getCurrentDraftPromotion(game)
  const draftSequence = getDraftSequence(game)
  const currentRound = getDraftRound(game)
  const totalPicks = game.draft.rounds * game.draft.order.length
  const picksRemainingInRound = Math.min(
    game.draft.order.length - (game.draft.currentPickIndex % game.draft.order.length),
    totalPicks - game.draft.currentPickIndex,
  )

  const available = useMemo(() => {
    if (!currentPromotion) return []
    const normalizedQuery = query.trim().toLowerCase()
    return game.fighters
      .filter((fighter) => fighter.isDraftEligible && !fighter.promotionId)
      .filter((fighter) => gender === 'All' || fighter.gender === gender)
      .filter((fighter) => rarity === 'All' || fighter.rarity === rarity)
      .filter((fighter) => {
        if (!normalizedQuery) return true
        return [fighter.firstName, fighter.lastName, fighter.ringName, fighter.nationality, fighter.style]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)
      })
      .sort((a, b) => {
        if (sort === 'overall') return b.overall - a.overall || rarityRank[b.rarity] - rarityRank[a.rarity]
        if (sort === 'charisma') return b.charisma - a.charisma || b.overall - a.overall
        if (sort === 'potential') return b.potential - a.potential || b.overall - a.overall
        return scoreDraftFit(game, currentPromotion, b) - scoreDraftFit(game, currentPromotion, a)
      })
  }, [currentPromotion, game, gender, query, rarity, sort])

  const selected = game.fighters.find((fighter) => fighter.id === selectedId) ?? available[0] ?? null

  const pickFighter = (fighter: Fighter) => {
    onChange(draftFighter(game, fighter.id))
    setSelectedId(null)
  }

  const autoPick = () => onChange(autoDraftCurrentPick(game))
  const autoRound = () => onChange(autoDraftPicks(game, picksRemainingInRound))
  const autoComplete = () => {
    if (window.confirm('Auto-complete every remaining pick in the Founding Draft?')) {
      onChange(autoDraftPicks(game, totalPicks - game.draft.currentPickIndex))
    }
  }

  const currentPickNumber = game.draft.currentPickIndex + 1
  const nextPromotions = draftSequence
    .slice(game.draft.currentPickIndex, game.draft.currentPickIndex + 8)
    .map((promotionId) => game.promotions.find((promotion) => promotion.id === promotionId))
    .filter(Boolean)

  return (
    <div className="draft-shell">
      <header className="draft-topbar">
        <button className="brand-button" type="button" onClick={onExit}>
          <span className="brand-mark">CU</span>
          <span>
            <strong>Combat Universe</strong>
            <small>{game.universeName}</small>
          </span>
        </button>
        <div className="draft-progress-copy">
          <span>Founding Draft</span>
          <strong>
            Round {currentRound} · Pick {currentPickNumber} of {totalPicks}
          </strong>
        </div>
        <div className="draft-actions">
          <button className="button" type="button" onClick={autoPick}>
            Auto-pick
          </button>
          <button className="button" type="button" onClick={autoRound}>
            Auto round
          </button>
          <button className="button primary" type="button" onClick={autoComplete}>
            Complete draft
          </button>
        </div>
      </header>

      <div className="draft-progress-track" aria-label={`Draft ${Math.round((game.draft.currentPickIndex / totalPicks) * 100)} percent complete`}>
        <span style={{ width: `${(game.draft.currentPickIndex / totalPicks) * 100}%` }} />
      </div>

      <main className="draft-layout">
        <section className="draft-stage" style={{ '--promotion-color': currentPromotion?.color } as React.CSSProperties}>
          <div className="draft-light light-one" />
          <div className="draft-light light-two" />
          <div className="draft-stage-content">
            <p className="eyebrow">On the clock</p>
            <div className="draft-promotion-logo">{currentPromotion?.shortName}</div>
            <h1>{currentPromotion?.name}</h1>
            <p>{currentPromotion?.archetype}</p>
            <div className="identity-scores">
              <span>
                Competition <strong>{currentPromotion?.competition}</strong>
              </span>
              <span>
                Entertainment <strong>{currentPromotion?.entertainment}</strong>
              </span>
              <span>
                Risk <strong>{currentPromotion?.risk}</strong>
              </span>
            </div>
            <p className="draft-stage-note">
              Every star begins with <strong>0 fights, 0 titles, and 0 fame</strong>. Rarity defines expectations—not history.
            </p>
          </div>

          {selected && currentPromotion && (
            <article className={`draft-selection-preview rarity-${selected.rarity.toLowerCase()}`}>
              <div className="selection-portrait">{shortFighterName(selected).slice(0, 2).toUpperCase()}</div>
              <div className="selection-copy">
                <div className="selection-tags">
                  <span className={`rarity-badge ${selected.rarity.toLowerCase()}`}>{selected.rarity}</span>
                  <span>{selected.gender}</span>
                  <span>Age {selected.age}</span>
                </div>
                <h2>{shortFighterName(selected)}</h2>
                <p>{fighterDisplayName(selected)}</p>
                <div className="selection-metrics">
                  <div>
                    <span>Overall</span>
                    <strong>{selected.overall}</strong>
                  </div>
                  <div>
                    <span>Charisma</span>
                    <strong>{selected.charisma}</strong>
                  </div>
                  <div>
                    <span>Potential</span>
                    <strong>{selected.potential}</strong>
                  </div>
                  <div>
                    <span>Fit</span>
                    <strong>{Math.round(scoreDraftFit(game, currentPromotion, selected))}</strong>
                  </div>
                </div>
                <p className="selection-style">
                  {selected.style} · {selected.nationality}
                </p>
                <button className="button primary wide" type="button" onClick={() => pickFighter(selected)}>
                  Draft {shortFighterName(selected)}
                </button>
              </div>
            </article>
          )}
        </section>

        <section className="draft-board-area">
          <div className="draft-board-header">
            <div>
              <p className="eyebrow">Available stars</p>
              <h2>{available.length} premium fighters remain</h2>
            </div>
            <div className="draft-filters">
              <input
                className="text-input"
                aria-label="Search fighters"
                placeholder="Search name, country, style…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <select className="select-input" aria-label="Gender" value={gender} onChange={(event) => setGender(event.target.value as 'All' | Gender)}>
                <option value="All">All genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <select className="select-input" aria-label="Rarity" value={rarity} onChange={(event) => setRarity(event.target.value as 'All' | Rarity)}>
                <option value="All">All rarities</option>
                <option value="Legend">Legend</option>
                <option value="Epic">Epic</option>
              </select>
              <select className="select-input" aria-label="Sort fighters" value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}>
                <option value="fit">Best fit</option>
                <option value="overall">Overall</option>
                <option value="charisma">Charisma</option>
                <option value="potential">Potential</option>
              </select>
            </div>
          </div>

          <div className="draft-star-grid">
            {available.slice(0, 48).map((fighter) => (
              <button
                className={`draft-star-card ${selected?.id === fighter.id ? 'selected' : ''}`}
                type="button"
                key={fighter.id}
                onClick={() => setSelectedId(fighter.id)}
              >
                <span className={`rarity-line ${fighter.rarity.toLowerCase()}`} />
                <span className="star-card-top">
                  <span className="star-avatar">{shortFighterName(fighter).slice(0, 2).toUpperCase()}</span>
                  <span className={`rarity-badge ${fighter.rarity.toLowerCase()}`}>{fighter.rarity}</span>
                </span>
                <strong>{shortFighterName(fighter)}</strong>
                <small>{fighter.ringName ? `${fighter.firstName} ${fighter.lastName}` : fighter.nationality}</small>
                <span className="star-card-style">{fighter.style}</span>
                <span className="star-card-scores">
                  <b>{fighter.overall} OVR</b>
                  <b>{fighter.charisma} CHA</b>
                  <b>{fighter.gender === 'Male' ? 'M' : 'F'}</b>
                </span>
              </button>
            ))}
          </div>
        </section>

        <aside className="draft-sidebar">
          <section className="draft-side-panel">
            <p className="eyebrow">Snake order</p>
            <h3>Next selections</h3>
            <div className="next-picks">
              {nextPromotions.map((promotion, index) => promotion && (
                <div className={index === 0 ? 'current' : ''} key={`${promotion.id}-${index}`}>
                  <span>{game.draft.currentPickIndex + index + 1}</span>
                  <b style={{ background: promotion.color }}>{promotion.shortName}</b>
                  <strong>{promotion.name}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="draft-side-panel">
            <p className="eyebrow">Draft board</p>
            <h3>Recent picks</h3>
            <div className="recent-picks">
              {game.draft.picks.length === 0 && <p>No picks yet. The universe is waiting.</p>}
              {[...game.draft.picks].reverse().slice(0, 8).map((pick) => (
                <div key={pick.pickNumber}>
                  <span>#{pick.pickNumber}</span>
                  <strong>{pick.fighterName}</strong>
                  <small>
                    {pick.promotionName} · {pick.rarity} · {pick.gender}
                  </small>
                </div>
              ))}
            </div>
          </section>

          <section className="draft-side-panel compact">
            <p className="eyebrow">Roster balance</p>
            <h3>{currentPromotion?.shortName} roster</h3>
            {currentPromotion && (
              <div className="roster-balance">
                <div>
                  <span>Male</span>
                  <strong>{game.fighters.filter((fighter) => fighter.promotionId === currentPromotion.id && fighter.gender === 'Male').length}</strong>
                </div>
                <div>
                  <span>Female</span>
                  <strong>{game.fighters.filter((fighter) => fighter.promotionId === currentPromotion.id && fighter.gender === 'Female').length}</strong>
                </div>
                <div>
                  <span>Total</span>
                  <strong>{game.fighters.filter((fighter) => fighter.promotionId === currentPromotion.id).length}</strong>
                </div>
              </div>
            )}
          </section>
        </aside>
      </main>
    </div>
  )
}
