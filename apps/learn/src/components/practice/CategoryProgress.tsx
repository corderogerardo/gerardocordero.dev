'use client';

import type { CategoryProgressEntry } from '@/components/practice/useFlashcardDeck';

interface CategoryProgressProps {
  items: CategoryProgressEntry[];
  onSelectCategory: (name: string) => void;
}

/** Per-category correctness grid; each tile filters the deck to its category. */
export function CategoryProgress({ items, onSelectCategory }: CategoryProgressProps) {
  return (
    <>
      <h2 className="mt-16 font-display text-lg font-semibold tracking-tight mb-6">Progreso por categoría</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(({ name, count, correct }) => (
          <button
            key={name}
            onClick={() => onSelectCategory(name)}
            className="rounded-3xl border border-border bg-card/50 p-4 sm:p-5 lg:p-6 text-left transition-colors hover:border-primary/30 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium font-display">{name}</span>
              <span className="text-sm tabular-nums text-muted-foreground">
                {correct}/{count}
              </span>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${count ? (correct / count) * 100 : 0}%` }}
              />
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
