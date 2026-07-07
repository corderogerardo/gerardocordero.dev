import type { Metadata } from "next";
import { PageHeader, RichText, box, prefixContentLinks } from "@gerardocordero/prep-kit";
import type { Locale } from "@gerardocordero/prep-kit";
import { getStudySections } from "@/lib/locale-data";


export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}


export const metadata: Metadata = {
  title: "Study Guide",
  description:
    "Every requirement a senior Next.js / React role asks for, explained at senior depth — with a 'how to say it' line so you can answer with confidence.",
};

export default async function StudyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const sections = getStudySections(locale as Locale);
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={locale === "es" ? "Domina la descripción del puesto" : "Master the job description"}
        title={locale === "es" ? "Guía de Estudio" : "Study Guide"}
        lead={locale === "es"
          ? "Cada requisito que un rol senior de Next.js / React comúnmente pide — explicado a profundidad senior. Lee el concepto, luego la línea de 'cómo decirlo' para que puedas entregar una respuesta precisa y concisa en voz alta."
          : "Every requirement a senior Next.js / React role commonly asks for — explained at senior depth. Read the concept, then the \"how to say it\" line so you can deliver a crisp, correct answer out loud."}
      />

      <RichText html={prefixContentLinks(box("callout warn", locale === "es"
        ? "<span class=\"lbl\">Cómo usar esto</span> Cada tema explica el concepto a la profundidad que una entrevista senior de Next.js / React espera, y luego da una línea de <b>'cómo decirla'</b> — la oración concisa para entregar en voz alta. Lee para entender primero; ensaya las líneas de una sola línea al final."
        : "<span class=\"lbl\">How to use this</span> Each topic explains the concept at the depth a senior Next.js / React interview expects, then gives a <b>\"how to say it\"</b> line — the crisp sentence to deliver out loud. Read for understanding first; rehearse the one-liners last."), locale)} />

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
            <RichText html={prefixContentLinks(s.html, locale)} />
          </section>
        ))}
      </div>
    </div>
  );
}
