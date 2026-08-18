import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { ChallengeDetail } from '@/components/challenges/challenge-detail'
import { challenges, getChallenge } from '@/lib/challenges-data'

export function generateStaticParams() {
  return challenges.map((c) => ({ id: String(c.id) }))
}

export default async function ChallengePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const challenge = getChallenge(Number(id))

  if (!challenge) {
    notFound()
  }

  const prev = challenges.find((c) => c.id === challenge.id - 1)
  const next = challenges.find((c) => c.id === challenge.id + 1)

  return (
    <div className="min-h-svh">
      <SiteHeader />
      <main>
        <ChallengeDetail
          challenge={challenge}
          prevId={prev?.id ?? null}
          nextId={next?.id ?? null}
        />
      </main>
    </div>
  )
}
