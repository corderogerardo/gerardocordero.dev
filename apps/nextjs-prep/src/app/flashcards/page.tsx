import type { Metadata } from "next";
import { PageHeader } from "@gerardocordero/prep-kit";
import { FlashcardDeck } from "@gerardocordero/prep-kit";
import { ALL_FLASHCARDS, ALL_FLASHCARD_FILTERS } from "@/data/all";

const cards = ALL_FLASHCARDS;
const filters = ALL_FLASHCARD_FILTERS;

export const metadata: Metadata = {
  title: "Flashcards",
  description:
    "Interview Q&A flashcards across the App Router, rendering & caching, data fetching, routing, performance, auth, testing, and security. Reveal, self-grade, and drill what you don't know yet.",
};

export default function FlashcardsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Drill the Q&A"
        title="Interview Q&A — Flashcards"
        lead="Tap a card to reveal the answer, then grade yourself. Your grades are saved in this browser with spaced repetition, so you can come back and drill only what you still need. Sourced from the official Next.js docs, the React docs, and widely-cited best-practice guides."
      />
      <FlashcardDeck cards={cards} filters={filters} />
    </div>
  );
}
