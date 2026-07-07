import type { Metadata } from "next";
import { PageHeader, RichText, prefixContentLinks } from "@gerardocordero/prep-kit";
import type { Locale } from "@gerardocordero/prep-kit";
import { getRoadmap } from "@/lib/locale-data";
import { LEVELS, LEVEL_BADGE, LEVEL_LABEL, LEVEL_LABEL_ES } from "@/lib/levels";


export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "es"
    ? { title: "Hoja de Ruta", description: "Un camino graduado por nivel: junior → mid → senior → arquitecto. Sabe dónde estás y qué sigue." }
    : { title: "Roadmap", description: "A level-graded Next.js / React learning path — junior, mid, senior, architect, and beyond — with what you can do at each level and what to learn next." };
}

export default async function RoadmapPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const roadmap = getRoadmap(locale as Locale);
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={locale === "es" ? "Junior → Arquitecto → Más allá" : "Junior → Architect → Beyond"}
        title={locale === "es" ? "Hoja de Ruta del Ingeniero Frontend" : "Frontend Engineer Roadmap"}
        lead={locale === "es"
          ? "Un camino de aprendizaje graduado por nivel a través de todo en esta guía. Cada etapa lista lo que ya puedes hacer y qué aprender a continuación — y cada tarjeta está etiquetada con su nivel para que puedas practicar exactamente donde estás."
          : "A level-graded path through everything in this guide. Each stage lists what you can already do and what to learn next — and every flashcard is tagged with its level so you can drill exactly where you are."}
      />

      <nav className="flex flex-wrap gap-2">
        {LEVELS.map((l) => (
          <a
            key={l.value}
            href={`#${l.value}`}
            className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${LEVEL_BADGE[l.value]}`}
          >
            {locale === "es" ? l.labelEs : l.label}
          </a>
        ))}
      </nav>

      <ol className="space-y-4">
        {roadmap.map((stage, i) => (
          <li
            key={stage.level}
            id={stage.level}
            className="card scroll-mt-24 space-y-4"
          >
            <div className="flex items-center gap-3">
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border text-sm font-bold ${LEVEL_BADGE[stage.level]}`}
              >
                {i + 1}
              </span>
              <div>
                <h2 className="text-xl font-extrabold text-white">
                  {(locale === "es" ? LEVEL_LABEL_ES : LEVEL_LABEL)[stage.level]}
                </h2>
                <p className="text-sm text-muted">
                  {LEVELS.find((l) => l.value === stage.level)?.[locale === "es" ? "taglineEs" : "tagline"]}
                </p>
              </div>
            </div>

            <p className="prose-body">{stage.summary}</p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wide text-good">
                  {locale === "es" ? "Ya puedes" : "You can already"}
                </h3>
                <ul className="space-y-1.5 text-sm text-text/90">
                  {stage.can.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-good">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wide text-accent">
                  {locale === "es" ? "Mejora con" : "Level up by"}
                </h3>
                <ul className="space-y-1.5 text-sm text-text/90">
                  {stage.next.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-accent">→</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <RichText
              html={prefixContentLinks(stage.drillHtml, locale)}
              className="rounded-xl border-l-[3px] border-accent-2 bg-surface-2/50 px-3.5 py-2.5 text-sm"
            />
          </li>
        ))}
      </ol>
    </div>
  );
}
