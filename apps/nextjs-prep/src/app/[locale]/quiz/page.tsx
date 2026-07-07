import type { Metadata } from "next";
import { PageHeader, Quiz } from "@gerardocordero/prep-kit";
import type { Locale } from "@gerardocordero/prep-kit";
import { getQuiz, getQuizFilters } from "@/lib/locale-data";


export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "es"
    ? { title: "Quiz", description: "Un quiz de opción múltiple con retroalimentación instantánea y explicada. Tus respuestas se guardan en este navegador." }
    : { title: "Quiz", description: "A multiple-choice quiz on Next.js and React with instant, explained feedback. Your answers are saved in this browser so you can finish later." };
}

export default async function QuizPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const questions = getQuiz(locale as Locale);
  const filters = getQuizFilters(locale as Locale);
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={locale === "es" ? "Pon a prueba tus conocimientos" : "Test yourself"}
        title={locale === "es" ? "Quiz — Opción Múltiple" : "Quiz — Multiple Choice"}
        lead={locale === "es"
          ? "Elige una respuesta; marca instantáneamente si es correcta o incorrecta y explica por qué. Tus respuestas se guardan en este navegador para que puedas volver y terminar."
          : "Pick an answer; it instantly marks it right or wrong and explains why. Your answers are saved in this browser, so you can come back and finish."}
      />
      <Quiz questions={questions} filters={filters} />
    </div>
  );
}
