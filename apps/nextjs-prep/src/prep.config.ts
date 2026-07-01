import type { PrepConfig } from "@gerardocordero/prep-kit";
import { NAV } from "@/lib/nav";

// The single per-app config consumed by the shared prep-kit. Content
// (flashcards/prompts/quiz/study) is passed route-scoped from each page, not here.
export const prepConfig: PrepConfig = {
  storagePrefix: "nextjsprep",
  appId: "nextjs-prep",
  brand: {
    logoText: "Next",
    title: "Next.js Interview Prep",
    footerText:
      "Senior Next.js + React interview prep · study guide. Read it, drill it, say it out loud, repeat.",
  },
  ai: {
    systemPrompt:
      "You are a concise, encouraging senior Next.js and React interview coach. Answer in a few short sentences or a tight list. Be accurate, current (Next.js 16, React 19.2), and practical.",
    placeholder: "Ask anything about Next.js or React interviews…",
  },
  nav: NAV,
};
