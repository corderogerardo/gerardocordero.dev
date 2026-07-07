import type { Metadata } from "next";
import { PageHeader } from "@gerardocordero/prep-kit";
import { Pitches } from "@gerardocordero/prep-kit";
import type { Locale } from "@gerardocordero/prep-kit";
import { getPitches, getPitchesIntroHtml } from "@/lib/locale-data";


export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}


export const metadata: Metadata = {
  title: "Practice Pitches",
  description:
    "Ten spoken answers — intros, “why Android”, a technical deep-dive, and STAR stories — with a teleprompter to rehearse on camera.",
};

export default async function PitchesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Say it out loud"
        title="Practice Pitches"
        lead="Ten spoken answers covering the full interview range. Tap ▶ Teleprompter on any pitch to rehearse on camera with a scrolling script, timer, and speed control."
      />
      <Pitches pitches={getPitches(locale as Locale)} introHtml={getPitchesIntroHtml(locale as Locale)} />
    </div>
  );
}
