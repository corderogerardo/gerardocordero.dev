'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Copy,
  Eye,
  GraduationCap,
  Lightbulb,
  Lock,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Challenge {
  id: number;
  title: string;
  summary: string;
  difficulty: 'Fácil' | 'Intermedio' | 'Avanzado';
  estimatedMinutes: number;
  tags: string[];
  prompt: string;
  starterCode: string;
  solutionCode: string;
  solutionExplanation: string;
  objectives: string[];
  hints: string[];
}

interface ChallengeDetailProps {
  challenge: Challenge;
  prevId: number | null;
  nextId: number | null;
  specSlug: string;
}

const difficultyStyles: Record<'Fácil' | 'Intermedio' | 'Avanzado', string> = {
  Fácil: 'bg-success/15 text-success',
  Intermedio: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  Avanzado: 'bg-destructive/15 text-destructive',
};

export function ChallengeDetail({
  challenge,
  prevId,
  nextId,
  specSlug,
}: ChallengeDetailProps) {
  const [revealedHints, setRevealedHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [copied, setCopied] = useState<'starter' | 'solution' | null>(null);

  function copy(text: string, which: 'starter' | 'solution') {
    navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href={`/practice/${specSlug}/challenges`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Todos los challenges
      </Link>

      {/* Header */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg font-semibold tabular-nums text-primary-foreground">
          {challenge.id}
        </span>
        <span
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium',
            difficultyStyles[challenge.difficulty],
          )}
        >
          {challenge.difficulty}
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {challenge.estimatedMinutes} min
        </span>
      </div>
      <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
        {challenge.title}
      </h1>
      <div className="mt-3 flex flex-wrap gap-2">
        {challenge.tags.map((t) => (
          <span
            key={t}
            className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        {/* Main column */}
        <div className="lg:col-span-3 space-y-6">
          {/* Prompt */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Enunciado
            </h2>
            {challenge.prompt.split('\n\n').map((para, i) => (
              <p key={i} className="mt-3 text-pretty leading-relaxed">
                {para}
              </p>
            ))}
          </section>

          {/* Starter code */}
          <section className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h2 className="text-sm font-semibold">Código inicial</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copy(challenge.starterCode, 'starter')}
                className="gap-1.5"
              >
                {copied === 'starter' ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied === 'starter' ? 'Copiado' : 'Copiar'}
              </Button>
            </div>
            <pre className="overflow-x-auto bg-foreground/95 p-5 font-mono text-xs leading-relaxed text-background">
              <code>{challenge.starterCode}</code>
            </pre>
          </section>

          {/* Solution */}
          <section className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between px-5 py-4">
              <h2 className="inline-flex items-center gap-2 text-sm font-semibold">
                <Eye className="h-4 w-4 text-primary" />
                Solución
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSolution((s) => !s)}
                className="gap-1.5"
              >
                {showSolution ? 'Ocultar' : 'Revelar solución'}
              </Button>
            </div>
            {showSolution && (
              <div className="border-t border-border">
                <div className="flex items-center justify-end px-5 py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copy(challenge.solutionCode, 'solution')}
                    className="gap-1.5"
                  >
                    {copied === 'solution' ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copied === 'solution' ? 'Copiado' : 'Copiar'}
                  </Button>
                </div>
                <pre className="overflow-x-auto bg-foreground/95 p-5 font-mono text-xs leading-relaxed text-background">
                  <code>{challenge.solutionCode}</code>
                </pre>
                <div className="border-t border-border bg-primary/5 p-5">
                  <p className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                    <GraduationCap className="h-4 w-4" />
                    Nota del mentor
                  </p>
                  <p className="mt-2 whitespace-pre-line text-pretty text-sm leading-relaxed text-muted-foreground">
                    {challenge.solutionExplanation}
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-2 space-y-6">
          {/* Objectives */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="inline-flex items-center gap-2 text-sm font-semibold">
              <Target className="h-4 w-4 text-primary" />
              Objetivos
            </h2>
            <ul className="mt-4 space-y-3">
              {challenge.objectives.map((obj, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold tabular-nums text-secondary-foreground">
                    {i + 1}
                  </span>
                  {obj}
                </li>
              ))}
            </ul>
          </section>

          {/* Hints */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="inline-flex items-center gap-2 text-sm font-semibold">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                Pistas
              </h2>
              <span className="text-xs tabular-nums text-muted-foreground">
                {revealedHints}/{challenge.hints.length}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {challenge.hints.map((hint, i) => {
                const revealed = i < revealedHints;
                return (
                  <div
                    key={i}
                    className={cn(
                      'rounded-xl border p-4 text-sm leading-relaxed transition-colors',
                      revealed
                        ? 'border-amber-500/30 bg-amber-500/5'
                        : 'border-dashed border-border bg-muted/40',
                    )}
                  >
                    {revealed ? (
                      <div className="flex gap-3">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-xs font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                          {i + 1}
                        </span>
                        <p className="text-pretty">{hint}</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Lock className="h-4 w-4" />
                        Pista {i + 1} bloqueada
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {revealedHints < challenge.hints.length ? (
              <Button
                onClick={() => setRevealedHints((n) => n + 1)}
                className="mt-4 w-full gap-2"
              >
                <Lightbulb className="h-4 w-4" />
                Desbloquear siguiente pista
              </Button>
            ) : (
              <p className="mt-4 text-center text-xs text-muted-foreground">
                No quedan más pistas. ¡Tú puedes!
              </p>
            )}
          </section>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
        {prevId ? (
          <Link
            href={`/practice/${specSlug}/challenges/${prevId}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior
          </Link>
        ) : (
          <span />
        )}
        {nextId ? (
          <Link
            href={`/practice/${specSlug}/challenges/${nextId}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:opacity-80"
          >
            Siguiente challenge
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}