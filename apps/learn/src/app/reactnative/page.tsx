import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Flashcards — React Native Senior Practice',
  description: 'React Native interview prep: 237 flashcards across every Andersen level (J1–S2), plus 150 coding challenges',
}

export default function LegacyReactNativePage() { redirect('/practice/reactnative'); }
