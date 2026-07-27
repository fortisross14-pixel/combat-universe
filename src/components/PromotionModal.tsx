import { shortFighterName } from '../engine/universe'
import type { GameState, Gender, Promotion } from '../types'

interface PromotionModalProps {
  promotion: Promotion
  game: GameState
  onClose: () => void
  onFighterOpen: (fighterId: string) => void
}

function formatMillions(value: number): string {
  return `${value.toFixed(value >= 100 ? 0 : 2)}M`
}

export default function PromotionModal({ promotion, game, onClose, onFighterOpen }: PromotionModalProps) {
  const roster = game.fighters
    .filter((fighter) => fighter.promotionId === promotion.id && !fighter.isRetired)
    .sort((a, b) => b.fame - a.fame || b.overall - a.overall)
  const years = Object.values(promotion.yearStats).sort((a, b) => b.year - a.year)

  const championFor = (gender: Gender) =>
    game.fighters.find((fighter) => fighter.id === promotion.currentChampions[gender]) ?? null

  const maleChampion = championFor('Male')
  const femaleChampion = championFor('Female')
  const totalTitles = promotion.titleHistory.length

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal-panel promotion-modal"
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
            <span>Title changes</span>
            <strong>{totalTitles}</strong>
            <small>{roster.length} active fighters</small>
          </article>
        </div>

        <section className="champion-showcase">
          <article>
            <p className="eyebrow">Men’s championship</p>
            {maleChampion ? (
              <button className="champion-card" type="button" onClick={() => onFighterOpen(maleChampion.id)}>
                <span className="champion-crown">M</span>
                <span>
                  <strong>{shortFighterName(maleChampion)}</strong>
                  <small>{maleChampion.stats.wins}-{maleChampion.stats.losses} · {maleChampion.fame} fame</small>
                </span>
              </button>
            ) : (
              <div className="vacant-champion">Vacant — the next title event will crown a champion.</div>
            )}
          </article>
          <article>
            <p className="eyebrow">Women’s championship</p>
            {femaleChampion ? (
              <button className="champion-card" type="button" onClick={() => onFighterOpen(femaleChampion.id)}>
                <span className="champion-crown">W</span>
                <span>
                  <strong>{shortFighterName(femaleChampion)}</strong>
                  <small>{femaleChampion.stats.wins}-{femaleChampion.stats.losses} · {femaleChampion.fame} fame</small>
                </span>
              </button>
            ) : (
              <div className="vacant-champion">Vacant — the next title event will crown a champion.</div>
            )}
          </article>
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
                <span className={`rarity-badge ${fighter.rarity.toLowerCase()}`}>{fighter.rarity}</span>
                <strong>{shortFighterName(fighter)}</strong>
                <small>{fighter.gender} · {fighter.style}</small>
                <b>{fighter.fame} fame · {fighter.stats.wins} wins</b>
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
                <span>{title.month + 1}/{title.year}</span>
                <strong>{title.fighterName}</strong>
                <small>{title.gender} champion {title.defeatedFighterName ? `after defeating ${title.defeatedFighterName}` : 'in a vacant-title fight'}</small>
              </button>
            ))}
          </div>
        </section>
      </section>
    </div>
  )
}
