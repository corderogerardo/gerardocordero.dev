import Link from 'next/link'
import '@/app/globals.css'

export const metadata = {
  title: 'React Native — Senior Interview Practice',
  description: 'Senior React Native interview prep: flashcards and hands-on coding challenges',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <nav className="border-b bg-card">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Flashcards</Link>
            <Link href="/challenges" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Challenges</Link>
            {/* Leaves this app's basePath for the academy root, so <Link> (which would
                prefix /reactnative) is wrong here. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors ml-auto">← PawWalk Academy</a>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}
