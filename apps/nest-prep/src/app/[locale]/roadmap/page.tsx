import type { Metadata } from "next";
import { PageHeader } from "@gerardocordero/prep-kit";
import { RichText } from "@gerardocordero/prep-kit";
import type { Locale } from "@gerardocordero/prep-kit";
import { getRoadmap } from "@/lib/locale-data";
import { LEVELS, LEVEL_BADGE, LEVEL_LABEL } from "@/lib/levels";


export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}


export const metadata: Metadata = {
  title: "Roadmap",
  description:
    "A level-graded NestJS / Node.js learning path — junior, mid, senior, architect, and beyond — with what you can do at each level and what to learn next.",
};

export default async function RoadmapPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Junior → Architect → Beyond"
        title="Backend Engineer Roadmap"
        lead="A level-graded path through everything in this guide. Each stage lists what you can already do and what to learn next — and every flashcard is tagged with its level so you can drill exactly where you are."
      />

      <nav className="flex flex-wrap gap-2">
        {LEVELS.map((l) => (
          <a
            key={l.value}
            href={`#${l.value}`}
            className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${LEVEL_BADGE[l.value]}`}
          >
            {l.label}
          </a>
        ))}
      </nav>

      <ol className="space-y-4">
        {getRoadmap(locale as Locale).map((stage, i) => (
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
                  {LEVEL_LABEL[stage.level]}
                </h2>
                <p className="text-sm text-muted">
                  {LEVELS.find((l) => l.value === stage.level)?.tagline}
                </p>
              </div>
            </div>

            <p className="prose-body">{stage.summary}</p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wide text-good">
                  You can already
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
                  Level up by
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
              html={stage.drillHtml}
              className="rounded-xl border-l-[3px] border-accent-2 bg-surface-2/50 px-3.5 py-2.5 text-sm"
            />
          </li>
        ))}
      </ol>
    </div>
  );
}
