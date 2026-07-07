import type { Metadata } from "next";
import { PageHeader, FlashcardDeck } from "@gerardocordero/prep-kit";
import type { Locale } from "@gerardocordero/prep-kit";
import { getFlashcards, getFlashcardFilters } from "@/lib/locale-data";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

export const metadata: Metadata = {
  title: "Flashcards",
  description:
    "Q&A flashcards across Swift, SwiftUI, UIKit, concurrency, architecture, data, performance, testing, CI/CD, the App Store, security, and on-device AI. Reveal, self-grade, and drill what you don't know yet.",
};

export default async function FlashcardsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const cards = getFlashcards(locale as Locale);
  const filters = getFlashcardFilters(locale as Locale);
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Drill the Q&A"
        title="iOS Q&A — Flashcards"
        lead="Tap a card to reveal the answer, then grade yourself. Grades are saved in this browser with spaced repetition, so you can come back and drill only what you still need. Filter by topic or by level."
      />
      <FlashcardDeck cards={cards} filters={filters} />
    </div>
  );
}
