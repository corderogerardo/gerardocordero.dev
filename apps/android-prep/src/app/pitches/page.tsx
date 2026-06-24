import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { Pitches } from "@/components/pitches";
import { PITCHES, PITCHES_INTRO_HTML } from "@/data/pitches";

export const metadata: Metadata = {
  title: "Practice Pitches",
  description:
    "Ten spoken answers — intros, “why Android”, a technical deep-dive, and STAR stories — with a teleprompter to rehearse on camera.",
};

export default function PitchesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Say it out loud"
        title="Practice Pitches"
        lead="Ten spoken answers covering the full interview range. Tap ▶ Teleprompter on any pitch to rehearse on camera with a scrolling script, timer, and speed control."
      />
      <Pitches pitches={PITCHES} introHtml={PITCHES_INTRO_HTML} />
    </div>
  );
}
