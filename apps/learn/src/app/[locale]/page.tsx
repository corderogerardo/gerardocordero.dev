import Link from "next/link";
import { LOCALES, COURSE_IDS } from "@/lib/i18n-config";
import { getSpecs } from "@/lib/andersen-decks";

const COURSES: { id: string; title: string; emoji: string }[] = [
  { id: "ios",     title: "iOS & Swift",      emoji: "📱" },
  { id: "android", title: "Android & Kotlin",  emoji: "🤖" },
  { id: "ruby",    title: "Ruby & Rails",      emoji: "💎" },
  { id: "python",  title: "Python & FastAPI",  emoji: "🐍" },
  { id: "go",      title: "Go Backend",        emoji: "🐹" },
  { id: "native",  title: "Native RN & Expo Modules", emoji: "🛰️" },
  { id: "expoui",  title: "Rebuild @expo/ui",         emoji: "🎛️" },
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
  return (
    <div className="course-picker">
      <h1>PawWalk Academy</h1>
      <p>
        {locale === "es"
          ? "Cursos interactivos — construye la app PawWalk paso a paso"
          : "Interactive courses — build the PawWalk app step by step"}
      </p>
      <div className="course-grid">
        {COURSES.map((c) => (
          <Link key={c.id} href={`/${locale}/learn/${c.id}`} className="course-card">
            <span className="course-emoji">{c.emoji}</span>
            <span className="course-title">{c.title}</span>
          </Link>
        ))}
        {/* Not a lesson course — the senior-RN practice app (flashcards + coding
            challenges) lives at its own /reactnative route, not /learn/<id>. */}
        <Link href="/reactnative" className="course-card">
          <span className="course-emoji">🧠</span>
          <span className="course-title">
            {locale === "es" ? "Práctica RN (senior)" : "RN Interview Practice"}
          </span>
        </Link>
        {/* Per-specialization interview decks generated from the Andersen matrix. */}
        {getSpecs().map((s) => (
          <Link key={s.slug} href={`/practice/${s.slug}`} className="course-card">
            <span className="course-emoji">{s.emoji}</span>
            <span className="course-title">
              {s.title} {locale === "es" ? "(práctica)" : "Practice"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
