'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import type { Challenge } from '@/lib/challenges'
import { CHALLENGE_PROGRESS_KEY, loadProgress, clearProgress } from '@/lib/progress'
import ChallengeCard from './components/ChallengeCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Search, ListChecks, RotateCcw } from 'lucide-react'

interface Props {
  challenges: Challenge[]
  categories: string[]
}

export default function ChallengeListClient({ challenges, categories }: Props) {
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterDifficulty, setFilterDifficulty] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [completed, setCompleted] = useState<Record<number, boolean>>({})

  // localStorage is read after mount so server and client render the same initial HTML.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate: hydration-safe deferred read
    setCompleted(loadProgress<Record<number, boolean>>(CHALLENGE_PROGRESS_KEY, {}))
  }, [])

  const resetProgress = useCallback(() => {
    setCompleted({})
    clearProgress(CHALLENGE_PROGRESS_KEY)
  }, [])

  const completedCount = challenges.filter(c => completed[c.id]).length

  const filtered = useMemo(() => {
    return challenges.filter(c => {
      if (filterCategory !== 'all' && c.category !== filterCategory) return false
      if (filterDifficulty !== 'all' && c.difficulty !== filterDifficulty) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return c.title.toLowerCase().includes(q) || c.prompt.toLowerCase().includes(q)
      }
      return true
    })
  }, [challenges, filterCategory, filterDifficulty, searchQuery])

  const categoryCounts = categories.map(name => {
    const inCategory = challenges.filter(c => c.category === name)
    return {
      name,
      count: inCategory.length,
      done: inCategory.filter(c => completed[c.id]).length,
    }
  })

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Coding Challenges</h1>
              <p className="text-muted-foreground mt-1">
                {challenges.length} hands-on challenges across {categories.length} categories
                {completedCount > 0 && <> • {completedCount} completed</>}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {completedCount > 0 && (
                <Button variant="ghost" size="sm" onClick={resetProgress} className="gap-1">
                  <RotateCcw className="h-3 w-3" />
                  Reset progress
                </Button>
              )}
              <Link href="/">
                <Button variant="outline" size="sm">Back to Flashcards</Button>
              </Link>
            </div>
          </div>
        </header>

        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search challenges..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {categoryCounts.map(({ name, count, done }) => (
            <div key={name} className="p-3 rounded-lg border bg-card">
              <div className="font-medium">{name}</div>
              <div className="text-sm text-muted-foreground">{done}/{count} completed</div>
            </div>
          ))}
        </div>

        {filtered.length === 0 ? (
          <Card className="text-center py-12">
            <ListChecks className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">No challenges match your filters</p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(challenge => (
              <Link key={challenge.id} href={`/reactnative/challenges/${challenge.id}`}>
                <ChallengeCard challenge={challenge} completed={!!completed[challenge.id]} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
