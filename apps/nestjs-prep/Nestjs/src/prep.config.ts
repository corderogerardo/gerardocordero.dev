import type { PrepConfig } from "@gerardocordero/prep-kit";
import { NAV } from "@/lib/nav";

// The single per-app config consumed by the shared prep-kit. Content
// (flashcards/prompts/quiz/study) is passed route-scoped from each page, not here.
export const prepConfig: PrepConfig = {
  storagePrefix: "nestprep",
  appId: "nestjs-prep",
  brand: {
    logoText: "Nest",
    title: "NestJS Interview Prep",
    footerText:
      "Senior NestJS + Node.js interview prep · study guide. Read it, drill it, say it out loud, repeat.",
  },
  ai: {
    systemPrompt:
      "You are a concise, encouraging senior NestJS and Node.js interview coach. Answer in a few short sentences or a tight list. Be accurate, current (NestJS 11, Node 24 LTS), and practical.",
    placeholder: "Ask anything about NestJS or Node.js interviews…",
  },
  nav: NAV,
};
