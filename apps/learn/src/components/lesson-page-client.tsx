"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCourse, useCourseStore } from "@/stores/course-context";
import { useI18n } from "@/lib/i18n";
import { StepRenderer } from "@/components/steps/step-renderer";
import { isGated, isStepDone, lessonCompleteInternal } from "@/lib/course-progress";
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

function LessonNotFound({ locale }: { locale: string }) {
  return (
    <div className="lesson-wrap" role="status">
      <div className="text-center py-12">
        <div className="text-6xl mb-4" aria-hidden="true">🔍</div>
        <h2 className="text-2xl font-semibold mb-2">
          {locale === "es" ? "Lección no encontrada" : "Lesson not found"}
        </h2>
        <p className="text-muted mb-6">
          {locale === "es"
            ? "Esta lección no existe o ha sido movida."
            : "This lesson doesn't exist or has been moved."}
        </p>
        <Link href={`/${locale}/learn/${locale}`} className="btn">
          {locale === "es" ? "Volver al inicio" : "Back to courses"}
        </Link>
      </div>
    </div>
  );
}

export default function LessonPageClient() {
  const params = useParams();
  const { course } = useCourse();
  const { t, locale } = useI18n();
  const reveal = useCourseStore((s) => s.reveal);
  const done = useCourseStore((s) => s.done);
  const setReveal = useCourseStore((s) => s.setReveal);
  const scrollRef = useRef<HTMLDivElement>(null);

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
    // Scroll to top of new step
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [found, reveal, setReveal]);

  const handleStepProgress = useCallback(() => {
  }, []);

  // Initialize the reveal count as a side effect, not during render — mutating
  // the store while rendering triggers React's "cannot update a component while
  // rendering a different component" (OverallProgress subscribes to the store).
  useEffect(() => {
    if (found && !reveal[`${found.m.id}/${found.l.id}`]) {
      setReveal(`${found.m.id}/${found.l.id}`, 1);
    }
  }, [found, reveal, setReveal]);

  if (!found) {
    return <LessonNotFound locale={locale} />;
  }

  const { m, l, mi, li } = found;
  const isComplete = lessonCompleteInternal(m.id, l.id, l, reveal, done);
  const lastIdx = revealed - 1;
  const lastStep = l.steps[lastIdx];
  const blocked = lastStep && isGated(lastStep) && !isStepDone(m.id, l.id, lastIdx, lastStep, done);
  const allRevealed = revealed >= l.steps.length;

  return (
    <div className="lesson-wrap" ref={scrollRef}>
      <nav aria-label="Lesson progress" className="crumb-row">
        <div className="crumbs mono-caption" aria-live="polite">
          {t("lesson.crumbs", {
            mi: String(mi).padStart(2, "0"),
            module: m.title,
            li: li + 1,
            total: m.lessons.length,
            est: Math.max(2, Math.round(l.steps.length * 1.5)),
          })}
        </div>
      </nav>

      <h1 className="lesson-title">{l.title}</h1>

      <section aria-label="Lesson content" aria-live="polite">
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
      </section>

      {!isComplete && (
        <div className="continue-row" style={{ display: allRevealed && !blocked ? "none" : "" }}>
          <button
            className="btn"
            disabled={blocked}
            onClick={handleContinue}
            aria-busy={false}
            aria-disabled={blocked}
          >
            {t("lesson.continue")}
          </button>
          {blocked && (
            <span className="hintline" role="alert" aria-live="polite">
              {t("lesson.blocked")}
            </span>
          )}
        </div>
      )}

      <div id="complete-slot">
        {isComplete && (
          <div className="complete-card" role="status" aria-live="polite">
            <div className="big" aria-hidden="true">🐾</div>
            <h2>{t("lesson.complete.title", { title: l.title })}</h2>
            <p>{t("lesson.complete.body")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
