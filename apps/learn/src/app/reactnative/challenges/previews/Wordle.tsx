'use client'

import { useState } from 'react'

const TARGET = 'REACT'

interface WordleProps {
  checkGuess?: (guess: string) => { letter: string; color: string }[]
}

function defaultCheckGuess(guess: string) {
  return guess.split('').map((letter, i) => {
    if (TARGET[i] === letter) return { letter, color: '#4CAF50' }
    if (TARGET.includes(letter)) return { letter, color: '#FFC107' }
    return { letter, color: '#9E9E9E' }
  })
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
