import type { Metadata } from "next";
import { PageHeader, PromptDeck } from "@gerardocordero/prep-kit";
import { ALL_PROMPTS } from "@/data/all";

export const metadata: Metadata = {
  title: "Practice",
  description:
    "Active problem-solving: coding prompts and system-design prompts, with progressive hints and a self-graded reveal.",
};

export default function PracticePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Active problem-solving"
        title="Practice Prompts"
        lead="Try it before you reveal. Each prompt unfolds in stages — approach, then solution — so you practice retrieval, not recognition. Mark what you solved; revisit the rest."
      />
      <PromptDeck prompts={ALL_PROMPTS} />
    </div>
  );
}
