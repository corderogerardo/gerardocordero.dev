import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { FlashcardDeck } from "@/components/flashcard-deck";
import { ALL_FLASHCARDS, ALL_FLASHCARD_FILTERS } from "@/data/all";

const cards = ALL_FLASHCARDS;
const filters = ALL_FLASHCARD_FILTERS;

export const metadata: Metadata = {
  title: "Flashcards",
  description:
    "Interview Q&A flashcards across Kotlin, coroutines & Flow, Jetpack Compose, architecture, Jetpack libraries, performance, testing, and more. Reveal, self-grade, and drill what you don't know yet.",
};

export default function FlashcardsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Drill the Q&A"
        title="Interview Q&A — Flashcards"
        lead="Tap a card to reveal the answer, then grade yourself. Your grades are saved in this browser, so you can come back and drill only the ones you still need. Includes a deep set across Kotlin, Compose, coroutines & Flow, Jetpack, DI, performance, and testing."
      />
      <FlashcardDeck cards={cards} filters={filters} />
    </div>
  );
}
