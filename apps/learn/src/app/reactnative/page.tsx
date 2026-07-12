import { getAllFlashcards, getCategories } from '@/lib/flashcards'
import FlashcardDeck from '@/components/FlashcardDeck'

export const metadata = {
  title: 'Flashcards — React Native Senior Practice',
  description: 'Senior React Native interview prep: 91 flashcards across six skill categories',
}

export default function HomePage() {
  const flashcards = getAllFlashcards()
  const categories = getCategories()
  
  return (
    <main className="min-h-screen bg-background">
      <FlashcardDeck initialCards={flashcards} initialCategories={categories} />
    </main>
  )
}