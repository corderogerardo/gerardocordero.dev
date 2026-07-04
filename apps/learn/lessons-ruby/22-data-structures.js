window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "data-structures",
  title: "Data Structures & Problem-Solving",
  emoji: "🧩",
  lang: "ruby",
  lessons: [
    {
      id: "big-o-and-maps",
      title: "Big-O & Your Two Workhorses",
      steps: [
        { type: "text", md: [
          "## Two structures do most of the work",
          "Ninety percent of everyday backend code — and most interview problems — leans on exactly two structures: the **dynamic array** (Ruby's `Array`) and the **hash map** (Ruby's `Hash`).",
          "Before the structures, one piece of vocabulary: **Big-O**. It describes how the work grows as the input `n` grows. `O(1)` means constant — the same cost whether you have 10 items or 10 million. `O(n)` means linear — twice the data, twice the work.",
          "> The whole game is spotting when an `O(n)` scan can become an `O(1)` lookup." ] },
        { type: "text", md: [
          "## The array",
          "An `Array` is a contiguous, index-addressable list. Two facts to memorize:",
          "- `arr[i]` — reading by index is `O(1)`. Instant, at any size.\n- `arr.push(x)` — appending to the end is `O(1)` *amortized* (occasionally Ruby grows the backing buffer, but averaged out it's constant).",
          "The trap: **finding a value** in an array is `O(n)` — you scan every element until you hit it. `arr.include?(x)` and `arr.find { ... }` are both linear." ] },
        { type: "code", title: "playground/find_booking.rb", source: String.raw`bookings = [
  { id: 10, dog: "Mochi",  status: "booked" },
  { id: 11, dog: "Cooper", status: "walking" },
  { id: 12, dog: "Bella",  status: "done" },
]

# O(n): scan the whole array to find one booking
found = bookings.find { |b| b[:id] == 11 }
puts found[:dog]  # => Cooper`, caption: "Fine for 3 bookings. For 3 million, every lookup walks the list." },
        { type: "text", md: [
          "## The hash map",
          "A `Hash` maps keys to values with `O(1)` **average** lookup, insert, and delete. It hashes the key to jump straight to the slot — no scanning.",
          "Reshape the bookings into a by-id hash and lookups stop depending on `n` entirely." ] },
        { type: "code", title: "playground/booking_map.rb", source: String.raw`by_id = {
  10 => { dog: "Mochi",  status: "booked" },
  11 => { dog: "Cooper", status: "walking" },
  12 => { dog: "Bella",  status: "done" },
}

# O(1) average: hash straight to the slot, no scan
puts by_id[11][:dog]  # => Cooper`, caption: "Build the index once, then every lookup is constant time." },
        { type: "text", md: [
          "## Worked problem: Two Sum",
          "The classic. *Given an array of numbers and a target, return the indices of the two numbers that add to the target.*",
          "The brute force is two nested loops — `O(n^2)`. The hash-map insight: as you walk the array, for each number `x` you need its complement `target - x`. Store every value you've seen in a `seen` hash mapping value to its index. If the complement is already in `seen`, you're done — one pass, `O(n)`." ] },
        { type: "code", title: "playground/two_sum_idea.rb", source: String.raw`def two_sum(nums, target)
  seen = {}                       # value => index
  nums.each_with_index do |x, i|
    need = target - x
    return [seen[need], i] if seen.key?(need)
    seen[x] = i
  end
  nil
end

p two_sum([2, 7, 11, 15], 9)  # => [0, 1]`, caption: "One pass, O(n) time, O(n) space. The map turns a scan into a lookup." },
        { type: "quiz",
          q: "You look up a booking by id 5,000 times per second. Which structure gives O(1) average lookup?",
          choices: ["An Array, scanned with .find", "A Hash keyed by id", "A sorted Array", "It makes no difference"],
          answer: 1,
          explain: "A Hash keyed by id hashes straight to the slot — O(1) average — while Array#find is an O(n) scan every call.",
          nudge: "Which one avoids walking the whole list on every lookup?" },
        { type: "exercise", title: "Two Sum with a hash map",
          prompt: [
            "Implement two_sum(nums, target). Walk nums with each_with_index. For each x, compute need = target - x, and if seen already has need, return [seen[need], i]. Otherwise store seen[x] = i.",
            "Fill in the two missing lines where the marker is." ],
          starter: String.raw`def two_sum(nums, target)
  seen = {}
  nums.each_with_index do |x, i|
    need = target - x
    # your code here
  end
  nil
end`,
          solution: String.raw`def two_sum(nums, target)
  seen = {}
  nums.each_with_index do |x, i|
    need = target - x
    return [seen[need], i] if seen.key?(need)
    seen[x] = i
  end
  nil
end`,
          checks: [
            { re: /need=target-x/, hint: "Compute the complement: need = target - x." },
            { re: /seen\[need\]/, hint: "Return the stored index for the complement: seen[need]." },
            { re: /seen\[x\]=i/, hint: "Remember this value's index: seen[x] = i." },
          ],
          mustNot: [ { re: /each.*each/, hint: "One pass only — no nested loop. The map is what removes the second loop." } ],
          success: "One pass, O(n). You traded a nested scan for a hash lookup — the core trick behind half of LeetCode." },
      ],
    },
    {
      id: "stacks-and-queues",
      title: "Stacks & Queues",
      steps: [
        { type: "text", md: [
          "## LIFO and FIFO",
          "A **stack** is last-in-first-out (LIFO): the last thing you pushed is the first thing you pop. Think of an undo history — the most recent action undoes first.",
          "A **queue** is first-in-first-out (FIFO): the first thing in is the first thing out. Think of a job queue — the oldest job runs next.",
          "Both are just disciplined ways of adding and removing from a list. What matters is the cost of those operations." ] },
        { type: "text", md: [
          "## Ruby: the honest picture",
          "For a **stack**, a plain `Array` is perfect: `push` and `pop` both hit the end and are `O(1)`.",
          "For a **queue**, the naive move is `push` to the end and `shift` from the front — but `Array#shift` is `O(n)`, because every remaining element slides down one slot. Fine for a handful of items; a real bottleneck at scale.",
          "> For a genuine concurrent work queue in Ruby, reach for `Thread::Queue` (aliased `Queue`) from the stdlib — it's built for producer/consumer handoff. (Python's equivalent is `collections.deque`, which gives O(1) at both ends.)" ] },
        { type: "code", title: "playground/undo_stack.rb", source: String.raw`undo = []
undo.push("assign walker")   # push: O(1)
undo.push("start walk")
undo.push("send GPS fix")

undo.pop   # => "send GPS fix"  (LIFO), O(1)
undo.pop   # => "start walk"`, caption: "Array#push / #pop are an O(1) stack. Last in, first out." },
        { type: "text", md: [
          "## Worked problem: Valid Parentheses",
          "*Given a string of brackets `()[]{}`, is every bracket correctly closed and nested?*",
          "A stack is the natural fit. Walk the string: push every opener. On a closer, the top of the stack must be its matching opener — pop and compare. If it doesn't match (or the stack is empty), it's invalid. At the end the stack must be empty.",
          "Map each closer to the opener it expects, so the check is one hash lookup. `O(n)` time." ] },
        { type: "code", title: "playground/valid_parens.rb", source: String.raw`def valid_parentheses(s)
  pairs = { ")" => "(", "]" => "[", "}" => "{" }
  stack = []
  s.each_char do |c|
    if pairs.key?(c)
      return false if stack.pop != pairs[c]
    else
      stack.push(c)
    end
  end
  stack.empty?
end

p valid_parentheses("([]{})")  # => true
p valid_parentheses("(]")      # => false`, caption: "Closers pop and must match; leftover openers mean unbalanced." },
        { type: "quiz",
          q: "Why is a Ruby queue built from Array#push + Array#shift slow at scale?",
          choices: ["push is O(n)", "shift is O(n) — every element slides down one slot", "Arrays can't hold enough items", "shift reverses the array"],
          answer: 1,
          explain: "shift removes from the front, so all remaining elements move down one index — O(n) per call. Use Thread::Queue (Ruby) or deque (Python) for O(1) dequeue.",
          nudge: "Removing from the front means everything behind it has to move." },
        { type: "exercise", title: "Valid Parentheses with a stack",
          prompt: [
            "Finish valid_parentheses(s). On a closer c (a key in pairs), the popped opener must equal pairs[c] — otherwise return false. On an opener, push it.",
            "Fill in the two branches at the marker." ],
          starter: String.raw`def valid_parentheses(s)
  pairs = { ")" => "(", "]" => "[", "}" => "{" }
  stack = []
  s.each_char do |c|
    if pairs.key?(c)
      # your code here
    else
      # your code here
    end
  end
  stack.empty?
end`,
          solution: String.raw`def valid_parentheses(s)
  pairs = { ")" => "(", "]" => "[", "}" => "{" }
  stack = []
  s.each_char do |c|
    if pairs.key?(c)
      return false if stack.pop != pairs[c]
    else
      stack.push(c)
    end
  end
  stack.empty?
end`,
          checks: [
            { re: /return false if stack.pop!=pairs\[c\]/, hint: "On a closer: return false if stack.pop != pairs[c]." },
            { re: /stack.push\(c\)/, hint: "On an opener: stack.push(c)." },
          ],
          mustNot: [ { re: /stack.empty\?$/m, hint: "Don't delete the final stack.empty? — that's the balanced check." } ],
          success: "The stack remembered nesting order for you. Leftover openers => unbalanced." },
      ],
    },
    {
      id: "linked-lists",
      title: "Linked Lists",
      steps: [
        { type: "text", md: [
          "## Nodes joined by pointers",
          "An array stores everything in one contiguous block. A **linked list** stores each value in its own **node**, and each node holds a `next` pointer to the following node. Follow the chain from the `head` until `next` is `nil`.",
          "The whole trade-off comes from that indirection." ] },
        { type: "text", md: [
          "## When they win, when they lose",
          "**Win:** given a node, inserting or removing right there is `O(1)` — you just rewire a couple of `next` pointers. No shifting a million elements like an array insert would.",
          "**Lose:** there's no `list[i]`. To reach the 500th node you follow 500 pointers — random access is `O(n)`. And because nodes are scattered across memory, they have poor **cache locality**, so even sequential walks are slower per-step than an array's tight loop.",
          "> In practice you rarely hand-roll one in Ruby — `Array` wins for most work. But linked lists are interview bread-and-butter, and they're how real queues, LRU caches, and adjacency lists are built underneath." ] },
        { type: "code", title: "playground/node.rb", source: String.raw`class ListNode
  attr_accessor :val, :next
  def initialize(val, nxt = nil)
    @val = val
    @next = nxt
  end
end

# 1 -> 2 -> 3
head = ListNode.new(1, ListNode.new(2, ListNode.new(3)))

node = head
while node
  print node.val, " "   # => 1 2 3
  node = node.next
end`, caption: "A node is a value plus a next pointer. Walk it until next is nil." },
        { type: "text", md: [
          "## Worked problem: reverse a linked list",
          "*Reverse a singly linked list, return the new head.*",
          "The iterative trick uses three pointers: `prev` (starts `nil`), `curr` (starts at `head`), and a temporary `nxt`. For each node: save `nxt = curr.next`, flip `curr.next = prev`, then slide both forward: `prev = curr`, `curr = nxt`. When `curr` is `nil`, `prev` is the new head.",
          "One pass, `O(n)` time, `O(1)` extra space." ] },
        { type: "code", title: "playground/reverse.rb", source: String.raw`def reverse_list(head)
  prev = nil
  curr = head
  while curr
    nxt = curr.next     # save the rest
    curr.next = prev    # flip the pointer
    prev = curr         # slide prev forward
    curr = nxt          # slide curr forward
  end
  prev                  # new head
end`, caption: "Three pointers, one pass. prev ends up pointing at the reversed chain." },
        { type: "quiz",
          q: "What does a linked list give you that a plain array does not?",
          choices: ["O(1) random access by index", "O(1) insert/remove at a known node", "Better cache locality", "Automatic sorting"],
          answer: 1,
          explain: "Given a node, insert/remove is O(1) pointer rewiring. Arrays lose here (shifting), but arrays win on O(1) indexing and cache locality.",
          nudge: "Think about what an array has to do to insert in the middle." },
        { type: "exercise", title: "Reverse a linked list",
          prompt: [
            "Finish reverse_list(head). Inside the loop: save nxt = curr.next, set curr.next = prev, then advance prev = curr and curr = nxt.",
            "Fill in the four lines at the marker." ],
          starter: String.raw`def reverse_list(head)
  prev = nil
  curr = head
  while curr
    # your code here
  end
  prev
end`,
          solution: String.raw`def reverse_list(head)
  prev = nil
  curr = head
  while curr
    nxt = curr.next
    curr.next = prev
    prev = curr
    curr = nxt
  end
  prev
end`,
          checks: [
            { re: /nxt=curr.next/, hint: "Save the rest first: nxt = curr.next." },
            { re: /curr.next=prev/, hint: "Flip the pointer: curr.next = prev." },
            { re: /prev=curr/, hint: "Slide prev forward: prev = curr." },
            { re: /curr=nxt/, hint: "Slide curr forward: curr = nxt." },
          ],
          mustNot: [ { re: /reverse\b/, hint: "Rewire the pointers yourself — don't call a built-in reverse." } ],
          success: "Three pointers, one pass, O(1) extra space. prev is the new head." },
      ],
    },
    {
      id: "trees-and-bst",
      title: "Trees & Binary Search Trees",
      steps: [
        { type: "text", md: [
          "## A node with children",
          "A **tree** is like a linked list that branches. A **binary tree** node holds a value and two child pointers, `left` and `right` (either may be `nil`). The top node is the **root**; a node with no children is a **leaf**.",
          "Trees model anything hierarchical: a comment thread with replies, a category tree, a file system." ] },
        { type: "text", md: [
          "## Recursion is the natural tool",
          "A tree is defined in terms of itself — each child is the root of a smaller tree. So the natural way to process one is **recursion**: do something with the node, then recurse into `left` and `right`. The base case is `nil` (an empty tree).",
          "**Depth-first search (DFS)** comes in three orders by *when* you visit the node versus its children:",
          "- **pre-order**: node, then left, then right.\n- **in-order**: left, node, right.\n- **post-order**: left, right, then node." ] },
        { type: "text", md: [
          "## The BST ordering property",
          "A **binary search tree (BST)** adds one rule: for every node, everything in its `left` subtree is smaller and everything in its `right` subtree is larger.",
          "That rule is what makes lookup fast: to find a value, compare and go left or right, halving the search space each step — `O(log n)` on a balanced tree. An **in-order** traversal of a BST visits values in sorted order, which is a handy thing to know." ] },
        { type: "code", title: "playground/tree.rb", source: String.raw`class TreeNode
  attr_accessor :val, :left, :right
  def initialize(val, left = nil, right = nil)
    @val = val
    @left = left
    @right = right
  end
end

#     4
#    / \
#   2   6
root = TreeNode.new(4, TreeNode.new(2), TreeNode.new(6))

def inorder(node, out = [])
  return out if node.nil?
  inorder(node.left, out)   # left
  out << node.val           # node
  inorder(node.right, out)  # right
  out
end

p inorder(root)  # => [2, 4, 6]  (sorted, because it's a BST)`, caption: "In-order on a BST yields sorted values. The nil check is the base case." },
        { type: "text", md: [
          "## Worked problem: maximum depth",
          "*Return the maximum depth (height) of a binary tree — the number of nodes on the longest root-to-leaf path.*",
          "Pure recursion. An empty tree (`nil`) has depth `0`. Otherwise the depth is `1` (for the current node) plus the deeper of the two subtrees. `O(n)` — you touch each node once." ] },
        { type: "code", title: "playground/max_depth.rb", source: String.raw`def max_depth(node)
  return 0 if node.nil?
  1 + [max_depth(node.left), max_depth(node.right)].max
end

p max_depth(root)  # => 2`, caption: "Base case nil => 0. Otherwise 1 + the taller subtree." },
        { type: "quiz",
          q: "In a binary search tree, where do all values SMALLER than a node live?",
          choices: ["In its right subtree", "In its left subtree", "Only at leaves", "They can be anywhere"],
          answer: 1,
          explain: "The BST property: everything in the left subtree is smaller, everything in the right subtree is larger. That's what enables O(log n) search on a balanced tree.",
          nudge: "Smaller goes one way, larger the other — which side is conventionally smaller?" },
        { type: "exercise", title: "Maximum depth of a binary tree",
          prompt: [
            "Implement max_depth(node). Base case: return 0 when node is nil. Otherwise return 1 plus the max of the left and right subtree depths.",
            "Fill in the recursive line at the marker." ],
          starter: String.raw`def max_depth(node)
  return 0 if node.nil?
  # your code here
end`,
          solution: String.raw`def max_depth(node)
  return 0 if node.nil?
  1 + [max_depth(node.left), max_depth(node.right)].max
end`,
          checks: [
            { re: /return 0 if node.nil\?/, hint: "Base case: return 0 if node.nil?." },
            { re: /max_depth\(node.left\)/, hint: "Recurse left: max_depth(node.left)." },
            { re: /max_depth\(node.right\)/, hint: "Recurse right: max_depth(node.right)." },
            { re: /1\+/, hint: "Add 1 for the current node." },
          ],
          mustNot: [],
          success: "Recursion mirrors the tree's own shape — the base case at nil stops it." },
      ],
    },
    {
      id: "graphs-bfs-dfs",
      title: "Graphs: BFS & DFS",
      steps: [
        { type: "text", md: [
          "## Nodes and edges",
          "A **graph** is nodes connected by edges — more general than a tree (cycles allowed, no single root). The most practical representation for problems is an **adjacency map**: a hash from each node to the list of its neighbors.",
          "Anchor it in PawWalk: neighborhoods connected by walkable routes. Which neighborhoods can a walker reach on foot from where they are?" ] },
        { type: "code", title: "playground/graph.rb", source: String.raw`# neighborhood => directly walkable neighbors
routes = {
  "Downtown"   => ["Riverside", "Oakhill"],
  "Riverside"  => ["Downtown", "Maple"],
  "Oakhill"    => ["Downtown"],
  "Maple"      => ["Riverside"],
  "Isla"       => [],          # not connected to the rest
}`, caption: "An adjacency map: each key points to its immediate neighbors." },
        { type: "text", md: [
          "## Two ways to explore: DFS and BFS",
          "**Depth-first search (DFS)** dives down one path as far as it goes before backtracking. It's natural with recursion, or with an explicit **stack**.",
          "**Breadth-first search (BFS)** explores in rings — all immediate neighbors first, then their neighbors. It uses a **queue**, and it finds the shortest path in an unweighted graph.",
          "The one thing both MUST have is a **visited set**. Graphs have cycles: without remembering where you've been, you'd loop forever between two connected nodes." ] },
        { type: "text", md: [
          "## Worked problem: who's reachable",
          "*From a starting neighborhood, which ones can you reach?* This is a flood fill — the same routine behind \"number of islands\" and \"connected components\".",
          "DFS with a stack: seed the stack with `start`. Pop a node; if unvisited, mark it and push all its neighbors. Repeat until the stack is empty. The visited set is your answer. `O(V + E)` — you touch each node and edge once." ] },
        { type: "code", title: "playground/reachable.rb", source: String.raw`def reachable(graph, start)
  visited = []
  stack = [start]
  until stack.empty?
    node = stack.pop
    next if visited.include?(node)
    visited << node
    graph[node].each { |n| stack.push(n) }
  end
  visited
end

p reachable(routes, "Downtown")
# => ["Downtown", "Oakhill", "Riverside", "Maple"]  (Isla unreachable)`, caption: "Stack-based DFS. The visited list is both the guard and the result." },
        { type: "quiz",
          q: "Why does every graph traversal need a visited set?",
          choices: ["To sort the nodes", "To avoid infinite loops on cycles", "To make lookups O(1)", "It's optional for small graphs"],
          answer: 1,
          explain: "Graphs can contain cycles. Without tracking visited nodes, the traversal revisits them forever. The visited set both prevents cycles and doubles as the reachable result.",
          nudge: "What happens when two nodes point back at each other?" },
        { type: "exercise", title: "Reachable nodes via DFS",
          prompt: [
            "Finish reachable(graph, start). Pop a node; skip it if already visited; otherwise mark it visited and push each neighbor onto the stack.",
            "Fill in the three lines at the marker." ],
          starter: String.raw`def reachable(graph, start)
  visited = []
  stack = [start]
  until stack.empty?
    node = stack.pop
    # your code here
  end
  visited
end`,
          solution: String.raw`def reachable(graph, start)
  visited = []
  stack = [start]
  until stack.empty?
    node = stack.pop
    next if visited.include?(node)
    visited << node
    graph[node].each { |n| stack.push(n) }
  end
  visited
end`,
          checks: [
            { re: /next if visited.include\?\(node\)/, hint: "Skip already-seen nodes: next if visited.include?(node)." },
            { re: /visited<<node/, hint: "Mark it visited: visited << node." },
            { re: /graph\[node\].each/, hint: "Visit neighbors: graph[node].each { ... }." },
            { re: /stack.push\(n\)/, hint: "Push each neighbor: stack.push(n)." },
          ],
          mustNot: [],
          success: "The visited set stopped the cycles and became your answer. Swap the stack for a queue and it's BFS." },
      ],
    },
    {
      id: "heaps-priority-queues",
      title: "Heaps & Priority Queues",
      steps: [
        { type: "text", md: [
          "## Always grab the best one, cheaply",
          "A **priority queue** answers one question fast: *what's the smallest (or largest) item right now?* You keep pushing items in any order, and each pop hands you the current min (or max).",
          "The structure underneath is a **heap** — a tree kept partly ordered so the min (or max) is always at the root. Push and pop are `O(log n)`; peeking at the min is `O(1)`.",
          "Real uses: dispatch the *nearest available* walker first; run the *highest-priority* job before the rest." ] },
        { type: "text", md: [
          "## The honest language note",
          "**Python** ships `heapq` — a min-heap built on a plain list (`heapq.heappush`, `heapq.heappop`). That's the standard tool there.",
          "**Ruby has no heap in its standard library.** Say it plainly, because it trips people up. Your options:",
          "- `Array#min(k)` / `Array#max(k)` return the smallest/largest `k` elements — great when you just need the top few.\n- The `algorithms` gem provides a real `Containers::Heap`.\n- Or hand-roll a binary heap (a good interview exercise).",
          "> For the exercise below we'll use the built-in `Array#max(k)`, which is the pragmatic Ruby answer." ] },
        { type: "code", title: "playground/nearest_walker.rb", source: String.raw`# distances in meters to available walkers
distances = [820, 140, 300, 60, 500]

# Ruby has no stdlib heap; min(k) returns the k smallest, sorted
nearest_three = distances.min(3)   # => [60, 140, 300]
puts "dispatch: #{nearest_three.first} m away"  # => 60 m away`, caption: "Array#min(k) covers the common 'top few' case without a heap." },
        { type: "text", md: [
          "## Worked problem: kth largest element",
          "*Return the kth largest element in an array* (k = 1 is the maximum).",
          "The heap-based approach keeps a min-heap of size `k`: push each number, and whenever the heap exceeds `k`, pop the smallest. The root is then the kth largest. That's `O(n log k)` time and `O(k)` space — better than sorting the whole array (`O(n log n)`) when `k` is small.",
          "In Ruby, `nums.max(k)` returns the `k` largest in descending order, so `nums.max(k).last` is the kth largest directly." ] },
        { type: "code", title: "playground/kth_largest.rb", source: String.raw`def kth_largest(nums, k)
  nums.max(k).last
end

p kth_largest([3, 2, 1, 5, 6, 4], 2)  # => 5  (2nd largest)`, caption: "max(k) gives the top k descending; .last is the kth. A true heap would be O(n log k)." },
        { type: "quiz",
          q: "What's true about heaps in Ruby versus Python?",
          choices: [
            "Both ship a heap in the standard library",
            "Python has heapq; Ruby has no stdlib heap (use max(k)/min(k) or a gem)",
            "Ruby has heapq; Python does not",
            "Neither language can implement a heap"],
          answer: 1,
          explain: "Python's heapq is a stdlib min-heap on a list. Ruby has no stdlib heap — Array#max(k)/#min(k), the algorithms gem, or a hand-rolled binary heap fill the gap.",
          nudge: "One of these languages makes you reach outside the stdlib." },
        { type: "exercise", title: "Kth largest element",
          prompt: [
            "Implement kth_largest(nums, k) using the built-in: nums.max(k) returns the k largest in descending order, so the kth largest is the last of those.",
            "Fill in the one line at the marker. (The true heap approach is O(n log k).)" ],
          starter: String.raw`def kth_largest(nums, k)
  # your code here
end`,
          solution: String.raw`def kth_largest(nums, k)
  nums.max(k).last
end`,
          checks: [
            { re: /nums.max\(k\).last/, hint: "Use nums.max(k).last — the k largest descending, then the last one." },
          ],
          mustNot: [ { re: /sort/, hint: "Skip a full sort — max(k) does the top-k work directly." } ],
          success: "max(k).last is the pragmatic Ruby answer; a size-k min-heap would make it O(n log k)." },
      ],
    },
    {
      id: "hashing-patterns",
      title: "Hashing Patterns (capstone)",
      steps: [
        { type: "text", md: [
          "## The hash map is a swiss-army knife",
          "You met the hash map in lesson one. This capstone is about the three *patterns* it unlocks — the ones that solve a huge fraction of string and array problems:",
          "- **Frequency counts** — how many times each thing appears.\n- **Grouping by a canonical key** — bucket items that share some computed key.\n- **Seen-sets** — remember what you've encountered (Two Sum was this).",
          "Recognizing which pattern a problem wants is most of the battle." ] },
        { type: "text", md: [
          "## The tools in each language",
          "**Python** gives you `collections.Counter` (counts in one line) and `collections.defaultdict(list)` (a dict that auto-creates an empty list per key, so you can `d[key].append(x)` without checking).",
          "**Ruby** gives you the same power idiomatically:",
          "- `Hash.new(0)` — a hash with default `0`, so `counts[x] += 1` just works.\n- `Array#tally` — counts occurrences in one call: `%w[a b a].tally` => `{ \"a\" => 2, \"b\" => 1 }`.\n- `each_with_object` and `group_by` — accumulate into a hash or bucket by a computed key." ] },
        { type: "code", title: "playground/counts.rb", source: String.raw`statuses = %w[booked walking booked done walking booked]

# The default-0 pattern
counts = Hash.new(0)
statuses.each { |s| counts[s] += 1 }
p counts   # => {"booked"=>3, "walking"=>2, "done"=>1}

# Same thing in one call
p statuses.tally  # => {"booked"=>3, "walking"=>2, "done"=>1}`, caption: "Hash.new(0) makes counting a one-liner; tally does it for you." },
        { type: "text", md: [
          "## Worked problem: Group Anagrams",
          "*Group words that are anagrams of each other* (same letters, reordered): `[\"eat\",\"tea\",\"ate\",\"tan\",\"nat\"]` => `[[\"eat\",\"tea\",\"ate\"],[\"tan\",\"nat\"]]`.",
          "The insight is the **canonical key**: two words are anagrams exactly when their sorted letters match. So sort each word's characters to get a key, and bucket words under that key in a hash. One pass, `O(n * m log m)` for `n` words of length `m`.",
          "`Hash.new { |h, k| h[k] = [] }` gives an auto-vivifying hash — index a missing key and it creates an empty array for you, so you can push straight away." ] },
        { type: "code", title: "playground/group_anagrams.rb", source: String.raw`def group_anagrams(words)
  groups = Hash.new { |h, k| h[k] = [] }
  words.each do |w|
    key = w.chars.sort.join   # canonical key
    groups[key] << w
  end
  groups.values
end

p group_anagrams(%w[eat tea ate tan nat])
# => [["eat", "tea", "ate"], ["tan", "nat"]]`, caption: "Sorted letters are the shared key; the hash buckets each word under it." },
        { type: "quiz",
          q: "What makes two words land in the same anagram group?",
          choices: [
            "They have the same length",
            "Their letters, sorted, are identical",
            "They start with the same letter",
            "They hash to the same number by luck"],
          answer: 1,
          explain: "Anagrams are the same multiset of letters. Sorting each word's characters produces a canonical key that's identical for all anagrams — that's the grouping key.",
          nudge: "How would you turn 'eat' and 'tea' into the exact same string?" },
        { type: "exercise", title: "Group Anagrams",
          prompt: [
            "Finish group_anagrams(words). For each word w, build the canonical key with w.chars.sort.join, then push w into groups under that key.",
            "Fill in the two lines at the marker; return groups.values." ],
          starter: String.raw`def group_anagrams(words)
  groups = Hash.new { |h, k| h[k] = [] }
  words.each do |w|
    # your code here
  end
  groups.values
end`,
          solution: String.raw`def group_anagrams(words)
  groups = Hash.new { |h, k| h[k] = [] }
  words.each do |w|
    key = w.chars.sort.join
    groups[key] << w
  end
  groups.values
end`,
          checks: [
            { re: /key=w.chars.sort.join/, hint: "Build the canonical key: key = w.chars.sort.join." },
            { re: /groups\[key\]<<w/, hint: "Bucket the word: groups[key] << w." },
          ],
          mustNot: [ { re: /groups.values.values/, hint: "Return groups.values once — the buckets are already the answer." } ],
          success: "Sorted-letters as a key is the whole trick. That's the grouping pattern — reuse it anywhere a canonical key exists." },
      ],
    },
  ],
});
