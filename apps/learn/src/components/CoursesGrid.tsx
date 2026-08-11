import Link from "next/link";
import CourseCard from "./course-card";
import { getSpecs, AndersenSpec } from "@/lib/andersen-decks";

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

const COURSES: { id: string; title: string; emoji: string }[] = [
  { id: "ios",     title: "iOS & Swift",      emoji: "📱" },
  { id: "android", title: "Android & Kotlin",  emoji: "🤖" },
  { id: "ruby",    title: "Ruby & Rails",      emoji: "💎" },
  { id: "python",  title: "Python & FastAPI",  emoji: "🐍" },
  { id: "go",      title: "Go Backend",        emoji: "🐹" },
  { id: "native",  title: "Native RN & Expo Modules", emoji: "🛰️" },
  { id: "expoui",  title: "Rebuild @expo/ui",         emoji: "🎛️" },
];

export function CoursesGrid({ courses, specs, locale, totalLessons }: CourseGridProps) {
  return (
    <>
      <h2 className="picker-section-label">
        {locale === "es" ? "Cursos" : "Courses"}
        <span className="count">{courses.length}</span>
      </h2>
      <div className="course-grid">
        {courses.map((c) => (
          <CourseCard
            key={c.id}
            href={`/${locale}/learn/${c.id}`}
            title={c.title}
            emoji={c.emoji}
            meta={`${c.lessons} ${locale === "es" ? "lecciones" : "lessons"} · ${c.modules} ${locale === "es" ? "módulos" : "modules"}`}
            shape={c.shape}
            courseId={c.id}
          />
        ))}
      </div>

      <h2 className="picker-section-label">
        {locale === "es" ? "Práctica" : "Practice"}
        <span className="count">{specs.length + 1}</span>
      </h2>
      <div className="course-grid">
        {/* Not a lesson course — the senior-RN practice app (flashcards + coding
            challenges) lives at its own /reactnative route, not /learn/<id>. */}
        <Link href="/reactnative" className="course-card">
          <span className="course-emoji">🧠</span>
          <span className="course-title">
            {locale === "es" ? "Práctica RN (senior)" : "RN Interview Practice"}
          </span>
          <span className="course-meta">
            {locale === "es" ? "Flashcards + retos de código" : "Flashcards + coding challenges"}
          </span>
        </Link>
        {/* Per-specialization interview decks generated from the Andersen matrix. */}
        {specs.map((s) => (
          <Link key={s.slug} href={`/practice/${s.slug}`} className="course-card">
            <span className="course-emoji">{s.emoji}</span>
            <span className="course-title">
              {s.title} {locale === "es" ? "(práctica)" : "Practice"}
            </span>
            <span className="course-meta">
              {locale === "es" ? "Baraja de entrevista" : "Interview deck"}
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}