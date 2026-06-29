// Backend-relevant DSA prompts — the algorithm patterns that actually show up
// in Node/NestJS backend interviews, each tied to a real backend use case.
import type { Prompt } from "./prompts";

export const DSA_PROMPTS: Prompt[] = [
  {
    id: "dsa-sliding-window",
    kind: "coding",
    title: "Sliding window: longest substring without repeats",
    level: "mid",
    tags: ["DSA", "sliding window"],
    promptHtml:
      "<p>Return the length of the longest substring without repeating characters. <i>Backend tie-in:</i> the sliding-window pattern underlies rate limiting and log-window analytics.</p>",
    reveal: [
      { label: "Approach", html: "<p>Expand a window with a right pointer; keep a map of last-seen index. On a repeat, jump the left pointer past the previous occurrence. Track the max length. O(n).</p>" },
      { label: "Solution", html: "<div class=\"code\">function lengthOfLongest(s: string): number {\n  const seen = new Map&lt;string, number&gt;();\n  let left = 0, best = 0;\n  for (let r = 0; r &lt; s.length; r++) {\n    const c = s[r];\n    if (seen.has(c) &amp;&amp; seen.get(c)! &gt;= left) left = seen.get(c)! + 1;\n    seen.set(c, r);\n    best = Math.max(best, r - left + 1);\n  }\n  return best;\n}</div>" },
    ],
  },
  {
    id: "dsa-topk",
    kind: "coding",
    title: "Top-K frequent elements",
    level: "mid",
    tags: ["DSA", "heap"],
    promptHtml:
      "<p>Given an array, return the K most frequent elements. <i>Backend tie-in:</i> leaderboards, top-N metrics, merging counts from shards.</p>",
    reveal: [
      { label: "Approach", html: "<p>Count with a Map, then either a <b>min-heap of size K</b> (O(n log k)) or <b>bucket sort</b> by frequency (O(n)). The heap approach generalizes to streaming/merge.</p>" },
      { label: "Solution", html: "<div class=\"code\">function topK(nums: number[], k: number): number[] {\n  const count = new Map&lt;number, number&gt;();\n  for (const n of nums) count.set(n, (count.get(n) ?? 0) + 1);\n  // bucket sort by frequency\n  const buckets: number[][] = Array.from({ length: nums.length + 1 }, () =&gt; []);\n  for (const [n, c] of count) buckets[c].push(n);\n  const out: number[] = [];\n  for (let f = buckets.length - 1; f &gt;= 0 &amp;&amp; out.length &lt; k; f--)\n    for (const n of buckets[f]) { out.push(n); if (out.length === k) break; }\n  return out;\n}</div>" },
    ],
  },
  {
    id: "dsa-merge-intervals",
    kind: "coding",
    title: "Merge overlapping intervals",
    level: "mid",
    tags: ["DSA", "intervals"],
    promptHtml:
      "<p>Merge all overlapping intervals. <i>Backend tie-in:</i> scheduling, calendar/booking conflicts, compacting time ranges.</p>",
    reveal: [
      { label: "Approach", html: "<p>Sort by start; sweep, merging the current interval into the last result when they overlap (<code>start ≤ lastEnd</code>), else push a new one. O(n log n).</p>" },
      { label: "Solution", html: "<div class=\"code\">function merge(intervals: number[][]): number[][] {\n  intervals.sort((a, b) =&gt; a[0] - b[0]);\n  const out: number[][] = [];\n  for (const [s, e] of intervals) {\n    const last = out[out.length - 1];\n    if (last &amp;&amp; s &lt;= last[1]) last[1] = Math.max(last[1], e);\n    else out.push([s, e]);\n  }\n  return out;\n}</div>" },
    ],
  },
  {
    id: "dsa-toposort",
    kind: "coding",
    title: "Topological sort (Kahn's algorithm)",
    level: "senior",
    tags: ["DSA", "graph"],
    promptHtml:
      "<p>Order tasks so every dependency comes first; detect cycles. <i>Backend tie-in:</i> build/job DAGs, module init order, dependency resolution, deadlock detection.</p>",
    reveal: [
      { label: "Approach", html: "<p>Compute in-degrees, start a queue with zero in-degree nodes, repeatedly pop and decrement neighbors. If you process fewer than N nodes, there's a <b>cycle</b>. O(V+E).</p>" },
      { label: "Solution", html: "<div class=\"code\">function topoSort(n: number, edges: [number, number][]): number[] | null {\n  const adj: number[][] = Array.from({ length: n }, () =&gt; []);\n  const indeg = new Array(n).fill(0);\n  for (const [u, v] of edges) { adj[u].push(v); indeg[v]++; }\n  const q = indeg.flatMap((d, i) =&gt; (d === 0 ? [i] : []));\n  const order: number[] = [];\n  while (q.length) {\n    const u = q.shift()!; order.push(u);\n    for (const v of adj[u]) if (--indeg[v] === 0) q.push(v);\n  }\n  return order.length === n ? order : null; // null = cycle\n}</div>" },
    ],
  },
  {
    id: "dsa-two-sum",
    kind: "coding",
    title: "Two Sum (hashmap)",
    level: "junior",
    tags: ["DSA", "hashmap"],
    promptHtml:
      "<p>Return indices of two numbers that add to a target. <i>Backend tie-in:</i> the hashmap-for-O(1)-lookup instinct behind dedup, joins, and caching.</p>",
    reveal: [
      { label: "Approach", html: "<p>One pass: for each number, check if <code>target - n</code> is already in the map; else store it. O(n) time, O(n) space.</p>" },
      { label: "Solution", html: "<div class=\"code\">function twoSum(nums: number[], target: number): [number, number] | null {\n  const seen = new Map&lt;number, number&gt;();\n  for (let i = 0; i &lt; nums.length; i++) {\n    const need = target - nums[i];\n    if (seen.has(need)) return [seen.get(need)!, i];\n    seen.set(nums[i], i);\n  }\n  return null;\n}</div>" },
    ],
  },
  {
    id: "dsa-bfs",
    kind: "coding",
    title: "BFS shortest path on a grid",
    level: "mid",
    tags: ["DSA", "graph", "BFS"],
    promptHtml:
      "<p>Find the shortest path length from top-left to bottom-right in a 0/1 grid (0 = open). <i>Backend tie-in:</i> graph traversal for recommendations, routing, and reachability.</p>",
    reveal: [
      { label: "Approach", html: "<p>BFS from the start; the first time you reach the target is the shortest path (unweighted). Track visited; expand 4-directional neighbors. O(rows×cols).</p>" },
      { label: "Solution", html: "<div class=\"code\">function shortestPath(grid: number[][]): number {\n  const R = grid.length, C = grid[0].length;\n  if (grid[0][0] || grid[R-1][C-1]) return -1;\n  const q: [number, number, number][] = [[0, 0, 1]];\n  const seen = new Set([`0,0`]);\n  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];\n  while (q.length) {\n    const [r, c, d] = q.shift()!;\n    if (r === R-1 &amp;&amp; c === C-1) return d;\n    for (const [dr, dc] of dirs) {\n      const nr = r+dr, nc = c+dc, key = `${nr},${nc}`;\n      if (nr&gt;=0 &amp;&amp; nr&lt;R &amp;&amp; nc&gt;=0 &amp;&amp; nc&lt;C &amp;&amp; !grid[nr][nc] &amp;&amp; !seen.has(key)) {\n        seen.add(key); q.push([nr, nc, d+1]);\n      }\n    }\n  }\n  return -1;\n}</div>" },
    ],
  },
  {
    id: "dsa-debounce-throttle",
    kind: "coding",
    title: "Implement debounce and throttle",
    level: "mid",
    tags: ["DSA", "JS", "utility"],
    promptHtml:
      "<p>Implement <code>debounce(fn, ms)</code> (fire after quiet period) and <code>throttle(fn, ms)</code> (at most once per interval). <i>Backend tie-in:</i> rate-limiting calls, coalescing bursts, batching writes.</p>",
    reveal: [
      { label: "Approach", html: "<p><b>Debounce:</b> reset a timer on every call; fire only when calls stop for <code>ms</code>. <b>Throttle:</b> track the last run time; ignore calls within the window.</p>" },
      { label: "Solution", html: "<div class=\"code\">function debounce&lt;A extends any[]&gt;(fn: (...a: A) =&gt; void, ms: number) {\n  let t: NodeJS.Timeout;\n  return (...args: A) =&gt; { clearTimeout(t); t = setTimeout(() =&gt; fn(...args), ms); };\n}\n\nfunction throttle&lt;A extends any[]&gt;(fn: (...a: A) =&gt; void, ms: number) {\n  let last = 0;\n  return (...args: A) =&gt; {\n    const now = Date.now();\n    if (now - last &gt;= ms) { last = now; fn(...args); }\n  };\n}</div>" },
    ],
  },
  {
    id: "dsa-parens",
    kind: "coding",
    title: "Valid parentheses (stack)",
    level: "junior",
    tags: ["DSA", "stack"],
    promptHtml:
      "<p>Validate that brackets <code>()[]{}</code> are balanced and correctly nested. <i>Backend tie-in:</i> parsing, tokenizing, expression evaluation.</p>",
    reveal: [
      { label: "Approach", html: "<p>Push opening brackets; on a closing bracket, the top of the stack must be its match. Valid iff the stack is empty at the end. O(n).</p>" },
      { label: "Solution", html: "<div class=\"code\">function isValid(s: string): boolean {\n  const pairs: Record&lt;string, string&gt; = { ')': '(', ']': '[', '}': '{' };\n  const stack: string[] = [];\n  for (const ch of s) {\n    if (ch in pairs) { if (stack.pop() !== pairs[ch]) return false; }\n    else stack.push(ch);\n  }\n  return stack.length === 0;\n}</div>" },
    ],
  },
  {
    id: "dsa-merge-k",
    kind: "coding",
    title: "Merge K sorted lists/streams",
    level: "senior",
    tags: ["DSA", "heap"],
    promptHtml:
      "<p>Merge K sorted sequences into one sorted output. <i>Backend tie-in:</i> merging sorted results from K database shards or K ordered partitions.</p>",
    reveal: [
      { label: "Approach", html: "<p>Use a <b>min-heap</b> of the current head of each list (size K). Pop the smallest, push the next from that list. O(N log K) — far better than concatenating + sorting (O(N log N)) and works for streaming.</p>" },
      { label: "Solution", html: "<div class=\"code\">// Conceptual with a MinHeap keyed by value:\nfunction mergeK(lists: number[][]): number[] {\n  const heap = new MinHeap&lt;{ val: number; li: number; i: number }&gt;((a, b) =&gt; a.val - b.val);\n  lists.forEach((l, li) =&gt; { if (l.length) heap.push({ val: l[0], li, i: 0 }); });\n  const out: number[] = [];\n  while (heap.size) {\n    const { val, li, i } = heap.pop();\n    out.push(val);\n    if (i + 1 &lt; lists[li].length)\n      heap.push({ val: lists[li][i + 1], li, i: i + 1 });\n  }\n  return out;\n}</div><p>The same min-heap pattern powers k-way merge in external sorting and log aggregation.</p>" },
    ],
  },
  {
    id: "dsa-rate-counter",
    kind: "coding",
    title: "Sliding-window request counter",
    level: "senior",
    tags: ["DSA", "queue", "rate limiting"],
    promptHtml:
      "<p>Implement a counter that reports how many requests happened in the last <code>W</code> ms. <i>Backend tie-in:</i> the data structure inside a sliding-window rate limiter.</p>",
    reveal: [
      { label: "Approach", html: "<p>Keep a queue of timestamps. On each <code>hit(now)</code>, push <code>now</code> and evict timestamps older than <code>now - W</code> from the front; the queue length is the count. Amortized O(1).</p>" },
      { label: "Solution", html: "<div class=\"code\">class SlidingWindowCounter {\n  private q: number[] = [];\n  constructor(private windowMs: number) {}\n  hit(now = Date.now()): number {\n    this.q.push(now);\n    const cutoff = now - this.windowMs;\n    while (this.q.length &amp;&amp; this.q[0] &lt;= cutoff) this.q.shift();\n    return this.q.length;\n  }\n}</div><p>For high throughput, replace the array with a ring buffer or bucketed counters to avoid <code>shift()</code> cost; distributed version uses a Redis sorted set (<code>ZADD</code>/<code>ZREMRANGEBYSCORE</code>).</p>" },
    ],
  },
];
