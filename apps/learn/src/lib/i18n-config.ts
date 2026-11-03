// Server-safe i18n constants — no "use client", no React.
// Used by server components (layouts, page generators).

export type Locale = "en" | "es";

export interface LocaleInfo {
  id: Locale;
  labelEn: string;
  labelNative: string;
}

export const LOCALES: LocaleInfo[] = [
  { id: "en", labelEn: "English", labelNative: "English" },
  { id: "es", labelEn: "Spanish", labelNative: "Español" },
];

// Course catalog: the single source of truth for the course ids the router
// generates and the homepage renders. Adding a course means adding one entry
// here (plus the lessons dir and the script/tool registrations listed in
// AGENTS.md), not editing two lists that can drift apart.
export const COURSES = [
  { id: "ios", title: "iOS & Swift", emoji: "📱" },
  { id: "android", title: "Android & Kotlin", emoji: "🤖" },
  { id: "ruby", title: "Ruby & Rails", emoji: "💎" },
  { id: "python", title: "Python & FastAPI", emoji: "🐍" },
  { id: "go", title: "Go Backend", emoji: "▲" },
  { id: "rust", title: "Rust & Axum", emoji: "🦀" },
  { id: "node", title: "Node.js & NestJS", emoji: "▲" },
  { id: "native", title: "Native RN & Expo Modules", emoji: "🛰️" },
  { id: "expoui", title: "Rebuild @expo/ui", emoji: "🎛️" },
] as const;

export const COURSE_IDS = COURSES.map((course) => course.id);
