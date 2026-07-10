import { reactNativeChallenges } from './challenges/react-native'
import { reactChallenges } from './challenges/react'
import { jsEs5Challenges } from './challenges/js-es5'
import { jsEs6Challenges } from './challenges/js-es6'
import { engineeringChallenges } from './challenges/engineering'
import { processChallenges } from './challenges/processes'
import { extraChallenges } from './challenges/extra'
import { algorithmChallenges } from './challenges/algorithms'
import { projectChallenges } from './challenges/projects'
import { seniorPracticeChallenges } from './challenges/senior-practice'

export interface Challenge {
  id: number
  title: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  timeEstimate: string
  prompt: string
  starterCode: string
  solution: string
  /** Mentor walkthrough of the solution: why it's shaped this way, trade-offs, red flags, quotable line */
  explanation?: string
  tests: TestCase[]
  hints: string[]
  /** Preview config for live-interactive challenges */
  preview?: {
    component: string
    extract: string[]
  }
}

export interface TestCase {
  it: string
  /** JS expression to eval (for pure-function challenges) */
  run?: string
  expected?: unknown
  /** Code patterns that must exist in user code (for component challenges) */
  check?: string[]
}

const CHALLENGES: Challenge[] = [
  ...reactNativeChallenges,
  ...reactChallenges,
  ...jsEs5Challenges,
  ...jsEs6Challenges,
  ...engineeringChallenges,
  ...processChallenges,
  ...extraChallenges,
  ...algorithmChallenges,
  ...projectChallenges,
  ...seniorPracticeChallenges,
]

export function getAllChallenges(): Challenge[] {
  return CHALLENGES
}

export function getChallenge(id: number): Challenge | undefined {
  return CHALLENGES.find(c => c.id === id)
}

export function getChallengeCategories(): string[] {
  return [...new Set(CHALLENGES.map(c => c.category))]
}
