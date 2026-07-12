import Link from 'next/link'
import './reactnative.css'

export const metadata = {
  title: 'React Native — Senior Interview Practice',
  description: 'Senior React Native interview prep: flashcards and hands-on coding challenges',
}

// Segment layout for the /reactnative practice app, folded in from the former
// apps/learn-reactnative workspace. The root layout owns <html>/<body>; this
// only mounts the Tailwind/shadcn-scoped `.rn-root` surface + section nav.
export default function ReactNativeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="rn-root bg-background font-sans antialiased">
      <nav className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center gap-6">
          <Link href="/reactnative" className="text-sm font-medium hover:text-primary transition-colors">Flashcards</Link>
          <Link href="/reactnative/challenges" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Challenges</Link>
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors ml-auto">← PawWalk Academy</Link>
        </div>
      </nav>
      {children}
    </div>
  )
}
