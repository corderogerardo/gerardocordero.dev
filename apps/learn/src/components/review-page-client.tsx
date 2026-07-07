"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useCourse, useCourseStore } from "@/stores/course-context";
import { useI18n } from "@/lib/i18n";
import { srsIsDue, srsSchedule, todayEpochDay } from "@/lib/srs";
import { mdInline } from "@/lib/markdown";
import { choiceOrder } from "@/lib/shuffle";
import type { QuizStep, Module, Lesson } from "@/lib/course-data";

interface PoolEntry {
  m: Module;
  l: Lesson;
  i: number;
  key: string;
  step: QuizStep;
}

const REVIEW_SESSION_CAP = 20;

function buildPool(
  modules: Module[],
  done: Record<string, true | "help" | "skip">,
): PoolEntry[] {
  const pool: PoolEntry[] = [];
  for (const m of modules) {
    for (const l of m.lessons) {
      l.steps.forEach((step, i) => {
        if (step.type !== "quiz") return;
        const key = `${m.id}/${l.id}/${i}`;
        if (done[key]) pool.push({ m, l, i, key, step });
      });
    }
  }
  return pool;
}

function dueList(
  pool: PoolEntry[],
  review: Record<string, { reps: number; interval: number; ease: number; due: number }>,
): PoolEntry[] {
  const today = todayEpochDay();
  return pool
    .filter((c) => srsIsDue(review[c.key], today))
    .sort(
      (a, b) =>
        (review[a.key] ? review[a.key].due : -Infinity) -
        (review[b.key] ? review[b.key].due : -Infinity),
    )
    .slice(0, REVIEW_SESSION_CAP);
}

export default function ReviewPageClient() {
  const { course } = useCourse();
  const { t, locale } = useI18n();
  const done = useCourseStore((s) => s.done);
  const review = useCourseStore((s) => s.review);
  const setReview = useCourseStore((s) => s.setReview);

  const pool = useMemo(() => buildPool(course.modules, done), [course.modules, done]);
  const [queue, setQueue] = useState(() => dueList(pool, review));
  const [correct, setCorrect] = useState(0);
  const [seen, setSeen] = useState(0);

  useMemo(() => {
    const validKeys = new Set(pool.map((c) => c.key));
    for (const k of Object.keys(review)) {
      if (!validKeys.has(k)) {
      }
    }
  }, [pool, review]);

  const handleGrade = useCallback(
    (entry: PoolEntry, pass: boolean) => {
      const prev = review[entry.key];
      const scheduled = srsSchedule(prev, pass ? "good" : "again");
      setReview(entry.key, scheduled);
      setSeen((s) => s + 1);
      if (pass) setCorrect((c) => c + 1);
      setQueue((q) => q.slice(1));
    },
    [review, setReview],
  );

  if (!queue.length) {
    return (
      <div className="lesson-wrap review-wrap">
        <h2 className="lesson-title">{t("review.title")}</h2>
        <p className="mono-caption">
          {seen > 0
            ? t("review.seen", { seen, correct })
            : t("review.none")}
        </p>
        <div className="complete-card">
          <div className="big">🐾</div>
          {seen > 0 ? (
            <>
              <h3>{t("review.done", { seen, correct })}</h3>
              <Link href={`/${locale}/learn/${course.id}`} className="btn">
                {t("review.back")}
              </Link>
            </>
          ) : (
            <>
              <h3>{t("review.none")}</h3>
              <p>{t("review.none.body")}</p>
              <Link href={`/${locale}/learn/${course.id}`} className="btn">
                {t("review.back")}
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  const card = queue[0];
  const reps = (review[card.key]?.reps ?? 0);
  const mi = course.modules.indexOf(card.m);

  return (
    <div className="lesson-wrap review-wrap">
      <h2 className="lesson-title">{t("review.title")}</h2>
      <p className="mono-caption">
        {t("review.due.count", { count: queue.length })}
      </p>

      <div className="card step">
        <div className="card-tag">
          <span className="dot"></span>
          <span className="mono-caption">{t("review.tag")}</span>
        </div>
        <p className="mono-caption review-context">
          {t("review.context", { mi: String(mi).padStart(2, "0"), module: card.m.title, lesson: card.l.title })}
        </p>
        <h4 dangerouslySetInnerHTML={{ __html: mdInline(card.step.q) }} />

        <ReviewCardBody
          step={card.step}
          keySeed={card.key + ":" + reps}
          onGrade={(pass) => handleGrade(card, pass)}
        />
      </div>
    </div>
  );
}

function ReviewCardBody({
  step,
  keySeed,
  onGrade,
}: {
  step: QuizStep;
  keySeed: string;
  onGrade: (pass: boolean) => void;
}) {
  const [graded, setGraded] = useState(false);
  const [wrongIdx, setWrongIdx] = useState<number | null>(null);

  const order = useMemo(
    () => choiceOrder(step.choices.length, keySeed),
    [step.choices.length, keySeed],
  );

  const handleChoice = (ci: number) => {
    if (graded) return;
    setGraded(true);
    if (ci === step.answer) {
      onGrade(true);
    } else {
      setWrongIdx(ci);
      onGrade(false);
    }
  };

  return (
    <>
      <div className="choices">
        {order.map((ci) => {
          const isCorrect = graded && ci === step.answer;
          const isWrong = graded && ci === wrongIdx;
          return (
            <button
              key={ci}
              className={`choice${isCorrect ? " correct" : ""}${isWrong ? " wrong" : ""}`}
              disabled={graded}
              onClick={() => handleChoice(ci)}
              dangerouslySetInnerHTML={{ __html: mdInline(step.choices[ci]) }}
            />
          );
        })}
      </div>

      <div>
        {graded && (
          wrongIdx === null
            ? step.explain && (
                <div
                  className="feedback ok"
                  dangerouslySetInnerHTML={{ __html: `✓ Correct. ${mdInline(step.explain)}` }}
                />
              )
            : (
              <div className="feedback bad">
                <span className="fb-label">Not quite</span>
                {mdInline(step.explain || step.nudge || "")}
              </div>
            )
        )}
      </div>
    </>
  );
}
