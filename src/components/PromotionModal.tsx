import { shortFighterName } from '../engine/universe'
import type { GameState, Promotion } from '../types'
import FighterPortrait from './FighterPortrait'

interface PromotionModalProps {
  promotion: Promotion
  game: GameState
  onClose: () => void
  onFighterOpen: (fighterId: string) => void
}

function formatMillions(value: number): string {
  return `${value.toFixed(value >= 100 ? 0 : 2)}M`
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

export default function PromotionModal({ promotion, game, onClose, onFighterOpen }: PromotionModalProps) {
  const roster = game.fighters
    .filter((fighter) => fighter.promotionId === promotion.id && !fighter.isRetired)
    .sort((a, b) => b.fame - a.fame || b.overall - a.overall)
  const years = Object.values(promotion.yearStats).sort((a, b) => b.year - a.year)

  const divisionChampions = Object.entries(promotion.divisionChampions)
    .map(([key, fighterId]) => {
      const [gender, division] = key.split(':')
      const fighter = fighterId ? game.fighters.find((candidate) => candidate.id === fighterId) ?? null : null
      return { key, gender, division, fighter }
    })
    .filter((entry) => entry.fighter)
    .sort((a, b) => a.gender.localeCompare(b.gender) || a.division.localeCompare(b.division))
  const totalTitles = promotion.titleHistory.length
  const promotionEvents = game.events.filter((event) => event.promotionId === promotion.id)
  const bestQualityEvent = [...promotionEvents].sort((a, b) => b.qualityRating - a.qualityRating)[0] ?? null
  const biggestEvent = [...promotionEvents].sort((a, b) => b.audience - a.audience)[0] ?? null
  const peakYear = [...years].sort((a, b) => (b.revenue * 5 + b.viewers * 2 + b.fame * 3) - (a.revenue * 5 + a.viewers * 2 + a.fame * 3))[0] ?? null

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className={`modal-panel promotion-modal ${promotionFlavorClass(promotion)}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="promotion-modal-name"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal-header promotion-modal-header" style={{ '--promotion-color': promotion.color } as React.CSSProperties}>
          <div className="promotion-modal-logo">{promotion.shortName}</div>
          <div className="promotion-modal-title">
            <p className="eyebrow">{promotion.region}</p>
            <h2 id="promotion-modal-name">{promotion.name}</h2>
            <p>{promotion.archetype} · {promotion.tone}</p>
            <em className="promotion-identity-tag">{promotionIdentityTag(promotion)}</em>
          </div>
          <button className="icon-button" type="button" aria-label="Close promotion details" onClick={onClose}>
            ×
          </button>
        </header>

        <div className="metric-grid promotion-metric-grid">
          <article className="metric-card">
            <span>Fame</span>
            <strong>{promotion.fame}</strong>
            <small>{roster.reduce((sum, fighter) => sum + fighter.fame, 0)} roster fame</small>
          </article>
          <article className="metric-card">
            <span>Current viewers</span>
            <strong>{formatMillions(promotion.currentViewers)}</strong>
            <small>{formatMillions(promotion.totalViewers)} cumulative</small>
          </article>
          <article className="metric-card">
            <span>Revenue</span>
            <strong>${formatMillions(promotion.revenue)}</strong>
            <small>Fresh-universe cumulative revenue</small>
          </article>
          <article className="metric-card">
            <span>Historical peak</span>
            <strong>{peakYear ? `Y${peakYear.year}` : '—'}</strong>
            <small>{peakYear ? `${peakYear.fame} fame · $${formatMillions(peakYear.revenue)} revenue` : `${roster.length} active fighters`}</small>
          </article>
        </div>

        <section className="modal-section promotion-history-highlight">
          <div className="section-heading"><div><p className="eyebrow">Historical record</p><h3>Promotion peaks</h3></div><span>{promotionEvents.length} events preserved</span></div>
          <div className="career-legacy-grid">
            <article><span>Title reigns</span><strong>{totalTitles}</strong><small>Across every division</small></article>
            <article><span>Best event quality</span><strong>{bestQualityEvent?.qualityRating ?? '—'}</strong><small>{bestQualityEvent?.name ?? 'No events yet'}</small></article>
            <article><span>Largest audience</span><strong>{biggestEvent ? `${biggestEvent.audience.toFixed(2)}M` : '—'}</strong><small>{biggestEvent ? `${biggestEvent.ppvBuys.toFixed(2)}M PPV` : 'No events yet'}</small></article>
            <article><span>Peak year</span><strong>{peakYear?.year ?? '—'}</strong><small>{peakYear ? `${formatMillions(peakYear.viewers)} viewers · ${peakYear.fame} fame` : 'No completed year'}</small></article>
          </div>
        </section>

        <section className="modal-section">
          <div className="section-heading"><div><p className="eyebrow">Championship structure</p><h3>Division champions</h3></div><span>{divisionChampions.length} active belts</span></div>
          <div className="division-champion-grid">
            {divisionChampions.length === 0 ? <div className="vacant-champion">All titles are vacant. Rankings will create the first championship fights.</div> : divisionChampions.map((entry) => entry.fighter ? (
              <button className="champion-card division-champion-card" type="button" key={entry.key} onClick={() => onFighterOpen(entry.fighter!.id)}>
                <FighterPortrait fighter={entry.fighter} size="sm" accent={promotion.color} champion />
                <span><small>{entry.gender} · {entry.division}</small><strong>{shortFighterName(entry.fighter)}</strong><small>{entry.fighter.stats.wins}-{entry.fighter.stats.losses} · {entry.fighter.legacy.toFixed(0)} legacy</small></span>
              </button>
            ) : null)}
          </div>
        </section>

        <section className="modal-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Promotion identity</p>
              <h3>Competitive-entertainment profile</h3>
            </div>
          </div>
          <div className="rating-bars">
            {[
              ['Competition', promotion.competition],
              ['Entertainment', promotion.entertainment],
              ['Risk tolerance', promotion.risk],
            ].map(([label, value]) => (
              <div className="rating-row" key={label}>
                <span>{label}</span>
                <div className="rating-track"><i style={{ width: `${value}%` }} /></div>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="modal-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Active talent</p>
              <h3>Promotion roster</h3>
            </div>
            <span>{roster.filter((fighter) => fighter.gender === 'Male').length} male · {roster.filter((fighter) => fighter.gender === 'Female').length} female</span>
          </div>
          <div className="modal-roster-grid">
            {roster.slice(0, 24).map((fighter) => (
              <button className="modal-roster-card" type="button" key={fighter.id} onClick={() => onFighterOpen(fighter.id)}>
                <div className="modal-roster-top"><FighterPortrait fighter={fighter} size="sm" accent={promotion.color} /><span className={`rarity-badge ${fighter.rarity.toLowerCase()}`}>{fighter.rarity}</span></div>
                <strong>{shortFighterName(fighter)}</strong>
                <small>{fighter.gender} · {fighter.weightClass} · {fighter.style}</small>
                <b>{fighter.socialPersonality} · {fighter.competitivePersonality}</b>
                <small>{fighter.fame} fame · {fighter.legacy.toFixed(0)} legacy · {fighter.stats.wins} wins</small>
              </button>
            ))}
          </div>
        </section>

        <section className="modal-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Institutional history</p>
              <h3>Year-by-year breakdown</h3>
            </div>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Fame</th>
                  <th>Viewers</th>
                  <th>Revenue</th>
                  <th>Male champion</th>
                  <th>Female champion</th>
                  <th>M / F wins</th>
                  <th>M / F titles</th>
                </tr>
              </thead>
              <tbody>
                {years.length === 0 ? (
                  <tr><td colSpan={8} className="empty-table-cell">No simulated months yet.</td></tr>
                ) : years.map((year) => (
                  <tr key={year.year}>
                    <td>{year.year}</td>
                    <td>{year.fame}</td>
                    <td>{formatMillions(year.viewers)}</td>
                    <td>${formatMillions(year.revenue)}</td>
                    <td>{year.maleChampionName ?? 'Vacant'}</td>
                    <td>{year.femaleChampionName ?? 'Vacant'}</td>
                    <td>{year.maleWins} / {year.femaleWins}</td>
                    <td>{year.maleTitles} / {year.femaleTitles}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="modal-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Championship lineage</p>
              <h3>Latest title changes</h3>
            </div>
          </div>
          <div className="title-history-list">
            {promotion.titleHistory.length === 0 ? (
              <p>No champions have been crowned yet.</p>
            ) : promotion.titleHistory.slice(0, 16).map((title) => (
              <button className="title-history-item" type="button" key={title.id} onClick={() => onFighterOpen(title.fighterId)}>
                <span>W{title.week ?? '—'} · {title.year}</span>
                <strong>{title.fighterName}</strong>
                <small>{title.gender} {title.weightClass} · {title.defenses ?? 0} defenses · {title.reignEndYear ? `ended W${title.reignEndWeek ?? 1} ${title.reignEndYear}` : 'current reign'}{title.defeatedFighterName ? ` · beat ${title.defeatedFighterName}` : ''}</small>
              </button>
            ))}
          </div>
        </section>
      </section>
    </div>
  )
}
