// Leetcode-style DSA "coding sessions" — one canonical problem per interview
// pattern, solved in TypeScript. Plain study content (no execution); flows into
// /practice and /today via ALL_PROMPTS. The pattern name leads each title so
// the deck reads as a set of sessions.
import type { Prompt } from "./prompts";

export const DSA_PROMPTS: Prompt[] = [
  {
    id: "dsa-1",
    kind: "coding",
    title: "Two Pointers · Pair sum in a sorted array",
    level: "junior",
    tags: ["two-pointers", "arrays"],
    promptHtml: `<p>Given an array <code>a</code> sorted in ascending order and a <code>target</code>, return the
      <b>1-based</b> indices of the two numbers that add up to <code>target</code> (exactly one solution exists).
      Use O(1) extra space.</p>
      <p><b>Example:</b> <code>a = [2, 7, 11, 15], target = 9 → [1, 2]</code>.</p>`,
    reveal: [
      {
        label: "Approach",
        html: `<ol>
          <li><b>Recognize the pattern:</b> the array is already sorted — that's the signal to reach for two
            pointers instead of a hash map.</li>
          <li>Place one pointer at each end. The sum moves predictably as either pointer moves.</li>
          <li>Sum too low → the only way to grow it is moving the left pointer right; too high → move the right
            pointer left.</li>
          <li>Each step discards an element that can't be part of any answer — O(n) time, O(1) space, no hash map.</li>
        </ol>
        <p><b>Red flag:</b> reaching for a hash map here — that's O(n) extra space when the sorted input already
          buys you O(1) space via two pointers.</p>`,
      },
      {
        label: "Solution",
        html: `<div class="code">function twoSum(a: number[], target: number): number[] {
  let lo = 0, hi = a.length - 1;
  while (lo &lt; hi) {
    const sum = a[lo] + a[hi];
    if (sum === target) return [lo + 1, hi + 1];
    if (sum &lt; target) lo++; else hi--;
  }
  return [];
}</div>
        <p>O(n) time, O(1) space. <b>The sorted order is what makes the two-pointer move provably safe — that's
          the tell for reaching for this pattern.</b></p>`,
      },
    ],
  },
  {
    id: "dsa-2",
    kind: "coding",
    title: "Sliding Window · Longest substring without repeats",
    level: "mid",
    tags: ["sliding-window", "strings", "hashing"],
    promptHtml: `<p>Given a string, return the length of the longest substring with no repeating characters.</p>
      <p><b>Example:</b> <code>"abcabcbb" → 3</code> ("abc").</p>`,
    reveal: [
      {
        label: "Approach",
        html: `<ol>
          <li><b>Recognize the pattern:</b> "longest substring/subarray under a constraint" is the sliding-window
            signal — not a nested-loop brute force.</li>
          <li>Expand the window one character at a time, keeping each character's most recent index in a map.</li>
          <li>On a repeat that sits inside the current window, jump the window's start to just past that repeat's
            last position — never shrink one character at a time.</li>
          <li>Track the best width as you go — O(n) time, O(min(n, alphabet)) space.</li>
        </ol>
        <p><b>Red flag:</b> forgetting to check that the last-seen index is still inside the window
          (<code>j &gt;= start</code>) — without that bound, <code>start</code> can jump backwards and overcount
          the window.</p>`,
      },
      {
        label: "Solution",
        html: `<div class="code">function lengthOfLongestSubstring(s: string): number {
  const seen = new Map&lt;string, number&gt;();
  let start = 0, best = 0;
  for (let i = 0; i &lt; s.length; i++) {
    const j = seen.get(s[i]);
    if (j !== undefined &amp;&amp; j &gt;= start) start = j + 1;
    seen.set(s[i], i);
    best = Math.max(best, i - start + 1);
  }
  return best;
}</div>
        <p><b>The window never shrinks blindly — <code>start</code> only jumps forward, so it stays O(n).</b></p>`,
      },
    ],
  },
  {
    id: "dsa-3",
    kind: "coding",
    title: "Hashing · Two Sum (unsorted)",
    level: "junior",
    tags: ["hashing", "arrays"],
    promptHtml: `<p>Given an <i>unsorted</i> array <code>nums</code> and a <code>target</code>, return the indices of
      the two numbers that add up to <code>target</code>.</p>
      <p><b>Example:</b> <code>nums = [3, 2, 4], target = 6 → [1, 2]</code>.</p>`,
    reveal: [
      {
        label: "Approach",
        html: `<ol>
          <li><b>Recognize the pattern:</b> the array isn't sorted, so the O(1)-space two-pointer trick doesn't
            apply — trade space for time with a hash map instead.</li>
          <li>Walk once; for each number ask the map whether its complement <code>target − n</code> was already seen.</li>
          <li>If yes you're done; otherwise record <code>n → index</code> and continue — O(n) time, O(n) space.</li>
        </ol>
        <p><b>Red flag:</b> sorting the array first to reuse the two-pointer trick — sorting destroys the original
          indices the problem asks for, and costs O(n log n) instead of O(n).</p>`,
      },
      {
        label: "Solution",
        html: `<div class="code">function twoSum(nums: number[], target: number): number[] {
  const seen = new Map&lt;number, number&gt;();
  for (let i = 0; i &lt; nums.length; i++) {
    const j = seen.get(target - nums[i]);
    if (j !== undefined) return [j, i];
    seen.set(nums[i], i);
  }
  return [];
}</div>
        <p><b>Trading O(n) memory for time is the canonical move when the input isn't sorted.</b></p>`,
      },
    ],
  },
  {
    id: "dsa-4",
    kind: "coding",
    title: "Binary Search · Search insert position",
    level: "junior",
    tags: ["binary-search", "arrays"],
    promptHtml: `<p>Given a <b>sorted</b> array and a <code>target</code>, return the index where <code>target</code>
      is, or where it would be inserted to keep the array sorted.</p>
      <p><b>Example:</b> <code>[1, 3, 5, 6], target = 4 → 2</code>.</p>`,
    reveal: [
      {
        label: "Approach",
        html: `<ol>
          <li><b>Recognize the pattern:</b> a sorted array plus "find the position" is a boundary binary search,
            not a linear scan.</li>
          <li>Search the half-open range <code>[lo, hi)</code>. Invariant: the answer always lies in
            <code>[lo, hi]</code>.</li>
          <li>Shrink toward the first index whose value is ≥ target.</li>
          <li>When <code>lo == hi</code> the window is empty and <code>lo</code> is the insert point — O(log n).</li>
        </ol>
        <p><b>Red flag:</b> reaching for a closed interval (<code>hi = length - 1</code>) out of habit — it's what
          causes the classic off-by-one/infinite-loop bugs in binary search; the half-open form sidesteps them.</p>`,
      },
      {
        label: "Solution",
        html: `<div class="code">function searchInsert(a: number[], target: number): number {
  let lo = 0, hi = a.length;
  while (lo &lt; hi) {
    const mid = (lo + hi) &gt;&gt; 1;
    if (a[mid] &lt; target) lo = mid + 1; else hi = mid;
  }
  return lo;
}</div>
        <p><b>Half-open <code>[lo, hi)</code> avoids the off-by-one bugs that plague <code>hi = length - 1</code>
          variants.</b></p>`,
      },
    ],
  },
  {
    id: "dsa-5",
    kind: "coding",
    title: "BFS · Binary tree level-order traversal",
    level: "mid",
    tags: ["bfs", "trees", "queue"],
    promptHtml: `<p>Return the values of a binary tree grouped by depth, top to bottom, left to right.</p>
      <p><b>Example:</b> root 3, children 9 and 20, and 20's children 15 and 7 → <code>[[3], [9, 20], [15, 7]]</code>.</p>`,
    reveal: [
      {
        label: "Approach",
        html: `<ol>
          <li><b>Recognize the pattern:</b> "group by depth" is breadth-first search processed one level at a
            time, not a single flat queue with per-node depth tracking.</li>
          <li>Hold the current level in a list; build the next level from every node's children before going deeper.</li>
          <li>Swap the whole queue for the next level's nodes once the current level is fully drained.</li>
          <li>Each full sweep of the queue is exactly one tree level — O(n) time and space.</li>
        </ol>
        <p><b>Red flag:</b> using one shared queue without snapshotting its length up front — pushing children into
          the same array you're iterating merges levels together instead of keeping them separate.</p>`,
      },
      {
        label: "Solution",
        html: `<div class="code">type TreeNode = { val: number; left: TreeNode | null; right: TreeNode | null };

function levelOrder(root: TreeNode | null): number[][] {
  if (!root) return [];
  const result: number[][] = [];
  let queue = [root];
  while (queue.length &gt; 0) {
    const level: number[] = [];
    const next: TreeNode[] = [];
    for (const node of queue) {
      level.push(node.val);
      if (node.left) next.push(node.left);
      if (node.right) next.push(node.right);
    }
    result.push(level);
    queue = next;
  }
  return result;
}</div>
        <p><b>Swapping <code>queue = next</code> wholesale keeps each level cleanly separated — no per-node depth
          tracking.</b></p>`,
      },
    ],
  },
  {
    id: "dsa-6",
    kind: "coding",
    title: "DFS · Number of islands",
    level: "mid",
    tags: ["dfs", "grid", "flood-fill"],
    promptHtml: `<p>A grid of <code>"1"</code> (land) and <code>"0"</code> (water). Count the islands — groups of land
      connected horizontally or vertically.</p>
      <p><b>Example:</b> a grid with two separate land blobs → <code>2</code>.</p>`,
    reveal: [
      {
        label: "Approach",
        html: `<ol>
          <li><b>Recognize the pattern:</b> "count connected groups in a grid" is flood-fill DFS — scan the grid,
            and each unvisited land cell starts a new island.</li>
          <li>From it, recursively sink every connected land cell (set it to water) so you never recount an island.</li>
          <li>The grid itself records progress — no separate visited set — O(rows × cols).</li>
        </ol>
        <p><b>Red flag:</b> assuming recursion depth is free — a large enough grid can blow the call stack. Worth
          naming an iterative DFS/BFS with an explicit stack as the production-safe follow-up.</p>`,
      },
      {
        label: "Solution",
        html: `<div class="code">function numIslands(grid: string[][]): number {
  const rows = grid.length, cols = grid[0].length;
  const sink = (r: number, c: number): void =&gt; {
    if (r &lt; 0 || c &lt; 0 || r &gt;= rows || c &gt;= cols || grid[r][c] !== "1") return;
    grid[r][c] = "0";
    sink(r + 1, c); sink(r - 1, c); sink(r, c + 1); sink(r, c - 1);
  };
  let count = 0;
  for (let r = 0; r &lt; rows; r++)
    for (let c = 0; c &lt; cols; c++)
      if (grid[r][c] === "1") { count++; sink(r, c); }
  return count;
}</div>
        <p><b>Mutating the grid in place is the trick that makes "visited" free.</b></p>`,
      },
    ],
  },
  {
    id: "dsa-7",
    kind: "coding",
    title: "Dynamic Programming · Climbing stairs",
    level: "junior",
    tags: ["dynamic-programming", "fibonacci"],
    promptHtml: `<p>You climb a staircase of <code>n</code> steps, taking 1 or 2 steps at a time. How many distinct
      ways to reach the top?</p>
      <p><b>Example:</b> <code>n = 4 → 5</code>.</p>`,
    reveal: [
      {
        label: "Approach",
        html: `<ol>
          <li><b>Recognize the pattern:</b> "how many distinct ways" with a step choice of 1 or 2 is 1-D dynamic
            programming — it's Fibonacci in disguise: ways(i) = ways(i−1) + ways(i−2).</li>
          <li>You only ever need the last two values, so keep two rolling variables instead of a full array.</li>
          <li>O(n) time, O(1) space.</li>
        </ol>
        <p><b>Red flag:</b> writing the naive recursive recurrence without memoization — it recomputes the same
          subproblems and blows up to exponential time.</p>`,
      },
      {
        label: "Solution",
        html: `<div class="code">function climbStairs(n: number): number {
  if (n &lt;= 2) return n;
  let a = 1, b = 2;
  for (let i = 3; i &lt;= n; i++) [a, b] = [b, a + b];
  return b;
}</div>
        <p><b>Recognising the recurrence <i>is</i> the interview — the rolling-variable rewrite is just the O(1)
          polish.</b></p>`,
      },
    ],
  },
  {
    id: "dsa-8",
    kind: "coding",
    title: "Stack · Valid parentheses",
    level: "junior",
    tags: ["stack", "strings"],
    promptHtml: `<p>Given a string of <code>()[]{}</code>, decide whether every bracket is closed by the correct type
      in the right order.</p>
      <p><b>Example:</b> <code>"([]{})" → true</code>, <code>"(]" → false</code>.</p>`,
    reveal: [
      {
        label: "Approach",
        html: `<ol>
          <li><b>Recognize the pattern:</b> "matching nested pairs" is a stack problem — push every opening
            bracket as you go.</li>
          <li>On a closing bracket, the top of the stack must be its matching opener — otherwise it's invalid.</li>
          <li>Valid iff the stack is empty at the end — a non-empty stack means unclosed openers — O(n).</li>
        </ol>
        <p><b>Red flag:</b> checking only that brackets pair up without also checking the stack is empty at the
          end — a string like <code>"(("</code> has every pair matching but an unclosed opener.</p>`,
      },
      {
        label: "Solution",
        html: `<div class="code">function isValid(s: string): boolean {
  const pairs: Record&lt;string, string&gt; = { ")": "(", "]": "[", "}": "{" };
  const stack: string[] = [];
  for (const c of s) {
    if (c in pairs) {
      if (stack.pop() !== pairs[c]) return false;
    } else {
      stack.push(c);
    }
  }
  return stack.length === 0;
}</div>
        <p><b>Mapping each closer to its opener turns the match into a single record lookup.</b></p>`,
      },
    ],
  },
  {
    id: "dsa-9",
    kind: "coding",
    title: "Heap / Top-K · Top K frequent elements",
    level: "senior",
    tags: ["heap", "bucket-sort", "hashing"],
    promptHtml: `<p>Given <code>nums</code> and <code>k</code>, return the <code>k</code> most frequent values.</p>
      <p><b>Example:</b> <code>nums = [1, 1, 1, 2, 2, 3], k = 2 → [1, 2]</code>.</p>`,
    reveal: [
      {
        label: "Approach",
        html: `<ol>
          <li><b>Recognize the pattern:</b> "top K by frequency" is count-then-select — first tally frequencies
            in a hash map.</li>
          <li><b>Two tools, different roles:</b> a size-K min-heap is the general-purpose selector — O(n log k),
            correct for any comparator and for streaming input. Bucket sort by frequency is the specialized tool
            for this problem — frequency is bounded by <code>nums.length</code>, so you can index buckets by count
            directly for O(n).</li>
          <li>Walk buckets from the highest count down, collecting values until you have K.</li>
        </ol>
        <p><b>Red flag:</b> jumping straight to bucket sort without first naming the heap approach — the heap is
          the general-purpose answer interviewers expect; bucket sort is the follow-up optimization once bounded
          frequency is established.</p>`,
      },
      {
        label: "Solution",
        html: `<div class="code">function topKFrequent(nums: number[], k: number): number[] {
  const freq = new Map&lt;number, number&gt;();
  for (const n of nums) freq.set(n, (freq.get(n) ?? 0) + 1);
  const buckets: number[][] = Array.from({ length: nums.length + 1 }, () =&gt; []);
  for (const [n, f] of freq) buckets[f].push(n);
  const result: number[] = [];
  for (let f = buckets.length - 1; f &gt;= 0 &amp;&amp; result.length &lt; k; f--)
    for (const n of buckets[f]) {
      result.push(n);
      if (result.length === k) break;
    }
  return result;
}</div>
        <p>Frequencies are bounded by <code>nums.length</code>, so indexing buckets by count beats sorting. The
          heap costs an extra log k factor but stays correct if counts were ever unbounded — <b>bucket sort is the
          optimization worth naming once bounded frequency is confirmed, not the default to reach for blind.</b></p>`,
      },
    ],
  },
  {
    id: "dsa-10",
    kind: "coding",
    title: "Backtracking · Subsets (power set)",
    level: "mid",
    tags: ["backtracking", "recursion"],
    promptHtml: `<p>Return every subset (the power set) of a set of distinct integers.</p>
      <p><b>Example:</b> <code>[1, 2] → [[], [1], [1, 2], [2]]</code>.</p>`,
    reveal: [
      {
        label: "Approach",
        html: `<ol>
          <li><b>Recognize the pattern:</b> "return every subset" is backtracking over a decision tree — at each
            index, decide to include it or not.</li>
          <li>Record the current partial subset at every node (not just at leaves), recurse on the remaining
            suffix, then undo (pop) — the classic choose / explore / un-choose loop.</li>
          <li>O(n · 2ⁿ): there are 2ⁿ subsets, each costing O(n) to copy.</li>
        </ol>
        <p><b>Red flag:</b> pushing a reference to <code>current</code> instead of a copy — since it keeps
          mutating after being pushed, every stored subset silently ends up empty by the time backtracking
          finishes.</p>`,
      },
      {
        label: "Solution",
        html: `<div class="code">function subsets(nums: number[]): number[][] {
  const result: number[][] = [];
  const current: number[] = [];
  const backtrack = (start: number): void =&gt; {
    result.push([...current]);
    for (let i = start; i &lt; nums.length; i++) {
      current.push(nums[i]);
      backtrack(i + 1);
      current.pop();
    }
  };
  backtrack(0);
  return result;
}</div>
        <p><b>Pushing a <i>copy</i> of <code>current</code> at every call (not just leaves) is what collects all
          2ⁿ subsets.</b></p>`,
      },
    ],
  },
];
