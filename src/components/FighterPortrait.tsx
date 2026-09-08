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
  Common: {
    top: '#596474',
    mid: '#29313D',
    bottom: '#10151D',
    halo: '#A7B0BE',
    rim: '#8993A3',
    pattern: '#C2C9D3',
  },
  Uncommon: {
    top: '#3D8C5C',
    mid: '#173B29',
    bottom: '#0A1711',
    halo: '#68D492',
    rim: '#58B97A',
    pattern: '#8AE0A8',
  },
  Rare: {
    top: '#397FC5',
    mid: '#163B62',
    bottom: '#091624',
    halo: '#73B7F4',
    rim: '#5AA2E8',
    pattern: '#8BC8FF',
  },
  Epic: {
    top: '#7654BF',
    mid: '#38225F',
    bottom: '#140C24',
    halo: '#B190F4',
    rim: '#9871E8',
    pattern: '#C3A7FF',
  },
  Legend: {
    top: '#C89539',
    mid: '#5A3C13',
    bottom: '#1E1408',
    halo: '#F0CC70',
    rim: '#E2B354',
    pattern: '#F4D58B',
  },
  Generational: {
    top: '#B53E49',
    mid: '#5A1C25',
    bottom: '#200A0E',
    halo: '#F06B72',
    rim: '#D95050',
    pattern: '#FF8B8B',
  },
} as const

function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${base.endsWith('/') ? '' : '/'}portraits/${path}`
}

function layer(path: string, key: string) {
  return <image key={key} href={assetUrl(path)} x="0" y="0" width="120" height="120" preserveAspectRatio="xMidYMid meet" />
}

export default function FighterPortrait({ fighter, size = 'md', accent, className = '', champion = false }: FighterPortraitProps) {
  const px = SIZE_MAP[size]
  const profile = createPortraitProfile(fighter, accent ?? '')
  const rarityClass = `rarity-portrait-${fighter.rarity.toLowerCase()}`
  const rarityTheme = RARITY_BACKDROPS[fighter.rarity]
  const svgId = `portrait-${fighter.id}-${size}`.replace(/[^a-zA-Z0-9_-]/g, '')

  const layers = [
    layer(`bases/${profile.baseId}.png`, 'base'),
    layer(`ears/${profile.earSetId}.png`, 'ears'),
    layer(`eyes/${profile.family}/${profile.eyeSetId}.png`, 'eyes'),
    layer(`noses/${profile.noseSetId}.png`, 'nose'),
    layer(`mouths/${profile.mouthSetId}.png`, 'mouth'),
  ]

  if (profile.beardStyle !== 'none') {
    layers.push(layer(`beards/${profile.beardStyle}-${profile.hairColorName}.png`, 'beard'))
  }

  layers.push(layer(`hair/${profile.hairStyle}-${profile.hairColorName}.png`, 'hair'))

  if (profile.accessory !== 'none') {
    layers.push(layer(`accessories/${profile.accessory}.svg`, 'accessory'))
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
      data-portrait-engine="realistic-layer-library-v2"
      data-portrait-family={profile.family}
      data-portrait-base={profile.baseId}
      data-portrait-eyes={profile.eyeSetId}
      data-portrait-nose={profile.noseSetId}
      data-portrait-mouth={profile.mouthSetId}
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

          <radialGradient id={`${svgId}-halo`} cx="50%" cy="34%" r="58%">
            <stop offset="0%" stopColor={rarityTheme.halo} stopOpacity="0.3" />
            <stop offset="42%" stopColor={rarityTheme.halo} stopOpacity="0.1" />
            <stop offset="100%" stopColor={rarityTheme.halo} stopOpacity="0" />
          </radialGradient>

          <linearGradient id={`${svgId}-vignette`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000" stopOpacity="0.02" />
            <stop offset="60%" stopColor="#000" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.34" />
          </linearGradient>

          <linearGradient id={`${svgId}-sheen`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.13" />
            <stop offset="26%" stopColor="#fff" stopOpacity="0.035" />
            <stop offset="55%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>

          <pattern id={`${svgId}-pattern`} width="13" height="13" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
            <line x1="0" y1="0" x2="0" y2="13" stroke={rarityTheme.pattern} strokeWidth="0.7" opacity="0.09" />
          </pattern>

          <filter id={`${svgId}-portrait-depth`} x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="2.1" stdDeviation="1.7" floodColor="#000000" floodOpacity="0.35" />
          </filter>

          <filter id={`${svgId}-rim-glow`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation={fighter.rarity === 'Generational' ? '2.4' : fighter.rarity === 'Legend' ? '2.0' : '1.2'} result="blur" />
          </filter>

          <clipPath id={`${svgId}-clip`}>
            <rect x="0" y="0" width="120" height="120" rx="22" />
          </clipPath>
        </defs>

        <g clipPath={`url(#${svgId}-clip)`}>
          <rect width="120" height="120" fill={`url(#${svgId}-bg)`} />
          <rect width="120" height="120" fill={`url(#${svgId}-pattern)`} />
          <ellipse cx="60" cy="43" rx="49" ry="46" fill={`url(#${svgId}-halo)`} />

          <ellipse cx="60" cy="109" rx="39" ry="10" fill="#000" opacity="0.16" />
          <g filter={`url(#${svgId}-portrait-depth)`}>{layers}</g>

          <rect width="120" height="120" fill={`url(#${svgId}-vignette)`} pointerEvents="none" />
          <path d="M0 0 H78 Q44 20 18 70 Q7 87 0 93Z" fill={`url(#${svgId}-sheen)`} opacity="0.5" pointerEvents="none" />
          <path d="M5 96 Q14 110 32 117" stroke={rarityTheme.rim} strokeWidth="2" opacity="0.22" fill="none" />
          <path d="M89 4 Q108 19 116 42" stroke={rarityTheme.halo} strokeWidth="1.1" opacity="0.14" fill="none" />
        </g>

        <rect
          x="2.5"
          y="2.5"
          width="115"
          height="115"
          rx="20.5"
          fill="none"
          stroke={rarityTheme.rim}
          strokeWidth={fighter.rarity === 'Generational' || fighter.rarity === 'Legend' ? '2.35' : '1.45'}
          opacity={fighter.rarity === 'Generational' || fighter.rarity === 'Legend' ? '0.78' : '0.55'}
        />

        {(fighter.rarity === 'Legend' || fighter.rarity === 'Generational') ? (
          <rect
            x="4.5"
            y="4.5"
            width="111"
            height="111"
            rx="18.8"
            fill="none"
            stroke={rarityTheme.halo}
            strokeWidth="2.7"
            opacity="0.2"
            filter={`url(#${svgId}-rim-glow)`}
          />
        ) : null}

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
