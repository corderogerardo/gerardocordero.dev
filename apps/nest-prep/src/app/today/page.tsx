import type { Metadata } from "next";
import { PageHeader, DailySession } from "@gerardocordero/prep-kit";
import { ALL_FLASHCARDS, ALL_PROMPTS } from "@/data/all";

export const metadata: Metadata = {
  title: "Today",
  description:
    "Your daily drill — the flashcards that are due plus a coding and a system-design prompt, with a streak to keep you honest.",
};

export default function TodayPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Daily drill"
        title="Today's Session"
        lead="The daily loop, assembled for you: the cards spaced repetition says you're about to forget, plus a coding and a system-design prompt. Finish it daily and keep the streak alive."
      />
      <DailySession flashcards={ALL_FLASHCARDS} prompts={ALL_PROMPTS} />
    </div>
  );
}
