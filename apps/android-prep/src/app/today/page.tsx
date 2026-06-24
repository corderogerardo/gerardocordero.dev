import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { DailySession } from "@/components/daily-session";

export const metadata: Metadata = {
  title: "Today",
  description:
    "Your daily drill — the flashcards that are due plus one coding and one system-design prompt, with a streak to keep you honest.",
};

export default function TodayPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Daily drill"
        title="Today's Session"
        lead="The 20-minute loop, assembled for you: the cards spaced repetition says you're about to forget, plus a coding and a system-design prompt. Finish it daily and keep the streak alive."
      />
      <DailySession />
    </div>
  );
}
