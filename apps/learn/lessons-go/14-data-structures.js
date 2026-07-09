window.COURSE = window.COURSE || [];
window.COURSE.push({
  id: "go-data-structures",
  title: "Data Structures & Problem-Solving",
  emoji: "🧩",
  lang: "go",
  lessons: [
    {
      id: "big-o",
      title: "Big-O & Your Two Workhorses",
      steps: [
        { type: "text", md: [
          "## Post-graduation: the interview module",
          "You built the PawWalk backend. Now let's get you through the coding interview that stands between you and the job. This module is data structures and problem-solving — the LeetCode-shaped questions — done in real Go, anchored in PawWalk where it helps.",
          "**Big-O** is just how the work grows as the input grows. `O(1)` is constant — same cost no matter the size. `O(n)` scales linearly with the number of items. `O(n log n)` is a good sort. `O(n^2)` is two nested loops over the same data — fine at 100 items, a disaster at ten million. When an interviewer asks 'can you do better?', they mean 'can you lower that exponent?'",
        ] },
        { type: "text", md: [
          "## The two structures you reach for 90% of the time",
          "In Go, two built-in types carry almost every problem:",
          "- The **slice** (`[]T`) is a dynamic array: items in order, cheap `append` at the end, `O(1)` access by index. It's your list, your stack, your buffer.",
          "- The **map** (`map[K]V`) is a hash table: it maps keys to values and looks them up in roughly **O(1) average** time.",
          "Say you have `[]Booking` and want the one with a given id. Scanning the slice checks each booking until it matches — worst case every item, **O(n)**. Building a `map[int]Booking` keyed by id once, then looking up, is **O(1) average**. Same answer, wildly different cost as the data grows.",
        ] },
        { type: "code", title: "scan vs. map",
          source: String.raw`type Booking struct {
	ID  int
	Dog string
}

// O(n): walk the slice until the id matches
func findScan(bookings []Booking, targetID int) (Booking, bool) {
	for _, b := range bookings {
		if b.ID == targetID {
			return b, true
		}
	}
	return Booking{}, false
}

// O(1) average: build a by-id index once, then look up instantly
func main() {
	bookings := []Booking{{12, "Rex"}, {47, "Bella"}, {88, "Max"}}
	byID := map[int]Booking{}
	for _, b := range bookings {
		byID[b.ID] = b
	}
	fmt.Println(byID[47]) // {47 Bella}
}`,
          caption: "Build the index once (O(n)); every lookup afterward is O(1). The comma-ok form `byID[47]` also tells you if a key was missing." },
        { type: "quiz",
          q: "Why is a map lookup by id faster than scanning a slice for that id?",
          choices: [
            "A hash map jumps near-directly to the bucket for a key (O(1) average); a scan may touch every item (O(n))",
            "Slices are always slow in Go",
            "Maps keep keys sorted so binary search applies",
            "It isn't faster — they cost the same",
          ],
          answer: 0,
          explain: "The map hashes the key to find its bucket in about constant time. A slice has no such shortcut, so worst case it touches every element. Go maps are unordered — if you need sorted order you sort the keys yourself.",
          nudge: "Think about how many items each approach has to look at to find the answer." },
        { type: "text", md: [
          "### Build the index yourself",
          "This 'turn a slice into a lookup map' move is everywhere — de-duplication, joins, counting, caching. In PawWalk you'd build it once at the top of a request handler, then every `byID[id]` inside the loop is free.",
          "The literal `map[int]Booking{}` makes an empty map ready to write into. (`var m map[int]Booking` gives you a nil map you can *read* but not write — a classic Go gotcha. Always initialize with `{}` or `make`.)",
        ] },
        { type: "exercise", title: "Build a by-id index",
          prompt: [
            "Fill in `indexByID`. Create an empty `byID := map[int]Booking{}`, then range over `bookings` with `for _, b := range bookings` and store each one under its id: `byID[b.ID] = b`. Return `byID`.",
          ],
          starter: String.raw`package main

type Booking struct {
	ID  int
	Dog string
}

func indexByID(bookings []Booking) map[int]Booking {
	// your code here
}`,
          solution: String.raw`package main

type Booking struct {
	ID  int
	Dog string
}

func indexByID(bookings []Booking) map[int]Booking {
	byID := map[int]Booking{}
	for _, b := range bookings {
		byID[b.ID] = b
	}
	return byID
}`,
          checks: [
            { re: /byID:=map\[int\]Booking\{\}/, hint: "Start with an empty map literal: byID := map[int]Booking{}. Don't use var — a nil map can't be written to." },
            { re: /for _,b:=range bookings\{/, hint: "Range over the slice, ignoring the index: for _, b := range bookings {." },
            { re: /byID\[b\.ID\]=b/, hint: "Index the map by the booking's id and store the booking: byID[b.ID] = b." },
            { re: /return byID/, hint: "Hand back the finished index: return byID." },
          ],
          success: "That's the workhorse move: one O(n) pass to build the index, then O(1) lookups forever. It shows up in half of all 'array' interview problems." },
      ],
    },
    {
      id: "stacks-queues",
      title: "Stacks, Queues & Two Pointers",
      steps: [
        { type: "text", md: [
          "## A slice is already a stack and a queue",
          "You don't import a stack in Go — a slice is one. A **stack** is LIFO (last in, first out), like an undo history: the last thing you did is the first you undo.",
          "- **Push:** `stack = append(stack, x)` — O(1) amortized.",
          "- **Peek:** `stack[len(stack)-1]` — the top.",
          "- **Pop:** `stack = stack[:len(stack)-1]` — reslice to drop the last element, O(1).",
          "A **queue** is FIFO (first in, first out), like a job queue. Enqueue with `append`; dequeue from the front with `queue = queue[1:]`. (Reslicing the front is fine for interview-sized inputs; a production hot loop would use a ring buffer or `container/list` to avoid the underlying array growing forever.)",
        ] },
        { type: "code", title: "stack and queue with a slice",
          source: String.raw`func main() {
	// Stack (LIFO) — an undo history
	stack := []string{}
	stack = append(stack, "rename")
	stack = append(stack, "delete")
	top := stack[len(stack)-1]     // peek: "delete"
	stack = stack[:len(stack)-1]   // pop it off
	fmt.Println(top)               // delete

	// Queue (FIFO) — a job queue of booking ids
	queue := []int{}
	queue = append(queue, 12)
	queue = append(queue, 13)
	front := queue[0]              // peek the front
	queue = queue[1:]             // dequeue
	fmt.Println(front)             // 12
}`,
          caption: "append pushes; slice[:len-1] pops the tail (stack); slice[1:] drops the head (queue)." },
        { type: "text", md: [
          "### Interview classic: Valid Parentheses",
          "Given a string of brackets like `\"([]{})\"`, decide whether every opener has a matching closer in the right order. A stack is the perfect tool: push each opener; when you hit a closer, the top of the stack must be its matching opener, or it's invalid. At the very end the stack must be empty.",
          "Map each closer to its opener so the match is a single lookup.",
        ] },
        { type: "code", title: "valid parentheses",
          source: String.raw`func validParens(s string) bool {
	pairs := map[rune]rune{')': '(', ']': '[', '}': '{'}
	stack := []rune{}
	for _, ch := range s {
		if open, isCloser := pairs[ch]; isCloser {
			if len(stack) == 0 || stack[len(stack)-1] != open {
				return false
			}
			stack = stack[:len(stack)-1] // matched — pop the opener
		} else {
			stack = append(stack, ch) // an opener — push it
		}
	}
	return len(stack) == 0 // leftover openers = invalid
}`,
          caption: "The comma-ok lookup pairs[ch] tells you both the matching opener and whether ch was a closer at all." },
        { type: "quiz",
          q: "Why is a stack the right structure for matching nested brackets?",
          choices: [
            "The most recently opened bracket must be the next one closed — that's exactly LIFO",
            "A stack keeps the brackets sorted",
            "A stack lets you access any bracket by index in O(1)",
            "Stacks are the only structure that can hold characters",
          ],
          answer: 0,
          explain: "Nesting is last-opened-first-closed, which is the definition of a stack. Push openers, and each closer must match whatever is on top. O(n) time, O(n) space.",
          nudge: "When you close a bracket, which open bracket does it have to match — the oldest or the newest?" },
        { type: "text", md: [
          "## Two pointers: walk from both ends",
          "The **two-pointer** technique keeps one index at the start and one at the end and walks them toward each other. It turns a lot of `O(n^2)` brute forces into a single `O(n)` pass with `O(1)` extra space — reversing in place, testing a palindrome, or finding a pair that sums to a target in a *sorted* slice.",
          "Reversing a slice in place is the cleanest example: swap the ends, step both pointers inward, stop when they meet.",
        ] },
        { type: "exercise", title: "Reverse a slice in place",
          prompt: [
            "Fill in `reverse`. Use a two-pointer `for` loop that starts `i` at 0 and `j` at `len(nums)-1`, runs while `i < j`, and each step does `i, j = i+1, j-1`. Inside, swap the two elements with Go's tuple assignment: `nums[i], nums[j] = nums[j], nums[i]`.",
          ],
          starter: String.raw`package main

func reverse(nums []int) {
	// your code here
}`,
          solution: String.raw`package main

func reverse(nums []int) {
	for i, j := 0, len(nums)-1; i < j; i, j = i+1, j-1 {
		nums[i], nums[j] = nums[j], nums[i]
	}
}`,
          checks: [
            { re: /for i,j:=0,len\(nums\)-1;i<j;/, hint: "Set up two indices in the for header: for i, j := 0, len(nums)-1; i < j; …" },
            { re: /i,j=i\+1,j-1/, hint: "The post statement moves both pointers inward: i, j = i+1, j-1." },
            { re: /nums\[i\],nums\[j\]=nums\[j\],nums\[i\]/, hint: "Swap in one line — Go evaluates the right side first: nums[i], nums[j] = nums[j], nums[i]." },
          ],
          mustNot: [
            { re: /make\(/, hint: "Reverse in place — mutate nums directly, don't allocate a second slice with make." },
          ],
          success: "Two pointers plus Go's tuple swap: O(n) time, O(1) space, no temp variable. This header pattern is a reflex worth owning." },
      ],
    },
    {
      id: "linked-lists",
      title: "Linked Lists & Recursion",
      steps: [
        { type: "text", md: [
          "## Nodes joined by pointers",
          "A **linked list** is a chain of nodes. Each node holds a value and a pointer to the next node. The list itself is just a pointer to the first node (the *head*); the last node's `Next` is `nil`.",
          "In Go you model a node with a struct that points to itself: `type Node struct { Val int; Next *Node }`. That `*Node` is a pointer — a node doesn't *contain* the next node (that would be infinitely large), it *points* to it. Nodes can live anywhere in memory, stitched together by their `Next` pointers.",
        ] },
        { type: "code", title: "a Node and a walk",
          source: String.raw`type Node struct {
	Val  int
	Next *Node
}

func main() {
	// 1 -> 2 -> 3 -> nil
	head := &Node{1, &Node{2, &Node{3, nil}}}

	// Walk it: O(n)
	for n := head; n != nil; n = n.Next {
		fmt.Println(n.Val) // 1, 2, 3
	}
}`,
          caption: "&Node{...} makes a node and takes its address. You follow Next until you hit nil." },
        { type: "quiz",
          q: "What does a linked list give you that a Go slice doesn't?",
          choices: [
            "O(1) insert or remove at a node you already hold, with no shifting of other elements",
            "O(1) access to any index",
            "Better CPU cache locality",
            "Automatic sorting",
          ],
          answer: 0,
          explain: "Splicing a node in or out is just re-pointing a couple of Next fields. The trade-offs: no random access (reaching the 500th node walks 500 pointers, O(n)) and scattered memory hurts cache locality — so in practice a slice is often faster even when Big-O says otherwise.",
          nudge: "Think about what a slice has to do to insert in the middle vs. what a linked list has to do." },
        { type: "text", md: [
          "## Recursion: a function that calls itself",
          "A linked list is *self-similar*: the thing after the head is itself a (smaller) linked list. That makes recursion a natural fit. Every recursive function needs two things:",
          "- A **base case** that stops — for a linked list, `if n == nil { return 0 }`. Without it you recurse forever and blow the stack.",
          "- A **recursive case** that does a little work and calls itself on something *smaller*, moving toward the base case.",
          "> The canonical interview question is *reverse a linked list*. The iterative version walks a `prev`/`curr`/`next` trio, flipping each `Next` backward — O(n) time, O(1) space. Recursion is the warm-up that proves you understand the base case.",
        ] },
        { type: "code", title: "recursive sum + iterative reverse",
          source: String.raw`func sum(n *Node) int {
	if n == nil {
		return 0 // base case: empty list sums to 0
	}
	return n.Val + sum(n.Next) // work + recurse on the rest
}

func reverse(head *Node) *Node {
	var prev *Node
	for curr := head; curr != nil; {
		next := curr.Next // stash the rest
		curr.Next = prev  // flip the pointer backward
		prev = curr       // advance prev
		curr = next       // advance curr
	}
	return prev // prev ends on the old tail = new head
}`,
          caption: "sum recurses toward nil; reverse does the prev/curr/next dance every interviewer wants to see." },
        { type: "text", md: [
          "### Write it from scratch",
          "You'll define the node type and the recursive function together, so the whole shape lives in your fingers. Note the one-line struct form `type Node struct { Val int; Next *Node }` — fields separated by a semicolon on one line, exactly as valid as the multi-line version.",
        ] },
        { type: "exercise", title: "Recursive linked-list sum",
          prompt: [
            "Declare the node type `type Node struct { Val int; Next *Node }`. Then write `func sum(n *Node) int`: the base case `if n == nil` returns 0; otherwise return `n.Val + sum(n.Next)` — this node's value plus the sum of the rest.",
          ],
          starter: String.raw`package main

// your code here`,
          solution: String.raw`package main

type Node struct { Val int; Next *Node }

func sum(n *Node) int {
	if n == nil {
		return 0
	}
	return n.Val + sum(n.Next)
}`,
          checks: [
            { re: /type Node struct\{Val int;Next\*Node\}/, hint: "Declare the self-referential node — Next is a *Node pointer: type Node struct { Val int; Next *Node }." },
            { re: /if n==nil\{/, hint: "Every recursion needs a base case. The empty list is nil: if n == nil {." },
            { re: /return n\.Val\+sum\(n\.Next\)/, hint: "Recursive case: this value plus the sum of the rest — return n.Val + sum(n.Next)." },
          ],
          mustNot: [
            { re: /for /, hint: "Do it recursively here — no for loop. Let sum call itself on n.Next." },
          ],
          success: "Base case plus a call on something smaller — that's the whole recipe. The same shape reverses the list, counts nodes, or finds the middle." },
      ],
    },
    {
      id: "trees-graphs",
      title: "Trees & Graphs",
      steps: [
        { type: "text", md: [
          "## Trees: nodes with children",
          "A **tree** is a node with a value and pointers to child nodes. A **binary tree** gives each node at most two children, `Left` and `Right`: `type TreeNode struct { Val int; Left, Right *TreeNode }`. The top node is the *root*; nodes with no children are *leaves*.",
          "Trees are everywhere in backend work: a comment thread (replies under replies), a category hierarchy, a filesystem, a parsed JSON document. And like a linked list, a tree is self-similar — each child is the root of a smaller tree — so most tree code is recursive with a `nil` base case.",
        ] },
        { type: "code", title: "tree node + depth-first search",
          source: String.raw`type TreeNode struct {
	Val         int
	Left, Right *TreeNode
}

// DFS (pre-order): visit node, then dive left, then right.
func dfs(node *TreeNode) {
	if node == nil {
		return // base case: fell off the tree
	}
	fmt.Println(node.Val)
	dfs(node.Left)
	dfs(node.Right)
}`,
          caption: "nil is the base case that stops the recursion. Swap the order of the three lines and you get in-order or post-order." },
        { type: "text", md: [
          "## DFS vs. BFS: two ways to explore",
          "- **DFS (depth-first search)** goes as deep as it can down one branch before backtracking. It's natural with **recursion** (the call stack *is* your stack) or an explicit stack.",
          "- **BFS (breadth-first search)** explores in rings — all the immediate neighbors, then their neighbors. It uses a **queue**, and on an unweighted graph it finds the *shortest* path.",
          "The pattern to remember: **DFS = stack (or recursion), BFS = queue.** That single sentence answers a lot of interview questions.",
        ] },
        { type: "code", title: "BFS with a slice queue",
          source: String.raw`func bfs(root *TreeNode) []int {
	order := []int{}
	if root == nil {
		return order
	}
	queue := []*TreeNode{root}
	for len(queue) > 0 {
		node := queue[0]  // dequeue the front
		queue = queue[1:]
		order = append(order, node.Val)
		if node.Left != nil {
			queue = append(queue, node.Left)
		}
		if node.Right != nil {
			queue = append(queue, node.Right)
		}
	}
	return order // level by level, top to bottom
}`,
          caption: "A queue visits the tree level by level; a recursive DFS would plunge down one side first." },
        { type: "quiz",
          q: "You're traversing a graph (not a tree) and want to avoid looping forever. What must you track?",
          choices: [
            "A visited set — graphs can have cycles, so without it you'd revisit nodes endlessly",
            "The depth of every node",
            "Nothing — traversal always terminates",
            "The total number of edges",
          ],
          answer: 0,
          explain: "A tree has no cycles, so recursion terminates on its own. A graph can loop back on itself (A points to B, B points to A), so you keep a visited set — usually a map[int]bool — and skip any node already in it.",
          nudge: "What happens if two nodes point at each other and you never record where you've already been?" },
        { type: "text", md: [
          "## Graphs: nodes connected by edges",
          "A **graph** is more general than a tree: no single root, and cycles are allowed. The go-to model is an **adjacency list** — a `map[int][]int` from each node to the slice of its neighbors. In PawWalk, picture neighborhoods (by id) connected by walkable routes: `graph[1]` is the list of neighborhood ids you can reach on foot from node 1.",
          "To walk a graph with DFS you carry a `visited` map alongside the recursion. Mark the node visited *first* (`visited[n] = true`), then recurse only into neighbors you haven't seen. That check-and-mark is what turns an infinite loop into an O(nodes + edges) traversal.",
        ] },
        { type: "exercise", title: "Recursive DFS over a graph",
          prompt: [
            "Fill in `dfs`. First mark the current node seen: `visited[n] = true`. Then range over its neighbors with `for _, nbr := range graph[n]`, and for each one that hasn't been visited (`if !visited[nbr]`) recurse: `dfs(graph, nbr, visited)`.",
          ],
          starter: String.raw`package main

func dfs(graph map[int][]int, n int, visited map[int]bool) {
	// your code here
}`,
          solution: String.raw`package main

func dfs(graph map[int][]int, n int, visited map[int]bool) {
	visited[n] = true
	for _, nbr := range graph[n] {
		if !visited[nbr] {
			dfs(graph, nbr, visited)
		}
	}
}`,
          checks: [
            { re: /visited\[n\]=true/, hint: "Mark this node seen before you recurse: visited[n] = true." },
            { re: /for _,nbr:=range graph\[n\]\{/, hint: "Range over this node's neighbor slice: for _, nbr := range graph[n] {." },
            { re: /if!visited\[nbr\]\{/, hint: "Only descend into unseen neighbors. A missing map key reads as false: if !visited[nbr] {." },
            { re: /dfs\(graph,nbr,visited\)/, hint: "Recurse into the neighbor, passing the same visited map along: dfs(graph, nbr, visited)." },
          ],
          success: "Mark-then-recurse-into-unseen-neighbors is the heart of every graph traversal. Swap the recursion for an explicit queue and you have BFS. That's the interview toolkit — you're ready." },
      ],
    },
  ],
});
