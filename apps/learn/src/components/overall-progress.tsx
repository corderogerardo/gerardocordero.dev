"use client";

import Link from "next/link";
import { useCourse, useCourseStore } from "@/stores/course-context";
import { useI18n } from "@/lib/i18n";
import { srsIsDue, todayEpochDay, type SrsEntry } from "@/lib/srs";

function reviewDueCount(review: Record<string, SrsEntry>): number {
  const today = todayEpochDay();
  return Object.values(review).filter((e) => srsIsDue(e, today)).length;
}

export default function OverallProgress() {
  const { course } = useCourse();
  const { t, locale } = useI18n();
  const done = useCourseStore((s) => s.done);
  const reveal = useCourseStore((s) => s.reveal);
  const review = useCourseStore((s) => s.review);

  let total = 0;
  let complete = 0;
  for (const m of course.modules) {
    for (const l of m.lessons) {
      const lid = `${m.id}/${l.id}`;
      const r = reveal[lid] ?? 1;
      total += l.steps.length;
      if (r >= l.steps.length && l.steps.every((s, i) => {
        if (s.type !== "quiz" && s.type !== "exercise" && s.type !== "xcode") return true;
        return !!done[`${lid}/${i}`];
      })) complete += l.steps.length;
    }
  }

  const pct = total ? Math.round((complete / total) * 100) : 0;
  const dueN = reviewDueCount(review);

  return (
    <>
      <div className="overall">
        <div id="overall-fill" style={{ width: `${pct}%` }} />
        <span id="overall-label">{pct}%</span>
      </div>
      <div className="overall-links">
        <Link href={`/${locale}/learn/${course.id}`} className="mono-caption">{t("overall.map")}</Link>
        <Link
          href={`/${locale}/learn/${course.id}/review`}
          className="mono-caption review-badge"
          style={{ display: dueN ? "" : "none" }}
        >
          {t("overall.review.due", { count: dueN })}
        </Link>
      </div>
    </>
  );
}
