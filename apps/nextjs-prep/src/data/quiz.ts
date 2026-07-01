// Multiple-choice quiz — Next.js App Router fundamentals (Next 16.2 / React 19.2):
// core, rendering & caching, data & Server Actions, routing, performance, auth,
// testing, security.
import type { Level } from "@/lib/levels";

export type QuizQuestion = {
  id: string;
  category: string;
  categoryLabel: string;
  question: string;
  options: string[];
  answer: number; // index of the correct option
  explanationHtml: string;
  level?: Level;
};

export const QUIZ: QuizQuestion[] = [
  {
    id: "qz1",
    category: "core",
    categoryLabel: "Core (App Router)",
    question: "In `app/`, why does adding a `loading.tsx` next to a `page.tsx` change what gets streamed?",
    options: [
      "It doesn't — loading.tsx only affects client-side navigations",
      "Next wraps the page (and its children) in a <Suspense> boundary with loading.tsx as the fallback",
      "It disables server rendering for that route",
      "It forces the page to become a Client Component",
    ],
    answer: 1,
    explanationHtml:
      "<p>A sibling <code>loading.tsx</code> is sugar for wrapping the segment's content in <code>&lt;Suspense fallback={&lt;Loading /&gt;}&gt;</code>, so the shell can stream immediately while the page's async work resolves.</p>",
  },
  {
    id: "qz2",
    category: "core",
    categoryLabel: "Core (App Router)",
    question: "A Server Component imports a component from a file marked `\"use client\"` and renders it as a normal child element. What ships to the browser?",
    options: [
      "Nothing from the client component — it's inlined server-side",
      "The whole parent tree becomes client-rendered",
      "Only that client component's module (and its own imports) cross the boundary; the server parent still renders on the server",
      "It throws a build error because Server Components can't import Client Components",
    ],
    answer: 2,
    explanationHtml:
      "<p><code>\"use client\"</code> marks a <b>module-graph boundary</b>, not a subtree boundary. Importing and directly rendering a client module ships that module to the client, but the server component around it still renders server-side and can pass server-computed props/children in.</p>",
  },
  {
    id: "qz3",
    category: "core",
    categoryLabel: "Core (App Router)",
    question: "You have `@team` and `@analytics` parallel route slots under a layout in Next 16. The build fails with a missing-fallback error. What's missing?",
    options: [
      "A `loading.tsx` in the parent layout",
      "A `default.js` in each slot that lacks one",
      "A `generateStaticParams` export",
      "A `not-found.tsx` at the app root",
    ],
    answer: 1,
    explanationHtml:
      "<p>Next 16 <b>requires an explicit <code>default.js</code> per parallel-route slot</b> — Next can no longer infer a fallback when a slot has no matching segment for the current URL, so the build fails without one.</p>",
  },
  {
    id: "qz4",
    category: "rendering",
    categoryLabel: "Rendering & Caching",
    question: "With `cacheComponents: true` in `next.config.ts`, a component calls `headers()` directly and is NOT wrapped in `<Suspense>`. What happens?",
    options: [
      "It silently falls back to static rendering",
      "Next throws an error: uncached data was accessed outside of a Suspense boundary",
      "It renders fine but caches the request headers forever",
      "Nothing — Suspense is only needed for `\"use cache\"` functions",
    ],
    answer: 1,
    explanationHtml:
      "<p>Under Cache Components, any component reading a runtime/request API (<code>headers()</code>, <code>cookies()</code>, uncached <code>fetch</code>, etc.) must be inside a <code>&lt;Suspense&gt;</code> boundary so Next can prerender a static shell and stream the dynamic part in. Without one, it's a build/runtime error, not a silent fallback.</p>",
  },
  {
    id: "qz5",
    category: "rendering",
    categoryLabel: "Rendering & Caching",
    question: "What determines the cache key for a function marked `\"use cache\"`?",
    options: [
      "Only the function's arguments",
      "A manually supplied `cacheTag` — nothing else",
      "The function's arguments plus any values closed over from the enclosing scope",
      "The route's URL only",
    ],
    answer: 2,
    explanationHtml:
      "<p>Next derives the cache key automatically from the function's <b>arguments and closed-over values</b> — no manual key-building. <code>cacheLife()</code>/<code>cacheTag()</code> from <code>next/cache</code> tune expiry and invalidation on top of that, they don't define the key.</p>",
  },
  {
    id: "qz6",
    category: "rendering",
    categoryLabel: "Rendering & Caching",
    question: "Without `cacheComponents` enabled (the older default model), what's the default caching behavior of `fetch()` in a Server Component?",
    options: [
      "Cached forever unless revalidated",
      "Uncached by default — opt in via `cache: 'force-cache'` or `next: { revalidate, tags }`",
      "Cached for 60 seconds by default",
      "Cached only in production builds",
    ],
    answer: 1,
    explanationHtml:
      "<p>Outside Cache Components, plain <code>fetch()</code> is <b>uncached by default</b> in the App Router — you opt into caching per-call with <code>cache: 'force-cache'</code> or <code>next: { revalidate, tags }</code>. This is easy to mix up with the Pages Router / pre-13 mental model.</p>",
  },
  {
    id: "qz7",
    category: "data",
    categoryLabel: "Data & Server Actions",
    question: "A Server Function (`\"use server\"`) is only ever called from a `<form action={...}>` in the UI. Is it safe to skip an auth check inside it?",
    options: [
      "Yes, the form only renders for authorized users",
      "No — Server Functions compile to a POST endpoint that's directly reachable, so auth must be checked inside the function itself",
      "Yes, as long as the form has a hidden CSRF token",
      "No, but only because middleware can't protect Server Actions",
    ],
    answer: 1,
    explanationHtml:
      "<p>Every Server Function is exposed as a POST endpoint under the hood and can be hit directly, bypassing your UI entirely. Auth/authorization must be re-verified <b>inside every action</b> — never trust that the calling UI gated access.</p>",
  },
  {
    id: "qz8",
    category: "data",
    categoryLabel: "Data & Server Actions",
    question: "In Next 16, what's new about `revalidateTag()` compared to earlier versions?",
    options: [
      "It now requires a second `cacheLife` profile argument (e.g. `revalidateTag(tag, 'max')`) for stale-while-revalidate behavior",
      "It was renamed to `updateTag()`",
      "It can only be called from Route Handlers now",
      "It no longer accepts an array of tags",
    ],
    answer: 0,
    explanationHtml:
      "<p>Next 16 makes the second argument — a <code>cacheLife</code> profile controlling stale-while-revalidate — effectively required; the old single-argument form is deprecated. <code>updateTag()</code> is a separate, new API for read-your-writes inside Server Actions.</p>",
  },
  {
    id: "qz9",
    category: "data",
    categoryLabel: "Data & Server Actions",
    question: "Inside a Server Action, you want the current request to immediately see the effect of a cache invalidation (read-your-writes), not just eventually. Which API is designed for that?",
    options: [
      "`revalidatePath()`",
      "`refresh()`",
      "`updateTag(tag)` — expires and refreshes the tag within the same request",
      "`cacheTag(tag)`",
    ],
    answer: 2,
    explanationHtml:
      "<p><code>updateTag()</code> is new in Next 16, Server-Actions-only, and gives <b>read-your-writes</b> semantics: it expires the tag and refreshes affected data in the same request/response cycle. <code>refresh()</code> instead re-renders uncached/dynamic UI without touching the cache at all.</p>",
  },
  {
    id: "qz10",
    category: "routing",
    categoryLabel: "Routing",
    question: "You submit two `<form action={fnA}>` and `<form action={fnB}>` in quick succession from the client. How does Next 16 dispatch these Server Functions?",
    options: [
      "In parallel, always",
      "One at a time, sequentially, in the order they were triggered",
      "Randomly, whichever resolves first",
      "It batches them into a single request",
    ],
    answer: 1,
    explanationHtml:
      "<p>Server Function calls from the client are dispatched <b>sequentially, one at a time</b> — the second call waits for the first to settle. This avoids racing mutations against each other but means you shouldn't assume true concurrency for independent actions.</p>",
  },
  {
    id: "qz11",
    category: "routing",
    categoryLabel: "Routing",
    question: "You rename `middleware.ts` to `proxy.ts` and rename the exported function to `proxy` for a Next 16 upgrade. What else changes in behavior?",
    options: [
      "Nothing — it's a pure rename",
      "It now runs only on the Node.js runtime; there's no edge runtime option like old middleware had",
      "It now only runs for API routes, not pages",
      "It becomes opt-in via a config flag",
    ],
    answer: 1,
    explanationHtml:
      "<p>Beyond the rename, <code>proxy.ts</code> runs <b>exclusively on the Node.js runtime</b> in Next 16 — the old edge-runtime option for middleware is gone (the deprecated <code>middleware.ts</code> path still works but is on its way out).</p>",
  },
  {
    id: "qz12",
    category: "routing",
    categoryLabel: "Routing",
    question: "A page reads `params` and `searchParams` from its props. In Next 16, what type are they?",
    options: [
      "Plain synchronous objects, as in Next 12",
      "Promises — you must `await` them (or use `use()` in a Client Component)",
      "Synchronous in Server Components, Promises only in Client Components",
      "Streams that must be read with a reader",
    ],
    answer: 1,
    explanationHtml:
      "<p><code>params</code>, <code>searchParams</code>, <code>cookies()</code>, <code>headers()</code>, and <code>draftMode()</code> are all <b>Promise-based</b> — synchronous access was fully removed in Next 16, not just deprecated.</p>",
  },
  {
    id: "qz13",
    category: "perf",
    categoryLabel: "Performance",
    question: "What's the default and stable bundler for both `next dev` and `next build` in Next 16?",
    options: [
      "Webpack, with Turbopack as an opt-in flag",
      "Turbopack — stable and the default for dev and build",
      "esbuild",
      "Vite, via a compatibility shim",
    ],
    answer: 1,
    explanationHtml:
      "<p>Turbopack graduated to <b>stable and default</b> for both dev and build in Next 16. Webpack is still selectable, but you now opt out rather than opt in.</p>",
  },
  {
    id: "qz14",
    category: "perf",
    categoryLabel: "Performance",
    question: "You wrap a slow, non-deterministic operation (e.g. reading `Math.random()` or a timestamp) in `connection()` from `next/server` inside a cached component. What does that achieve?",
    options: [
      "It caches the random value so every request sees the same one",
      "It defers that non-deterministic operation to request time, keeping the surrounding output cacheable up to that point",
      "It disables caching for the entire route",
      "It forces the operation to run at build time only",
    ],
    answer: 1,
    explanationHtml:
      "<p><code>connection()</code> is a signal that <b>defers</b> the code after it to per-request execution, letting Next prerender everything before the call as a static/cached shell while the non-deterministic part runs fresh per request — key to combining Cache Components with dynamic bits.</p>",
  },
  {
    id: "qz15",
    category: "perf",
    categoryLabel: "Performance",
    question: "Why does swapping a large `<img>` for `next/image` typically improve LCP and CLS together?",
    options: [
      "It only improves LCP; CLS needs a separate fix",
      "It automatically serves modern formats/responsive sizes AND reserves layout space from width/height, preventing both slow paints and layout shift",
      "It lazy-loads every image, including the hero image, by default",
      "It converts all images to inline SVGs",
    ],
    answer: 1,
    explanationHtml:
      "<p><code>next/image</code> generates responsive, modern-format sources (smaller payload → better LCP) and enforces intrinsic <code>width</code>/<code>height</code> so the browser reserves space before the image loads (no CLS). Note: the LCP image itself should use <code>priority</code> to avoid being lazy-loaded.</p>",
  },
  {
    id: "qz16",
    category: "auth",
    categoryLabel: "Auth",
    question: "Where is the most reliable place to enforce that a user is authenticated before rendering a protected Server Component's data?",
    options: [
      "Only in `proxy.ts`, redirecting unauthenticated requests",
      "Only in client-side `useEffect`, redirecting if no session cookie exists",
      "A data-access-layer check (e.g. inside the query/fetch functions themselves), in addition to any proxy-level check",
      "Hiding the UI with CSS until the session loads",
    ],
    answer: 2,
    explanationHtml:
      "<p>Proxy-level checks are a useful fast-path/redirect, but they can be bypassed or misconfigured for specific segments. The durable guarantee is a <b>data access layer</b> that re-checks auth right before touching sensitive data — defense in depth, not UI hiding.</p>",
  },
  {
    id: "qz17",
    category: "auth",
    categoryLabel: "Auth",
    question: "A Server Action deletes a resource by `id` passed from a hidden form field. What's the critical check missing if the code only verifies the user is logged in?",
    options: [
      "Nothing — being logged in is sufficient",
      "Verifying the logged-in user actually owns/can act on that specific `id` (authorization, not just authentication)",
      "Rate limiting the action",
      "Validating the `id` is a string",
    ],
    answer: 1,
    explanationHtml:
      "<p>Authentication (who you are) is not authorization (what you're allowed to touch). Any client-supplied identifier — especially from a hidden field — must be checked against the acting user's ownership/permissions inside the action, since the raw POST is directly callable.</p>",
  },
  {
    id: "qz18",
    category: "testing",
    categoryLabel: "Testing",
    question: "You want to unit test a Server Component that's an `async function` awaiting a data call. What's the practical approach?",
    options: [
      "Server Components can't be unit tested at all — only e2e",
      "`await` the component function directly to get its resolved JSX, mocking the data call, then assert on the tree (or test via a rendering harness that supports async components)",
      "Convert it to a Client Component first",
      "Snapshot the raw Promise it returns",
    ],
    answer: 1,
    explanationHtml:
      "<p>Async Server Components are just functions returning a Promise of JSX — mock the data dependency and <code>await</code> the component to get resolved output, or use a testing setup/harness with async-component support, then assert on the result.</p>",
  },
  {
    id: "qz19",
    category: "testing",
    categoryLabel: "Testing",
    question: "You upgrade to Next 16 and your CI step `next lint` starts failing with 'command not found'. Why?",
    options: [
      "`next lint` was renamed to `next check`",
      "`next lint` was removed in Next 16 — lint directly with your own ESLint config/script instead",
      "It only fails on Turbopack builds",
      "It now requires a `--legacy` flag",
    ],
    answer: 1,
    explanationHtml:
      "<p><code>next lint</code> was <b>removed in Next 16</b>. Projects need to run ESLint (or another linter) directly via their own script/config rather than through the Next CLI wrapper.</p>",
  },
  {
    id: "qz20",
    category: "security",
    categoryLabel: "Security",
    question: "A teammate reads a secret with `process.env.STRIPE_SECRET_KEY` inside a file that has `\"use client\"` at the top. What happens?",
    options: [
      "Next automatically strips it and the value is `undefined` in the browser bundle",
      "It's inlined into the client JS bundle at build time, leaking the secret to anyone who views source",
      "It throws a build-time error, refusing to bundle",
      "It works fine because env vars are always server-only",
    ],
    answer: 1,
    explanationHtml:
      "<p>Only variables prefixed <code>NEXT_PUBLIC_</code> are meant for the client; any other <code>process.env.*</code> read inside client-bundled code still gets <b>inlined at build time</b> since bundlers can't distinguish intent — there's no runtime guard. This is a common accidental-leak vector, distinct from the removed <code>serverRuntimeConfig</code>/<code>publicRuntimeConfig</code> APIs.</p>",
  },
  {
    id: "qz21",
    category: "security",
    categoryLabel: "Security",
    question: "Why is a Content-Security-Policy nonce generated per-request (e.g. in `proxy.ts`) rather than hard-coded, when using strict CSP with inline scripts?",
    options: [
      "Per-request nonces are only needed for images",
      "A static/hard-coded nonce could be read from any prior response and reused by an attacker to smuggle their own inline script past the policy",
      "Next requires nonces to rotate for caching reasons only, not security",
      "Nonces are decorative and don't affect CSP enforcement",
    ],
    answer: 1,
    explanationHtml:
      "<p>A CSP nonce only blocks unauthorized inline scripts if it's <b>unguessable and single-use</b>. A hard-coded value defeats the purpose — an attacker who observes it once (view source) can inject a matching <code>nonce</code> attribute on their own script and have it execute.</p>",
  },
];

export const QUIZ_FILTERS = [
  { value: "core", label: "Core (App Router)" },
  { value: "rendering", label: "Rendering & Caching" },
  { value: "data", label: "Data & Server Actions" },
  { value: "routing", label: "Routing" },
  { value: "perf", label: "Performance" },
  { value: "auth", label: "Auth" },
  { value: "testing", label: "Testing" },
  { value: "security", label: "Security" },
];
