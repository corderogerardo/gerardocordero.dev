'use client'

import { useState, useEffect } from 'react'

interface GameState {
  phase: 'idle' | 'wait' | 'active' | 'result'
  score: number
  delay: number
  targetShown?: number
  reactionTime?: number
}

interface ReactionGameProps {
  startGame?: () => GameState
  handleTap?: (state: GameState, now: number) => Partial<GameState>
}

function defaultStartGame(): GameState {
  return { phase: 'wait', score: 0, delay: 1000 + Math.random() * 4000 }
}

function defaultHandleTap(state: GameState, now: number): Partial<GameState> {
  if (state.phase !== 'active') return state
  return {
    phase: 'wait',
    score: state.score + 1,
    reactionTime: now - (state.targetShown ?? now),
    delay: 1000 + Math.random() * 4000,
  }
}

const GAME_DURATION = 10000

export default function ReactionGamePreview({ startGame, handleTap }: ReactionGameProps) {
  const [state, setState] = useState<GameState>(() => startGame ? startGame() : defaultStartGame())
  const [gameOver, setGameOver] = useState(false)
  const [lastReaction, setLastReaction] = useState<number | null>(null)

  useEffect(() => {
    if (state.phase !== 'wait') return
    const timer = setTimeout(() => {
      setState(s => ({ ...s, phase: 'active', targetShown: Date.now() }))
    }, state.delay)
    return () => clearTimeout(timer)
  }, [state.phase, state.delay])

  useEffect(() => {
    if (state.phase === 'active') {
      const timer = setTimeout(() => setGameOver(true), GAME_DURATION)
      return () => clearTimeout(timer)
    }
  }, [state.phase])

  const handleClick = () => {
    if (gameOver) return
    const now = Date.now()
    const next = (handleTap ?? defaultHandleTap)(state, now)
    setState(s => ({ ...s, ...next, targetShown: next.phase === 'active' ? Date.now() : undefined }))
    if (next.reactionTime !== undefined) setLastReaction(next.reactionTime)
  }

  const restart = () => {
    setState(startGame ? startGame() : defaultStartGame())
    setGameOver(false)
    setLastReaction(null)
  }

  return (
    <div className="flex flex-col items-center p-6 gap-4">
      <div className="text-sm text-muted-foreground">Game lasts 10 seconds</div>
      <div className="text-3xl font-bold">Score: {state.score}</div>
      {lastReaction !== null && <div className="text-sm text-green-600">Last: {lastReaction}ms</div>}
      {state.phase === 'wait' && <div className="text-xl text-muted-foreground">Wait...</div>}
      {state.phase === 'active' && (
        <button
          onClick={handleClick}
          className="w-24 h-24 rounded-full bg-red-500 text-white text-xl font-bold flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        >
          TAP!
        </button>
      )}
      {gameOver && (
        <div className="flex flex-col items-center gap-2">
          <div className="text-2xl font-bold">Final Score: {state.score}</div>
          <button onClick={restart} className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm">
            Play Again
          </button>
        </div>
      )}
    </div>
  )
}