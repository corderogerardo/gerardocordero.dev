"use client";

// Course / practice card for the home page. Reads the course's storeKey from
// localStorage AFTER hydration (useEffect only — SSR and first client render
// show 0%, so there is no hydration mismatch). Read-only: never writes.

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ProgressRing } from "@/components/ui/progress-ring";
import { BookOpen } from "lucide-react";
import { computeCourseProgress, parseStoredProgress } from "@/lib/course-progress";
import type { CourseProgressShape } from "@/lib/course-progress";
import { Brain } from "lucide-react";

interface CourseCardProps {
  href: string;
  title: string;
  emoji: string;
  meta: string;
  /** Present → render a progress ring for this course (null for practice cards). */
  shape?: CourseProgressShape | null;
  /** Course hue ramp id (e.g. "ios", "native"); absent → neutral accent. */
  courseId?: string;
  /** Card layout variant. */
  variant?: "horizontal" | "vertical";
}

export default function CourseCard({
  href,
  title,
  emoji,
  meta,
  shape,
  courseId,
  variant = "horizontal",
}: CourseCardProps) {
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
    <Link
      href={href}
      className={cn(
        "rounded-2xl border border-border bg-card p-5 transition-colors hover:shadow-lg hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer",
        variant,
      )}
    >
      <div className="flex flex-col min-w-0">
        {variant === "vertical" ? (
          <>
            <span className="course-card-head vertical flex-1 flex flex-col items-center justify-center gap-2 pt-4 pb-6">
              <BookOpen className="course-emoji-tile h-5 w-5" />
              {shape && (
                <ProgressRing
                  pct={pct}
                  hueHsl={`var(--course-${courseId}-hsl)`} />
              )}
            </span>
            <span className="course-card-body flex-1 px-1">
              <span className="course-card-title text-sm font-medium">{title}</span>
              <span className="course-meta text-xs text-muted-foreground">{meta}</span>
            </span>
          </>
        ) : (
          <>
            <span className="course-card-head flex-shrink-0 w-14 h-14 rounded-lg bg-card/50 flex items-center justify-center">
              <BookOpen className="course-emoji-tile h-5 w-5" />
              {shape && (
                <ProgressRing
                  pct={pct}
                  hueHsl={`var(--course-${courseId}-hsl)`} />
              )}
            </span>
            <span className="flex-1 flex flex-col gap-2 pt-4 pb-6">
              <span className="course-card-title text-sm font-medium">{title}</span>
              <span className="course-meta text-xs text-muted-foreground">{meta}</span>
            </span>
          </>
        )}
      </div>
    </Link>
  );
}