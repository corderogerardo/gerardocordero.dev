import type { Metadata } from "next";
import { PageHeader } from "@gerardocordero/prep-kit";
import { PromptDeck } from "@gerardocordero/prep-kit";
import type { Locale } from "@gerardocordero/prep-kit";
import { getPrompts } from "@/lib/locale-data";


export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "es"
    ? { title: "Práctica", description: "Resolución activa de problemas: prompts de código estilo entrevista y prompts de diseño de sistemas móviles, con pistas progresivas y revelado autoevaluado." }
    : { title: "Practice", description: "Active problem-solving: interview-style coding prompts and mobile system-design prompts, with progressive hints and a self-graded reveal." };
}

export default async function PracticePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={locale === "es" ? "Resolución activa de problemas" : "Active problem-solving"}
        title={locale === "es" ? "Prompts de Práctica" : "Practice Prompts"}
        lead={locale === "es"
          ? "Inténtalo antes de revelar. Cada prompt de código y diseño de sistema se desarrolla por etapas — enfoque, luego solución — para que practiques recuperación, no reconocimiento. Marca lo que resolviste; revisita el resto."
          : "Try it before you reveal. Each coding and system-design prompt unfolds in stages — approach, then solution — so you practice retrieval, not recognition. Mark what you solved; revisit the rest."}
      />
      <PromptDeck prompts={getPrompts(locale as Locale)} />
    </div>
  );
}
