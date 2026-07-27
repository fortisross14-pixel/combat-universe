import { useEffect, useRef, useState } from 'react'
import DraftScreen from './components/DraftScreen'
import Game from './components/Game'
import LandingPage from './components/LandingPage'
import { createUniverse } from './engine/universe'
import {
  deleteGame,
  getSaveSummaries,
  loadGame,
  saveGame,
} from './storage'
import type { GameState, SaveSummary } from './types'

const EMPTY_SUMMARIES: SaveSummary[] = [1, 2, 3].map((slotId) => ({
  slotId,
  exists: false,
}))

export default function App() {
  const [game, setGame] = useState<GameState | null>(null)
  const [summaries, setSummaries] =
    useState<SaveSummary[]>(EMPTY_SUMMARIES)

  const [isLoading, setIsLoading] = useState(true)
  const [saveError, setSaveError] = useState<string | null>(null)

  const saveTimerRef = useRef<number | null>(null)
  const hasLoadedRef = useRef(false)

  const refreshSummaries = async () => {
    try {
      const nextSummaries = await getSaveSummaries()
      setSummaries(nextSummaries)
    } catch (error) {
      console.error('Could not read save summaries:', error)
      setSaveError(
        error instanceof Error
          ? error.message
          : 'Could not read the save slots.',
      )
    }
  }

  useEffect(() => {
    let cancelled = false

    const initialize = async () => {
      try {
        const nextSummaries = await getSaveSummaries()

        if (!cancelled) {
          setSummaries(nextSummaries)
        }
      } catch (error) {
        console.error('Could not initialize save storage:', error)

        if (!cancelled) {
          setSaveError(
            error instanceof Error
              ? error.message
              : 'Could not initialize save storage.',
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
          hasLoadedRef.current = true
        }
      }
    }

    void initialize()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!game || !hasLoadedRef.current) return

    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current)
    }

    saveTimerRef.current = window.setTimeout(() => {
      const saveCurrentGame = async () => {
        try {
          await saveGame(game)
          setSaveError(null)
          await refreshSummaries()
        } catch (error) {
          console.error('Could not save Combat Universe:', error)

          setSaveError(
            error instanceof Error
              ? error.message
              : 'The universe could not be saved.',
          )
        }
      }

      void saveCurrentGame()
    }, 300)

    return () => {
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current)
      }
    }
  }, [game])

  const createNewGame = (slotId: number, name: string) => {
    setSaveError(null)
    setGame(createUniverse(slotId, name))
  }

  const loadSlot = async (slotId: number) => {
    setIsLoading(true)
    setSaveError(null)

    try {
      const loaded = await loadGame(slotId)

      if (loaded) {
        setGame(loaded)
      }
    } catch (error) {
      console.error('Could not load save:', error)

      setSaveError(
        error instanceof Error
          ? error.message
          : 'The selected universe could not be loaded.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const deleteSlot = async (slotId: number) => {
    setSaveError(null)

    try {
      await deleteGame(slotId)
      await refreshSummaries()
    } catch (error) {
      console.error('Could not delete save:', error)

      setSaveError(
        error instanceof Error
          ? error.message
          : 'The selected universe could not be deleted.',
      )
    }
  }

  if (isLoading) {
    return (
      <main className="loading-screen">
        <div className="loading-mark">CU</div>
        <p>Loading Combat Universe…</p>
      </main>
    )
  }

  if (!game) {
    return (
      <>
        {saveError && (
          <div className="global-error" role="alert">
            {saveError}
          </div>
        )}

        <LandingPage
          summaries={summaries}
          onCreate={createNewGame}
          onLoad={(slotId) => {
            void loadSlot(slotId)
          }}
          onDelete={(slotId) => {
            void deleteSlot(slotId)
          }}
        />
      </>
    )
  }

  if (game.phase === 'draft') {
    return (
      <>
        {saveError && (
          <div className="global-error" role="alert">
            Save error: {saveError}
          </div>
        )}

        <DraftScreen
          game={game}
          onChange={setGame}
          onExit={() => setGame(null)}
        />
      </>
    )
  }

  return (
    <>
      {saveError && (
        <div className="global-error" role="alert">
          Save error: {saveError}
        </div>
      )}

      <Game
        game={game}
        onChange={setGame}
        onExit={() => setGame(null)}
      />
    </>
  )
}