import { currentRank, divisionForFighter, rankingScore, resumeLabel } from '../engine/rankings'
import { fighterDisplayName, monthName, shortFighterName } from '../engine/universe'
import type { Fighter, GameState } from '../types'
import FighterPortrait from './FighterPortrait'

interface FighterModalProps {
  fighter: Fighter
  game: GameState
  onClose: () => void
  onPromotionOpen: (promotionId: string) => void
  onFighterOpen: (fighterId: string) => void
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value)
}

const SOCIAL_COPY = {
  Fighter: 'Lives for competition. Responds strongly to setbacks and big stages.',
  Rebel: 'Unpredictable and confrontational. Generates heat, fame and volatile rivalries.',
  Classy: 'Professional and composed. Builds prestige without needing controversy.',
  Villain: 'Provokes opponents and audiences. Major fights become personal quickly.',
  Showman: 'Treats every major fight as an event. Fame rises faster when the stakes are high.',
  Humble: 'Low-drama public persona. Less hype, but success still builds lasting respect.',
} as const

const COMPETITIVE_COPY = {
  Fearless: 'Seeks elite opposition and performs better when the fight matters most.',
  Calculated: 'Prefers favorable risk and stylistic edges rather than reckless matchmaking.',
  Opportunist: 'Targets vulnerable moments: slumps, openings and favorable timing.',
  Loyal: 'Values organizational continuity and is less driven by pure market prestige.',
  'Money-Driven': 'Famous opponents and entertainment-heavy promotions carry extra appeal.',
  'Legacy-Driven': 'Prioritizes rankings, champions and fights that improve historical standing.',
} as const

export default function FighterModal({ fighter, game, onClose, onPromotionOpen, onFighterOpen }: FighterModalProps) {
  const promotion = game.promotions.find((candidate) => candidate.id === fighter.promotionId)
  const division = promotion ? divisionForFighter(fighter, promotion) : fighter.weightClass
  const rank = promotion ? currentRank(game, fighter, promotion) : null
  const score = promotion ? rankingScore(game, fighter, promotion) : 0
  const key = promotion ? `${fighter.gender}:${division}` : ''
  const isChampion = Boolean(promotion && promotion.divisionChampions[key] === fighter.id)
  const brandStats = Object.values(fighter.brandStats).sort((a, b) => b.fights - a.fights)
  const yearStats = Object.values(fighter.yearStats).sort((a, b) => b.year - a.year)
  const winRate = fighter.stats.fights ? Math.round((fighter.stats.wins / fighter.stats.fights) * 100) : 0
  const rivalries = game.rivalries
    .filter((rivalry) => rivalry.fighterAId === fighter.id || rivalry.fighterBId === fighter.id)
    .sort((a, b) => b.score - a.score || b.meetings - a.meetings)
  const recentFights = fighter.fightHistory.slice(0, 30)
  const signatureFight = [...fighter.fightHistory].sort((a, b) => (b.fightRating ?? b.importance) - (a.fightRating ?? a.importance) || b.importance - a.importance)[0] ?? null
  const bestYear = [...yearStats].sort((a, b) => (b.wins * 10 + b.titles * 30 + b.titleDefenses * 14 + b.fameEarned * 0.55) - (a.wins * 10 + a.titles * 30 + a.titleDefenses * 14 + a.fameEarned * 0.55))[0] ?? null
  const hofScore = Math.round(fighter.legacy * 10 + fighter.fame * 1.2 + fighter.stats.wins * 4 + fighter.stats.titles * 22 + fighter.stats.titleDefenses * 10 + fighter.stats.finishes * 1.5)
  const titleReigns = game.promotions.flatMap((promotion) => promotion.titleHistory.filter((title) => title.fighterId === fighter.id).map((title) => ({ ...title, promotionId: promotion.id, promotionName: promotion.name }))).sort((a, b) => b.year - a.year || (b.week ?? 1) - (a.week ?? 1))

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal-panel fighter-modal" role="dialog" aria-modal="true" aria-labelledby="fighter-modal-name" onMouseDown={(event) => event.stopPropagation()}>
        <header className="modal-header fighter-modal-header" style={{ '--promotion-color': promotion?.color ?? '#d8a14a' } as React.CSSProperties}>
          <FighterPortrait fighter={fighter} size="lg" accent={promotion?.color} champion={isChampion} className="fighter-modal-avatar" />
          <div className="fighter-modal-title">
            <div className="modal-tag-row">
              <span className={`rarity-badge ${fighter.rarity.toLowerCase()}`}>{fighter.rarity}</span>
              <span>{fighter.gender}</span>
              <span>{fighter.discipline}</span>
              <span>{division}</span>
              {isChampion && <span className="champion-badge">Champion</span>}
              {fighter.isRetired && <span>Retired</span>}
            </div>
            <h2 id="fighter-modal-name">{fighter.firstName} {fighter.lastName}</h2>
            <p>{fighter.ringName ? `“${fighter.ringName}”` : fighter.nationality}</p>
          </div>
          <button className="icon-button" type="button" aria-label="Close fighter details" onClick={onClose}>×</button>
        </header>

        <div className="fighter-profile-strip">
          <div><span>Age</span><strong>{fighter.age}</strong></div>
          <div><span>Style</span><strong>{fighter.style}</strong></div>
          <div><span>Nationality</span><strong>{fighter.nationality}</strong></div>
          <button type="button" className="profile-promotion-link" disabled={!promotion} onClick={() => promotion && onPromotionOpen(promotion.id)}>
            <span>Current promotion</span><strong>{promotion?.name ?? (fighter.isRetired ? 'Retired' : 'Free agent')}</strong>
          </button>
        </div>

        <div className="metric-grid fighter-metric-grid">
          <article className="metric-card"><span>Record</span><strong>{fighter.stats.wins}-{fighter.stats.losses}-{fighter.stats.draws}</strong><small>{winRate}% win rate · {fighter.stats.finishes} finishes</small></article>
          <article className="metric-card"><span>Ranking</span><strong>{isChampion ? 'C' : rank ? `#${rank}` : '—'}</strong><small>{promotion ? `${resumeLabel(score)} · ${score.toFixed(0)} pts` : 'No active ranking'}</small></article>
          <article className="metric-card"><span>Legacy</span><strong>{fighter.legacy.toFixed(0)}</strong><small>{fighter.stats.titles} titles · {fighter.stats.titleDefenses} defenses</small></article>
          <article className="metric-card"><span>Fame</span><strong>{formatNumber(fighter.fame)}</strong><small>{fighter.currentStreak > 0 ? `${fighter.currentStreak}W streak` : fighter.currentStreak < 0 ? `${Math.abs(fighter.currentStreak)}L streak` : 'No active streak'}</small></article>
        </div>

        <section className="modal-section career-legacy-section">
          <div className="section-heading"><div><p className="eyebrow">Career legacy</p><h3>Historical profile</h3></div><span>{fighter.isRetired ? `Hall class ${fighter.retiredYear ?? '—'}` : 'Active career'}</span></div>
          <div className="career-legacy-grid">
            <article><span>HOF score</span><strong>{hofScore}</strong><small>Career greatness index</small></article>
            <article><span>Peak season</span><strong>{bestYear ? bestYear.year : '—'}</strong><small>{bestYear ? `${bestYear.wins}-${bestYear.losses} · ${bestYear.titles} titles · ${bestYear.titleDefenses} defenses` : 'No completed season'}</small></article>
            <article><span>Signature fight</span><strong>{signatureFight ? signatureFight.opponentName : '—'}</strong><small>{signatureFight ? `${signatureFight.fightRating ?? signatureFight.importance}/100 quality · ${(signatureFight.audience ?? 0).toFixed(2)}M audience` : 'No fights yet'}</small></article>
            <article><span>Belt reigns</span><strong>{titleReigns.length}</strong><small>{fighter.stats.titleDefenses} career defenses</small></article>
          </div>
        </section>

        {titleReigns.length > 0 && <section className="modal-section">
          <div className="section-heading"><div><p className="eyebrow">Championship history</p><h3>Belt lineage</h3></div><span>{titleReigns.length} reign{titleReigns.length === 1 ? '' : 's'}</span></div>
          <div className="fighter-belt-list">{titleReigns.map((reign) => <button type="button" key={reign.id} onClick={() => onPromotionOpen(reign.promotionId)}><span className="belt-medallion">◆</span><div><strong>{reign.promotionName} · {reign.weightClass}</strong><small>Started W{reign.week ?? 1} {reign.year} · {reign.reignEndYear ? `ended W${reign.reignEndWeek ?? 1} ${reign.reignEndYear}` : 'current reign'}</small></div><b>{reign.defenses ?? 0}<small>defenses</small></b></button>)}</div>
        </section>}

        <section className="modal-section personality-section">
          <div className="section-heading"><div><p className="eyebrow">Fighter identity</p><h3>Personality that affects the universe</h3></div><span>{fighter.careerArc} · prime ~{fighter.primeAge}</span></div>
          <div className="personality-grid">
            <article className="personality-card"><span>Social personality</span><strong>{fighter.socialPersonality}</strong><p>{SOCIAL_COPY[fighter.socialPersonality]}</p></article>
            <article className="personality-card"><span>Competitive personality</span><strong>{fighter.competitivePersonality}</strong><p>{COMPETITIVE_COPY[fighter.competitivePersonality]}</p></article>
            <article className="personality-card"><span>Career shape</span><strong>{fighter.careerArc}</strong><p>Development and decline are built around an individual prime age rather than one universal aging curve.</p></article>
          </div>
        </section>

        <section className="modal-section">
          <div className="section-heading"><div><p className="eyebrow">Combat profile</p><h3>Ratings and matchup tools</h3></div><span>{fighter.overall} OVR · {fighter.potential} POT</span></div>
          <div className="rating-bars compact-rating-bars">
            {[
              ['Power', fighter.attributes.power], ['Speed', fighter.attributes.speed], ['Technique', fighter.attributes.technique],
              ['Wrestling', fighter.attributes.wrestling], ['Submissions', fighter.attributes.submissions], ['Chin', fighter.attributes.chin],
              ['Cardio', fighter.attributes.cardio], ['Athleticism', fighter.attributes.athleticism], ['Charisma', fighter.charisma], ['Form', fighter.form],
            ].map(([label, value]) => (
              <div className="rating-row" key={label}><span>{label}</span><div className="rating-track"><i style={{ width: `${value}%` }} /></div><strong>{value}</strong></div>
            ))}
          </div>
        </section>

        <section className="modal-section">
          <div className="section-heading"><div><p className="eyebrow">Meaningful history</p><h3>Fight-by-fight career</h3></div><span>{fighter.fightHistory.length} preserved bouts</span></div>
          <div className="table-scroll">
            <table className="data-table interactive-table fight-history-table">
              <thead><tr><th>Date</th><th>Opponent</th><th>Result</th><th>Method</th><th>Rank</th><th>Stakes</th><th>Quality</th><th>Audience</th><th>PPV</th><th>Rivalry</th></tr></thead>
              <tbody>
                {recentFights.length === 0 ? (
                  <tr><td colSpan={10} className="empty-table-cell">No fights yet. Rankings begin building from actual results.</td></tr>
                ) : recentFights.map((fight) => (
                  <tr key={`${fighter.id}-${fight.id}`} onClick={() => onFighterOpen(fight.opponentId)}>
                    <td>W{fight.week ?? '—'} · {monthName(fight.month).slice(0, 3)} {fight.year}</td>
                    <td><strong>{fight.opponentName}</strong><small>{fight.promotionName} · {fight.weightClass}</small></td>
                    <td><span className={`fight-result result-${fight.result.toLowerCase()}`}>{fight.result}</span></td>
                    <td>{fight.method}</td>
                    <td>{fight.rankBefore === 0 ? 'C' : fight.rankBefore ? `#${fight.rankBefore}` : '—'} vs {fight.opponentRankBefore === 0 ? 'C' : fight.opponentRankBefore ? `#${fight.opponentRankBefore}` : '—'}</td>
                    <td>{fight.titleChanged ? 'Won title' : fight.titleDefense ? 'Title defense' : fight.titleBout ? 'Title fight' : fight.upset ? 'Upset' : 'Ranked fight'}</td>
                    <td><strong>{fight.fightRating ?? fight.importance}</strong></td>
                    <td>{(fight.audience ?? 0).toFixed(2)}M</td>
                    <td>{(fight.ppvBuys ?? 0).toFixed(2)}M</td>
                    <td>{fight.rivalryScoreAfter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="modal-section">
          <div className="section-heading"><div><p className="eyebrow">Rivalries</p><h3>Opponents that define the career</h3></div><span>Only recurring / meaningful matchups rise</span></div>
          <div className="rivalry-list">
            {rivalries.length === 0 ? <p className="empty-copy">No meaningful rivalry yet.</p> : rivalries.slice(0, 6).map((rivalry) => {
              const opponentId = rivalry.fighterAId === fighter.id ? rivalry.fighterBId : rivalry.fighterAId
              const opponentName = rivalry.fighterAId === fighter.id ? rivalry.fighterBName : rivalry.fighterAName
              const ownWins = rivalry.fighterAId === fighter.id ? rivalry.winsA : rivalry.winsB
              const opponentWins = rivalry.fighterAId === fighter.id ? rivalry.winsB : rivalry.winsA
              return (
                <button type="button" className="rivalry-card" key={rivalry.id} onClick={() => onFighterOpen(opponentId)}>
                  <span className="rivalry-score">{rivalry.score}</span>
                  <span><strong>{opponentName}</strong><small>{rivalry.meetings} meetings · series {ownWins}-{opponentWins} · {rivalry.titleFights} title fights</small></span>
                  <em>{rivalry.score >= 90 ? 'Historic' : rivalry.score >= 70 ? 'Major' : rivalry.score >= 45 ? 'Heated' : 'Developing'}</em>
                </button>
              )
            })}
          </div>
        </section>

        <section className="modal-section">
          <div className="section-heading"><div><p className="eyebrow">Career by organization</p><h3>Brand breakdown</h3></div><span>{brandStats.length} promotion{brandStats.length === 1 ? '' : 's'}</span></div>
          <div className="table-scroll"><table className="data-table"><thead><tr><th>Promotion</th><th>Fights</th><th>Wins</th><th>Losses</th><th>Titles</th><th>Defenses</th><th>Fame earned</th></tr></thead><tbody>
            {brandStats.length === 0 ? <tr><td colSpan={7} className="empty-table-cell">No fights yet.</td></tr> : brandStats.map((line) => <tr key={line.promotionId}><td><button className="table-link" type="button" onClick={() => onPromotionOpen(line.promotionId)}>{line.promotionName}</button></td><td>{line.fights}</td><td>{line.wins}</td><td>{line.losses}</td><td>{line.titles}</td><td>{line.titleDefenses}</td><td>{line.fameEarned}</td></tr>)}
          </tbody></table></div>
        </section>

        <section className="modal-section">
          <div className="section-heading"><div><p className="eyebrow">Permanent history</p><h3>Year-by-year breakdown</h3></div></div>
          <div className="table-scroll"><table className="data-table"><thead><tr><th>Year</th><th>Promotion(s)</th><th>Fights</th><th>Wins</th><th>Losses</th><th>Titles</th><th>Defenses</th><th>Fame earned</th></tr></thead><tbody>
            {yearStats.length === 0 ? <tr><td colSpan={8} className="empty-table-cell">No annual statistics yet.</td></tr> : yearStats.map((line) => <tr key={line.year}><td>{line.year}</td><td>{line.promotionNames.join(' → ')}</td><td>{line.fights}</td><td>{line.wins}</td><td>{line.losses}</td><td>{line.titles}</td><td>{line.titleDefenses}</td><td>{line.fameEarned}</td></tr>)}
          </tbody></table></div>
        </section>
      </section>
    </div>
  )
}
