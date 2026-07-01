// Architecture guide — frontend/full-stack system design mapped onto Next.js 16 / React 19.
export type ArchSection = { id: string; num: string; title: string; html: string };
export type DeepDive = { id: string; pill: string; title: string; html: string };

export const ARCH_INTRO =
  "A senior-level tour of frontend and full-stack system design, mapped onto Next.js 16.2 and React 19.2. This is the “how do you think about building a product frontend at scale” material — rendering strategy, caching, data flow, and org structure, with the trade-offs named out loud.";

export const ARCH_SECTIONS: ArchSection[] = [
  {
    id: "arch-1",
    num: "01",
    title: "01 · Thinking in systems for a frontend interview",
    html:
      "<p>Frontend system design is judged the same way backend design is: <b>decision-making before code</b>, narrated. A structured flow keeps you from free-associating about component names:</p>" +
      "<table><tr><th>Step</th><th>What you do</th><th>Time</th></tr>" +
      "<tr><td><b>Clarify</b></td><td>Who's the user, what devices/networks, how many pages, personalized or not, SEO requirement, expected traffic/read-write ratio. Most candidates skip straight to component trees.</td><td>~15%</td></tr>" +
      "<tr><td><b>Rough architecture</b></td><td>Page inventory → rendering mode per page → data sources → where state lives. A sitemap, not a component diagram.</td><td>~20%</td></tr>" +
      "<tr><td><b>Deep dive</b></td><td>Zoom into one piece — the caching/invalidation story, or the state architecture, or the rollout plan.</td><td>~35%</td></tr>" +
      "<tr><td><b>Trade-offs</b></td><td>Name alternatives and why you didn't pick them. The senior signal.</td><td>~20%</td></tr>" +
      "<tr><td><b>Summarize</b></td><td>Recap, flag risks (stale cache, bundle bloat, TTFB), take follow-ups.</td><td>~10%</td></tr></table>" +
      "<div class=\"callout\"><span class=\"lbl\">Senior tell</span> Say the trade-off out loud: “I'll cache this page with a tagged revalidation — I'm trading a few seconds of staleness after a write for a near-zero TTFB on every read.”</div>",
  },
  {
    id: "arch-2",
    num: "02",
    title: "02 · Rendering strategy as the first architectural decision",
    html:
      "<p>Before any component gets designed, decide <b>how each page in the inventory gets its HTML</b> — this single choice drives CDN cacheability, TTFB, infra cost, and personalization for everything downstream.</p>" +
      "<table><tr><th>Page type</th><th>Strategy</th><th>Why</th></tr>" +
      "<tr><td>Marketing / landing</td><td>Static (build-time)</td><td>Same for everyone, cache at the edge indefinitely, near-zero TTFB</td></tr>" +
      "<tr><td>Product / category pages</td><td>ISR or Cache Components (<code>\"use cache\"</code>)</td><td>Mostly-static content that changes on a schedule or on a write — tag-based revalidation instead of a blanket rebuild</td></tr>" +
      "<tr><td>Dashboards</td><td>Dynamic + Suspense-streamed</td><td>Per-user data, but a cached shell (nav/layout) can still ship instantly while widgets stream in</td></tr>" +
      "<tr><td>Checkout</td><td>Fully dynamic</td><td>Correctness (inventory, price, tax) trumps latency; nothing here may be cached</td></tr></table>" +
      "<p>Getting this wrong in either direction is the classic mistake: over-caching a checkout page serves stale prices; making a marketing page fully dynamic burns TTFB and origin compute for content that never changes.</p>",
  },
  {
    id: "arch-3",
    num: "03",
    title: "03 · The caching stack — CDN, framework, browser",
    html:
      "<p>A Next.js response passes through <b>three independent caches</b>, each with its own invalidation mechanism — and a senior answer treats them as one coordinated system, not three separate concerns.</p>" +
      "<table><tr><th>Layer</th><th>What it caches</th><th>Invalidation</th></tr>" +
      "<tr><td>CDN / edge</td><td>Full HTML responses for static/ISR routes</td><td>Purge on deploy, or tag-based purge from <code>revalidateTag</code></td></tr>" +
      "<tr><td>Next.js server</td><td>Rendered output + fetches, per <b>Cache Components</b> (<code>\"use cache\"</code>, <code>cacheLife</code>, <code>cacheTag</code>)</td><td><code>revalidateTag(tag, profile)</code>, <code>updateTag()</code>, time-based <code>cacheLife</code> profiles</td></tr>" +
      "<tr><td>Browser</td><td>Static assets, and the Router Cache for client navigations</td><td><code>Cache-Control</code> headers, immutable hashed filenames</td></tr></table>" +
      "<p>Next 16's <b>Cache Components</b> model (opt in via <code>cacheComponents: true</code>) flips the default: nothing is cached unless a segment or function is explicitly wrapped in <code>\"use cache\"</code>, with a <code>cacheLife</code> profile controlling staleness and <code>cacheTag</code> giving it an invalidation key. This replaces the older implicit fetch/route-segment caching, where a bare <code>fetch</code> could be silently cached and surprise you. Coordinating invalidation means one webhook or Server Action calling <code>revalidateTag</code> has to account for the CDN purge that follows it — a stale CDN entry outlives a fresh server cache if you forget it.</p>",
  },
  {
    id: "arch-4",
    num: "04",
    title: "04 · Data layer & the BFF pattern",
    html:
      "<p>Next.js Server Components and Route Handlers naturally sit as a <b>backend-for-frontend</b>: they aggregate, reshape, and proxy calls to real backend services (REST, GraphQL, gRPC-via-gateway) so the client never talks to five origins directly.</p>" +
      "<p>Put an <b>anti-corruption layer</b> at the BFF boundary — map foreign service DTOs to your app's own types in one place, so an upstream schema change doesn't ripple through every component that reads that data. Fetch <b>in parallel</b>, not in sequence: kick off independent requests before awaiting any of them (or use <code>Promise.all</code>), because a Server Component that awaits fetch A then fetch B serially reproduces the classic request waterfall the client used to have, just moved to the server.</p>" +
      "<div class=\"callout\"><span class=\"lbl\">Client considerations</span> A GraphQL client used from Server Components doesn't need client-side cache normalization (there's no client) — keep it as a thin request layer and let Cache Components own caching. Reserve a full client-side GraphQL/TanStack Query cache for data that's fetched from Client Components after the initial load.</div>",
  },
  {
    id: "arch-5",
    num: "05",
    title: "05 · State management architecture",
    html:
      "<p>The first design decision isn't <i>which library</i> — it's <b>which category a piece of state belongs to</b>, because each category has a natural home in Next.js:</p>" +
      "<table><tr><th>State kind</th><th>Lives in</th><th>Example</th></tr>" +
      "<tr><td>Server state</td><td>Fetched in a Server Component, cached via Cache Components</td><td>Product catalog, user profile</td></tr>" +
      "<tr><td>URL state</td><td><code>searchParams</code> / route segments</td><td>Filters, pagination, selected tab — shareable, back-button-friendly</td></tr>" +
      "<tr><td>Client UI state</td><td>Local <code>useState</code>, or a client store for cross-tree state</td><td>Modal open/closed, form draft, optimistic UI</td></tr></table>" +
      "<p>Reach for a client state library (Zustand, Jotai, TanStack Query) only when state is genuinely <b>client-owned and cross-cutting</b> — a shopping cart open across routes, or client-side caching of data fetched after hydration. Server Components + Server Actions handle far more than teams expect without one: form submission, revalidation, and redirects can all happen server-side with no client store at all. When state does need to reach deep children, prefer the <b>interleaving/children pattern</b> (pass pre-rendered Server Component output down as <code>children</code>/props) over reaching for Context — Context re-renders every consumer on every change and forces the provider's subtree to be a Client Component.</p>",
  },
  {
    id: "arch-6",
    num: "06",
    title: "06 · Monorepo & scaling the frontend org",
    html:
      "<p>Structure by <b>feature</b>, not by file type — a <code>features/checkout/</code> folder with its own components, hooks, and actions colocated beats a top-level <code>components/</code>, <code>hooks/</code>, <code>actions/</code> split that forces you to open five folders to change one flow.</p>" +
      "<p>A shared <b>design-system package</b> (tokens, primitives, a handful of composed components) is the highest-leverage investment for a multi-team org — it's what keeps ten teams' UIs looking like one product. Draw <b>ownership boundaries</b> along features/domains, enforced by folder structure and code-owners, not by which framework file a piece of code happens to live in.</p>" +
      "<div class=\"callout warn\"><span class=\"lbl\">Escape hatch, not a default</span> Micro-frontends (Module Federation, or multiple Next.js apps stitched via <b>multi-zone</b> routing) buy independent deploys and independent tech choices at the cost of duplicated framework runtime, cross-app navigation complexity, and a harder design-consistency problem. Earn them with a concrete need (a team that must ship on its own cadence) — don't reach for them because the org chart has multiple teams.</div>",
  },
  {
    id: "arch-7",
    num: "07",
    title: "07 · Edge, CDN & global delivery",
    html:
      "<p>Static assets (JS/CSS bundles, images, fonts) belong on a <b>CDN</b> with immutable, hashed filenames — cache forever, invalidate by changing the URL, not by purging. Images get edge-optimized (resize/format/quality negotiated per-request, typically via <code>next/image</code>) so a phone on a slow network doesn't download a desktop-sized asset.</p>" +
      "<p>Next 16 changed the edge story: <code>proxy.ts</code> (Node.js runtime) replaces the deprecated, edge-only <code>middleware.ts</code>. That's a real trade-off, not a rename — a Node.js runtime has the full Node API surface (useful for anything beyond header/cookie inspection and redirects) but loses the near-zero cold-start, run-at-every-PoP characteristics of the old edge runtime. Design proxy logic assuming it runs close to, but not literally at, every edge location.</p>" +
      "<p>For <b>streaming SSR</b> across regions, the shell can be served from the CDN edge while the dynamic/streamed parts still round-trip to an origin region — so multi-region deployment of the origin (or picking a region close to the majority of users) matters more than it did for pure static sites. The metric that actually tells you if this architecture is working is <b>cache-hit ratio</b> at the CDN: a low hit ratio on pages you believed were static means your rendering-strategy decision (Section 02) or your cache tags (Section 03) are wrong somewhere.</p>",
  },
  {
    id: "arch-8",
    num: "08",
    title: "08 · Observability & shipping safely",
    html:
      "<p>Ship frontend changes with the same rigor as backend ones. <b>Core Web Vitals</b> (LCP, INP, CLS) need real-user monitoring (RUM), not just lab/Lighthouse scores — a synthetic run on a fast laptop hides what a mid-tier phone on 4G actually experiences. Pair RUM with <b>error tracking</b> on both sides: client-side (unhandled exceptions, failed hydration) and server-side (Server Component/Route Handler/Server Action errors), since a caching bug can silently serve broken HTML that no client-side error ever fires for.</p>" +
      "<p><b>Feature flags</b> are the safety valve for a risky architectural change — gradually rolling out a <b>Cache Components migration</b> route-by-route behind a flag lets you compare cache-hit ratio and error rate for the flagged cohort before flipping it globally (see Deep Dive 4).</p>" +
      "<table><tr><th>Deployment model</th><th>Fits</th><th>Cost</th></tr>" +
      "<tr><td><code>output: \"export\"</code> (fully static)</td><td>No Server Components/Actions, no ISR/Cache Components — pure static hosting (S3/CDN)</td><td>Cheapest, most limited</td></tr>" +
      "<tr><td>Node/Edge server platform</td><td>Full feature set: streaming, Server Actions, Cache Components, <code>proxy.ts</code></td><td>Higher ops surface, but the only option once you need any of the above</td></tr></table>" +
      "<p>Note that Next 16 removed the build-time <b>“First Load JS”</b> metric from the CLI output — bundle-size regressions now have to be caught via Lighthouse CI or a RUM/analytics dashboard instead of a build-log number, which is one more reason RUM isn't optional.</p>",
  },
];

export const DEEPDIVES_INTRO =
  "Five classic frontend/full-stack system-design prompts, each as Concept → Example → Gotcha → Senior answer. These are the ones interviewers reach for when hiring for a Next.js role — rehearse the trade-offs out loud.";

export const DEEP_DIVES: DeepDive[] = [
  {
    id: "dd-ecommerce-rendering",
    pill: "System design",
    title: "Design the rendering strategy for a large e-commerce site",
    html:
      "<div class=\"dd-row\">" +
      "<div class=\"dd-block dd-concept\"><span class=\"lbl\">Concept</span> Not every page on the same site gets the same rendering mode. Product/category pages are read-heavy and mostly-static; search/personalized pages are per-user; checkout is correctness-critical. Pick per page type, not per site.</div>" +
      "<div class=\"dd-block dd-example\"><span class=\"lbl\">Example</span> Product pages: ISR or Cache Components with <code>cacheTag(`product:${id}`)</code>, revalidated on price/inventory writes. Search/personalized results: dynamic, Suspense-streamed so the shell (nav, filters skeleton) paints immediately while results stream in. Checkout: fully dynamic, no <code>\"use cache\"</code> anywhere in the tree.</div>" +
      "<div class=\"dd-block dd-problem\"><span class=\"lbl\">Gotcha</span> An over-eager cache shows stale inventory or price — a customer adds an out-of-stock item to cart, or checks out at yesterday's price. This is the single most common e-commerce architecture bug, and it comes from tagging too coarsely (one tag for the whole catalog) or setting <code>cacheLife</code> too long on inventory-sensitive fragments.</div>" +
      "<div class=\"dd-block dd-solution\"><span class=\"lbl\">Senior answer</span> Tag revalidation <b>per product</b>, not per catalog, so a single price change only busts one entry. When an admin edits a price, call <code>updateTag</code> in that same Server Action so the admin's own next read is fresh (read-your-writes) without waiting for background revalidation. Give inventory-sensitive fragments (stock count, “3 left”) a short <code>cacheLife</code> profile independent of the rest of the product page, which can stay cached far longer. Trade-off named out loud: finer tag granularity costs more cache-invalidation plumbing in exchange for fewer stale reads.</div>" +
      "</div>",
  },
  {
    id: "dd-realtime-dashboard",
    pill: "System design",
    title: "Design a real-time-feeling dashboard with Next.js",
    html:
      "<div class=\"dd-row\">" +
      "<div class=\"dd-block dd-concept\"><span class=\"lbl\">Concept</span> A dashboard is really two different pages sharing a layout: a mostly-static shell (nav, filters, layout chrome) and a set of volatile widgets (live counters, charts) that need to feel current. Treat them differently instead of making the whole route dynamic.</div>" +
      "<div class=\"dd-block dd-example\"><span class=\"lbl\">Example</span> Cache the shell with Cache Components. Wrap each live widget in its own <code>&lt;Suspense&gt;</code> boundary so it streams independently; poll on an interval for widgets where near-real-time is fine, or a WebSocket/SSE connection for genuinely live data (trading price, live viewer count). For a one-off refresh after a user action (“Refresh” button, or after submitting a filter), call the Server Actions <code>refresh()</code> API to re-run uncached server work without a full page reload.</div>" +
      "<div class=\"dd-block dd-problem\"><span class=\"lbl\">Gotcha</span> Two failure modes in opposite directions: over-fetching (re-running every widget's query on every render/poll tick, even ones the user isn't looking at) burns server load; and making the <b>whole page</b> dynamic to get live data anywhere on it kills TTFB for the 90% of the dashboard that's actually static (nav, layout, historical charts).</div>" +
      "<div class=\"dd-block dd-solution\"><span class=\"lbl\">Senior answer</span> Cache the shell, stream or poll <b>only</b> the volatile widgets, and scope each widget's own cache/staleness independently — a live counter and a 24-hour trend chart on the same screen do not need the same freshness. Use <code>refresh()</code> for user-triggered updates instead of <code>location.reload()</code>, which throws away the cached shell you just paid to keep fast. Trade-off: per-widget streaming is more Suspense boundaries to manage than one dynamic page, in exchange for a shell that loads instantly regardless of how slow the live data is.</div>" +
      "</div>",
  },
  {
    id: "dd-cms-blog",
    pill: "System design",
    title: "Design the caching/invalidation strategy for a multi-author CMS-backed blog",
    html:
      "<div class=\"dd-row\">" +
      "<div class=\"dd-block dd-concept\"><span class=\"lbl\">Concept</span> Content pages are cache-aside: render once, cache with a tag identifying that content, and let a webhook from the CMS drive invalidation instead of polling or a fixed TTL that's either too short (wasted cache) or too long (stale after publish).</div>" +
      "<div class=\"dd-block dd-example\"><span class=\"lbl\">Example</span> Each post page uses <code>cacheTag(`post:${slug}`)</code> and <code>cacheTag(`author:${authorId}`)</code>. The CMS fires a webhook on publish/edit → a Route Handler validates it and calls <code>revalidateTag('post:my-slug', 'max')</code>, purging just that entry (and the CDN in front of it) instead of rebuilding the whole site.</div>" +
      "<div class=\"dd-block dd-problem\"><span class=\"lbl\">Gotcha</span> Two authors publishing near-simultaneously can race: author A's webhook revalidates, then author B's slower webhook lands and momentarily serves a half-updated cache during the overlap window. Separately, tagging too finely (a tag per paragraph or per related-post relationship) causes <b>tag cardinality explosion</b> — thousands of tags to track for marginal invalidation precision.</div>" +
      "<div class=\"dd-block dd-solution\"><span class=\"lbl\">Senior answer</span> Pick tag granularity deliberately: per-post is almost always the right unit; per-category tags are useful for list pages but should stay coarse. Use the <code>'max'</code> <code>cacheLife</code> profile with background stale-while-revalidate for the bulk of read traffic — most readers can tolerate a few seconds of staleness after a publish. Reserve <code>updateTag</code> for the <b>publishing author's own session</b>, so they see their edit immediately (read-your-writes) without forcing that same aggressive freshness on every other reader. Trade-off: coarser tags mean occasionally over-invalidating (purging more than strictly changed) in exchange for a invalidation graph a human can actually reason about.</div>" +
      "</div>",
  },
  {
    id: "dd-cache-components-migration",
    pill: "System design",
    title: "Design safe rollout of a Cache Components migration on an existing app",
    html:
      "<div class=\"dd-row\">" +
      "<div class=\"dd-block dd-concept\"><span class=\"lbl\">Concept</span> Turning on <code>cacheComponents: true</code> flips the caching default for the whole app at once: fetches and route segments that were implicitly cached under the old model become <b>uncached by default</b> unless explicitly wrapped in <code>\"use cache\"</code>. That's not a config tweak — it's a behavioral migration that needs an incremental rollout path, not a single flag flip in production.</div>" +
      "<div class=\"dd-block dd-example\"><span class=\"lbl\">Example</span> Adopt route-by-route: either run the flag behind a feature flag that only affects a subset of routes (e.g. via multiple root layouts, one opted-in and one not, selected by route group), or migrate one route segment at a time in separate PRs, auditing every runtime-API usage (<code>cookies()</code>, <code>headers()</code>, <code>searchParams</code>) in that segment for a needed Suspense boundary before flipping it.</div>" +
      "<div class=\"dd-block dd-problem\"><span class=\"lbl\">Gotcha</span> Flipping the flag globally without a per-route rollout silently changes cache behavior for the <b>entire app</b> at once — pages that were fast because of implicit caching can suddenly hit the origin on every request (worse: some can go fully dynamic without a Suspense boundary in place, breaking the build or the page).</div>" +
      "<div class=\"dd-block dd-solution\"><span class=\"lbl\">Senior answer</span> Canary a single low-risk route first (something read-heavy but not revenue-critical), and use build output plus tooling like the <code>next-devtools-mcp</code> to verify what actually got statically shelled vs. streamed vs. fully dynamic before trusting your mental model of the change. Roll out gradually route group by route group, watching cache-hit ratio and TTFB per route as the migration proceeds, with the pre-migration behavior as an instant rollback (revert the flag for that route group). Trade-off: a route-by-route rollout takes longer than a single flag flip, in exchange for never finding out about a regression from a production incident.</div>" +
      "</div>",
  },
  {
    id: "dd-multi-team-architecture",
    pill: "Frontend design",
    title: "Design the component/state architecture for a large multi-team Next.js app",
    html:
      "<div class=\"dd-row\">" +
      "<div class=\"dd-block dd-concept\"><span class=\"lbl\">Concept</span> At multi-team scale, the architecture question stops being “how do I structure one feature” and becomes “how do teams work on this app without stepping on each other” — folder structure, shared UI, and where server-side logic lives all have to encode team boundaries.</div>" +
      "<div class=\"dd-block dd-example\"><span class=\"lbl\">Example</span> Feature folders (<code>features/checkout/</code>, <code>features/search/</code>) each own their components, Server Actions, and tests. Server Actions live <b>colocated</b> with the feature that uses them by default; only truly cross-cutting actions (auth, analytics) go in a shared <code>actions/</code> module. A shared UI package holds only genuinely reusable primitives (Button, Input, layout tokens) — feature-specific composites stay in the feature folder even if they look reusable at first.</div>" +
      "<div class=\"dd-block dd-problem\"><span class=\"lbl\">Gotcha</span> A shared Client Component that wraps too much of the tree (a top-level <code>&lt;Providers&gt;</code> client wrapper holding onto everything from theme to analytics to a state library) drags every page's bundle up with it and forces server-rendered subtrees underneath it to hydrate as client code even when they didn't need to. This is the multi-team version of a God Context — everyone imports it, no one can safely change what's inside it.</div>" +
      "<div class=\"dd-block dd-solution\"><span class=\"lbl\">Senior answer</span> Push <code>\"use client\"</code> to the <b>leaves</b> — the smallest component that actually needs interactivity, not the top of the tree — so Server Components stay the default and client bundle growth is attributable to a specific feature, not a shared root. Since Next 16 removed the build's “First Load JS” metric, measure bundle impact with route-level awareness via Lighthouse CI or Vercel Analytics instead, and gate PRs on a regression there rather than eyeballing a build log. Give each team folder-level ownership (enforced via code-owners) so the boundary is structural, not just a convention people forget. Trade-off: colocating Server Actions per feature means some duplication across features versus one shared module, in exchange for teams being able to change their own actions without a cross-team review.</div>" +
      "</div>",
  },
];
