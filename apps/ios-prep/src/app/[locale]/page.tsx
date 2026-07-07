import Link from "next/link";
import { NAV } from "@/lib/nav";


export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}


export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const es = locale === "es";
  const cards = NAV.filter((item) => item.href !== "/");
  const l = (href: string) => (href === "/" ? `/${locale}` : `/${locale}${href}`);

  const STATS = [
    { value: "600+", label: es ? "Tarjetas de P&R" : "Q&A flashcards" },
    { value: "16", label: es ? "Ejercicios de práctica" : "Practice prompts" },
    { value: "89", label: es ? "Temas de la guía" : "Study-guide topics" },
    {
      value: es ? "En el dispositivo" : "On-device",
      label: es ? "Búsqueda y tutor IA" : "AI search & tutor",
    },
  ];

  const METHOD = es ? METHOD_ES : METHOD_EN;

  return (
    <div className="animate-fade-up space-y-12">
      <section className="space-y-5">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-good" />
          {es ? "iOS · Swift & SwiftUI · desde cero" : "iOS · Swift & SwiftUI · from scratch"}
        </span>
        <h1 className="text-4xl font-extrabold leading-[1.1] sm:text-5xl">
          {es ? "Aprende desarrollo iOS" : "Learn iOS development"}
          <br />
          <span className="bg-gradient-to-r from-accent to-accent-2 bg-clip-text text-transparent">
            {es ? "hasta llegar a arquitecto." : "all the way to architect."}
          </span>
        </h1>
        <p className="max-w-2xl text-lg text-muted">
          {es
            ? "Swift, SwiftUI, UIKit, concurrencia, arquitectura, testing, CI/CD, la App Store e IA en el dispositivo — explicado desde los fundamentos, planteado como lo pregunta la entrevista y etiquetado por el nivel al que apuntas."
            : "Swift, SwiftUI, UIKit, concurrency, architecture, testing, CI/CD, the App Store, and on-device AI — explained from first principles, framed the way interviews ask, and tagged by the level you're aiming for."}
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <Link
            href={l("/study")}
            className="rounded-xl bg-gradient-to-r from-accent to-accent-2 px-5 py-2.5 font-semibold text-bg transition-opacity hover:opacity-90"
          >
            {es ? "Abrir la guía de estudio" : "Open the study guide"}
          </Link>
          <Link
            href={l("/roadmap")}
            className="rounded-xl border border-border bg-surface px-5 py-2.5 font-semibold text-text transition-colors hover:border-accent/50"
          >
            {es ? "Ver la hoja de ruta" : "See the roadmap"}
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
        <h2 className="text-xl font-bold">{es ? "Todo lo que incluye" : "Everything in here"}</h2>
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

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">
            {es ? "El método — apréndelo más rápido" : "The method — learn it faster"}
          </h2>
          <p className="text-sm text-muted">
            {es
              ? "Esta guía está diseñada según cómo funciona realmente la memoria. Úsalos y retendrás más en menos tiempo."
              : "This guide is built around how memory actually works. Use these and you'll retain more in less time."}
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
            {es ? "Un ciclo diario de 20 minutos" : "A 20-minute daily loop"}
          </h3>
          <ol className="mt-2 space-y-1 text-sm text-muted">
            {es ? (
              <>
                <li>
                  <b className="text-text">1.</b> Abre las{" "}
                  <Link href={l("/flashcards")} className="text-accent hover:underline">
                    Tarjetas
                  </Link>{" "}
                  → activa <b className="text-accent-2">Pendientes</b> y despacha
                  las de hoy (califica con honestidad — se reprograman).
                </li>
                <li>
                  <b className="text-text">2.</b> Haz un{" "}
                  <Link href={l("/practice")} className="text-accent hover:underline">
                    ejercicio de código + uno de diseño de sistemas
                  </Link>{" "}
                  — inténtalo antes de revelar.
                </li>
                <li>
                  <b className="text-text">3.</b> Graba un{" "}
                  <Link href={l("/pitches")} className="text-accent hover:underline">
                    pitch
                  </Link>{" "}
                  en voz alta con el teleprompter, luego revisa un{" "}
                  <Link href={l("/roadmap")} className="text-accent hover:underline">
                    nivel
                  </Link>{" "}
                  que quieras cerrar.
                </li>
              </>
            ) : (
              <>
                <li>
                  <b className="text-text">1.</b> Open{" "}
                  <Link href={l("/flashcards")} className="text-accent hover:underline">
                    Flashcards
                  </Link>{" "}
                  → toggle <b className="text-accent-2">Due</b> and clear today&apos;s
                  cards (grade honestly — it reschedules them).
                </li>
                <li>
                  <b className="text-text">2.</b> Do one{" "}
                  <Link href={l("/practice")} className="text-accent hover:underline">
                    coding + one system-design prompt
                  </Link>{" "}
                  — try before you reveal.
                </li>
                <li>
                  <b className="text-text">3.</b> Record one{" "}
                  <Link href={l("/pitches")} className="text-accent hover:underline">
                    pitch
                  </Link>{" "}
                  out loud with the teleprompter, then check a{" "}
                  <Link href={l("/roadmap")} className="text-accent hover:underline">
                    level
                  </Link>{" "}
                  you want to close.
                </li>
              </>
            )}
          </ol>
        </div>
      </section>
    </div>
  );
}

const METHOD_EN = [
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

const METHOD_ES = [
  {
    icon: "🎯",
    title: "Recuerdo activo",
    body: "Recupera la respuesta de tu memoria antes de revelarla. El esfuerzo es el aprendizaje — las tarjetas y los ejercicios están hechos para eso.",
  },
  {
    icon: "⏱",
    title: "Repetición espaciada",
    body: "Califica cada tarjeta y la app programa su próximo repaso. Repasa las pendientes a diario para atraparlas justo antes de olvidarlas.",
  },
  {
    icon: "🔀",
    title: "Intercalado",
    body: "Mezcla categorías y niveles en vez de estudiar un solo tema. Filtra por Swift, SwiftUI, Concurrencia, Arquitectura… y mezcla para combatir la falsa fluidez.",
  },
  {
    icon: "🛠",
    title: "Resolución activa de problemas",
    body: "Los ejercicios de código y diseño de sistemas te hacen producir, no solo reconocer — lo más parecido a la entrevista real.",
  },
  {
    icon: "🗣",
    title: "Enséñalo",
    body: "Explica un concepto en voz alta (usa el teleprompter para los pitches). Si puedes enseñarlo de forma simple, lo dominas — la técnica de Feynman.",
  },
  {
    icon: "📈",
    title: "Cierra las brechas",
    body: "Usa la hoja de ruta y los filtros de nivel para encontrar tu punto más débil, y el seguimiento de progreso para hacer visible tu preparación.",
  },
];
