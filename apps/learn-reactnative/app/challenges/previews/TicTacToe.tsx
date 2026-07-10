'use client'

import { useState } from 'react'

const WINNERS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]

interface TicTacToeProps {
  checkWinner?: (board: (string | null)[]) => string | null
}

function defaultCheckWinner(board: (string | null)[]): string | null {
  for (const [a, b, c] of WINNERS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a]
  }
  return null
}

export default function TicTacToePreview({ checkWinner }: TicTacToeProps) {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null))
  const [xIsNext, setXIsNext] = useState(true)

  const winner = (checkWinner ?? defaultCheckWinner)(board)
  const tie = !winner && board.every(Boolean)

  const handlePress = (i: number) => {
    if (board[i] || winner) return
    const next = [...board]
    next[i] = xIsNext ? 'X' : 'O'
    setBoard(next)
    setXIsNext(!xIsNext)
  }

  return (
    <div className="flex flex-col items-center p-6 gap-4">
      <div className="text-sm font-medium">
        {winner ? `${winner} wins!` : tie ? 'Tie!' : `Turn: ${xIsNext ? 'X' : 'O'}`}
      </div>
      <div className="grid grid-cols-3 gap-1 w-[156px]">
        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => handlePress(i)}
            className="w-[50px] h-[50px] border text-xl font-bold flex items-center justify-center hover:bg-accent transition-colors"
            disabled={!!cell || !!winner}
          >
            {cell}
          </button>
        ))}
      </div>
      <button
        onClick={() => { setBoard(Array(9).fill(null)); setXIsNext(true) }}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
      >
        Restart
      </button>
    </div>
  )
}
