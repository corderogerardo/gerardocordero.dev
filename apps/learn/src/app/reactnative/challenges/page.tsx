import { redirect } from 'next/navigation';

// Legacy entry URL, kept only so existing bookmarks resolve under static export.
// The challenge list lives in src/app/practice/reactnative/challenges/.
export const metadata = {
  title: 'Coding Challenges — React Native Senior Practice',
  description: 'Hands-on coding challenges for senior React Native interview prep',
}

export default function LegacyReactNativeChallengesPage() { redirect('/practice/reactnative/challenges'); }
