import type { Metadata } from "next";
import { PageHeader } from "@gerardocordero/prep-kit";
import { Quiz } from "@gerardocordero/prep-kit";
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
import { ADVANCED17_QUIZ, ADVANCED17_QUIZ_FILTERS } from "@/data/advanced17";
import { ADVANCED18_QUIZ, ADVANCED18_QUIZ_FILTERS } from "@/data/advanced18";
import { ADVANCED19_QUIZ, ADVANCED19_QUIZ_FILTERS } from "@/data/advanced19";
import { ADVANCED20_QUIZ, ADVANCED20_QUIZ_FILTERS } from "@/data/advanced20";
import { ADVANCED21_QUIZ, ADVANCED21_QUIZ_FILTERS } from "@/data/advanced21";
import { ADVANCED22_QUIZ, ADVANCED22_QUIZ_FILTERS } from "@/data/advanced22";
import { ADVANCED23_QUIZ, ADVANCED23_QUIZ_FILTERS } from "@/data/advanced23";
import { ADVANCED24_QUIZ, ADVANCED24_QUIZ_FILTERS } from "@/data/advanced24";
import { ADVANCED25_QUIZ, ADVANCED25_QUIZ_FILTERS } from "@/data/advanced25";
import { ADVANCED26_QUIZ, ADVANCED26_QUIZ_FILTERS } from "@/data/advanced26";
import { ADVANCED27_QUIZ, ADVANCED27_QUIZ_FILTERS } from "@/data/advanced27";
import { ADVANCED28_QUIZ, ADVANCED28_QUIZ_FILTERS } from "@/data/advanced28";
import { ADVANCED29_QUIZ, ADVANCED29_QUIZ_FILTERS } from "@/data/advanced29";
import { ADVANCED30_QUIZ, ADVANCED30_QUIZ_FILTERS } from "@/data/advanced30";
import { ADVANCED31_QUIZ, ADVANCED31_QUIZ_FILTERS } from "@/data/advanced31";
import { ADVANCED32_QUIZ, ADVANCED32_QUIZ_FILTERS } from "@/data/advanced32";
import { ADVANCED33_QUIZ, ADVANCED33_QUIZ_FILTERS } from "@/data/advanced33";

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
  ...ADVANCED17_QUIZ,
  ...ADVANCED18_QUIZ,
  ...ADVANCED19_QUIZ,
  ...ADVANCED20_QUIZ,
  ...ADVANCED21_QUIZ,
  ...ADVANCED22_QUIZ,
  ...ADVANCED23_QUIZ,
  ...ADVANCED24_QUIZ,
  ...ADVANCED25_QUIZ,
  ...ADVANCED26_QUIZ,
  ...ADVANCED27_QUIZ,
  ...ADVANCED28_QUIZ,
  ...ADVANCED29_QUIZ,
  ...ADVANCED30_QUIZ,
  ...ADVANCED31_QUIZ,
  ...ADVANCED32_QUIZ,
  ...ADVANCED33_QUIZ,
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
  ...ADVANCED17_QUIZ_FILTERS,
  ...ADVANCED18_QUIZ_FILTERS,
  ...ADVANCED19_QUIZ_FILTERS,
  ...ADVANCED20_QUIZ_FILTERS,
  ...ADVANCED21_QUIZ_FILTERS,
  ...ADVANCED22_QUIZ_FILTERS,
  ...ADVANCED23_QUIZ_FILTERS,
  ...ADVANCED24_QUIZ_FILTERS,
  ...ADVANCED25_QUIZ_FILTERS,
  ...ADVANCED26_QUIZ_FILTERS,
  ...ADVANCED27_QUIZ_FILTERS,
  ...ADVANCED28_QUIZ_FILTERS,
  ...ADVANCED29_QUIZ_FILTERS,
  ...ADVANCED30_QUIZ_FILTERS,
  ...ADVANCED31_QUIZ_FILTERS,
  ...ADVANCED32_QUIZ_FILTERS,
  ...ADVANCED33_QUIZ_FILTERS,
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
