import { redirect } from 'next/navigation';
import { getAllChallenges } from '@/lib/challenges';

export function generateStaticParams() {
  return getAllChallenges().map((challenge) => ({ id: String(challenge.id) }));
}

export default async function LegacyReactNativeChallengePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/practice/reactnative/challenges/${id}`);
}
