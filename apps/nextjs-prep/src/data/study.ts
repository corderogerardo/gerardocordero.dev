// Study guide — Next.js App Router sections (01–20). Long-form HTML rendered via <RichText>.
export type StudySection = { id: string; num: string; title: string; html: string };

export const STUDY_INTRO_HTML =
  "<span class=\"lbl\">How to use this</span> Each topic explains the concept at the depth a senior Next.js / React interview expects, then gives a <b>“how to say it”</b> line — the crisp sentence to deliver out loud. Read for understanding first; rehearse the one-liners last. Everything is current to <b>Next.js 16.2</b> and <b>React 19.2</b>.";

export const STUDY_SECTIONS: StudySection[] = [
  {
    id: "st-1",
    num: "01",
    title: "01 · The App Router mental model",
    html:
      "<p><b>What they want:</b> you understand that the App Router flips the default. Every component under <code>app/</code> is a <b>Server Component</b> unless it opts into <code>\"use client\"</code>. That's a deliberate inversion from the Pages Router, where everything shipped to the browser by default.</p>" +
      "<p><b>Why RSC exists:</b> three wins. Less JavaScript ships — a Server Component's logic and its dependencies never reach the client bundle. Secrets stay server-side — you can read a database or an API key directly in a component body with no risk of it leaking into a script tag. And data gets fetched close to the source — no client-side waterfall of \"mount, then fetch,\" no loading spinner tax for every leaf that needs data.</p>" +
      "<p>The wire format is the <b>RSC Payload</b>: not HTML, a compact serialized tree describing the rendered Server Component output, with <i>placeholders</i> for where Client Components go plus the serializable props they need. On first load, the server also renders that tree to HTML for fast paint. The sequence is: HTML arrives and paints immediately → the RSC payload reconciles the tree (React matches it up) → client JS hydrates only the Client Component islands, wiring up event handlers and state.</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “Server Components are the default — they render to a serialized payload with placeholders for Client Components, so only the interactive islands ship JS and hydrate.”</div>",
  },
  {
    id: "st-2",
    num: "02",
    title: "02 · File-system routing & project structure",
    html:
      "<p><b>Core:</b> the <code>app/</code> directory is the router — folders define URL segments, and specially-named files inside a folder define behavior for that segment. <code>page.tsx</code> makes a segment publicly reachable and renders the UI. <code>layout.tsx</code> wraps a segment and its children, <b>preserves state across navigation</b> (it doesn't remount), and nests automatically with parent layouts.</p>" +
      "<p><code>template.tsx</code> looks like a layout but <b>does</b> remount on every navigation — useful for enter/exit animations or resetting state per-visit. <code>loading.tsx</code> auto-wraps the segment in a <code>&lt;Suspense&gt;</code> boundary and shows while the segment's data resolves. <code>error.tsx</code> is a Client Component error boundary scoped to that segment (must be a Client Component because error boundaries use component state). <code>not-found.tsx</code> renders when <code>notFound()</code> is thrown or a route can't be matched. <code>default.tsx</code> is the fallback UI for a parallel-route slot when Next can't recover the active state on a hard navigation.</p>" +
      "<p>Organize without changing the URL: <b>route groups</b> <code>(marketing)</code> wrap segments in parentheses so the folder name is stripped from the path — handy for giving a section its own layout without adding a URL segment. <b>Private folders</b> <code>_components</code> (leading underscore) opt a folder <i>out</i> of routing entirely, so you can colocate helpers, tests, and non-route files next to the routes that use them.</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “The folder tree is the route tree — page.tsx is what's public, layout.tsx persists across navigations, and route groups let me organize or add a layout boundary without touching the URL.”</div>",
  },
  {
    id: "st-3",
    num: "03",
    title: "03 · Server Components vs Client Components",
    html:
      "<p><b>Default to Server Components</b> for anything that fetches data, reads secrets, or doesn't need interactivity — which in most apps is most of the tree. Reach for a <b>Client Component</b> (<code>\"use client\"</code>) only for the leaf that actually needs <code>useState</code>, <code>useEffect</code>, event handlers, or browser-only APIs.</p>" +
      "<p><b>The directive is a module-graph boundary, not a per-component flag.</b> <code>\"use client\"</code> at the top of a file marks that file as the <i>entry point</i> into the client bundle — everything that file imports and directly renders also ships to the client, even if those modules have no directive of their own. It does not mean \"only this component is a Client Component\"; it means \"this is where server and client split.\"</p>" +
      "<p><b>Interleaving</b> is the trick that keeps Server Components server-rendered even inside a Client Component tree: pass a Server Component as <code>children</code> or another prop to a Client Component, rather than importing and rendering it directly. <code>&lt;Modal&gt;&lt;Cart/&gt;&lt;/Modal&gt;</code> — <code>Modal</code> is a Client Component providing the open/close interactivity, but <code>Cart</code> is composed in from a Server Component parent and stays server-rendered; <code>Modal</code> just receives its already-rendered output as a slot.</p>" +
      "<p>React Context needs a Client wrapper because context depends on <code>createContext</code>/<code>useContext</code>, which require client-side reactivity — a Server Component can't subscribe to anything. The convention is a small <code>\"use client\"</code> provider file that wraps <code>children</code>, so everything below it can still be a Server Component by default.</p>" +
      "<p><code>server-only</code> and <code>client-only</code> are guard packages: importing <code>server-only</code> into a module throws a build error if that module is ever pulled into a client bundle (and vice versa) — cheap insurance against a secret-reading utility accidentally leaking into the browser.</p>" +
      "<div class=\"callout warn\"><span class=\"lbl\">Gotcha</span> Adding <code>\"use client\"</code> to a top-level layout or page \"just to fix an error\" drags everything it imports into the client bundle. Push the directive as far down the tree as possible — onto the specific interactive leaf, not its ancestors.</div>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “\"use client\" marks a module boundary, not a single component — so I push it to the smallest leaf that needs interactivity and pass Server Components in as children to keep the rest of the tree server-rendered.”</div>",
  },
  {
    id: "st-4",
    num: "04",
    title: "04 · Rendering strategies",
    html:
      "<p><b>Core:</b> the App Router collapses the old SSG/ISR/SSR taxonomy into two axes — <b>static</b> and <b>dynamic</b> rendering — decided per route at build/request time rather than declared up front. Static rendering runs at build time (or once, then cached), producing HTML that's reused for every visitor — this is what SSG and ISR effectively become. Dynamic rendering runs on every request, because the route needs something that can only be known at request time.</p>" +
      "<p><b>How the router decides:</b> a route becomes dynamic when it touches a request-time API — reading <code>cookies()</code>, <code>headers()</code>, an uncached <code>searchParams</code>, or calling an uncached <code>fetch</code>. In the previous (pre–Cache Components) model, this was often made explicit with the route segment config <code>export const dynamic = 'force-dynamic' | 'force-static'</code>, which pins the behavior instead of letting Next infer it from API usage. <b>ISR</b> in this framing is just static rendering with a <code>revalidate</code> window — serve the cached HTML, and regenerate it in the background after the window expires.</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “I think in static vs dynamic, not SSG vs SSR — a route is dynamic the moment it touches a request-time API, and ISR is just static rendering with a revalidate window.”</div>",
  },
  {
    id: "st-5",
    num: "05",
    title: "05 · Cache Components & Partial Prerendering",
    html:
      "<p><b>Core:</b> Cache Components is the new caching model, opted into with <code>cacheComponents: true</code> in <code>next.config.ts</code>. It replaces \"is this route static or dynamic\" with a more granular question: which <i>pieces</i> of a route are cacheable, marked explicitly rather than inferred.</p>" +
      "<p>The <code>\"use cache\"</code> directive marks a function, component, or entire file as cacheable. Put it at the top of an async function and its return value gets cached; put it at the top of a file and every exported function in that file is cacheable. The cache key is derived <b>automatically</b> from the function's arguments and any values captured from its closure — you don't hand-roll a key.</p>" +
      "<p><code>cacheLife(profile)</code> and <code>cacheTag(tag)</code>, both imported from <code>next/cache</code>, are now <b>stable</b> — no more <code>unstable_</code> prefix. <code>cacheLife</code> sets how long a cache entry is considered fresh (built-in profiles like <code>'seconds'</code>, <code>'minutes'</code>, <code>'hours'</code>, <code>'days'</code>, or a custom object); <code>cacheTag</code> attaches an invalidation label you can later target with <code>revalidateTag</code>/<code>updateTag</code>.</p>" +
      "<p><b>Partial Prerendering</b> is the delivery mechanism: a route's static shell — everything that isn't wrapped in dynamic data access — prerenders at build time, and a <code>&lt;Suspense&gt;</code> boundary around a dynamic piece creates a \"hole\" in that shell that streams in at request time. The static shell serves instantly from the CDN edge; the dynamic hole fills in a beat later.</p>" +
      "<p>Under Cache Components, accessing a request-time API (like <code>cookies()</code>) or an uncached data source <b>outside</b> of a <code>&lt;Suspense&gt;</code> boundary or a <code>\"use cache\"</code> function is a build/dev-time error — the framework refuses to guess whether that piece should be static or dynamic and forces you to be explicit. <code>connection()</code> is the escape hatch for non-deterministic calls (<code>Math.random()</code>, <code>Date.now()</code>) that aren't request-time APIs but still shouldn't be baked into the static shell — awaiting it defers the rest of the function to request time.</p>" +
      "<div class=\"callout warn\"><span class=\"lbl\">Gotcha</span> Cache Components is opt-in and changes the rules — don't assume it's active on every Next 16 project. Check <code>next.config.ts</code> for <code>cacheComponents: true</code> before reasoning about caching behavior.</div>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “With Cache Components, caching is explicit — 'use cache' marks what's cacheable with an auto-derived key, cacheLife/cacheTag control freshness and invalidation, and Suspense boundaries carve the dynamic holes out of an otherwise static, prerendered shell.”</div>",
  },
  {
    id: "st-6",
    num: "06",
    title: "06 · The previous caching model",
    html:
      "<p><b>Core:</b> unless a route opts into Cache Components, it runs on the <i>original</i> App Router caching model — and that model is important to know because it's still the default. This is <b>not a layer underneath Cache Components</b>; they're two different mental models for the same problem, and mixing their vocabulary in an interview answer is a tell that you don't actually know which one a given project is running.</p>" +
      "<p>In this model, <code>fetch()</code> is <b>uncached by default</b> in the App Router (a deliberate change from the Pages Router, where data fetching had no built-in cache at all). You opt in per call: <code>fetch(url, { cache: 'force-cache' })</code> caches indefinitely until manually invalidated, and <code>fetch(url, { next: { revalidate: 60, tags: ['posts'] } })</code> caches with a time-based revalidation window and/or a tag you can invalidate on demand.</p>" +
      "<p>For data access that isn't a <code>fetch</code> call — an ORM query, a direct database client — <code>unstable_cache()</code> gives the same caching behavior (TTL, tags) for an arbitrary async function. Route segment config still applies here: <code>export const dynamic</code>, <code>export const revalidate</code>, and <code>export const fetchCache</code> at the top of a <code>page.tsx</code>/<code>layout.tsx</code> pin the whole route's caching behavior rather than deciding it per-fetch.</p>" +
      "<p>React's <code>cache()</code> function is a different tool entirely — it doesn't persist data across requests, it deduplicates calls to the same function <b>within a single request</b>, so if three components on a page all call <code>getUser(id)</code>, the underlying work runs once.</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “Without Cache Components, fetch is uncached by default and I opt in with force-cache or a revalidate/tags option; for non-fetch data I reach for unstable_cache, and React's cache() is just per-request dedup, not persistent caching.”</div>",
  },
  {
    id: "st-7",
    num: "07",
    title: "07 · Streaming & Suspense",
    html:
      "<p><b>Core:</b> wrapping a slow piece of UI in <code>&lt;Suspense fallback={...}&gt;</code> lets the rest of the route's HTML shell stream to the browser immediately, with the fallback shown in place of the slow part, then the real content streams in and swaps the fallback out once it resolves — no need to block the entire page behind the slowest data dependency.</p>" +
      "<p>The subtlety worth stating out loud: being <i>wrapped</i> in Suspense is not the same as being <i>dynamic</i>. If the component inside the boundary is synchronous and doesn't touch any request-time API, it still fully resolves at build time — the Suspense boundary is just structurally present in the JSX, but there's nothing for it to actually suspend on, so it contributes nothing to a dynamic hole under Partial Prerendering. Suspense only creates useful streaming behavior when something inside it is genuinely asynchronous and slow (a real fetch, a real request-time API).</p>" +
      "<div class=\"callout warn\"><span class=\"lbl\">Trap</span> Don't assume wrapping something in Suspense makes a route dynamic or improves its build-time behavior — check whether the wrapped component actually awaits something request-dependent, or the boundary is dead weight.</div>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “Suspense streams the shell first and fills in the slow part later — but only if what's inside actually suspends on something async; a synchronous component in a Suspense boundary still resolves at build time.”</div>",
  },
  {
    id: "st-8",
    num: "08",
    title: "08 · Data fetching patterns",
    html:
      "<p><b>Core:</b> Server Components fetch data directly in the component body with <code>await</code> — no <code>useEffect</code>, no loading state boilerplate for the common case. The pattern you choose controls whether independent fetches run in parallel or accidentally serialize.</p>" +
      "<p><b>Parallel:</b> start multiple <code>fetch</code>/query calls without awaiting each one immediately, then await them together — either by awaiting two promises close together or explicitly with <code>Promise.all([getUser(id), getPosts(id)])</code>. Both requests fire at the same time instead of one waiting on the other.</p>" +
      "<p><b>Sequential (a waterfall):</b> sometimes unavoidable and sometimes intentional — you need the result of one fetch (a user's team id) before you can make the next (that team's members). The skill isn't \"never waterfall,\" it's recognizing which dependencies are real and which are accidental (e.g., two components independently awaiting inside nested JSX when they could have started together higher up the tree).</p>" +
      "<p><b>Preloading:</b> a common idiom is a <code>preload()</code> utility — a non-awaited call to a <code>cache()</code>-wrapped data function, fired early (often at the top of a parent) so the request is already in flight by the time a child component actually awaits it deeper in the tree. Because <code>cache()</code> dedupes by arguments within the request, the child's later <code>await getUser(id)</code> just resolves the already-started promise instead of firing a second request.</p>" +
      "<p><code>use()</code> is the API for the opposite direction — piping a promise from a Server Component into a Client Component and reading it there. The Server Component starts the fetch and passes the <i>promise itself</i> (not the awaited value) as a prop; the Client Component calls <code>use(promise)</code> inside a <code>&lt;Suspense&gt;</code> boundary to suspend until it resolves, which lets the server-rendered shell stream immediately while that specific value streams in afterward.</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “I start independent fetches together so they run in parallel, use a cache()-backed preload() to kick off requests early, and use() when I need to stream a promise from a Server Component into a Client Component without blocking the shell.”</div>",
  },
  {
    id: "st-9",
    num: "09",
    title: "09 · Server Functions & Server Actions",
    html:
      "<p><b>Core:</b> the <code>\"use server\"</code> directive marks a function as a Server Function — code that's defined wherever you write it but always executes on the server, callable from Client Components as if it were a local async function. Put it at the top of the function body for a one-off, or at the top of a file to mark every export in that file. When a Server Function is passed to a form, it's conventionally called a Server Action.</p>" +
      "<p>The idiomatic invocation is <code>&lt;form action={myServerFunction}&gt;</code>, or <code>formAction</code> on an individual submit button when a form needs to support multiple actions. Under the hood, Next generates a stable reference to the function and turns the form submission into a POST.</p>" +
      "<p><b>The security-critical fact:</b> every Server Function is <b>always a POST endpoint and always directly reachable</b> from outside your UI — anyone who has the request signature can call it with <code>curl</code>, bypassing your form, your button's disabled state, your client-side checks entirely. This means <b>you must verify authentication and authorization inside the function itself</b>, every time, never relying on \"the button is only rendered for admins\" as a security boundary. The client-side gating is UX, not defense.</p>" +
      "<p>Multiple Server Function calls dispatched from the client are sent <b>sequentially, one at a time</b> — not in parallel — which matters if you're firing several actions in response to one interaction and expect them to race.</p>" +
      "<p><code>useActionState</code> wires a Server Function to pending/result state for a form (replacing the old pattern of manually tracking a loading boolean and a result). <code>useOptimistic</code> lets you render the expected outcome of an action immediately, before the server confirms it, then reconciles once the real response comes back.</p>" +
      "<div class=\"callout warn\"><span class=\"lbl\">Gotcha</span> \"It's only called from a form I control\" is not a security argument — Server Functions are POST-reachable independent of your UI. Check auth inside the action, not just around the trigger.</div>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “Server Functions are directly POST-reachable regardless of the UI that triggers them, so I check auth inside every action — and I use useActionState for pending/result and useOptimistic for the instant-feedback version.”</div>",
  },
  {
    id: "st-10",
    num: "10",
    title: "10 · Mutations & revalidation",
    html:
      "<p><b>Core:</b> after a mutation, something has to tell the cache its data is stale. <code>revalidatePath(path)</code> invalidates everything cached for a specific route path — coarse but simple. <code>revalidateTag(tag, profile)</code> invalidates every cache entry carrying that tag, wherever it lives in the app — finer-grained, since one tag can span many routes.</p>" +
      "<table><tr><th>API</th><th>Behavior</th></tr>" +
      "<tr><td><code>revalidatePath</code></td><td>Invalidate by route path</td></tr>" +
      "<tr><td><code>revalidateTag(tag, profile)</code></td><td>Invalidate by tag — SWR-style: next visitor may still get stale data briefly while it regenerates</td></tr>" +
      "<tr><td><code>updateTag(tag)</code></td><td>Invalidate by tag, Server-Actions-only — read-your-writes, refreshes immediately, no stale window</td></tr>" +
      "<tr><td><code>refresh()</code></td><td>Server-Actions-only — refreshes uncached/dynamic UI on screen without touching the cache at all</td></tr></table>" +
      "<p><b>Next 16 breaking change:</b> <code>revalidateTag</code> now takes a second, required <code>cacheLife</code>-profile argument, because it behaves with stale-while-revalidate semantics — the profile tells it how to treat the transition window. This is different from <code>updateTag</code> (new in 16, Server-Actions-only), which gives you immediate, read-your-writes freshness with no stale window, and <code>refresh()</code> (also new in 16, also Server-Actions-only), which refreshes only the uncached parts of the current UI without invalidating anything in the shared cache.</p>" +
      "<p><code>redirect()</code> works by throwing a special control-flow exception that Next catches internally — this means code after a <code>redirect()</code> call never runs, and any revalidation you need must happen <b>before</b> you call it, not after.</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “revalidatePath/revalidateTag are SWR-style — revalidateTag now needs a cacheLife profile in Next 16 — while updateTag and refresh are the new Server-Actions-only primitives for immediate, read-your-writes freshness. And I always revalidate before redirect, since redirect throws.”</div>",
  },
  {
    id: "st-11",
    num: "11",
    title: "11 · Dynamic routing",
    html:
      "<p><b>Core:</b> square brackets in a folder name create a dynamic segment. <code>[slug]</code> matches exactly one path segment (<code>/blog/hello-world</code> → <code>slug: 'hello-world'</code>). <code>[...catchAll]</code> matches one or more segments and captures them as an array (<code>/docs/a/b/c</code> → <code>['a','b','c']</code>) — but <code>/docs</code> alone won't match. <code>[[...optionalCatchAll]]</code> is the same, but also matches the base route with zero segments, making the whole array optional.</p>" +
      "<p><code>generateStaticParams</code> is an async function exported from a dynamic route's <code>page.tsx</code> that returns the list of param values to prerender at build time — the App Router's replacement for <code>getStaticPaths</code>. Params not returned by it either 404 or render dynamically on first request, depending on config.</p>" +
      "<p><code>params</code> (and <code>searchParams</code>) are <b>Promises</b> that must be <code>await</code>ed before use — this applies to every dynamic segment and every page/layout that reads them.</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “[slug] is one segment, [...catchAll] is one-or-more captured as an array, and the double-bracket version makes that array optional — and generateStaticParams is how I tell the build which values to prerender.”</div>",
  },
  {
    id: "st-12",
    num: "12",
    title: "12 · Route groups, parallel routes & intercepting routes",
    html:
      "<p><b>Route groups</b> <code>(marketing)</code> organize files and can define <b>multiple root layouts</b> — put two route groups directly under <code>app/</code>, each with its own <code>layout.tsx</code> containing <code>&lt;html&gt;</code>/<code>&lt;body&gt;</code>, and you get, say, a completely different shell for a marketing site versus a dashboard, sharing nothing at the root.</p>" +
      "<p><b>Parallel routes</b> use a <code>@slot</code> folder to render more than one independent page into the same layout simultaneously — a dashboard with a <code>@analytics</code> slot and a <code>@team</code> slot rendered side by side, each with its own loading/error state and its own subnavigation. The layout receives each slot as a prop and places it in JSX like any other child.</p>" +
      "<div class=\"callout warn\"><span class=\"lbl\">Next 16 breaking change</span> Every parallel route slot now <b>requires an explicit <code>default.js</code></b> — previously Next would fall back gracefully in some cases, but now a slot without one causes a build failure. Add a <code>default.tsx</code> to every <code>@slot</code> folder, even if it just renders <code>null</code>.</div>" +
      "<p><b>Intercepting routes</b> let a route render in the context of the <i>current</i> layout while still updating the URL — the classic use case is a photo grid where clicking a thumbnail opens it as a modal (intercepted), but a hard refresh or direct link to that URL renders the full standalone page instead. The convention is relative-path-style prefixes on the folder name: <code>(.)</code> intercepts a segment at the <b>same</b> level, <code>(..)</code> one level <b>above</b>, <code>(..)(..)</code> two levels above, and <code>(...)</code> from the <b>root</b>.</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “Parallel routes with @slots render independent pages into one layout — and every slot needs its own default.js now in Next 16 — while intercepting routes with (.)/(..)/(...) give me real URLs for modals that still fall back to the full page on refresh.”</div>",
  },
  {
    id: "st-13",
    num: "13",
    title: "13 · proxy.ts (formerly middleware.ts)",
    html:
      "<p><b>Core:</b> Next 16 renamed the file and export — <code>middleware.ts</code> is now <code>proxy.ts</code>, and the exported function <code>middleware</code> is now named <code>proxy</code>. The rename is intentional: \"middleware\" implied it could sit anywhere in the request/response cycle doing arbitrary work, when in practice this layer is specifically a network boundary that runs before a request reaches your routes — <code>proxy</code> names that accurately.</p>" +
      "<p>The functional change alongside the rename: <code>proxy.ts</code> runs <b>only on the Node.js runtime</b> now — there's no edge runtime option for it. The deprecated <code>middleware.ts</code> path still exists and still supports edge, kept around for projects that specifically need edge execution, but new code should use <code>proxy.ts</code> and accept the Node.js runtime.</p>" +
      "<p><b>Common uses:</b> gating routes behind auth (checking a session cookie before allowing a request through and redirecting to <code>/login</code> if it's missing), A/B testing (rewriting a request to a variant path based on a cookie or header), and header rewriting/injection (adding a request id, a CSP nonce, or normalizing a header before it hits a route handler).</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “It's proxy.ts and export function proxy now, not middleware — the rename makes explicit that it's a network boundary, and in Next 16 it's Node.js-only, no more edge option for new code.”</div>",
  },
  {
    id: "st-14",
    num: "14",
    title: "14 · Route Handlers",
    html:
      "<p><b>Core:</b> a <code>route.ts</code> file inside <code>app/</code> exports HTTP-verb-named functions — <code>GET</code>, <code>POST</code>, <code>PUT</code>, <code>DELETE</code>, etc. — turning that segment into an API endpoint instead of a page. A folder can have <code>page.tsx</code> or <code>route.ts</code> for a given segment, not both.</p>" +
      "<p><b>When to reach for which:</b> a Server Action / Server Function is the right tool when the caller is your own UI and you're performing a mutation triggered by user interaction — it gives you direct function-call ergonomics with no manual fetch/JSON wiring. A Route Handler is the right tool when you need a real HTTP endpoint — a webhook target for a third-party service, an API consumed by a non-Next client (a mobile app, another service), or when you need explicit control over headers/status codes/streaming responses. A plain Server Component <code>fetch</code>/data call is right when you're just reading data to render — no handler needed at all, since the component itself can talk to the database or an internal service directly.</p>" +
      "<p><b>Caching for GET handlers under Cache Components:</b> a <code>GET</code> handler's output is not cached implicitly the way it might have been under some conventions in the old model — you opt in explicitly, the same way you would inside any other function: wrap the data-producing logic in <code>\"use cache\"</code> (with <code>cacheLife</code>/<code>cacheTag</code> as needed) if you want the response cached, rather than relying on framework-level route-config caching.</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “Server Actions for mutations triggered from my own UI, Route Handlers when I need a real HTTP endpoint for a webhook or an external client, and plain Server Component fetches when I'm just reading data to render.”</div>",
  },
  {
    id: "st-15",
    num: "15",
    title: "15 · Metadata & SEO",
    html:
      "<p><b>Core:</b> export a static <code>metadata</code> object from a <code>page.tsx</code>/<code>layout.tsx</code> when the title/description/OG tags don't depend on data — Next merges metadata down the layout tree, with child segments overriding parent fields. When metadata depends on fetched data (a blog post's title, a product's price in the description), export an async <code>generateMetadata()</code> function instead, which receives the route's <code>params</code> and can await whatever it needs.</p>" +
      "<p><code>next/font</code> self-hosts font files at build time — Google Fonts or local files get downloaded once during the build and served from your own domain, so there's no external network request to a font CDN at runtime (better privacy, one less DNS/TLS round trip) and no layout shift from a font swapping in late, since the font's metrics are known and reserved ahead of time.</p>" +
      "<p>Open Graph and Twitter card images can be static files (<code>opengraph-image.png</code> in a route folder) or generated dynamically with an <code>opengraph-image.tsx</code> file using <code>ImageResponse</code>. <code>sitemap.ts</code> and <code>robots.ts</code> are special files that generate <code>/sitemap.xml</code> and <code>/robots.txt</code> programmatically, so they can be derived from your actual route data (e.g., every blog post) instead of hand-maintained.</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “Static metadata exports for fixed content, generateMetadata when it depends on fetched data, and next/font so there's zero layout shift and zero external request for typography.”</div>",
  },
  {
    id: "st-16",
    num: "16",
    title: "16 · Image & font optimization",
    html:
      "<p><b>Core:</b> <code>next/image</code> replaces a plain <code>&lt;img&gt;</code> with a component that generates a responsive <code>srcset</code> automatically (so the browser downloads a size appropriate to the viewport, not always the largest version), lazy-loads offscreen images by default, and prevents layout shift by requiring width/height (or <code>fill</code>) up front so the browser reserves space before the image loads.</p>" +
      "<p>Remote images must be allow-listed via <code>images.remotePatterns</code> in <code>next.config.ts</code> — a structured pattern (protocol, hostname, port, pathname) rather than the older, coarser <code>images.domains</code> (deprecated), which just allow-listed an entire hostname with no path/protocol granularity.</p>" +
      "<p><b>Next 16 default changes worth knowing cold:</b> <code>minimumCacheTTL</code> (how long an optimized image variant is cached) moved from 60 seconds to <b>4 hours</b> — a much more sensible default for images that rarely change. And the <code>qualities</code> option narrowed to just <code>[75]</code> by default, reducing the number of distinct quality variants generated (and cached) per image unless you explicitly configure more.</p>" +
      "<p><code>next/font</code> (covered in the metadata section) applies here too — it's the font half of the same \"optimize static assets at build time, serve from your own domain\" philosophy that <code>next/image</code> applies to images.</p>" +
      "<div class=\"callout warn\"><span class=\"lbl\">Gotcha</span> Forgetting <code>images.remotePatterns</code> for a new external image host is one of the most common \"why is my image broken in production\" bugs — the dev server sometimes masks it depending on config, but a strict production build will refuse to optimize an unlisted host.</div>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “next/image gives me responsive srcset, lazy loading, and zero layout shift for free, and I allow-list remote hosts with remotePatterns rather than the deprecated domains list.”</div>",
  },
  {
    id: "st-17",
    num: "17",
    title: "17 · Async Request APIs",
    html:
      "<p><b>Core:</b> <code>cookies()</code>, <code>headers()</code>, <code>draftMode()</code>, and every route's <code>params</code> and <code>searchParams</code> are all <b>Promises</b> — this used to be a gradual migration (sync access was deprecated with a warning for a while), but as of Next 16 <b>sync access has been fully removed</b>. Every one of these must be <code>await</code>ed before you can read from it, in both Server Components and Route Handlers.</p>" +
      "<div class=\"code\">export default async function Page({\n  params,\n  searchParams,\n}: PageProps&lt;'/blog/[slug]'&gt;) {\n  const { slug } = await params;\n  const { q } = await searchParams;\n  const store = await cookies();\n}</div>" +
      "<p>The reasoning connects back to Cache Components: making these APIs async, rather than syncing them off some ambient request object, is what lets the framework reason about a component as \"this awaits something request-dependent\" versus \"this doesn't\" — which is exactly the signal Partial Prerendering needs to decide what belongs in the static shell versus a dynamic hole.</p>" +
      "<p><code>next typegen</code> generates the helper types for a project's actual routes — <code>PageProps</code>, <code>LayoutProps</code>, and <code>RouteContext</code> — parameterized by the literal route pattern (like <code>PageProps&lt;'/blog/[slug]'&gt;</code> above), so <code>params</code>/<code>searchParams</code> come back correctly typed for that specific route instead of a generic <code>Record&lt;string,string&gt;</code>.</p>" +
      "<div class=\"callout warn\"><span class=\"lbl\">Gotcha</span> Code copied from an older Next.js example that reads <code>params.slug</code> synchronously will throw or silently misbehave on Next 16 — always <code>await params</code> first.</div>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “cookies, headers, draftMode, params, and searchParams are all async now — fully async, no sync fallback left in Next 16 — and I lean on next typegen's PageProps/LayoutProps so they come back properly typed per route.”</div>",
  },
  {
    id: "st-18",
    num: "18",
    title: "18 · Authentication & authorization patterns",
    html:
      "<p><b>Core:</b> the common shape is session- or cookie-based — on login, set an HTTP-only cookie (a session id or a signed/encrypted token) that the server reads on subsequent requests to identify the user. HTTP-only keeps it out of reach of client-side JavaScript, which matters for XSS resistance.</p>" +
      "<p><b>Defense in depth across two layers:</b> checking the session in <code>proxy.ts</code> is about <b>UX and routing</b> — redirect an unauthenticated visitor to <code>/login</code> before they even see a protected page's shell, or rewrite based on role. But checking auth <i>again</i> inside the actual Server Component, Route Handler, or Server Action is what provides <b>real security</b> — because, per the Server Functions section, those are directly, independently reachable regardless of whatever proxy logic sits in front of the UI. Treat <code>proxy.ts</code>-level checks as a nice-to-have redirect, never as the only gate.</p>" +
      "<p>In practice, most production apps don't hand-roll session management — they reach for <b>Auth.js</b> (formerly NextAuth.js) for OAuth provider integration, session/JWT handling, and adapter-based persistence, because getting token rotation, CSRF protection, and provider quirks right from scratch is a lot of surface area to own.</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “Proxy-level auth checks are for UX and redirects; the actual security check happens again inside every Server Component, action, and route handler, because those are independently reachable — and in practice I reach for Auth.js rather than hand-rolling sessions.”</div>",
  },
  {
    id: "st-19",
    num: "19",
    title: "19 · Performance & Turbopack",
    html:
      "<p><b>Core:</b> Turbopack is now <b>stable and the default bundler</b> for both <code>next dev</code> and <code>next build</code> in Next 16 — no flag needed to opt in. It's a from-scratch, Rust-based bundler built for incremental computation, and the headline numbers are roughly <b>2–5x faster production builds</b> and up to <b>10x faster Fast Refresh</b> compared to webpack on large apps. You can still opt back out to webpack with <code>--webpack</code> if a project depends on a webpack-specific plugin that hasn't been ported.</p>" +
      "<p><b>React Compiler</b> is stable and opt-in via <code>reactCompiler: true</code> in <code>next.config.ts</code>. It statically analyzes component code at build time and inserts memoization automatically — the <code>useMemo</code>/<code>useCallback</code>/<code>React.memo</code> you'd have hand-written to avoid unnecessary re-renders get generated for you, which both reduces boilerplate and catches memoization opportunities a developer would likely miss or get subtly wrong.</p>" +
      "<p><b>Core Web Vitals</b> — LCP (loading), INP (interactivity, replaced FID), CLS (visual stability) — remain the standard framing for real-user performance, and most of what's covered elsewhere in this guide (Partial Prerendering for fast shells, <code>next/image</code> for CLS, streaming for perceived load time) is in service of them.</p>" +
      "<p><b>Next 16 removed the \"First Load JS\" metric</b> from the build output — it was a rough proxy for bundle size that didn't account well for streaming, code-splitting nuance, or Cache Components. The recommended replacement is measuring what users actually experience: <b>Lighthouse</b> for lab data, <b>Vercel Analytics</b> (or another RUM tool) for field data.</p>" +
      "<p>Two additional navigation-performance mechanisms worth naming: <b>layout deduplication</b> means a shared layout isn't re-fetched/re-rendered on every navigation between sibling routes — the router recognizes it's unchanged and reuses it. <b>Incremental prefetching</b> means the router prefetches only what's needed to render the next likely navigation (not the whole page tree eagerly), keeping prefetch traffic proportional to what the user is likely to click.</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “Turbopack is the default now — stable, several times faster builds and Fast Refresh — React Compiler automates memoization if I opt in, and since Next 16 dropped First Load JS from the build output I measure real performance with Lighthouse and field data instead of a build-time proxy.”</div>",
  },
  {
    id: "st-20",
    num: "20",
    title: "20 · Testing & deployment",
    html:
      "<p><b>Core:</b> Client Components test the way any React component does — Jest or Vitest with React Testing Library, rendering the component, interacting with it, and asserting on the DOM. They're isolated units with no server dependency, so this layer is fast and cheap.</p>" +
      "<p>Server Components can't be unit-tested the same way — there's no simple \"render it in jsdom\" story for a component that's meant to run in a server environment, await data, and produce an RSC payload. The practical answer is to push Server Component coverage up a level, into <b>integration or end-to-end tests</b> (Playwright is the common choice) that actually run the app — real routing, real data fetching (against a test database or mocked network layer) — and assert on the rendered page, rather than trying to mount a Server Component in isolation.</p>" +
      "<p><b>Deployment shape</b> is a real architectural choice, not an afterthought: <code>output: \"export\"</code> produces a fully static export — plain HTML/CSS/JS with no Node.js server required, deployable to any static host or CDN — but it forfeits anything that needs a live server: Server Actions, Route Handlers that do real server work, ISR/on-demand revalidation, and the async request APIs that depend on a real request. The alternative is deploying to a Node.js or Edge-capable platform (Vercel, or a self-hosted Node server) that can run the full feature set.</p>" +
      "<p><b>Environment variables:</b> anything that needs to reach the browser must be prefixed <code>NEXT_PUBLIC_</code> — Next inlines those at build time into the client bundle. Everything else stays server-only by default and is never exposed to the client. The old <code>serverRuntimeConfig</code>/<code>publicRuntimeConfig</code> mechanism from the Pages Router era is gone — environment variables are the one supported mechanism now.</p>" +
      "<p><b>Security basics:</b> Next performs an <b>Origin header check</b> on Server Action requests as CSRF protection — a request whose <code>Origin</code> doesn't match the deployment's expected origin is rejected before your action code even runs. The <code>server-only</code> package (from the Server/Client Components section) guards against a server-only module — one reading secrets or talking to a database — accidentally ending up in a client bundle. And the general discipline is: never pass a secret as a prop into a Client Component, never log a secret where client-visible tooling could pick it up, and treat <code>NEXT_PUBLIC_</code> as a one-way door — anything given that prefix should be treated as public forever.</p>" +
      "<div class=\"callout tip\"><span class=\"lbl\">How to say it</span> “Client Components get fast unit tests with RTL; Server Components get integration/e2e coverage with Playwright since there's no meaningful way to unit-render them; and I pick static export versus a live Node server based on whether the app actually needs Server Actions or on-demand revalidation.”</div>",
  },
];
