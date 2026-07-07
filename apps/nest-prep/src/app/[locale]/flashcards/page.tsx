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
    "Interview Q&A flashcards across NestJS core, DI, the request lifecycle, data, auth, microservices, GraphQL, Node.js internals, performance, and testing. Reveal, self-grade, and drill what you don't know yet.",
};

export default async function FlashcardsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const cards = getFlashcards(locale as Locale);
  const filters = getFlashcardFilters(locale as Locale);
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Drill the Q&A"
        title="Interview Q&A — Flashcards"
        lead="Tap a card to reveal the answer, then grade yourself. Your grades are saved in this browser, so you can come back and drill only the ones you still need. Sourced from the official NestJS docs, the Node.js API docs, and widely-cited best-practice guides."
      />
      <FlashcardDeck cards={cards} filters={filters} />
    </div>
  );
}
