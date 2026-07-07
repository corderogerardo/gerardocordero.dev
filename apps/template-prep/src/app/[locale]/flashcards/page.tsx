import type { Metadata } from "next";
import { PageHeader, FlashcardDeck } from "@gerardocordero/prep-kit";
import { ALL_FLASHCARDS, ALL_FLASHCARD_FILTERS } from "@/data/all";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "es"
    ? { title: "Tarjetas", description: "Tarjetas de preguntas y respuestas con revelado, autoevaluación y repetición espaciada — el progreso se guarda en tu navegador." }
    : { title: "Flashcards", description: "Q&A flashcards with reveal, self-grading, and spaced repetition. Filter by topic or level; progress is saved in your browser." };
}

export default async function FlashcardsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={locale === "es" ? "Practica las preguntas" : "Drill the Q&A"}
        title={locale === "es" ? "Tarjetas" : "Flashcards"}
        lead={locale === "es"
          ? "Toca una tarjeta para revelar la respuesta, luego evalúate. Las calificaciones se guardan en este navegador con repetición espaciada, para que vuelvas y practiques solo lo que aún necesitas."
          : "Tap a card to reveal the answer, then grade yourself. Grades are saved in this browser with spaced repetition, so you can come back and drill only what you still need."}
      />
      <FlashcardDeck cards={ALL_FLASHCARDS} filters={ALL_FLASHCARD_FILTERS} />
    </div>
  );
}
