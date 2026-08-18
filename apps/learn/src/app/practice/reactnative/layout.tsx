import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/practice/site-header';

export const metadata = {
  title: 'React Native — Senior Interview Practice',
  description: 'Senior React Native interview prep: flashcards and hands-on coding challenges',
};

export default function ReactNativePracticeLayout({ children }: { children: ReactNode }) {
  return <div className="rn-root min-h-svh bg-background text-foreground"><SiteHeader />{children}</div>;
}
