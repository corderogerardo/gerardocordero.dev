import type { Level } from "@/lib/levels";

export type RoadmapStage = {
  level: Level;
  summary: string;
  /** What you can already do at this level. */
  can: string[];
  /** What to learn to reach the next level. */
  next: string[];
  /** Where to drill in this app (rendered as rich HTML with links). */
  drillHtml: string;
};

export const ROADMAP: RoadmapStage[] = [
  {
    level: "junior",
    summary:
      "You ship pages and components with guidance. The goal is fluency in the App Router's fundamentals — file-system routing, the Server/Client Component split, and basic data fetching — so you can build a working page end to end.",
    can: [
      "Create routes with the file-system convention: page.tsx, layout.tsx, loading.tsx, not-found.tsx.",
      "Explain, at a surface level, that components are Server Components by default and \"use client\" opts into the client.",
      "Fetch data in a Server Component with async/await and render it directly.",
      "Use next/image and next/font so images and type don't tank Lighthouse out of the box.",
      "Read route params and searchParams in a page component.",
    ],
    next: [
      "Dynamic routing depth: catch-all segments, route groups, and generateStaticParams.",
      "The caching model — what's cached by default and why a page suddenly goes stale or static.",
      "Mutating data with Server Actions instead of hand-rolled API routes.",
      "Write your first component and route tests with Jest/RTL.",
    ],
    drillHtml:
      'Drill the <a href="/flashcards">flashcards</a> filtered to <b>Junior</b>, plus the <b>Core</b> and <b>Routing</b> categories. Read study topics <a href="/study#st-1">01</a>, <a href="/study#st-2">02</a>, <a href="/study#st-11">11</a>, and <a href="/study#st-16">16</a>.',
  },
  {
    level: "mid",
    summary:
      "You own a route end to end — data, layout, tests — with little hand-holding. The goal is depth across the App Router's everyday toolkit: layered routing, the previous caching model, and Server Actions for real forms.",
    can: [
      "Reach for route groups, parallel routes, and intercepting routes when the URL structure calls for them.",
      "Tune fetch caching with { cache, next: { revalidate, tags } } and invalidate it with revalidatePath/revalidateTag.",
      "Build a form on a Server Action with pending/error states, not a client-side fetch to a hand-rolled API route.",
      "Gate a route behind auth with a check in a layout or middleware and redirect appropriately.",
      "Write unit tests for components and routes with Jest and React Testing Library.",
    ],
    next: [
      "Cache Components depth: \"use cache\", cacheLife, cacheTag, and how they replace the old fetch-cache mental model.",
      "Performance profiling: reading the RSC payload, trimming client bundles, chasing Core Web Vitals with real tooling.",
      "Security hardening: the data access layer, avoiding secret leakage into client bundles, CSRF on Server Actions.",
      "Frontend system-design thinking: where rendering strategy and caching decisions actually live.",
    ],
    drillHtml:
      'Filter flashcards to <b>Mid</b> and the <b>Data</b>, <b>Routing</b>, <b>Testing</b>, and <b>Core</b> categories. Work study topics <a href="/study#st-3">03</a>, <a href="/study#st-6">06</a>, <a href="/study#st-9">09</a>, <a href="/study#st-10">10</a>, and <a href="/study#st-20">20</a>.',
  },
  {
    level: "senior",
    summary:
      "You bring rendering, caching, and performance depth, and you raise the team's bar on both speed and safety. The goal is to be the person who profiles instead of guessing and can defend a caching decision under questioning.",
    can: [
      "Explain Cache Components (\"use cache\", cacheLife, cacheTag) and the RSC payload cold, including what actually crosses the wire.",
      "Design auth so it can't be bypassed: checks in proxy.ts for routing plus real checks inside every Server Action and data-access call.",
      "Profile Core Web Vitals with Lighthouse, Chrome DevTools, and Vercel Analytics, then fix the actual bottleneck.",
      "Harden an app against XSS, CSRF, and accidental server-secret leakage into client bundles.",
      "Decide, with reasons, when a route should be static, dynamic, or streamed — and defend the trade-off.",
    ],
    next: [
      "System design at scale: rendering/caching strategy for a whole product, not one route.",
      "Monorepo and shared component-library decisions that other teams build on top of.",
      "Edge delivery: what belongs on the edge, what doesn't, and why.",
      "Driving a safe, staged migration (e.g. adopting Cache Components) across a large codebase.",
    ],
    drillHtml:
      'Filter flashcards to <b>Senior</b> and the <b>Rendering</b>, <b>Perf</b>, <b>Auth</b>, and <b>Security</b> categories. Read study topics <a href="/study#st-5">05</a>, <a href="/study#st-13">13</a>, <a href="/study#st-17">17</a>, <a href="/study#st-18">18</a>, <a href="/study#st-19">19</a>, and the full <a href="/architecture">Architecture guide</a>.',
  },
  {
    level: "architect",
    summary:
      "You design the rendering and caching strategy for a whole product and make the platform decisions that move a whole team. The goal is decision-making before code — for the slowest network, the biggest bundle, and the riskiest migration.",
    can: [
      "Design a rendering/caching strategy for an entire product and justify it route by route.",
      "Own monorepo structure and a shared component library that multiple apps build on.",
      "Make the edge/CDN/deployment-model call and explain what it buys and what it costs.",
      "Drive a large, safe migration — e.g. a staged Cache Components rollout — without a big-bang rewrite.",
      "Set org-wide conventions for data fetching, error boundaries, and testing so teams stop reinventing them.",
    ],
    next: [
      "Org-level platform strategy: golden paths, shared tooling, and how new apps get bootstrapped.",
      "Cost and performance budgets at scale — what a regression actually costs and how you catch it before it ships.",
    ],
    drillHtml:
      'Filter flashcards to <b>Architect</b> and the <b>Rendering</b> and <b>Core</b> categories. Work the full <a href="/architecture">Architecture guide</a> and the <a href="/practice">system-design prompts</a>.',
  },
  {
    level: "beyond",
    summary:
      "The frontier — where you push what a Next.js frontend can do. The goal is to bring genuinely new capability and pioneer the patterns the rest of the team will eventually adopt.",
    can: [
      "Pioneer Cache Components adoption patterns before they're common knowledge on the team.",
      "Build streaming AI UIs — SSE or the use() hook with Suspense — for LLM responses that render as they arrive.",
      "Use View Transitions and <Activity> to make navigation feel app-like instead of page-reload-like.",
      "Contribute rendering and caching patterns upstream, back into the framework's ecosystem or internal tooling.",
    ],
    next: [
      "Keep tracking the framework's edge — new primitives land fast, and being early is the whole point of this level.",
    ],
    drillHtml:
      'Filter flashcards to <b>Beyond</b>, and read study topics <a href="/study#st-5">05</a>, <a href="/study#st-9">09</a>. Try the <a href="/practice">streaming-UI and migration design prompts</a>.',
  },
];
