export type ChecklistItem = { id: string; label: string };
export type ChecklistGroup = { title: string; items: ChecklistItem[] };

export const PROGRESS_INTRO =
  "A readiness checklist for your subject. Replace these with your own milestones; ticked state is saved in this browser.";

export const CHECKLIST_GROUPS: ChecklistGroup[] = [
  {
    title: "🚀 Getting started",
    items: [
      { id: "tpl-c-1", label: "Edited src/prep.config.ts (brand, AI, storagePrefix)" },
      { id: "tpl-c-2", label: "Replaced src/data/* with my content" },
      { id: "tpl-c-3", label: "Updated src/lib/nav.ts with my routes" },
    ],
  },
];
