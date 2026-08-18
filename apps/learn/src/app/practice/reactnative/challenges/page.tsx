import { getAllChallenges, getChallengeCategories } from '@/lib/challenges'
import ChallengeListClient from './ChallengeListClient'

export const metadata = {
  title: 'Coding Challenges — React Native Senior Practice',
  description: 'Hands-on coding challenges for senior React Native interview prep',
}

export default function ChallengesPage() {
  const challenges = getAllChallenges()
  const categories = getChallengeCategories()

  return <ChallengeListClient challenges={challenges} categories={categories} />
}
