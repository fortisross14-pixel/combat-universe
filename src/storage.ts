import type { GameState, SaveSummary } from './types'

const SAVE_PREFIX = 'combat-universe-save-v1-'
const UPDATED_PREFIX = 'combat-universe-updated-v1-'

function key(slotId: number): string {
  return `${SAVE_PREFIX}${slotId}`
}

export function saveGame(state: GameState): void {
  localStorage.setItem(key(state.slotId), JSON.stringify(state))
  localStorage.setItem(`${UPDATED_PREFIX}${state.slotId}`, new Date().toISOString())
}

export function loadGame(slotId: number): GameState | null {
  const raw = localStorage.getItem(key(slotId))
  if (!raw) return null
  try {
    return JSON.parse(raw) as GameState
  } catch {
    return null
  }
}

export function deleteGame(slotId: number): void {
  localStorage.removeItem(key(slotId))
  localStorage.removeItem(`${UPDATED_PREFIX}${slotId}`)
}

export function getSaveSummaries(): SaveSummary[] {
  return [1, 2, 3].map((slotId) => {
    const state = loadGame(slotId)
    if (!state) return { slotId, exists: false }
    return {
      slotId,
      exists: true,
      universeName: state.universeName,
      phase: state.phase,
      year: state.currentYear,
      month: state.currentMonth,
      promotions: state.promotions.length,
      fighters: state.fighters.filter((fighter) => fighter.promotionId && !fighter.isRetired).length,
      updatedAt: localStorage.getItem(`${UPDATED_PREFIX}${slotId}`) ?? state.createdAt,
    }
  })
}
