import type { Metadata } from "next";
import { PageHeader } from "@gerardocordero/prep-kit";
import { Quiz } from "@gerardocordero/prep-kit";
import { ALL_QUIZ, ALL_QUIZ_FILTERS } from "@/data/all";


export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}


const questions = ALL_QUIZ;
const filters = ALL_QUIZ_FILTERS;

export const metadata: Metadata = {
  title: "Quiz",
  description:
    "A multiple-choice quiz on Next.js and React with instant, explained feedback. Your answers are saved in this browser so you can finish later.",
};

export default async function QuizPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Test yourself"
        title="Quiz — Multiple Choice"
        lead="Pick an answer; it instantly marks it right or wrong and explains why. Your answers are saved in this browser, so you can come back and finish."
      />
      <Quiz questions={questions} filters={filters} />
    </div>
  );
}
