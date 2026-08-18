import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Coding Challenges — React Native Senior Practice',
  description: 'Hands-on coding challenges for senior React Native interview prep',
}

export default function LegacyReactNativeChallengesPage() { redirect('/practice/reactnative/challenges'); }
