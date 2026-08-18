import { getChallenge, getAllChallenges } from '@/lib/challenges'
import { notFound } from 'next/navigation'
import ChallengeDetailClient from './ChallengeDetailClient'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateStaticParams() {
  return getAllChallenges().map(c => ({ id: String(c.id) }))
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const challenge = getChallenge(Number(id))
  if (!challenge) return { title: 'Not Found' }
  return {
    title: `${challenge.title} — Coding Challenge`,
    description: challenge.prompt.slice(0, 160),
  }
}

export default async function ChallengePage({ params }: Props) {
  const { id } = await params
  const challenge = getChallenge(Number(id))

  if (!challenge) notFound()

  return <ChallengeDetailClient challenge={challenge} />
}
