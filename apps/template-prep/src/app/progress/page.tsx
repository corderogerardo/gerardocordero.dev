import type { Metadata } from "next";
import { PageHeader, ProgressChecklist, ProgressTools } from "@gerardocordero/prep-kit";
import { CHECKLIST_GROUPS, PROGRESS_INTRO } from "@/data/progress";

export const metadata: Metadata = {
  title: "Progress Tracker",
  description:
    "A readiness checklist for your subject. Tick items as you feel solid — progress saved in your browser, with export/import.",
};

export default function ProgressPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Track readiness" title="Progress Tracker" lead={PROGRESS_INTRO} />
      <ProgressTools />
      <ProgressChecklist groups={CHECKLIST_GROUPS} />
    </div>
  );
}
