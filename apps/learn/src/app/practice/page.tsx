import Link from 'next/link';
import { getSpecs } from '@/lib/andersen-decks';
import { SiteHeader } from '@/components/practice/site-header';
import { Layers, Code2, BookOpen, Sparkles, ArrowRight, Smartphone } from 'lucide-react';

const SPEC_ICONS: Record<string, typeof Layers> = {
  react: Layers,
  node: Code2,
  python: BookOpen,
  go: Sparkles,
  android: Code2,
  ios: BookOpen,
  devops: Sparkles,
  'business-analyst': BookOpen,
  'system-analyst': Layers,
};

export const metadata = {
  title: 'Practice — Interview Prep Decks',
  description: 'Choose a specialization to practice: React, Node.js, Python, Go, Android, iOS, DevOps, Business Analyst, System Analyst',
};

export default function PracticeIndexPage() {
  const specs = getSpecs();

  return (
    <div className="min-h-svh bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20 lg:px-12 xl:px-16">
        <div className="flex flex-col items-start gap-3 max-w-2xl">
          <Sparkles className="h-5 w-5 text-primary" />
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
            Interview Practice Decks
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Senior interview prep for your specialization. Each deck includes flashcards with Andersen-level filtering (J1–S2),
            active recall, and spaced repetition.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {specs.map((spec) => {
            const Icon = SPEC_ICONS[spec.slug] || Layers;
            return (
              <Link
                key={spec.slug}
                href={`/practice/${spec.slug}`}
                className="group rounded-3xl border-2 border-border bg-card/50 backdrop-blur-sm p-6 transition-all hover:border-primary/30 hover:bg-card/80 shadow-sm hover:shadow-lg/20 transform-hover"
              >
                <div className="flex items-center justify-between gap-4 mb-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    {spec.emoji}
                  </span>
                </div>
                <h2 className="font-display text-2xl font-semibold tracking-tight">{spec.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  Flashcards with Andersen matrix levels (J1–S2)
                </p>
                <div className="mt-3 flex items-center gap-2">
                  Empezar
                  <ArrowRight className="transition-transform group-hover:translate-x-1.5 opacity-0 group-hover:scale-105" />
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-16 rounded-3xl border border-border bg-card/50 backdrop-blur-sm p-10 sm:p-12 lg:p-14">
          <h2 className="font-display text-xl font-semibold mb-4">Also available</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/practice/reactnative"
              className="rounded-3xl border border-border bg-card/50 backdrop-blur-sm p-6 transition-all hover:border-primary/30 hover:bg-card/80 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                    <Smartphone className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-display font-medium">React Native Practice</h3>
                  <p className="text-sm text-muted-foreground">
                    237 flashcards + 150 coding challenges + Quiz (senior React Native interview prep)
                  </p>
                </div>
              </div>
            </Link>
            <Link
              href="/learn/ios"
              className="rounded-3xl border border-border bg-card/50 backdrop-blur-sm p-6 transition-all hover:border-primary/30 hover:bg-card/80 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-display font-medium">Interactive Courses</h3>
                  <p className="text-sm text-muted-foreground">
                    Full iOS, Android, Python, Go, Node, Ruby, Native RN, and Expo modules courses
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
