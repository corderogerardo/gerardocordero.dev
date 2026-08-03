"use client";

import Link from "next/link";
import { useCourse, useCourseStore } from "@/stores/course-context";
import { useI18n } from "@/lib/i18n";
import { srsIsDue, todayEpochDay, type SrsEntry } from "@/lib/srs";

interface ProgressStats {
  total: number;
  complete: number;
  pct: number;
  dueCount: number;
}

function computeProgressStats(
  course: { modules: Array<{ id: string; lessons: Array<{ id: string; steps: Array<{ type: string }> }> }> },
  reveal: Record<string, number>,
  done: Record<string, true | "help" | "skip">,
  review: Record<string, SrsEntry>,
): ProgressStats {
  let total = 0;
  let complete = 0;
  for (const m of course.modules) {
    for (const l of m.lessons) {
      const lid = `${m.id}/${l.id}`;
      const r = reveal[lid] ?? 1;
      total += l.steps.length;
      if (
        r >= l.steps.length &&
        l.steps.every((s, i) => {
          if (s.type !== "quiz" && s.type !== "exercise" && s.type !== "xcode") return true;
          return !!done[`${lid}/${i}`];
        })
      ) {
        complete += l.steps.length;
      }
    }
  }

  const pct = total ? Math.round((complete / total) * 100) : 0;
  const today = todayEpochDay();
  const dueCount = Object.values(review).filter((e) => srsIsDue(e, today)).length;

  return { total, complete, pct, dueCount };
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="overall" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Course progress">
      <div id="overall-fill" style={{ width: `${pct}%` }} />
      <span id="overall-label">{pct}%</span>
    </div>
  );
}

function ProgressLinks({ locale, courseId, dueCount, t }: { locale: string; courseId: string; dueCount: number; t: (key: string, params?: Record<string, string | number>) => string }) {
  return (
    <div className="overall-links">
      <Link href={`/${locale}/learn/${courseId}`} className="mono-caption">
        {t("overall.map")}
      </Link>
      {dueCount > 0 && (
        <Link
          href={`/${locale}/learn/${courseId}/review`}
          className="mono-caption review-badge"
        >
          {t("overall.review.due", { count: dueCount })}
        </Link>
      )}
    </div>
  );
}

export default function OverallProgress() {
  const { course } = useCourse();
  const { t, locale } = useI18n();
  const done = useCourseStore((s) => s.done);
  const reveal = useCourseStore((s) => s.reveal);
  const review = useCourseStore((s) => s.review);

  const { pct, dueCount } = computeProgressStats(course, reveal, done, review);

  return (
    <>
      <ProgressBar pct={pct} />
      <ProgressLinks locale={locale} courseId={course.id} dueCount={dueCount} t={t} />
    </>
  );
}
