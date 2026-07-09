import type { Metadata } from "next";
import { PageHeader, FlashcardDeck } from "@gerardocordero/prep-kit";
import type { Locale } from "@gerardocordero/prep-kit";
import { getFlashcards, getFlashcardFilters } from "@/lib/locale-data";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "es"
    ? { title: "Tarjetas", description: "Tarjetas de P&R sobre Kotlin, Jetpack Compose, arquitectura Android, inyección de dependencias, rendimiento, testing e IA en el dispositivo — con repetición espaciada en tu navegador." }
    : { title: "Flashcards", description: "Q&A flashcards covering Kotlin, Jetpack Compose, Android architecture, dependency injection, performance, testing, and on-device AI. Reveal, self-grade, and drill what you don't know yet." };
}

export default async function FlashcardsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const cards = getFlashcards(locale as Locale);
  const filters = getFlashcardFilters(locale as Locale);
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={locale === "es" ? "Practica las preguntas" : "Drill the Q&A"}
        title={locale === "es" ? "Preguntas de Android — Tarjetas" : "Android Q&A — Flashcards"}
        lead={locale === "es"
          ? "Toca una tarjeta para revelar la respuesta, luego evalúate. Tus calificaciones se guardan en este navegador con repetición espaciada, para que puedas volver y practicar solo lo que aún necesitas. Filtra por tema o por nivel."
          : "Tap a card to reveal the answer, then grade yourself. Grades are saved in this browser with spaced repetition, so you can come back and drill only what you still need. Filter by topic or by level."}
      />
      <FlashcardDeck cards={cards} filters={filters} />
    </div>
  );
}
