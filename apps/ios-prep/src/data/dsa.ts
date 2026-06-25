// Leetcode-style DSA "coding sessions" — one canonical problem per interview
// pattern, solved in Swift. Plain study content (no execution); flows into
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
        html: `<ul>
          <li><b>Pattern: two pointers.</b> Because the array is sorted, put one pointer at each end.</li>
          <li>If the pair sums too low, the only way to grow it is to move the left pointer right; too high, move
            the right pointer left.</li>
          <li>Each step discards an element that can't be part of any answer — O(n) time, O(1) space, no hash map.</li>
        </ul>`,
      },
      {
        label: "Solution",
        html: `<div class="code">func twoSum(_ a: [Int], _ target: Int) -&gt; [Int] {
  var lo = 0, hi = a.count - 1
  while lo &lt; hi {
    let sum = a[lo] + a[hi]
    if sum == target { return [lo + 1, hi + 1] }
    if sum &lt; target { lo += 1 } else { hi -= 1 }
  }
  return []
}</div>
        <p>O(n) time, O(1) space. The sorted order is what makes the two-pointer move provably safe.</p>`,
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
        html: `<ul>
          <li><b>Pattern: sliding window with a last-seen map.</b> Expand the window one character at a time.</li>
          <li>Keep each character's most recent index. When you hit a repeat that sits inside the window, jump the
            window's start to just past it.</li>
          <li>Track the best width as you go — O(n) time, O(min(n, alphabet)) space.</li>
        </ul>`,
      },
      {
        label: "Solution",
        html: `<div class="code">func lengthOfLongestSubstring(_ s: [Character]) -&gt; Int {
  var seen: [Character: Int] = [:]
  var start = 0, best = 0
  for (i, c) in s.enumerated() {
    if let j = seen[c], j &gt;= start { start = j + 1 }
    seen[c] = i
    best = max(best, i - start + 1)
  }
  return best
}</div>
        <p>The window never shrinks blindly — <code>start</code> only jumps forward, so it stays O(n).</p>`,
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
        html: `<ul>
          <li><b>Pattern: hash map for O(1) complement lookup.</b> The sorted-array two-pointer trick can't apply.</li>
          <li>Walk once; for each number ask the map whether its complement <code>target − n</code> was already seen.</li>
          <li>If yes you're done; otherwise record <code>n → index</code> and continue — O(n) time, O(n) space.</li>
        </ul>`,
      },
      {
        label: "Solution",
        html: `<div class="code">func twoSum(_ nums: [Int], _ target: Int) -&gt; [Int] {
  var seen: [Int: Int] = [:]
  for (i, n) in nums.enumerated() {
    if let j = seen[target - n] { return [j, i] }
    seen[n] = i
  }
  return []
}</div>
        <p>Trading O(n) memory for time is the canonical move when the input isn't sorted.</p>`,
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
        html: `<ul>
          <li><b>Pattern: binary search on a boundary.</b> Search the half-open range <code>[lo, hi)</code>.</li>
          <li>Invariant: the answer always lies in <code>[lo, hi]</code>. Shrink toward the first index whose
            value is ≥ target.</li>
          <li>When <code>lo == hi</code> the window is empty and <code>lo</code> is the insert point — O(log n).</li>
        </ul>`,
      },
      {
        label: "Solution",
        html: `<div class="code">func searchInsert(_ a: [Int], _ target: Int) -&gt; Int {
  var lo = 0, hi = a.count
  while lo &lt; hi {
    let mid = (lo + hi) / 2
    if a[mid] &lt; target { lo = mid + 1 } else { hi = mid }
  }
  return lo
}</div>
        <p>Half-open <code>[lo, hi)</code> avoids the off-by-one bugs that plague <code>hi = count - 1</code> variants.</p>`,
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
        html: `<ul>
          <li><b>Pattern: breadth-first search, processed one level at a time.</b></li>
          <li>Hold the current level in a list; build the next level from every node's children before going deeper.</li>
          <li>Each full sweep of the queue is exactly one tree level — O(n) time and space.</li>
        </ul>`,
      },
      {
        label: "Solution",
        html: `<div class="code">final class TreeNode {
  var val: Int; var left: TreeNode?; var right: TreeNode?
  init(_ v: Int) { val = v }
}

func levelOrder(_ root: TreeNode?) -&gt; [[Int]] {
  guard let root else { return [] }
  var result: [[Int]] = []
  var queue = [root]
  while !queue.isEmpty {
    var level: [Int] = []
    var next: [TreeNode] = []
    for node in queue {
      level.append(node.val)
      if let l = node.left { next.append(l) }
      if let r = node.right { next.append(r) }
    }
    result.append(level)
    queue = next
  }
  return result
}</div>
        <p>Swapping <code>queue = next</code> wholesale keeps each level cleanly separated — no per-node depth tracking.</p>`,
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
        html: `<ul>
          <li><b>Pattern: flood-fill DFS.</b> Scan the grid; each unvisited land cell starts a new island.</li>
          <li>From it, recursively sink every connected land cell (set it to water) so you never recount an island.</li>
          <li>The grid itself records progress — no separate visited set — O(rows × cols).</li>
        </ul>`,
      },
      {
        label: "Solution",
        html: `<div class="code">func numIslands(_ grid: inout [[Character]]) -&gt; Int {
  let rows = grid.count, cols = grid[0].count
  func sink(_ r: Int, _ c: Int) {
    if r &lt; 0 || c &lt; 0 || r &gt;= rows || c &gt;= cols || grid[r][c] != "1" { return }
    grid[r][c] = "0"
    sink(r + 1, c); sink(r - 1, c); sink(r, c + 1); sink(r, c - 1)
  }
  var count = 0
  for r in 0..&lt;rows {
    for c in 0..&lt;cols where grid[r][c] == "1" {
      count += 1
      sink(r, c)
    }
  }
  return count
}</div>
        <p>Mutating the grid in place is the trick that makes "visited" free.</p>`,
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
        html: `<ul>
          <li><b>Pattern: 1-D dynamic programming — it's Fibonacci.</b> ways(i) = ways(i−1) + ways(i−2).</li>
          <li>You only ever need the last two values, so keep two rolling variables instead of a full array.</li>
          <li>O(n) time, O(1) space.</li>
        </ul>`,
      },
      {
        label: "Solution",
        html: `<div class="code">func climbStairs(_ n: Int) -&gt; Int {
  if n &lt;= 2 { return n }
  var a = 1, b = 2
  for _ in 3...n { (a, b) = (b, a + b) }
  return b
}</div>
        <p>Recognising the recurrence <i>is</i> the interview — the rolling-variable rewrite is just the O(1) polish.</p>`,
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
        html: `<ul>
          <li><b>Pattern: stack for matching pairs.</b> Push every opening bracket.</li>
          <li>On a closing bracket, the top of the stack must be its matching opener — otherwise it's invalid.</li>
          <li>Valid iff the stack is empty at the end — O(n).</li>
        </ul>`,
      },
      {
        label: "Solution",
        html: `<div class="code">func isValid(_ s: String) -&gt; Bool {
  let pairs: [Character: Character] = [")": "(", "]": "[", "}": "{"]
  var stack: [Character] = []
  for c in s {
    if let open = pairs[c] {
      if stack.popLast() != open { return false }
    } else {
      stack.append(c)
    }
  }
  return stack.isEmpty
}</div>
        <p>Mapping each closer to its opener turns the match into a single dictionary lookup.</p>`,
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
        html: `<ul>
          <li><b>Pattern: count, then select the top K.</b> First tally frequencies in a hash map.</li>
          <li>A size-K heap gives O(n log k); here we use <b>bucket sort by frequency</b> — index buckets by count
            — for O(n).</li>
          <li>Walk buckets from highest count down, collecting until you have K.</li>
        </ul>`,
      },
      {
        label: "Solution",
        html: `<div class="code">func topKFrequent(_ nums: [Int], _ k: Int) -&gt; [Int] {
  var freq: [Int: Int] = [:]
  for n in nums { freq[n, default: 0] += 1 }
  var buckets = [[Int]](repeating: [], count: nums.count + 1)
  for (n, f) in freq { buckets[f].append(n) }
  var result: [Int] = []
  for f in stride(from: buckets.count - 1, through: 0, by: -1) {
    for n in buckets[f] {
      result.append(n)
      if result.count == k { return result }
    }
  }
  return result
}</div>
        <p>Frequencies are bounded by <code>nums.count</code>, so indexing buckets by count beats sorting.</p>`,
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
        html: `<ul>
          <li><b>Pattern: backtracking / decision tree.</b> At each index decide: include it or not.</li>
          <li>Record the current partial subset at every node, recurse on the remaining suffix, then undo (pop) —
            the classic choose / explore / un-choose loop.</li>
          <li>O(n · 2ⁿ): there are 2ⁿ subsets.</li>
        </ul>`,
      },
      {
        label: "Solution",
        html: `<div class="code">func subsets(_ nums: [Int]) -&gt; [[Int]] {
  var result: [[Int]] = []
  var current: [Int] = []
  func backtrack(_ start: Int) {
    result.append(current)
    for i in start..&lt;nums.count {
      current.append(nums[i])
      backtrack(i + 1)
      current.removeLast()
    }
  }
  backtrack(0)
  return result
}</div>
        <p>Appending <code>current</code> at <i>every</i> call (not just leaves) is what collects all 2ⁿ subsets.</p>`,
      },
    ],
  },
];
