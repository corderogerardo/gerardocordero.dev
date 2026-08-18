export { getAllFlashcards } from '@/lib/flashcards'

export const flashcardsMeta = {
  title: 'Interview Practice',
  subtitle: 'Senior interview prep with Andersen-level filtering (J1–S2)'
}

export const levelLabels: Record<string, string> = {
  easy: 'Fácil',
  medium: 'Intermedio',
  hard: 'Avanzado'
}

export const totalCards = 0 // Will be set at runtime based on deck

export type { Flashcard } from '@/lib/flashcards'