'use client'

import { useState } from 'react'

const TARGET = 'REACT'

interface WordleProps {
  checkGuess?: (guess: string) => { letter: string; color: string }[]
}

function defaultCheckGuess(guess: string) {
  const result = guess.split('').map(letter => ({ letter, color: '#9E9E9E' }))
  // Count-aware: consume exact matches first, then spend remaining counts on
  // present-but-misplaced letters, so RRRRR vs REACT marks only the real R.
  const remaining: Record<string, number> = {}
  for (const c of TARGET) remaining[c] = (remaining[c] || 0) + 1
  result.forEach((r, i) => {
    if (TARGET[i] === r.letter) { r.color = '#4CAF50'; remaining[r.letter]-- }
  })
  result.forEach(r => {
    if (r.color === '#9E9E9E' && remaining[r.letter] > 0) { r.color = '#FFC107'; remaining[r.letter]-- }
  })
  return result
}

export default function WordlePreview({ checkGuess }: WordleProps) {
  const [guesses, setGuesses] = useState<string[][]>([])
  const [current, setCurrent] = useState('')
  const [gameOver, setGameOver] = useState<string | null>(null)

  const submit = () => {
    if (current.length !== 5 || gameOver) return
    const newGuesses = [...guesses, current.toUpperCase().split('')]
    setGuesses(newGuesses)
    if (current.toUpperCase() === TARGET) setGameOver('won')
    else if (newGuesses.length >= 6) setGameOver('lost')
    setCurrent('')
  }

  return (
    <div className="flex flex-col items-center p-4 gap-3">
      {guesses.map((guess, i) => {
        const result = (checkGuess ?? defaultCheckGuess)(guess.join(''))
        return (
          <div key={i} className="flex gap-1">
            {result.map((r, j) => (
              <div
                key={j}
                className="w-9 h-9 flex items-center justify-center text-white text-sm font-bold rounded"
                style={{ backgroundColor: r.color }}
              >
                {r.letter}
              </div>
            ))}
          </div>
        )
      })}
      {!gameOver ? (
        <div className="flex gap-2">
          <input
            value={current}
            onChange={e => setCurrent(e.target.value.toUpperCase().slice(0, 5))}
            className="w-32 px-2 py-1 border rounded text-center text-sm font-mono uppercase"
            placeholder="GUESS"
            maxLength={5}
          />
          <button onClick={submit} className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm">
            Guess
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className="text-lg font-bold mb-2">
            {gameOver === 'won' ? 'You won!' : `Lost — ${TARGET}`}
          </div>
          <button
            onClick={() => { setGuesses([]); setCurrent(''); setGameOver(null) }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  )
}
