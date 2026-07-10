'use client'

import { useState } from 'react'

const POKEMONS = ['PIKACHU', 'CHARMANDER', 'BULBASAUR', 'SQUIRTLE', 'JIGGLYPUFF', 'MEOWTH', 'PSYDUCK', 'SNORLAX', 'GENGAR', 'MAGIKARP']
const MAX_WRONG = 6

interface PokemonGuessProps {
  checkGuess?: (pokemon: string, guessed: string[]) => { display: string; won: boolean; lost: boolean; wrong: number }
}

function defaultCheckGuess(pokemon: string, guessed: string[]) {
  const display = pokemon.split('').map(l => guessed.includes(l) ? l : '_').join(' ')
  const wrong = guessed.filter(l => !pokemon.includes(l)).length
  const won = !display.includes('_')
  const lost = wrong >= MAX_WRONG
  return { display, won, lost, wrong }
}

export default function PokemonGuessPreview({ checkGuess }: PokemonGuessProps) {
  const [pokemon, setPokemon] = useState(() => POKEMONS[Math.floor(Math.random() * POKEMONS.length)])
  const [guessed, setGuessed] = useState<string[]>([])
  const [gameOver, setGameOver] = useState<'win' | 'lose' | null>(null)

  const handleGuess = (letter: string) => {
    if (gameOver || guessed.includes(letter)) return
    const next = [...guessed, letter]
    setGuessed(next)
    const result = (checkGuess ?? defaultCheckGuess)(pokemon, next)
    if (result.won) setGameOver('win')
    else if (result.lost) setGameOver('lose')
  }

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  return (
    <div className="flex flex-col items-center p-6 gap-4">
      <div className="text-2xl font-bold font-mono letter-spacing-wider" style={{ color: gameOver === 'lose' ? '#ef4444' : '#22c55e' }}>
        {gameOver ? pokemon : (checkGuess ? (checkGuess(pokemon, guessed).display) : defaultCheckGuess(pokemon, guessed).display)}
      </div>
      {gameOver && (
        <div className={`text-xl font-bold ${gameOver === 'win' ? 'text-green-600' : 'text-red-600'}`}>
          {gameOver === 'win' ? 'You won!' : `Lost — it was ${pokemon}`}
        </div>
      )}
      <div className="flex flex-wrap gap-1 justify-center max-w-md">
        {letters.map(l => (
          <button
            key={l}
            onClick={() => handleGuess(l)}
            disabled={guessed.includes(l) || !!gameOver}
            className={`w-8 h-8 text-xs font-medium border rounded ${
              guessed.includes(l)
                ? pokemon.includes(l)
                  ? 'bg-green-100 text-green-700 border-green-300'
                  : 'bg-red-100 text-red-700 border-red-300'
                : 'bg-gray-50 hover:bg-gray-100 border-gray-300'
            }`}
          >
            {l}
          </button>
        ))}
      </div>
      {gameOver && (
        <button
          onClick={() => { setPokemon(POKEMONS[Math.floor(Math.random() * POKEMONS.length)]); setGuessed([]); setGameOver(null); }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm"
        >
          Play Again
        </button>
      )}
    </div>
  )
}