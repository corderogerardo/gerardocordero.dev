import Link from "next/link";
import { getCourseData } from "@/lib/course-loader";
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

export default async function CourseOverviewPage({
  params,
}: {
  params: Promise<{ locale: string; course: string }>;
}) {
  const { locale, course: courseId } = await params;
  const course = getCourseData(courseId, locale);
  if (!course) return <p>{locale === "es" ? "Curso no encontrado" : "Course not found"}</p>;

  const t = (key: string, params?: Record<string, string | number>) => {
    const bundles: Record<string, Record<string, string>> = {
      en: {
        "map.title": "Curriculum map",
        "map.back": "← Back to the course",
        "map.lessons": "lessons",
        "map.min": "~{n} min",
      },
      es: {
        "map.title": "Plan de estudios",
        "map.back": "← Volver al curso",
        "map.lessons": "lecciones",
        "map.min": "~{n} min",
      },
    };
    let val = bundles[locale]?.[key] || bundles.en[key] || key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        val = val.replace(`{${k}}`, String(v));
      }
    }
    return val;
  };

  return (
    <div className="lesson-wrap">
      <h2 className="lesson-title">{t("map.title")}</h2>
      <Link href={`/${locale}/learn/${course.id}`} className="linkish">
        {t("map.back")}
      </Link>
      <div className="map-grid">
        {course.modules.map((m, mi) => {
          const totalMin = m.lessons.reduce((n, l) => n + Math.max(2, Math.round(l.steps.length * 1.5)), 0);
          const target = m.lessons[0];
          return (
            <Link
              key={m.id}
              href={`/${locale}/learn/${course.id}/${m.id}/${target.id}`}
              className="map-card"
            >
              <div className="map-card-emoji">{m.emoji || "📘"}</div>
              <div className="map-card-title">
                {String(mi).padStart(2, "0")} · {m.title}
              </div>
              <div className="mono-caption">
                {m.lessons.length} {t("map.lessons")} · {t("map.min", { n: totalMin })}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
