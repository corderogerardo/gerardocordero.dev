import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { Quiz } from "@/components/quiz";
import { QUIZ, QUIZ_FILTERS } from "@/data/quiz";
import { ADVANCED_QUIZ, ADVANCED_QUIZ_FILTERS } from "@/data/advanced";
import { ADVANCED2_QUIZ, ADVANCED2_QUIZ_FILTERS } from "@/data/advanced2";
import { ADVANCED3_QUIZ, ADVANCED3_QUIZ_FILTERS } from "@/data/advanced3";
import { ADVANCED4_QUIZ, ADVANCED4_QUIZ_FILTERS } from "@/data/advanced4";
import { ADVANCED5_QUIZ, ADVANCED5_QUIZ_FILTERS } from "@/data/advanced5";
import { ADVANCED6_QUIZ, ADVANCED6_QUIZ_FILTERS } from "@/data/advanced6";
import { ADVANCED7_QUIZ, ADVANCED7_QUIZ_FILTERS } from "@/data/advanced7";
import { ADVANCED8_QUIZ, ADVANCED8_QUIZ_FILTERS } from "@/data/advanced8";
import { ADVANCED9_QUIZ, ADVANCED9_QUIZ_FILTERS } from "@/data/advanced9";
import { ADVANCED10_QUIZ, ADVANCED10_QUIZ_FILTERS } from "@/data/advanced10";
import { ADVANCED11_QUIZ, ADVANCED11_QUIZ_FILTERS } from "@/data/advanced11";
import { ADVANCED12_QUIZ, ADVANCED12_QUIZ_FILTERS } from "@/data/advanced12";
import { ADVANCED13_QUIZ, ADVANCED13_QUIZ_FILTERS } from "@/data/advanced13";
import { ADVANCED14_QUIZ, ADVANCED14_QUIZ_FILTERS } from "@/data/advanced14";
import { ADVANCED15_QUIZ, ADVANCED15_QUIZ_FILTERS } from "@/data/advanced15";
import { ADVANCED16_QUIZ, ADVANCED16_QUIZ_FILTERS } from "@/data/advanced16";

const questions = [
  ...QUIZ,
  ...ADVANCED_QUIZ,
  ...ADVANCED2_QUIZ,
  ...ADVANCED3_QUIZ,
  ...ADVANCED4_QUIZ,
  ...ADVANCED5_QUIZ,
  ...ADVANCED6_QUIZ,
  ...ADVANCED7_QUIZ,
  ...ADVANCED8_QUIZ,
  ...ADVANCED9_QUIZ,
  ...ADVANCED10_QUIZ,
  ...ADVANCED11_QUIZ,
  ...ADVANCED12_QUIZ,
  ...ADVANCED13_QUIZ,
  ...ADVANCED14_QUIZ,
  ...ADVANCED15_QUIZ,
  ...ADVANCED16_QUIZ,
];
const filters = [
  ...QUIZ_FILTERS,
  ...ADVANCED_QUIZ_FILTERS,
  ...ADVANCED2_QUIZ_FILTERS,
  ...ADVANCED3_QUIZ_FILTERS,
  ...ADVANCED4_QUIZ_FILTERS,
  ...ADVANCED5_QUIZ_FILTERS,
  ...ADVANCED6_QUIZ_FILTERS,
  ...ADVANCED7_QUIZ_FILTERS,
  ...ADVANCED8_QUIZ_FILTERS,
  ...ADVANCED9_QUIZ_FILTERS,
  ...ADVANCED10_QUIZ_FILTERS,
  ...ADVANCED11_QUIZ_FILTERS,
  ...ADVANCED12_QUIZ_FILTERS,
  ...ADVANCED13_QUIZ_FILTERS,
  ...ADVANCED14_QUIZ_FILTERS,
  ...ADVANCED15_QUIZ_FILTERS,
  ...ADVANCED16_QUIZ_FILTERS,
];

export const metadata: Metadata = {
  title: "Quiz",
  description:
    "A multiple-choice iOS quiz with instant, explained feedback. Your answers are saved in this browser so you can finish later.",
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
