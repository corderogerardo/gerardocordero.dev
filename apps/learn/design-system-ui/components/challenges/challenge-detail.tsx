'use client'

import { useState } from 'react'
import Link from 'next/link'
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
} from 'lucide-react'
import { type Challenge, type Difficulty } from '@/lib/challenges-data'
import { cn } from '@/lib/utils'

const difficultyStyles: Record<Difficulty, string> = {
  Fácil: 'bg-success/15 text-success',
  Intermedio: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  Avanzado: 'bg-destructive/15 text-destructive',
}

export function ChallengeDetail({
  challenge,
  prevId,
  nextId,
}: {
  challenge: Challenge
  prevId: number | null
  nextId: number | null
}) {
  const [revealedHints, setRevealedHints] = useState(0)
  const [showSolution, setShowSolution] = useState(false)
  const [copied, setCopied] = useState<'starter' | 'solution' | null>(null)

  function copy(text: string, which: 'starter' | 'solution') {
    navigator.clipboard.writeText(text)
    setCopied(which)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20 lg:px-12 xl:px-16">
      <Link
        href="/reactnative/challenges"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Todos los challenges
      </Link>

      {/* Encabezado */}
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg font-semibold tabular-nums text-primary-foreground"
        >
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

      <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
        {challenge.title}
      </h1>

      <div className="mb-6 flex flex-wrap gap-2">
        {challenge.tags.map((t) => (
          <span
            key={t}
            className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
          >
            {t}
          </span>
        ))}
      </div>

      <section className="rounded-3xl border border-border bg-card/50 backdrop-blur-sm p-6 sm:p-8 lg:p-10 space-y-8">
        {/* Enunciado */}
        <section className="space-y-4">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-2">
            Enunciado
          </h2>
          {challenge.prompt.split('\n\n').map((para, i) => (
            <p key={i} className="text-pretty leading-relaxed">
              {para}
            </p>
          ))}
        </section>

        {/* Código inicial */}
        <section className="overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="text-sm font-semibold">Código inicial</h2>
            <button
              onClick={() => copy(challenge.starterCode, 'starter')}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {copied === 'starter' ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied === 'starter' ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <pre className="overflow-x-auto bg-foreground/95 p-5 font-mono text-xs leading-relaxed text-background">
            <code>{challenge.starterCode}</code>
          </pre>
        </section>

        {/* Solución */}
        <section className="overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="inline-flex items-center gap-2 text-sm font-semibold">
              <Eye className="h-4 w-4 text-primary" />
              Solución
            </h2>
            <button
              onClick={() => setShowSolution((s) => !s)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-secondary"
            >
              {showSolution ? 'Ocultar' : 'Revelar solución'}
            </button>
          </div>
          {showSolution && (
            <div className="border-t border-border bg-primary/5 p-6">
              <div className="flex items-center justify-end">
                <button
                  onClick={() => copy(challenge.solutionCode, 'solution')}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {copied === 'solution' ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied === 'solution' ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              <pre className="overflow-x-auto bg-foreground/95 p-5 font-mono text-xs leading-relaxed text-background">
                <code>{challenge.solutionCode}</code>
              </pre>
              <div className="mt-4 border-t border-border bg-primary/5 p-5">
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
      </section>

      {/* Barra lateral */}
      <section className="mt-8 lg:mt-0 space-y-6">
        {/* Objetivos */}
        <section className="rounded-3xl border border-border bg-card/50 backdrop-blur-sm p-6 sm:p-8">
          <h2 className="inline-flex items-center gap-2 text-sm font-semibold">
            <Target className="h-4 w-4 text-primary" />
            Objetivos
          </h2>
          <ul className="mt-4 space-y-3">
            {challenge.objectives.map((obj, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed">
                <span
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold tabular-nums text-secondary-foreground"
                >
                  {i + 1}
                </span>
                {obj}
              </li>
            ))}
          </ul>
        </section>

        {/* Pistas paso a paso */}
        <section className="rounded-3xl border border-border bg-card/50 backdrop-blur-sm p-6 sm:p-8">
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
              const revealed = i < revealedHints
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
                      <span
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-xs font-semibold tabular-nums text-amber-600 dark:text-amber-400"
                      >
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
              )
            })}
          </div>

          {revealedHints < challenge.hints.length ? (
            <button
              onClick={() => setRevealedHints((n) => n + 1)}
              className="mt-4 w-full rounded-xl bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent"
            >
              <Lightbulb className="h-4 w-4" />
              Desbloquear siguiente pista
            </button>
          ) : (
            <p className="mt-4 text-center text-xs text-muted-foreground">
              No quedan más pistas. ¡Tú puedes!
            </p>
          )}
        </section>
      </section>

      {/* Navegación entre challenges */}
      <div className="mt-12 flex items-center justify-between border-t border-border pt-6">
        {prevId ? (
          <Link
            href={`/reactnative/challenges/${prevId}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior
          </Link>
        ) : (
          <span className="hidden" />
        )}
        {nextId ? (
          <Link
            href={`/reactnative/challenges/${nextId}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:opacity-80"
          >
            Siguiente challenge
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className="hidden" />
        )}
      </div>
    </div>
  )
}