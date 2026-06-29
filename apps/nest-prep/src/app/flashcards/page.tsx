import type { Metadata } from "next";
import { PageHeader, FlashcardDeck } from "@gerardocordero/prep-kit";
import { ALL_FLASHCARDS, ALL_FLASHCARD_FILTERS } from "@/data/all";

export const metadata: Metadata = {
  title: "Flashcards",
  description:
    "Q&A flashcards with reveal, self-grading, and spaced repetition. Filter by topic or level; progress is saved in your browser.",
};

export default function FlashcardsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Drill the Q&A"
        title="Flashcards"
        lead="Tap a card to reveal the answer, then grade yourself. Grades are saved in this browser with spaced repetition, so you can come back and drill only what you still need."
      />
      <FlashcardDeck cards={ALL_FLASHCARDS} filters={ALL_FLASHCARD_FILTERS} />
    </div>
  );
}
