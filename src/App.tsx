import { useEffect, useMemo, useState } from 'react'
import DraftScreen from './components/DraftScreen'
import Game from './components/Game'
import LandingPage from './components/LandingPage'
import { createUniverse } from './engine/universe'
import { deleteGame, getSaveSummaries, loadGame, saveGame } from './storage'
import type { GameState } from './types'

export default function App() {
  const [game, setGame] = useState<GameState | null>(null)
  const [summaryVersion, setSummaryVersion] = useState(0)
  const summaries = useMemo(() => getSaveSummaries(), [summaryVersion])

  useEffect(() => {
    if (!game) return
    saveGame(game)
    setSummaryVersion((version) => version + 1)
  }, [game])

  const createNewGame = (slotId: number, name: string) => {
    setGame(createUniverse(slotId, name))
  }

  const loadSlot = (slotId: number) => {
    const loaded = loadGame(slotId)
    if (loaded) setGame(loaded)
  }

  const deleteSlot = (slotId: number) => {
    deleteGame(slotId)
    setSummaryVersion((version) => version + 1)
  }

  if (!game) {
    return (
      <LandingPage
        summaries={summaries}
        onCreate={createNewGame}
        onLoad={loadSlot}
        onDelete={deleteSlot}
      />
    )
  }

  if (game.phase === 'draft') {
    return <DraftScreen game={game} onChange={setGame} onExit={() => setGame(null)} />
  }

  return <Game game={game} onChange={setGame} onExit={() => setGame(null)} />
}
