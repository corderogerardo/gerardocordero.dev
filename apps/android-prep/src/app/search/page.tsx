import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { SearchView } from "@/components/search-view";
import { AiTutor } from "@/components/ai-tutor";

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search every flashcard, prompt, quiz, and study topic by keyword — or enable on-device AI to search by meaning. Plus an on-device AI tutor.",
};

export default function SearchPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Find anything · ask anything"
        title="Search & Ask"
        lead="Keyword search is instant. Enable AI to search by meaning — a small model runs fully in your browser, nothing leaves your device. And ask the on-device AI tutor a question when your browser supports it."
      />
      <SearchView />
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">On-device AI tutor</h2>
        <AiTutor />
      </section>
    </div>
  );
}
