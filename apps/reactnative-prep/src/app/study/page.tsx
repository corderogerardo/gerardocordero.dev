import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { RichText } from "@/components/rich-text";
import { box } from "@/lib/html";
import { STUDY_INTRO_HTML } from "@/data/study";
import { ALL_STUDY } from "@/data/all";

const sections = ALL_STUDY;

export const metadata: Metadata = {
  title: "Study Guide",
  description:
    "Every requirement a senior React Native role asks for, explained at senior depth and tied to real shipped experience.",
};

export default function StudyPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Master the job description"
        title="Study Guide"
        lead="Every requirement a senior React Native role commonly asks for — explained at senior depth, then tied to where you've already done it. Read the concept, then the “your proof” line so you can speak from experience."
      />

      <RichText html={box("callout warn", STUDY_INTRO_HTML)} />

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
