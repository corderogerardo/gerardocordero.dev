import Link from "next/link";
import { cn } from "@/lib/utils";
import CourseCard from "./course-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain } from "lucide-react";
import type { AndersenSpec } from '@/lib/andersen-decks';

interface CourseGridProps {
  courses: {
    id: string;
    title: string;
    emoji: string;
    lessons?: number;
    modules?: number;
    shape?: import("@/lib/course-progress").CourseProgressShape | null;
  }[];
  specs: AndersenSpec[];
  locale: string;
  totalLessons: number;
}

export function CoursesGrid({ courses, specs, locale, totalLessons }: CourseGridProps) {
  return (
    <div className="space-y-6">
      <h2 className="picker-section-label">
        {locale === "es" ? "Cursos" : "Courses"}
        <span className="count">{courses.length}</span>
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {courses.map((c) => (
          <CourseCard
            key={c.id}
            href={`/${locale}/learn/${c.id}`}
            title={c.title}
            emoji={c.emoji}
            meta={`${c.lessons} lessons · ${c.modules} modules`}
            shape={c.shape}
            courseId={c.id}
          />
        ))}
      </div>

      <h2 className="picker-section-label">
        {locale === "es" ? "Práctica" : "Practice"}
        <span className="count">{specs.length + 1}</span>
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {/* Not a lesson course — the senior-RN practice app (flashcards + coding
          challenges) lives at its own /reactnative route, not /learn/<id>. */}
        <Link
          href="/practice/reactnative"
          className={cn(
            "rounded-xl border border-border bg-surface p-4 flex flex-col items-start gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            "cursor-pointer",
          )}
        >
          <Brain className="h-4 w-4 course-emoji" />
          <span className="course-title">
            {locale === "es" ? "Práctica RN (senior)" : "RN Interview Practice"}
          </span>
          <span className="course-meta">
            {locale === "es" ? "Flashcards + retos de código" : "Flashcards + coding challenges"}
          </span>
        </Link>
        {/* Per-specialization interview decks generated from the Andersen matrix. */}
        {specs.map((s) => (
          <Link
            key={s.slug}
            href={`/practice/${s.slug}`}
            className={cn(
              "rounded-xl border border-border bg-surface p-4 flex flex-col items-start gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              "cursor-pointer",
            )}
          >
            <Brain className="h-4 w-4 course-emoji" />
            <span className="course-title">
              {s.title} {locale === "es" ? "(práctica)" : "Practice"}
            </span>
            <span className="course-meta">
              {locale === "es" ? "Baraja de entrevista" : "Interview deck"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
