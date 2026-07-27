import { useState } from 'react'
import type { SaveSummary } from '../types'

interface LandingPageProps {
  summaries: SaveSummary[]
  onCreate: (slotId: number, name: string) => void
  onLoad: (slotId: number) => void
  onDelete: (slotId: number) => void
}

function formatUpdated(value?: string): string {
  if (!value) return 'Never played'
  const date = new Date(value)
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function LandingPage({ summaries, onCreate, onLoad, onDelete }: LandingPageProps) {
  const [newSlot, setNewSlot] = useState<number | null>(null)
  const [universeName, setUniverseName] = useState('')

  const beginCreation = (slotId: number) => {
    setNewSlot(slotId)
    setUniverseName(`Combat Universe ${slotId}`)
  }

  const confirmCreation = () => {
    if (!newSlot) return
    onCreate(newSlot, universeName)
  }

  const confirmDelete = (slotId: number) => {
    if (window.confirm('Delete this universe permanently?')) onDelete(slotId)
  }

  return (
    <div className="landing-shell">
      <header className="landing-hero">
        <div className="landing-logo" aria-hidden="true">
          CU
        </div>
        <p className="eyebrow">A living combat history simulator</p>
        <h1>Combat Universe</h1>
        <p className="landing-copy">
          Eight promotions. One limited pool of stars. Every championship, defection, rise, collapse,
          merger, and legendary career begins at zero.
        </p>
        <div className="landing-pills" aria-label="Game highlights">
          <span>20-round snake draft</span>
          <span>Male &amp; female histories</span>
          <span>Persistent Almanac</span>
          <span>Full universe control</span>
        </div>
      </header>

      <main className="save-grid" aria-label="Save slots">
        {summaries.map((summary) => (
          <article className={`save-card ${summary.exists ? 'occupied' : 'empty'}`} key={summary.slotId}>
            <div className="save-card-top">
              <span className="slot-number">Slot {summary.slotId}</span>
              <span className={`save-status ${summary.exists ? 'live' : ''}`}>
                {summary.exists ? summary.phase === 'draft' ? 'Draft in progress' : 'Active universe' : 'Empty'}
              </span>
            </div>

            {summary.exists ? (
              <>
                <h2>{summary.universeName}</h2>
                <p className="save-date">Last played {formatUpdated(summary.updatedAt)}</p>
                <div className="save-metrics">
                  <div>
                    <span>Year</span>
                    <strong>{summary.year}</strong>
                  </div>
                  <div>
                    <span>Promotions</span>
                    <strong>{summary.promotions}</strong>
                  </div>
                  <div>
                    <span>Signed stars</span>
                    <strong>{summary.fighters}</strong>
                  </div>
                </div>
                <div className="save-actions">
                  <button className="button primary" type="button" onClick={() => onLoad(summary.slotId)}>
                    {summary.phase === 'draft' ? 'Continue draft' : 'Load universe'}
                  </button>
                  <button className="button danger" type="button" onClick={() => confirmDelete(summary.slotId)}>
                    Delete
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="empty-orbit" aria-hidden="true">
                  <span />
                  <span />
                  <b>+</b>
                </div>
                <h2>Create a new history</h2>
                <p>
                  Begin with the Founding Draft. All fighters and promotions start with zero fame, zero
                  revenue, and no champions.
                </p>
                <button className="button primary wide" type="button" onClick={() => beginCreation(summary.slotId)}>
                  New universe
                </button>
              </>
            )}
          </article>
        ))}
      </main>

      {newSlot && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setNewSlot(null)}>
          <section
            className="modal-panel compact-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-universe-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <p className="eyebrow">Slot {newSlot}</p>
            <h2 id="new-universe-title">Name your universe</h2>
            <p>The name can be changed later. The draft order and full fighter pool are regenerated now.</p>
            <label className="field-label" htmlFor="universe-name">
              Universe name
            </label>
            <input
              id="universe-name"
              className="text-input"
              value={universeName}
              onChange={(event) => setUniverseName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') confirmCreation()
              }}
              autoFocus
            />
            <div className="modal-actions">
              <button className="button" type="button" onClick={() => setNewSlot(null)}>
                Cancel
              </button>
              <button className="button primary" type="button" onClick={confirmCreation} disabled={!universeName.trim()}>
                Enter the Founding Draft
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
