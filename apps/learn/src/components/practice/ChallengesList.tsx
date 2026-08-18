import Link from 'next/link';
import { ArrowRight, Clock, Code2, Signal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Challenge {
  id: number;
  title: string;
  summary: string;
  difficulty: 'Fácil' | 'Intermedio' | 'Avanzado';
  estimatedMinutes: number;
  tags: string[];
}

interface ChallengesListProps {
  challenges: Challenge[];
  specSlug: string;
}

const difficultyStyles: Record<'Fácil' | 'Intermedio' | 'Avanzado', string> = {
  Fácil: 'bg-success/15 text-success',
  Intermedio: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  Avanzado: 'bg-destructive/15 text-destructive',
};

export function ChallengesList({ challenges, specSlug }: ChallengesListProps) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex items-center gap-2 text-sm font-medium text-primary">
        <Code2 className="h-4 w-4" />
        Challenges
      </div>
      <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
        Coding Challenges
      </h1>
      <p className="mt-2 max-w-xl text-pretty leading-relaxed text-muted-foreground">
        Ejercicios de código prácticos. Lee el enunciado, intenta resolverlo y desbloquea pistas una a una cuando te atores.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {challenges.map((c) => (
          <Link
            key={c.id}
            href={`/practice/${specSlug}/challenges/${c.id}`}
            className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-sm font-semibold tabular-nums text-secondary-foreground">
                {c.id}
              </span>
              <span
                className={cn(
                  'rounded-full px-2.5 py-1 text-xs font-medium',
                  difficultyStyles[c.difficulty],
                )}
              >
                {c.difficulty}
              </span>
            </div>
            <h2 className="mt-4 font-semibold tracking-tight">{c.title}</h2>
            <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">
              {c.summary}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {c.estimatedMinutes} min
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Signal className="h-3.5 w-3.5" />
                {c.tags.slice(0, 2).join(' · ')}
              </span>
              <span className="ml-auto inline-flex items-center gap-1 font-medium text-primary">
                Resolver
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}