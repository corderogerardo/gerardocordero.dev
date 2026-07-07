"use client";

import { useMemo, useState } from "react";
import { useCourseStore } from "@/stores/course-context";
import { useI18n } from "@/lib/i18n";
import { choiceOrder } from "@/lib/shuffle";
import { mdInline } from "@/lib/markdown";
import type { QuizStep as QuizStepType } from "@/lib/course-data";

export default function QuizStep({
  step,
  stepKey,
  onProgress,
}: {
  step: QuizStepType;
  stepKey: string;
  onProgress?: () => void;
}) {
  const { t } = useI18n();
  const done = useCourseStore((s) => s.done);
  const setDone = useCourseStore((s) => s.setDone);
  const isDone = !!done[stepKey];
  const [wrongAnswers, setWrongAnswers] = useState<Set<number>>(new Set());

  const order = useMemo(
    () => choiceOrder(step.choices.length, stepKey),
    [step.choices.length, stepKey],
  );

  return (
    <div className={`card step${isDone ? " done" : ""}`}>
      <div className="card-tag">
        <span className="dot"></span>
        <span className="mono-caption">{t("step.quiz.tag")}</span>
      </div>
      <h4 dangerouslySetInnerHTML={{ __html: mdInline(step.q) }} />

      <div className="choices">
        {order.map((ci) => {
          const isWrong = wrongAnswers.has(ci);
          const isCorrect = isDone && ci === step.answer;
          return (
            <button
              key={ci}
              className={`choice${isCorrect ? " correct" : ""}${isWrong ? " wrong" : ""}`}
              disabled={isDone || isWrong}
              onClick={() => {
                if (ci === step.answer) {
                  setDone(stepKey, true);
                  onProgress?.();
                } else {
                  setWrongAnswers((prev) => {
                    const next = new Set(prev);
                    next.add(ci);
                    return next;
                  });
                }
              }}
              dangerouslySetInnerHTML={{ __html: mdInline(step.choices[ci]) }}
            />
          );
        })}
      </div>

      <div>
        {isDone && step.explain && (
          <div
            className="feedback ok"
            dangerouslySetInnerHTML={{ __html: t("step.quiz.correct", { explain: mdInline(step.explain) }) }}
          />
        )}
        {!isDone && wrongAnswers.size > 0 && (
          <div className="feedback bad">
            <span className="fb-label">{t("step.quiz.wrong.title")}</span>
            {mdInline(step.nudge || t("step.quiz.wrong.hint"))}
          </div>
        )}
      </div>
    </div>
  );
}
