import type { Metadata } from "next";
import { PageHeader, RichText, prefixContentLinks } from "@gerardocordero/prep-kit";
import type { Locale } from "@gerardocordero/prep-kit";
import { getArchitecture } from "@/lib/locale-data";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "es"
    ? { title: "Arquitectura", description: "Inmersiones de diseño de sistemas — conceptos, ejemplos, problemas y soluciones explicados a profundidad senior." }
    : { title: "Architecture", description: "A senior-level tour of frontend system design mapped onto Next.js — rendering strategy, caching, data flow, and delivery — plus concept/example/problem/solution deep-dives." };
}

export default async function ArchitecturePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const arch = getArchitecture(locale as Locale);
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={locale === "es" ? "Diseño de sistemas" : "System design"}
        title={locale === "es" ? "Guía de Arquitectura Frontend" : "Frontend Architecture Guide"}
        lead={arch.intro}
      />

      <div className="space-y-4">
        {arch.sections.map((s) => (
          <section key={s.id} id={s.id} className="card scroll-mt-24">
            <h2 className="mb-3 text-lg font-bold text-white">{s.title}</h2>
            <RichText html={prefixContentLinks(s.html, locale)} />
          </section>
        ))}
      </div>

      <section className="space-y-4 pt-4">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-extrabold">{locale === "es" ? "Inmersiones" : "Deep dives"}</h2>
          {arch.deepDivesIntro && <p className="text-muted">{arch.deepDivesIntro}</p>}
        </div>
        {arch.deepDives.map((d) => (
          <article key={d.id} className="card">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-full border border-accent/40 bg-accent/12 px-2.5 py-0.5 text-xs font-bold text-accent">
                {d.pill}
              </span>
              <h3 className="font-bold text-white">{d.title}</h3>
            </div>
            <RichText html={prefixContentLinks(d.html, locale)} />
          </article>
        ))}
      </section>
    </div>
  );
}
