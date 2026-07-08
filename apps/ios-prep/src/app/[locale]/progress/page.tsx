import type { Metadata } from "next";
import { PageHeader } from "@gerardocordero/prep-kit";
import { ProgressChecklist } from "@gerardocordero/prep-kit";
import { ProgressTools } from "@gerardocordero/prep-kit";
import type { Locale } from "@gerardocordero/prep-kit";
import { getChecklistGroups, getProgressIntro } from "@/lib/locale-data";


export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "es"
    ? { title: "Seguimiento de Progreso", description: "Una lista de verificación de cada requisito de la descripción del puesto más tus temas de estudio. Marca lo que sientas sólido — se guarda en tu navegador." }
    : { title: "Progress Tracker", description: "A checklist across every requirement in the job description plus your study topics. Tick items as you feel solid — progress saved in your browser." };
}

export default async function ProgressPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <div className="space-y-6">
      <PageHeader eyebrow={locale === "es" ? "Seguimiento de preparación" : "Track readiness"} title={locale === "es" ? "Seguimiento de Progreso" : "Progress Tracker"} lead={getProgressIntro(locale as Locale)} />
      <ProgressTools />
      <ProgressChecklist groups={getChecklistGroups(locale as Locale)} />
    </div>
  );
}
