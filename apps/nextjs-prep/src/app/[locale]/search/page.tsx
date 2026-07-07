import type { Metadata } from "next";
import { PageHeader, SearchView, AiTutor } from "@gerardocordero/prep-kit";
import { ALL_FLASHCARDS, ALL_PROMPTS, ALL_QUIZ, ALL_STUDY } from "@/data/all";


export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}


export const metadata: Metadata = {
  title: "Search",
  description:
    "Search every flashcard, prompt, quiz, and study topic by keyword — or enable on-device AI to search by meaning. Plus an on-device AI tutor.",
};

export default async function SearchPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={locale === "es" ? "Busca cualquier cosa · Pregunta cualquier cosa" : "Find anything · ask anything"}
        title={locale === "es" ? "Buscar y Preguntar" : "Search & Ask"}
        lead={locale === "es"
          ? "La búsqueda por palabra clave es instantánea. Activa IA para buscar por significado — un modelo pequeño se ejecuta completamente en tu navegador, nada sale de tu dispositivo. Y pregunta al tutor IA cuando tu navegador lo soporte."
          : "Keyword search is instant. Enable AI to search by meaning — a small model runs fully in your browser, nothing leaves your device. And ask the on-device AI tutor a question when your browser supports it."}
      />
      <SearchView
        flashcards={ALL_FLASHCARDS}
        prompts={ALL_PROMPTS}
        quiz={ALL_QUIZ}
        study={ALL_STUDY}
      />
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">On-device AI tutor</h2>
        <AiTutor />
      </section>
    </div>
  );
}
