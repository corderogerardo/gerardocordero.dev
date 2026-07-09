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
    ? { title: "Tarjetas", description: "Tarjetas de preguntas de entrevista sobre NestJS core, DI, el ciclo de vida de la petición, datos, auth, microservicios, GraphQL, internals de Node.js y rendimiento." }
    : { title: "Flashcards", description: "Interview Q&A flashcards across NestJS core, DI, the request lifecycle, data, auth, microservices, GraphQL, Node.js internals, performance, and testing. Reveal, self-grade, and drill what you don't know yet." };
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
          ? "Toca una tarjeta para revelar la respuesta, luego evalúate. Tus calificaciones se guardan en este navegador, para que puedas volver y practicar solo las que aún necesitas. Basado en la documentación oficial de NestJS, la documentación de la API de Node.js y guías de mejores prácticas ampliamente citadas."
          : "Tap a card to reveal the answer, then grade yourself. Your grades are saved in this browser, so you can come back and drill only the ones you still need. Sourced from the official NestJS docs, the Node.js API docs, and widely-cited best-practice guides."}
      />
      <FlashcardDeck cards={cards} filters={filters} />
    </div>
  );
}
