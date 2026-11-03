'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Flashcard } from '@/lib/flashcards';
import { FLASHCARD_PROGRESS_KEY, clearProgress, loadProgress, saveProgress } from '@/lib/progress';

export type CardResult = 'correct' | 'wrong' | 'review';

type DeckProgress = Record<number, CardResult>;

export interface CategoryProgressEntry {
  name: string;
  count: number;
  correct: number;
}

interface UseFlashcardDeckOptions {
  initialCards: Flashcard[];
  initialCategories: string[];
}

/** Uniform Fisher-Yates. A `sort(() => Math.random() - 0.5)` comparator is biased. */
function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** A card passes when it matches the category filter and carries the selected level. */
function matchesFilters(card: Flashcard, category: string, level: string): boolean {
  return (category === 'all' || card.category === category) && (level === 'all' || card.levels.includes(level));
}

/**
 * Owns the flashcard deck: filters, shuffle, cursor, flip state and persisted
 * progress. Rendering stays in the presentational components.
 */
export function useFlashcardDeck({ initialCards, initialCategories }: UseFlashcardDeckOptions) {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [shuffledDeck, setShuffledDeck] = useState<Flashcard[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [progress, setProgress] = useState<DeckProgress>({});

  // localStorage is read after mount so server and client render the same initial HTML.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate: hydration-safe deferred read
    setProgress(loadProgress<DeckProgress>(FLASHCARD_PROGRESS_KEY, {}));
  }, []);

  // Snap back to top on card/side change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentIndex, flipped]);

  const filteredCards = useMemo(
    () => initialCards.filter((card) => matchesFilters(card, filterCategory, filterLevel)),
    [initialCards, filterCategory, filterLevel]
  );

  const isShuffled = shuffledDeck !== null;
  const workingDeck = shuffledDeck ?? filteredCards;
  const deckSize = workingDeck.length;
  const currentCard = deckSize > 0 ? workingDeck[currentIndex % deckSize] : null;

  const applyFilter = useCallback(
    (category: string, level: string) => {
      setShuffledDeck((deck) =>
        deck === null ? null : shuffle(initialCards.filter((card) => matchesFilters(card, category, level)))
      );
      setCurrentIndex(0);
      setFlipped(false);
    },
    [initialCards]
  );

  const selectCategory = useCallback(
    (value: string) => {
      setFilterCategory(value);
      applyFilter(value, filterLevel);
    },
    [applyFilter, filterLevel]
  );

  const selectLevel = useCallback(
    (value: string) => {
      setFilterLevel(value);
      applyFilter(filterCategory, value);
    },
    [applyFilter, filterCategory]
  );

  const toggleShuffle = useCallback(() => {
    setShuffledDeck((deck) => (deck === null ? shuffle(filteredCards) : null));
    setCurrentIndex(0);
    setFlipped(false);
  }, [filteredCards]);

  const nextCard = useCallback(() => {
    if (deckSize === 0) return;
    setCurrentIndex((index) => (index + 1) % deckSize);
    setFlipped(false);
  }, [deckSize]);

  const prevCard = useCallback(() => {
    if (deckSize === 0) return;
    setCurrentIndex((index) => (index - 1 + deckSize) % deckSize);
    setFlipped(false);
  }, [deckSize]);

  const flip = useCallback(() => {
    setFlipped((value) => !value);
  }, []);

  const recordResult = useCallback(
    (result: CardResult) => {
      if (!currentCard) return;
      setProgress((previous) => {
        const next = { ...previous, [currentCard.id]: result };
        saveProgress(FLASHCARD_PROGRESS_KEY, next);
        return next;
      });
      nextCard();
    },
    [currentCard, nextCard]
  );

  const resetProgress = useCallback(() => {
    setProgress({});
    clearProgress(FLASHCARD_PROGRESS_KEY);
  }, []);

  /** Category tiles filter without reshuffling; the filter effect resets the cursor. */
  const selectCategoryTile = useCallback((name: string) => {
    setFilterCategory(name);
    setFilterLevel('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const safeIndex = Math.min(currentIndex, Math.max(deckSize - 1, 0));
  const correctCount = workingDeck.filter((card) => progress[card.id] === 'correct').length;

  const categoryProgress: CategoryProgressEntry[] = initialCategories.map((name) => {
    const cards = initialCards.filter((card) => card.category === name);
    return {
      name,
      count: cards.length,
      correct: cards.filter((card) => progress[card.id] === 'correct').length,
    };
  });

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      if (target.tagName === 'SELECT' || target.tagName === 'INPUT') return;
      if (event.code === 'Space') {
        event.preventDefault();
        setFlipped((value) => !value);
      } else if (event.key === 'ArrowRight') {
        nextCard();
      } else if (event.key === 'ArrowLeft') {
        prevCard();
      } else if (event.key === '1') {
        if (currentCard) recordResult('review');
      } else if (event.key === '2') {
        if (currentCard) recordResult('correct');
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nextCard, prevCard, recordResult, currentCard]);

  // Reset index when filters change
  const previousFilters = useRef([filterCategory, filterLevel]);
  useEffect(() => {
    if (previousFilters.current[0] !== filterCategory || previousFilters.current[1] !== filterLevel) {
      setCurrentIndex(0);
      setFlipped(false);
    }
    previousFilters.current = [filterCategory, filterLevel];
  }, [filterCategory, filterLevel]);

  return {
    filterCategory,
    filterLevel,
    selectCategory,
    selectLevel,
    isShuffled,
    toggleShuffle,
    currentCard,
    flipped,
    flip,
    progress,
    recordResult,
    resetProgress,
    nextCard,
    prevCard,
    deckSize,
    safeIndex,
    correctCount,
    canGoPrevious: safeIndex > 0,
    canGoNext: safeIndex < deckSize - 1,
    categoryProgress,
    selectCategoryTile,
  };
}
