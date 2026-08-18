'use client';

import { RotateCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Flashcard } from '@/lib/flashcards';
import { cn } from '@/lib/utils';

export type FlashcardStatus = 'correct' | 'wrong' | 'review';

interface PracticeFlashcardProps {
  card: Flashcard;
  flipped: boolean;
  status?: FlashcardStatus;
  onFlip: () => void;
}

const levelLabels: Record<string, string> = {
  J1: 'J1', J2: 'J2', J3: 'J3', M1: 'M1', M2: 'M2', M3: 'M3',
  S1: 'S1', S2: 'S2', easy: 'Fácil', medium: 'Intermedio', hard: 'Avanzado',
};

const levelStyles: Record<string, string> = {
  J1: 'bg-success/15 text-success', J2: 'bg-success/15 text-success', J3: 'bg-success/15 text-success',
  M1: 'bg-chart-4/15 text-chart-4', M2: 'bg-chart-4/15 text-chart-4', M3: 'bg-chart-4/15 text-chart-4',
  S1: 'bg-destructive/15 text-destructive', S2: 'bg-destructive/15 text-destructive',
  easy: 'bg-success/15 text-success', medium: 'bg-chart-4/15 text-chart-4', hard: 'bg-destructive/15 text-destructive',
};

export function PracticeFlashcard({ card, flipped, status, onFlip }: PracticeFlashcardProps) {
  const level = card.levels[0];

  return (
    <div className="perspective-1000">
      <button
        type="button"
        onClick={onFlip}
        aria-label={flipped ? 'Show question' : 'Show answer'}
        aria-pressed={flipped}
        className="group relative block h-[min(560px,calc(100svh-220px))] min-h-[420px] w-full appearance-none border-0 bg-transparent p-0 text-left text-inherit shadow-none outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-4"
      >
        <div className={cn('transform-3d relative h-full w-full transition-transform duration-500', flipped && 'rotate-y-180')}>
          <div className="backface-hidden absolute inset-0 flex flex-col rounded-3xl border border-border bg-card p-6 shadow-xl md:p-10">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">{card.category}</span>
              <span className={cn('rounded-full px-3 py-1 text-xs font-medium capitalize', levelStyles[level] || 'bg-muted text-muted-foreground')}>
                {levelLabels[level] || level}
              </span>
              {status && (
                <span className={cn('ml-auto rounded-full px-3 py-1 text-xs font-medium', status === 'correct' ? 'bg-success/15 text-success' : 'bg-chart-4/15 text-chart-4')}>
                  {status === 'correct' ? 'Correcta' : 'Por repasar'}
                </span>
              )}
            </div>
            <div className="flex flex-1 items-center justify-center py-8">
              <p className="max-w-3xl text-balance text-center text-xl font-medium leading-relaxed sm:text-2xl md:text-3xl">{card.question}</p>
            </div>
            <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <RotateCw className="h-4 w-4" />
              Toca o presiona <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">Espacio</kbd> para revelar
            </p>
          </div>

          <div className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col overflow-y-auto rounded-3xl border border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 p-6 text-left shadow-xl md:p-10">
            <div className="flex items-center gap-3 border-b border-primary/15 pb-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">A</span>
              <div>
                <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-primary">Respuesta</span>
                <span className="block text-xs text-muted-foreground">Explicación del mentor</span>
              </div>
            </div>
            <article className="markdown-readable prose prose-lg mt-6 max-w-4xl text-foreground prose-headings:tracking-tight prose-headings:text-2xl sm:prose-headings:text-3xl prose-p:text-lg sm:prose-p:text-xl prose-p:leading-8 prose-li:text-lg sm:prose-li:text-xl prose-li:leading-8 prose-code:before:content-none prose-code:after:content-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{card.answer}</ReactMarkdown>
            </article>
            {card.heading && <p className="mt-5 border-l-2 border-primary/40 pl-3 text-base font-medium text-muted-foreground">{card.heading}</p>}
          </div>
        </div>
      </button>
    </div>
  );
}
