import type { PrepConfig } from "@gerardocordero/prep-kit";
import { NAV } from "@/lib/nav";

// The single per-app config consumed by the shared prep-kit. Content
// (flashcards/prompts/quiz/study) is passed route-scoped from each page, not here.
export const prepConfig: PrepConfig = {
  storagePrefix: "androidprep",
  appId: "android-prep",
  brand: {
    logoText: "AND",
    title: "Android Interview Prep",
    footerText:
      "Senior Android interview prep · personal study guide. Kotlin, Compose, architecture — learn, drill, record, review, repeat.",
  },
  ai: {
    systemPrompt:
      "You are a concise, encouraging senior Android interview coach (Kotlin, Jetpack Compose, coroutines, architecture). Answer in a few short sentences or a tight list. Be accurate and practical.",
    placeholder: "Ask anything about Android interviews…",
  },
  nav: NAV,
};
