import type { Metadata } from "next";
import { PageHeader } from "@gerardocordero/prep-kit";
import { ProgressChecklist } from "@gerardocordero/prep-kit";
import { ProgressTools } from "@gerardocordero/prep-kit";
import type { Locale } from "@gerardocordero/prep-kit";
import { getChecklistGroups } from "@/lib/locale-data";


export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "es"
    ? { title: "Seguimiento de Progreso", description: "Marca hitos de preparación hasta que todo esté en verde — el progreso se guarda en tu navegador." }
    : { title: "Progress Tracker", description: "A checklist across every part of this guide — pitches, study topics, flashcard categories, and senior readiness signals. Tick items as you feel solid — progress saved in your browser." };
}

export default async function ProgressPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const groups = getChecklistGroups(locale as Locale);
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={locale === "es" ? "Seguimiento de preparación" : "Track readiness"}
        title={locale === "es" ? "Seguimiento de Progreso" : "Progress Tracker"}
        lead={locale === "es"
          ? "Una lista de verificación de cada parte de esta guía — pitches, temas de estudio, categorías de tarjetas y señales de preparación para senior. Marca los elementos que sientes sólidos — el progreso se guarda en tu navegador."
          : "A checklist across every part of this guide — pitches, study topics, flashcard categories, and senior readiness signals. Tick items as you feel solid — progress saved in your browser."}
      />
      <ProgressTools />
      <ProgressChecklist groups={groups} />
    </div>
  );
}
