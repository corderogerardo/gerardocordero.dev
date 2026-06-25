import Link from "next/link";
import { buttonVariants, Card, cn } from "@gerardocordero/prep-kit";
import { NAV } from "@/lib/nav";

const STEPS = [
  {
    n: "1",
    title: "Edit src/prep.config.ts",
    body: "Set your brand, a unique storagePrefix, and the AI tutor's subject framing.",
  },
  {
    n: "2",
    title: "Replace src/data/*",
    body: "Swap the sample flashcards, prompts, quiz, and checklist for your own content.",
  },
  {
    n: "3",
    title: "Update src/lib/nav.ts",
    body: "Add or remove routes. The header, mobile menu, and these cards all read from it.",
  },
];

export default function HomePage() {
  const cards = NAV.filter((item) => item.href !== "/");

  return (
    <div className="animate-fade-up space-y-12">
      <section className="space-y-5">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-good" />
          Template · built on @gerardocordero/prep-kit
        </span>
        <h1 className="text-4xl font-extrabold leading-[1.1] sm:text-5xl">
          Build a study site
          <br />
          <span className="bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent">
            in minutes, not weeks.
          </span>
        </h1>
        <p className="max-w-2xl text-lg text-muted">
          Everything you see here — flashcards with spaced repetition, a quiz,
          practice prompts, on-device AI search &amp; tutor, streaks, and local
          progress backup — comes from the shared kit. You bring the content.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <Link href="/today" className={buttonVariants({ variant: "primary", size: "lg" })}>
            Try the daily loop
          </Link>
          <Link
            href="/flashcards"
            className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "rounded-xl text-text")}
          >
            See the sample cards
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Make it yours in 3 steps</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {STEPS.map((s) => (
            <Card key={s.n}>
              <div className="text-sm font-bold text-accent-2">Step {s.n}</div>
              <h3 className="mt-1 font-semibold text-white">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{s.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">What ships out of the box</h2>
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
    </div>
  );
}
