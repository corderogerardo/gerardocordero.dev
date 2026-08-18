import { SiteHeader } from '@/components/site-header'
import { FlashcardsApp } from '@/components/flashcards/flashcards-app'

export default function ReactNativePage() {
  return (
    <div className="min-h-svh">
      <SiteHeader />
      <main>
        <FlashcardsApp />
      </main>
    </div>
  )
}
