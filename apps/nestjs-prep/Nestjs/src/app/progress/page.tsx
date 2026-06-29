import type { Metadata } from "next";
import { PageHeader } from "@gerardocordero/prep-kit";
import { ProgressChecklist } from "@gerardocordero/prep-kit";
import { ProgressTools } from "@gerardocordero/prep-kit";
import { CHECKLIST_GROUPS, PROGRESS_INTRO } from "@/data/progress";

export const metadata: Metadata = {
  title: "Progress Tracker",
  description:
    "A checklist across every requirement in the job description plus your study topics. Tick items as you feel solid — progress saved in your browser.",
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
