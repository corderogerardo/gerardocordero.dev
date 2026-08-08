import Link from "next/link";
import type { CSSProperties } from "react";
import { LOCALES } from "@/lib/i18n-config";
import { getSpecs } from "@/lib/andersen-decks";
import { getCourseData } from "@/lib/course-loader";

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
  const es = locale === "es";

  const courses = COURSES.map((c) => {
    const data = getCourseData(c.id, locale);
    const lessons = data
      ? data.modules.reduce((n, m) => n + m.lessons.length, 0)
      : 0;
    const modules = data ? data.modules.length : 0;
    return { ...c, lessons, modules };
  });
  const specs = getSpecs();
  const totalLessons = courses.reduce((n, c) => n + c.lessons, 0);

  return (
    <div className="course-picker">
      <p className="course-eyebrow" aria-hidden="true">
        {es ? "Aprendizaje interactivo" : "Interactive learning"} ·{" "}
        {es ? "construye en el navegador" : "build in the browser"}
      </p>

      <header className="course-hero">
        <div className="hero-copy">
          <h1 className="hero-headline">
            {es ? (
              <>Construye la app PawWalk — <em>paso a paso</em>.</>
            ) : (
              <>Build the PawWalk app — <em>step by step</em>.</>
            )}
          </h1>
          <p className="hero-subcopy">
            {es
              ? "Cursos interactivos donde escribes código real, lo compruebas al instante y avanzas a tu ritmo. Sin cuenta, sin instalación: tu progreso se guarda en tu navegador."
              : "Interactive courses where you write real code, get instant feedback, and learn at your own pace. No account, no install — progress is saved in your browser."}
          </p>
          <div className="hero-actions">
            <Link
              href={`/${locale}/learn/ios`}
              className="hero-chip"
              style={{ "--chip-hue": "var(--course-ios-hsl)" } as CSSProperties}
            >
              {es ? "Empezar con iOS" : "Start with iOS"} →
            </Link>
            <Link href="/reactnative" className="hero-chip ghost-chip">
              🧠 {es ? "Práctica RN" : "RN Practice"}
            </Link>
          </div>
        </div>
        <div className="hero-scene" aria-hidden="true">
          {SCENE_TILES.map((t) => (
            <div
              key={t.emoji}
              className="scene-tile"
              style={{ "--tile-hue": t.hue } as CSSProperties}
            >
              {t.emoji}
            </div>
          ))}
        </div>
      </header>

      <div className="stats-strip" aria-label={es ? "Estadísticas del catálogo" : "Catalog stats"}>
        <div className="stat">
          <span className="stat-num">{totalLessons}</span>
          <span className="stat-label">{es ? "lecciones" : "lessons"}</span>
        </div>
        <div className="stat">
          <span className="stat-num">{courses.length}</span>
          <span className="stat-label">{es ? "cursos" : "courses"}</span>
        </div>
        <div className="stat">
          <span className="stat-num">{specs.length + 1}</span>
          <span className="stat-label">{es ? "barajas" : "decks"}</span>
        </div>
      </div>

      <h2 className="picker-section-label">
        {es ? "Cursos" : "Courses"}
        <span className="count">{courses.length}</span>
      </h2>
      <div className="course-grid">
        {courses.map((c) => (
          <Link key={c.id} href={`/${locale}/learn/${c.id}`} className="course-card">
            <span className="course-emoji">{c.emoji}</span>
            <span className="course-title">{c.title}</span>
            <span className="course-meta">
              {c.lessons} {es ? "lecciones" : "lessons"} · {c.modules}{" "}
              {es ? "módulos" : "modules"}
            </span>
          </Link>
        ))}
      </div>

      <h2 className="picker-section-label">
        {es ? "Práctica" : "Practice"}
        <span className="count">{specs.length + 1}</span>
      </h2>
      <div className="course-grid">
        {/* Not a lesson course — the senior-RN practice app (flashcards + coding
            challenges) lives at its own /reactnative route, not /learn/<id>. */}
        <Link href="/reactnative" className="course-card">
          <span className="course-emoji">🧠</span>
          <span className="course-title">
            {es ? "Práctica RN (senior)" : "RN Interview Practice"}
          </span>
          <span className="course-meta">
            {es ? "Flashcards + retos de código" : "Flashcards + coding challenges"}
          </span>
        </Link>
        {/* Per-specialization interview decks generated from the Andersen matrix. */}
        {specs.map((s) => (
          <Link key={s.slug} href={`/practice/${s.slug}`} className="course-card">
            <span className="course-emoji">{s.emoji}</span>
            <span className="course-title">
              {s.title} {es ? "(práctica)" : "Practice"}
            </span>
            <span className="course-meta">
              {es ? "Baraja de entrevista" : "Interview deck"}
            </span>
          </Link>
        ))}
      </div>

      <p className="picker-note">
        <span aria-hidden="true">🔒</span>
        <span>
          {es
            ? `Todo el progreso (incluido el código que escribes) se guarda localmente en tu navegador — ${totalLessons} lecciones en total, sin cuenta necesaria.`
            : `All progress (including the code you type) is stored locally in your browser — ${totalLessons} lessons across the catalog, no account needed.`}
        </span>
      </p>
    </div>
  );
}