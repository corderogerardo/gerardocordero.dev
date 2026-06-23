import type { Level } from "@/lib/levels";

export type PromptKind = "coding" | "design";

export type Prompt = {
  id: string;
  kind: PromptKind;
  title: string;
  level: Level;
  tags: string[];
  /** The question / scenario (rich HTML). */
  promptHtml: string;
  /** Progressively revealed sections (e.g. Approach -> Solution). */
  reveal: { label: string; html: string }[];
};

// Coding + system-design prompts. Authored and adversarially verified via the
// batch-6 content workflow.
export const PROMPTS: Prompt[] = [
  {
    "id": "code-1",
    "kind": "coding",
    "title": "Build a useDebounce hook",
    "level": "mid",
    "tags": [
      "hooks",
      "performance",
      "timers"
    ],
    "promptHtml": "<p>Write a generic <code>useDebounce&lt;T&gt;(value, delay)</code> hook that returns a debounced copy of <code>value</code> which only updates after the input has been stable for <code>delay</code> milliseconds. A classic use is debouncing a search box before firing a query.</p>",
    "reveal": [
      {
        "label": "Approach",
        "html": "<ul><li>Keep the debounced value in <code>useState</code>, seeded with the initial value.</li><li>In a <code>useEffect</code> keyed on <code>[value, delay]</code>, start a <code>setTimeout</code> that commits the latest value.</li><li>Return a cleanup that clears the timer, so a new keystroke cancels the pending update (the core of debouncing).</li><li>Make it generic so it works for strings, numbers, objects, etc.</li></ul>"
      },
      {
        "label": "Solution",
        "html": "<div class=\"code\">import { useEffect, useState } from &quot;react&quot;;\n\nexport function useDebounce&lt;T&gt;(value: T, delay = 300): T {\n  const [debounced, setDebounced] = useState&lt;T&gt;(value);\n\n  useEffect(() =&gt; {\n    const id = setTimeout(() =&gt; setDebounced(value), delay);\n    return () =&gt; clearTimeout(id);\n  }, [value, delay]);\n\n  return debounced;\n}\n\n// Usage:\n// const debouncedQuery = useDebounce(query, 400);\n// useEffect(() =&gt; { search(debouncedQuery); }, [debouncedQuery]);</div><p>Each render with a new <code>value</code> schedules a fresh timer and the cleanup cancels the previous one, so the value only &quot;lands&quot; once typing pauses. This is the trailing-edge debounce most search inputs want.</p>"
      }
    ]
  },
  {
    "id": "code-2",
    "kind": "coding",
    "title": "useInterval without the stale-closure bug",
    "level": "senior",
    "tags": [
      "hooks",
      "closures",
      "timers"
    ],
    "promptHtml": "<p>Implement <code>useInterval(callback, delay)</code> that calls <code>callback</code> every <code>delay</code> ms. The naive version captures a stale <code>callback</code>; your version must always run the latest callback, support changing the delay, and pause when <code>delay</code> is <code>null</code> — all without re-subscribing the interval on every callback change.</p>",
    "reveal": [
      {
        "label": "Approach",
        "html": "<ul><li>The trap: putting <code>callback</code> in the effect deps tears down and recreates the interval on every render; leaving it out captures a stale closure.</li><li>Store the latest <code>callback</code> in a <code>useRef</code> and refresh it in an effect each render.</li><li>Set up the <code>setInterval</code> in a separate effect keyed only on <code>[delay]</code>, invoking <code>savedCallback.current</code>.</li><li>Treat <code>delay === null</code> as &quot;paused&quot; by skipping setup.</li></ul>"
      },
      {
        "label": "Solution",
        "html": "<div class=\"code\">import { useEffect, useRef } from &quot;react&quot;;\n\nexport function useInterval(callback: () =&gt; void, delay: number | null): void {\n  const savedCallback = useRef(callback);\n\n  // Always keep the ref pointing at the freshest callback.\n  useEffect(() =&gt; {\n    savedCallback.current = callback;\n  }, [callback]);\n\n  useEffect(() =&gt; {\n    if (delay === null) return; // paused\n    const id = setInterval(() =&gt; savedCallback.current(), delay);\n    return () =&gt; clearInterval(id);\n  }, [delay]);\n}</div><p>The ref decouples &quot;which function runs&quot; from &quot;when the interval restarts,&quot; so the timer survives re-renders yet never fires a stale closure. This is the canonical Dan Abramov pattern.</p>"
      }
    ]
  },
  {
    "id": "code-3",
    "kind": "coding",
    "title": "usePrevious hook",
    "level": "junior",
    "tags": [
      "hooks",
      "refs"
    ],
    "promptHtml": "<p>Write <code>usePrevious&lt;T&gt;(value)</code> that returns the value from the previous render (and <code>undefined</code> on the first render). Useful for detecting transitions, e.g. animating only when a prop actually changed.</p>",
    "reveal": [
      {
        "label": "Approach",
        "html": "<ul><li>A ref persists across renders without causing re-renders.</li><li>Read <code>ref.current</code> for the return value <i>before</i> updating it.</li><li>Update the ref inside <code>useEffect</code> so it reflects the committed value, not a value from an abandoned render.</li><li>Return type is <code>T | undefined</code> because the first render has no predecessor.</li></ul>"
      },
      {
        "label": "Solution",
        "html": "<div class=\"code\">import { useEffect, useRef } from &quot;react&quot;;\n\nexport function usePrevious&lt;T&gt;(value: T): T | undefined {\n  const ref = useRef&lt;T | undefined&gt;(undefined);\n\n  useEffect(() =&gt; {\n    ref.current = value;\n  }, [value]);\n\n  return ref.current;\n}\n\n// const prevCount = usePrevious(count);\n// if (prevCount !== undefined &amp;&amp; count &gt; prevCount) animateUp();</div><p>Because the effect runs <i>after</i> render commits, the component renders with last cycle's value still in the ref, then the ref is advanced — giving you a clean &quot;before/after&quot; pair. Note: with React 19, <code>useRef</code> requires an explicit initial argument, hence <code>useRef&lt;T | undefined&gt;(undefined)</code>.</p>"
      }
    ]
  },
  {
    "id": "code-4",
    "kind": "coding",
    "title": "Typed generic groupBy<T, K>",
    "level": "mid",
    "tags": [
      "typescript",
      "generics",
      "utilities"
    ],
    "promptHtml": "<p>Write a type-safe <code>groupBy&lt;T, K&gt;(items, getKey)</code> that buckets an array into a <code>Record&lt;K, T[]&gt;</code>, where <code>getKey</code> derives the grouping key (constrained to a valid property-key type) for each item.</p>",
    "reveal": [
      {
        "label": "Approach",
        "html": "<ul><li>Constrain <code>K</code> to <code>PropertyKey</code> (<code>string | number | symbol</code>) so it can index an object.</li><li>Use <code>reduce</code> to accumulate; lazily create the bucket array on first sighting of a key.</li><li>Seed the accumulator typed as <code>Record&lt;K, T[]&gt;</code> via an assertion since it starts empty.</li><li>Return a partial-ish record; in practice annotate as <code>Record&lt;K, T[]&gt;</code> and document that absent keys are simply missing.</li></ul>"
      },
      {
        "label": "Solution",
        "html": "<div class=\"code\">export function groupBy&lt;T, K extends PropertyKey&gt;(\n  items: readonly T[],\n  getKey: (item: T) =&gt; K,\n): Record&lt;K, T[]&gt; {\n  return items.reduce((acc, item) =&gt; {\n    const key = getKey(item);\n    (acc[key] ??= []).push(item);\n    return acc;\n  }, {} as Record&lt;K, T[]&gt;);\n}\n\n// const byRole = groupBy(users, (u) =&gt; u.role);\n// byRole.admin // User[]</div><p>The <code>K extends PropertyKey</code> bound is what makes the index signature legal, and <code>??=</code> keeps bucket creation a one-liner. Callers get precise return types inferred from <code>getKey</code>.</p>"
      }
    ]
  },
  {
    "id": "code-5",
    "kind": "coding",
    "title": "Fix the broken React.memo re-render",
    "level": "senior",
    "tags": [
      "react",
      "performance",
      "re-renders",
      "memoization"
    ],
    "promptHtml": "<p>This <code>&lt;Row&gt;</code> is wrapped in <code>React.memo</code> but still re-renders on every parent render. Explain why and fix it.</p><div class=\"code\">const Row = React.memo(({ item, style, onPress }: RowProps) =&gt; {\n  return &lt;Pressable style={style} onPress={onPress}&gt;&lt;Text&gt;{item.name}&lt;/Text&gt;&lt;/Pressable&gt;;\n});\n\nfunction List({ items }: { items: Item[] }) {\n  return (\n    &lt;&gt;{items.map((item) =&gt; (\n      &lt;Row key={item.id} item={item}\n        style={{ padding: 8 }}\n        onPress={() =&gt; select(item.id)} /&gt;\n    ))}&lt;/&gt;\n  );\n}</div>",
    "reveal": [
      {
        "label": "Approach",
        "html": "<ul><li><code>React.memo</code> does a shallow prop compare. The inline <code>style={{ padding: 8 }}</code> object and the inline <code>onPress</code> arrow are <b>new references every render</b>, so the compare always fails.</li><li>Hoist the static style out of render (or build it once with <code>StyleSheet.create</code>).</li><li>Give each row a stable <code>onPress</code> — pass the id down and memoize the handler with <code>useCallback</code>, letting the child bind the id, so the callback identity doesn't change per render.</li></ul>"
      },
      {
        "label": "Solution",
        "html": "<div class=\"code\">const styles = StyleSheet.create({ row: { padding: 8 } });\n\nconst Row = React.memo(function Row(\n  { item, onPress }: { item: Item; onPress: (id: string) =&gt; void },\n) {\n  return (\n    &lt;Pressable style={styles.row} onPress={() =&gt; onPress(item.id)}&gt;\n      &lt;Text&gt;{item.name}&lt;/Text&gt;\n    &lt;/Pressable&gt;\n  );\n});\n\nfunction List({ items }: { items: Item[] }) {\n  // stable identity across renders\n  const handlePress = useCallback((id: string) =&gt; select(id), []);\n  return (\n    &lt;&gt;{items.map((item) =&gt; (\n      &lt;Row key={item.id} item={item} onPress={handlePress} /&gt;\n    ))}&lt;/&gt;\n  );\n}</div><p>Now <code>style</code> is a stable <code>StyleSheet</code> reference and <code>onPress</code> is a single memoized function, so <code>memo</code>'s shallow compare passes and only rows whose <code>item</code> actually changed re-render. The child closes over <code>item.id</code> itself, keeping the parent's callback identity constant.</p>"
      }
    ]
  },
  {
    "id": "code-6",
    "kind": "coding",
    "title": "Map-based LRU cache",
    "level": "senior",
    "tags": [
      "data-structures",
      "typescript",
      "caching"
    ],
    "promptHtml": "<p>Implement an <code>LRUCache&lt;K, V&gt;</code> with a fixed <code>capacity</code> exposing <code>get(key)</code> and <code>set(key, value)</code>, both O(1). When over capacity, evict the least-recently-used entry. Any access (get or set) counts as a use.</p>",
    "reveal": [
      {
        "label": "Approach",
        "html": "<ul><li>A JS <code>Map</code> preserves insertion order, so the <b>first</b> key is the oldest and the last is the newest — perfect for LRU without a hand-rolled linked list.</li><li>On <code>get</code>: if present, delete and re-insert to move it to the &quot;most recent&quot; end.</li><li>On <code>set</code>: delete first (so re-insert updates order), insert, then if <code>size &gt; capacity</code> evict <code>map.keys().next().value</code> (the oldest).</li><li>All operations are amortized O(1).</li></ul>"
      },
      {
        "label": "Solution",
        "html": "<div class=\"code\">export class LRUCache&lt;K, V&gt; {\n  private map = new Map&lt;K, V&gt;();\n  constructor(private capacity: number) {}\n\n  get(key: K): V | undefined {\n    if (!this.map.has(key)) return undefined;\n    const value = this.map.get(key)!;\n    this.map.delete(key);     // re-insert to mark as most-recently used\n    this.map.set(key, value);\n    return value;\n  }\n\n  set(key: K, value: V): void {\n    if (this.map.has(key)) this.map.delete(key);\n    this.map.set(key, value);\n    if (this.map.size &gt; this.capacity) {\n      const oldest = this.map.keys().next().value as K;\n      this.map.delete(oldest);\n    }\n  }\n}</div><p>Exploiting <code>Map</code>'s insertion-order guarantee gives a clean O(1) LRU; the delete-then-set dance is what keeps the ordering honest on every touch.</p>"
      }
    ]
  },
  {
    "id": "code-7",
    "kind": "coding",
    "title": "Implement throttle (and contrast with debounce)",
    "level": "mid",
    "tags": [
      "timers",
      "performance",
      "closures"
    ],
    "promptHtml": "<p>Write a <code>throttle(fn, wait)</code> that invokes <code>fn</code> at most once per <code>wait</code> ms (leading edge), forwarding arguments and preserving <code>this</code>. In one line, state how throttle differs from debounce.</p>",
    "reveal": [
      {
        "label": "Approach",
        "html": "<ul><li><b>Throttle</b> guarantees a steady firing rate (e.g. once / 200ms during continuous scroll); <b>debounce</b> waits for a quiet gap and fires once after activity stops.</li><li>Track <code>lastCall</code> timestamp; only invoke when <code>now - lastCall &gt;= wait</code>.</li><li>Use a <code>function</code> (not arrow) wrapper so <code>this</code> binds correctly, and spread <code>...args</code> through.</li><li>Type it generically with <code>Parameters&lt;T&gt;</code> / <code>ThisParameterType&lt;T&gt;</code>, declaring the <code>this</code> type as the first parameter of the wrapper.</li></ul>"
      },
      {
        "label": "Solution",
        "html": "<div class=\"code\">export function throttle&lt;T extends (...args: any[]) =&gt; void&gt;(\n  fn: T,\n  wait: number,\n): (this: ThisParameterType&lt;T&gt;, ...args: Parameters&lt;T&gt;) =&gt; void {\n  let lastCall = 0;\n  return function (this: ThisParameterType&lt;T&gt;, ...args: Parameters&lt;T&gt;) {\n    const now = Date.now();\n    if (now - lastCall &gt;= wait) {\n      lastCall = now;\n      fn.apply(this, args);\n    }\n  };\n}\n\n// Throttle: caps rate during a burst (scroll/resize handlers).\n// Debounce: collapses a burst into one trailing call (search input).</div><p>The <code>this</code> parameter in the returned function must be <i>typed</i> (<code>this: ThisParameterType&lt;T&gt;</code>) — a bare <code>this</code> is a syntax error. Leading-edge throttle fires immediately then ignores calls until the window elapses, so the handler runs on a predictable cadence — unlike debounce, which intentionally drops everything until the activity settles.</p>"
      }
    ]
  },
  {
    "id": "code-8",
    "kind": "coding",
    "title": "Retry fetch with exponential backoff + AbortController",
    "level": "senior",
    "tags": [
      "async",
      "networking",
      "abortcontroller",
      "resilience"
    ],
    "promptHtml": "<p>Write <code>fetchWithRetry(url, { retries, baseDelay, signal })</code> that retries failed/non-OK responses with exponential backoff (plus jitter), respects an outer <code>AbortController</code> signal so callers can cancel, and per-attempt times out after a budget. Throw the last error if all attempts fail.</p>",
    "reveal": [
      {
        "label": "Approach",
        "html": "<ul><li>Loop up to <code>retries + 1</code> attempts; on a thrown error or non-OK status, wait <code>baseDelay * 2 ** attempt</code> plus random jitter, then retry.</li><li>Combine the caller's <code>signal</code> with a per-attempt timeout via <code>AbortSignal.timeout</code> and <code>AbortSignal.any</code> so either can abort the in-flight request.</li><li>If the caller's signal aborts, stop retrying immediately and rethrow — don't burn the remaining attempts.</li><li>Make the backoff <code>sleep</code> itself abortable so cancellation is responsive between attempts.</li><li>Note: <code>AbortSignal.any</code> / <code>AbortSignal.timeout</code> require a recent Hermes/RN runtime; on older targets, fall back to a manual <code>AbortController</code> + <code>setTimeout</code>.</li></ul>"
      },
      {
        "label": "Solution",
        "html": "<div class=\"code\">function sleep(ms: number, signal?: AbortSignal): Promise&lt;void&gt; {\n  return new Promise((resolve, reject) =&gt; {\n    if (signal?.aborted) return reject(signal.reason);\n    const id = setTimeout(resolve, ms);\n    signal?.addEventListener(&quot;abort&quot;, () =&gt; {\n      clearTimeout(id);\n      reject(signal.reason);\n    }, { once: true });\n  });\n}\n\nexport async function fetchWithRetry(\n  url: string,\n  { retries = 3, baseDelay = 300, signal }:\n    { retries?: number; baseDelay?: number; signal?: AbortSignal } = {},\n): Promise&lt;Response&gt; {\n  let lastError: unknown;\n  for (let attempt = 0; attempt &lt;= retries; attempt++) {\n    signal?.throwIfAborted();\n    const perAttempt = AbortSignal.timeout(10_000);\n    const combined = signal ? AbortSignal.any([signal, perAttempt]) : perAttempt;\n    try {\n      const res = await fetch(url, { signal: combined });\n      if (!res.ok) throw new Error(`HTTP ${res.status}`);\n      return res;\n    } catch (err) {\n      lastError = err;\n      if (signal?.aborted) throw err;          // caller cancelled: stop\n      if (attempt === retries) break;          // out of attempts\n      const backoff = baseDelay * 2 ** attempt + Math.random() * 100;\n      await sleep(backoff, signal);\n    }\n  }\n  throw lastError;\n}</div><p><code>AbortSignal.any</code> merges caller-cancellation and per-attempt timeout into one signal, while exponential backoff with jitter avoids thundering-herd retries. Checking <code>signal.aborted</code> before sleeping keeps cancellation responsive.</p>"
      }
    ]
  },
  {
    "id": "code-9",
    "kind": "coding",
    "title": "Normalize an array into a by-id Record",
    "level": "junior",
    "tags": [
      "typescript",
      "data-modeling",
      "utilities"
    ],
    "promptHtml": "<p>Write <code>normalizeById&lt;T&gt;(items, getId)</code> that turns <code>T[]</code> into <code>Record&lt;string, T&gt;</code> keyed by each item's id, for O(1) lookups (the shape Redux/normalized caches use). Bonus: also return the ordered list of ids.</p>",
    "reveal": [
      {
        "label": "Approach",
        "html": "<ul><li>Reduce into an object, assigning <code>acc[getId(item)] = item</code>.</li><li>Type the id extractor as <code>(item: T) =&gt; string</code> (or <code>PropertyKey</code>) so the result is a valid <code>Record</code>.</li><li>Return both the <code>byId</code> map and an <code>ids</code> array to preserve order — the standard normalized {entities, ids} pair.</li><li>Later items with a duplicate id overwrite earlier ones (last-write-wins), which is usually what you want.</li></ul>"
      },
      {
        "label": "Solution",
        "html": "<div class=\"code\">export function normalizeById&lt;T&gt;(\n  items: readonly T[],\n  getId: (item: T) =&gt; string,\n): { byId: Record&lt;string, T&gt;; ids: string[] } {\n  const byId: Record&lt;string, T&gt; = {};\n  const ids: string[] = [];\n  for (const item of items) {\n    const id = getId(item);\n    if (!(id in byId)) ids.push(id);\n    byId[id] = item;\n  }\n  return { byId, ids };\n}\n\n// const { byId, ids } = normalizeById(messages, (m) =&gt; m.id);\n// byId[selectedId] // O(1) lookup; ids preserves render order</div><p>Separating <code>byId</code> from <code>ids</code> gives O(1) entity access while keeping a stable render order — exactly the normalized cache shape that makes version-based invalidation and optimistic updates cheap.</p>"
      }
    ]
  },
  {
    "id": "code-10",
    "kind": "coding",
    "title": "useToggle hook with stable handlers",
    "level": "junior",
    "tags": [
      "hooks",
      "state",
      "usecallback"
    ],
    "promptHtml": "<p>Write <code>useToggle(initial)</code> returning <code>[value, { toggle, setOn, setOff }]</code> (or a tuple). The handlers must have <b>stable identities</b> across renders so children wrapped in <code>memo</code> don't re-render, and <code>toggle</code> must work correctly even if called multiple times in one tick.</p>",
    "reveal": [
      {
        "label": "Approach",
        "html": "<ul><li>Hold the boolean in <code>useState</code>.</li><li>Wrap every handler in <code>useCallback</code> with an empty dep array so their references never change.</li><li>For <code>toggle</code>, use the <b>functional updater</b> <code>setValue((v) =&gt; !v)</code> — this is what lets it be dependency-free and correct under batching.</li><li>Memoize the returned handlers object too (or return a tuple) so the consumer gets a stable container.</li></ul>"
      },
      {
        "label": "Solution",
        "html": "<div class=\"code\">import { useCallback, useMemo, useState } from &quot;react&quot;;\n\ntype ToggleHandlers = {\n  toggle: () =&gt; void;\n  setOn: () =&gt; void;\n  setOff: () =&gt; void;\n};\n\nexport function useToggle(\n  initial = false,\n): [boolean, ToggleHandlers] {\n  const [value, setValue] = useState(initial);\n\n  const toggle = useCallback(() =&gt; setValue((v) =&gt; !v), []);\n  const setOn = useCallback(() =&gt; setValue(true), []);\n  const setOff = useCallback(() =&gt; setValue(false), []);\n\n  const handlers = useMemo(\n    () =&gt; ({ toggle, setOn, setOff }),\n    [toggle, setOn, setOff],\n  );\n\n  return [value, handlers];\n}\n\n// const [isOpen, { toggle, setOff }] = useToggle();</div><p>Functional updates make the callbacks dependency-free, so <code>useCallback([])</code> yields permanently stable references; the memoized <code>handlers</code> object means passing it to a memoized child won't trigger needless re-renders.</p>"
      }
    ]
  },
  {
    "id": "design-1",
    "kind": "design",
    "title": "Real-time chat for a private-markets app",
    "level": "architect",
    "tags": [
      "real-time",
      "websockets",
      "offline",
      "sync",
      "chat"
    ],
    "promptHtml": "<p>You are architecting the messaging layer of <b>Valt Connect</b>, a private-markets app where deal teams chat about confidential transactions on Twilio Conversations. Threads must feel instant, survive flaky elevator/garage networks, never duplicate or reorder a message, and load months of history smoothly.</p><p>Design the client-side chat system end to end: <b>transport choice</b>, <b>message ordering &amp; dedup</b>, an <b>offline send queue</b>, <b>presence/typing</b>, and <b>history pagination</b>. Walk through what happens to a message sent while the device is fully offline and how it reconciles when the socket reconnects.</p>",
    "reveal": [
      {
        "label": "Clarify & requirements",
        "html": "<ul><li><b>Scope:</b> 1:1 only or group threads? Typical thread size, message volume/day, history depth (months/years)?</li><li><b>Build vs buy:</b> Twilio Conversations as source of truth vs a custom backend — are we bound to Conversations' SDK, its websocket, and its message SID ordering?</li><li><b>Functional:</b> send/receive text + attachments, delivery + read receipts, typing indicators, presence, edit/delete, unread counts, search, push when backgrounded.</li><li><b>Non-functional:</b> perceived send latency &lt; 100ms (optimistic), exactly-once display, ordered within a thread, works fully offline, E2E confidentiality expectations for private-markets data, audit/compliance retention.</li><li><b>Constraints:</b> background socket limits on iOS/Android, message size caps, multi-device same-user sync, regulated data residency.</li></ul>"
      },
      {
        "label": "Key decisions",
        "html": "<ul><li><b>Transport:</b> Conversations' managed websocket (twilsock) for live deltas; REST for backfill/pagination. Don't hand-roll a socket if you're on Twilio — lean on its reconnection + resumption. Push (OneSignal/APNs/FCM) as the wake/notify channel when backgrounded since the socket won't stay open.</li><li><b>Data model:</b> local SQLite (WatermelonDB / op-sqlite) as source of truth for the UI; each message has a server <code>sid</code>, monotonic <code>index</code> from Conversations, a client-generated <code>clientId</code> (UUID) for optimistic dedup, and a <code>status</code> (queued/sent/delivered/read/failed).</li><li><b>Ordering &amp; dedup:</b> render by server <code>index</code>; optimistic messages sort to the tail until the server index returns, then reconcile by <code>clientId</code>. Server index is the tiebreaker, never device clock — clocks are untrusted.</li><li><b>Offline send queue:</b> persisted FIFO queue keyed by thread; optimistic insert with <code>status=queued</code>; a drain worker fires on reconnect with idempotency via <code>clientId</code> so retries don't double-post. Exponential backoff; surface a retry affordance on permanent failure.</li><li><b>Presence/typing:</b> ephemeral, NOT persisted — typing via Conversations' typing events, presence via heartbeat with a TTL; treat as best-effort and decay on socket loss.</li><li><b>Pagination:</b> cursor/index-based windowed fetch (newest-first) into SQLite, inverted FlashList, prefetch older pages on scroll; cache locally so reopening a thread is instant.</li><li><b>Failure modes:</b> socket flap → resume from last index, reconcile missed deltas via REST gap-fill; duplicate push + socket delivery → dedup by sid; app killed mid-send → queue replays on next launch.</li></ul>"
      },
      {
        "label": "Senior signals",
        "html": "<ul><li>Names the <b>server index as the ordering authority</b> and explicitly refuses to trust device timestamps for ordering.</li><li>Treats <b>optimistic UI + idempotency key</b> as one mechanism — knows the queue must be persisted to disk to survive a force-quit, and that the idempotency key prevents double-sends on retry.</li><li>Distinguishes <b>durable state (messages) from ephemeral state (typing/presence)</b> and stores them differently.</li><li>Thinks worst-network: socket flap, gap-fill on reconnect, push-vs-socket race, background socket teardown on mobile OSes.</li><li>Raises <b>confidentiality</b> for private-markets data: who can read history, retention/audit, attachment storage, and whether E2E is required vs transport encryption.</li><li>Observability: send-success rate, queue depth, reconnect time, dedup-collision counts, p95 send-to-delivered latency.</li></ul>"
      }
    ]
  },
  {
    "id": "design-2",
    "kind": "design",
    "title": "Offline-first feed / news app",
    "level": "senior",
    "tags": [
      "offline-first",
      "sync",
      "caching",
      "feed",
      "sqlite"
    ],
    "promptHtml": "<p>Design an <b>offline-first news/feed app</b> that must open instantly to fresh-enough content even with no connectivity (subway, plane), let users read, bookmark, and react while offline, and reconcile those actions when they reconnect.</p><p>Cover the <b>local store</b>, the <b>sync strategy</b> (what's fetched eagerly vs lazily), <b>conflict handling</b> for offline writes, and how you keep the cache from growing unbounded. Explain cold-start behavior and how stale content is detected and refreshed.</p>",
    "reveal": [
      {
        "label": "Clarify & requirements",
        "html": "<ul><li><b>Scope:</b> read-only feed or social (likes/comments/bookmarks)? Personalized/ranked server-side or chronological?</li><li><b>Freshness SLA:</b> how stale is acceptable offline — minutes, hours, last sync? Do we show a 'last updated' marker?</li><li><b>Functional:</b> infinite feed, article detail + images, bookmark/save, react, offline reading of opened + prefetched items, background refresh.</li><li><b>Non-functional:</b> instant cold start from cache, bounded storage, low battery/data use on cellular, graceful no-network UX.</li><li><b>Constraints:</b> image payload sizes, OS background-fetch limits, push-driven refresh availability, account vs anonymous.</li></ul>"
      },
      {
        "label": "Key decisions",
        "html": "<ul><li><b>Local store:</b> SQLite (op-sqlite / WatermelonDB) for feed metadata + a separate file/image cache (expo-image disk cache or RN FS) so blobs don't bloat the DB. Feed items normalized; reactions/bookmarks in their own tables with a <code>pendingSync</code> flag.</li><li><b>Server vs client state:</b> use React Query (or TanStack Query) with a persisted cache for server state, hydrate the list from SQLite on launch, then revalidate (stale-while-revalidate). UI reads from the local store, never blocks on network.</li><li><b>Sync strategy:</b> eager-fetch the top N ranked items + their thumbnails on refresh; lazy-fetch full article bodies + hero images on open or on Wi-Fi background prefetch. Cursor-based pagination; dedup by stable item id.</li><li><b>Offline writes:</b> bookmarks/reactions are an outbox — optimistic local mutation + queued op replayed on reconnect with idempotency. Last-writer-wins for toggles (bookmark on/off); server timestamp resolves conflicts.</li><li><b>Cache eviction:</b> LRU + size cap + TTL; pin bookmarked/opened items so they survive eviction; evict images before metadata.</li><li><b>Cold start:</b> render cached feed immediately with a 'last updated' indicator, kick a background revalidate, diff and patch the list in place to avoid a full re-render/scroll jump.</li><li><b>Failure modes:</b> partial sync (some images missing) → placeholder + retry; revalidate while user scrolls → patch don't replace; stale push token → fall back to foreground refresh.</li></ul>"
      },
      {
        "label": "Senior signals",
        "html": "<ul><li>Separates <b>metadata DB from blob cache</b> and evicts them with different policies — doesn't dump images into SQLite.</li><li>Frames the whole thing as <b>stale-while-revalidate</b>: render cache first, never block UI on network, patch in deltas.</li><li>Designs the <b>outbox/idempotency</b> for offline writes and reasons explicitly about toggle conflicts (LWW) vs counters.</li><li>Has a concrete <b>eviction policy</b> (LRU + cap + TTL + pinning) instead of letting storage grow forever.</li><li>Worst-case thinking: airplane cold start, half-downloaded payloads, scroll-position preservation on background refresh, cellular data budgeting.</li><li>Observability: cache hit rate, sync success/latency, storage footprint, offline-read coverage, outbox drain failures.</li></ul>"
      }
    ]
  },
  {
    "id": "design-3",
    "kind": "design",
    "title": "Resumable image upload with retry & progress",
    "level": "senior",
    "tags": [
      "uploads",
      "resumable",
      "retry",
      "background",
      "progress"
    ],
    "promptHtml": "<p>Design a <b>resumable image/file upload</b> pipeline for a mobile app: users attach large photos/PDFs that must upload reliably over flaky cellular, show real progress, survive app backgrounding or being killed, and resume rather than restart.</p><p>Specify the <b>upload protocol</b> (chunking/resume), <b>progress reporting</b>, the <b>retry/backoff</b> policy, and how you guarantee no duplicate or corrupt uploads. Walk through a 40MB upload that loses signal at 70% and the app is then backgrounded.</p>",
    "reveal": [
      {
        "label": "Clarify & requirements",
        "html": "<ul><li><b>Scope:</b> single vs batch uploads? Max file size, types (HEIC/large PDF like PSPDFKit exports)? Must it complete in background?</li><li><b>Backend:</b> do we control the storage API (S3 multipart, GCS resumable, tus) or is it a fixed endpoint? Chunked-resume support available?</li><li><b>Functional:</b> pick/capture, compress/transcode, per-file progress, pause/resume/cancel, retry, completion even if user leaves the screen.</li><li><b>Non-functional:</b> resilient to network drops, no duplicate objects, integrity verified, low memory (don't load 40MB into JS), battery/data aware.</li><li><b>Constraints:</b> iOS/Android background execution limits, JS thread can't hold large buffers, app may be force-killed mid-upload.</li></ul>"
      },
      {
        "label": "Key decisions",
        "html": "<ul><li><b>Protocol:</b> resumable/chunked — S3 multipart or tus-style — so we upload in parts with byte offsets and can resume from the last acked part. Negotiate an <code>uploadId</code> up front; each part has a checksum.</li><li><b>Native offloading:</b> use a native background-upload module (react-native-background-upload / Expo background task / Android WorkManager + iOS URLSession background config) so transfers continue when the app is backgrounded and stream from disk — never buffer the whole file in JS.</li><li><b>State machine:</b> persist upload state to SQLite — <code>{uploadId, fileUri, totalParts, completedParts[], status}</code>. On launch, rehydrate and resume incomplete uploads.</li><li><b>Progress:</b> native layer emits byte/part progress events; UI subscribes and renders per-file %; throttle event frequency to avoid bridge spam.</li><li><b>Retry/backoff:</b> per-part exponential backoff with jitter + cap; distinguish transient (network/5xx → retry) from permanent (4xx/auth → surface). Refresh auth token before retry if expired.</li><li><b>Integrity &amp; dedup:</b> client-computed checksum per part + a stable client <code>uploadId</code> as idempotency key so a retried finalize doesn't create a second object; server verifies ETag/checksum on assemble.</li><li><b>The 40MB @ 70% case:</b> completed parts are already acked + persisted; signal loss pauses, backoff retries; backgrounding hands off to the native session; on resume, query which parts the server has and upload only the missing ~30%, then finalize.</li><li><b>Failure modes:</b> force-kill mid-part → resume from last acked part; expired multipart session → renegotiate; corrupt part → re-upload that part only.</li></ul>"
      },
      {
        "label": "Senior signals",
        "html": "<ul><li>Reaches for a <b>resumable/chunked protocol</b> and an <b>idempotency key</b> rather than a naive single POST with retry.</li><li>Knows large files must be <b>streamed from disk in native code</b>, not held in the JS heap, and uses OS background transfer APIs for real background completion.</li><li><b>Persists upload state</b> so a force-kill resumes instead of restarting; resumes by asking the server which parts exist.</li><li>Backoff with <b>jitter</b>, transient-vs-permanent error classification, and token refresh before retry.</li><li>Verifies <b>integrity per part</b> (checksums/ETags) and prevents duplicate objects.</li><li>Observability: upload success rate, p95 time-to-complete, resume rate, bytes wasted on restart, per-part failure reasons.</li></ul>"
      }
    ]
  },
  {
    "id": "design-4",
    "kind": "design",
    "title": "Feature-flag & experiment system",
    "level": "architect",
    "tags": [
      "feature-flags",
      "experiments",
      "rollout",
      "config",
      "analytics"
    ],
    "promptHtml": "<p>Design a <b>feature-flag and A/B experiment system</b> for a React Native app: product wants instant kill-switches, gradual rollouts, targeted cohorts, and experiments with stable bucketing — without shipping a new build for each change.</p><p>Specify <b>flag delivery &amp; caching</b> (so the app works on cold start and offline), <b>evaluation</b> (client vs server), <b>bucketing/assignment stability</b>, and <b>exposure logging</b> for analysis. Explain how a flag flips for 1% of users and how you guarantee a user doesn't flip-flop between variants.</p>",
    "reveal": [
      {
        "label": "Clarify & requirements",
        "html": "<ul><li><b>Scope:</b> boolean kill-switches only, or multivariate experiments + remote config values? Real-time flips needed or next-launch acceptable?</li><li><b>Targeting:</b> by user id, app version, platform, region, plan, custom traits? Must rollouts be deterministic and sticky?</li><li><b>Functional:</b> flag fetch + cache, default/fallback values, gradual % rollout, cohort targeting, experiment assignment, exposure events.</li><li><b>Non-functional:</b> no UI flicker on cold start, works offline with last-known config, low latency eval (no per-flag network call), consistent assignment across sessions/devices.</li><li><b>Constraints:</b> build-time defaults must exist; eval can't block first render; analytics must tie exposure to outcome.</li></ul>"
      },
      {
        "label": "Key decisions",
        "html": "<ul><li><b>Build vs buy:</b> LaunchDarkly/Statsig/Flagsmith/GrowthBook/Cloudflare Flagship vs in-house — call out that buy gives streaming + targeting + stats engine; in-house is justified only with scale/cost/data-residency drivers.</li><li><b>Delivery &amp; caching:</b> fetch the full flag ruleset on launch, persist to disk (MMKV/AsyncStorage), evaluate locally so there's no per-flag round trip. Ship <b>compiled-in defaults</b> so the very first cold start (no cache, no network) renders deterministically.</li><li><b>Eval location:</b> client-side local evaluation against a downloaded ruleset for speed/offline; server-side eval only for secret/security-sensitive flags that must not leak rules to the client.</li><li><b>Bucketing stability:</b> deterministic hash of <code>(stableUserId + experimentKey)</code> → bucket. Same input always yields the same variant, so users never flip-flop; salt per experiment so flags are independent.</li><li><b>Gradual rollout:</b> 1% = users whose hash falls in the [0,1%) range; widening the range only adds users, never reassigns existing ones (monotonic ramp).</li><li><b>Exposure logging:</b> fire an exposure event only when the variant actually affects the user (lazy, at decision point), dedup per session, ship to analytics to join with outcomes.</li><li><b>Refresh:</b> streaming/polling for near-real-time kill-switch; otherwise refresh on foreground. Apply changes at safe boundaries to avoid mid-session UI swaps.</li><li><b>Failure modes:</b> no network on first run → compiled defaults; stale ruleset → last-known-good; flag missing → typed fallback; clock/locale drift doesn't affect hash bucketing.</li></ul>"
      },
      {
        "label": "Senior signals",
        "html": "<ul><li>Insists on <b>compiled-in defaults + persisted cache</b> so cold-start and offline never flicker or render the wrong variant.</li><li>Gets <b>deterministic hash bucketing</b> right: stable id + experiment salt, monotonic ramp so widening a rollout never reassigns existing users.</li><li>Separates <b>local eval (fast, offline)</b> from <b>server eval (secret rules)</b> and knows when each applies.</li><li>Understands <b>exposure logging must be lazy and deduped</b> to keep experiment analysis valid (no exposure without actual impact).</li><li>Considers governance: flag lifecycle/cleanup, audit of who flipped what, kill-switch latency, avoiding flag debt.</li><li>Observability: ramp health, variant balance, exposure counts, eval errors, default-fallback rate.</li></ul>"
      }
    ]
  },
  {
    "id": "design-5",
    "kind": "design",
    "title": "Navigation, deep linking & auth gating",
    "level": "senior",
    "tags": [
      "navigation",
      "deep-linking",
      "auth",
      "routing",
      "expo-router"
    ],
    "promptHtml": "<p>Design the <b>navigation, deep-linking, and auth-gating</b> architecture for a React Native app with public, authenticated, and biometric-protected areas. A user can tap a deep link / push / universal link to a protected screen while logged out, mid-session, or with an expired token.</p><p>Specify the <b>navigation structure</b>, how <b>deep links resolve through auth state</b>, how you <b>defer-and-replay</b> an intended destination after login, and how gating interacts with token refresh and biometrics. Walk through a universal link to a deep deal screen when the session is expired.</p>",
    "reveal": [
      {
        "label": "Clarify & requirements",
        "html": "<ul><li><b>Scope:</b> which areas are public vs authed vs biometric-gated? Universal/App Links + custom scheme + push deep links all supported?</li><li><b>Auth model:</b> Salesforce/OAuth as in Valt Connect — access + refresh tokens, biometric unlock on resume? Multi-account?</li><li><b>Functional:</b> link routing to any screen, auth redirect + post-login replay, session restore on cold start, sign-out teardown, biometric re-auth on sensitive routes.</li><li><b>Non-functional:</b> no protected content flashes before auth resolves, deterministic back-stack, deep links work from cold start, no broken state on token expiry.</li><li><b>Constraints:</b> AASA/assetlinks config, link may arrive before auth state is hydrated, refresh may fail and force re-login.</li></ul>"
      },
      {
        "label": "Key decisions",
        "html": "<ul><li><b>Structure:</b> Expo Router (or React Navigation) with route groups — <code>(public)</code>, <code>(auth)</code>, <code>(app)</code>. A root layout reads auth state and renders the correct group; protected groups are gated by a guard, not by hiding tabs.</li><li><b>Auth state machine:</b> <code>booting → unauthenticated → authenticated → locked (biometric)</code>. Render a splash/gate while <code>booting</code> so protected screens never flash before the token is resolved from secure storage.</li><li><b>Deep-link resolution:</b> parse the incoming URL into an intended route; evaluate against auth state. If authed → navigate; if not → stash the intended route, redirect to login, and <b>replay</b> after successful auth (and after biometric unlock if the route is sensitive).</li><li><b>Token + gating interplay:</b> on entering a protected route, ensure a valid access token; if expired, attempt silent refresh; if refresh fails, route to login with the pending destination preserved. Biometric prompt gates the sensitive subtree on cold resume.</li><li><b>Back-stack hygiene:</b> after login-replay, reset the stack so Back doesn't return to the login screen; deep link from cold start builds a sensible parent stack, not a lone orphan screen.</li><li><b>Universal link + expired session walkthrough:</b> link → parse to deal route → guard sees expired token → silent refresh fails → stash route, send to login → user authenticates + Face ID → replay navigates to the deal with a correct back stack.</li><li><b>Failure modes:</b> link arrives pre-hydration → queue until <code>booting</code> resolves; malformed/unauthorized deep link → safe fallback + error; sign-out → purge tokens, secure storage, and navigation state.</li></ul>"
      },
      {
        "label": "Senior signals",
        "html": "<ul><li>Models auth as a <b>state machine with a booting/splash gate</b> so protected content never flashes before the token resolves — a classic flicker bug they've clearly hit.</li><li>Implements <b>deferred deep-link replay</b>: stash intended route, login, replay, then fix the back stack so Back doesn't land on login.</li><li>Ties <b>deep linking to token refresh and biometrics</b> as one flow, including the refresh-fails-→-relogin path.</li><li>Handles the <b>link-before-hydration race</b> and cold-start deep links that need a synthesized parent stack.</li><li>Security: tokens in Keychain/Keystore (never JS-persisted), biometric gate on sensitive subtree, full teardown on sign-out, AASA/assetlinks correctness.</li><li>Observability: deep-link resolution success, redirect-replay completion, refresh failure rate, time-to-interactive on linked launch.</li></ul>"
      }
    ]
  },
  {
    "id": "design-6",
    "kind": "design",
    "title": "Caching layer: server vs client state + invalidation",
    "level": "architect",
    "tags": [
      "caching",
      "invalidation",
      "server-state",
      "react-query",
      "versioning"
    ],
    "promptHtml": "<p>Design the <b>caching and cache-invalidation layer</b> for a data-heavy RN app. You've previously shipped <b>version-based cache invalidation</b>; the team wants a principled story for what is cached, where, and how it gets invalidated when the backend data or schema changes underneath a long-lived install.</p><p>Define the boundary between <b>server state and client state</b>, the <b>cache layers</b> (memory / persisted / image), the <b>invalidation strategy</b> (TTL vs event vs version), and how a backend schema or data-shape change forces a safe refresh without corrupting old caches. Explain what happens when the server bumps a data version while a user holds a stale persisted cache.</p>",
    "reveal": [
      {
        "label": "Clarify & requirements",
        "html": "<ul><li><b>Scope:</b> which data is cacheable (reference data, user data, feeds) vs must-be-fresh (balances, prices)? Read-heavy or read/write?</li><li><b>Invalidation triggers:</b> time-based, user action (mutation), server push, or a global data/schema version bump?</li><li><b>Functional:</b> fast reads from cache, background revalidation, optimistic mutations with rollback, cross-screen consistency, persisted cache across launches.</li><li><b>Non-functional:</b> never show data that violates a new schema, bounded storage, deterministic eviction, no stale-after-write within a session.</li><li><b>Constraints:</b> long-lived installs across many app versions, schema migrations, offline reads, partial cache corruption recovery.</li></ul>"
      },
      {
        "label": "Key decisions",
        "html": "<ul><li><b>Server vs client state:</b> server state owned by React Query / TanStack Query (fetch, cache, revalidate, retry); client/UI state (filters, drafts, toggles) in a lightweight store (Zustand/Jotai/context). Don't put server data in Redux as hand-managed state — that's where stale bugs breed.</li><li><b>Cache layers:</b> (1) in-memory query cache for the session, (2) persisted query cache (MMKV/AsyncStorage) for instant cold start, (3) separate image/blob cache. Each layer has its own TTL + eviction.</li><li><b>Invalidation strategy:</b> TTL/<code>staleTime</code> for routine freshness; <b>event-based</b> invalidation on mutations (invalidate affected query keys, optimistic update + rollback); <b>version-based</b> invalidation for global shifts — a server-provided <code>dataVersion</code>/<code>schemaVersion</code> compared on launch; mismatch purges the persisted cache and forces refetch.</li><li><b>Schema/version change handling:</b> tag the persisted cache with a <code>cacheVersion</code> (schema hash + app build). On hydrate, if the stored version &lt; current, drop the persisted cache rather than rehydrating incompatible shapes — fail safe, never deserialize stale shapes into new code.</li><li><b>Key design:</b> structured, hierarchical query keys so targeted invalidation (e.g. one deal) doesn't nuke the whole cache.</li><li><b>The version-bump walkthrough:</b> server returns a new <code>dataVersion</code> in a lightweight meta/etag check → client detects mismatch → marks affected keys stale (or purges persisted cache for breaking schema changes) → revalidates → UI updates without a crash or shape mismatch.</li><li><b>Failure modes:</b> corrupt persisted cache → version/shape guard discards it; partial invalidation → consistent key taxonomy prevents orphans; offline → serve last-known with a staleness marker.</li></ul>"
      },
      {
        "label": "Senior signals",
        "html": "<ul><li>Draws a crisp <b>server-state vs client-state boundary</b> and uses a query library for server state instead of hand-rolling cache in Redux.</li><li>Distinguishes the three invalidation modes — <b>TTL, event/mutation, and version</b> — and knows when each is the right tool.</li><li>Designs <b>cache versioning/tagging</b> so a schema change on a long-lived install fails safe (purge) rather than deserializing stale shapes into new code — directly maps to shipped version-based invalidation.</li><li>Uses <b>hierarchical query keys</b> for surgical invalidation and avoids the 'invalidate everything' sledgehammer.</li><li>Worst-case: corrupt persisted cache, partial invalidation orphans, offline staleness markers, cross-screen consistency after a write.</li><li>Observability: cache hit rate, stale-serve rate, invalidation fan-out, version-mismatch purge frequency, persisted-cache size.</li></ul>"
      }
    ]
  },
  {
    "id": "design-7",
    "kind": "design",
    "title": "Secure auth & token flow with biometrics",
    "level": "architect",
    "tags": [
      "auth",
      "keychain",
      "tokens",
      "biometrics",
      "oauth",
      "security"
    ],
    "promptHtml": "<p>Design the <b>secure authentication and token-management flow</b> for a regulated RN app, modeled on Valt Connect's <b>FaceID/TouchID + Salesforce OAuth</b>. You need secure token storage, silent refresh, biometric gating, and a clean story for theft/jailbreak and token compromise.</p><p>Specify <b>where tokens live</b> (Keychain/Keystore), the <b>refresh flow</b> and how concurrent requests handle a 401, how <b>biometrics gate</b> access, and your <b>revocation/logout</b> teardown. Walk through app resume after 8 hours with an expired access token and a still-valid refresh token, behind Face ID.</p>",
    "reveal": [
      {
        "label": "Clarify & requirements",
        "html": "<ul><li><b>Scope:</b> OAuth/OIDC (Salesforce) — auth-code + PKCE? Access + refresh tokens, token lifetimes, rotation on refresh?</li><li><b>Biometric policy:</b> biometric to unlock the app, to unlock the token, or both? Fallback to passcode? Re-auth interval?</li><li><b>Functional:</b> login, secure persist, silent refresh, biometric gate on resume, 401 handling, multi-request refresh coalescing, logout/revoke.</li><li><b>Non-functional:</b> tokens never in JS-readable/AsyncStorage, survive backgrounding, resist jailbreak/root, no token leakage in logs/crash reports, compliance/audit.</li><li><b>Constraints:</b> Keychain/Keystore semantics, biometric invalidation on enrollment change, refresh-token theft, clock skew, offline-no-refresh.</li></ul>"
      },
      {
        "label": "Key decisions",
        "html": "<ul><li><b>Storage:</b> tokens in <b>iOS Keychain / Android Keystore</b> (expo-secure-store / react-native-keychain), with access control <code>biometryCurrentSet</code> + <code>whenUnlockedThisDeviceOnly</code> so the refresh token is bound to the device and current biometric enrollment — re-enrolling a fingerprint invalidates it. Never in AsyncStorage/MMKV plaintext, never in Redux/JS memory longer than needed.</li><li><b>OAuth flow:</b> auth-code + PKCE (expo-auth-session / AppAuth) — no implicit grant, no client secret in the app. Short-lived access token, longer refresh token with rotation (new refresh on each use; old one invalidated).</li><li><b>Silent refresh + 401 handling:</b> an HTTP interceptor catches 401 → triggers a single refresh; concurrent requests are <b>coalesced</b> behind one in-flight refresh promise (mutex) and replayed after — never N parallel refreshes. If refresh fails (revoked/expired) → force re-login.</li><li><b>Biometric gating:</b> Face ID/Touch ID gates reading the token from the Keychain on cold start and on resume after a configurable timeout; passcode fallback; sensitive subtrees re-prompt. Biometric failure ≠ token wipe.</li><li><b>The 8-hour resume walkthrough:</b> app resumes → biometric prompt unlocks Keychain → access token found expired → silent refresh with the still-valid (rotated) refresh token → new token pair stored back in Keychain → original navigation/request proceeds. User sees one Face ID prompt, no re-login.</li><li><b>Revocation/logout:</b> call the OAuth revoke endpoint, purge Keychain entries, clear in-memory state + query cache + navigation, and invalidate biometric-bound items.</li><li><b>Hardening &amp; failure modes:</b> jailbreak/root detection + degraded mode, no tokens in logs/crash reports, refresh-token-reuse detection (rotation breach → revoke session), clock-skew tolerance, offline resume → allow read of cached data but block privileged calls until refresh.</li></ul>"
      },
      {
        "label": "Senior signals",
        "html": "<ul><li>Puts tokens in <b>Keychain/Keystore with biometric-bound access control</b> and can articulate the flags (<code>biometryCurrentSet</code>, <code>thisDeviceOnly</code>) — not just 'use secure storage'.</li><li>Insists on <b>PKCE, no client secret, refresh-token rotation</b>, and knows reuse-detection as a theft signal.</li><li>Solves the <b>concurrent-401 refresh stampede</b> with a single coalesced refresh + request replay — a real production bug.</li><li>Separates <b>biometric-unlock from token validity</b>: a failed biometric doesn't destroy tokens; an expired access token doesn't force re-login if refresh is valid.</li><li>Threat-models <b>jailbreak/root, log/crash leakage, enrollment-change invalidation, clock skew, offline</b>, and has a full logout/revoke teardown.</li><li>Observability: refresh success rate, biometric prompt/fallback rates, 401 stampede counts, revocation events, suspected-reuse alerts — without logging token material.</li></ul>"
      }
    ]
  },
  {
    "id": "design-8",
    "kind": "design",
    "title": "60fps infinite list / feed",
    "level": "senior",
    "tags": [
      "performance",
      "flashlist",
      "60fps",
      "virtualization",
      "re-renders"
    ],
    "promptHtml": "<p>Design a <b>60fps infinite-scrolling feed</b> with mixed-height cells, images, and interactive elements that must stay smooth on a low-end Android device while continuously fetching pages. Users report jank, blank cells on fast scroll, and dropped frames.</p><p>Specify the <b>list technology &amp; virtualization</b>, <b>cell render budget</b> (memoization, image strategy), <b>pagination &amp; prefetch</b>, and how you keep work off the JS thread. Diagnose what causes blank cells and frame drops and how your design prevents them — including on the worst phone.</p>",
    "reveal": [
      {
        "label": "Clarify & requirements",
        "html": "<ul><li><b>Scope:</b> uniform or variable cell heights? Media-heavy (images/video) or mostly text? Interactive cells (inline actions, video autoplay)?</li><li><b>Scale:</b> page size, total items, how fast users flick, target devices (low-end Android RAM/CPU)?</li><li><b>Functional:</b> infinite scroll + pagination, pull-to-refresh, smooth images, maintain scroll position on refresh/insert, tap targets.</li><li><b>Non-functional:</b> sustained 60fps (120 on ProMotion), no blank cells on fling, low memory, fast TTI, New Architecture (Fabric/Hermes).</li><li><b>Constraints:</b> JS thread is single-threaded, bridge/serialization cost, image decode cost, GC pauses on low-end Android.</li></ul>"
      },
      {
        "label": "Key decisions",
        "html": "<ul><li><b>List tech:</b> <b>FlashList</b> (or FlatList tuned) over ScrollView — real cell recycling so memory is bounded. Provide stable <code>keyExtractor</code>, accurate <code>estimatedItemSize</code>/<code>getItemType</code> so recycling reuses the right cell type for mixed layouts.</li><li><b>Cell render budget:</b> memoize rows (<code>React.memo</code> + stable props), hoist callbacks (<code>useCallback</code>), avoid inline objects/arrays/styles in render, keep cells shallow. Defer non-critical work (expensive formatting) and avoid heavy synchronous work in render.</li><li><b>Images:</b> expo-image / FastImage with disk+memory cache, correctly sized thumbnails from the backend (don't decode full-res), placeholder/blurhash, and downscale before decode to cut GC/jank on low-end Android.</li><li><b>Off-JS-thread work:</b> animations/gestures on the UI thread via Reanimated + Gesture Handler (worklets), not JS-driven; Hermes for faster startup + lower memory; avoid bridge chatter on scroll. Keep scroll handlers cheap.</li><li><b>Pagination &amp; prefetch:</b> cursor-based <code>onEndReached</code> with a threshold so the next page arrives before the user hits the bottom; dedup by stable id; append without re-rendering the whole list; preserve scroll position on prepend (maintainVisibleContentPosition).</li><li><b>Blank-cell cause &amp; fix:</b> blanks come from the renderer outrunning cell mount during fast fling — mitigate with recycling, lighter cells, correct size estimates, image placeholders, and draw-distance tuning so off-screen cells are prepared ahead.</li><li><b>Failure modes:</b> low-end GC pauses → smaller payloads + recycled views; variable heights mis-estimated → jumpy scroll, fixed via getItemType + better estimates; page fetch stall → skeleton rows, never block scroll.</li></ul>"
      },
      {
        "label": "Senior signals",
        "html": "<ul><li>Reaches for <b>recycling (FlashList) with getItemType</b> for mixed heights and explains why ScrollView/over-rendered FlatList janks.</li><li>Knows <b>blank cells = renderer outrunning mount on fling</b> and fixes it with recycling + lighter cells + size estimates + placeholders, not magic props.</li><li>Moves <b>gesture/animation work to the UI thread</b> (Reanimated worklets) and keeps the JS thread free during scroll; cites Hermes/Fabric.</li><li>Treats <b>images as the main jank source</b>: right-sized thumbnails, decode downscaling, caching — especially on low-end Android GC.</li><li>Preserves <b>scroll position on prepend/refresh</b> and prefetches the next page before the bottom.</li><li>Measures: FPS/frame drops via the profiler + Perfetto/Systrace, JS thread utilization, dropped-frame counts, TTI, memory — verifies on the worst phone, not a flagship.</li></ul>"
      }
    ]
  }
];
