import type { PrepConfig } from "@gerardocordero/prep-kit";
import { NAV } from "@/lib/nav";

// The single per-app config consumed by the shared prep-kit. Content
// (flashcards/prompts/quiz/study) is passed route-scoped from each page, not here.
export const prepConfig: PrepConfig = {
  storagePrefix: "iosprep",
  appId: "ios-prep",
  brand: {
    logoText: "iOS",
    title: "Dev Study Guide",
    footerText:
      "iOS development study guide · Swift, SwiftUI & the whole stack. Learn it, say it out loud, drill it, repeat.",
  },
  ai: {
    systemPrompt:
      "You are a concise, encouraging senior iOS (Swift & SwiftUI) interview coach. Answer in a few short sentences or a tight list. Be accurate and practical.",
    placeholder: "Ask anything about iOS interviews…",
  },
  nav: NAV,
};
