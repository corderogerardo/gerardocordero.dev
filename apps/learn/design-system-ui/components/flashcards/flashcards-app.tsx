'use client'

import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  RotateCcw,
  RotateCw,
  Shuffle,
  Sparkles,
  CircleCheck,
} from 'lucide-react'
import {
  flashcards,
  flashcardsMeta,
  getCategories,
  levelLabels,
  totalCards,
  type Flashcard,
  type Level,
} from '@/lib/flashcards'
import { cn } from '@/lib/utils'

type Status = 'correct' | 'review'
type Progress = Record<string, Status>

const levelStyles: Record<Level, string> = {
  easy: 'bg-success/15 text-success',
  medium: 'bg-chart-4/15 text-chart-4',
  hard: 'bg-destructive/15 text-destructive',
}

export function FlashcardsApp() {
  const categories = useMemo(() => getCategories(), [])

  const [progress, setProgress] = useState<Progress>({})
  const [category, setCategory] = useState<string>('all')
  const [level, setLevel] = useState<Level | 'all'>('all')
  const [order, setOrder] = useState<string[]>(flashcards.map((c) => c.id))
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  // Tarjetas visibles según filtros, respetando el orden actual (para shuffle)
  const deck = useMemo(() => {
    const byId = new Map(flashcards.map((c) => [c.id, c]))
    return order
      .map((id) => byId.get(id))
      .filter((c): c is Flashcard => {
        if (!c) return false
        if (category !== 'all' && c.category !== category) return false
        if (level !== 'all' && !c.levels.includes(level)) return false
        return true
      })
  }, [order, category, level])

  const safeIndex = Math.min(index, Math.max(deck.length - 1, 0))
  const card = deck[safeIndex]

  const correctCount = useMemo(
    () =>
      deck.filter((c) => progress[c.id] === 'correct').length,
    [deck, progress],
  )

  const go = useCallback(
    (dir: 1 | -1) => {
      setFlipped(false)
      setIndex((i) =>
        Math.min(Math.max(i + dir, 0), deck.length - 1),
      )
    },
    [deck.length],
  )

  const mark = useCallback(
    (status: Status) => {
      if (!card) return
      setProgress((p) => ({ ...p, [card.id]: status }))
      if (safeIndex < deck.length - 1) setTimeout(() => go(1), 160)
    },
    [card, deck.length, safeIndex, go],
  )

  function shuffle() {
    setOrder((prev) => {
      const next = [...prev]
      for (let i = next.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[next[i], next[j]] = [next[j], next[i]]
      }
      return next
    })
    setIndex(0)
    setFlipped(false)
  }

  function resetProgress() {
    setProgress({})
  }

  // Atajos de teclado
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (target.tagName === 'SELECT' || target.tagName === 'INPUT') return
      if (e.code === 'Space') {
        e.preventDefault()
        setFlipped((f) => !f)
      } else if (e.key === 'ArrowRight') {
        go(1)
      } else if (e.key === 'ArrowLeft') {
        go(-1)
      } else if (e.key === '1') {
        mark('review')
      } else if (e.key === '2') {
        mark('correct')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, mark])

  const indexRef = useRef<number>(0);
const flippedRef = useRef<boolean>(false);

// Reinicia el índice cuando cambian los filtros
useEffect(() => {
  indexRef.current = 0;
  flippedRef.current = false;
}, [category, level]);

// Sync state from refs
useEffect(() => {
  setIndex(indexRef.current);
  setFlipped(flippedRef.current);
}, []);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20 lg:px-12 xl:px-16">
      {/* Cabecera */}
      <div className="flex items-center gap-3 mb-12">
        <Sparkles className="h-5 w-5 text-primary" />
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
          {flashcardsMeta.title}
        </h1>
      </div>
      <p className="text-lg text-muted-foreground leading-relaxed mb-8">
        {flashcardsMeta.subtitle}
      </p>

      {/* Panel de sesión */}
      <div className="rounded-3xl border border-border bg-card/50 backdrop-blur-sm p-6 sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <Select
              label="Categoría"
              value={category}
              onChange={setCategory}
              options={[
                { value: 'all', label: `Todas (${totalCards})` },
                ...categories.map((c) => ({ value: c, label: c })),
              ]}
            />
            <Select
              label="Nivel"
              value={level}
              onChange={(v) => setLevel(v as Level | 'all')}
              options={[
                { value: 'all', label: 'Todos los niveles' },
                { value: 'easy', label: 'Fácil' },
                { value: 'medium', label: 'Intermedio' },
                { value: 'hard', label: 'Avanzado' },
              ]}
            />
            <button
              onClick={shuffle}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-medium transition-colors hover:bg-secondary"
            >
              <Shuffle className="h-4 w-4" />
              Barajar
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium tabular-nums text-muted-foreground">
              {deck.length ? safeIndex + 1 : 0} / {deck.length}
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
              <CircleCheck className="h-4 w-4" />
              {correctCount} correctas
            </span>
            <button
              onClick={resetProgress}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reiniciar
            </button>
          </div>
        </div>

        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{
              width: `${deck.length ? ((safeIndex + 1) / deck.length) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Tarjeta */}
      {card ? (
        <>
          <div className="perspective-1000 mt-8">
            <button
              onClick={() => setFlipped((f) => !f)}
              className="group relative block h-[520] w-full sm:h-[640] md:h-[560] transition-height duration-300 aria-label='Voltear tarjeta'"
              style={{ marginBottom: 'clamp(20px, 8vh, 60px)' }}
            >
              <div
                className={cn(
                  'transform-3d relative h-full w-full transition-transform duration-600',
                  flipped && 'rotate-y-180',
                )}
              >
                {/* Frente */}
                <div className="backface-hidden absolute inset-0 flex flex-col rounded-4xl border border-border bg-card p-8 md:p-10 shadow-2xl">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                      {card.category}
                    </span>
                    <span
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-medium capitalize',
                        levelStyles[card.levels[0]],
                      )}
                    >
                      {levelLabels[card.levels[0]]}
                    </span>
                    {progress[card.id] && (
                      <span
                        className={cn(
                          'ml-auto rounded-full px-3 py-1 text-xs font-medium',
                          progress[card.id] === 'correct'
                            ? 'bg-success/15 text-success'
                            : 'bg-chart-4/15 text-chart-4',
                        )}
                      >
                        {progress[card.id] === 'correct' ? 'Correcta' : 'Por repasar'}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 items-center justify-center">
                    <p className="text-balance text-center text-2xl md:text-3xl font-medium leading-relaxed sm:text-base">
                      {card.question}
                    </p>
                  </div>
                  <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                    <RotateCw className="h-4 w-4" />
                    Toca o presiona{' '}
                    <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">
                      Espacio
                    </kbd>{' '}
                    para revelar
                  </p>
                </div>

                {/* Reverso */}
                <div className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col overflow-auto rounded-4xl border border-primary/30 bg-card p-8 md:p-10 shadow-2xl">
                  <span className="mb-3 w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    Respuesta
                  </span>
                  <p className="whitespace-pre-line text-pretty leading-relaxed">
                    {card.answer}
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Acciones */}
          <div className="mt-6 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => mark('review')}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium transition-colors hover:bg-secondary"
              >
                <RotateCcw className="h-4 w-4" />
                Repasar luego
              </button>
              <button
                onClick={() => mark('correct')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-success px-4 py-3 text-sm font-medium text-success-foreground transition-opacity hover:opacity-90"
              >
                <Check className="h-4 w-4" />
                La sé
              </button>
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={() => go(-1)}
                disabled={safeIndex === 0}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" />
                Anterior
              </button>
              <span className="text-xs text-muted-foreground">
                Usa <kbd className="font-mono">←</kbd>{' '}
                <kbd className="font-mono">→</kbd> para navegar
              </span>
              <button
                onClick={() => go(1)}
                disabled={safeIndex >= deck.length - 1}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
              >
                Siguiente
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="mt-8 rounded-3xl border border-dashed border-border bg-card/50 p-12 md:p-16 text-center">
          <p className="text-muted-foreground">
            No hay tarjetas para este filtro. Prueba con otra categoría o nivel.
          </p>
        </div>
      )}

      {/* Progreso por categoría */}
      <h2 className="mt-16 font-display text-lg font-semibold tracking-tight mb-6">Progreso por categoría</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const cards = flashcards.filter(
            (c: { category: string; id: string }) => c.category === cat,
          )
          const done = cards.filter(
            (c) => progress[c.id] === 'correct',
          ).length
          const pct = Math.round((done / cards.length) * 100)
          return (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat)
                setLevel('all')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="rounded-3xl border border-border bg-card/50 p-4 sm:p-5 lg:p-6 text-left transition-colors hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium font-display">{cat}</span>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {done}/{cards.length}
                </span>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-xl border border-border bg-background py-2 pl-3.5 pr-9 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </label>
  )
}