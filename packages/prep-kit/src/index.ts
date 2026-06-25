// @gerardocordero/prep-kit — the shared study engine behind every *-prep site.
// Apps supply a PrepConfig (brand, nav, AI framing, content) + their own data;
// everything below is generic.

// Config / context
export {
  PrepProvider,
  usePrepConfig,
  usePersisted,
  type PrepConfig,
} from "./config";

// Content types
export type {
  Flashcard,
  Prompt,
  PromptKind,
  QuizQuestion,
  StudySection,
  Pitch,
  ChecklistItem,
  ChecklistGroup,
  NavItem,
} from "./types";

// Lib
export * from "./lib/srs";
export * from "./lib/streak";
export * from "./lib/levels";
export { box } from "./lib/html";
export { plainText } from "./lib/plain-text";
export { useLocalStorage } from "./lib/use-local-storage";
export * from "./lib/chrome-ai";

// Components
export { AiTutor } from "./components/ai-tutor";
export { DailySession } from "./components/daily-session";
export { FlashcardDeck } from "./components/flashcard-deck";
export { PageHeader } from "./components/page-header";
export { Pitches } from "./components/pitches";
export { ProgressChecklist } from "./components/progress-checklist";
export { ProgressTools } from "./components/progress-tools";
export { PromptDeck } from "./components/prompt-deck";
export { Quiz } from "./components/quiz";
export { RichText } from "./components/rich-text";
export { SearchView } from "./components/search-view";
export { SiteFooter } from "./components/site-footer";
export { SiteHeader } from "./components/site-header";
export { Teleprompter } from "./components/teleprompter";
