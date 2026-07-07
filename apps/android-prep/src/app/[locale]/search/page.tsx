import type { Metadata } from "next";
import { PageHeader, SearchView, AiTutor } from "@gerardocordero/prep-kit";
import type { Locale } from "@gerardocordero/prep-kit";
import { getFlashcards, getPrompts, getQuiz, getStudySections } from "@/lib/locale-data";


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
        eyebrow="Find anything · ask anything"
        title="Search & Ask"
        lead="Keyword search is instant. Enable AI to search by meaning — a small model runs fully in your browser, nothing leaves your device. And ask the on-device AI tutor a question when your browser supports it."
      />
      <SearchView
        flashcards={getFlashcards(locale as Locale)}
        prompts={getPrompts(locale as Locale)}
        quiz={getQuiz(locale as Locale)}
        study={getStudySections(locale as Locale)}
      />
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">On-device AI tutor</h2>
        <AiTutor />
      </section>
    </div>
  );
}
