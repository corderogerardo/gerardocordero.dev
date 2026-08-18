'use client';

import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  RotateCcw,
  Shuffle,
  Sparkles,
  CircleCheck,
} from 'lucide-react';
import { Flashcard } from '@/lib/flashcards';
import { FLASHCARD_PROGRESS_KEY, loadProgress, saveProgress, clearProgress } from '@/lib/progress';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PracticeFlashcard } from '@/components/practice/PracticeFlashcard';

interface FlashcardDeckProps {
  initialCards: Flashcard[];
  initialCategories: string[];
  initialLevels: string[];
  title?: string;
}

type CardResult = 'correct' | 'wrong' | 'review';

/** Uniform Fisher-Yates. A `sort(() => Math.random() - 0.5)` comparator is biased. */
function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const levelLabels: Record<string, string> = {
  J1: 'J1',
  J2: 'J2',
  J3: 'J3',
  M1: 'M1',
  M2: 'M2',
  M3: 'M3',
  S1: 'S1',
  S2: 'S2',
  easy: 'Fácil',
  medium: 'Intermedio',
  hard: 'Avanzado',
};

export default function FlashcardDeck({
  initialCards,
  initialCategories,
  initialLevels,
  title = 'Interview Practice',
}: FlashcardDeckProps) {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [shuffledDeck, setShuffledDeck] = useState<Flashcard[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [progress, setProgress] = useState<Record<number, CardResult>>({});

const progressRef = useRef<Record<number, CardResult>>({});

// localStorage is read after mount so server and client render the same initial HTML.
useEffect(() => {
  progressRef.current = loadProgress<Record<number, CardResult>>(FLASHCARD_PROGRESS_KEY, {});
}, []);

// Sync progress state from ref
useEffect(() => {
  setProgress(progressRef.current);
}, []);

  // Snap back to top on card/side change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentIndex, flipped]);

  const matches = useCallback(
    (c: Flashcard, cat: string, lvl: string) =>
      (cat === 'all' || c.category === cat) && (lvl === 'all' || c.levels.includes(lvl)),
    []
  );

  const filteredCards = useMemo(
    () => initialCards.filter((c) => matches(c, filterCategory, filterLevel)),
    [initialCards, filterCategory, filterLevel, matches]
  );

  const isShuffled = shuffledDeck !== null;
  const workingDeck = shuffledDeck ?? filteredCards;

  const applyFilter = useCallback((cat: string, lvl: string) => {
    setShuffledDeck((d) => (d === null ? null : shuffle(initialCards.filter((c) => matches(c, cat, lvl)))));
    setCurrentIndex(0);
    setFlipped(false);
  }, [initialCards, matches]);

  const selectCategory = useCallback((value: string) => {
    setFilterCategory(value);
    applyFilter(value, filterLevel);
  }, [applyFilter, filterLevel]);

  const selectLevel = useCallback((value: string) => {
    setFilterLevel(value);
    applyFilter(filterCategory, value);
  }, [applyFilter, filterCategory]);

  const toggleShuffle = useCallback(() => {
    setShuffledDeck((d) => (d === null ? shuffle(filteredCards) : null));
    setCurrentIndex(0);
    setFlipped(false);
  }, [filteredCards]);

  const currentCard = workingDeck.length > 0 ? workingDeck[currentIndex % workingDeck.length] : null;

  const nextCard = useCallback(() => {
    if (workingDeck.length === 0) return;
    setCurrentIndex((i) => (i + 1) % workingDeck.length);
    setFlipped(false);
  }, [workingDeck.length]);

  const prevCard = useCallback(() => {
    if (workingDeck.length === 0) return;
    setCurrentIndex((i) => (i - 1 + workingDeck.length) % workingDeck.length);
    setFlipped(false);
  }, [workingDeck.length]);

  const recordResult = useCallback((result: CardResult) => {
    if (!currentCard) return;
    setProgress((p) => {
      const next = { ...p, [currentCard.id]: result };
      saveProgress(FLASHCARD_PROGRESS_KEY, next);
      return next;
    });
    nextCard();
  }, [currentCard, nextCard]);

  const resetProgress = useCallback(() => {
    setProgress({});
    clearProgress(FLASHCARD_PROGRESS_KEY);
  }, []);

  const flip = useCallback(() => {
    setFlipped((f) => !f);
  }, []);

  const categoryProgress = initialCategories.map((name) => {
    const cards = initialCards.filter((card) => card.category === name);
    return {
      name,
      count: cards.length,
      correct: cards.filter((card) => progress[card.id] === 'correct').length,
    };
  });

  const safeIndex = Math.min(currentIndex, Math.max(workingDeck.length - 1, 0));
  const correctCount = workingDeck.filter((c) => progress[c.id] === 'correct').length;

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === 'SELECT' || target.tagName === 'INPUT') return;
      if (e.code === 'Space') {
        e.preventDefault()
        setFlipped((f) => !f);
      } else if (e.key === 'ArrowRight') {
        nextCard();
      } else if (e.key === 'ArrowLeft') {
        prevCard();
      } else if (e.key === '1') {
        if (currentCard) recordResult('review');
      } else if (e.key === '2') {
        if (currentCard) recordResult('correct');
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nextCard, prevCard, recordResult, currentCard]);

  // Reset index when filters change
  const prevFilters = useRef([filterCategory, filterLevel]);
  useEffect(() => {
    if (
      prevFilters.current[0] !== filterCategory ||
      prevFilters.current[1] !== filterLevel
    ) {
      setCurrentIndex(0);
      setFlipped(false);
    }
    prevFilters.current = [filterCategory, filterLevel];
  }, [filterCategory, filterLevel]);

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
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6 lg:p-8">
        <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-center">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <Select value={filterCategory} onValueChange={selectCategory}>
              <SelectTrigger className="w-full sm:w-[240px]">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas ({initialCards.length})</SelectItem>
                {initialCategories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterLevel} onValueChange={selectLevel}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Todos los niveles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los niveles</SelectItem>
                {initialLevels.map((l) => (
                  <SelectItem key={l} value={l}>{levelLabels[l] || l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={isShuffled ? 'ghost' : 'outline'}
              size="sm"
              onClick={toggleShuffle}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors"
            >
              <Shuffle className="h-4 w-4" />
              {isShuffled ? 'Reorganizar' : 'Barajar'}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3 lg:ml-auto">
            <span className="text-sm font-medium tabular-nums text-muted-foreground">
              {workingDeck.length ? safeIndex + 1 : 0} / {workingDeck.length}
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
              <CircleCheck className="h-4 w-4" />
              {correctCount} correctas
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={resetProgress}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reiniciar
            </Button>
          </div>
        </div>

        <div className="mt-6 h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{
              width: `${workingDeck.length ? ((safeIndex + 1) / workingDeck.length) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Flashcard */}
      {currentCard ? (
        <div className="relative mt-16">
          <PracticeFlashcard
            card={currentCard}
            flipped={flipped}
            status={progress[currentCard.id]}
            onFlip={flip}
          />

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => recordResult('review')}
                className="gap-2 px-3 py-2 text-sm font-medium"
              >
                <RotateCcw className="h-4 w-4" />
                Repasar luego
              </Button>
              <Button
                onClick={() => recordResult('correct')}
                className="gap-2 px-4 py-3 text-sm font-medium bg-success hover:bg-success/90 text-success-foreground"
              >
                <Check className="h-4 w-4" />
                La sé
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevCard}
                disabled={safeIndex === 0}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Anterior
              </Button>
              <span className="text-xs text-muted-foreground">
                Usa <kbd className="font-mono">←</kbd>{' '}
                <kbd className="font-mono">→</kbd> para navegar
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={nextCard}
                disabled={safeIndex >= workingDeck.length - 1}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors"
              >
                Siguiente
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative mt-16 rounded-3xl border border-dashed border-border bg-card/50 p-12 md:p-16 text-center">
          <p className="text-muted-foreground">
            No hay tarjetas para este filtro. Prueba con otra categoría o nivel.
          </p>
        </div>
      )}

      {/* Progress by category */}
      <h2 className="mt-16 font-display text-lg font-semibold tracking-tight mb-6">Progreso por categoría</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryProgress.map(({ name, count, correct: catCorrect }) => (
          <button
            key={name}
            onClick={() => {
              setFilterCategory(name);
              setFilterLevel('all');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="rounded-3xl border border-border bg-card/50 p-4 sm:p-5 lg:p-6 text-left transition-colors hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium font-display">{name}</span>
              <span className="text-sm tabular-nums text-muted-foreground">
                {catCorrect}/{count}
              </span>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${count ? (catCorrect / count) * 100 : 0}%` }}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
