'use client'

import { useState } from 'react'

const COLORS = ['RED', 'BLUE', 'GREEN', 'YELLOW']
const COLOR_MAP: Record<string, string> = {
  RED: '#ef4444',
  BLUE: '#3b82f6',
  GREEN: '#22c55e',
  YELLOW: '#eab308',
}

interface StroopGameProps {
  /** User-implemented: returns { word, displayColor } for a given round */
  getRound?: (round: number) => { word: string; displayColor: string }
  /** User-implemented: processes a choice, returns { score, round, gameOver } */
  handleChoice?: (chosen: string, state: { score: number; round: number }) => { score: number; round: number; gameOver: boolean }
}

export default function StroopGame({ getRound, handleChoice }: StroopGameProps) {
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  const { word, displayColor } = getRound
    ? getRound(round)
    : {
        word: COLORS[round % COLORS.length],
        displayColor: COLORS[(round + 1) % COLORS.length],
      }

  const pick = (chosen: string) => {
    if (gameOver) return
    if (handleChoice) {
      const result = handleChoice(chosen, { score, round })
      setScore(result.score)
      setRound(result.round)
      setGameOver(result.gameOver)
    } else {
      if (chosen === word) setScore(s => s + 1)
      if (round >= 19) setGameOver(true)
      else setRound(r => r + 1)
    }
  }

  if (gameOver) {
    return (
      <div className="flex flex-col items-center gap-4 p-8">
        <div className="text-2xl font-bold">Final Score: {score}/20</div>
        <button
          onClick={() => { setScore(0); setRound(0); setGameOver(false) }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
        >
          Play Again
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <div className="text-5xl font-bold" style={{ color: COLOR_MAP[displayColor] ?? '#000' }}>
        {word}
      </div>
      <div className="text-xs text-muted-foreground">
        Round {round + 1}/20 · Score {score}
      </div>
      <div className="flex flex-wrap gap-3 justify-center">
        {COLORS.map(c => (
          <button
            key={c}
            onClick={() => pick(c)}
            className="px-6 py-3 border rounded-lg font-medium text-sm hover:bg-accent transition-colors min-w-[100px]"
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  )
}
