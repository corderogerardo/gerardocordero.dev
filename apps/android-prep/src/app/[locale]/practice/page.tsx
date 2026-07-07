import type { Metadata } from "next";
import { PageHeader } from "@gerardocordero/prep-kit";
import { PromptDeck } from "@gerardocordero/prep-kit";
import type { Locale } from "@gerardocordero/prep-kit";
import { getPrompts } from "@/lib/locale-data";


export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}


export const metadata: Metadata = {
  title: "Practice",
  description:
    "Active problem-solving: interview-style coding prompts and mobile system-design prompts, with progressive hints and a self-graded reveal.",
};

export default async function PracticePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Active problem-solving"
        title="Practice Prompts"
        lead="Try it before you reveal. Each coding and system-design prompt unfolds in stages — approach, then solution — so you practice retrieval, not recognition. Mark what you solved; revisit the rest."
      />
      <PromptDeck prompts={getPrompts(locale as Locale)} />
    </div>
  );
}
