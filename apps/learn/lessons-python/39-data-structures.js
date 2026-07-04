window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "data-structures",
  title: "Data Structures & Problem-Solving",
  emoji: "🧩",
  lang: "python",
  lessons: [
    {
      id: "big-o-and-maps",
      title: "Big-O & Your Two Workhorses",
      steps: [
        { type: "text", md: [
          "## The two structures you'll reach for 90% of the time",
          "A **list** (dynamic array) holds items in order and lets you append cheaply. A **dict** (hash map) maps keys to values and looks them up in roughly constant time. Master these two and most backend problems fall over.",
          "**Big-O** is just how the work grows as the input grows. O(1) means constant — the same cost no matter the size. O(n) means it scales linearly with the number of items. O(n) is fine at 100 items and a disaster at 10 million.",
        ] },
        { type: "text", md: [
          "### Finding a booking: scan vs. map",
          "Say you have a list of bookings and you want the one with a given id.",
          "- Scanning the list: you check each booking until you find it. Worst case that's every item — **O(n)**.",
          "- Keeping a `dict` keyed by id: one lookup, **O(1) average**. No matter how many bookings, the cost barely moves.",
          "Appending to a list is **O(1) amortized** — occasionally Python grows the backing array, but averaged out each append is constant.",
        ] },
        { type: "code", title: "scan vs. map",
          source: String.raw`bookings = [
    {"id": 12, "dog": "Rex"},
    {"id": 47, "dog": "Bella"},
    {"id": 88, "dog": "Max"},
]

# O(n): walk the list until the id matches
def find_scan(bookings, target_id):
    for b in bookings:
        if b["id"] == target_id:
            return b
    return None

# O(1) average: build a by-id index once, then look up instantly
by_id = {b["id"]: b for b in bookings}
print(by_id[47])   # {'id': 47, 'dog': 'Bella'}`,
          caption: "Build the index once (O(n)); every lookup afterward is O(1)." },
        { type: "quiz",
          q: "Why is a dict lookup by id faster than scanning a list for that id?",
          choices: [
            "A hash map jumps near-directly to the slot for a key (O(1) average); a scan may check every item (O(n))",
            "Lists are always slow in Python",
            "Dicts keep items sorted so binary search applies",
            "It isn't faster — they're the same",
          ],
          answer: 0,
          explain: "The dict hashes the key to find its bucket in ~constant time. The list has no such shortcut, so worst case it touches every element.",
          nudge: "Think about how many items each approach has to touch to find the answer." },
        { type: "text", md: [
          "### LeetCode worked: Two Sum",
          "Given `nums` and a `target`, return the indices of the two numbers that add to `target`. The brute force is two nested loops — **O(n²)**. The trick: as you walk the list, remember every value you've seen in a dict mapping *value -> its index*. For each number, the partner you need is `target - num`; check if you've already seen it.",
          "One pass, one dict — **O(n)** time, O(n) space.",
        ] },
        { type: "code", title: "two_sum, one pass",
          source: String.raw`def two_sum(nums, target):
    seen = {}                       # value -> index
    for i, num in enumerate(nums):
        need = target - num
        if need in seen:
            return [seen[need], i]
        seen[num] = i
    return None

print(two_sum([2, 7, 11, 15], 9))   # [0, 1]`,
          caption: "Check for the partner BEFORE storing the current number, so you never pair a number with itself." },
        { type: "exercise", title: "Implement two_sum",
          prompt: [
            "Fill in the loop body. For each `num` at index `i`, compute what you `need` (target - num). If `need` is already in `seen`, return `[seen[need], i]`. Otherwise record `seen[num] = i`.",
          ],
          starter: String.raw`def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        # your code here
        pass
    return None`,
          solution: String.raw`def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        need = target - num
        if need in seen:
            return [seen[need], i]
        seen[num] = i
    return None`,
          checks: [
            { re: /need=target-num/, hint: "Compute the partner: need = target - num." },
            { re: /if need in seen:/, hint: "Check membership: if need in seen:." },
            { re: /return\[seen\[need\],i\]/, hint: "Return both indices: return [seen[need], i]." },
            { re: /seen\[num\]=i/, hint: "Remember this number: seen[num] = i." },
          ],
          success: "One pass, O(n). This value->index map pattern shows up all over LeetCode and real de-duplication code." },
      ],
    },
    {
      id: "stacks-and-queues",
      title: "Stacks & Queues",
      steps: [
        { type: "text", md: [
          "## Two ways to line things up",
          "A **stack** is LIFO — last in, first out. Think of an undo history: the last action you did is the first you undo. In Python a plain `list` is a stack: `append` to push, `pop()` to pop off the end. Both are O(1).",
          "A **queue** is FIFO — first in, first out. Think of a job queue: the first job enqueued is the first one worked. That means adding at one end and removing from the *other*.",
        ] },
        { type: "text", md: [
          "### Don't use a list as a queue",
          "You *can* remove from the front of a list with `list.pop(0)`, but it's **O(n)** — every remaining element shifts down one slot. For a real queue use `collections.deque`: `append` to enqueue and `popleft` to dequeue are both **O(1)**.",
          "> Rule of thumb: list for a stack, deque for a queue.",
        ] },
        { type: "code", title: "stack and queue",
          source: String.raw`from collections import deque

# Stack (LIFO) — an undo history
undo = []
undo.append("rename")
undo.append("delete")
print(undo.pop())      # 'delete'  (last in, first out)

# Queue (FIFO) — a job queue
jobs = deque()
jobs.append("walk-12")
jobs.append("walk-13")
print(jobs.popleft())  # 'walk-12'  (first in, first out)`,
          caption: "deque.popleft() is O(1); list.pop(0) would be O(n)." },
        { type: "quiz",
          q: "Why prefer collections.deque over a list when you need a FIFO queue?",
          choices: [
            "deque.popleft() is O(1); removing from the front of a list is O(n) because every element shifts",
            "deque uses less memory in all cases",
            "lists can't remove from the front at all",
            "deque keeps items sorted",
          ],
          answer: 0,
          explain: "Popping the left of a deque is constant time. list.pop(0) has to shift every remaining element down one index, which is O(n).",
          nudge: "What has to happen to the other elements when you remove index 0 of a list?" },
        { type: "text", md: [
          "### LeetCode worked: Valid Parentheses",
          "Given a string of brackets like `\"([]{})\"`, decide if every opener has a matching closer in the right order. A stack is perfect: push every opener; when you hit a closer, the top of the stack must be its matching opener — otherwise it's invalid. At the end the stack must be empty.",
          "Map each closer to its opener so the check is a single dict lookup.",
        ] },
        { type: "code", title: "valid_parentheses",
          source: String.raw`def valid_parentheses(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in pairs:                     # a closer
            if not stack or stack.pop() != pairs[ch]:
                return False
        else:                               # an opener
            stack.append(ch)
    return not stack

print(valid_parentheses("([]{})"))  # True
print(valid_parentheses("(]"))      # False`,
          caption: "not stack catches a closer with nothing open; the final not stack catches leftover openers." },
        { type: "exercise", title: "Implement valid_parentheses",
          prompt: [
            "Loop over each char. If it's a closer (in `pairs`), the stack must be non-empty AND `stack.pop()` must equal `pairs[ch]` — else return False. Otherwise it's an opener: push it. At the end return whether the stack is empty.",
          ],
          starter: String.raw`def valid_parentheses(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        # your code here
        pass
    return not stack`,
          solution: String.raw`def valid_parentheses(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
        else:
            stack.append(ch)
    return not stack`,
          checks: [
            { re: /if ch in pairs:/, hint: "Detect a closer with: if ch in pairs:." },
            { re: /if not stack or stack.pop\(\)!=pairs\[ch\]:/, hint: "Guard: if not stack or stack.pop() != pairs[ch]: return False." },
            { re: /return False/, hint: "Return False on a mismatch." },
            { re: /stack.append\(ch\)/, hint: "Push openers: stack.append(ch)." },
          ],
          success: "A stack turns nested matching into a clean linear scan — O(n) time, O(n) space." },
      ],
    },
    {
      id: "linked-lists",
      title: "Linked Lists",
      steps: [
        { type: "text", md: [
          "## Nodes joined by pointers",
          "A **linked list** is a chain of nodes. Each node holds a value and a reference (`next`) to the following node. The list is just a pointer to the first node (the *head*); the last node's `next` is `None`.",
          "There's no big backing array — nodes can live anywhere in memory, stitched together by their `next` pointers.",
        ] },
        { type: "text", md: [
          "### When they win, when they lose",
          "- **Win:** given a node, inserting or removing right there is **O(1)** — you just re-point a couple of `next` references, no shifting.",
          "- **Lose:** no random access. To reach the 500th element you walk 500 `next` pointers — **O(n)**. A list indexes in O(1).",
          "- **Lose:** poor cache locality. Array elements sit contiguously and the CPU prefetches them; scattered nodes cause cache misses, so in practice arrays are often faster even when Big-O says otherwise.",
        ] },
        { type: "code", title: "a Node and a walk",
          source: String.raw`class Node:
    def __init__(self, val, next=None):
        self.val = val
        self.next = next

# 1 -> 2 -> 3 -> None
head = Node(1, Node(2, Node(3)))

# Walk it: O(n)
node = head
while node:
    print(node.val)
    node = node.next`,
          caption: "The whole list is just the head; you follow next until you hit None." },
        { type: "quiz",
          q: "What does a linked list give you that a Python list doesn't?",
          choices: [
            "O(1) insert/remove at a node you already hold, with no shifting of other elements",
            "O(1) access to any index",
            "Better cache locality",
            "Automatic sorting",
          ],
          answer: 0,
          explain: "Splicing a node in or out is just re-pointing a couple of next references. The trade-off is losing O(1) random access and cache-friendly layout.",
          nudge: "Think about what an array has to do to insert in the middle vs. what a linked list has to do." },
        { type: "text", md: [
          "### LeetCode worked: Reverse a Linked List",
          "Reverse `1 -> 2 -> 3` into `3 -> 2 -> 1`. Walk the list once, flipping each node's `next` to point backward. You need three references: `prev` (the reversed part so far), `curr` (the node you're on), and a stashed `next` so you don't lose the rest of the chain.",
          "Each step: save `curr.next`, point `curr.next` back at `prev`, then advance both `prev` and `curr` forward. **O(n)** time, **O(1)** space.",
        ] },
        { type: "code", title: "reverse_list",
          source: String.raw`def reverse_list(head):
    prev = None
    curr = head
    while curr:
        nxt = curr.next     # stash the rest of the list
        curr.next = prev    # flip the pointer backward
        prev = curr         # advance prev
        curr = nxt          # advance curr
    return prev             # new head`,
          caption: "prev ends on the old tail — that's the new head." },
        { type: "exercise", title: "Implement reverse_list",
          prompt: [
            "Fill in the loop body. Stash `nxt = curr.next`. Point `curr.next = prev`. Then advance `prev = curr` and `curr = nxt`. Return `prev` at the end.",
          ],
          starter: String.raw`def reverse_list(head):
    prev = None
    curr = head
    while curr:
        # your code here
        pass
    return prev`,
          solution: String.raw`def reverse_list(head):
    prev = None
    curr = head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev`,
          checks: [
            { re: /nxt=curr.next/, hint: "Stash the rest: nxt = curr.next." },
            { re: /curr.next=prev/, hint: "Flip the pointer: curr.next = prev." },
            { re: /prev=curr/, hint: "Advance prev: prev = curr." },
            { re: /curr=nxt/, hint: "Advance curr: curr = nxt." },
          ],
          mustNot: [ { re: /reversed\(/, hint: "Do the pointer surgery by hand — don't call reversed()." } ],
          success: "The prev/curr/next dance is the canonical linked-list move. O(n) time, O(1) space." },
      ],
    },
    {
      id: "trees-and-bst",
      title: "Trees & Binary Search Trees",
      steps: [
        { type: "text", md: [
          "## Nodes with children",
          "A **tree** is a node with a value and references to child nodes. A **binary tree** gives each node at most two children, `left` and `right`. The top node is the *root*; nodes with no children are *leaves*.",
          "Trees are everywhere in backend work: a comment thread (replies under replies), a category hierarchy, a filesystem, an HTML/JSON document.",
        ] },
        { type: "text", md: [
          "### Recursion is the natural tool",
          "A tree is *self-similar*: each child is itself the root of a smaller tree. So most tree code is recursive — do something with the node, then recurse into `left` and `right`. **DFS** (depth-first search) walks down one branch fully before backtracking, in three flavours by *when* you visit the node:",
          "- **pre-order**: node, then left, then right.",
          "- **in-order**: left, node, right.",
          "- **post-order**: left, right, then node.",
        ] },
        { type: "text", md: [
          "### The BST ordering property",
          "A **binary search tree** keeps everything ordered: for every node, all values in its `left` subtree are smaller, all values in its `right` subtree are larger. That invariant lets you search by comparing and going left or right — **O(log n)** when the tree is balanced (**O(n)** worst case if it degenerates into a chain).",
          "> An in-order traversal of a BST visits values in sorted order — a handy trick.",
        ] },
        { type: "code", title: "tree node + in-order",
          source: String.raw`class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

#     2
#    / \
#   1   3
root = TreeNode(2, TreeNode(1), TreeNode(3))

def in_order(node):
    if node is None:
        return
    in_order(node.left)
    print(node.val)         # 1, 2, 3  (sorted, for a BST)
    in_order(node.right)`,
          caption: "None is the base case that stops the recursion." },
        { type: "quiz",
          q: "In a valid binary search tree, where do values smaller than a node live?",
          choices: [
            "Entirely in that node's left subtree",
            "Entirely in that node's right subtree",
            "Split evenly between left and right",
            "Only in the root",
          ],
          answer: 0,
          explain: "The BST invariant: everything in the left subtree is smaller, everything in the right subtree is larger. That's what makes O(log n) search possible on a balanced tree.",
          nudge: "The ordering is what lets you decide 'go left or go right' at each step." },
        { type: "text", md: [
          "### LeetCode worked: Maximum Depth",
          "The **depth** (height) of a binary tree is the number of nodes on the longest root-to-leaf path. Recursion makes it a one-liner in spirit: an empty tree has depth 0; otherwise the depth is 1 plus the deeper of the two subtrees.",
          "`max_depth(node) = 0 if node is None else 1 + max(max_depth(left), max_depth(right))`. **O(n)** — you touch every node once.",
        ] },
        { type: "code", title: "max_depth",
          source: String.raw`def max_depth(node):
    if node is None:
        return 0
    return 1 + max(max_depth(node.left), max_depth(node.right))

#     2
#    / \
#   1   3
print(max_depth(TreeNode(2, TreeNode(1), TreeNode(3))))  # 2`,
          caption: "Base case returns 0; each level adds 1 to the deeper side." },
        { type: "exercise", title: "Implement max_depth",
          prompt: [
            "Return 0 when `node is None`. Otherwise return `1 + max(...)` of the recursive depths of `node.left` and `node.right`.",
          ],
          starter: String.raw`def max_depth(node):
    # your code here
    pass`,
          solution: String.raw`def max_depth(node):
    if node is None:
        return 0
    return 1 + max(max_depth(node.left), max_depth(node.right))`,
          checks: [
            { re: /if node is None:/, hint: "Base case: if node is None:." },
            { re: /return 0/, hint: "Empty tree has depth 0." },
            { re: /return 1\+max\(/, hint: "Recursive case: return 1 + max(...)." },
            { re: /max_depth\(node.left\)/, hint: "Recurse left: max_depth(node.left)." },
            { re: /max_depth\(node.right\)/, hint: "Recurse right: max_depth(node.right)." },
          ],
          success: "One base case plus one recursive combine — the shape of nearly every tree algorithm. O(n)." },
      ],
    },
    {
      id: "graphs-bfs-dfs",
      title: "Graphs: BFS & DFS",
      steps: [
        { type: "text", md: [
          "## Nodes connected by edges",
          "A **graph** is nodes joined by edges — more general than a tree because there's no single root and cycles are allowed. Model it as an **adjacency map**: a dict from each node to the list of its neighbors.",
          "PawWalk example: neighborhoods connected by walkable routes. `graph['Downtown']` is the list of neighborhoods you can reach directly on foot from Downtown.",
        ] },
        { type: "text", md: [
          "### Two ways to explore, one thing you must not forget",
          "- **DFS** (depth-first): go as deep as you can down one path before backtracking. Natural with recursion or an explicit stack.",
          "- **BFS** (breadth-first): explore in rings — all neighbors, then their neighbors. Uses a queue (`deque`), and finds the *shortest* path in an unweighted graph.",
          "Both need a **visited set**. Graphs can have cycles, so without tracking what you've seen you'll loop forever. Check-and-mark before you recurse into a neighbor.",
        ] },
        { type: "code", title: "DFS with a visited set",
          source: String.raw`from collections import deque

graph = {
    "Downtown": ["Riverside", "Hillcrest"],
    "Riverside": ["Downtown", "Marina"],
    "Hillcrest": ["Downtown"],
    "Marina": ["Riverside"],
}

def dfs(graph, node, visited):
    visited.add(node)
    for nbr in graph[node]:
        if nbr not in visited:
            dfs(graph, nbr, visited)
    return visited

# BFS variant with a queue
def bfs(graph, start):
    visited = {start}
    q = deque([start])
    while q:
        node = q.popleft()
        for nbr in graph[node]:
            if nbr not in visited:
                visited.add(nbr)
                q.append(nbr)
    return visited`,
          caption: "Visited both prevents cycles and doubles as the set of reachable nodes." },
        { type: "quiz",
          q: "Why does a graph traversal need a visited set when a tree traversal doesn't?",
          choices: [
            "Graphs can contain cycles, so without visited you'd revisit nodes and loop forever",
            "Graphs are always larger than trees",
            "Visited makes the traversal O(1)",
            "Trees don't have edges",
          ],
          answer: 0,
          explain: "A tree has no cycles, so recursion terminates naturally. A graph may loop back on itself; the visited set is what stops infinite revisiting.",
          nudge: "What happens if A points to B and B points back to A and you never record where you've been?" },
        { type: "text", md: [
          "### LeetCode worked: Number of Islands",
          "Given a grid of '1' (land) and '0' (water), count the islands — groups of horizontally/vertically connected land. Walk every cell; when you hit unvisited land, that's a new island, so bump the count and **flood fill** from it (DFS/BFS marking all connected land as visited) so you don't count the same island twice.",
          "Each cell is visited a constant number of times — **O(rows × cols)**.",
        ] },
        { type: "code", title: "number of islands (flood fill)",
          source: String.raw`def num_islands(grid):
    if not grid:
        return 0
    rows, cols = len(grid), len(grid[0])
    seen = set()

    def flood(r, c):
        if r < 0 or r >= rows or c < 0 or c >= cols:
            return
        if grid[r][c] == "0" or (r, c) in seen:
            return
        seen.add((r, c))
        flood(r + 1, c); flood(r - 1, c)
        flood(r, c + 1); flood(r, c - 1)

    count = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1" and (r, c) not in seen:
                count += 1
                flood(r, c)
    return count`,
          caption: "One flood fill per island sinks all of its land so it's counted once." },
        { type: "exercise", title: "Implement reachable",
          prompt: [
            "Given an adjacency map `graph` and a `start` node, return the set of all nodes reachable from `start` (including start). Use a visited set. Fill in the loop: for each neighbor `nbr` of `node`, if it's not in `visited`, add it and push it onto the stack.",
          ],
          starter: String.raw`def reachable(graph, start):
    visited = {start}
    stack = [start]
    while stack:
        node = stack.pop()
        for nbr in graph[node]:
            # your code here
            pass
    return visited`,
          solution: String.raw`def reachable(graph, start):
    visited = {start}
    stack = [start]
    while stack:
        node = stack.pop()
        for nbr in graph[node]:
            if nbr not in visited:
                visited.add(nbr)
                stack.append(nbr)
    return visited`,
          checks: [
            { re: /if nbr not in visited:/, hint: "Skip seen nodes: if nbr not in visited:." },
            { re: /visited.add\(nbr\)/, hint: "Mark it seen: visited.add(nbr)." },
            { re: /stack.append\(nbr\)/, hint: "Queue it to explore: stack.append(nbr)." },
          ],
          success: "Check-then-mark-then-push — the core of every graph traversal. O(nodes + edges)." },
      ],
    },
    {
      id: "heaps-priority-queues",
      title: "Heaps & Priority Queues",
      steps: [
        { type: "text", md: [
          "## Always grab the smallest (or largest) cheaply",
          "A **priority queue** hands you the highest-priority item next, not the oldest. A **heap** is the data structure that implements it: it keeps the min (or max) at the top so you can peek it in O(1) and pop it in **O(log n)**, and push a new item in **O(log n)**.",
          "It does *not* keep everything fully sorted — that would be more work. It only guarantees cheap access to the extreme, which is exactly what you need when you repeatedly want 'the next-most-urgent thing'.",
        ] },
        { type: "text", md: [
          "### Python's heapq",
          "Python ships `heapq`: a **min-heap** built on an ordinary list. `heapq.heappush(h, x)` and `heapq.heappop(h)` are O(log n); `h[0]` peeks the smallest in O(1). For a max-heap, push the negated values (or use a key).",
          "Real uses: dispatch the *nearest* available walker (min-heap on distance), or run the *highest-priority* job first (push `(priority, job)` tuples).",
        ] },
        { type: "code", title: "heapq in action",
          source: String.raw`import heapq

# Dispatch: nearest walker first (min-heap on distance in meters)
walkers = []
heapq.heappush(walkers, (800, "Ana"))
heapq.heappush(walkers, (120, "Beto"))
heapq.heappush(walkers, (450, "Cira"))

print(heapq.heappop(walkers))   # (120, 'Beto') — closest
print(walkers[0])               # (450, 'Cira') — next closest, peeked

# nlargest / nsmallest for a quick top-k
print(heapq.nlargest(2, [5, 1, 8, 3, 9]))  # [9, 8]`,
          caption: "Tuples compare element-by-element, so (distance, name) sorts by distance first." },
        { type: "quiz",
          q: "What does a heap give you that a fully-sorted list doesn't need to?",
          choices: [
            "O(log n) push and pop of the extreme element without keeping everything sorted",
            "O(1) access to any element by index",
            "Values in fully sorted order at all times",
            "Constant-time insertion anywhere",
          ],
          answer: 0,
          explain: "A heap only guarantees the min (or max) is at the top. Push and pop are O(log n); it skips the extra work of a total ordering you don't need.",
          nudge: "You only ever look at the top of a heap — it doesn't waste effort sorting the rest." },
        { type: "text", md: [
          "### LeetCode worked: Kth Largest Element",
          "Find the kth largest value in `nums`. The quick way in Python is `heapq.nlargest(k, nums)[-1]` — the last of the top k is the kth largest.",
          "The classic heap approach keeps a **min-heap of size k**: push each number, and whenever the heap exceeds k, pop the smallest. What survives is the k largest, and the heap's root is the kth largest — **O(n log k)** time, O(k) space, which beats sorting the whole list when k is small.",
        ] },
        { type: "code", title: "kth largest, two ways",
          source: String.raw`import heapq

def kth_largest_simple(nums, k):
    return heapq.nlargest(k, nums)[-1]

def kth_largest_heap(nums, k):
    h = []
    for n in nums:
        heapq.heappush(h, n)
        if len(h) > k:
            heapq.heappop(h)     # drop the smallest so far
    return h[0]                  # root = kth largest

print(kth_largest_simple([3, 2, 1, 5, 6, 4], 2))  # 5
print(kth_largest_heap([3, 2, 1, 5, 6, 4], 2))    # 5`,
          caption: "The size-k min-heap keeps only the k biggest; its root is the answer." },
        { type: "exercise", title: "Implement kth_largest",
          prompt: [
            "Return the kth largest element of `nums` using `heapq.nlargest`. It returns the top k in descending order, so the kth largest is the last one.",
          ],
          starter: String.raw`import heapq

def kth_largest(nums, k):
    # your code here
    pass`,
          solution: String.raw`import heapq

def kth_largest(nums, k):
    return heapq.nlargest(k, nums)[-1]`,
          checks: [
            { re: /heapq.nlargest\(k,nums\)/, hint: "Grab the top k: heapq.nlargest(k, nums)." },
            { re: /\[-1\]/, hint: "The kth largest is the last of the top k: [-1]." },
          ],
          success: "nlargest(k, nums)[-1] is the one-liner; the true heap approach is O(n log k) when you need to scale." },
      ],
    },
    {
      id: "hashing-patterns",
      title: "Hashing Patterns (capstone)",
      steps: [
        { type: "text", md: [
          "## The hash map is the LeetCode swiss-army knife",
          "Most 'medium' array/string problems come down to one of three hash-map moves:",
          "- **Frequency counts**: how many times does each item appear? (`collections.Counter`)",
          "- **Grouping by a canonical key**: bucket items that share some derived key. (`collections.defaultdict(list)`)",
          "- **Seen-sets**: have I encountered this before? (a plain `set`, as in Two Sum and graph traversals)",
        ] },
        { type: "text", md: [
          "### Counter and defaultdict",
          "`Counter(iterable)` builds a dict of item -> count in one line. `defaultdict(list)` gives every missing key an empty list automatically, so you can `d[key].append(x)` without checking whether the key exists first. Both build in **O(n)**.",
          "> Reaching for `if key in d: ... else: d[key] = ...` is the tell that a defaultdict would be cleaner.",
        ] },
        { type: "code", title: "the three moves",
          source: String.raw`from collections import Counter, defaultdict

# Frequency counts
walks = ["short", "long", "short", "short", "long"]
print(Counter(walks))          # Counter({'short': 3, 'long': 2})

# Grouping by a canonical key (first letter)
dogs = ["Rex", "Bella", "Rocky", "Bo"]
by_letter = defaultdict(list)
for name in dogs:
    by_letter[name[0]].append(name)
print(dict(by_letter))         # {'R': ['Rex', 'Rocky'], 'B': ['Bella', 'Bo']}

# Seen-set
seen = set()
print("Rex" in seen)           # False`,
          caption: "Counter for counts, defaultdict(list) for buckets, set for membership." },
        { type: "quiz",
          q: "You want to group values under keys, appending as you go. What's the cleanest tool?",
          choices: [
            "collections.defaultdict(list) — a missing key auto-creates an empty list to append to",
            "A Counter",
            "A sorted list of tuples",
            "A set",
          ],
          answer: 0,
          explain: "defaultdict(list) removes the 'is this key here yet?' check — d[key].append(x) just works. Counter is for counts; a set is for membership.",
          nudge: "You need each key to start life as an empty list without you writing the check." },
        { type: "text", md: [
          "### LeetCode worked: Group Anagrams",
          "Group words that are anagrams of each other (same letters, reordered): `['eat','tea','tan','ate']` -> `[['eat','tea','ate'], ['tan']]`. The insight: two words are anagrams iff their **sorted letters** are identical. So the canonical key is `''.join(sorted(word))`, and you bucket words under that key with a defaultdict.",
          "Sorting each word of length k is O(k log k); across n words that's **O(n · k log k)**.",
        ] },
        { type: "code", title: "group_anagrams",
          source: String.raw`from collections import defaultdict

def group_anagrams(words):
    groups = defaultdict(list)
    for word in words:
        key = "".join(sorted(word))   # canonical key: sorted letters
        groups[key].append(word)
    return list(groups.values())

print(group_anagrams(["eat", "tea", "tan", "ate", "nat"]))
# [['eat', 'tea', 'ate'], ['tan', 'nat']]`,
          caption: "Anagrams collapse to the same sorted-letters key, so they land in the same bucket." },
        { type: "exercise", title: "Implement group_anagrams",
          prompt: [
            "Loop over `words`. Build `key` from the sorted letters with `\"\".join(sorted(word))`, append the word to `groups[key]`, and return `list(groups.values())`.",
          ],
          starter: String.raw`from collections import defaultdict

def group_anagrams(words):
    groups = defaultdict(list)
    for word in words:
        # your code here
        pass
    return list(groups.values())`,
          solution: String.raw`from collections import defaultdict

def group_anagrams(words):
    groups = defaultdict(list)
    for word in words:
        key = "".join(sorted(word))
        groups[key].append(word)
    return list(groups.values())`,
          checks: [
            { re: /key="".join\(sorted\(word\)\)/, hint: "Canonical key: key = \"\".join(sorted(word))." },
            { re: /groups\[key\].append\(word\)/, hint: "Bucket it: groups[key].append(word)." },
            { re: /list\(groups.values\(\)\)/, hint: "Return the buckets: list(groups.values())." },
          ],
          success: "Group-by-canonical-key is the capstone pattern: turn 'are these the same underneath?' into a dict lookup. O(n · k log k)." },
      ],
    },
  ],
});
