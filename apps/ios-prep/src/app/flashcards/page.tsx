import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { FlashcardDeck } from "@/components/flashcard-deck";
import { ALL_FLASHCARDS, ALL_FLASHCARD_FILTERS } from "@/data/all";

const cards = ALL_FLASHCARDS;
const filters = ALL_FLASHCARD_FILTERS;

export const metadata: Metadata = {
  title: "Flashcards",
  description:
    "Q&A flashcards across Swift, SwiftUI, UIKit, concurrency, architecture, data, performance, testing, CI/CD, the App Store, security, and on-device AI. Reveal, self-grade, and drill what you don't know yet.",
};

export default function FlashcardsPage() {
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
