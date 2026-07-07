import { notFound } from "next/navigation";
import { getCourseData } from "@/lib/course-loader";
import LearnShell from "@/components/learn-shell";
import ErrorBoundary from "@/components/error-boundary";
import type { ReactNode } from "react";
import { LOCALES, COURSE_IDS } from "@/lib/i18n-config";

export function generateStaticParams() {
  const params: { locale: string; course: string }[] = [];
  for (const l of LOCALES) {
    for (const c of COURSE_IDS) {
      params.push({ locale: l.id, course: c });
    }
  }
  return params;
}

export default async function CourseLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string; course: string }>;
}) {
  const { locale, course: courseId } = await params;
  const course = getCourseData(courseId, locale);
  if (!course) notFound();

  return (
    <ErrorBoundary>
      <LearnShell course={course} locale={locale}>
        {children}
      </LearnShell>
    </ErrorBoundary>
  );
}
