import { getAllFlashcards, getCategories, getLevels } from '@/lib/flashcards';
import FlashcardDeck from '@/components/practice/FlashcardDeck';

export const metadata = {
  title: 'Flashcards — React Native Senior Practice',
  description: 'React Native interview prep: 237 flashcards across every Andersen level (J1–S2), plus 150 coding challenges',
}

export default function ReactNativePracticePage() {
  const flashcards = getAllFlashcards();
  const categories = getCategories(flashcards)
  const levels = getLevels(flashcards)

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <FlashcardDeck
          initialCards={flashcards}
          initialCategories={categories}
          initialLevels={levels}
          title="React Native — Senior Interview Practice"
        />
    </main>
  );
}
