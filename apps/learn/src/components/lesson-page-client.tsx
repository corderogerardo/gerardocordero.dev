"use client";

import { useCallback, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import { useCourse, useCourseStore } from "@/stores/course-context";
import { useI18n } from "@/lib/i18n";
import { StepRenderer } from "@/components/steps/step-renderer";
import type { Lesson, Module } from "@/lib/course-data";

function findLesson(
  modules: Module[],
  moduleId: string,
  lessonId: string,
): { m: Module; l: Lesson; mi: number; li: number } | null {
  for (let mi = 0; mi < modules.length; mi++) {
    const m = modules[mi];
    if (m.id !== moduleId) continue;
    for (let li = 0; li < m.lessons.length; li++) {
      const l = m.lessons[li];
      if (l.id === lessonId) return { m, l, mi, li };
    }
  }
  return null;
}

function isGated(step: { type: string }): boolean {
  return step.type === "quiz" || step.type === "exercise" || step.type === "xcode";
}

function isStepDone(
  mId: string,
  lId: string,
  i: number,
  step: { type: string },
  done: Record<string, true | "help" | "skip">,
): boolean {
  if (!isGated(step)) return true;
  return !!done[`${mId}/${lId}/${i}`];
}

function lessonCompleteInternal(
  mId: string,
  lId: string,
  lesson: Lesson,
  reveal: Record<string, number>,
  done: Record<string, true | "help" | "skip">,
): boolean {
  const r = reveal[`${mId}/${lId}`] ?? 1;
  return (
    r >= lesson.steps.length &&
    lesson.steps.every((s, i) => isStepDone(mId, lId, i, s, done))
  );
}

export default function LessonPageClient() {
  const params = useParams();
  const { course } = useCourse();
  const { t } = useI18n();
  const reveal = useCourseStore((s) => s.reveal);
  const done = useCourseStore((s) => s.done);
  const setReveal = useCourseStore((s) => s.setReveal);
  const scrollRef = useRef<HTMLDivElement>(null);

  const locale = (params.locale as string) || "en";
  const moduleId = params.module as string;
  const lessonId = params.lesson as string;

  const found = useMemo(
    () => findLesson(course.modules, moduleId, lessonId),
    [course.modules, moduleId, lessonId],
  );

  const revealed = useMemo(() => {
    if (!found) return 0;
    return Math.max(1, Math.min(reveal[`${found.m.id}/${found.l.id}`] ?? 1, found.l.steps.length));
  }, [found, reveal]);

  const handleContinue = useCallback(() => {
    if (!found) return;
    const key = `${found.m.id}/${found.l.id}`;
    const nextReveal = Math.min(
      (reveal[key] ?? 1) + 1,
      found.l.steps.length,
    );
    setReveal(key, nextReveal);
  }, [found, reveal, setReveal]);

  if (found && !reveal[`${found.m.id}/${found.l.id}`]) {
    setReveal(`${found.m.id}/${found.l.id}`, 1);
  }

  if (!found) {
    return <p>{t("lesson.notfound")}</p>;
  }

  const { m, l, mi, li } = found;
  const lid = `${m.id}/${l.id}`;
  const isComplete = lessonCompleteInternal(m.id, l.id, l, reveal, done);
  const lastIdx = revealed - 1;
  const lastStep = l.steps[lastIdx];
  const blocked = lastStep && isGated(lastStep) && !isStepDone(m.id, l.id, lastIdx, lastStep, done);
  const allRevealed = revealed >= l.steps.length;

  const handleStepProgress = useCallback(() => {
  }, []);

  return (
    <div className="lesson-wrap" ref={scrollRef}>
      <div className="crumb-row">
        <div className="crumbs mono-caption">
          {t("lesson.crumbs", {
            mi: String(mi).padStart(2, "0"),
            module: m.title,
            li: li + 1,
            total: m.lessons.length,
            est: Math.max(2, Math.round(l.steps.length * 1.5)),
          })}
        </div>
      </div>

      <h2 className="lesson-title">{l.title}</h2>

      {l.steps.slice(0, revealed).map((step, i) => (
        <StepRenderer
          key={i}
          step={step}
          mId={m.id}
          lId={l.id}
          i={i}
          onProgress={handleStepProgress}
        />
      ))}

      {!isComplete && (
        <div className="continue-row" style={{ display: allRevealed && !blocked ? "none" : "" }}>
          <button className="btn" disabled={blocked} onClick={handleContinue}>
            {t("lesson.continue")}
          </button>
          {blocked && (
            <span className="hintline">{t("lesson.blocked")}</span>
          )}
        </div>
      )}

      <div id="complete-slot">
        {isComplete && (
          <div className="complete-card">
            <div className="big">🐾</div>
            <h3>{t("lesson.complete.title", { title: l.title })}</h3>
            <p>{t("lesson.complete.body")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
