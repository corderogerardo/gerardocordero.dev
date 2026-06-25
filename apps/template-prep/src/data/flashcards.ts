import type { Level } from "@/lib/levels";

export type Flashcard = {
  id: string;
  category: string;
  categoryLabel: string;
  question: string;
  answerHtml: string;
  /** Optional seniority level; defaults are derived per-category in lib/levels. */
  level?: Level;
};

// Card ids must be globally unique — prefix them "<subject>-<category>-N".
export const FLASHCARD_FILTERS = [
  { value: "all", label: "All" },
  { value: "basics", label: "Basics" },
  { value: "advanced", label: "Advanced" },
];

export const FLASHCARDS: Flashcard[] = [
  {
    id: "tpl-basics-1",
    category: "basics",
    categoryLabel: "Basics",
    question: "How do I turn this template into a new prep site?",
    answerHtml:
      "<p>Replace the arrays in <code>src/data/</code> with your content and edit <code>src/prep.config.ts</code> (brand, AI framing, nav). The shared <code>@gerardocordero/prep-kit</code> renders the flashcards, quiz, prompts, search, streak and AI tutor for you.</p>",
    level: "junior",
  },
  {
    id: "tpl-basics-2",
    category: "basics",
    categoryLabel: "Basics",
    question: "Where is the spaced-repetition logic?",
    answerHtml:
      "<p>In the kit (<code>prep-kit/src/lib/srs.ts</code>) — a small SM-2-lite scheduler. Grade a card and it reschedules; the <b>Due</b> filter surfaces what's ready. You don't touch it.</p>",
    level: "junior",
  },
  {
    id: "tpl-advanced-1",
    category: "advanced",
    categoryLabel: "Advanced",
    question: "How is my progress stored, and is anything uploaded?",
    answerHtml:
      "<p>Everything is <b>local</b> — <code>localStorage</code> keyed by your <code>storagePrefix</code>. Nothing leaves the device. The optional AI search/tutor also run fully on-device (Chrome's built-in model + a WASM/WebGPU embedder).</p>",
    level: "senior",
  },
];
