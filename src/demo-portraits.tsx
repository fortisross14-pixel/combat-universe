import React from 'react'
import ReactDOM from 'react-dom/client'
import FighterPortrait from './components/FighterPortrait'
import type { Fighter } from './types'

const baseStats = {
  fights: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  finishes: 0,
  titles: 0,
  titleDefenses: 0,
  fameEarned: 0,
}

function fighter(partial: Partial<Fighter>): Fighter {
  return {
    id: partial.id ?? 'demo',
    firstName: partial.firstName ?? 'Demo',
    lastName: partial.lastName ?? 'Fighter',
    ringName: partial.ringName,
    gender: partial.gender ?? 'Male',
    age: partial.age ?? 27,
    nationality: partial.nationality ?? 'United States',
    style: partial.style ?? 'MMA All-Rounder',
    discipline: partial.discipline ?? 'MMA',
    weightClass: partial.weightClass ?? 'Lightweight',
    rarity: partial.rarity ?? 'Epic',
    overall: partial.overall ?? 90,
    charisma: partial.charisma ?? 85,
    potential: partial.potential ?? 92,
    form: partial.form ?? 0,
    fame: partial.fame ?? 0,
    legacy: partial.legacy ?? 0,
    socialPersonality: partial.socialPersonality ?? 'Fighter',
    competitivePersonality: partial.competitivePersonality ?? 'Fearless',
    careerArc: partial.careerArc ?? 'Balanced',
    primeAge: partial.primeAge ?? 29,
    attributes: partial.attributes ?? {
      power: 80,
      speed: 80,
      technique: 80,
      wrestling: 80,
      submissions: 80,
      chin: 80,
      cardio: 80,
      athleticism: 80,
    },
    promotionId: partial.promotionId ?? 'ufc',
    isDraftEligible: partial.isDraftEligible ?? false,
    isRetired: partial.isRetired ?? false,
    lastFightYear: partial.lastFightYear ?? null,
    lastFightMonth: partial.lastFightMonth ?? null,
    lastFightWeek: partial.lastFightWeek ?? null,
    retiredYear: partial.retiredYear,
    currentStreak: partial.currentStreak ?? 0,
    stats: partial.stats ?? baseStats,
    brandStats: partial.brandStats ?? {},
    yearStats: partial.yearStats ?? {},
    fightHistory: partial.fightHistory ?? [],
  }
}

const fighters: Fighter[] = [
  fighter({ id: 'kaito', firstName: 'Kaito', lastName: 'Tanaka', gender: 'Male', age: 28, nationality: 'Japan', style: 'Precision Boxing', discipline: 'Boxing', rarity: 'Rare', socialPersonality: 'Humble', competitivePersonality: 'Legacy-Driven', overall: 89 }),
  fighter({ id: 'nia', firstName: 'Nia', lastName: 'Okafor', gender: 'Female', age: 26, nationality: 'Nigeria', style: 'Kickboxing', discipline: 'MMA', rarity: 'Legend', socialPersonality: 'Villain', competitivePersonality: 'Fearless', overall: 95 }),
  fighter({ id: 'lucia', firstName: 'Lucía', lastName: 'Alvarez', gender: 'Female', age: 25, nationality: 'Mexico', style: 'Technical Wrestler', discipline: 'Wrestling', rarity: 'Epic', socialPersonality: 'Showman', competitivePersonality: 'Calculated', overall: 91 }),
  fighter({ id: 'arjun', firstName: 'Arjun', lastName: 'Singh', gender: 'Male', age: 30, nationality: 'India', style: 'Muay Thai', discipline: 'Kickboxing', rarity: 'Uncommon', socialPersonality: 'Classy', competitivePersonality: 'Calculated', overall: 83 }),
]

function App() {
  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at top, #162135 0%, #081019 55%, #05080d 100%)', color: 'white', padding: '34px 28px 44px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ color: '#9fb5d7', fontSize: 14, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 8 }}>Combat Universe Chronicle v0.9.2</div>
          <h1 style={{ margin: 0, fontSize: 44, lineHeight: 1.1 }}>Portrait engine examples</h1>
          <p style={{ margin: '10px 0 0', fontSize: 18, color: '#c8d1df' }}>Rendered directly from the in-game modular portrait engine</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 24 }}>
          {fighters.map((entry) => (
            <div key={entry.id} style={{ background: 'linear-gradient(180deg, rgba(15,23,36,.95), rgba(9,13,20,.98))', border: '1px solid rgba(255,255,255,.08)', borderRadius: 22, padding: 18, boxShadow: '0 16px 40px rgba(0,0,0,.35)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                <FighterPortrait fighter={entry} size="lg" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{entry.firstName} {entry.lastName}</div>
                <div style={{ fontSize: 18, color: '#d9b05a', fontWeight: 700, marginBottom: 6 }}>{entry.rarity}</div>
                <div style={{ fontSize: 16, color: '#d2dae7', marginBottom: 3 }}>{entry.nationality}</div>
                <div style={{ fontSize: 15, color: '#9cb0cb' }}>{entry.gender} · {entry.discipline}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
