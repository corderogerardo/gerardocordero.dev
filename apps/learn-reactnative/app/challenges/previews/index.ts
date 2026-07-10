import StroopGame from './StroopGame'
import TicTacToe from './TicTacToe'
import Wordle from './Wordle'
import Minesweeper from './Minesweeper'
import PokemonGuess from './PokemonGuess'
import ReactionGame from './ReactionGame'

// Each preview declares its own optional props, filled at runtime by usePreviewBridge from
// whatever the learner's code exports. The bindings can't be typed statically, so this map
// is the boundary where the dynamic shape is admitted.
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- props come from user-compiled code
export const previewComponents: Record<string, React.ComponentType<any>> = {
  'stroop-game': StroopGame,
  'tic-tac-toe': TicTacToe,
  'wordle': Wordle,
  'minesweeper': Minesweeper,
  'pokemon-guess': PokemonGuess,
  'reaction-game': ReactionGame,
}