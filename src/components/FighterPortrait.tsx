import type { Fighter } from '../types'

interface FighterPortraitProps {
  fighter: Fighter
  size?: 'xs' | 'sm' | 'md' | 'lg'
  accent?: string
  className?: string
  champion?: boolean
}

const SIZE_MAP = {
  xs: 34,
  sm: 52,
  md: 84,
  lg: 132,
} as const

const SKIN_TONES = ['#F6D7C3', '#E8C2A8', '#D8A17A', '#C57F54', '#A9653F', '#7D4A2F']
const HAIR_COLORS = ['#16181d', '#302824', '#503728', '#7e532f', '#cfaa66', '#8a1f1f']
const EYE_COLORS = ['#4B4037', '#6a4d2a', '#334960', '#476037', '#2f2f38']
const BG_TINTS = ['#2A3140', '#2E253A', '#133343', '#242C3A', '#3B2719', '#1D2432']

function hashString(value: string): number {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }
  return hash
}

function pick<T>(items: readonly T[], seed: number, offset = 0): T {
  return items[(Math.floor(seed / (offset + 1)) + offset) % items.length]
}

function feature(seed: number, min: number, max: number, divisor: number): number {
  return min + ((Math.floor(seed / divisor) % 100) / 100) * (max - min)
}

export default function FighterPortrait({ fighter, size = 'md', accent, className = '', champion = false }: FighterPortraitProps) {
  const px = SIZE_MAP[size]
  const seed = hashString(`${fighter.id}:${fighter.firstName}:${fighter.lastName}:${fighter.rarity}:${fighter.style}`)
  const skin = pick(SKIN_TONES, seed, 3)
  const hair = pick(HAIR_COLORS, seed, 7)
  const eyes = pick(EYE_COLORS, seed, 11)
  const bg = pick(BG_TINTS, seed, 13)
  const useAccent = accent ?? (fighter.rarity === 'Generational'
    ? '#d15454'
    : fighter.rarity === 'Legend'
      ? '#d8a14a'
      : fighter.rarity === 'Epic'
        ? '#8f74e8'
        : fighter.rarity === 'Rare'
          ? '#5e9fe7'
          : fighter.rarity === 'Uncommon'
            ? '#59c28a'
            : '#79808f')

  const faceShape = Math.floor(seed % 4)
  const hairStyle = Math.floor(seed % 7)
  const browLift = feature(seed, -1.5, 1.5, 17)
  const eyeGap = feature(seed, 10.5, 12.5, 19)
  const noseW = feature(seed, 4, 7.5, 23)
  const mouthCurve = feature(seed, -3, 3, 29)
  const jaw = feature(seed, 27, 33, 31)
  const beard = fighter.gender === 'Male' && seed % 3 !== 0
  const moustache = fighter.gender === 'Male' && seed % 5 === 0
  const accessory = seed % 9
  const facialMark = seed % 6 === 0
  const ageFactor = Math.max(0, (fighter.age - 31) / 12)
  const older = fighter.age >= 35
  const primeGlow = fighter.rarity === 'Generational' || fighter.rarity === 'Legend'
  const clothingColor = fighter.discipline === 'Boxing'
    ? '#822d2f'
    : fighter.discipline === 'Kickboxing'
      ? '#365281'
      : fighter.discipline === 'Wrestling'
        ? '#4d2f65'
        : '#2d644a'
  const neckline = fighter.discipline === 'Wrestling'
    ? 'M26 92 Q38 72 50 72 Q62 72 74 92 L26 92Z'
    : fighter.discipline === 'Boxing'
      ? 'M22 92 Q31 73 50 73 Q69 73 78 92 L22 92Z'
      : 'M24 92 Q36 74 50 74 Q64 74 76 92 L24 92Z'

  const face = faceShape === 0
    ? <ellipse cx="50" cy="45" rx="22" ry="25" fill={skin} />
    : faceShape === 1
      ? <path d={`M29 32 Q50 20 71 32 L68 ${jaw + 22} Q50 76 32 ${jaw + 22} Z`} fill={skin} />
      : faceShape === 2
        ? <rect x="29" y="22" width="42" height="49" rx="18" fill={skin} />
        : <path d="M32 28 Q50 18 68 28 Q72 54 61 70 Q50 78 39 70 Q28 54 32 28Z" fill={skin} />

  const hairFront = hairStyle === 0
    ? <path d="M29 37 Q34 18 50 17 Q67 18 71 37 Q63 30 50 30 Q36 30 29 37Z" fill={hair} />
    : hairStyle === 1
      ? <path d="M27 41 Q28 19 50 16 Q70 19 73 41 Q65 34 50 35 Q36 34 27 41Z" fill={hair} />
      : hairStyle === 2
        ? <path d="M30 36 Q35 16 50 15 Q65 16 70 36 L70 28 Q58 22 50 22 Q42 22 30 28Z" fill={hair} />
        : hairStyle === 3
          ? <path d="M28 39 C28 20 71 20 72 39 Q60 29 50 30 Q38 30 28 39Z" fill={hair} />
          : hairStyle === 4
            ? <path d="M27 40 Q31 15 50 15 Q69 15 73 40 Q67 31 50 33 Q34 31 27 40Z" fill={hair} />
            : hairStyle === 5
              ? <path d="M42 12 L58 12 L55 38 L45 38 Z" fill={hair} />
              : null

  const hairBack = hairStyle === 6
    ? null
    : <path d="M29 40 Q29 18 50 16 Q71 18 71 40 L71 46 Q64 35 50 35 Q36 35 29 46Z" fill={hair} opacity="0.95" />

  const beardShape = beard ? <path d="M34 54 Q50 66 66 54 Q64 70 50 73 Q36 70 34 54Z" fill={hair} opacity="0.9" /> : null
  const moustacheShape = moustache ? <path d="M42 57 Q46 54 50 57 Q54 54 58 57" stroke={hair} strokeWidth="2.4" strokeLinecap="round" fill="none" /> : null

  return (
    <div
      className={`fighter-portrait portrait-${size} ${champion ? 'is-champion' : ''} ${className}`.trim()}
      style={{ '--portrait-size': `${px}px`, '--portrait-accent': useAccent, '--portrait-bg': bg } as React.CSSProperties}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" role="img">
        <defs>
          <linearGradient id={`bg-${seed}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={useAccent} stopOpacity="0.32" />
            <stop offset="100%" stopColor={bg} stopOpacity="1" />
          </linearGradient>
          <linearGradient id={`robe-${seed}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={clothingColor} />
            <stop offset="100%" stopColor="#151922" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="100" height="100" rx="24" fill={`url(#bg-${seed})`} />
        <circle cx="50" cy="34" r="26" fill="rgba(255,255,255,0.08)" />
        <path d={neckline} fill={`url(#robe-${seed})`} opacity="0.95" />
        {fighter.discipline === 'Boxing' ? <path d="M16 88 Q20 77 30 75 Q24 83 27 92 Z" fill="#8a3234" opacity="0.95" /> : null}
        {fighter.discipline === 'Boxing' ? <path d="M84 88 Q80 77 70 75 Q76 83 73 92 Z" fill="#8a3234" opacity="0.95" /> : null}
        {fighter.discipline === 'Wrestling' ? <path d="M36 76 H64 V91 H36 Z" fill="#242935" opacity="0.7" /> : null}
        {hairBack}
        {face}
        <rect x="44" y="64" width="12" height="12" rx="5" fill={skin} />
        {hairFront}
        <path d={`M38 ${41 + browLift} Q43 ${38 + browLift} 46 ${41 + browLift}`} stroke={hair} strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <path d={`M54 ${41 - browLift} Q57 ${38 - browLift} 62 ${41 - browLift}`} stroke={hair} strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <ellipse cx={50 - eyeGap / 2} cy="46" rx="3.2" ry="2.6" fill={eyes} />
        <ellipse cx={50 + eyeGap / 2} cy="46" rx="3.2" ry="2.6" fill={eyes} />
        <circle cx={50 - eyeGap / 2} cy="45.6" r="0.8" fill="#fff" opacity="0.9" />
        <circle cx={50 + eyeGap / 2} cy="45.6" r="0.8" fill="#fff" opacity="0.9" />
        <path d={`M50 48 L${50 - noseW / 2} 57 Q50 59 ${50 + noseW / 2} 57`} stroke="#9a6a4e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.7" />
        <path d={`M40 61 Q50 ${64 + mouthCurve} 60 61`} stroke="#7b3f36" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        {beardShape}
        {moustacheShape}
        {facialMark ? <path d="M33 54 L38 50" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round" /> : null}
        {older ? <path d="M41 42 Q43 43 46 42" stroke="rgba(255,255,255,0.2)" strokeWidth="0.9" fill="none" /> : null}
        {older ? <path d="M54 42 Q57 43 60 42" stroke="rgba(255,255,255,0.2)" strokeWidth="0.9" fill="none" /> : null}
        {ageFactor > 0 ? <path d="M43 63 Q50 66 57 63" stroke="rgba(80,40,40,0.22)" strokeWidth={0.8 + ageFactor * 0.4} fill="none" /> : null}
        {accessory === 2 ? <path d="M34 45 H66" stroke="rgba(255,255,255,0.2)" strokeWidth="7" strokeLinecap="round" /> : null}
        {accessory === 2 ? <circle cx="39" cy="46" r="6.5" stroke="#dbe3f2" strokeWidth="1.5" fill="none" opacity="0.7" /> : null}
        {accessory === 2 ? <circle cx="61" cy="46" r="6.5" stroke="#dbe3f2" strokeWidth="1.5" fill="none" opacity="0.7" /> : null}
        {accessory === 5 ? <path d="M24 22 Q50 6 76 22" stroke={useAccent} strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.8" /> : null}
        {primeGlow ? <rect x="3" y="3" width="94" height="94" rx="21" stroke={useAccent} strokeWidth="2" opacity="0.4" fill="none" /> : null}
        {champion ? <g transform="translate(70 8)"><path d="M6 0 L8.3 4.4 L13 5.1 L9.6 8.3 L10.4 13 L6 10.6 L1.6 13 L2.4 8.3 L-1 5.1 L3.7 4.4Z" fill="#f7d98d" /><path d="M-1 14 H13 V18 H-1 Z" fill="#d8a14a" /></g> : null}
      </svg>
    </div>
  )
}
