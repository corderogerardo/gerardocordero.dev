import { getCourseData } from "@/lib/course-loader";
import LessonPageClient from "@/components/lesson-page-client";
import { LOCALES, COURSE_IDS } from "@/lib/i18n-config";

export function generateStaticParams() {
  const params: { locale: string; course: string; module: string; lesson: string }[] = [];

  for (const l of LOCALES) {
    for (const courseId of COURSE_IDS) {
      const course = getCourseData(courseId, l.id);
      if (!course) continue;
      for (const m of course.modules) {
        for (const lesson of m.lessons) {
          params.push({ locale: l.id, course: courseId, module: m.id, lesson: lesson.id });
        }
      }
    }
  }

  return params;
}

export default function LessonPage() {
  return <LessonPageClient />;
}
