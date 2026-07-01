// Next.js (App Router) flashcards: core, rendering & caching, data & server actions,
// routing, performance, auth, testing, security. Targets next@16.2.9 / react@19.2.4.
// Shapes mirror @gerardocordero/prep-kit's Flashcard type (structural typing).
import type { Level } from "@/lib/levels";

export type Flashcard = {
  id: string;
  category: string;
  categoryLabel: string;
  question: string;
  answerHtml: string;
  level?: Level;
};

export const FLASHCARDS: Flashcard[] = [
  // ---------------- CORE (APP ROUTER) ----------------
  {
    id: "c1",
    category: "core",
    categoryLabel: "Core (App Router)",
    level: "junior",
    question: "How does the App Router turn files into routes?",
    answerHtml:
      "<p>Routing is <b>file-system based</b> under <code>app/</code>: each <b>folder</b> is a URL segment, and a folder becomes a navigable route only once it contains a <code>page.tsx</code>. Special files layered on top of that folder structure — <code>layout.tsx</code>, <code>loading.tsx</code>, <code>error.tsx</code>, <code>not-found.tsx</code>, <code>route.ts</code> — each play a specific, reserved role.</p><div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “A folder is just a URL segment — it only becomes a page once you drop a <code>page.tsx</code> in it. Everything else in the folder is opt-in UI plumbing.”</div>",
  },
  {
    id: "c2",
    category: "core",
    categoryLabel: "Core (App Router)",
    level: "junior",
    question: "Layout vs Page vs Template — what's the actual difference?",
    answerHtml:
      "<ul><li><b><code>page.tsx</code></b> — the unique UI for a route segment; required to make a segment publicly accessible.</li><li><b><code>layout.tsx</code></b> — wraps a segment <i>and its children</i>; <b>persists across navigations</b> — it does not re-render or reset state when a child page changes, and it receives a <code>children</code> prop it must render.</li><li><b><code>template.tsx</code></b> — same nesting position as a layout, but creates a <b>new instance on every navigation</b>, so local state resets and effects re-run. Rare; useful for enter/exit animations or per-navigation logging.</li></ul><div class=\"callout warn\"><span class=\"lbl\">Gotcha</span> Reaching for <code>template.tsx</code> to \"fix\" a layout that isn't updating is usually the wrong move — the real issue is almost always missing keys or state that should live lower in the tree.</div>",
  },
  {
    id: "c3",
    category: "core",
    categoryLabel: "Core (App Router)",
    level: "junior",
    question: "Why are Server Components the default, and what does that buy you?",
    answerHtml:
      "<p>Every component under <code>app/</code> is a <b>Server Component</b> unless the file (or something it imports) opts into <code>\"use client\"</code>. Server Components render on the server — <b>zero JS shipped to the client</b> for that component, direct access to backend resources (DB, filesystem, secrets) without an API layer, and they never re-render on the client.</p><div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “Server Components aren't a performance trick bolted onto React — they're the new default rendering target. Client Components are the opt-in, for the slice of the tree that truly needs interactivity.”</div>",
  },
  {
    id: "c4",
    category: "core",
    categoryLabel: "Core (App Router)",
    question: "What is the RSC payload, and how is it different from server-rendered HTML?",
    answerHtml:
      "<p>The <b>RSC payload</b> is a compact, serialized description of the rendered Server Component tree — not HTML. It encodes component output, references to Client Component boundaries (telling the client which JS bundle to mount there and with which props), and any streamed Suspense data.</p><p>On first load, Next.js also produces static <b>HTML</b> for fast paint, but the RSC payload is what makes subsequent client-side navigations fast: the router fetches an updated payload instead of a whole new HTML document and reconciles it into the existing tree.</p>",
  },
  {
    id: "c5",
    category: "core",
    categoryLabel: "Core (App Router)",
    question: "What actually happens during hydration in the App Router?",
    answerHtml:
      "<p>Hydration only concerns the <b>Client Component</b> parts of the tree. The server sends static HTML plus the RSC payload; the browser downloads the JS for each Client Component boundary and <b>attaches event handlers and React internal state</b> to the existing DOM nodes rather than re-rendering them from scratch. Server Component output is never hydrated — it has no client-side representation to reconcile against.</p><div class=\"callout warn\"><span class=\"lbl\">Trap</span> A hydration mismatch error almost always means the server and client produced different markup for a <i>Client</i> Component (e.g. reading <code>window</code> or <code>Date.now()</code> during render) — not a Server Component problem.</div>",
  },
  {
    id: "c6",
    category: "core",
    categoryLabel: "Core (App Router)",
    question: "How do you set metadata, and what's the difference between static and generateMetadata?",
    answerHtml:
      "<p>Export a static <code>metadata</code> object from <code>layout.tsx</code>/<code>page.tsx</code> for fixed title/description/OG tags. For metadata that depends on data — a blog post's title, a product's og:image — export an async <b><code>generateMetadata({ params, searchParams })</code></b> function instead; it runs before the page renders and its result is merged with parent layouts (child overrides parent, arrays like <code>openGraph.images</code> merge).</p><div class=\"callout\"><span class=\"lbl\">Senior detail</span> Next automatically <b>dedupes</b> a fetch call that both <code>generateMetadata</code> and the page component make for the same data via React's request memoization, so you don't pay for it twice.</div>",
  },
  {
    id: "c7",
    category: "core",
    categoryLabel: "Core (App Router)",
    question: "What does next/font optimize, and why not just link a Google Fonts <link> tag?",
    answerHtml:
      "<p><code>next/font</code> downloads font files <b>at build time</b> and self-hosts them alongside your other static assets — no runtime request to Google's servers, no render-blocking external stylesheet, and no layout shift from late-arriving fonts (it computes fallback font metrics to size-match automatically).</p><div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “A Google Fonts <code>&lt;link&gt;</code> costs you a third-party round trip and CLS risk. <code>next/font</code> turns fonts into a build-time asset, which is strictly better for both privacy and Core Web Vitals.”</div>",
  },
  {
    id: "c8",
    category: "core",
    categoryLabel: "Core (App Router)",
    question: "What's a sensible App Router project structure, and what do route groups buy you here?",
    answerHtml:
      "<p>Colocate route-specific pieces next to the segment (<code>_components/</code>, <code>_lib/</code> — leading underscore opts a folder <b>out</b> of routing) and keep cross-cutting code in a top-level <code>src/</code> outside <code>app/</code>. <b>Route groups</b> — a folder wrapped in parens, e.g. <code>(marketing)/</code> — let you organize routes or apply a distinct root layout <i>without</i> adding a URL segment.</p><ul><li><code>(marketing)/about/page.tsx</code> → <code>/about</code>, not <code>/marketing/about</code>.</li><li>Common use: separate layouts for <code>(marketing)</code> vs <code>(app)</code> sections that share a domain but not chrome.</li></ul>",
  },
  {
    id: "c9",
    category: "core",
    categoryLabel: "Core (App Router)",
    question: "loading.tsx and error.tsx — what mechanism powers each?",
    answerHtml:
      "<p>Both are convention-based wrappers Next.js generates for you:</p><ul><li><b><code>loading.tsx</code></b> automatically wraps the segment's <code>page.tsx</code> (and its children) in a <b><code>&lt;Suspense&gt;</code></b> boundary, showing the loading UI while the segment's data-dependent work resolves.</li><li><b><code>error.tsx</code></b> automatically wraps the segment in a <b>React error boundary</b> (it must be a Client Component, since error boundaries are class-based/client-only) and receives <code>error</code> + a <code>reset()</code> function to retry.</li></ul><div class=\"callout warn\"><span class=\"lbl\">Gotcha</span> <code>error.tsx</code> does not catch errors thrown in the <i>parent</i> layout of the same segment — only in the page and below. Root-level errors need <code>global-error.tsx</code>.</div>",
  },
  {
    id: "c10",
    category: "core",
    categoryLabel: "Core (App Router)",
    level: "junior",
    question: "Can a Server Component import and render a Client Component, and vice versa?",
    answerHtml:
      "<p>A Server Component <b>can</b> import and render a Client Component — that's the normal way to introduce interactivity. A Client Component <b>cannot</b> directly <code>import</code> a Server Component (once you cross into <code>\"use client\"</code>, every module reachable by import in that subtree becomes client code, and Server Components can't be bundled for the client since they may use server-only APIs).</p><div class=\"callout tip\"><span class=\"lbl\">Workaround</span> Pass the Server Component as a <code>children</code> or other prop from a Server Component parent into the Client Component — this is the interleaving pattern, covered under Rendering.</div>",
  },
  {
    id: "c11",
    category: "core",
    categoryLabel: "Core (App Router)",
    level: "architect",
    question: "Why does the App Router's file-convention model reduce the surface area for architecture decisions on a large team?",
    answerHtml:
      "<p>The Pages Router left routing, data fetching, and layout composition as open design questions per team; the App Router encodes strong opinions as <b>filesystem conventions</b> — layout nesting, loading/error boundaries, and the server/client split are structural, not a library choice someone has to remember to apply consistently. That converts a class of code-review nitpicks (\"where should this fetch live,\" \"should this be a layout or a wrapper component\") into something the compiler and file tree enforce for you.</p><div class=\"callout\"><span class=\"lbl\">Senior framing</span> The tradeoff is rigidity: you inherit Next's opinions about where boundaries go, which is a net win for a large team's consistency but a real constraint if your app's structure doesn't map cleanly onto nested segments.</div>",
  },

  // ---------------- RENDERING & CACHING ----------------
  {
    id: "c12",
    category: "rendering",
    categoryLabel: "Rendering & Caching",
    question: "SSR vs SSG vs ISR — what's the mental model for each?",
    answerHtml:
      "<table><tr><th>Strategy</th><th>When it renders</th></tr><tr><td><b>SSG</b></td><td>At <b>build time</b>. Output is static HTML served from cache/CDN — fastest, but data can go stale until the next deploy.</td></tr><tr><td><b>SSR</b></td><td>On <b>every request</b>. Always fresh, but pays render latency per request.</td></tr><tr><td><b>ISR</b></td><td>Static like SSG, but revalidates <b>in the background</b> after a time window or on-demand — stale-while-revalidate for whole pages.</td></tr></table><p>The App Router expresses these as behavior (fetch cache options, route segment config, or Cache Components) rather than separate top-level APIs like <code>getStaticProps</code>/<code>getServerSideProps</code>.</p>",
  },
  {
    id: "c13",
    category: "rendering",
    categoryLabel: "Rendering & Caching",
    level: "architect",
    question: "What is Cache Components, and how does it relate to Partial Prerendering?",
    answerHtml:
      "<p><b>Cache Components</b> is the new caching model, opt-in via <code>cacheComponents: true</code> in <code>next.config.ts</code>. It <b>completes Partial Prerendering (PPR)</b>: instead of a page being all-static or all-dynamic, Next prerenders a static shell at build time and leaves explicit \"holes\" for anything dynamic, streaming those in at request time.</p><p>Under this model, caching becomes <b>explicit</b>: work is either wrapped in <code>\"use cache\"</code> (cacheable, becomes part of the static shell) or it isn't — and anything not cached that touches a runtime API must be inside a <code>&lt;Suspense&gt;</code> boundary, or the build/dev server throws.</p><div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “PPR is the rendering technique — a static shell with dynamic holes. Cache Components is the programming model that makes those holes explicit and enforced, instead of inferred from what APIs you happened to call.”</div>",
  },
  {
    id: "c14",
    category: "rendering",
    categoryLabel: "Rendering & Caching",
    question: "How does the \"use cache\" directive work, and what forms the cache key?",
    answerHtml:
      "<p><code>\"use cache\"</code> goes at the top of an async function or component body (or top of a file, to cover every export in it) and caches that function's <b>return value</b>. You don't hand-roll a cache key: <b>arguments and any closed-over values</b> the function reads automatically become part of the key, so calling it with different props naturally produces different cache entries.</p><div class=\"code\">async function Products({ category }: { category: string }) {\n  'use cache'\n  const items = await db.products.findByCategory(category)\n  return &lt;ProductList items={items} /&gt;\n}</div><p>Configure it with <code>cacheLife(profile)</code> and <code>cacheTag(tag)</code>, both imported from <code>next/cache</code> and now <b>stable</b> (no more <code>unstable_</code> prefix).</p>",
  },
  {
    id: "c15",
    category: "rendering",
    categoryLabel: "Rendering & Caching",
    question: "What triggers the \"Uncached data was accessed outside of <Suspense>\" error?",
    answerHtml:
      "<p>Under Cache Components, any component that reads a <b>runtime API</b> — <code>cookies()</code>, <code>headers()</code>, <code>searchParams</code>, <code>params</code> — without being wrapped in <code>\"use cache\"</code> is inherently dynamic: its output can only be known at request time. If that component (or anything that awaits it) isn't wrapped in a <code>&lt;Suspense&gt;</code> boundary, Next can't build a static shell around it and throws at build/dev time rather than silently making the whole page dynamic.</p><div class=\"callout warn\"><span class=\"lbl\">Gotcha</span> The fix is almost always to push the <code>&lt;Suspense&gt;</code> boundary <i>down</i>, around just the dynamic piece, so the rest of the page stays part of the static shell.</div>",
  },
  {
    id: "c16",
    category: "rendering",
    categoryLabel: "Rendering & Caching",
    question: "What does connection() do, and when do you need it?",
    answerHtml:
      "<p><code>connection()</code>, imported from <code>next/server</code>, is an awaitable signal that defers execution until request time. Use it around <b>non-deterministic work that doesn't call a runtime API directly</b> — <code>Math.random()</code>, <code>Date.now()</code>, a random A/B bucket — so Next still treats that code as dynamic and excludes it from the static shell, instead of baking one random value in at build time.</p><div class=\"code\">async function Experiment() {\n  await connection()\n  const bucket = Math.random() &lt; 0.5 ? 'a' : 'b'\n  return &lt;Variant bucket={bucket} /&gt;\n}</div>",
  },
  {
    id: "c17",
    category: "rendering",
    categoryLabel: "Rendering & Caching",
    question: "How does Suspense act as \"the dynamic hole\" in Partial Prerendering?",
    answerHtml:
      "<p>During the prerender pass, Next walks the tree and, on hitting a <code>&lt;Suspense&gt;</code> boundary wrapping dynamic content, <b>renders the fallback into the static shell</b> and defers the real content to request time. At runtime, the shell is served instantly (from cache/CDN) and the actual dynamic content streams in and replaces the fallback in place — the same mechanism React Suspense already uses for loading states, repurposed as the seam between static and dynamic.</p><div class=\"callout tip\"><span class=\"lbl\">Mental model</span> Every <code>&lt;Suspense&gt;</code> boundary is a promise to the prerenderer: \"this part is allowed to not exist yet.\"</div>",
  },
  {
    id: "c18",
    category: "rendering",
    categoryLabel: "Rendering & Caching",
    question: "How do Server and Client Components compose — what actually crosses the boundary?",
    answerHtml:
      "<p>You can interleave them: a <b>Server Component can be passed as <code>children</code> or another prop into a Client Component</b>, even though a Client Component can't directly import one. The Server Component renders on the server, and its already-rendered output is handed to the Client Component via the RSC payload — the Client Component never re-executes it.</p><div class=\"code\">// Server Component\nimport ClientModal from './client-modal'\nimport ServerCart from './server-cart'\n\nexport default function Page() {\n  return (\n    &lt;ClientModal&gt;\n      &lt;ServerCart /&gt;\n    &lt;/ClientModal&gt;\n  )\n}</div><p>Only <b>serializable</b> values (not functions, class instances, etc.) can cross from Server to Client as props — the RSC payload has to be able to encode them.</p>",
  },
  {
    id: "c19",
    category: "rendering",
    categoryLabel: "Rendering & Caching",
    question: "What are cacheLife profiles, and how do you pick one?",
    answerHtml:
      "<p><code>cacheLife(profile)</code> attaches a named TTL/staleness policy to a <code>\"use cache\"</code> function — built-in profiles include things like <code>seconds</code>, <code>minutes</code>, <code>hours</code>, <code>days</code>, and <code>max</code>, or you can define custom profiles in <code>next.config.ts</code> with <code>stale</code>/<code>revalidate</code>/<code>expire</code> windows. Pick based on how tolerant the data is of staleness: a marketing page might use <code>days</code>, a dashboard stat might use <code>minutes</code>.</p><div class=\"callout warn\"><span class=\"lbl\">Trap</span> Forgetting <code>cacheLife</code> entirely doesn't mean \"never cache\" — <code>\"use cache\"</code> without a profile still caches, just with the default policy, which surprises people expecting always-fresh output.</div>",
  },

  // ---------------- DATA & SERVER ACTIONS ----------------
  {
    id: "c20",
    category: "data",
    categoryLabel: "Data & Server Actions",
    question: "What are the layers of caching a fetch() request can pass through in the legacy (non-Cache-Components) model?",
    answerHtml:
      "<ul><li><b>Request Memoization</b> — React's <code>cache()</code> (and fetch's built-in auto-memoization) dedupes identical requests <i>within a single render pass</i>, so calling the same fetch from a layout, a page, and <code>generateMetadata</code> only hits the network once.</li><li><b>Data Cache</b> — a persistent cache across requests and deploys for <code>fetch()</code> results (or <code>unstable_cache()</code> for non-fetch calls), controlled via <code>{ cache: 'force-cache' }</code> or <code>{ next: { revalidate, tags } }</code>.</li><li><b>Full Route Cache</b> — the rendered HTML/RSC payload for a whole static route, produced at build time.</li><li><b>Client Router Cache</b> — an in-browser cache of RSC payloads for recently visited/prefetched segments, avoiding a server round trip on back/forward navigation.</li></ul>",
  },
  {
    id: "c21",
    category: "data",
    categoryLabel: "Data & Server Actions",
    question: "fetch() caching defaults, and the two ways to opt into caching, in the legacy model?",
    answerHtml:
      "<p>Plain <code>fetch()</code> in the App Router is <b>uncached by default</b> — every call hits the network fresh unless you opt in:</p><ul><li><code>fetch(url, { cache: 'force-cache' })</code> — cache indefinitely (until manually revalidated), the old SSG behavior.</li><li><code>fetch(url, { next: { revalidate: 60, tags: ['posts'] } })</code> — cache with a time-based TTL and/or a tag you can invalidate on demand — the ISR-for-fetch behavior.</li></ul><p>For anything that isn't <code>fetch</code> (a DB client, an ORM call), wrap it in <code>unstable_cache(fn, keyParts, { tags, revalidate })</code> to get the same Data Cache semantics.</p>",
  },
  {
    id: "c22",
    category: "data",
    categoryLabel: "Data & Server Actions",
    level: "architect",
    question: "What are Server Functions, and how do you invoke them?",
    answerHtml:
      "<p>A Server Function is any async function marked <code>\"use server\"</code> (top of the function, or top of a file to cover all its exports) — it always runs on the server even when called from client code. There are two invocation paths:</p><ul><li><b><code>&lt;form action={fn}&gt;</code></b> / <code>&lt;button formAction={fn}&gt;</code> — usable directly from a <i>Server</i> Component, no client JS required to submit; React wraps the dispatch in <code>startTransition</code> automatically and it works with progressive enhancement (the form still submits if JS hasn't loaded).</li><li><b>Event handlers</b> in a Client Component — e.g. <code>onClick={() =&gt; myAction(id)}</code>.</li></ul><div class=\"callout warn\"><span class=\"lbl\">Gotcha</span> \"Server Action\" and \"Server Function\" are the same underlying mechanism; the newer docs favor \"Server Function\" as the general term and reserve \"Server Action\" for the form/transition-bound usage.</div>",
  },
  {
    id: "c23",
    category: "data",
    categoryLabel: "Data & Server Actions",
    question: "What does useActionState give you, and what's its exact signature?",
    answerHtml:
      "<p><code>useActionState(action, initialState)</code> returns a 3-tuple: <b><code>[state, formAction, pending]</code></b>.</p><ul><li><b><code>state</code></b> — the latest value returned by the action (starts at <code>initialState</code>).</li><li><b><code>formAction</code></b> — a wrapped version of your action to pass to <code>&lt;form action={...}&gt;</code>; it threads the previous state in automatically as the action's first argument.</li><li><b><code>pending</code></b> — a boolean, true while the action is in flight, for disabling the submit button/showing a spinner without extra state.</li></ul><div class=\"code\">const [state, formAction, pending] = useActionState(updateName, { error: null })</div>",
  },
  {
    id: "c24",
    category: "data",
    categoryLabel: "Data & Server Actions",
    question: "What problem does useOptimistic solve, and how does it roll back?",
    answerHtml:
      "<p><code>useOptimistic(state, updateFn)</code> lets you render a <b>predicted</b> UI state immediately after a user action, before the Server Function's response comes back — e.g. showing a \"liked\" heart instantly instead of waiting on the round trip. It returns <code>[optimisticState, addOptimistic]</code>; calling <code>addOptimistic</code> inside a transition shows the optimistic value only for the duration of that transition.</p><div class=\"callout warn\"><span class=\"lbl\">Gotcha</span> If the action fails or the final server state differs, React automatically reverts to the real <code>state</code> once the transition settles — you don't manually roll back, but you do need to handle/display the error yourself.</div>",
  },
  {
    id: "c25",
    category: "data",
    categoryLabel: "Data & Server Actions",
    question: "revalidatePath vs revalidateTag vs updateTag vs refresh — what does each actually invalidate?",
    answerHtml:
      "<table><tr><th>API</th><th>Invalidates</th><th>Where callable</th></tr><tr><td><code>revalidatePath(path)</code></td><td>Cached data + Full Route Cache for a specific path</td><td>Server Function / Route Handler</td></tr><tr><td><code>revalidateTag(tag, profile)</code></td><td>All cache entries tagged <code>tag</code>, stale-while-revalidate</td><td>Server Function / Route Handler</td></tr><tr><td><code>updateTag(tag)</code></td><td>Same as above but <b>read-your-writes</b> — expires and refreshes within the same request</td><td>Server Function only</td></tr><tr><td><code>refresh()</code></td><td>Only uncached/dynamic parts of the client router — doesn't touch the cache at all</td><td>Server Function only</td></tr></table>",
  },
  {
    id: "c26",
    category: "data",
    categoryLabel: "Data & Server Actions",
    question: "Next 16 breaking change: what's different about revalidateTag's signature now?",
    answerHtml:
      "<p><code>revalidateTag(tag)</code> — the old single-argument form — is <b>deprecated</b>. Next 16 requires a <b>second argument</b>: either a named <code>cacheLife</code> profile (<code>'max'</code> is the commonly recommended one) or an explicit <code>{ expire: seconds }</code> object.</p><div class=\"code\">revalidateTag('posts', 'max')\n// or\nrevalidateTag('posts', { expire: 3600 })</div><div class=\"callout warn\"><span class=\"lbl\">Trap</span> This gives you <b>stale-while-revalidate</b> semantics by design — the tag doesn't vanish instantly, stale data can still be served briefly while fresh data is fetched in the background. If you need immediate consistency <i>within the same request</i>, reach for <code>updateTag</code> instead.</div>",
  },
  {
    id: "c27",
    category: "data",
    categoryLabel: "Data & Server Actions",
    question: "How does React's cache() differ from Next's Data Cache?",
    answerHtml:
      "<p><b>React <code>cache()</code></b> (Request Memoization) is <b>per-render, in-memory, and scoped to a single request</b> — it dedupes calling the same function with the same arguments multiple times while rendering one page, then discards the cache. It works for any async function, not just <code>fetch</code>.</p><p>The <b>Data Cache</b> is <b>persistent</b> — survives across requests and deploys, backed by Next's infrastructure, and is what actually saves you network/DB round trips over time. Confusing the two is a classic mistake: wrapping a DB call in React's <code>cache()</code> alone gives you zero cross-request caching.</p>",
  },
  {
    id: "c28",
    category: "data",
    categoryLabel: "Data & Server Actions",
    question: "Does the client dispatch multiple Server Function calls in parallel?",
    answerHtml:
      "<p><b>No</b> — the client dispatches Server Functions <b>one at a time, sequentially</b>, even if you trigger several in quick succession (e.g. rapid double-clicks, or several independent actions queued in the same transition). Each waits for the previous one to resolve before the next is sent.</p><div class=\"callout tip\"><span class=\"lbl\">Why it matters</span> This is a built-in guard against races and duplicate submissions — you don't need to hand-roll a mutex around a submit button, though you should still disable it via the <code>pending</code> flag from <code>useActionState</code> for UX clarity.</div>",
  },

  // ---------------- ROUTING ----------------
  {
    id: "c29",
    category: "routing",
    categoryLabel: "Routing",
    level: "junior",
    question: "Dynamic segments vs catch-all routes — syntax and when each fires?",
    answerHtml:
      "<ul><li><b><code>[slug]</code></b> — dynamic segment, matches exactly one path part: <code>/blog/[slug]</code> matches <code>/blog/hello</code>.</li><li><b><code>[...slug]</code></b> — catch-all, matches one <i>or more</i> segments as an array: <code>/shop/[...slug]</code> matches <code>/shop/a</code> and <code>/shop/a/b/c</code>.</li><li><b><code>[[...slug]]</code></b> — optional catch-all, additionally matches the base path with zero segments: <code>/shop</code> itself also matches.</li></ul><p>All three read via the <code>params</code> prop, which — like every runtime API in Next 16 — is a <b>Promise</b>: <code>const { slug } = await params</code>.</p>",
  },
  {
    id: "c30",
    category: "routing",
    categoryLabel: "Routing",
    question: "What are parallel routes, and why does Next 16 require a default.js per slot?",
    answerHtml:
      "<p><b>Parallel routes</b> (<code>@slot</code> folders) let a layout render <b>multiple independent pages in the same view simultaneously</b> — e.g. a dashboard rendering <code>@analytics</code> and <code>@team</code> side by side, each with its own loading/error state and independent navigation.</p><div class=\"callout warn\"><span class=\"lbl\">Next 16 change</span> Every slot now <b>requires an explicit <code>default.js</code></b> — the fallback rendered when Next can't recover a slot's active state on a hard navigation/refresh (e.g. the URL doesn't match any of that slot's routes). Without it, the <b>build fails</b>; previously it silently fell back to the page's 404 output.</div>",
  },
  {
    id: "c31",
    category: "routing",
    categoryLabel: "Routing",
    question: "What are intercepting routes for, and what does the (..) syntax mean?",
    answerHtml:
      "<p>Intercepting routes let you show a route <b>within the current layout context</b> (typically a modal) when navigated to client-side, while still rendering it as its own full page on a direct load/refresh — the classic Instagram-photo-in-a-modal pattern.</p><ul><li><code>(.)</code> — match a segment in the <b>same</b> level</li><li><code>(..)</code> — match one level <b>above</b></li><li><code>(..)(..)</code> — two levels above</li><li><code>(...)</code> — match from the <b>root</b> app directory</li></ul><p>Pair it with a parallel route slot (usually <code>@modal</code>) so the intercepted view renders alongside the underlying page rather than replacing it.</p>",
  },
  {
    id: "c32",
    category: "routing",
    categoryLabel: "Routing",
    question: "proxy.ts vs middleware.ts — what changed in Next 16?",
    answerHtml:
      "<p><code>proxy.ts</code> <b>replaces</b> <code>middleware.ts</code> as of Next 16 — same file-convention concept, but the exported function is renamed <code>middleware</code> → <code>proxy</code>, and it runs <b>only on the Node.js runtime</b> (the edge-runtime option is gone). <code>middleware.ts</code> still works for now but is <b>deprecated</b>, kept around for edge-runtime use cases, and will eventually be removed.</p><div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “Same job — intercept requests before they hit a route — new name and a narrower runtime story. If you're starting fresh on Next 16, reach for <code>proxy.ts</code>.”</div>",
  },
  {
    id: "c33",
    category: "routing",
    categoryLabel: "Routing",
    question: "redirect() vs notFound() — behavior and where they can be called from?",
    answerHtml:
      "<p>Both are imported from <code>next/navigation</code> and work by <b>throwing</b> a special internal error that Next's rendering machinery catches — which is why they must not be wrapped in a <code>try/catch</code> that swallows it.</p><ul><li><b><code>redirect(path)</code></b> — issues a redirect (defaults to a 307 in a Server Function, 303 after a completed mutation); callable in Server Components, Server Functions, and Route Handlers.</li><li><b><code>notFound()</code></b> — renders the nearest <code>not-found.tsx</code> boundary with a <b>404</b> status; same callable contexts.</li></ul><div class=\"callout warn\"><span class=\"lbl\">Trap</span> Calling either inside a <code>try { ... } catch { ... }</code> block without re-throwing will catch it as a generic error instead of letting Next handle the navigation/404.</div>",
  },
  {
    id: "c34",
    category: "routing",
    categoryLabel: "Routing",
    question: "What are route groups used for beyond just organizing folders?",
    answerHtml:
      "<p>Wrapping a folder name in parens — <code>(group)</code> — removes it from the URL while still letting it participate in the file-system hierarchy. Two big uses beyond tidiness:</p><ul><li><b>Multiple root layouts</b> — different groups can each define their own top-level <code>layout.tsx</code> (including separate <code>&lt;html&gt;</code>/<code>&lt;body&gt;</code>), useful for e.g. a marketing site vs. an authenticated app sharing one deployment.</li><li><b>Scoping a layout to a subset of routes</b> without nesting them under an extra URL segment.</li></ul>",
  },
  {
    id: "c35",
    category: "routing",
    categoryLabel: "Routing",
    question: "How do you protect a set of routes with proxy.ts?",
    answerHtml:
      "<p><code>proxy.ts</code> exports a <code>proxy(request)</code> function plus a <code>config.matcher</code> to scope which paths it runs on. Read the session (typically from a cookie), and redirect unauthenticated requests before the route even renders:</p><div class=\"code\">export function proxy(request: NextRequest) {\n  const session = request.cookies.get('session')\n  if (!session) {\n    return NextResponse.redirect(new URL('/login', request.url))\n  }\n}\n\nexport const config = { matcher: ['/dashboard/:path*'] }</div><div class=\"callout warn\"><span class=\"lbl\">Gotcha</span> This is a UX gate, not a substitute for auth checks inside Server Functions — see Auth.</div>",
  },

  // ---------------- PERFORMANCE ----------------
  {
    id: "c36",
    category: "perf",
    categoryLabel: "Performance",
    question: "What does next/image do for you beyond a plain <img> tag?",
    answerHtml:
      "<p><code>next/image</code> automatically: <b>resizes and serves modern formats</b> (AVIF/WebP) sized to the viewport via a <code>srcset</code>, <b>lazy-loads</b> off-screen images by default, prevents <b>layout shift</b> by reserving space from the required <code>width</code>/<code>height</code> (or <code>fill</code>), and can be marked <code>priority</code> for above-the-fold LCP images to skip lazy-loading.</p><div class=\"callout warn\"><span class=\"lbl\">Next 16 defaults</span> <code>minimumCacheTTL</code> went from 60s → <b>4h</b>; <code>qualities</code> narrowed to just <code>[75]</code> by default; <code>images.domains</code> is deprecated in favor of the more precise <code>images.remotePatterns</code>.</div>",
  },
  {
    id: "c37",
    category: "perf",
    categoryLabel: "Performance",
    question: "How does next/dynamic code-splitting change what ships to the client?",
    answerHtml:
      "<p><code>next/dynamic(() =&gt; import('./Heavy'))</code> defers loading a Client Component's JS bundle until it's actually needed — e.g. a rich text editor, chart library, or modal content — instead of it being part of the initial page bundle. Pair with <code>{ ssr: false }</code> for components that only make sense in the browser (relying on <code>window</code>, browser-only libraries).</p><div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “Server Components already give you a form of code-splitting for free — their code never ships at all. <code>next/dynamic</code> is for splitting the Client Component slice further, deferring the parts that aren't needed immediately.”</div>",
  },
  {
    id: "c38",
    category: "perf",
    categoryLabel: "Performance",
    question: "Which Core Web Vitals does Next.js most directly help with, and how?",
    answerHtml:
      "<table><tr><th>Metric</th><th>Next.js lever</th></tr><tr><td><b>LCP</b> (Largest Contentful Paint)</td><td><code>next/image priority</code>, server rendering/streaming so content arrives sooner, avoiding client-only data fetches for above-the-fold content</td></tr><tr><td><b>CLS</b> (Cumulative Layout Shift)</td><td><code>next/image</code> reserved dimensions, <code>next/font</code> size-matched fallbacks</td></tr><tr><td><b>INP</b> (Interaction to Next Paint)</td><td>Smaller client bundles via Server Components + code-splitting, so the main thread is less blocked when a user interacts</td></tr></table>",
  },
  {
    id: "c39",
    category: "perf",
    categoryLabel: "Performance",
    question: "Turbopack in Next 16 — what's actually different from earlier versions?",
    answerHtml:
      "<p>Turbopack is now <b>stable</b> and the <b>default bundler</b> for both <code>next dev</code> and <code>next build</code> in Next 16 (previously opt-in via <code>--turbo</code>, and dev-only). Rust-based, incremental, function-level caching gives roughly <b>2-5x faster production builds</b> and up to <b>10x faster Fast Refresh</b> versus webpack on large apps.</p><div class=\"callout warn\"><span class=\"lbl\">Gotcha</span> A handful of advanced custom webpack configs (certain loaders/plugins) don't have a Turbopack equivalent yet — check compatibility before assuming a drop-in swap on a webpack-heavy config.</div>",
  },
  {
    id: "c40",
    category: "perf",
    categoryLabel: "Performance",
    question: "What is the React Compiler, and why is it opt-in rather than default in Next 16?",
    answerHtml:
      "<p>The React Compiler automatically memoizes components and values at build time — inferring the equivalent of <code>useMemo</code>/<code>useCallback</code>/<code>React.memo</code> so you don't hand-write them, reducing unnecessary re-renders. It's <b>stable</b> as of Next 16 but <b>opt-in</b> via <code>reactCompiler: true</code> in <code>next.config.ts</code>, because it changes build output and performance characteristics app-wide — a big enough behavioral shift that teams should adopt it deliberately rather than have it silently flipped on.</p>",
  },
  {
    id: "c41",
    category: "perf",
    categoryLabel: "Performance",
    question: "Streaming with Suspense as a perceived-performance technique — how does it change TTFB vs LCP?",
    answerHtml:
      "<p>Instead of waiting for the slowest piece of data before sending <i>any</i> HTML, Next can send the shell immediately (fast <b>TTFB</b>) and stream in slower sections as their <code>&lt;Suspense&gt;</code> boundaries resolve, each replacing its fallback in place. The page becomes interactive and shows meaningful content sooner, even though the slowest piece of data takes just as long to actually arrive — you're improving <i>perceived</i> performance and often <b>LCP</b>, not the total data-fetch time.</p><div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “Streaming doesn't make your database faster — it stops your fastest data from waiting on your slowest.”</div>",
  },
  {
    id: "c42",
    category: "perf",
    categoryLabel: "Performance",
    level: "architect",
    question: "How would you diagnose an unexpectedly large client bundle in an App Router app?",
    answerHtml:
      "<p>Start with <code>@next/bundle-analyzer</code> to visualize what's actually shipping. Common culprits, in order of how often they bite teams: a large library imported into a file that's transitively part of a <code>\"use client\"</code> boundary (when it's only needed server-side); a barrel file (<code>index.ts</code> re-exporting everything) pulling in code that isn't tree-shaken; a Client Component sitting too high in the tree, dragging children that could've stayed server-only into the client bundle.</p><div class=\"callout warn\"><span class=\"lbl\">Fix pattern</span> Push <code>\"use client\"</code> boundaries as <b>far down</b> the tree as possible — wrap just the interactive leaf, not its whole container — so more of the surrounding UI stays server-rendered and out of the bundle.</div>",
  },

  // ---------------- AUTH ----------------
  {
    id: "c43",
    category: "auth",
    categoryLabel: "Auth",
    question: "What's the standard session pattern in the App Router, and where does it get read?",
    answerHtml:
      "<p>Most App Router auth setups use a <b>signed, httpOnly session cookie</b> issued on login. It gets read via the async <code>cookies()</code> API — <code>await cookies()</code> — inside Server Components (to conditionally render), Server Functions (to authorize a mutation), and Route Handlers (for API-style endpoints). Because Server Components render on the server, the session token itself never needs to be exposed to client JS at all — a meaningful security improvement over patterns that stash tokens in <code>localStorage</code>.</p>",
  },
  {
    id: "c44",
    category: "auth",
    categoryLabel: "Auth",
    question: "Why must every Server Function independently verify auth, even if a proxy already gated the page?",
    answerHtml:
      "<p>Server Functions compile down to a plain <b>POST</b> endpoint with a stable action id — they're <b>directly reachable</b> by anyone who can construct that POST request, entirely bypassing your React UI and, critically, <b>bypassing <code>proxy.ts</code> if it's only matched against page routes</b> (or even if matched, a proxy check is not the same trust boundary as the action itself validating the caller and the specific resource).</p><div class=\"callout warn\"><span class=\"lbl\">Trap</span> \"The button is only rendered for admins\" is not an auth check — the action backing that button needs its own <code>if (!session.isAdmin) throw ...</code> at the top, every time, because UI-level gating is not a security boundary.</div>",
  },
  {
    id: "c45",
    category: "auth",
    categoryLabel: "Auth",
    question: "Route-level gating via proxy.ts vs Server-Function-level checks — what's each actually good for?",
    answerHtml:
      "<table><tr><th>Layer</th><th>Good for</th><th>Not sufficient for</th></tr><tr><td><code>proxy.ts</code></td><td>Fast, centralized <b>UX</b> redirects (unauthenticated → <code>/login</code>) before a page even renders</td><td>Authorizing individual mutations or resource-level access (\"can this user edit <i>this</i> post\")</td></tr><tr><td>Server Function check</td><td>The actual <b>authorization boundary</b> — verifying identity and resource ownership for that specific write</td><td>Being the only line of defense for page-level UX (you'd flash unauthenticated content briefly)</td></tr></table><p>Use both — proxy for UX, in-action checks for the real security boundary.</p>",
  },
  {
    id: "c46",
    category: "auth",
    categoryLabel: "Auth",
    question: "What does an Auth.js (NextAuth) integration typically look like in the App Router?",
    answerHtml:
      "<p>A central <code>auth.ts</code> configures providers (OAuth, credentials) and exports <code>{ auth, signIn, signOut, handlers }</code>. <code>handlers</code> is mounted as a catch-all Route Handler at <code>app/api/auth/[...nextauth]/route.ts</code> to handle the OAuth callback dance. In Server Components/Functions you call <code>const session = await auth()</code> directly — no client-side fetch needed to know who's logged in, since it's already running server-side.</p><div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “Auth.js gives you the provider plumbing and session cookie handling; you're still the one responsible for calling <code>auth()</code> inside every Server Function that needs it.”</div>",
  },
  {
    id: "c47",
    category: "auth",
    categoryLabel: "Auth",
    question: "How do you keep a Client Component aware of session state without exposing secrets?",
    answerHtml:
      "<p>Fetch the session server-side (in a Server Component or layout) and pass down only the <b>minimal, non-sensitive shape</b> (user id, name, avatar — never raw tokens) as props, or wrap the tree in a client-side session provider (e.g. Auth.js's <code>SessionProvider</code>) that's seeded from that server-fetched session and revalidates via a lightweight client fetch when needed. The actual session cookie stays httpOnly and is never readable by client JS either way.</p>",
  },

  {
    id: "c58",
    category: "auth",
    categoryLabel: "Auth",
    question: "How should a Server Function handle authorization for a specific resource, not just \"is logged in\"?",
    answerHtml:
      "<p>Authentication (\"who is this\") and authorization (\"can they do this specific thing\") are separate checks — a logged-in user isn't automatically allowed to edit <i>any</i> post. Inside the action, after confirming a session exists, re-fetch the target resource and compare ownership/role <b>server-side</b>, never trusting an id or role passed in from the client as truth:</p><div class=\"code\">'use server'\nasync function deletePost(postId: string) {\n  const session = await auth()\n  if (!session) throw new Error('Unauthorized')\n  const post = await db.post.findUnique({ where: { id: postId } })\n  if (post?.authorId !== session.userId) throw new Error('Forbidden')\n  await db.post.delete({ where: { id: postId } })\n}</div>",
  },

  // ---------------- TESTING ----------------
  {
    id: "c48",
    category: "testing",
    categoryLabel: "Testing",
    question: "Why are Server Components hard to unit-test directly, and what's the practical workaround?",
    answerHtml:
      "<p>Server Components are <b>async functions that return a description of UI</b>, not a rendered DOM tree — traditional RTL-style rendering assumes synchronous, client-side rendering into jsdom, which doesn't model streaming, Suspense boundaries, or server-only APIs correctly. Most teams end up testing Server Components indirectly: extract the actual logic (data shaping, business rules) into plain functions and unit test <i>those</i>, then rely on <b>e2e tests</b> (Playwright) to verify the rendered-page behavior end to end.</p><div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “I don't fight to unit-test a Server Component's markup — I pull the logic out into a testable function and let Playwright verify the page actually renders right.”</div>",
  },
  {
    id: "c49",
    category: "testing",
    categoryLabel: "Testing",
    level: "junior",
    question: "How do you unit test a Client Component with Jest/Vitest + React Testing Library?",
    answerHtml:
      "<p>Same as any React app: render with RTL, query by role/text, fire events, assert on the DOM.</p><div class=\"code\">test('increments on click', async () =&gt; {\n  render(&lt;Counter /&gt;)\n  await userEvent.click(screen.getByRole('button', { name: /increment/i }))\n  expect(screen.getByText('1')).toBeInTheDocument()\n})</div><p>If the component calls a Server Function, <b>mock the import</b> (<code>jest.mock('./actions')</code> / Vitest's <code>vi.mock</code>) so the test isn't making a real server round trip.</p>",
  },
  {
    id: "c50",
    category: "testing",
    categoryLabel: "Testing",
    question: "What does an e2e Playwright test buy you that unit tests structurally can't, in an App Router app?",
    answerHtml:
      "<p>Playwright drives a <b>real browser against a real running Next server</b>, so it's the only layer that actually exercises the full stack together: Server Components rendering, streaming/Suspense boundaries resolving, a Server Function round trip actually hitting your backend, cookies/session flowing correctly, and client-side navigation swapping RSC payloads. Unit tests necessarily mock across those seams; e2e is what proves the seams themselves work.</p><div class=\"callout warn\"><span class=\"lbl\">Gotcha</span> Don't try to replace unit tests with e2e wholesale — e2e is slower and better suited to a smaller set of critical user flows, not exhaustive edge-case coverage.</div>",
  },
  {
    id: "c51",
    category: "testing",
    categoryLabel: "Testing",
    question: "How do you mock fetch() or a Server Function in tests without hitting the network?",
    answerHtml:
      "<p>Two common approaches: <b>module-level mocking</b> — <code>jest.mock('@/app/actions', () =&gt; ({ createPost: jest.fn() }))</code> — swaps the Server Function entirely for a component test; or <b>network-level mocking</b> with MSW (Mock Service Worker), which intercepts actual <code>fetch</code> calls, useful when you want to test closer to the real request/response shape (status codes, error bodies) without mocking your own code's internals.</p>",
  },

  {
    id: "c59",
    category: "testing",
    categoryLabel: "Testing",
    question: "How do you approach testing a route that depends on cookies() or searchParams?",
    answerHtml:
      "<p>For a <b>unit</b> test, extract the logic that reads/derives from those values into a plain function that takes them as arguments, so the test can call it with fixture data instead of standing up the whole request context. For behavior that genuinely depends on the request lifecycle — a redirect based on a missing session cookie, a filtered list based on a query param — that belongs in a <b>Playwright</b> test, which can set real cookies (<code>context.addCookies</code>) and navigate to a real URL with query params, exercising the actual runtime API rather than a mock of it.</p>",
  },

  // ---------------- SECURITY ----------------
  {
    id: "c52",
    category: "security",
    categoryLabel: "Security",
    question: "How do Server Actions defend against CSRF by default?",
    answerHtml:
      "<p>Every Server Function invocation carries an automatic <b>Origin header check</b>: Next compares the request's <code>Origin</code> against the <code>Host</code> (and any configured allowed origins) and <b>rejects the call</b> if they don't match. Because a cross-site form on an attacker's domain would produce a mismatched Origin, this closes off the classic CSRF vector <b>without you writing a token yourself</b>.</p><div class=\"callout warn\"><span class=\"lbl\">Gotcha</span> This protection is specific to Server Functions. Plain Route Handlers (<code>route.ts</code>) get no such automatic check — if you build a traditional POST API there, you're back to needing your own CSRF strategy.</div>",
  },
  {
    id: "c53",
    category: "security",
    categoryLabel: "Security",
    question: "When is dangerouslySetInnerHTML actually necessary, and how do you make it safe?",
    answerHtml:
      "<p>React escapes text content by default, so XSS via normal JSX interpolation isn't a risk — <code>dangerouslySetInnerHTML</code> is the deliberate escape hatch for rendering real HTML strings (rich text from a CMS, markdown-to-HTML output). Necessary use cases: rendering sanitized rich text content, not user-typed plain strings.</p><div class=\"callout warn\"><span class=\"lbl\">Trap</span> Never pass unsanitized user input into it. Run it through a sanitizer (e.g. <code>DOMPurify</code>) <b>server-side</b> before it reaches the client, and treat any CMS/third-party HTML source as untrusted input too.</div>",
  },
  {
    id: "c54",
    category: "security",
    categoryLabel: "Security",
    question: "What does the NEXT_PUBLIC_ prefix actually do, and what's the risk of misusing it?",
    answerHtml:
      "<p>Only env vars prefixed <code>NEXT_PUBLIC_</code> are <b>inlined into the client bundle</b> at build time — everything else stays server-only by default. This is a deliberate, explicit opt-in specifically so a stray <code>API_KEY</code> in <code>.env</code> doesn't accidentally ship to every visitor's browser.</p><div class=\"callout warn\"><span class=\"lbl\">Trap</span> Once a value is prefixed <code>NEXT_PUBLIC_</code>, treat it as <b>public, readable by anyone</b> — it's baked into the static JS bundle, not fetched securely per-user. Never prefix a real secret (DB credentials, private API keys) with it, even temporarily for \"just testing.\"</div>",
  },
  {
    id: "c55",
    category: "security",
    categoryLabel: "Security",
    question: "What does the server-only package do, and why isn't \"just don't import it in a client file\" enough?",
    answerHtml:
      "<p><code>import 'server-only'</code> at the top of a module makes it a <b>build-time error</b> to import that module from any code reachable by the client bundle — e.g. a file with DB credentials or a raw SQL query builder. Manual discipline (\"I'll just remember not to import this from a client file\") doesn't scale: a teammate three files away doing an innocent-looking import can leak server-only code into the client bundle with no runtime warning, only a possibly-unnoticed bundle-size bump.</p><div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “<code>server-only</code> turns an invisible mistake into a loud build failure — that's the whole value.”</div>",
  },
  {
    id: "c56",
    category: "security",
    categoryLabel: "Security",
    question: "serverRuntimeConfig / publicRuntimeConfig were removed — what replaces them, and why?",
    answerHtml:
      "<p>Both config options are <b>removed</b> in modern Next.js (App Router doesn't support them at all). The replacement is plain <b>environment variables</b> — server-only vars read directly via <code>process.env.X</code> in server code, and <code>NEXT_PUBLIC_</code>-prefixed vars for anything the client genuinely needs. This aligns with 12-factor config (env-based, not a custom Next-specific config object) and removes a footgun where <code>publicRuntimeConfig</code> values were readable by <i>any</i> page, with no per-value control over server vs client exposure.</p>",
  },
  {
    id: "c57",
    category: "security",
    categoryLabel: "Security",
    question: "What secure headers should a production Next.js app set, and where do you set them?",
    answerHtml:
      "<p>Common baseline: <b>Content-Security-Policy</b> (mitigates XSS by restricting script/style sources), <b>Strict-Transport-Security</b> (forces HTTPS), <b><code>X-Content-Type-Options: nosniff</code></b>, and <b><code>X-Frame-Options</code></b>/<code>frame-ancestors</code> (clickjacking). Set them either declaratively via the <code>headers()</code> function in <code>next.config.ts</code> (static, applies at the edge/CDN layer) or dynamically in <code>proxy.ts</code> if a header needs to vary per request (e.g. a per-request CSP nonce).</p><div class=\"callout warn\"><span class=\"lbl\">Gotcha</span> A CSP with <code>script-src 'unsafe-inline'</code> defeats most of its own XSS protection — use nonces or hashes for inline scripts instead if you can't avoid them entirely.</div>",
  },
];

/** Category filters contributed by this file (the aggregator adds "All"). */
export const FLASHCARD_FILTERS = [
  { value: "core", label: "Core (App Router)" },
  { value: "rendering", label: "Rendering & Caching" },
  { value: "data", label: "Data & Server Actions" },
  { value: "routing", label: "Routing" },
  { value: "perf", label: "Performance" },
  { value: "auth", label: "Auth" },
  { value: "testing", label: "Testing" },
  { value: "security", label: "Security" },
];
