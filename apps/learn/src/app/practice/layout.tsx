import Link from 'next/link'
import '../reactnative/reactnative.css'

// Per-specialization flashcard decks (Andersen matrix). Reuses the /reactnative
// Tailwind + shadcn scope (.rn-root, preflight off) so it can't touch course pages.
export default function PracticeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rn-root bg-background font-sans antialiased">
      <nav className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            ← PawWalk Academy
          </Link>
        </div>
      </nav>
      {children}
    </div>
  )
}
