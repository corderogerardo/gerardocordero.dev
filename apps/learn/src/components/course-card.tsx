"use client";

// Course / practice card for the home page. Reads the course's storeKey from
// localStorage AFTER hydration (useEffect only — SSR and first client render
// show 0%, so there is no hydration mismatch). Read-only: never writes.

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { ProgressRing } from "@/components/ui/progress-ring";
import { computeCourseProgress, parseStoredProgress } from "@/lib/course-progress";
import type { CourseProgressShape } from "@/lib/course-progress";

interface CourseCardProps {
  href: string;
  title: string;
  emoji: string;
  meta: string;
  /** Present → render a progress ring for this course (null for practice cards). */
  shape?: CourseProgressShape | null;
  /** Course hue ramp id (e.g. "ios", "native"); absent → neutral accent. */
  courseId?: string;
}

export default function CourseCard({ href, title, emoji, meta, shape, courseId }: CourseCardProps) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (!shape) return;
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(shape.storeKey);
    } catch {
      raw = null;
    }
    const { done, reveal } = parseStoredProgress(raw);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate: hydration-safe deferred localStorage read
    setPct(computeCourseProgress(shape, done, reveal).pct);
  }, [shape]);

  const vars = courseId
    ? ({
        "--tint-hsl": `var(--course-${courseId}-hsl)`,
        "--card-soft": `var(--course-${courseId}-soft)`,
        "--card-base": `var(--course-${courseId}-base)`,
        "--card-strong": `var(--course-${courseId}-strong)`,
      } as CSSProperties)
    : undefined;

  return (
    <Link href={href} className="course-card" style={vars}>
      <span className="course-card-head">
        <span className="course-emoji-tile" aria-hidden="true">
          {emoji}
        </span>
        {shape && (
          <ProgressRing pct={pct} hueHsl={`var(--course-${courseId}-hsl)`} />
        )}
      </span>
      <span className="course-card-title">{title}</span>
      <span className="course-meta">{meta}</span>
    </Link>
  );
}
