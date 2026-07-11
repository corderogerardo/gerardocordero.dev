import { notFound } from 'next/navigation'
import { getSpecs, getSpecMeta, getSpecFlashcards, getSpecCategories, getSpecLevels } from '@/lib/andersen-decks'
import FlashcardDeck from '@/components/FlashcardDeck'

export function generateStaticParams() {
  return getSpecs().map((s) => ({ spec: s.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ spec: string }> }) {
  const { spec } = await params
  const meta = getSpecMeta(spec)
  return {
    title: meta ? `${meta.title} — Interview Practice` : 'Interview Practice',
    description: meta
      ? `${meta.title} interview prep: flashcards across every Andersen level (J1–S2), senior-coach answers.`
      : undefined,
  }
}

export default async function PracticePage({ params }: { params: Promise<{ spec: string }> }) {
  const { spec } = await params
  const meta = getSpecMeta(spec)
  if (!meta) notFound()

  return (
    <main className="min-h-screen bg-background">
      <FlashcardDeck
        initialCards={getSpecFlashcards(spec)}
        initialCategories={getSpecCategories(spec)}
        initialLevels={getSpecLevels(spec)}
        title={`${meta.title} — Interview Practice`}
      />
    </main>
  )
}
