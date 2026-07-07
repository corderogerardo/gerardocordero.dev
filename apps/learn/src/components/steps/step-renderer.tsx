"use client";

import type { Step, LangId } from "@/lib/course-data";
import { useI18n } from "@/lib/i18n";
import TextStep from "@/components/steps/text-step";
import CodeStep from "@/components/steps/code-step";
import QuizStep from "@/components/steps/quiz-step";
import ExerciseStep from "@/components/steps/exercise-step";
import XcodeStep from "@/components/steps/xcode-step";

export function StepRenderer({
  step,
  mId,
  lId,
  i,
  onProgress,
}: {
  step: Step;
  mId: string;
  lId: string;
  i: number;
  onProgress?: () => void;
}) {
  const { t } = useI18n();
  const stepKey = `${mId}/${lId}/${i}`;

  switch (step.type) {
    case "text":
      return <TextStep step={step} />;
    case "code":
      return <CodeStep step={step} />;
    case "quiz":
      return <QuizStep step={step} stepKey={stepKey} onProgress={onProgress} />;
    case "exercise":
      return <ExerciseStep step={step} stepKey={stepKey} onProgress={onProgress} />;
    case "xcode":
      return <XcodeStep step={step} stepKey={stepKey} onProgress={onProgress} />;
    default:
      return (
        <div className="step">
          <p>{t("step.unknown", { type: (step as { type: string }).type })}</p>
        </div>
      );
  }
}
