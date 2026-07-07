import type { Metadata } from "next";
import { PageHeader } from "@gerardocordero/prep-kit";
import { RichText } from "@gerardocordero/prep-kit";
import { box } from "@gerardocordero/prep-kit";
import type { Locale } from "@gerardocordero/prep-kit";
import { getStudySections, getStudyIntroHtml } from "@/lib/locale-data";


export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}


export const metadata: Metadata = {
  title: "Study Guide",
  description:
    "Every requirement a senior NestJS / Node.js role asks for, explained at senior depth — with a 'how to say it' line so you can answer with confidence.",
};

export default async function StudyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const sections = getStudySections(locale as Locale);
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Master the job description"
        title="Study Guide"
        lead="Every requirement a senior NestJS / Node.js role commonly asks for — explained at senior depth. Read the concept, then the “how to say it” line so you can deliver a crisp, correct answer out loud."
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
