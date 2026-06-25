export type QuizQuestion = {
  id: string;
  category: string;
  categoryLabel: string;
  question: string;
  options: string[];
  answer: number;
  explanationHtml: string;
};

export const QUIZ_FILTERS = [
  { value: "all", label: "All" },
  { value: "basics", label: "Basics" },
];

export const QUIZ: QuizQuestion[] = [
  {
    id: "tpl-q-1",
    category: "basics",
    categoryLabel: "Basics",
    question: "Which file decides this app's brand and AI framing?",
    options: ["src/data/all.ts", "src/prep.config.ts", "tailwind.config.ts", "next.config.ts"],
    answer: 1,
    explanationHtml:
      "<p><code>src/prep.config.ts</code> is the single <code>PrepConfig</code> the kit consumes — brand strings, AI system prompt, storage prefix, and nav.</p>",
  },
  {
    id: "tpl-q-2",
    category: "basics",
    categoryLabel: "Basics",
    question: "Where does the heavy content (cards, prompts) get passed in?",
    options: [
      "Global context, on every page",
      "Route-scoped props to <DailySession> and <SearchView>",
      "Fetched from an API at runtime",
      "Hard-coded inside the kit",
    ],
    answer: 1,
    explanationHtml:
      "<p>Bulk content is passed as <b>route-scoped props</b> so it stays in each route's chunk instead of bloating every page's payload.</p>",
  },
];
