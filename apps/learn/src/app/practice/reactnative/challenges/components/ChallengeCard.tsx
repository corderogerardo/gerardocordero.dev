'use client'

import type { Challenge } from '@/lib/challenges'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Code2, CheckCircle2 } from 'lucide-react'

const difficultyColor = {
  easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

interface ChallengeCardProps {
  challenge: Challenge
  completed?: boolean
}

export default function ChallengeCard({ challenge, completed = false }: ChallengeCardProps) {
  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2 py-0.5 text-xs font-medium rounded ${difficultyColor[challenge.difficulty]}`}>
              {challenge.difficulty}
            </span>
            <span className="px-2 py-0.5 text-xs text-muted-foreground rounded bg-muted">
              {challenge.category}
            </span>
          </div>
          {completed && <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />}
        </div>
        <CardTitle className="text-base mt-2 leading-snug">{challenge.title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {challenge.timeEstimate}
          </span>
          <span className="flex items-center gap-1">
            <Code2 className="h-3 w-3" />
            Code
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
