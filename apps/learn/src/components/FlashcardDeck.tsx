'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { Flashcard } from '@/lib/flashcards'
import { FLASHCARD_PROGRESS_KEY, loadProgress, saveProgress, clearProgress } from '@/lib/progress'
import FlashcardCard from '@/components/FlashcardCard'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Shuffle, ArrowLeft, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react'

interface FlashcardDeckProps {
  initialCards: Flashcard[]
  initialCategories: string[]
  initialLevels: string[]
  title?: string
}

type CardResult = 'correct' | 'wrong'

/** Uniform Fisher-Yates. A `sort(() => Math.random() - 0.5)` comparator is biased. */
function shuffle<T>(items: T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export default function FlashcardDeck({ initialCards, initialCategories, initialLevels, title = 'React Native — Senior Practice' }: FlashcardDeckProps) {
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterLevel, setFilterLevel] = useState<string>('all')
  // A shuffle is an event, not a derivation: keeping the order in state stops React
  // from silently reshuffling the deck whenever it decides to drop a useMemo cache.
  const [shuffledDeck, setShuffledDeck] = useState<Flashcard[] | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [progress, setProgress] = useState<Record<number, CardResult>>({})

  // localStorage is read after mount so server and client render the same initial HTML.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate: hydration-safe deferred read
    setProgress(loadProgress<Record<number, CardResult>>(FLASHCARD_PROGRESS_KEY, {}))
  }, [])

  // long answers scroll the page; snap back to the top of the card on every card/side change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentIndex, showAnswer])

  const matches = useCallback(
    (c: Flashcard, cat: string, lvl: string) =>
      (cat === 'all' || c.category === cat) && (lvl === 'all' || c.levels.includes(lvl)),
    []
  )

  const filteredCards = useMemo(
    () => initialCards.filter(c => matches(c, filterCategory, filterLevel)),
    [initialCards, filterCategory, filterLevel, matches]
  )

  const isShuffled = shuffledDeck !== null
  const workingDeck = shuffledDeck ?? filteredCards

  // Re-derive the shuffled order from the new filter (only when a shuffle is active).
  const applyFilter = useCallback((cat: string, lvl: string) => {
    setShuffledDeck(d => (d === null ? null : shuffle(initialCards.filter(c => matches(c, cat, lvl)))))
    setCurrentIndex(0)
    setShowAnswer(false)
  }, [initialCards, matches])

  const selectCategory = useCallback((value: string) => {
    setFilterCategory(value)
    applyFilter(value, filterLevel)
  }, [applyFilter, filterLevel])

  const selectLevel = useCallback((value: string) => {
    setFilterLevel(value)
    applyFilter(filterCategory, value)
  }, [applyFilter, filterCategory])

  const toggleShuffle = useCallback(() => {
    setShuffledDeck(d => (d === null ? shuffle(filteredCards) : null))
    setCurrentIndex(0)
    setShowAnswer(false)
  }, [filteredCards])

  const currentCard = workingDeck.length > 0
    ? workingDeck[currentIndex % workingDeck.length]
    : null

  const nextCard = useCallback(() => {
    if (workingDeck.length === 0) return
    setCurrentIndex(i => (i + 1) % workingDeck.length)
    setShowAnswer(false)
  }, [workingDeck.length])

  const prevCard = useCallback(() => {
    if (workingDeck.length === 0) return
    setCurrentIndex(i => (i - 1 + workingDeck.length) % workingDeck.length)
    setShowAnswer(false)
  }, [workingDeck.length])

  const recordResult = useCallback((result: CardResult) => {
    if (!currentCard) return
    setProgress(p => {
      const next = { ...p, [currentCard.id]: result }
      saveProgress(FLASHCARD_PROGRESS_KEY, next)
      return next
    })
    nextCard()
  }, [currentCard, nextCard])

  const resetProgress = useCallback(() => {
    setProgress({})
    clearProgress(FLASHCARD_PROGRESS_KEY)
  }, [])

  const flip = useCallback(() => {
    setShowAnswer(s => !s)
  }, [])

  const answered = Object.keys(progress).length
  const correct = Object.values(progress).filter(v => v === 'correct').length

  const categoryProgress = initialCategories.map(name => {
    const cards = initialCards.filter(card => card.category === name)
    return {
      name,
      count: cards.length,
      correct: cards.filter(card => progress[card.id] === 'correct').length,
    }
  })

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground mt-1">
          {initialCards.length} flashcards • {initialCategories.length} categories
        </p>
      </header>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Study Session</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Select value={filterCategory} onValueChange={selectCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories ({initialCards.length})</SelectItem>
                {initialCategories.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterLevel} onValueChange={selectLevel}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {initialLevels.map(l => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={isShuffled ? 'default' : 'outline'}
              size="sm"
              onClick={toggleShuffle}
              className="gap-1"
            >
              <Shuffle className="h-4 w-4" />
              Shuffle
            </Button>

            <div className="flex-1" />
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {currentCard && (
                <span className="font-medium">
                  {(currentIndex % workingDeck.length) + 1} / {workingDeck.length}
                </span>
              )}
              {answered > 0 && (
                <>
                  <span className="flex items-center gap-1 text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                    {correct}/{answered} correct
                  </span>
                  <Button variant="ghost" size="sm" onClick={resetProgress} className="gap-1 h-7 px-2 text-xs">
                    <RotateCcw className="h-3 w-3" />
                    Reset progress
                  </Button>
                </>
              )}
            </div>
          </div>

          <Separator className="mb-4" />
        </CardContent>
      </Card>

      {currentCard ? (
        <FlashcardCard
          card={currentCard}
          showAnswer={showAnswer}
          onFlip={flip}
          onCorrect={() => recordResult('correct')}
          onWrong={() => recordResult('wrong')}
        />
      ) : (
        <Card className="text-center py-12">
          <p className="text-muted-foreground">No cards in this category</p>
        </Card>
      )}

      <div className="flex justify-center gap-3 mt-6">
        <Button
          variant="outline"
          onClick={prevCard}
          disabled={workingDeck.length === 0}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          onClick={nextCard}
          disabled={workingDeck.length === 0}
          className="gap-1"
        >
          Next
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">Category Progress</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categoryProgress.map(({ name, count, correct: catCorrect }) => (
              <div key={name} className="p-3 rounded-lg border bg-card">
                <div className="font-medium">{name}</div>
                <div className="text-sm text-muted-foreground">{catCorrect}/{count} correct</div>
                <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${count ? (catCorrect / count) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
