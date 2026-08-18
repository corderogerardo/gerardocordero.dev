'use client'

import Link from 'next/link'
import type { Challenge } from '@/lib/challenges'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  ChevronLeft, ChevronRight, ArrowLeft, GraduationCap, BookOpen,
} from 'lucide-react'
import { getAllChallenges } from '@/lib/challenges'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const difficultyColor = {
  easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

interface Props {
  challenge: Challenge
}

export default function ChallengeDetailClient({ challenge }: Props) {
  const all = getAllChallenges()
  const currentIdx = all.findIndex(c => c.id === challenge.id)
  const prevChallenge = currentIdx > 0 ? all[currentIdx - 1] : null
  const nextChallenge = currentIdx < all.length - 1 ? all[currentIdx + 1] : null

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/practice/reactnative/challenges">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${difficultyColor[challenge.difficulty]}`}>
                  {challenge.difficulty}
                </span>
                <span className="px-2 py-0.5 text-xs text-muted-foreground rounded bg-muted">
                  {challenge.category}
                </span>
                <span className="text-xs text-muted-foreground">#{challenge.id}</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">{challenge.title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {prevChallenge && (
              <Link href={`/practice/reactnative/challenges/${prevChallenge.id}`}>
                <Button variant="outline" size="sm">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </Link>
            )}
            {nextChallenge && (
              <Link href={`/practice/reactnative/challenges/${nextChallenge.id}`}>
                <Button variant="outline" size="sm">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Prompt */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Prompt</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="prose prose-sm max-w-none text-foreground">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {challenge.prompt}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>

        {/* Solution - Always Visible */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Solution
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <ScrollArea className="h-auto max-h-[400px]">
              <pre className="overflow-x-auto whitespace-pre-wrap rounded-md bg-foreground/95 p-5 font-mono text-base leading-8 text-background md:text-lg">
                <code>{challenge.solution}</code>
              </pre>
            </ScrollArea>
            {challenge.explanation && (
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  <span className="text-base font-semibold md:text-lg">Mentor&apos;s take</span>
                </div>
                <div className="markdown-readable prose prose-base dark:prose-invert max-w-none text-foreground md:prose-lg
                  prose-p:text-lg md:prose-p:text-xl prose-p:leading-8 prose-li:text-lg md:prose-li:text-xl prose-li:leading-8
                  prose-code:before:content-none prose-code:after:content-none prose-code:font-medium">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {challenge.explanation}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </main>
  )
}
