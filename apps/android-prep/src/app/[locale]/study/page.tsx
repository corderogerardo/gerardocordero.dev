import type { Metadata } from "next";
import { PageHeader } from "@gerardocordero/prep-kit";
import { RichText } from "@gerardocordero/prep-kit";
import { box } from "@gerardocordero/prep-kit";
import type { Locale } from "@gerardocordero/prep-kit";
import { getStudySections, getStudyIntroHtml } from "@/lib/locale-data";


export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}



export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "es"
    ? { title: "Guía de Estudio", description: "Cada requisito de un rol senior, explicado a profundidad senior — con una línea de “cómo decirlo” para responder con confianza." }
    : { title: "Study Guide", description: "Every requirement a senior Android role asks for — Kotlin, coroutines, Compose, architecture, Jetpack, performance, testing — explained at senior depth." };
}

export default async function StudyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const sections = getStudySections(locale as Locale);
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={locale === "es" ? "Domina la descripción del puesto" : "Master the job description"}
        title={locale === "es" ? "Guía de Estudio" : "Study Guide"}
        lead={locale === "es"
          ? "Cada requisito que un rol senior de Android comúnmente pide — explicado a profundidad senior, y luego ligado a cómo lo aplicarías en un equipo real. Lee el concepto, luego la línea “en la práctica” para que puedas hablar desde la experiencia."
          : "Every requirement a senior Android role commonly asks for — explained at senior depth, then tied to how you'd apply it on a real team. Read the concept, then the “in practice” line so you can speak from experience."}
      />

      <RichText html={box("callout warn", getStudyIntroHtml(locale as Locale))} />

      <nav className="card grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="flex items-baseline gap-2 text-sm text-muted transition-colors hover:text-accent"
          >
            <span className="font-mono text-xs text-accent">{s.num}</span>
            <span className="truncate">
              {s.title.split("·").slice(1).join("·").trim()}
            </span>
          </a>
        ))}
      </nav>

      <div className="space-y-4">
        {sections.map((s) => (
          <section key={s.id} id={s.id} className="card scroll-mt-24">
            <h2 className="mb-3 text-lg font-bold text-white">{s.title}</h2>
            <RichText html={s.html} />
          </section>
        ))}
      </div>
    </div>
  );
}
