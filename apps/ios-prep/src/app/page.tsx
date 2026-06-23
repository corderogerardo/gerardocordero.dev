import Link from "next/link";
import { NAV } from "@/lib/nav";

const STATS = [
  { value: "600+", label: "Q&A flashcards" },
  { value: "16", label: "Practice prompts" },
  { value: "89", label: "Study-guide topics" },
  { value: "On-device", label: "AI search & tutor" },
];

export default function HomePage() {
  const cards = NAV.filter((item) => item.href !== "/");

  return (
    <div className="animate-fade-up space-y-12">
      <section className="space-y-5">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-good" />
          iOS · Swift &amp; SwiftUI · from scratch
        </span>
        <h1 className="text-4xl font-extrabold leading-[1.1] sm:text-5xl">
          Learn iOS development
          <br />
          <span className="bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent">
            all the way to architect.
          </span>
        </h1>
        <p className="max-w-2xl text-lg text-muted">
          Swift, SwiftUI, UIKit, concurrency, architecture, testing, CI/CD, the
          App Store, and on-device AI — explained from first principles, framed
          the way interviews ask, and tagged by the level you&apos;re aiming for.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <Link
            href="/study"
            className="rounded-xl bg-gradient-to-r from-accent to-accent-2 px-5 py-2.5 font-semibold text-bg transition-opacity hover:opacity-90"
          >
            Open the study guide
          </Link>
          <Link
            href="/roadmap"
            className="rounded-xl border border-border bg-surface px-5 py-2.5 font-semibold text-text transition-colors hover:border-accent/50"
          >
            See the roadmap
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="card text-center">
            <div className="text-2xl font-extrabold text-accent">{s.value}</div>
            <div className="mt-1 text-xs text-muted">{s.label}</div>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Everything in here</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {cards.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="card group transition-colors hover:border-accent/50"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">{item.label}</h3>
                <span className="text-muted transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </div>
              <p className="mt-1.5 text-sm text-muted">{item.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">The method — learn it faster</h2>
          <p className="text-sm text-muted">
            This guide is built around how memory actually works. Use these and
            you&apos;ll retain more in less time.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {METHOD.map((m) => (
            <div key={m.title} className="card">
              <h3 className="flex items-center gap-2 font-semibold text-white">
                <span aria-hidden>{m.icon}</span>
                {m.title}
              </h3>
              <p className="mt-1.5 text-sm text-muted">{m.body}</p>
            </div>
          ))}
        </div>
        <div className="card border-l-[3px] border-accent-2">
          <h3 className="text-sm font-bold uppercase tracking-wide text-accent-2">
            A 20-minute daily loop
          </h3>
          <ol className="mt-2 space-y-1 text-sm text-muted">
            <li>
              <b className="text-text">1.</b> Open{" "}
              <Link href="/flashcards" className="text-accent hover:underline">
                Flashcards
              </Link>{" "}
              → toggle <b className="text-accent-2">Due</b> and clear today&apos;s
              cards (grade honestly — it reschedules them).
            </li>
            <li>
              <b className="text-text">2.</b> Do one{" "}
              <Link href="/practice" className="text-accent hover:underline">
                coding + one system-design prompt
              </Link>{" "}
              — try before you reveal.
            </li>
            <li>
              <b className="text-text">3.</b> Record one{" "}
              <Link href="/pitches" className="text-accent hover:underline">
                pitch
              </Link>{" "}
              out loud with the teleprompter, then check a{" "}
              <Link href="/roadmap" className="text-accent hover:underline">
                level
              </Link>{" "}
              you want to close.
            </li>
          </ol>
        </div>
      </section>
    </div>
  );
}

const METHOD = [
  {
    icon: "🎯",
    title: "Active recall",
    body: "Retrieve the answer from memory before you reveal it. The struggle is the learning — flashcards and practice prompts are built for it.",
  },
  {
    icon: "⏱",
    title: "Spaced repetition",
    body: "Grade each flashcard and the app schedules its next review. Drill the Due pile daily to catch cards right as you're about to forget them.",
  },
  {
    icon: "🔀",
    title: "Interleaving",
    body: "Mix categories and levels instead of blocking one topic. Filter by Swift, SwiftUI, Concurrency, Architecture… and shuffle to fight false fluency.",
  },
  {
    icon: "🛠",
    title: "Active problem-solving",
    body: "Coding and system-design prompts make you produce, not just recognize — the closest thing to the real interview.",
  },
  {
    icon: "🗣",
    title: "Teach it back",
    body: "Explain a concept out loud (use the teleprompter for pitches). If you can teach it simply, you own it — the Feynman technique.",
  },
  {
    icon: "📈",
    title: "Close the gaps",
    body: "Use the Roadmap and level filters to find your weakest level, and the Progress tracker to make readiness visible.",
  },
];
