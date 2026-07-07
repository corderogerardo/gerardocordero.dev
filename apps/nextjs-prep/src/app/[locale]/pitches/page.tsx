import type { Metadata } from "next";
import { PageHeader } from "@gerardocordero/prep-kit";
import { Pitches } from "@gerardocordero/prep-kit";
import { PITCHES, PITCHES_INTRO_HTML } from "@/data/pitches";


export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}


export const metadata: Metadata = {
  title: "Practice Pitches",
  description:
    "Spoken answers — intros, “why Next.js”, a technical deep-dive, and STAR stories — with a teleprompter to rehearse on camera.",
};

export default async function PitchesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Say it out loud"
        title="Practice Pitches"
        lead="Spoken answers covering the full interview range. Tap ▶ Teleprompter on any pitch to rehearse on camera with a scrolling script, timer, and speed control."
      />
      <Pitches pitches={PITCHES} introHtml={PITCHES_INTRO_HTML} />
    </div>
  );
}
