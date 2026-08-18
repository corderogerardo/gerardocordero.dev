import Link from 'next/link'
import {
  ArrowRight,
  Clock,
  Code2,
  Signal,
  Shield,
  Palette,
} from 'lucide-react'
import { challenges, type Difficulty } from '@/lib/challenges'
import { cn } from '@/lib/utils'

const difficultyStyles: Record<Difficulty, string> = {
  Fácil: 'bg-success/15 text-success',
  Intermedio: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  Avanzado: 'bg-destructive/15 text-destructive',
}

export function ChallengesList() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20 lg:px-12 xl:px-16">
      <div className="flex items-center gap-3 mb-12">
        <Code2 className="h-5 w-5 text-primary" />
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
          Challenges
        </h1>
      </div>
      <p className="text-lg text-muted-foreground leading-relaxed mb-8">
        Ejercicios de código prácticos. Lee el enunciado, intenta resolverlo y desbloquea
        pistas una a una cuando te atores.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {challenges.map((c) => (
          <Link
            key={c.id}
            href={`/reactnative/challenges/${c.id}`}
            className="group flex flex-col rounded-3xl border border-border bg-card/50 backdrop-blur-sm p-5 sm:p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg border-primary/10"
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-sm font-semibold tabular-nums text-secondary-foreground"
              >
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
            <h2 className="font-semibold tracking-tight">{c.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {c.summary}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 gap-y-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {c.estimatedMinutes} min
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Signal className="h-3.5 w-3.5" />
                {c.tags.slice(0, 2).join(' · ')}
              </span>
              <span className="ml-auto flex items-center gap-1.5 font-medium text-primary">
                <a href={`/reactnative/challenges/${c.id}`} className="underline underline-offset-2 hover:text-primary">
                  Resolver
                </a>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}