'use client'

import { useState } from 'react'

const GRID_SIZE = 8
const BOMB_COUNT = 10

interface MinesweeperProps {
  createBoard?: () => { bomb: boolean; adjacent: number; revealed: boolean }[][]
  revealCell?: (board: { bomb: boolean; adjacent: number; revealed: boolean }[][], r: number, c: number) => { bomb: boolean; adjacent: number; revealed: boolean }[][]
  checkWin?: (board: { bomb: boolean; adjacent: number; revealed: boolean }[][]) => boolean
}

function defaultCreateBoard() {
  const board = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({ bomb: false, adjacent: 0, revealed: false }))
  )
  let placed = 0
  while (placed < BOMB_COUNT) {
    const r = Math.floor(Math.random() * GRID_SIZE)
    const c = Math.floor(Math.random() * GRID_SIZE)
    if (!board[r][c].bomb) {
      board[r][c].bomb = true
      placed++
    }
  }
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (board[r][c].bomb) continue
      let count = 0
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc
          if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && board[nr][nc].bomb) count++
        }
      }
      board[r][c].adjacent = count
    }
  }
  return board
}

function defaultRevealCell(
  board: { bomb: boolean; adjacent: number; revealed: boolean }[][],
  r: number,
  c: number,
) {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })))
  const reveal = (rr: number, cc: number) => {
    if (rr < 0 || rr >= GRID_SIZE || cc < 0 || cc >= GRID_SIZE) return
    if (newBoard[rr][cc].revealed || newBoard[rr][cc].bomb) return
    newBoard[rr][cc].revealed = true
    if (newBoard[rr][cc].adjacent === 0) {
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) reveal(rr + dr, cc + dc)
    }
  }
  reveal(r, c)
  return newBoard
}

function defaultCheckWin(board: { bomb: boolean; adjacent: number; revealed: boolean }[][]) {
  return board.every(row => row.every(cell => cell.revealed || cell.bomb))
}

export default function MinesweeperPreview({ createBoard, revealCell, checkWin }: MinesweeperProps) {
  const [board, setBoard] = useState(() => (createBoard ?? defaultCreateBoard)())
  const [gameOver, setGameOver] = useState<'win' | 'lose' | null>(null)

  const handleClick = (r: number, c: number) => {
    if (gameOver || board[r][c].revealed) return
    if (board[r][c].bomb) {
      setGameOver('lose')
      setBoard(b => b.map(row => row.map(cell => ({ ...cell, revealed: true }))))
      return
    }
    const newBoard = (revealCell ?? defaultRevealCell)(board, r, c)
    setBoard(newBoard)
    if ((checkWin ?? defaultCheckWin)(newBoard)) setGameOver('win')
  }

  return (
    <div className="flex flex-col items-center p-4 gap-3">
      <div className="text-sm font-medium">
        {gameOver === 'win' ? '🎉 You won!' : gameOver === 'lose' ? '💥 Boom! Game over' : `Mines: ${BOMB_COUNT}`}
      </div>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 36px)` }}>
        {board.flatMap((row, r) => row.map((cell, c) => (
          <button
            key={`${r}-${c}`}
            onClick={() => handleClick(r, c)}
            disabled={cell.revealed || !!gameOver}
            className={`w-9 h-9 text-xs font-mono border rounded ${
              cell.revealed
                ? cell.bomb
                  ? 'bg-red-100 text-red-600'
                  : cell.adjacent > 0
                    ? 'bg-gray-100'
                    : 'bg-gray-50'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {cell.revealed ? (cell.bomb ? '💣' : cell.adjacent > 0 ? cell.adjacent : '') : ''}
          </button>
        )))}
      </div>
      <button
        onClick={() => { setBoard((createBoard ?? defaultCreateBoard)()); setGameOver(null); }}
        className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm"
      >
        New Game
      </button>
    </div>
  )
}