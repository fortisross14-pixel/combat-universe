import type { Fighter } from '../types'
import { assignPortrait, portraitFamilyForFighter, portraitTierForFighter } from '../data/portraitLibrary'

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

function portraitUrl(path: string): string {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${base.endsWith('/') ? '' : '/'}portraits-v11/${path}`
}

export default function FighterPortrait({ fighter, size = 'md', className = '', champion = false }: FighterPortraitProps) {
  const px = SIZE_MAP[size]
  const rarityTheme = RARITY_BACKDROPS[fighter.rarity]
  const assigned = assignPortrait(fighter)
  const family = portraitFamilyForFighter(fighter)
  const tier = portraitTierForFighter(fighter)
  const svgId = `portrait-v11-${fighter.id}-${size}`.replace(/[^a-zA-Z0-9_-]/g, '')

  return (
    <div
      className={`fighter-portrait rarity-portrait-${fighter.rarity.toLowerCase()} portrait-${size} ${champion ? 'is-champion' : ''} ${className}`.trim()}
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
      data-portrait-engine="v11-curated-library"
      data-portrait-family={family}
      data-portrait-tier={tier}
      data-portrait-asset={assigned.asset.id}
      data-portrait-accessory={assigned.accessory ?? 'none'}
      data-rarity={fighter.rarity}
    >
      <svg viewBox="0 0 120 120" role="img">
        <defs>
          <linearGradient id={`${svgId}-bg`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={rarityTheme.top} />
            <stop offset="44%" stopColor={rarityTheme.mid} />
            <stop offset="100%" stopColor={rarityTheme.bottom} />
          </linearGradient>
          <linearGradient id={`${svgId}-vignette`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000" stopOpacity="0" />
            <stop offset="72%" stopColor="#000" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.23" />
          </linearGradient>
          <pattern id={`${svgId}-pattern`} width="13" height="13" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
            <line x1="0" y1="0" x2="0" y2="13" stroke={rarityTheme.pattern} strokeWidth="0.7" opacity="0.06" />
          </pattern>
          <filter id={`${svgId}-depth`} x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="2" stdDeviation="1.55" floodColor="#000000" floodOpacity="0.28" />
          </filter>
          <clipPath id={`${svgId}-clip`}>
            <rect x="0" y="0" width="120" height="120" rx="22" />
          </clipPath>
        </defs>

        <g clipPath={`url(#${svgId}-clip)`}>
          <rect width="120" height="120" fill={`url(#${svgId}-bg)`} />
          <rect width="120" height="120" fill={`url(#${svgId}-pattern)`} />
          <ellipse cx="60" cy="111" rx="42" ry="9" fill="#000" opacity="0.13" />

          <image
            href={portraitUrl(assigned.asset.file)}
            x="0"
            y="0"
            width="120"
            height="120"
            preserveAspectRatio="xMidYMid meet"
            filter={`url(#${svgId}-depth)`}
          />

          {assigned.accessory ? (
            <image href={portraitUrl(`accessories/${assigned.accessory}.svg`)} x="0" y="0" width="120" height="120" preserveAspectRatio="xMidYMid meet" />
          ) : null}

          <rect width="120" height="120" fill={`url(#${svgId}-vignette)`} pointerEvents="none" />
        </g>

        <rect
          x="2.5"
          y="2.5"
          width="115"
          height="115"
          rx="20.5"
          fill="none"
          stroke={rarityTheme.rim}
          strokeWidth={fighter.rarity === 'Generational' || fighter.rarity === 'Legend' ? '2.25' : '1.45'}
          opacity={fighter.rarity === 'Generational' || fighter.rarity === 'Legend' ? '0.82' : '0.58'}
        />
        <rect x="5" y="5" width="110" height="110" rx="18.5" fill="none" stroke={rarityTheme.halo} strokeWidth="0.8" opacity="0.20" />

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
