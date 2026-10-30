'use client';

import { CircleCheck, RotateCcw, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const levelLabels: Record<string, string> = {
  J1: 'J1',
  J2: 'J2',
  J3: 'J3',
  M1: 'M1',
  M2: 'M2',
  M3: 'M3',
  S1: 'S1',
  S2: 'S2',
};

interface DeckSessionPanelProps {
  totalCards: number;
  categories: string[];
  levels: string[];
  filterCategory: string;
  filterLevel: string;
  isShuffled: boolean;
  deckSize: number;
  position: number;
  correctCount: number;
  onSelectCategory: (value: string) => void;
  onSelectLevel: (value: string) => void;
  onToggleShuffle: () => void;
  onResetProgress: () => void;
}

/** Filter selects, shuffle/reset actions, session counters and the progress bar. */
export function DeckSessionPanel({
  totalCards,
  categories,
  levels,
  filterCategory,
  filterLevel,
  isShuffled,
  deckSize,
  position,
  correctCount,
  onSelectCategory,
  onSelectLevel,
  onToggleShuffle,
  onResetProgress,
}: DeckSessionPanelProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-xs sm:p-6 lg:p-8">
      <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-center">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <Select value={filterCategory} onValueChange={onSelectCategory}>
            <SelectTrigger className="w-full sm:w-[240px]">
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas ({totalCards})</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterLevel} onValueChange={onSelectLevel}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Todos los niveles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los niveles</SelectItem>
              {levels.map((level) => (
                <SelectItem key={level} value={level}>{levelLabels[level] || level}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant={isShuffled ? 'ghost' : 'outline'}
            size="sm"
            onClick={onToggleShuffle}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors"
          >
            <Shuffle className="h-4 w-4" />
            {isShuffled ? 'Reorganizar' : 'Barajar'}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3 lg:ml-auto">
          <span className="text-sm font-medium tabular-nums text-muted-foreground">
            {deckSize ? position + 1 : 0} / {deckSize}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
            <CircleCheck className="h-4 w-4" />
            {correctCount} correctas
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onResetProgress}
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
            width: `${deckSize ? ((position + 1) / deckSize) * 100 : 0}%`,
          }}
        />
      </div>
    </div>
  );
}
