import Link from "next/link";
import { getSpecs } from "@/lib/andersen-decks";
import { getCourseData } from "@/lib/course-loader";
import { buildCourseProgressShape } from "@/lib/course-progress";
import { CoursesGrid } from "@/components/CoursesGrid";
import { SiteHeader } from "@/components/site-header";
import { HomePageClient } from "@/components/HomePageClient";
import SceneTiles from "@/components/SceneTiles";

const COURSES: { id: string; title: string; emoji: string }[] = [
  { id: "ios", title: "iOS & Swift", emoji: "📱" },
  { id: "android", title: "Android & Kotlin", emoji: "🤖" },
  { id: "ruby", title: "Ruby & Rails", emoji: "💎" },
  { id: "python", title: "Python & FastAPI", emoji: "🐍" },
  { id: "go", title: "Go Backend", emoji: "▲" },
  { id: "node", title: "Node.js & NestJS", emoji: "▲" },
  { id: "native", title: "Native RN & Expo Modules", emoji: "🛰️" },
  { id: "expoui", title: "Rebuild @expo/ui", emoji: "🎛️" },
];

const SCENE_TILES = [
  { emoji: "📱", hue: "var(--course-ios-hsl)" },
  { emoji: "🤖", hue: "var(--course-android-hsl)" },
  { emoji: "💎", hue: "var(--course-ruby-hsl)" },
  { emoji: "🐍", hue: "var(--course-python-hsl)" },
  { emoji: "🐹", hue: "var(--course-go-hsl)" },
];

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
      sceneTiles={SCENE_TILES}
    />
  );
}