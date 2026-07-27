import { fighterDisplayName, shortFighterName } from '../engine/universe'
import type { Fighter, GameState, Gender } from '../types'

interface FighterModalProps {
  fighter: Fighter
  game: GameState
  onClose: () => void
  onPromotionOpen: (promotionId: string) => void
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value)
}

export default function FighterModal({ fighter, game, onClose, onPromotionOpen }: FighterModalProps) {
  const promotion = game.promotions.find((candidate) => candidate.id === fighter.promotionId)
  const isChampion = promotion?.currentChampions[fighter.gender] === fighter.id
  const brandStats = Object.values(fighter.brandStats).sort((a, b) => b.fights - a.fights)
  const yearStats = Object.values(fighter.yearStats).sort((a, b) => b.year - a.year)
  const winRate = fighter.stats.fights ? Math.round((fighter.stats.wins / fighter.stats.fights) * 100) : 0

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal-panel fighter-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fighter-modal-name"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal-header fighter-modal-header">
          <div className="fighter-modal-avatar">{shortFighterName(fighter).slice(0, 2).toUpperCase()}</div>
          <div className="fighter-modal-title">
            <div className="modal-tag-row">
              <span className={`rarity-badge ${fighter.rarity.toLowerCase()}`}>{fighter.rarity}</span>
              <span>{fighter.gender}</span>
              {isChampion && <span className="champion-badge">Champion</span>}
              {fighter.isRetired && <span>Retired</span>}
            </div>
            <h2 id="fighter-modal-name">{shortFighterName(fighter)}</h2>
            <p>{fighterDisplayName(fighter)}</p>
          </div>
          <button className="icon-button" type="button" aria-label="Close fighter details" onClick={onClose}>
            ×
          </button>
        </header>

        <div className="fighter-profile-strip">
          <div>
            <span>Age</span>
            <strong>{fighter.age}</strong>
          </div>
          <div>
            <span>Style</span>
            <strong>{fighter.style}</strong>
          </div>
          <div>
            <span>Nationality</span>
            <strong>{fighter.nationality}</strong>
          </div>
          <button
            type="button"
            className="profile-promotion-link"
            disabled={!promotion}
            onClick={() => promotion && onPromotionOpen(promotion.id)}
          >
            <span>Current promotion</span>
            <strong>{promotion?.name ?? (fighter.isRetired ? 'Retired' : 'Free agent')}</strong>
          </button>
        </div>

        <div className="metric-grid fighter-metric-grid">
          <article className="metric-card">
            <span>Total fights</span>
            <strong>{formatNumber(fighter.stats.fights)}</strong>
            <small>{fighter.stats.wins}-{fighter.stats.losses}-{fighter.stats.draws} record</small>
          </article>
          <article className="metric-card">
            <span>Total wins</span>
            <strong>{formatNumber(fighter.stats.wins)}</strong>
            <small>{winRate}% win rate</small>
          </article>
          <article className="metric-card">
            <span>Total titles</span>
            <strong>{formatNumber(fighter.stats.titles)}</strong>
            <small>{fighter.stats.titleDefenses} successful defenses</small>
          </article>
          <article className="metric-card">
            <span>Fame</span>
            <strong>{formatNumber(fighter.fame)}</strong>
            <small>{fighter.stats.finishes} career finishes</small>
          </article>
        </div>

        <section className="modal-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Talent profile</p>
              <h3>High-level ratings</h3>
            </div>
          </div>
          <div className="rating-bars">
            {[
              ['Combat overall', fighter.overall],
              ['Charisma', fighter.charisma],
              ['Potential', fighter.potential],
              ['Current form', fighter.form],
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
              <p className="eyebrow">Career by organization</p>
              <h3>Brand breakdown</h3>
            </div>
            <span>{brandStats.length} promotion{brandStats.length === 1 ? '' : 's'}</span>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Promotion</th>
                  <th>Fights</th>
                  <th>Wins</th>
                  <th>Losses</th>
                  <th>Titles</th>
                  <th>Defenses</th>
                  <th>Fame earned</th>
                </tr>
              </thead>
              <tbody>
                {brandStats.length === 0 ? (
                  <tr><td colSpan={7} className="empty-table-cell">No fights yet. History starts with the first simulated event.</td></tr>
                ) : brandStats.map((line) => (
                  <tr key={line.promotionId}>
                    <td>
                      <button className="table-link" type="button" onClick={() => onPromotionOpen(line.promotionId)}>
                        {line.promotionName}
                      </button>
                    </td>
                    <td>{line.fights}</td>
                    <td>{line.wins}</td>
                    <td>{line.losses}</td>
                    <td>{line.titles}</td>
                    <td>{line.titleDefenses}</td>
                    <td>{line.fameEarned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="modal-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Permanent history</p>
              <h3>Year-by-year breakdown</h3>
            </div>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Promotion(s)</th>
                  <th>Fights</th>
                  <th>Wins</th>
                  <th>Losses</th>
                  <th>Titles</th>
                  <th>Defenses</th>
                  <th>Fame earned</th>
                </tr>
              </thead>
              <tbody>
                {yearStats.length === 0 ? (
                  <tr><td colSpan={8} className="empty-table-cell">No annual statistics yet.</td></tr>
                ) : yearStats.map((line) => (
                  <tr key={line.year}>
                    <td>{line.year}</td>
                    <td>{line.promotionNames.join(' → ')}</td>
                    <td>{line.fights}</td>
                    <td>{line.wins}</td>
                    <td>{line.losses}</td>
                    <td>{line.titles}</td>
                    <td>{line.titleDefenses}</td>
                    <td>{line.fameEarned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </div>
  )
}
