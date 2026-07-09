import type { Metadata } from "next";
import { PageHeader, ProgressChecklist, ProgressTools } from "@gerardocordero/prep-kit";
import { CHECKLIST_GROUPS, PROGRESS_INTRO } from "@/data/progress";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "es"
    ? { title: "Seguimiento de Progreso", description: "Una lista de verificación de preparación para tu tema. Marca lo que sientes sólido — el progreso se guarda en tu navegador, con exportar/importar." }
    : { title: "Progress Tracker", description: "A readiness checklist for your subject. Tick items as you feel solid — progress saved in your browser, with export/import." };
}

export default async function ProgressPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <div className="space-y-6">
      <PageHeader eyebrow={locale === "es" ? "Seguimiento de preparación" : "Track readiness"} title={locale === "es" ? "Seguimiento de Progreso" : "Progress Tracker"} lead={PROGRESS_INTRO} />
      <ProgressTools />
      <ProgressChecklist groups={CHECKLIST_GROUPS} />
    </div>
  );
}
