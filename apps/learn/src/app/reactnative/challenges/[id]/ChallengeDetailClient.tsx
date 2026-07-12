'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import type { Challenge } from '@/lib/challenges'
import { runTests, type TestResult } from '@/lib/challenge-runner'
import { CHALLENGE_PROGRESS_KEY, loadProgress, saveProgress } from '@/lib/progress'
import { usePreviewBridge } from '@/app/reactnative/challenges/hooks/usePreviewBridge'
import { previewComponents } from '@/app/reactnative/challenges/previews'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Play, RotateCcw, CheckCircle2, XCircle, Lightbulb, ChevronLeft,
  ChevronRight, ArrowLeft, Eye, GraduationCap,
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
  const [code, setCode] = useState(challenge.starterCode)
  const [results, setResults] = useState<TestResult[] | null>(null)
  const [passedCount, setPassedCount] = useState(0)
  const [failedCount, setFailedCount] = useState(0)
  const [runtimeError, setRuntimeError] = useState<string | null>(null)
  const [showSolution, setShowSolution] = useState(false)
  const [showHints, setShowHints] = useState(false)
  const [hintIndex, setHintIndex] = useState(0)

  const PreviewComponent = challenge.preview
    ? previewComponents[challenge.preview.component]
    : null

  const previewFns = usePreviewBridge(
    code,
    challenge.preview?.extract ?? [],
  )

  const all = getAllChallenges()
  const currentIdx = all.findIndex(c => c.id === challenge.id)
  const prevChallenge = currentIdx > 0 ? all[currentIdx - 1] : null
  const nextChallenge = currentIdx < all.length - 1 ? all[currentIdx + 1] : null

  const handleRun = useCallback(() => {
    const result = runTests(code, challenge.tests)
    setResults(result.results)
    setPassedCount(result.passed)
    setFailedCount(result.failed)
    setRuntimeError(result.runtimeError)
    if (result.results.length > 0 && result.failed === 0 && !result.runtimeError) {
      const completed = loadProgress<Record<number, boolean>>(CHALLENGE_PROGRESS_KEY, {})
      completed[challenge.id] = true
      saveProgress(CHALLENGE_PROGRESS_KEY, completed)
    }
  }, [code, challenge.tests, challenge.id])

  const handleReset = useCallback(() => {
    setCode(challenge.starterCode)
    setResults(null)
    setPassedCount(0)
    setFailedCount(0)
    setRuntimeError(null)
    setShowSolution(false)
    setShowHints(false)
    setHintIndex(0)
  }, [challenge.starterCode])

  const handleRevealHint = useCallback(() => {
    if (hintIndex < challenge.hints.length - 1) {
      setHintIndex(i => i + 1)
    }
  }, [hintIndex, challenge.hints.length])

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/reactnative/challenges">
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
              <Link href={`/reactnative/challenges/${prevChallenge.id}`}>
                <Button variant="outline" size="sm">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </Link>
            )}
            {nextChallenge && (
              <Link href={`/reactnative/challenges/${nextChallenge.id}`}>
                <Button variant="outline" size="sm">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Prompt */}
          <div className="space-y-4">
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

            {/* Live Preview (preview challenges only) */}
            {PreviewComponent && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <CardTitle className="text-base">Live Preview</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {previewFns ? (
                    <div className="border rounded-lg overflow-hidden">
                      <PreviewComponent {...previewFns} />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Write your functions and click Run to see the live preview
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Hints */}
            {challenge.hints.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Hints
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setShowHints(!showHints)}>
                      {showHints ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                </CardHeader>
                {showHints && (
                  <CardContent className="pt-0">
                    {challenge.hints.slice(0, hintIndex + 1).map((hint, i) => (
                      <p key={i} className="text-sm text-muted-foreground mb-1">&bull; {hint}</p>
                    ))}
                    {hintIndex < challenge.hints.length - 1 && (
                      <Button variant="link" size="sm" onClick={handleRevealHint} className="p-0 h-auto text-xs">
                        Reveal next hint
                      </Button>
                    )}
                  </CardContent>
                )}
              </Card>
            )}

            {/* Solution */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Solution</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowSolution(!showSolution)}>
                    {showSolution ? 'Hide' : 'Show'}
                  </Button>
                </div>
              </CardHeader>
              {showSolution && (
                <CardContent className="pt-0 space-y-4">
                  <ScrollArea className="h-[200px]">
                    <pre className="text-sm p-3 bg-muted rounded-md overflow-x-auto">
                      <code>{challenge.solution}</code>
                    </pre>
                  </ScrollArea>
                  {challenge.explanation && (
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold">Mentor&apos;s take</span>
                      </div>
                      <div className="prose prose-sm dark:prose-invert max-w-none text-foreground
                        prose-p:leading-relaxed prose-li:leading-relaxed
                        prose-code:before:content-none prose-code:after:content-none
                        prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-medium">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {challenge.explanation}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          </div>

          {/* Right: Code Editor + Test Runner */}
          <div className="space-y-4">
            {/* Code Editor */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Your Code</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{challenge.timeEstimate}</span>
                    <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
                      <RotateCcw className="h-3 w-3" />
                      Reset
                    </Button>
                    <Button size="sm" onClick={handleRun} className="gap-1">
                      <Play className="h-3 w-3" />
                      Run
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="relative">
                  <textarea
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    className="w-full h-[300px] font-mono text-sm p-4 bg-muted rounded-md border resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                    spellCheck={false}
                  />
                  {runtimeError && (
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-destructive/10 text-destructive text-xs font-mono border-t border-destructive/20 rounded-b-md">
                      {runtimeError}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Test Results */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Tests</CardTitle>
                  {results && (
                    <div className="flex items-center gap-3 text-sm">
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        {passedCount}
                      </span>
                      {failedCount > 0 && (
                        <span className="flex items-center gap-1 text-red-600">
                          <XCircle className="h-4 w-4" />
                          {failedCount}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ScrollArea className="h-[200px]">
                  {results ? (
                    <div className="space-y-2">
                      {results.map((r, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-md text-sm border ${
                            r.passed
                              ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
                              : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 font-medium mb-1">
                            {r.passed
                              ? <CheckCircle2 className="h-4 w-4 text-green-600" />
                              : <XCircle className="h-4 w-4 text-red-600" />
                            }
                            {r.name}
                          </div>
                          {!r.passed && (
                            <div className="text-xs text-muted-foreground space-y-1 mt-1">
                              {r.error && <p className="text-red-600">Error: {r.error}</p>}
                              {r.expected !== undefined && (
                                <p>Expected: <code className="bg-muted px-1 rounded">{JSON.stringify(r.expected)}</code></p>
                              )}
                              {r.actual !== undefined && (
                                <p>Got: <code className="bg-muted px-1 rounded">{JSON.stringify(r.actual)}</code></p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                      <p>Click Run to test your code</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
