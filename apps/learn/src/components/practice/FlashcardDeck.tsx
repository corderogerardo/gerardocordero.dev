'use client';

import { Sparkles } from 'lucide-react';
import type { Flashcard } from '@/lib/flashcards';
import { CategoryProgress } from '@/components/practice/CategoryProgress';
import { DeckSessionPanel } from '@/components/practice/DeckSessionPanel';
import { FlashcardStage } from '@/components/practice/FlashcardStage';
import { useFlashcardDeck } from '@/components/practice/useFlashcardDeck';

interface FlashcardDeckProps {
  initialCards: Flashcard[];
  initialCategories: string[];
  initialLevels: string[];
  title?: string;
}

export default function FlashcardDeck({
  initialCards,
  initialCategories,
  initialLevels,
  title = 'Interview Practice',
}: FlashcardDeckProps) {
  const deck = useFlashcardDeck({ initialCards, initialCategories });

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20 lg:px-12 xl:px-16">
      {/* Header */}
      <div className="flex flex-col items-start gap-3 mb-10">
        <Sparkles className="h-5 w-5 text-primary" />
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
          {title}
        </h1>
      </div>

      <p className="text-lg text-muted-foreground leading-relaxed mb-8">
        Senior interview prep: active recall, spaced repetition, and Andersen-level filtering (J1–S2).
      </p>

      {/* Session Panel */}
      <DeckSessionPanel
        totalCards={initialCards.length}
        categories={initialCategories}
        levels={initialLevels}
        filterCategory={deck.filterCategory}
        filterLevel={deck.filterLevel}
        isShuffled={deck.isShuffled}
        deckSize={deck.deckSize}
        position={deck.safeIndex}
        correctCount={deck.correctCount}
        onSelectCategory={deck.selectCategory}
        onSelectLevel={deck.selectLevel}
        onToggleShuffle={deck.toggleShuffle}
        onResetProgress={deck.resetProgress}
      />

      {/* Flashcard */}
      {deck.currentCard ? (
        <FlashcardStage
          card={deck.currentCard}
          flipped={deck.flipped}
          status={deck.progress[deck.currentCard.id]}
          canGoPrevious={deck.canGoPrevious}
          canGoNext={deck.canGoNext}
          onFlip={deck.flip}
          onRecordResult={deck.recordResult}
          onPrevious={deck.prevCard}
          onNext={deck.nextCard}
        />
      ) : (
        <div className="relative mt-16 rounded-3xl border border-dashed border-border bg-card/50 p-12 md:p-16 text-center">
          <p className="text-muted-foreground">
            No hay tarjetas para este filtro. Prueba con otra categoría o nivel.
          </p>
        </div>
      )}

      {/* Progress by category */}
      <CategoryProgress items={deck.categoryProgress} onSelectCategory={deck.selectCategoryTile} />
    </div>
  );
}
