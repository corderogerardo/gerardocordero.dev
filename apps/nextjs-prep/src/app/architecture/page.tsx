import type { Metadata } from "next";
import { PageHeader } from "@gerardocordero/prep-kit";
import { RichText } from "@gerardocordero/prep-kit";
import {
  ARCH_INTRO,
  ARCH_SECTIONS,
  DEEP_DIVES,
  DEEPDIVES_INTRO,
} from "@/data/architecture";

export const metadata: Metadata = {
  title: "Architecture",
  description:
    "A senior-level tour of frontend system design mapped onto Next.js — rendering strategy, caching, data flow, and delivery — plus concept/example/problem/solution deep-dives.",
};

export default function ArchitecturePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System design"
        title="Frontend Architecture Guide"
        lead={ARCH_INTRO}
      />

      <div className="space-y-4">
        {ARCH_SECTIONS.map((s) => (
          <section key={s.id} id={s.id} className="card scroll-mt-24">
            <h2 className="mb-3 text-lg font-bold text-white">{s.title}</h2>
            <RichText html={s.html} />
          </section>
        ))}
      </div>

      <section className="space-y-4 pt-4">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-extrabold">Deep dives</h2>
          {DEEPDIVES_INTRO && <p className="text-muted">{DEEPDIVES_INTRO}</p>}
        </div>
        {DEEP_DIVES.map((d) => (
          <article key={d.id} className="card">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-full border border-accent/40 bg-accent/12 px-2.5 py-0.5 text-xs font-bold text-accent">
                {d.pill}
              </span>
              <h3 className="font-bold text-white">{d.title}</h3>
            </div>
            <RichText html={d.html} />
          </article>
        ))}
      </section>
    </div>
  );
}
