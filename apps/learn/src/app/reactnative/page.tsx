import { getAllFlashcards, getCategories, getLevels } from '@/lib/flashcards'
import FlashcardDeck from '@/components/FlashcardDeck'

export const metadata = {
  title: 'Flashcards — React Native Senior Practice',
  description: 'React Native interview prep: 237 flashcards across every Andersen level (J1–S2), plus 150 coding challenges',
}

export default function HomePage() {
  const flashcards = getAllFlashcards()
  const categories = getCategories()
  const levels = getLevels()

  return (
    <main className="min-h-screen bg-background">
      <FlashcardDeck initialCards={flashcards} initialCategories={categories} initialLevels={levels} />
    </main>
  )
}