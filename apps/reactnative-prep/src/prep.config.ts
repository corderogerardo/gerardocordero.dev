import type { PrepConfig } from "@gerardocordero/prep-kit";
import { NAV } from "@/lib/nav";

// The single per-app config consumed by the shared prep-kit. Content
// (flashcards/prompts/quiz/study) is passed route-scoped from each page, not here.
export const prepConfig: PrepConfig = {
  storagePrefix: "rnprep",
  appId: "reactnative-prep",
  brand: {
    logoText: "RN",
    title: "Interview Prep",
    footerText:
      "Senior React Native interview prep · personal study guide. Practice in English, record, review, repeat.",
  },
  ai: {
    systemPrompt:
      "You are a concise, encouraging senior React Native interview coach. Answer in a few short sentences or a tight list. Be accurate and practical.",
    placeholder: "Ask anything about React Native interviews…",
  },
  nav: NAV,
};
