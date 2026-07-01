export type ChecklistItem = { id: string; label: string };
export type ChecklistGroup = { title: string; items: ChecklistItem[] };

export const PROGRESS_INTRO =
  "A checklist across every part of this guide — pitches, study topics, flashcard categories, and the senior readiness signals. Tick items as you feel solid on them; progress is saved in this browser.";

export const CHECKLIST_GROUPS: ChecklistGroup[] = [
  {
    title: "🎥 Pitches recorded & reviewed",
    items: [
      { id: "pg-p1", label: "01 · 30-second intro" },
      { id: "pg-p2", label: "02 · 60-second intro" },
      { id: "pg-p3", label: "03 · 2-minute career story" },
      { id: "pg-p4", label: "04 · Why Next.js" },
      { id: "pg-p5", label: "05 · Why this company / role" },
      { id: "pg-p6", label: "06 · Deep-dive: RSC + the App Router mental model" },
      { id: "pg-p7", label: "07 · STAR: performance problem" },
      { id: "pg-p8", label: "08 · STAR: technical trade-off" },
      { id: "pg-p9", label: "09 · Explain simply: Server vs Client Components" },
      { id: "pg-p10", label: "10 · Questions to ask them" },
    ],
  },
  {
    title: "📚 Study — App Router core (can explain out loud)",
    items: [
      { id: "pg-s1", label: "The App Router mental model & the RSC payload" },
      { id: "pg-s2", label: "File-system routing & project structure" },
      { id: "pg-s3", label: "Server vs Client Components + interleaving" },
      { id: "pg-s4", label: "Rendering strategies (static / dynamic / streaming)" },
      { id: "pg-s5", label: "Cache Components: \"use cache\", cacheLife, cacheTag" },
      { id: "pg-s6", label: "The previous caching model (fetch options, route config)" },
      { id: "pg-s7", label: "Streaming & Suspense as the dynamic hole" },
      { id: "pg-s8", label: "Data fetching patterns (parallel, preload, use())" },
      { id: "pg-s9", label: "Server Functions & Server Actions" },
      { id: "pg-s10", label: "Mutations & revalidation (revalidateTag/updateTag/refresh)" },
      { id: "pg-s11", label: "Dynamic, parallel & intercepting routes" },
      { id: "pg-s13", label: "proxy.ts (formerly middleware.ts)" },
    ],
  },
  {
    title: "📚 Study — rendering, performance & platform",
    items: [
      { id: "pg-s14", label: "Route Handlers vs Server Actions vs Server Components" },
      { id: "pg-s15", label: "Metadata, SEO & next/font" },
      { id: "pg-s16", label: "Image & font optimization" },
      { id: "pg-s17", label: "Async request APIs (cookies/headers/params as Promises)" },
      { id: "pg-s18", label: "Authentication & authorization patterns" },
      { id: "pg-s19", label: "Performance & Turbopack" },
      { id: "pg-s20", label: "Testing & deployment" },
    ],
  },
  {
    title: "🧠 Flashcard categories cleared (Known)",
    items: [
      { id: "pg-c-core", label: "Core (App Router)" },
      { id: "pg-c-rendering", label: "Rendering & Caching" },
      { id: "pg-c-data", label: "Data & Server Actions" },
      { id: "pg-c-routing", label: "Routing" },
      { id: "pg-c-perf", label: "Performance" },
      { id: "pg-c-auth", label: "Auth" },
      { id: "pg-c-testing", label: "Testing" },
      { id: "pg-c-security", label: "Security" },
    ],
  },
  {
    title: "🛠 Practice solved",
    items: [
      { id: "pg-pr-cache-components", label: "Coding: cache a Server Component with Cache Components" },
      { id: "pg-pr-server-action-form", label: "Coding: Server Action form with useActionState" },
      { id: "pg-pr-optimistic-like", label: "Coding: optimistic like button with useOptimistic" },
      { id: "pg-pr-boundary-bug", label: "Coding: spot the Server/Client boundary bug" },
      { id: "pg-pr-debounced-search", label: "Coding: debounced search driving a Server Component" },
      { id: "pg-pr-proxy-auth", label: "Coding: route protection with proxy.ts" },
      { id: "pg-pr-streaming-list", label: "Coding: streamed, paginated list with Suspense" },
      { id: "pg-pr-catalog-rendering", label: "Design: rendering strategy for an e-commerce catalog" },
      { id: "pg-pr-multitenant-dashboard", label: "Design: multi-tenant SaaS dashboard data & caching" },
      { id: "pg-pr-cache-migration-rollout", label: "Design: safe Cache Components migration rollout" },
      { id: "pg-pr-observability-nextjs", label: "Design: observability for a Next.js app in production" },
    ],
  },
  {
    title: "✅ Senior readiness signals",
    items: [
      { id: "pg-r1", label: "Explain Server vs Client Components and the RSC payload cold" },
      { id: "pg-r2", label: "Explain Cache Components (\"use cache\", cacheLife, cacheTag) end to end" },
      { id: "pg-r3", label: "State the caching-layer trade-off out loud in design rounds" },
      { id: "pg-r4", label: "Design a rendering strategy for a real page inventory" },
      { id: "pg-r5", label: "Secure a Server Action (auth checks, not just a hidden button)" },
      { id: "pg-r6", label: "Reason about revalidateTag vs updateTag vs refresh" },
      { id: "pg-r7", label: "Profile and fix a Core Web Vitals regression" },
      { id: "pg-r8", label: "Explain proxy.ts's Node.js-only runtime trade-off vs edge middleware" },
      { id: "pg-r9", label: "Design a safe rollout plan for a caching/rendering migration" },
      { id: "pg-r10", label: "Have 4 sharp questions ready for the interviewer" },
    ],
  },
];
