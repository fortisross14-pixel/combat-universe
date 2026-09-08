import type { Fighter } from '../types'
import { createPortraitProfile } from './portraitModel'

interface FighterPortraitProps {
  fighter: Fighter
  size?: 'xs' | 'sm' | 'md' | 'lg'
  accent?: string
  className?: string
  champion?: boolean
}

const SIZE_MAP = { xs: 34, sm: 52, md: 84, lg: 132 } as const

const RARITY_BACKDROPS = {
  Common: { top: '#596474', mid: '#29313D', bottom: '#10151D', halo: '#A7B0BE', rim: '#8993A3', pattern: '#C2C9D3' },
  Uncommon: { top: '#3D8C5C', mid: '#173B29', bottom: '#0A1711', halo: '#68D492', rim: '#58B97A', pattern: '#8AE0A8' },
  Rare: { top: '#397FC5', mid: '#163B62', bottom: '#091624', halo: '#73B7F4', rim: '#5AA2E8', pattern: '#8BC8FF' },
  Epic: { top: '#7654BF', mid: '#38225F', bottom: '#140C24', halo: '#B190F4', rim: '#9871E8', pattern: '#C3A7FF' },
  Legend: { top: '#C89539', mid: '#5A3C13', bottom: '#1E1408', halo: '#F0CC70', rim: '#E2B354', pattern: '#F4D58B' },
  Generational: { top: '#B53E49', mid: '#5A1C25', bottom: '#200A0E', halo: '#F06B72', rim: '#D95050', pattern: '#FF8B8B' },
} as const

function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${base.endsWith('/') ? '' : '/'}portraits/${path}`
}

function rasterLayer(path: string, key: string, opacity = 1) {
  return <image key={key} href={assetUrl(path)} x="0" y="0" width="120" height="120" preserveAspectRatio="xMidYMid meet" opacity={opacity} />
}

export default function FighterPortrait({ fighter, size = 'md', accent, className = '', champion = false }: FighterPortraitProps) {
  const px = SIZE_MAP[size]
  const profile = createPortraitProfile(fighter, accent ?? '')
  const rarityClass = `rarity-portrait-${fighter.rarity.toLowerCase()}`
  const rarityTheme = RARITY_BACKDROPS[fighter.rarity]
  const svgId = `portrait-${fighter.id}-${size}`.replace(/[^a-zA-Z0-9_-]/g, '')

  const faceLayers = [
    rasterLayer(`bases/${profile.baseId}-${profile.skinToneId}.png`, 'base'),
  ]

  if (fighter.gender === 'Male' && profile.beardStyle !== 'none') {
    faceLayers.push(rasterLayer(`beards/${profile.beardStyle}-${profile.hairColorName}.png`, 'beard', 0.86))
  }
  faceLayers.push(rasterLayer(`hair/${profile.hairStyle}-${profile.hairColorName}.png`, 'hair', 0.92))
  if (profile.accessory !== 'none') {
    faceLayers.push(rasterLayer(`accessories/${profile.accessory}.svg`, 'accessory', 0.95))
  }

  const eyeLine = profile.hairColorName === 'blonde' ? '#4B352C' : '#2B1F1A'
  const browColor = fighter.gender === 'Female'
    ? (profile.hairColorName === 'blonde' ? '#6C554A' : profile.hairColorName === 'brown' ? '#4B332A' : '#30211C')
    : (profile.hairColorName === 'blonde' ? '#5B4336' : profile.hairColorName === 'brown' ? '#3A271F' : '#221717')
  const lipColor = fighter.gender === 'Female' ? 'rgba(122,66,70,0.52)' : 'rgba(92,60,52,0.32)'
  const noseColor = fighter.gender === 'Female' ? 'rgba(88,54,46,0.22)' : 'rgba(78,46,38,0.28)'

  const eyeY = profile.eyeY
  const leftX = 60 - profile.eyeGap / 2 - profile.eyeWidth * 0.75
  const rightX = 60 + profile.eyeGap / 2 - profile.eyeWidth * 0.25
  const browLift = fighter.gender === 'Female' ? -1.4 : 0
  const eyeOpen = Math.max(1.8, profile.eyeHeight * (fighter.gender === 'Female' ? 1.04 : 0.96))
  const browWeight = fighter.gender === 'Female' ? Math.max(1.2, profile.browWeight * 0.72) : profile.browWeight * 0.92
  const lipHeight = Math.max(1.4, profile.lipFullness * (fighter.gender === 'Female' ? 1.7 : 1.18))
  const lipCurve = profile.mouthCurve * 1.2 + profile.smileLift * 0.35

  const renderEye = (x: number, side: 'left' | 'right') => {
    const flip = side === 'left' ? -1 : 1
    const irisX = x + profile.eyeWidth * 0.42
    return (
      <g key={`eye-${side}`} opacity={0.98}>
        <path
          d={`M ${x} ${eyeY} Q ${x + profile.eyeWidth * 0.45} ${eyeY - eyeOpen - profile.eyeTilt * 0.25 * flip} ${x + profile.eyeWidth} ${eyeY} Q ${x + profile.eyeWidth * 0.45} ${eyeY + eyeOpen * 0.66} ${x} ${eyeY}`}
          fill="rgba(255,255,255,0.84)"
          opacity={profile.eyeShape === 'narrow' || profile.eyeShape === 'monolid' ? 0.45 : 0.78}
        />
        <path
          d={`M ${x - 0.2} ${eyeY + 0.15} Q ${x + profile.eyeWidth * 0.45} ${eyeY - eyeOpen - profile.eyeTilt * 0.35 * flip} ${x + profile.eyeWidth + 0.2} ${eyeY}`}
          stroke={eyeLine}
          strokeWidth={fighter.gender === 'Female' ? 1.55 : 1.85}
          strokeLinecap="round"
          fill="none"
          opacity={0.94}
        />
        <path
          d={`M ${x + 0.5} ${eyeY + eyeOpen * 0.15} Q ${x + profile.eyeWidth * 0.45} ${eyeY + eyeOpen * 0.58} ${x + profile.eyeWidth - 0.5} ${eyeY + eyeOpen * 0.1}`}
          stroke={eyeLine}
          strokeWidth={0.85}
          strokeLinecap="round"
          fill="none"
          opacity={0.32}
        />
        <circle cx={irisX} cy={eyeY + eyeOpen * 0.14} r={Math.max(1.6, profile.eyeHeight * 0.58)} fill={profile.eyes} opacity={0.96} />
        <circle cx={irisX} cy={eyeY + eyeOpen * 0.14} r={Math.max(0.85, profile.eyeHeight * 0.26)} fill="#151313" opacity={0.95} />
        <circle cx={irisX + 0.45} cy={eyeY - 0.15} r="0.5" fill="#ffffff" opacity="0.76" />
      </g>
    )
  }

  return (
    <div
      className={`fighter-portrait ${rarityClass} portrait-${size} ${champion ? 'is-champion' : ''} ${className}`.trim()}
      style={{
        '--portrait-size': `${px}px`,
        '--portrait-accent': rarityTheme.rim,
        '--portrait-bg': rarityTheme.bottom,
        '--portrait-rarity-top': rarityTheme.top,
        '--portrait-rarity-mid': rarityTheme.mid,
        '--portrait-rarity-bottom': rarityTheme.bottom,
        '--portrait-rarity-halo': rarityTheme.halo,
      } as React.CSSProperties}
      aria-hidden="true"
      data-portrait-engine="v10-base-tone-assignment"
      data-portrait-family={profile.family}
      data-portrait-base={profile.baseId}
      data-portrait-skin={profile.skinToneId}
      data-portrait-hair={`${profile.hairStyle}-${profile.hairColorName}`}
      data-portrait-expression={profile.expression}
      data-rarity={fighter.rarity}
    >
      <svg viewBox="0 0 120 120" role="img">
        <defs>
          <linearGradient id={`${svgId}-bg`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={rarityTheme.top} />
            <stop offset="43%" stopColor={rarityTheme.mid} />
            <stop offset="100%" stopColor={rarityTheme.bottom} />
          </linearGradient>
          <linearGradient id={`${svgId}-vignette`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000" stopOpacity="0.012" />
            <stop offset="60%" stopColor="#000" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.28" />
          </linearGradient>
          <linearGradient id={`${svgId}-sheen`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.1" />
            <stop offset="26%" stopColor="#fff" stopOpacity="0.026" />
            <stop offset="55%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <pattern id={`${svgId}-pattern`} width="13" height="13" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
            <line x1="0" y1="0" x2="0" y2="13" stroke={rarityTheme.pattern} strokeWidth="0.7" opacity="0.075" />
          </pattern>
          <filter id={`${svgId}-portrait-depth`} x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="1.9" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.28" />
          </filter>
          <clipPath id={`${svgId}-clip`}>
            <rect x="0" y="0" width="120" height="120" rx="22" />
          </clipPath>
        </defs>

        <g clipPath={`url(#${svgId}-clip)`}>
          <rect width="120" height="120" fill={`url(#${svgId}-bg)`} />
          <rect width="120" height="120" fill={`url(#${svgId}-pattern)`} />
          <ellipse cx="60" cy="109" rx="39" ry="10" fill="#000" opacity="0.12" />

          <g filter={`url(#${svgId}-portrait-depth)`}>{faceLayers}</g>

          <g opacity="0.94">
            <path
              d={`M ${leftX - 1} ${profile.browY + browLift} Q ${leftX + profile.eyeWidth * 0.45} ${profile.browY - 1.7 - profile.browTilt * 0.34} ${leftX + profile.eyeWidth + 1} ${profile.browY + browLift + 0.2}`}
              stroke={browColor}
              strokeWidth={browWeight}
              strokeLinecap="round"
              fill="none"
            />
            <path
              d={`M ${rightX - 1} ${profile.browY + browLift + 0.2} Q ${rightX + profile.eyeWidth * 0.45} ${profile.browY - 1.7 + profile.browTilt * 0.34} ${rightX + profile.eyeWidth + 1} ${profile.browY + browLift}`}
              stroke={browColor}
              strokeWidth={browWeight}
              strokeLinecap="round"
              fill="none"
            />
            {renderEye(leftX, 'left')}
            {renderEye(rightX, 'right')}

            <path
              d={`M 60 ${eyeY + 3.5} Q ${60 + profile.noseX * 0.08} ${eyeY + 10} ${60 + profile.noseX * 0.12} ${eyeY + profile.noseLength * 0.92}`}
              stroke={noseColor}
              strokeWidth={fighter.gender === 'Female' ? 1.0 : 1.25}
              strokeLinecap="round"
              fill="none"
              opacity="0.48"
            />
            <path
              d={`M ${60 - profile.noseWidth * 0.18} ${eyeY + profile.noseLength * 0.94} Q 60 ${eyeY + profile.noseLength + 1.4} ${60 + profile.noseWidth * 0.18} ${eyeY + profile.noseLength * 0.94}`}
              stroke={noseColor}
              strokeWidth="1"
              strokeLinecap="round"
              fill="none"
              opacity="0.55"
            />
            <circle cx={60 - profile.noseWidth * 0.14} cy={eyeY + profile.noseLength * 0.97} r="0.58" fill="rgba(52,31,27,0.4)" />
            <circle cx={60 + profile.noseWidth * 0.14} cy={eyeY + profile.noseLength * 0.97} r="0.58" fill="rgba(52,31,27,0.4)" />

            <path
              d={`M ${60 - profile.mouthWidth * 0.46} ${profile.mouthY} Q 60 ${profile.mouthY + lipCurve} ${60 + profile.mouthWidth * 0.46} ${profile.mouthY}`}
              stroke={lipColor}
              strokeWidth={fighter.gender === 'Female' ? 1.75 : 1.55}
              strokeLinecap="round"
              fill="none"
              opacity="0.86"
            />
            <path
              d={`M ${60 - profile.mouthWidth * 0.32} ${profile.mouthY + lipHeight * 0.52} Q 60 ${profile.mouthY + lipHeight * 1.02 + lipCurve * 0.24} ${60 + profile.mouthWidth * 0.32} ${profile.mouthY + lipHeight * 0.52}`}
              stroke="rgba(144,92,88,0.26)"
              strokeWidth={fighter.gender === 'Female' ? 1.1 : 0.9}
              strokeLinecap="round"
              fill="none"
            />
          </g>

          <rect width="120" height="120" fill={`url(#${svgId}-vignette)`} pointerEvents="none" />
          <path d="M0 0 H78 Q44 20 18 70 Q7 87 0 93Z" fill={`url(#${svgId}-sheen)`} opacity="0.42" pointerEvents="none" />
          <path d="M5 96 Q14 110 32 117" stroke={rarityTheme.rim} strokeWidth="2" opacity="0.2" fill="none" />
        </g>

        <rect x="2.5" y="2.5" width="115" height="115" rx="20.5" fill="none" stroke={rarityTheme.rim} strokeWidth={fighter.rarity === 'Generational' || fighter.rarity === 'Legend' ? '2.25' : '1.45'} opacity={fighter.rarity === 'Generational' || fighter.rarity === 'Legend' ? '0.78' : '0.55'} />

        {champion ? (
          <g transform="translate(91 10)">
            <circle cx="8" cy="8" r="10.5" fill="#14100A" opacity="0.58" />
            <path d="M8 0 L10.5 5.1 L16 5.9 L12 9.8 L12.9 15.3 L8 12.7 L3.1 15.3 L4 9.8 L0 5.9 L5.5 5.1Z" fill="#F4D27C" />
            <path d="M1 17 H15 V20 H1Z" fill="#D5A33D" />
          </g>
        ) : null}
      </svg>
    </div>
  )
}
