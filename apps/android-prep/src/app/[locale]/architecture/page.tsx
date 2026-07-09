import type { Metadata } from "next";
import type { Locale } from "@gerardocordero/prep-kit";
import { PageHeader, RichText } from "@gerardocordero/prep-kit";
import { getArchitecture } from "@/lib/locale-data";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "es"
    ? { title: "Arquitectura", description: "Un recorrido senior de diseño de sistemas móviles aplicado al Android moderno — Compose, MVVM/MVI, Clean Architecture, offline-first — con inmersiones de concepto/ejemplo/problema/solución." }
    : { title: "Architecture", description: "A senior-level tour of mobile system design mapped onto modern Android — Compose, MVVM/MVI, Clean Architecture, offline-first — plus concept/example/problem/solution deep-dives." };
}

export default async function ArchitecturePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { intro, sections, deepDives, deepDivesIntro } = getArchitecture(locale as Locale);
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={locale === "es" ? "Diseño de sistemas" : "System design"}
        title={locale === "es" ? "Guía de Arquitectura Móvil" : "Mobile Architecture Guide"}
        lead={intro}
      />

      <div className="space-y-4">
        {sections.map((s) => (
          <section key={s.id} id={s.id} className="card scroll-mt-24">
            <h2 className="mb-3 text-lg font-bold text-white">{s.title}</h2>
            <RichText html={s.html} />
          </section>
        ))}
      </div>

      <section className="space-y-4 pt-4">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-extrabold">{locale === "es" ? "Inmersiones" : "Deep dives"}</h2>
          {deepDivesIntro && <p className="text-muted">{deepDivesIntro}</p>}
        </div>
        {deepDives.map((d) => (
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
