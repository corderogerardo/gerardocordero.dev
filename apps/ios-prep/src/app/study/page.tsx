import type { Metadata } from "next";
import { PageHeader } from "@gerardocordero/prep-kit";
import { RichText } from "@gerardocordero/prep-kit";
import { box } from "@gerardocordero/prep-kit";
import { STUDY_INTRO_HTML } from "@/data/study";
import { ALL_STUDY } from "@/data/all";

const sections = ALL_STUDY;

export const metadata: Metadata = {
  title: "Study Guide",
  description:
    "The whole iOS stack explained from scratch — Swift, SwiftUI, UIKit, concurrency, data, performance, testing, CI/CD, the App Store, security, and on-device AI — with a level note on each topic.",
};

export default function StudyPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Learn the whole stack"
        title="Study Guide"
        lead="Every core iOS topic, explained from first principles and framed the way interviews ask. Read the concept, then the level note so you know whether it is table-stakes or differentiating."
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
