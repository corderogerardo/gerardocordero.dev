import type { Metadata } from "next";
import { PageHeader, RichText, LEVEL_BADGE, LEVEL_LABEL } from "@gerardocordero/prep-kit";
import { LESSONS, lessonsByCategory } from "@/data/lessons";

export const metadata: Metadata = {
  title: "Lessons",
  description:
    "25 structured React Native & Expo lessons — from core rendering to performance profiling. Read each one, understand the concept, then put it into practice.",
};

const groups = lessonsByCategory(LESSONS);

export default function LessonsPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Study the fundamentals"
        title="React Native & Expo Lessons"
        lead="25 lessons across 5 topics — core rendering, the Expo ecosystem, state & data, navigation, and performance. Each lesson explains the why, not just the what. Read from top to bottom or jump to the category you need."
      />

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center">
          <div className="text-2xl font-extrabold text-accent">{LESSONS.length}</div>
          <div className="mt-1 text-xs text-muted">lessons</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-extrabold text-accent">{groups.length}</div>
          <div className="mt-1 text-xs text-muted">categories</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-extrabold text-accent">JR–SR</div>
          <div className="mt-1 text-xs text-muted">levels covered</div>
        </div>
      </div>

      {/* Category TOC */}
      <nav className="card flex flex-wrap gap-2">
        {groups.map((g) => (
          <a
            key={g.category}
            href={`#${g.category}`}
            className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-accent/50 hover:text-accent"
          >
            {g.categoryLabel}
          </a>
        ))}
      </nav>

      {/* Lesson groups */}
      {groups.map((group) => (
        <section key={group.category} id={group.category} className="space-y-3 scroll-mt-20">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted">
            {group.categoryLabel}
          </h2>

          <div className="space-y-2">
            {group.lessons.map((lesson) => (
              <details key={lesson.id} className="card group open:border-accent/30">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 [&::-webkit-details-marker]:hidden">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-white group-open:text-accent">
                      {lesson.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted">{lesson.blurb}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${LEVEL_BADGE[lesson.level]}`}
                    >
                      {LEVEL_LABEL[lesson.level]}
                    </span>
                    <span className="text-muted transition-transform group-open:rotate-90" aria-hidden>
                      ›
                    </span>
                  </div>
                </summary>

                <div className="prose-body mt-4 border-t border-border pt-4 text-sm leading-relaxed">
                  <RichText html={lesson.html} />
                </div>
              </details>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
