import Link from "next/link";
import { getSpecs } from "@/lib/andersen-decks";
import { getCourseData } from "@/lib/course-loader";
import { buildCourseProgressShape } from "@/lib/course-progress";
import { COURSES } from "@/lib/i18n-config";
import { CoursesGrid } from "@/components/CoursesGrid";
import { SiteHeader } from "@/components/site-header";
import { HomePageClient } from "@/components/HomePageClient";

export default async function HomePage() {
  const locale = "en";

  const courses = COURSES.map((c) => {
    const data = getCourseData(c.id, locale);
    const lessons = data
      ? data.modules.reduce((n, m) => n + m.lessons.length, 0)
      : 0;
    const modules = data ? data.modules.length : 0;
    return {
      ...c,
      lessons,
      modules,
      shape: data ? buildCourseProgressShape(data) : null,
    };
  });
  const specs = getSpecs();
  const totalLessons = courses.reduce((n, c) => n + c.lessons, 0);

  return (
    <HomePageClient
      locale={locale}
      courses={courses}
      specs={specs}
      totalLessons={totalLessons}
    />
  );
}