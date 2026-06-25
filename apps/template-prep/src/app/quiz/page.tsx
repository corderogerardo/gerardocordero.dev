import type { Metadata } from "next";
import { PageHeader, Quiz } from "@gerardocordero/prep-kit";
import { ALL_QUIZ, ALL_QUIZ_FILTERS } from "@/data/all";

export const metadata: Metadata = {
  title: "Quiz",
  description:
    "A multiple-choice quiz with instant, explained feedback. Your answers are saved in this browser so you can finish later.",
};

export default function QuizPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Test yourself"
        title="Quiz — Multiple Choice"
        lead="Pick an answer; it instantly marks it right or wrong and explains why. Your answers are saved in this browser, so you can come back and finish."
      />
      <Quiz questions={ALL_QUIZ} filters={ALL_QUIZ_FILTERS} />
    </div>
  );
}
