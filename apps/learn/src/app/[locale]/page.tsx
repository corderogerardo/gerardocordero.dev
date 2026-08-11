import Link from "next/link";
import type { CSSProperties } from "react";
import { LOCALES } from "@/lib/i18n-config";
import i18nEn from "@public/data/i18n/en.json";
import i18nEs from "@public/data/i18n/es.json";
import { getSpecs } from "@/lib/andersen-decks";
import { getCourseData } from "@/lib/course-loader";
import { buildCourseProgressShape } from "@/lib/course-progress";
import CourseCard from "@/components/course-card";
import { CoursesGrid } from "@/components/CoursesGrid";
import SceneTiles from "@/components/SceneTiles";

// Locale dictionaries
const EN = i18nEn;
const ES = i18nEs;

// Translate a key to the given locale, with {count} placeholder support
function translate(key: keyof typeof EN, locale: string, count?: number): string {
  const dictionary = locale === "es" ? ES : EN;
  const text = dictionary[key];
  if (!text) return key;
  if (locale === "es" && key === "progress_stored" && count !== undefined) {
    return text.replace("{count}", count.toString());
  }
  return text;
}

const COURSES: { id: string; title: string; emoji: string }[] = [
  { id: "ios",     title: "iOS & Swift",      emoji: "📱" },
  { id: "android", title: "Android & Kotlin",  emoji: "🤖" },
  { id: "ruby",    title: "Ruby & Rails",      emoji: "💎" },
  { id: "python",  title: "Python & FastAPI",  emoji: "🐍" },
  { id: "go",      title: "Go Backend",        emoji: "🐹" },
  { id: "native",  title: "Native RN & Expo Modules", emoji: "🛰️" },
  { id: "expoui",  title: "Rebuild @expo/ui",         emoji: "🎛️" },
];

const SCENE_TILES = [
  { emoji: "📱", hue: "var(--course-ios-hsl)" },
  { emoji: "🤖", hue: "var(--course-android-hsl)" },
  { emoji: "💎", hue: "var(--course-ruby-hsl)" },
  { emoji: "🐍", hue: "var(--course-python-hsl)" },
  { emoji: "🐹", hue: "var(--course-go-hsl)" },
];

export function generateStaticParams() {
  return LOCALES.map((l) => ({ locale: l.id }));
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

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

  // Convenience: localized string with optional count placeholder
  const t = (key: keyof typeof EN, locale: string, count?: number) =>
    translate(key, locale, count);

  return (
    <div className="course-picker">
      <p className="course-eyebrow" aria-hidden="true">
        {t("homepage_headline", locale)}
      </p>

      <header className="course-hero">
        <div className="hero-copy">
          <h1 className="hero-headline">
            {t("homepage_headline", locale)}
          </h1>
          <p className="hero-subcopy">
            {t("homepage_subtitle", locale)}
          </p>
          <div className="hero-actions">
            <Link
              href={`/${locale}/learn/ios`}
              className="hero-chip"
              style={{ "--chip-hue": "var(--course-ios-hsl)" } as CSSProperties}
            >
              {t("cta_start_ios", locale)}
            </Link>
            <Link href="/reactnative" className="hero-chip ghost-chip">
              🧠 {t("cta_rn_practice", locale)}
            </Link>
          </div>
        </div>
        <SceneTiles tiles={SCENE_TILES} />
      </header>

      <div className="stats-strip" aria-label={t("section_label", locale)}>
        <div className="stat">
          <span className="stat-num">{totalLessons}</span>
          <span className="stat-label">{t("lessons_label", locale)}</span>
        </div>
        <div className="stat">
          <span className="stat-num">{courses.length}</span>
          <span className="stat-label">{t("modules_label", locale)}</span>
        </div>
        <div className="stat">
          <span className="stat-num">{specs.length + 1}</span>
          <span className="stat-label">decks</span>
        </div>
      </div>

      <CoursesGrid
        courses={courses}
        specs={specs}
        locale={locale}
        totalLessons={totalLessons}
      />

      <p className="picker-note">
        <span aria-hidden="true">🔒</span>
        <span>
          {t("progress_stored", locale, totalLessons)}
        </span>
      </p>
    </div>
  );
}