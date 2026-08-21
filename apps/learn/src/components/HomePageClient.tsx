"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { SiteHeader } from "@/components/site-header";
import SceneTiles from "@/components/SceneTiles";
import { CoursesGrid } from "@/components/CoursesGrid";
import { ArrowRight, BookOpen, Brain, Lock, Sparkles } from "lucide-react";
import type { CourseProgressShape } from '@/lib/course-progress';

interface HomePageClientProps {
  locale: string;
  courses: Array<{
    id: string;
    title: string;
    emoji: string;
    lessons: number;
    modules: number;
    shape: CourseProgressShape | null;
  }>;
  specs: Array<{ slug: string; title: string; emoji: string }>;
  totalLessons: number;
  sceneTiles: Array<{ emoji: string; hue: string }>;
}

export function HomePageClient({
  locale,
  courses,
  specs,
  totalLessons,
  sceneTiles,
}: HomePageClientProps) {
  const { t: tI18n } = useI18n();

  const t = (key: string, count?: number) => count === undefined ? tI18n(key) : tI18n(key, { count });

  const workspaceCards = [
    { label: t("workspace_courses"), value: String(courses.length) },
    { label: t("workspace_flashcards"), value: String(specs.length + 1) },
    { label: t("workspace_challenges"), value: "150+" },
    { label: t("workspace_progress"), value: "0%" },
  ];

  return (
    <div className="academy-home min-h-svh bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <section className="grid gap-8 overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-xs sm:p-10 lg:grid-cols-[1.15fr_0.85fr] lg:p-14">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Learn by building
            </div>
            <h1 className="mt-5 max-w-2xl text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {t("homepage_headline")}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
              {t("homepage_subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/en/learn/ios"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {t("cta_start_ios")}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/practice/reactnative" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-background px-5 py-2.5 font-semibold transition-colors hover:border-primary/40 hover:bg-accent focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            {t("cta_rn_practice")}
            <Brain className="h-4 w-4" />
          </Link>
            </div>
          </div>
          <div className="relative min-h-[280px] overflow-hidden rounded-2xl bg-foreground p-6 text-background sm:min-h-[340px] lg:min-h-full">
            <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-primary/50 blur-3xl" />
            <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-success/30 blur-3xl" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-background/60"><span>{t("workspace_title")}</span><BookOpen className="h-4 w-4" /></div>
              <div className="grid gap-3 sm:grid-cols-2">
                {workspaceCards.map((card) => (
                  <div key={card.label} className="rounded-xl border border-background/15 bg-background/10 p-4 backdrop-blur-sm">
                    <div className="text-2xl font-bold">{card.value}</div>
                    <div className="mt-1 text-xs text-background/65">{card.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <SceneTiles tiles={sceneTiles} exploreLabel={t("explore_label")} />

        {/* Stats — hairline-divided row, no card boxes.
            Mobile (2×2): border-t on the bottom row. Desktop (4-col): border-l
            on even columns. Color comes from the global *{ border-border }. */}
        <div className="mt-12 grid grid-cols-2 gap-x-3 sm:grid-cols-4">
          <div className="py-4 text-center">
            <div className="text-3xl font-extrabold text-accent">{totalLessons}</div>
            <div className="text-xs text-muted-foreground">{t("lessons_label")}</div>
          </div>
          <div className="py-4 text-center sm:border-l">
            <div className="text-3xl font-extrabold text-accent">{courses.length}</div>
            <div className="text-xs text-muted-foreground">{t("courses_label")}</div>
          </div>
          <div className="border-t py-4 text-center sm:border-l-0 sm:border-t-0">
            <div className="text-3xl font-extrabold text-accent">{specs.length + 1}</div>
            <div className="text-xs text-muted-foreground">{t("decks_label")}</div>
          </div>
          <div className="border-t py-4 text-center sm:border-l">
            <div className="text-3xl font-extrabold text-accent">2</div>
            <div className="text-xs text-muted-foreground">{t("langs_label")}</div>
          </div>
        </div>

        {/* Courses grid */}
        <section id="courses" className="mt-12 scroll-mt-20 space-y-4">
          <h2 className="text-xl font-bold">{t("everything_included")}</h2>
          <CoursesGrid
            courses={courses}
            specs={specs}
            locale={locale}
            totalLessons={totalLessons}
          />
        </section>

        {/* Progress stored */}
        <p className="mt-8 flex items-center gap-2 rounded-2xl border border-dashed border-border bg-card p-4 text-center text-sm text-muted-foreground">
          <Lock className="h-4 w-4 text-muted-foreground" />
          <span>{t("progress_stored", totalLessons ?? 0)}</span>
        </p>
      </main>
    </div>
  );
}
