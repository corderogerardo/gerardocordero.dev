import type { Metadata } from "next";
import { PageHeader } from "@gerardocordero/prep-kit";
import { ProgressChecklist } from "@gerardocordero/prep-kit";
import { ProgressTools } from "@gerardocordero/prep-kit";
import type { Locale } from "@gerardocordero/prep-kit";
import { getChecklistGroups, getProgressIntro } from "@/lib/locale-data";


export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}


export const metadata: Metadata = {
  title: "Progress Tracker",
  description:
    "A checklist across every requirement in the job description plus your study topics. Tick items as you feel solid — progress saved in your browser.",
};

export default async function ProgressPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Track readiness" title="Progress Tracker" lead={getProgressIntro(locale as Locale)} />
      <ProgressTools />
      <ProgressChecklist groups={getChecklistGroups(locale as Locale)} />
    </div>
  );
}
