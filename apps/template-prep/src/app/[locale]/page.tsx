import Link from "next/link";
import { buttonVariants, Card, cn } from "@gerardocordero/prep-kit";
import { NAV } from "@/lib/nav";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const es = locale === "es";
  const cards = NAV.filter((item) => item.href !== "/");
  const l = (href: string) => (href === "/" ? `/${locale}` : `/${locale}${href}`);

  const STEPS = es
    ? [
        {
          n: "1",
          title: "Edita src/prep.config.ts",
          body: "Define tu marca, un storagePrefix único y el enfoque del tutor IA para tu tema.",
        },
        {
          n: "2",
          title: "Reemplaza src/data/*",
          body: "Cambia las tarjetas, prompts, quiz y checklist de ejemplo por tu propio contenido.",
        },
        {
          n: "3",
          title: "Actualiza src/lib/nav.ts",
          body: "Agrega o quita rutas. El header, el menú móvil y estas tarjetas leen de esa lista.",
        },
      ]
    : [
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

  return (
    <div className="animate-fade-up space-y-12">
      <section className="space-y-5">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-good" />
          {es
            ? "Plantilla · construida sobre @gerardocordero/prep-kit"
            : "Template · built on @gerardocordero/prep-kit"}
        </span>
        <h1 className="text-4xl font-extrabold leading-[1.1] sm:text-5xl">
          {es ? "Crea un sitio de estudio" : "Build a study site"}
          <br />
          <span className="bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent">
            {es ? "en minutos, no semanas." : "in minutes, not weeks."}
          </span>
        </h1>
        <p className="max-w-2xl text-lg text-muted">
          {es
            ? "Todo lo que ves aquí — tarjetas con repetición espaciada, un quiz, prompts de práctica, búsqueda y tutor IA en el dispositivo, rachas y respaldo local de progreso — viene del kit compartido. Tú pones el contenido."
            : "Everything you see here — flashcards with spaced repetition, a quiz, practice prompts, on-device AI search & tutor, streaks, and local progress backup — comes from the shared kit. You bring the content."}
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <Link href={l("/today")} className={buttonVariants({ variant: "primary", size: "lg" })}>
            {es ? "Prueba el ciclo diario" : "Try the daily loop"}
          </Link>
          <Link
            href={l("/flashcards")}
            className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "rounded-xl text-text")}
          >
            {es ? "Ver las tarjetas de ejemplo" : "See the sample cards"}
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">
          {es ? "Hazla tuya en 3 pasos" : "Make it yours in 3 steps"}
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {STEPS.map((s) => (
            <Card key={s.n}>
              <div className="text-sm font-bold text-accent-2">
                {es ? "Paso" : "Step"} {s.n}
              </div>
              <h3 className="mt-1 font-semibold text-white">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{s.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">
          {es ? "Lo que incluye de serie" : "What ships out of the box"}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {cards.map((item) => (
            <Link
              key={item.href}
              href={l(item.href)}
              className="card group transition-colors hover:border-accent/50"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">
                  {es ? item.labelEs ?? item.label : item.label}
                </h3>
                <span className="text-muted transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </div>
              <p className="mt-1.5 text-sm text-muted">
                {es ? item.blurbEs ?? item.blurb : item.blurb}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
