import type { Metadata } from "next";
import { PageHeader } from "@gerardocordero/prep-kit";
import { Quiz } from "@gerardocordero/prep-kit";
import { QUIZ, QUIZ_FILTERS } from "@/data/quiz";
import { ADVANCED_QUIZ, ADVANCED_QUIZ_FILTERS } from "@/data/advanced";
import { ADVANCED2_QUIZ, ADVANCED2_QUIZ_FILTERS } from "@/data/advanced2";
import { ADVANCED3_QUIZ, ADVANCED3_QUIZ_FILTERS } from "@/data/advanced3";
import { ADVANCED4_QUIZ, ADVANCED4_QUIZ_FILTERS } from "@/data/advanced4";
import { ADVANCED5_QUIZ, ADVANCED5_QUIZ_FILTERS } from "@/data/advanced5";

const questions = [
  ...QUIZ,
  ...ADVANCED_QUIZ,
  ...ADVANCED2_QUIZ,
  ...ADVANCED3_QUIZ,
  ...ADVANCED4_QUIZ,
  ...ADVANCED5_QUIZ,
];
const filters = [
  ...QUIZ_FILTERS,
  ...ADVANCED_QUIZ_FILTERS,
  ...ADVANCED2_QUIZ_FILTERS,
  ...ADVANCED3_QUIZ_FILTERS,
  ...ADVANCED4_QUIZ_FILTERS,
  ...ADVANCED5_QUIZ_FILTERS,
];

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
      <Quiz questions={questions} filters={filters} />
    </div>
  );
}
