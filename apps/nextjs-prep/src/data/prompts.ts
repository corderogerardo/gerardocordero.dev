// Practice prompts — Next.js App Router / React coding tasks and
// frontend/full-stack system-design prompts.
import type { Level } from "@/lib/levels";

export type PromptKind = "coding" | "design";
export type Prompt = {
  id: string;
  kind: PromptKind;
  title: string;
  level: Level;
  tags: string[];
  promptHtml: string;
  reveal: { label: string; html: string }[];
};

export const PROMPTS: Prompt[] = [
  // ---------------- CODING ----------------
  {
    id: "pr-cache-components",
    kind: "coding",
    title: "Cache a data-fetching Server Component with Cache Components",
    level: "senior",
    tags: ["Next.js", "caching", "Cache Components"],
    promptHtml:
      "<p>A product page Server Component calls <code>getProduct(id)</code> (a slow DB read) on every request. Using the <b>Cache Components</b> model (<code>cacheComponents: true</code>), cache the fetched data for up to an hour, tag it so a price update can invalidate it immediately, and make sure the build doesn't fail on a component that also reads <code>cookies()</code> for a \"recently viewed\" strip.</p>",
    reveal: [
      {
        label: "Approach",
        html:
          "<ul><li>Mark the data-fetching function itself with <code>\"use cache\"</code> (function-level, not component-level) so the cached unit is just the DB read.</li><li>Call <code>cacheLife('hours')</code> (or a custom profile) and <code>cacheTag('product:' + id)</code> inside that function.</li><li>The page component stays a normal Server Component; it awaits the cached function directly — no extra ceremony at the call site.</li><li>Anything reading a request-time API (<code>cookies()</code>, <code>headers()</code>) inside a cached scope, or rendered alongside a cached shell, must be wrapped in <code>&lt;Suspense&gt;</code> — Cache Components throws a build error otherwise, since PPR needs a fallback for the dynamic hole.</li></ul>",
      },
      {
        label: "Solution",
        html:
          "<div class=\"code\">// next.config.ts\nconst nextConfig = {\n  cacheComponents: true,\n};\nexport default nextConfig;\n\n// lib/products.ts\nimport { cacheLife, cacheTag } from 'next/cache';\n\nexport async function getProduct(id: string) {\n  'use cache';\n  cacheLife('hours');       // ~1hr profile\n  cacheTag(`product:${id}`);\n  const res = await db.query('SELECT * FROM products WHERE id = $1', [id]);\n  return res.rows[0];\n}\n\n// app/products/[id]/page.tsx\nimport { Suspense } from 'react';\nimport { getProduct } from '@/lib/products';\nimport { RecentlyViewed } from './recently-viewed'; // reads cookies()\n\nexport default async function ProductPage({\n  params,\n}: {\n  params: Promise&lt;{ id: string }&gt;;\n}) {\n  const { id } = await params;\n  const product = await getProduct(id);\n  return (\n    &lt;div&gt;\n      &lt;h1&gt;{product.name}&lt;/h1&gt;\n      &lt;p&gt;${product.price}&lt;/p&gt;\n      &lt;Suspense fallback={&lt;p&gt;Loading recently viewed…&lt;/p&gt;}&gt;\n        &lt;RecentlyViewed /&gt;\n      &lt;/Suspense&gt;\n    &lt;/div&gt;\n  );\n}\n\n// on a price update (Server Action / webhook handler):\n// import { revalidateTag } from 'next/cache';\n// revalidateTag(`product:${id}`, 'max'); // SWR: serve stale once, revalidate now</div><p><b>Trade-off:</b> caching at the data-fetch function keeps the static shell maximal (better PPR) versus caching the whole component, which would also freeze the cookie-dependent strip unless it's carved out into its own Suspense boundary.</p>",
      },
    ],
  },
  {
    id: "pr-server-action-form",
    kind: "coding",
    title: "Server Action form with useActionState + revalidatePath",
    level: "mid",
    tags: ["Next.js", "Server Actions", "forms"],
    promptHtml:
      "<p>Build a \"rename project\" form: a Server Action mutates the DB, the form shows a pending spinner while it runs, surfaces a validation error inline without a full page reload, and the project list page reflects the new name immediately after success.</p>",
    reveal: [
      {
        label: "Approach",
        html:
          "<ul><li>Server Function (<code>\"use server\"</code>) takes <code>(prevState, formData)</code>, validates, mutates, and returns a state object — never assume the caller is the form; re-check auth/ownership inside the function since Server Actions are POST-reachable directly.</li><li>Client Component calls <code>useActionState(action, initialState)</code> → <code>[state, formAction, pending]</code>; wire <code>&lt;form action={formAction}&gt;</code> and disable the button while <code>pending</code>.</li><li>On success, call <code>revalidatePath('/projects')</code> inside the action so the list route re-renders with fresh data on next visit.</li></ul>",
      },
      {
        label: "Solution",
        html:
          "<div class=\"code\">// app/projects/actions.ts\n'use server';\nimport { revalidatePath } from 'next/cache';\nimport { auth } from '@/lib/auth';\n\ntype State = { error?: string; ok?: boolean };\n\nexport async function renameProject(\n  prevState: State,\n  formData: FormData,\n): Promise&lt;State&gt; {\n  const session = await auth();\n  if (!session) return { error: 'Not authenticated' };\n\n  const id = String(formData.get('id'));\n  const name = String(formData.get('name') ?? '').trim();\n  if (name.length &lt; 3) return { error: 'Name must be at least 3 characters' };\n\n  const project = await db.project.findUnique({ where: { id } });\n  if (project?.ownerId !== session.userId) return { error: 'Forbidden' };\n\n  await db.project.update({ where: { id }, data: { name } });\n  revalidatePath('/projects');\n  return { ok: true };\n}\n\n// app/projects/rename-form.tsx\n'use client';\nimport { useActionState } from 'react';\nimport { renameProject } from './actions';\n\nexport function RenameForm({ id }: { id: string }) {\n  const [state, formAction, pending] = useActionState(renameProject, {});\n  return (\n    &lt;form action={formAction}&gt;\n      &lt;input type=\"hidden\" name=\"id\" value={id} /&gt;\n      &lt;input name=\"name\" required minLength={3} /&gt;\n      &lt;button type=\"submit\" disabled={pending}&gt;\n        {pending ? 'Saving…' : 'Rename'}\n      &lt;/button&gt;\n      {state.error &amp;&amp; &lt;p role=\"alert\"&gt;{state.error}&lt;/p&gt;}\n    &lt;/form&gt;\n  );\n}</div><p><b>Gotcha:</b> the client-side <code>required</code>/<code>minLength</code> attributes are UX only — a curl'd POST skips them entirely, so the server-side length check and the ownership check are what actually protect the data.</p>",
      },
    ],
  },
  {
    id: "pr-optimistic-like",
    kind: "coding",
    title: "Optimistic like button with useOptimistic",
    level: "mid",
    tags: ["Next.js", "useOptimistic", "Server Actions"],
    promptHtml:
      "<p>A post's like button currently waits for a full round trip before the count updates, which feels slow. Make the like count and \"liked\" state update instantly on tap, roll back automatically if the Server Action fails, and never let the button be tapped twice while a request is in flight.</p>",
    reveal: [
      {
        label: "Approach",
        html:
          "<p>Wrap the server-confirmed state in <code>useOptimistic(state, reducer)</code>. On click, call the reducer to render the new value immediately, then <code>await</code> the Server Action inside a transition (<code>useOptimistic</code> updates must happen during a transition — <code>startTransition</code> or an action). If the action throws, React discards the optimistic value and re-renders from the last real state, so no manual rollback code is needed — just don't swallow the error.</p>",
      },
      {
        label: "Solution",
        html:
          "<div class=\"code\">// app/posts/actions.ts\n'use server';\nexport async function toggleLike(postId: string, liked: boolean) {\n  const session = await auth();\n  if (!session) throw new Error('Not authenticated');\n  if (liked) await db.like.create({ data: { postId, userId: session.userId } });\n  else await db.like.deleteMany({ where: { postId, userId: session.userId } });\n  return db.post.count({ where: { id: postId } }); // fresh count\n}\n\n// app/posts/like-button.tsx\n'use client';\nimport { useOptimistic, useTransition } from 'react';\nimport { toggleLike } from './actions';\n\ntype LikeState = { count: number; liked: boolean };\n\nexport function LikeButton({ postId, initial }: { postId: string; initial: LikeState }) {\n  const [pending, startTransition] = useTransition();\n  const [optimistic, setOptimistic] = useOptimistic(\n    initial,\n    (state, liked: boolean): LikeState =&gt; ({\n      liked,\n      count: state.count + (liked ? 1 : -1),\n    }),\n  );\n\n  function onToggle() {\n    const next = !optimistic.liked;\n    startTransition(async () =&gt; {\n      setOptimistic(next);\n      await toggleLike(postId, next); // throws → React reverts optimistic state\n    });\n  }\n\n  return (\n    &lt;button onClick={onToggle} disabled={pending} aria-pressed={optimistic.liked}&gt;\n      {optimistic.liked ? '♥' : '♡'} {optimistic.count}\n    &lt;/button&gt;\n  );\n}</div><p><b>Trade-off:</b> optimistic count math is client-side arithmetic, not the server's real count — fine for a like button (self-correcting on the next real render), but risky for anything where exact concurrent-user counts matter (use the server's returned value to reconcile, not just trust the +1/-1).</p>",
      },
    ],
  },
  {
    id: "pr-boundary-bug",
    kind: "coding",
    title: "Spot the bug: Server/Client Component boundary",
    level: "mid",
    tags: ["Next.js", "Server Components", "debugging"],
    promptHtml:
      "<p>A teammate's PR fails to build with <i>\"You're importing a component that needs `useState`. This React hook only works in a client component.\"</i> Here's the tree — find the bug and fix it with the smallest possible change (don't just slap <code>\"use client\"</code> on everything).</p><div class=\"code\">// app/dashboard/layout.tsx\n'use client';\nimport { Sidebar } from './sidebar';       // has useState (a collapse toggle)\nimport { DashboardStats } from './stats';  // async Server Component, awaits db\n\nexport default function DashboardLayout({ children }) {\n  return (\n    &lt;div className=\"layout\"&gt;\n      &lt;Sidebar /&gt;\n      &lt;DashboardStats /&gt;\n      &lt;main&gt;{children}&lt;/main&gt;\n    &lt;/div&gt;\n  );\n}</div>",
      reveal: [
      {
        label: "Approach",
        html:
          "<p>The <code>\"use client\"</code> directive was put on the <b>layout</b>, which pulls the entire module graph it imports — including <code>DashboardStats</code>, an <code>async</code> Server Component — into the client bundle. Client Components can't be <code>async</code> functions and can't do server-only data access, so the build fails downstream of the real mistake. The fix is to push the boundary down to only the piece that actually needs interactivity (<code>Sidebar</code>'s collapse state), not up to the layout.</p>",
      },
      {
        label: "Solution",
        html:
          "<div class=\"code\">// app/dashboard/layout.tsx  (Server Component again — no directive)\nimport { Sidebar } from './sidebar';\nimport { DashboardStats } from './stats';\n\nexport default function DashboardLayout({ children }) {\n  return (\n    &lt;div className=\"layout\"&gt;\n      &lt;Sidebar /&gt;          {/* Sidebar itself owns 'use client' */}\n      &lt;DashboardStats /&gt;   {/* stays a Server Component, never bundled to client */}\n      &lt;main&gt;{children}&lt;/main&gt;\n    &lt;/div&gt;\n  );\n}\n\n// app/dashboard/sidebar.tsx\n'use client';\nimport { useState } from 'react';\n\nexport function Sidebar() {\n  const [collapsed, setCollapsed] = useState(false);\n  return (\n    &lt;aside className={collapsed ? 'collapsed' : ''}&gt;\n      &lt;button onClick={() =&gt; setCollapsed((c) =&gt; !c)}&gt;Toggle&lt;/button&gt;\n      {/* nav links */}\n    &lt;/aside&gt;\n  );\n}</div><p><b>Rule of thumb:</b> <code>\"use client\"</code> marks a module-graph boundary, not just \"this file\". Put it on the leaf that needs the browser (state, effects, event handlers), and pass Server Components down as children/props to Client Components when you need to interleave them — they render on the server and are never pulled into the client bundle just because a client parent renders them.</p>",
      },
    ],
  },
  {
    id: "pr-debounced-search",
    kind: "coding",
    title: "Debounced search that drives a Server Component via the URL",
    level: "senior",
    tags: ["Next.js", "useSearchParams", "streaming"],
    promptHtml:
      "<p>Build a product search box: typing updates a <code>?q=</code> URL param (debounced, so you're not navigating on every keystroke), and a Server Component reads <code>searchParams</code> to fetch + render matching results, showing a streaming fallback while a new query is in flight.</p>",
    reveal: [
      {
        label: "Approach",
        html:
          "<ul><li>Input is a Client Component using <code>useSearchParams()</code> to read the current value and <code>useRouter().replace()</code> to write it back, debounced with a small custom hook (or a timer in an effect) so navigation only fires ~300ms after the user stops typing.</li><li>The results themselves are a separate <code>async</code> Server Component that <code>await</code>s <code>searchParams.q</code> and queries the DB — <code>searchParams</code> is a Promise in Next 16, so it must be awaited.</li><li>Wrap the results in <code>&lt;Suspense key={query}&gt;</code> so each new query gets its own fallback instead of the whole page suspending or showing stale results while loading.</li></ul>",
      },
      {
        label: "Solution",
        html:
          "<div class=\"code\">// app/search/search-box.tsx\n'use client';\nimport { useRouter, usePathname, useSearchParams } from 'next/navigation';\nimport { useState, useEffect } from 'react';\n\nexport function SearchBox() {\n  const router = useRouter();\n  const pathname = usePathname();\n  const searchParams = useSearchParams();\n  const [value, setValue] = useState(searchParams.get('q') ?? '');\n\n  useEffect(() =&gt; {\n    const handle = setTimeout(() =&gt; {\n      const params = new URLSearchParams(searchParams);\n      value ? params.set('q', value) : params.delete('q');\n      router.replace(`${pathname}?${params.toString()}`);\n    }, 300);\n    return () =&gt; clearTimeout(handle);\n  }, [value, pathname, router, searchParams]);\n\n  return &lt;input value={value} onChange={(e) =&gt; setValue(e.target.value)} placeholder=\"Search…\" /&gt;;\n}\n\n// app/search/page.tsx\nimport { Suspense } from 'react';\nimport { SearchBox } from './search-box';\nimport { Results } from './results';\n\nexport default async function SearchPage({\n  searchParams,\n}: {\n  searchParams: Promise&lt;{ q?: string }&gt;;\n}) {\n  const { q = '' } = await searchParams;\n  return (\n    &lt;div&gt;\n      &lt;SearchBox /&gt;\n      &lt;Suspense key={q} fallback={&lt;p&gt;Searching…&lt;/p&gt;}&gt;\n        &lt;Results query={q} /&gt;\n      &lt;/Suspense&gt;\n    &lt;/div&gt;\n  );\n}\n\n// app/search/results.tsx (Server Component)\nexport async function Results({ query }: { query: string }) {\n  const items = await db.product.search(query);\n  return &lt;ul&gt;{items.map((p) =&gt; &lt;li key={p.id}&gt;{p.name}&lt;/li&gt;)}&lt;/ul&gt;;\n}</div><p><b>Trade-off:</b> URL-driven search is shareable/bookmarkable and lets the Server Component do the fetch (no client-side waterfall), at the cost of a navigation per debounced keystroke — for a purely client-local filter (no server round trip needed), a plain <code>useDebounce</code> hook feeding client state would be simpler and avoid touching the URL at all.</p>",
      },
    ],
  },
  {
    id: "pr-proxy-auth",
    kind: "coding",
    title: "Route protection with proxy.ts",
    level: "mid",
    tags: ["Next.js", "proxy.ts", "auth"],
    promptHtml:
      "<p>Protect every route under <code>/dashboard</code>: unauthenticated visitors should be redirected to <code>/login?next=&lt;original path&gt;</code>, while public routes (marketing, <code>/login</code> itself) stay untouched. Implement this at the edge of the app, not by checking auth in every page.</p>",
    reveal: [
      {
        label: "Approach",
        html:
          "<p>Next 16 renamed <code>middleware.ts</code> to <code>proxy.ts</code> (the exported function is now <code>proxy</code>, not <code>middleware</code>), and it runs only on the Node.js runtime. Read the session cookie, scope the check with a <code>matcher</code> (or an in-function path check) to just <code>/dashboard/*</code>, and redirect with the original path preserved so login can bounce the user back. Treat this as a UX shortcut, not the only auth check — still verify auth/ownership inside any Server Action or route handler the dashboard calls, since those are directly reachable.</p>",
      },
      {
        label: "Solution",
        html:
          "<div class=\"code\">// proxy.ts (project root)\nimport { NextResponse, type NextRequest } from 'next/server';\n\nexport function proxy(request: NextRequest) {\n  const session = request.cookies.get('session')?.value;\n  if (!session) {\n    const loginUrl = new URL('/login', request.url);\n    loginUrl.searchParams.set('next', request.nextUrl.pathname);\n    return NextResponse.redirect(loginUrl);\n  }\n  return NextResponse.next();\n}\n\nexport const config = {\n  matcher: ['/dashboard/:path*'],\n};</div><p><b>Gotcha:</b> a <code>matcher</code> only screens which requests <i>run</i> the proxy — it's cheap, but it's not authorization. A forgotten Server Action still executes if POSTed directly, so route-level protection here is a UX/perf optimization (redirect before rendering anything) layered on top of, not instead of, per-action checks.</p>",
      },
    ],
  },
  {
    id: "pr-streaming-list",
    kind: "coding",
    title: "Streamed, paginated list with Suspense",
    level: "senior",
    tags: ["Next.js", "Suspense", "streaming"],
    promptHtml:
      "<p>A comments section can have hundreds of entries. Render the page shell (post + comment count) instantly, then stream in a first page of 20 comments, with a \"Load more\" control that fetches the next page without a full page navigation.</p>",
    reveal: [
      {
        label: "Approach",
        html:
          "<p>Split the page into a fast, non-suspending shell and a slow <code>CommentsPage</code> Server Component wrapped in <code>&lt;Suspense&gt;</code> so the shell streams to the client immediately while comments load in the background. \"Load more\" is a small Client Component that calls a Server Function returning the next slice and appends it to local state — no full-page reload, no client-side data-fetching library needed for something this simple.</p>",
      },
      {
        label: "Solution",
        html:
          "<div class=\"code\">// app/posts/[id]/page.tsx\nimport { Suspense } from 'react';\nimport { CommentsList } from './comments-list';\nimport { CommentsSkeleton } from './comments-skeleton';\n\nexport default async function PostPage({ params }: { params: Promise&lt;{ id: string }&gt; }) {\n  const { id } = await params;\n  const post = await getPost(id); // fast — indexed lookup\n  return (\n    &lt;article&gt;\n      &lt;h1&gt;{post.title}&lt;/h1&gt;\n      &lt;Suspense fallback={&lt;CommentsSkeleton /&gt;}&gt;\n        &lt;CommentsList postId={id} page={0} /&gt;\n      &lt;/Suspense&gt;\n    &lt;/article&gt;\n  );\n}\n\n// app/posts/[id]/comments-list.tsx (Server Component, first page)\nimport { LoadMore } from './load-more';\n\nexport async function CommentsList({ postId, page }: { postId: string; page: number }) {\n  const comments = await db.comment.findMany({\n    where: { postId }, skip: page * 20, take: 20, orderBy: { createdAt: 'desc' },\n  });\n  return (\n    &lt;ul&gt;\n      {comments.map((c) =&gt; &lt;li key={c.id}&gt;{c.body}&lt;/li&gt;)}\n      &lt;LoadMore postId={postId} nextPage={page + 1} hasMore={comments.length === 20} /&gt;\n    &lt;/ul&gt;\n  );\n}\n\n// app/posts/[id]/load-more.tsx\n'use client';\nimport { useState, useTransition } from 'react';\nimport { fetchCommentsPage } from './actions'; // 'use server' function\n\nexport function LoadMore({ postId, nextPage, hasMore }: { postId: string; nextPage: number; hasMore: boolean }) {\n  const [items, setItems] = useState&lt;{ id: string; body: string }[]&gt;([]);\n  const [more, setMore] = useState(hasMore);\n  const [pending, startTransition] = useTransition();\n  if (!more &amp;&amp; items.length === 0) return null;\n  return (\n    &lt;&gt;\n      {items.map((c) =&gt; &lt;li key={c.id}&gt;{c.body}&lt;/li&gt;)}\n      {more &amp;&amp; (\n        &lt;button\n          disabled={pending}\n          onClick={() =&gt; startTransition(async () =&gt; {\n            const { comments, hasMore: next } = await fetchCommentsPage(postId, nextPage);\n            setItems((prev) =&gt; [...prev, ...comments]);\n            setMore(next);\n          })}\n        &gt;\n          {pending ? 'Loading…' : 'Load more'}\n        &lt;/button&gt;\n      )}\n    &lt;/&gt;\n  );\n}</div><p><b>Trade-off:</b> Suspense streaming gets the shell painted fast on <i>first</i> load; \"Load more\" deliberately drops back to a client fetch (a Server Function call) instead of more Suspense boundaries, because re-suspending a list you've already appended to would either lose the appended items or require lifting all of it into shared state — a plain async call is simpler here.</p>",
      },
    ],
  },

  // ---------------- SYSTEM DESIGN ----------------
  {
    id: "pr-catalog-rendering",
    kind: "design",
    title: "Design the rendering strategy for a large e-commerce catalog",
    level: "architect",
    tags: ["architecture", "rendering", "ISR"],
    promptHtml:
      "<p>A catalog has 500k product pages, a handful of category landing pages, and a cart/checkout flow. Design which pages are static, which are incrementally revalidated, and which must be fully dynamic — and why.</p>",
    reveal: [
      {
        label: "Approach",
        html:
          "<p>Segment by how often content changes and how personalized it is, not by \"is it a product page\" as one bucket. Pair each segment with the cheapest rendering mode that still meets its freshness and personalization requirements.</p>",
      },
      {
        label: "Solution",
        html:
          "<ul><li><b>Category/landing pages:</b> static at build for the top N by traffic; the long tail generated on-demand and cached (<code>dynamicParams: true</code>) so a 500k-product catalog doesn't need a 500k-page build.</li><li><b>Product detail pages:</b> cached with a moderate TTL (<code>\"use cache\"</code> + <code>cacheLife</code>) keyed by product id, invalidated on write via <code>cacheTag</code>/<code>revalidateTag</code> — prices and stock change occasionally, not every request, so full dynamic rendering wastes compute at this scale.</li><li><b>Search/filter results:</b> dynamic — too many parameter combinations to usefully cache per-URL; rely on a fast search index (not the page cache) for latency.</li><li><b>Cart/checkout:</b> fully dynamic, per-user, uncached — correctness (inventory, price, personal data) matters more than latency here, and caching user-specific checkout state is a data-leak risk.</li><li><b>Personalized strips</b> (recommendations, recently viewed) inside an otherwise-cached product page: carved into their own <code>&lt;Suspense&gt;</code> boundary reading <code>cookies()</code>, so the static shell stays cacheable via Partial Prerendering while the personalized slice streams in dynamically.</li></ul><div class=\"callout\"><span class=\"lbl\">Trade-off</span> Caching product pages means a price update isn't instantaneous everywhere — bound that staleness with a short <code>cacheLife</code> profile plus an explicit <code>revalidateTag</code> call from the price-update path, rather than either caching forever or going fully dynamic \"to be safe.\"</div>",
      },
    ],
  },
  {
    id: "pr-multitenant-dashboard",
    kind: "design",
    title: "Design a multi-tenant SaaS dashboard's data-fetching & caching",
    level: "architect",
    tags: ["architecture", "multi-tenancy", "caching"],
    promptHtml:
      "<p>Design the App Router data-fetching and caching strategy for a B2B dashboard where each tenant's data must never leak into another tenant's cache, but dashboard widgets are expensive to compute and worth caching per tenant.</p>",
    reveal: [
      {
        label: "Approach",
        html:
          "<p>Treat the tenant id as part of the cache key everywhere, resolve it once at the edge of the request, and prefer a guardrail that makes cross-tenant leakage structurally hard rather than trusting every call site to remember to scope things correctly.</p>",
      },
      {
        label: "Solution",
        html:
          "<ul><li><b>Tenant resolution:</b> subdomain or a signed cookie/JWT claim, read in <code>proxy.ts</code>, forwarded as a header so Server Components and Server Functions can read it without re-parsing auth everywhere.</li><li><b>Cache keys:</b> any <code>\"use cache\"</code> function that's tenant-scoped must take the tenant id as an explicit argument (Cache Components key on the function's arguments) — e.g. <code>getDashboardStats(tenantId)</code>, never a bare <code>getDashboardStats()</code> that implicitly reads a request-scoped tenant from context, which would risk one tenant's cached result being served to another.</li><li><b>Tagging:</b> tag cached widgets with a tenant-scoped tag (<code>tenant:{id}:stats</code>) so a data change for one tenant invalidates only that tenant's cache entries via <code>revalidateTag</code>, not the whole cache.</li><li><b>Personalization vs sharing:</b> widgets that are identical across all of a tenant's users (e.g. \"team activity this week\") cache well; per-user widgets (\"your tasks\") either skip caching or key on <code>tenantId:userId</code>.</li><li><b>Defense in depth:</b> row-level security or an equivalent DB-level tenant filter backs up the cache-key discipline, so a bug in cache-key construction can't actually return another tenant's rows.</li></ul><div class=\"callout warn\"><span class=\"lbl\">Cardinal sin</span> A cached function that reads the \"current tenant\" from ambient request context instead of taking it as an argument — the cache doesn't know about that context, so a cache hit can silently serve tenant A's data to tenant B.</div>",
      },
    ],
  },
  {
    id: "pr-cache-migration-rollout",
    kind: "design",
    title: "Roll out a Cache Components migration safely",
    level: "architect",
    tags: ["architecture", "caching", "migrations"],
    promptHtml:
      "<p>You're migrating a mid-size Next.js app from the older fetch-cache/<code>revalidate</code> model to the new Cache Components model (<code>cacheComponents: true</code>, <code>\"use cache\"</code> + <code>cacheLife</code>/<code>cacheTag</code>). Design how you'd validate and roll this out without a production incident.</p>",
    reveal: [
      {
        label: "Approach",
        html:
          "<p>Treat it like any caching-behavior change: stage it, make the blast radius small and reversible, and watch the specific failure modes this migration introduces (stale data, over-caching request-specific content, build failures from missing Suspense boundaries) before trusting it broadly.</p>",
      },
      {
        label: "Solution",
        html:
          "<ul><li><b>Inventory first:</b> enumerate every data-fetching function and page, classify each as static/cacheable, tenant- or user-scoped, or must-be-dynamic — this becomes the checklist for what should get <code>\"use cache\"</code> versus what should explicitly stay dynamic.</li><li><b>Staging rollout:</b> enable <code>cacheComponents: true</code> behind a preview/staging deployment first; the build itself is a strong signal — it fails loudly on components that need <code>&lt;Suspense&gt;</code> and don't have it, surfacing boundary bugs before users do.</li><li><b>Migrate incrementally:</b> convert one route segment or one high-traffic, low-risk page at a time rather than flipping every fetch call at once; each migrated function gets an explicit <code>cacheLife</code> profile chosen from its actual change frequency, not a copy-pasted default.</li><li><b>Verify tags:</b> for every mutation path (Server Action, webhook, cron job) that used to rely on <code>revalidatePath</code>/time-based revalidation, confirm it now calls <code>revalidateTag</code>/<code>updateTag</code> with the right tag — a missed tag call is the classic \"page never updates again\" bug.</li><li><b>Canary + monitoring:</b> roll to a percentage of production traffic if the platform supports it; watch cache hit rate, staleness complaints, and error rate on previously-dynamic routes that are now cached.</li><li><b>Rollback plan:</b> keep the change behind the single <code>cacheComponents</code> config flag so reverting is a one-line config change plus redeploy, not a multi-file revert.</li></ul><div class=\"callout\"><span class=\"lbl\">Trade-off</span> Migrating incrementally is slower and means running two caching mental models side by side for a while, but a big-bang flip on a mid-size app makes it much harder to attribute a production staleness bug to the one function that got the wrong <code>cacheLife</code> profile.</div>",
      },
    ],
  },
  {
    id: "pr-observability-nextjs",
    kind: "design",
    title: "Design observability for a Next.js app in production",
    level: "senior",
    tags: ["architecture", "observability"],
    promptHtml:
      "<p>Users are reporting the site \"feels slow\" but nothing looks obviously broken in a quick check. Design the observability you'd want already in place so you can diagnose this precisely instead of guessing.</p>",
    reveal: [
      {
        label: "Approach",
        html:
          "<p>Cover both ends of the stack — real user experience in the browser and what's happening on the server/edge — and make sure the two can be correlated back to the same request, not just monitored as separate dashboards.</p>",
      },
      {
        label: "Solution",
        html:
          "<ul><li><b>Core Web Vitals (field data):</b> capture LCP, INP, and CLS from real users via <code>next/web-vitals</code> reporting or a RUM vendor — lab data (Lighthouse) alone misses device/network variance that's often the actual cause of \"feels slow.\"</li><li><b>Client error tracking:</b> a Sentry/equivalent client SDK with source maps uploaded, so a React error boundary crash resolves to a real stack trace, not minified noise.</li><li><b>Server/edge logs & traces:</b> structured logs from route handlers, Server Actions, and <code>proxy.ts</code> correlated by a request id; trace spans around slow operations (DB calls, external APIs) so a latency spike points at a specific span, not \"the server.\"</li><li><b>Caching visibility:</b> log or metric cache hit/miss for key cached functions — a sudden miss-rate spike (e.g. after a deploy invalidated tags unexpectedly) is a common, otherwise-invisible cause of \"feels slow.\"</li><li><b>Build/deploy signals:</b> track bundle size and route-level JS over time (e.g. in CI) since a slow client interaction is often a shipped-too-much-JS regression, not a server issue at all.</li><li><b>Alerting:</b> tie alerts to user-facing SLOs (p75 LCP/INP, error rate) rather than raw infra metrics, so an alert firing actually means users are affected.</li></ul><div class=\"callout\"><span class=\"lbl\">Trade-off</span> Full RUM + tracing has real cost (vendor pricing, added client JS for the reporting beacon) — for a small app, start with Web Vitals reporting + error tracking, and add tracing once you have a specific class of incident you can't otherwise diagnose.</div>",
      },
    ],
  },
];
