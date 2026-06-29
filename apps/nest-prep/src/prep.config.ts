import type { PrepConfig } from "@gerardocordero/prep-kit";
import { NAV } from "@/lib/nav";

// The single per-app config consumed by the shared prep-kit. Content
// (flashcards/prompts/quiz) is passed route-scoped from each page, not here.
export const prepConfig: PrepConfig = {
  storagePrefix: "nestprep",
  appId: "nest-prep",
  brand: {
    logoText: "Nest",
    title: "Interview Prep",
    footerText:
      "Senior NestJS / Node backend interview prep · personal study guide. Drill the request lifecycle, DI, and system design — repeat until it's reflex.",
  },
  ai: {
    systemPrompt:
      "You are a concise, encouraging principal NestJS / Node backend interview coach. Answer in a few short sentences or a tight list. Be accurate to current NestJS (v10/v11) semantics and practical.",
    placeholder: "Ask anything about NestJS interviews…",
  },
  nav: NAV,
};
