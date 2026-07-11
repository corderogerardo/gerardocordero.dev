'use client'

import { Flashcard } from '@/lib/flashcards'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface FlashcardCardProps {
  card: Flashcard
  showAnswer: boolean
  onFlip: () => void
  onCorrect: () => void
  onWrong: () => void
}

export default function FlashcardCard({ card, showAnswer, onFlip, onCorrect, onWrong }: FlashcardCardProps) {
  return (
    <Card
      className="w-full cursor-pointer"
      onClick={onFlip}
      onKeyDown={e => {
        // Ignore keys bubbling up from the footer buttons — preventDefault here
        // would cancel their own Enter/Space activation.
        if (e.target !== e.currentTarget) return
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onFlip(); }
      }}
      tabIndex={0}
      role="button"
      aria-label={showAnswer ? 'Flip to question' : 'Flip to answer'}
    >
      {!showAnswer ? (
        /* Question side */
        <div className="flex flex-col justify-between min-h-[420px] p-8 md:p-12">
          <CardHeader className="p-0">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">
                {card.category}
              </span>
              <span className="px-2 py-1 text-xs text-muted-foreground rounded bg-muted">
                {card.theme}
              </span>
            </div>
            <CardTitle className="text-2xl md:text-3xl font-medium leading-snug md:leading-normal">
              {card.question}
            </CardTitle>
          </CardHeader>
          <div className="text-center text-muted-foreground text-sm pt-8">
            Click or press Space to reveal
          </div>
        </div>
      ) : (
        /* Answer side — grows with content, page scrolls instead of a small inner box */
        <div className="p-8 md:p-12 pb-0 md:pb-0">
          <div className="flex items-center justify-between mb-6">
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded dark:bg-green-900/30 dark:text-green-400">
              Answer
            </span>
            <span className="text-sm text-muted-foreground">
              {card.heading}
            </span>
          </div>

          <article className="prose prose-lg dark:prose-invert max-w-none text-foreground
            prose-p:leading-relaxed prose-li:leading-relaxed
            prose-code:text-[0.85em] prose-code:font-medium prose-code:before:content-none prose-code:after:content-none
            prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-muted prose-pre:text-foreground">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {card.answer || '_Answer not loaded_'}
            </ReactMarkdown>
          </article>

          {/* stopPropagation: these buttons live inside the card, whose onClick also flips */}
          <div
            className="sticky bottom-0 flex gap-3 py-4 mt-8 -mx-8 md:-mx-12 px-8 md:px-12 border-t bg-card rounded-b-lg"
            onClick={e => e.stopPropagation()}
          >
            <Button variant="outline" className="flex-1 gap-1" onClick={onFlip}>
              <RotateCcw className="h-4 w-4" />
              Back to Question
            </Button>
            <Button variant="destructive" className="flex-1 gap-1" onClick={onWrong}>
              <XCircle className="h-4 w-4" />
              Wrong
            </Button>
            <Button className="flex-1 gap-1" onClick={onCorrect}>
              <CheckCircle2 className="h-4 w-4" />
              Correct
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
