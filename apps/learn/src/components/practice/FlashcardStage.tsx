'use client';

import { ArrowLeft, ArrowRight, Check, RotateCcw } from 'lucide-react';
import type { Flashcard } from '@/lib/flashcards';
import { Button } from '@/components/ui/button';
import { PracticeFlashcard } from '@/components/practice/PracticeFlashcard';
import type { CardResult } from '@/components/practice/useFlashcardDeck';

interface FlashcardStageProps {
  card: Flashcard;
  flipped: boolean;
  status?: CardResult;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onFlip: () => void;
  onRecordResult: (result: CardResult) => void;
  onPrevious: () => void;
  onNext: () => void;
}

/** The current card, its grading actions and the previous/next navigation. */
export function FlashcardStage({
  card,
  flipped,
  status,
  canGoPrevious,
  canGoNext,
  onFlip,
  onRecordResult,
  onPrevious,
  onNext,
}: FlashcardStageProps) {
  return (
    <div className="relative mt-16">
      <PracticeFlashcard card={card} flipped={flipped} status={status} onFlip={onFlip} />

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => onRecordResult('review')}
            className="gap-2 px-3 py-2 text-sm font-medium"
          >
            <RotateCcw className="h-4 w-4" />
            Repasar luego
          </Button>
          <Button
            onClick={() => onRecordResult('correct')}
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
            onClick={onPrevious}
            disabled={!canGoPrevious}
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
            onClick={onNext}
            disabled={!canGoNext}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors"
          >
            Siguiente
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
