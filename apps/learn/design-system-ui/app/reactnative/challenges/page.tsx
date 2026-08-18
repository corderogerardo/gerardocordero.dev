import { SiteHeader } from '@/components/site-header'
import { ChallengesList } from '@/components/challenges/challenges-list'

export default function ChallengesPage() {
  return (
    <div className="min-h-svh">
      <SiteHeader />
      <main>
        <ChallengesList />
      </main>
    </div>
  )
}
