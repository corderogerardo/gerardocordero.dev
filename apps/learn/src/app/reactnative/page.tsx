import { redirect } from 'next/navigation';

// Legacy entry URL, kept only so existing bookmarks resolve under static export.
// The React Native practice section lives in src/app/practice/reactnative/.
export const metadata = {
  title: 'Flashcards — React Native Senior Practice',
  description: 'React Native interview prep: 237 flashcards across every Andersen level (J1–S2), plus 150 coding challenges',
}

export default function LegacyReactNativePage() { redirect('/practice/reactnative'); }
