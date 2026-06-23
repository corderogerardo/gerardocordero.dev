import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { Pitches } from "@/components/pitches";
import { PITCHES, PITCHES_INTRO_HTML } from "@/data/pitches";

export const metadata: Metadata = {
  title: "Pitches",
  description:
    "Eight spoken talk-tracks that explain core iOS topics clearly — the kind of answer an interviewer means by “walk me through X” — with a teleprompter to rehearse on camera.",
};

export default function PitchesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Say it out loud"
        title="Practice Pitches"
        lead="Eight spoken explanations of core iOS topics. Tap ▶ Teleprompter on any pitch to rehearse on camera with a scrolling script, timer, and speed control."
      />
      <Pitches pitches={PITCHES} introHtml={PITCHES_INTRO_HTML} />
    </div>
  );
}
