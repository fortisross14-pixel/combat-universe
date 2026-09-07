import type { GameState, SaveSummary } from './types'
import { upgradeGameState } from './engine/universe'

const DATABASE_NAME = 'combat-universe-database'
const DATABASE_VERSION = 1

const SAVE_STORE = 'saves'
const SUMMARY_STORE = 'summaries'

interface StoredSave {
  slotId: number
  state: GameState
}

function emptySummary(slotId: number): SaveSummary {
  return {
    slotId,
    exists: false,
  }
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)

    request.onupgradeneeded = () => {
      const database = request.result

      if (!database.objectStoreNames.contains(SAVE_STORE)) {
        database.createObjectStore(SAVE_STORE, {
          keyPath: 'slotId',
        })
      }

      if (!database.objectStoreNames.contains(SUMMARY_STORE)) {
        database.createObjectStore(SUMMARY_STORE, {
          keyPath: 'slotId',
        })
      }
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(request.error ?? new Error('Could not open the save database.'))
    }

    request.onblocked = () => {
      reject(
        new Error(
          'The save database is blocked by another open Combat Universe tab.',
        ),
      )
    }
  })
}

function transactionComplete(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()

    transaction.onerror = () => {
      reject(
        transaction.error ?? new Error('The save transaction failed.'),
      )
    }

    transaction.onabort = () => {
      reject(
        transaction.error ?? new Error('The save transaction was aborted.'),
      )
    }
  })
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)

    request.onerror = () => {
      reject(request.error ?? new Error('The database request failed.'))
    }
  })
}

function createSummary(state: GameState): SaveSummary {
  return {
    slotId: state.slotId,
    exists: true,
    universeName: state.universeName,
    phase: state.phase,
    year: state.currentYear,
    month: state.currentMonth,
    week: state.currentWeek,
    promotions: state.promotions.length,
    fighters: state.fighters.filter(
      (fighter) => fighter.promotionId && !fighter.isRetired,
    ).length,
    updatedAt: new Date().toISOString(),
  }
}

export async function saveGame(state: GameState): Promise<void> {
  const database = await openDatabase()

  try {
    const transaction = database.transaction(
      [SAVE_STORE, SUMMARY_STORE],
      'readwrite',
    )

    const saveStore = transaction.objectStore(SAVE_STORE)
    const summaryStore = transaction.objectStore(SUMMARY_STORE)

    const storedSave: StoredSave = {
      slotId: state.slotId,
      state,
    }

    saveStore.put(storedSave)
    summaryStore.put(createSummary(state))

    await transactionComplete(transaction)

    // Remove obsolete localStorage saves from the earlier implementation.
    localStorage.removeItem(`combat-universe-save-v1-${state.slotId}`)
    localStorage.removeItem(`combat-universe-updated-v1-${state.slotId}`)
  } finally {
    database.close()
  }
}

export async function loadGame(
  slotId: number,
): Promise<GameState | null> {
  const database = await openDatabase()

  try {
    const transaction = database.transaction(SAVE_STORE, 'readonly')
    const store = transaction.objectStore(SAVE_STORE)

    const storedSave = await requestResult<StoredSave | undefined>(
      store.get(slotId),
    )

    return storedSave?.state ? upgradeGameState(storedSave.state) : null
  } finally {
    database.close()
  }
}

export async function deleteGame(slotId: number): Promise<void> {
  const database = await openDatabase()

  try {
    const transaction = database.transaction(
      [SAVE_STORE, SUMMARY_STORE],
      'readwrite',
    )

    transaction.objectStore(SAVE_STORE).delete(slotId)
    transaction.objectStore(SUMMARY_STORE).delete(slotId)

    await transactionComplete(transaction)

    localStorage.removeItem(`combat-universe-save-v1-${slotId}`)
    localStorage.removeItem(`combat-universe-updated-v1-${slotId}`)
  } finally {
    database.close()
  }
}

export async function getSaveSummaries(): Promise<SaveSummary[]> {
  const database = await openDatabase()

  try {
    const transaction = database.transaction(SUMMARY_STORE, 'readonly')
    const store = transaction.objectStore(SUMMARY_STORE)

    const summaries = await Promise.all(
      [1, 2, 3].map(async (slotId) => {
        const summary = await requestResult<SaveSummary | undefined>(
          store.get(slotId),
        )

        return summary ?? emptySummary(slotId)
      }),
    )

    return summaries
  } finally {
    database.close()
  }
}