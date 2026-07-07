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
    ? { title: "Tarjetas", description: "Practica preguntas y respuestas de entrevista como tarjetas con repetición espaciada — tu progreso se guarda en el navegador." }
    : { title: "Flashcards", description: "Interview Q&A flashcards across the App Router, rendering & caching, data fetching, routing, performance, auth, testing, and security. Reveal, self-grade, and drill what you don't know yet." };
}

export default async function FlashcardsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const cards = getFlashcards(locale as Locale);
  const filters = getFlashcardFilters(locale as Locale);
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={locale === "es" ? "Practica las preguntas" : "Drill the Q&A"}
        title={locale === "es" ? "Preguntas de entrevista — Tarjetas" : "Interview Q&A — Flashcards"}
        lead={locale === "es"
          ? "Toca una tarjeta para revelar la respuesta, luego evalúate. Tus calificaciones se guardan en este navegador con repetición espaciada, para que puedas volver y practicar solo lo que aún necesitas. Basado en la documentación oficial de Next.js, la documentación de React y guías de mejores prácticas ampliamente citadas."
          : "Tap a card to reveal the answer, then grade yourself. Your grades are saved in this browser with spaced repetition, so you can come back and drill only what you still need. Sourced from the official Next.js docs, the React docs, and widely-cited best-practice guides."}
      />
      <FlashcardDeck cards={cards} filters={filters} />
    </div>
  );
}
