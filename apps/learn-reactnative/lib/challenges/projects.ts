import type { Challenge } from '../challenges'

export const projectChallenges: Challenge[] = [
  // ─── Goncy Live Projects adapted for RN (126–135) ───
  {
    id: 126,
    title: 'User Directory with FlatList',
    category: 'React Native',
    difficulty: 'medium',
    timeEstimate: '15 min',
    prompt: `Build a user directory screen with a FlatList. Requirements:
1. Show a list of 20 users (name, email, avatar)
2. Search bar filters by name (case-insensitive)
3. Loading state while "fetching"
4. Show "X results of Y users" header`,
    starterCode: `const MOCK_USERS = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: \`User \${i + 1}\`,
  email: \`user\${i + 1}@example.com\`,
}))

export default function UserDirectory() {
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  // Your code here
  return null
}`,
    solution: `export default function UserDirectory() {
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(t)
  }, [])
  const filtered = MOCK_USERS.filter(u => u.name.toLowerCase().includes(search.toLowerCase()))
  if (loading) return <Text>Loading users...</Text>
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <TextInput placeholder="Search..." value={search} onChangeText={setSearch} style={{ borderWidth: 1, padding: 8, borderRadius: 4, marginBottom: 12 }} />
      <Text style={{ marginBottom: 8, color: '#666' }}>{filtered.length} of {MOCK_USERS.length} users</Text>
      <FlatList data={filtered} keyExtractor={u => String(u.id)} renderItem={({ item }) => (
        <View style={{ padding: 12, borderBottomWidth: 1, borderColor: '#eee' }}>
          <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
          <Text style={{ color: '#666' }}>{item.email}</Text>
        </View>
      )} />
    </View>
  )
}`,
    explanation: `This is the canonical "fetch + filter + list" screen, and the shipping concern it exercises is **state shape**: the only client state is the search string and the loading flag. The filtered list is *derived* in render — \`MOCK_USERS.filter(...)\` — never stored. One source of truth means there is nothing to keep in sync.

Mechanics worth defending:
- **Controlled TextInput** (\`value\` + \`onChangeText\`): the search string lives in React state, so the header count, the filter, and the input can never disagree.
- **FlatList, not map-in-ScrollView**: FlatList virtualizes — it mounts only a window of rows around the viewport and replaces the rest with correctly-sized blank space. \`keyExtractor\` returning the stable \`id\` is the identity contract that lets that window slide without remounting rows.
- **Loading as an early return** keeps the happy-path JSX flat instead of nesting ternaries.
- The effect returns \`clearTimeout\` — every subscription or timer an effect creates, its cleanup destroys.

Trade-off: filtering on every render is fine for 20 items; past a few hundred you wrap it in \`useMemo\` keyed on \`search\` — you memoize the derivation, you still don't store it.

**Red flag:** mirroring the filtered array into state with a \`useEffect\` that watches \`search\`. That's two renders per keystroke, a stale-sync bug waiting to happen, and the classic junior tell of "state for things that are computable."

**Say it:** "Search text is the only state — the filtered list is derived in render, and I'd memoize it before I'd ever store it."`,
    tests: [
      { it: 'gates the UI on a loading flag', check: ['useState(true)'] },
      { it: 'controls the search input with state', check: ["useState('')", 'onChangeText'] },
      { it: 'filters case-insensitively', check: ['toLowerCase()'] },
      { it: 'uses a virtualized list with stable keys', check: ['FlatList', 'keyExtractor'] },
      { it: 'cleans up the fake-fetch timer', check: ['clearTimeout'] },
    ],
    hints: ['useEffect with setTimeout for loading', 'FlatList + keyExtractor + renderItem', 'Case-insensitive filter'],
  },
  {
    id: 127,
    title: 'Product Search with Filters',
    category: 'React Native',
    difficulty: 'medium',
    timeEstimate: '15 min',
    prompt: `Build a product search screen. Requirements:
1. Render products from a mock list (name, price, category)
2. Search by name (case-insensitive, debounced 300ms)
3. Sort by: name A-Z, name Z-A, price low-high, price high-low
4. Mark items with price <= 100 as "on sale"`,
    starterCode: `const PRODUCTS = [
  { id: 1, name: 'Laptop', price: 999, category: 'Electronics' },
  { id: 2, name: 'Mouse', price: 25, category: 'Electronics' },
  { id: 3, name: 'Book', price: 15, category: 'Books' },
  { id: 4, name: 'Headphones', price: 80, category: 'Electronics' },
  { id: 5, name: 'Notebook', price: 5, category: 'Office' },
  { id: 6, name: 'Desk Lamp', price: 45, category: 'Office' },
  { id: 7, name: 'T-Shirt', price: 20, category: 'Clothing' },
  { id: 8, name: 'Sneakers', price: 120, category: 'Clothing' },
]

export default function ProductSearch() {
  // Your code here
  return null
}`,
    solution: `export default function ProductSearch() {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('name-asc')
  const [debounced, setDebounced] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300)
    return () => clearTimeout(t)
  }, [query])
  const filtered = PRODUCTS
    .filter(p => p.name.toLowerCase().includes(debounced.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'name-asc') return a.name.localeCompare(b.name)
      if (sort === 'name-desc') return b.name.localeCompare(a.name)
      if (sort === 'price-asc') return a.price - b.price
      return b.price - a.price
    })
  return (
    <View style={{ padding: 16 }}>
      <TextInput value={query} onChangeText={setQuery} placeholder="Search..." style={{ borderWidth: 1, padding: 8, borderRadius: 4, marginBottom: 12 }} />
      <Picker selectedValue={sort} onValueChange={setSort}>
        <Picker.Item label="Name A-Z" value="name-asc" />
        <Picker.Item label="Name Z-A" value="name-desc" />
        <Picker.Item label="Price $" value="price-asc" />
        <Picker.Item label="Price $$" value="price-desc" />
      </Picker>
      <FlatList data={filtered} keyExtractor={p => String(p.id)} renderItem={({ item }) => (
        <View style={{ padding: 12, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontWeight: item.price <= 100 ? 'bold' : 'normal' }}>{item.name} {item.price <= 100 ? '🔥' : ''}</Text>
          <Text>\${item.price}</Text>
        </View>
      )} />
    </View>
  )
}`,
    explanation: `The point of this screen is the **debounce done the React way**: an effect keyed on \`query\` that schedules a \`setTimeout\` and returns \`clearTimeout\` as cleanup. Every keystroke re-runs the effect, cancelling the previous timer — the cancellation *is* the debounce. No lodash, no ref juggling.

The two-state split matters: \`query\` drives the controlled TextInput so typing echoes instantly; \`debounced\` drives the filter so the expensive work runs 300ms after the user pauses. Debounce the *consumer* of the value, never the controlled value itself — a debounced \`value\` prop makes the keyboard feel broken.

Filter-then-sort is deliberate ordering: \`.filter()\` returns a fresh array, so the subsequent \`.sort()\` — which sorts **in place** — mutates only the copy, never \`PRODUCTS\`. Sort straight on the source array and the "original" order is gone for every later render. The comparator is a flat if-chain over the four sort keys with \`localeCompare\` for strings and subtraction for numbers; a lookup table of comparators is the refactor when the options grow.

**Red flag:** storing the filtered/sorted result in state via another effect. Query, sort key, and source list fully determine the output — derive it in render, \`useMemo\` it if the catalog gets big.

**Say it:** "I debounce with an effect whose cleanup cancels the previous timer — the raw query stays controlled for instant echo, and the filtered list is derived, never stored."`,
    tests: [
      { it: 'debounces with a cancelled timer', check: ['setTimeout', 'clearTimeout'] },
      { it: 'keeps the input controlled while debouncing separately', check: ['onChangeText', 'useState('] },
      { it: 'sorts strings with localeCompare', check: ['localeCompare'] },
      { it: 'filters case-insensitively', check: ['toLowerCase()'] },
      { it: 'renders through a virtualized list', check: ['FlatList', 'keyExtractor'] },
    ],
    hints: ['useEffect + setTimeout for debounce', 'Array.sort with compare function', 'Conditional styling for sale items'],
  },
  {
    id: 128,
    title: 'Grocery List (CRUD with persistence)',
    category: 'React Native',
    difficulty: 'medium',
    timeEstimate: '15 min',
    prompt: `Build a grocery list app. Requirements:
1. TextInput to add items + "Add" button
2. Show list of items with toggle (strikethrough) and delete
3. Validate: prevent empty items
4. Simulate 1-second load delay on startup
5. Auto-focus the input once loading finishes`,
    starterCode: `export default function GroceryList() {
  const [items, setItems] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  // Your code here
  return null
}`,
    solution: `export default function GroceryList() {
  const [items, setItems] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const inputRef = useRef(null)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(t)
  }, [])
  useEffect(() => {
    if (!loading) inputRef.current?.focus()
  }, [loading])
  const addItem = () => {
    if (!input.trim()) return
    setItems(prev => [...prev, { id: Date.now(), text: input.trim(), done: false }])
    setInput('')
  }
  const toggleItem = (id) => setItems(prev => prev.map(i => i.id === id ? { ...i, done: !i.done } : i))
  const deleteItem = (id) => setItems(prev => prev.filter(i => i.id !== id))
  if (loading) return <Text>Loading...</Text>
  return (
    <View style={{ padding: 16 }}>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        <TextInput ref={inputRef} value={input} onChangeText={setInput} placeholder="Add item..." style={{ flex: 1, borderWidth: 1, padding: 8, borderRadius: 4 }} />
        <Button title="Add" onPress={addItem} />
      </View>
      <FlatList data={items} keyExtractor={i => String(i.id)} renderItem={({ item }) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1 }}>
          <Text onPress={() => toggleItem(item.id)} style={{ textDecorationLine: item.done ? 'line-through' : 'none' }}>{item.text}</Text>
          <Button title="X" onPress={() => deleteItem(item.id)} />
        </View>
      )} />
    </View>
  )
}`,
    explanation: `CRUD-on-a-list is the smallest app that forces all three immutable update shapes, and interviewers watch for exactly those: **add** is spread-concat (\`[...prev, item]\`), **toggle** is map-with-spread (copy the one changed object, keep every other reference), **delete** is \`filter\`. All three go through *functional updates* (\`setItems(prev => ...)\`), so rapid taps can't clobber each other by closing over stale state.

Two boundary details carry the seniority signal:
- **Validation at the mutation point**: \`if (!input.trim()) return\` inside \`addItem\` means no caller can insert whitespace items — the invariant lives with the setter, not scattered across the UI.
- **\`Date.now()\` as the id**, consumed by \`keyExtractor\`. With delete in the feature set, index-as-key is actively broken: remove row 2 and every row below shifts its key, so React re-associates row state (the strikethrough, in-flight animations) with the wrong grocery item.

The focus requirement is the imperative escape hatch done correctly: the ref can't be focused on mount because during loading the TextInput isn't rendered at all — so a second effect keyed on \`loading\` focuses it once the input actually exists.

**Red flag:** \`items.push(...)\` followed by \`setItems(items)\`. Same array reference — React bails out of the re-render and the UI silently stops updating. Mutation bugs in RN look like "the list doesn't refresh," not like errors.

**Say it:** "Add, toggle, delete are spread, map, filter through functional setState — new references on every change, stable ids so delete doesn't shuffle row identity."`,
    tests: [
      { it: 'starts with loading state', check: ['useState(true)'] },
      { it: 'manages items with useState', check: ['useState([])'] },
      { it: 'focuses the input imperatively via a ref', check: ['useRef(', '.focus()'] },
      { it: 'rejects empty items at the boundary', check: ['.trim()'] },
      { it: 'updates immutably with functional setState', check: ['setItems(prev =>', '.filter(', '.map('] },
    ],
    hints: ['useRef for input focus', 'trim() to prevent empty adds', 'Toggle maps with spread', 'Filter for delete'],
  },
  {
    id: 129,
    title: 'Pokemon Store (cart with limits)',
    category: 'React Native',
    difficulty: 'medium',
    timeEstimate: '15 min',
    prompt: `Build a Pokemon store with a cart. Requirements:
1. Show list of Pokemon with name and price
2. Cart floating button showing item count
3. Max 3 items per cart
4. Show total price on cart button
5. Cap cart total at $10`,
    starterCode: `const POKEMON = [
  { id: 1, name: 'Pikachu', price: 2 },
  { id: 2, name: 'Charmander', price: 3 },
  { id: 3, name: 'Bulbasaur', price: 4 },
  { id: 4, name: 'Squirtle', price: 1 },
  { id: 5, name: 'Eevee', price: 5 },
]

export default function PokemonStore() {
  const [cart, setCart] = useState([])
  // Your code here
  return null
}`,
    solution: `export default function PokemonStore() {
  const [cart, setCart] = useState([])
  const addToCart = (p) => {
    if (cart.length >= 3) return
    const total = cart.reduce((s, i) => s + i.price, 0)
    if (total + p.price > 10) return
    setCart(prev => [...prev, p])
  }
  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id))
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList data={POKEMON} keyExtractor={p => String(p.id)} renderItem={({ item }) => (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottomWidth: 1 }}>
          <View><Text style={{ fontWeight: 'bold' }}>{item.name}</Text><Text>\${item.price}</Text></View>
          <Button title="Add" onPress={() => addToCart(item)} />
        </View>
      )} />
      {cart.length > 0 && (
        <View style={{ position: 'absolute', bottom: 20, right: 20, backgroundColor: 'blue', padding: 12, borderRadius: 24 }}>
          <Text style={{ color: 'white' }}>{cart.length} items - \${cart.reduce((s, i) => s + i.price, 0)}</Text>
        </View>
      )}
    </View>
  )
}`,
    explanation: `This mini-project is about **enforcing business invariants at the single mutation point**. "Max 3 items" and "cap at $10" are checked inside \`addToCart\`, before \`setCart\` fires — so every Add button in the app goes through the same gate and the cart *cannot* enter an invalid state. Guards that live in the UI ("disable the button when...") are presentation; guards that live in the mutator are correctness. You usually want both, but only one of them is load-bearing.

The other deliberate choice: **total is derived**, computed with \`reduce\` from the cart array at render time, not tracked as its own \`useState\`. Two states describing one fact will eventually disagree — someone adds a remove path and forgets to subtract. One state, one \`reduce\`, zero drift. If the derivation ever got expensive, the fix is \`useMemo\`, still not a second state.

The floating cart button is the standard RN overlay pattern: \`position: 'absolute'\` with bottom/right offsets inside a \`flex: 1\` container, conditionally rendered with \`cart.length > 0 &&\` so an empty cart shows nothing.

**Red flag:** validating the limits in the button's \`onPress\` in one screen, then adding a second entry point (deep link, "buy again") that calls \`setCart\` directly. Invariants scattered across callers are invariants you no longer have.

**Say it:** "The cart's rules live in the mutator, not the buttons — and the total is a reduce over the cart, because two states for one fact always drift."`,
    tests: [
      { it: 'initializes cart as empty array', check: ['useState([])'] },
      { it: 'enforces both limits before mutating', check: ['cart.length >= 3', '> 10'] },
      { it: 'derives total with reduce instead of storing it', check: ['.reduce('] },
      { it: 'renders the catalog in a FlatList with stable keys', check: ['FlatList', 'keyExtractor'] },
      { it: 'floats the cart button with absolute positioning', check: ["position: 'absolute'"] },
    ],
    hints: ['Check cart.length >= 3 to enforce limit', 'reduce for total price', 'Position absolute for floating button'],
  },
  {
    id: 130,
    title: 'Shopping Cart with Context',
    category: 'React Native',
    difficulty: 'medium',
    timeEstimate: '15 min',
    prompt: `Create a shopping cart using React Context. Requirements:
1. CartContext with addItem, removeItem, updateQuantity, clearCart
2. Each item has id, name, price, quantity
3. Display cart total (price * quantity summed)
4. +/- quantity controls that can remove item if qty reaches 0`,
    starterCode: `// Create CartContext, CartProvider, and useCart hook
const CartContext = createContext()

function CartProvider({ children }) {
  // Your code here
  return <CartContext.Provider value={...}>{children}</CartContext.Provider>
}

function useCart() {
  // Your code here
}`,
    solution: `const CartContext = createContext(null)

function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const addItem = (product) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { ...product, quantity: 1 }]
    })
  }
  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id))
  const updateQuantity = (id, delta) => setItems(prev => prev.map(i => {
    if (i.id !== id) return i
    const qty = i.quantity + delta
    return qty <= 0 ? null : { ...i, quantity: qty }
  }).filter(Boolean))
  const clearCart = () => setItems([])
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const value = { items, total, addItem, removeItem, updateQuantity, clearCart }
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}`,
    explanation: `A cart is the textbook case for Context: it's read from the catalog, the cart screen, and the checkout badge — prop-drilling it three navigator levels deep is the alternative, and that's worse. The shipping concern here is the **module boundary**: consumers get \`useCart()\` and a fixed API (\`addItem\`, \`removeItem\`, \`updateQuantity\`, \`clearCart\`); they never see \`setItems\`. Every invariant lives inside the provider.

Mechanics worth naming:
- **addItem is an upsert**: find the existing line, increment its quantity with map-and-spread; otherwise append with \`quantity: 1\`. Duplicate line-items for the same product is the bug this prevents.
- **updateQuantity maps to \`null\` then \`filter(Boolean)\`** — one pass that both updates and evicts when quantity hits zero, without mutating.
- **The guard hook**: \`useCart\` throws when called outside the provider. \`createContext(null)\` plus that throw turns a silent \`undefined is not a function\` three components later into an immediate, named failure.
- **\`total\` is derived** from items with \`reduce\`, never stored.

Trade-off to volunteer: \`value\` is a fresh object every provider render, so *all* consumers re-render on *any* cart change. Correct first; when a consumer gets expensive, wrap \`value\` in \`useMemo\` and, at scale, split state and actions into two contexts.

**Red flag:** putting \`setItems\` itself in the context value. The moment consumers can write raw state, the upsert and the qty-zero eviction stop being guarantees.

**Say it:** "The provider owns the invariants and exposes verbs, not setters — and useCart throws outside the provider so misuse fails loudly at the source."`,
    tests: [
      { it: 'wires Context with a provider and a guarded hook', check: ['createContext', 'CartContext.Provider', 'useContext('] },
      { it: 'manages items with useState', check: ['useState([])'] },
      { it: 'evicts zero-quantity lines in one immutable pass', check: ['filter(Boolean)'] },
      { it: 'derives the total with reduce', check: ['.reduce('] },
      { it: 'fails loudly outside the provider', check: ['throw new Error'] },
    ],
    hints: ['createContext + Provider pattern', 'Check existing item to increment quantity', 'filter(Boolean) to remove nulls'],
  },
  {
    id: 131,
    title: 'Wordle (word guessing game)',
    category: 'React Native',
    difficulty: 'hard',
    timeEstimate: '20 min',
    prompt: `Implement the letter-scoring logic for a Wordle game.

Write function \`checkGuess(guess)\` that takes a 5-letter string and returns an array
of { letter, color } objects:

- Green (#4CAF50) for correct letter in correct position
- Yellow (#FFC107) for correct letter in wrong position
- Gray (#9E9E9E) for incorrect letter

The target word is "REACT". Max 6 attempts.`,
    starterCode: `const TARGET = 'REACT'

function checkGuess(guess) {
  // Return [{ letter, color }] for each position
  return []
}`,
    solution: `const TARGET = 'REACT'

function checkGuess(guess) {
  return guess.split('').map((letter, i) => {
    if (TARGET[i] === letter) return { letter, color: '#4CAF50' }
    if (TARGET.includes(letter)) return { letter, color: '#FFC107' }
    return { letter, color: '#9E9E9E' }
  })
}`,
    explanation: `The design lesson is **game-state purity**: \`checkGuess\` is string in, data out — no setState, no rendering, no globals mutated. The component's job shrinks to mapping the returned array onto colored tiles, and the scoring logic becomes testable with plain assertions, no renderer required. Whenever an interview project contains rules (scoring, win detection, validation), extracting them as pure functions is the first structural move.

The algorithm is a two-tier check per position, ordered by precedence: exact match at index \`i\` wins green *before* the membership check can claim yellow — flip those branches and a correctly-placed letter turns yellow. \`map\` over \`split('')\` keeps it a single pass returning a same-length array, which is exactly the shape the tile row wants.

The trade-off to volunteer unprompted: **duplicate letters**. \`TARGET.includes(letter)\` marks *every* stray occurrence yellow — guess "EEEEE" against REACT and you get one green plus four yellows, where real Wordle yellows only as many copies as remain unmatched. The correct version is two passes with a letter-count map: consume greens first, then spend remaining counts on yellows. Naming that limitation, and its fix, is worth more than silently shipping either version.

**Red flag:** computing colors inline in JSX per tile. The logic becomes untestable, re-runs per tile per render, and duplicates the precedence rule in view code.

**Say it:** "Scoring is a pure function the UI just renders — and I'd flag that includes() over-yellows duplicate letters; the fix is a count-based two-pass."`,
    tests: [
      { it: 'correct letter in position is green', run: 'checkGuess("Rzzzz")[0].color', expected: '#4CAF50' },
      { it: 'wrong position letter is yellow', run: 'checkGuess("zRzzz")[1].color', expected: '#FFC107' },
      { it: 'incorrect letter is gray', run: 'checkGuess("zzzzz")[0].color', expected: '#9E9E9E' },
      { it: 'a perfect guess is green across the board', run: 'checkGuess("REACT").every(c => c.color === "#4CAF50")', expected: true },
      { it: 'exact match takes precedence over membership', run: 'checkGuess("TREAC").map(c => c.color === "#FFC107").every(Boolean)', expected: true },
      { it: 'returns 5 results with letters preserved', run: 'checkGuess("REACT").map(c => c.letter).join("")', expected: 'REACT' },
    ],
    hints: ['Compare TARGET[i] for exact match (green)', 'TARGET.includes(letter) for wrong position (yellow)', 'Otherwise gray'],
    preview: {
      component: 'wordle',
      extract: ['checkGuess'],
    },
  },
  {
    id: 132,
    title: 'Minesweeper Grid (Booscaminas)',
    category: 'React Native',
    difficulty: 'hard',
    timeEstimate: '20 min',
    prompt: `Implement the core logic functions for Minesweeper.

Write three pure functions:
1. \`createBoard()\` — returns an 8x8 board with 10 bombs placed randomly. Each cell: { bomb: boolean, adjacent: number, revealed: boolean }
2. \`revealCell(board, r, c)\` — returns a NEW board with cell (r,c) revealed. If adjacent=0, auto-reveal neighbors (flood fill). Bomb cells are never revealed by this function — the UI detects the bomb tap and handles game over.
3. \`checkWin(board)\` — returns true if all non-bomb cells are revealed.`,
    starterCode: `const GRID_SIZE = 8
const BOMB_COUNT = 10

function createBoard() {
  // Return GRID_SIZE x GRID_SIZE board with BOMB_COUNT bombs
  return []
}

function revealCell(board, r, c) {
  // Return new board with cell revealed, flood-fill if adjacent=0
  return board
}

function checkWin(board) {
  // True if all non-bomb cells revealed
  return false
}`,
    solution: `const GRID_SIZE = 8
const BOMB_COUNT = 10

function createBoard() {
  const board = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({ bomb: false, adjacent: 0, revealed: false }))
  )
  let placed = 0
  while (placed < BOMB_COUNT) {
    const r = Math.floor(Math.random() * GRID_SIZE)
    const c = Math.floor(Math.random() * GRID_SIZE)
    if (!board[r][c].bomb) { board[r][c] = { ...board[r][c], bomb: true }; placed++ }
  }
  for (let r = 0; r < GRID_SIZE; r++) for (let c = 0; c < GRID_SIZE; c++) {
    if (board[r][c].bomb) continue
    let count = 0
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr, nc = c + dc
      if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && board[nr][nc].bomb) count++
    }
    board[r][c] = { ...board[r][c], adjacent: count }
  }
  return board
}

function revealCell(board, r, c) {
  const rows = board.length
  const cols = board[0].length
  const newBoard = board.map(row => row.map(cell => ({ ...cell })))
  const reveal = (rr, cc) => {
    if (rr < 0 || rr >= rows || cc < 0 || cc >= cols) return
    if (newBoard[rr][cc].revealed || newBoard[rr][cc].bomb) return
    newBoard[rr][cc].revealed = true
    if (newBoard[rr][cc].adjacent === 0) {
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) reveal(rr + dr, cc + dc)
    }
  }
  reveal(r, c)
  return newBoard
}

function checkWin(board) {
  return board.flat().every(cell => cell.revealed || cell.bomb)
}`,
    explanation: `Minesweeper is the strongest test of **quarantining impurity**. \`Math.random()\` lives only in \`createBoard\`, a factory called once per game; \`revealCell\` and \`checkWin\` are deterministic board-in/board-out functions. That split is what makes the game logic unit-testable and what makes React happy: the component holds the board in state and every tap is \`setBoard(revealCell(board, r, c))\`.

The subtle parts:
- **Deep-copy before flood fill.** \`revealCell\` clones every row *and* every cell object up front, then lets the recursive \`reveal\` mutate the clone freely. Local mutation of a fresh copy is a legitimate performance pattern — purity is about the function's contract (inputs untouched, new output), not about never using assignment internally.
- **Flood-fill termination**: the recursion stops at bounds, at already-revealed cells, and at bombs. The revealed-check is the visited-set — without it, two adjacent zero cells recurse into each other forever.
- **Bounds come from \`board.length\`, not the constant**, so the function works on any board size — which is also what makes it testable with tiny hand-built boards.
- **\`checkWin\` is a derived predicate** — \`flat().every(revealed || bomb)\` — never a flag you maintain by hand.

**Red flag:** mutating the board held in state and calling \`setBoard(board)\`. Same reference — React skips the re-render and taps "stop working." Every reveal must return a new board.

**Say it:** "Randomness is quarantined in the factory; reveal is board-in, new-board-out with the revealed flag doubling as the flood-fill visited set."`,
    tests: [
      { it: 'creates an 8x8 board with nothing revealed', run: '(() => { const b = createBoard(); return [b.length, b.every(r => r.length === 8), b.flat().every(c => !c.revealed)] })()', expected: [8, true, true] },
      { it: 'places exactly 10 bombs', run: 'createBoard().flat().filter(c => c.bomb).length', expected: 10 },
      { it: 'reveals the tapped cell without mutating the input board', run: '(() => { const b = [[{ bomb: false, adjacent: 1, revealed: false }]]; const nb = revealCell(b, 0, 0); return [nb[0][0].revealed, b[0][0].revealed] })()', expected: [true, false] },
      { it: 'flood-fills an all-zero region', run: '(() => { const z = () => ({ bomb: false, adjacent: 0, revealed: false }); const nb = revealCell([[z(), z()], [z(), z()]], 0, 0); return nb.flat().every(c => c.revealed) })()', expected: true },
      { it: 'win ignores unrevealed bombs', run: 'checkWin([[{ revealed: true, bomb: false, adjacent: 1 }, { revealed: false, bomb: true, adjacent: 0 }]])', expected: true },
      { it: 'no win while a safe cell is hidden', run: 'checkWin([[{ revealed: false, bomb: false, adjacent: 0 }]])', expected: false },
    ],
    hints: ['Random bomb placement without duplicates', 'Count adjacent with nested loops', 'Flood fill recursion for empty cells'],
    preview: {
      component: 'minesweeper',
      extract: ['createBoard', 'revealCell', 'checkWin'],
    },
  },
  {
    id: 133,
    title: 'Tic-Tac-Toe (Ta-Te-Ti)',
    category: 'React Native',
    difficulty: 'medium',
    timeEstimate: '15 min',
    prompt: `Implement the win-detection logic for Tic-Tac-Toe.

Write a function \`checkWinner(board)\` that takes a flat array of 9 cells
(X, O, or null) and returns "X", "O", or null.
Winning combinations: 3 in a row, column, or diagonal.`,
    starterCode: `const WINNERS = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6],
]

function checkWinner(board) {
  // Return 'X', 'O', or null
  return null
}`,
    solution: `const WINNERS = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6],
]

function checkWinner(board) {
  for (const [a, b, c] of WINNERS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a]
  }
  return null
}`,
    explanation: `The lesson here is **rules as data**. The eight winning lines are a lookup table, and \`checkWinner\` shrinks to "for each line, are all three cells the same non-null mark?" Compare that to the loop-free alternative — nested row/column/diagonal scans — which is more code, harder to audit, and hides an off-by-one in every direction. When a rule set is small and finite, enumerating it beats computing it.

Two details do the real work:
- **\`board[a] &&\` is the null guard.** Without it, a line of three empty cells satisfies \`null === null === null\` and the function declares \`null\` the "winner" — which is falsy, so the bug hides until someone checks \`winner !== null\`. Truthiness guards that happen to work are still worth calling out explicitly.
- **Flat array of 9, not a 3x3 matrix.** The win table indexes directly into it, \`board[i]\` maps one-to-one onto the 9 pressables, and updates are a single \`map\` — \`board.map((cell, idx) => idx === i ? player : cell)\` — keeping every move an immutable copy the component can \`setState\`.

The natural follow-up is generalizing to N-in-a-row on an M×M board, where the table explodes and you *do* switch to directional scanning from the last move. Knowing where the table approach stops scaling is part of the answer.

**Red flag:** win detection inside the tap handler mixed with setState. Derive the winner from the board (\`checkWinner(board)\`) — stored winner flags desync the moment undo or replay arrives.

**Say it:** "Win lines are data, the check is one loop with a null guard, and the winner is always derived from the board — never stored beside it."`,
    tests: [
      { it: 'X wins with top row', run: 'checkWinner(["X","X","X",null,null,null,null,null,null])', expected: 'X' },
      { it: 'O wins with diagonal', run: 'checkWinner(["O","X","X",null,"O","X",null,null,"O"])', expected: 'O' },
      { it: 'O wins with left column', run: 'checkWinner(["O",null,"X","O","X",null,"O",null,"X"])', expected: 'O' },
      { it: 'empty board returns null (no null-line false positive)', run: 'checkWinner(Array(9).fill(null))', expected: null },
      { it: 'full-board draw returns null', run: 'checkWinner(["X","O","X","X","O","O","O","X","X"])', expected: null },
    ],
    hints: ['Iterate over WINNERS combinations', 'Check board[a] && board[a] === board[b] === board[c]', 'Return the winner or null'],
    preview: {
      component: 'tic-tac-toe',
      extract: ['checkWinner'],
    },
  },
  {
    id: 134,
    title: 'Symmetrical Grid (Grilla Simétrica)',
    category: 'React Native',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Create a horizontally-scrolling balanced masonry grid using Flexbox.
Images should be added dynamically, creating new columns not rows.
No empty vertical spaces between items.`,
    starterCode: `export default function SymmetricalGrid() {
  const [items, setItems] = useState([{h:100},{h:200},{h:150},{h:180},{h:120}])
  // Your code here
  return null
}`,
    solution: `export default function SymmetricalGrid() {
  const [items, setItems] = useState([{ h: 100 }, { h: 200 }, { h: 150 }, { h: 180 }, { h: 120 }])
  const addItem = () => setItems(prev => [...prev, { h: 100 + Math.random() * 150 }])
  const columns = items.reduce((cols, item, i) => {
    const colIdx = i % 3
    if (!cols[colIdx]) cols[colIdx] = []
    cols[colIdx].push(item)
    return cols
  }, [])
  return (
    <View>
      <ScrollView horizontal>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {columns.map((col, i) => (
            <View key={i} style={{ gap: 4 }}>
              {col.map((item, j) => <View key={j} style={{ width: 100, height: item.h, backgroundColor: '#ccc', borderRadius: 4 }} />)}
            </View>
          ))}
        </View>
      </ScrollView>
      <Button title="Add" onPress={addItem} />
    </View>
  )
}`,
    explanation: `The insight being tested: React Native has no CSS \`columns\` or grid, so masonry is a **data transform, not a style trick**. You reshape the flat \`items\` array into an array of column arrays — here \`reduce\` dealing item \`i\` into column \`i % 3\` — and then the layout is trivial: a horizontal \`ScrollView\` wrapping a \`flexDirection: 'row'\` container, each column a plain vertical View stack. Because each column stacks its own items with no absolute positioning, there are no vertical gaps by construction.

Trade-offs a senior states up front:
- **Round-robin (\`i % 3\`) balances item *count*, not height.** Three tall images can land in one column. True masonry is a greedy variant of the same reduce: push each item into whichever column currently has the smallest summed height. Same structure, one extra comparison — worth mentioning even if you ship round-robin in the timebox.
- **The transform runs in render.** For dozens of tiles that's free; wrap it in \`useMemo\` keyed on \`items\` before reaching for anything heavier.
- **Index keys here are a nuance, not an outright sin**: columns are fixed positional slots, so \`key={i}\` on columns is stable. Item keys within a column *do* shift as new items redistribute — with real image data you'd key on the image id.

**Red flag:** absolute-positioning every tile with hand-computed offsets. You've reimplemented the layout engine, badly, and rotation/resize breaks it.

**Say it:** "Masonry in RN is a reduce that reshapes items into columns — flexbox does the rest, and swapping round-robin for shortest-column is one comparison away."`,
    tests: [
      { it: 'keeps items in component state', check: ['useState('] },
      { it: 'reshapes the flat list into columns with reduce', check: ['.reduce(', '% 3'] },
      { it: 'scrolls horizontally', check: ['ScrollView', 'horizontal'] },
      { it: 'lays columns side by side with flexbox', check: ["flexDirection: 'row'"] },
      { it: 'appends immutably when adding', check: ['setItems(prev =>'] },
    ],
    hints: ['Reduce items into 3 columns', 'ScrollView horizontal for overflow', 'Variable heights per item'],
  },
  {
    id: 135,
    title: 'Word Guessing Game (Adivinar Pokemon)',
    category: 'React Native',
    difficulty: 'medium',
    timeEstimate: '15 min',
    prompt: `Implement the logic for a Hangman-style word guessing game.

Write three pure functions:
1. \`getDisplay(word, guessed)\` — returns the word with unguessed letters as underscores (e.g. "P _ K A _ H U")
2. \`processGuess(letter, state)\` — processes a letter guess, returns new { guessed, wrong, gameOver, won }
3. \`isGameOver(state)\` — returns { won: boolean, lost: boolean }

The word is "PIKACHU", max 6 wrong guesses.`,
    starterCode: `const POKEMON = 'PIKACHU'
const MAX_WRONG = 6

function getDisplay(word, guessed) {
  // Return string with guessed letters shown, others as _
  return ''
}

function processGuess(letter, { guessed, wrong }) {
  // Return { guessed, wrong, gameOver, won }
  return { guessed, wrong, gameOver: false, won: false }
}

function isGameOver({ wrong, won }) {
  // Return { won: boolean, lost: boolean }
  return { won: false, lost: false }
}`,
    solution: `const POKEMON = 'PIKACHU'
const MAX_WRONG = 6

function getDisplay(word, guessed) {
  return word.split('').map(l => guessed.includes(l) ? l : '_').join(' ')
}
function processGuess(letter, { guessed, wrong }) {
  if (guessed.includes(letter)) return { guessed, wrong, gameOver: false, won: false }
  const newGuessed = [...guessed, letter]
  const correct = POKEMON.includes(letter)
  const newWrong = correct ? wrong : wrong + 1
  const display = getDisplay(POKEMON, newGuessed)
  const won = !display.includes('_')
  const gameOver = won || newWrong >= MAX_WRONG
  return { guessed: newGuessed, wrong: newWrong, gameOver, won }
}
function isGameOver({ wrong, won }) {
  return { won, lost: wrong >= MAX_WRONG }
}`,
    explanation: `\`processGuess(letter, state) → newState\` is a **reducer in disguise**, and that's the point: the whole game is a state-transition function over \`{ guessed, wrong }\`. The component becomes a thin shell — \`onPress={l => setState(s => processGuess(l, s))}\` — or drops straight into \`useReducer\` unchanged. Pure transitions mean every rule below is a one-line unit test, no renderer involved.

The rules encoded in the transition:
- **Repeat guesses are a no-op** — the early return keeps a double-tap on the same key from burning a wrong guess, and returns without cloning since nothing changed.
- **Wrong only increments on a miss**, compared against \`MAX_WRONG\`, a named constant — the same number the UI uses to draw remaining lives, defined once.
- **Win is derived, not tracked**: \`getDisplay\` with the new guesses has no underscores left ⇒ won. Reusing the display function as the win predicate guarantees the screen and the game state can never disagree — there is no second bookkeeping structure to drift.
- New state is built with spread (\`[...guessed, letter]\`); the incoming state object is never touched.

\`isGameOver\` stays trivial because the transition already did the work — it just projects \`{ won, lost }\` for the end screen.

**Red flag:** maintaining a separate \`won\` boolean updated in a different code path from \`guessed\`. Two writes for one fact is exactly how a game shows the win banner while the display still has underscores.

**Say it:** "processGuess is a pure reducer — repeat guesses no-op, wrong counts against a named max, and the win is derived from the display so UI and state can't diverge."`,
    tests: [
      { it: 'shows underscores for unguessed', run: 'getDisplay("PIKACHU", [])', expected: '_ _ _ _ _ _ _' },
      { it: 'reveals guessed letters', run: 'getDisplay("PIKACHU", ["P","K"])', expected: 'P _ K _ _ _ _' },
      { it: 'correct guess keeps wrong at 0, miss increments it', run: '[processGuess("P", {guessed:[],wrong:0}).wrong, processGuess("Z", {guessed:[],wrong:0}).wrong]', expected: [0, 1] },
      { it: 'repeated guess is a no-op', run: '(() => { const s = processGuess("P", {guessed:["P"],wrong:0}); return [s.guessed.length, s.wrong] })()', expected: [1, 0] },
      { it: 'guessing every letter wins and ends the game', run: '(() => { let s = {guessed:[],wrong:0}; for (const l of "PIKACHU") s = processGuess(l, s); return [s.won, s.gameOver, s.wrong] })()', expected: [true, true, 0] },
      { it: 'sixth wrong guess ends the game as a loss', run: '(() => { const s = processGuess("Z", {guessed:["Q","W","X","Y","V"],wrong:5}); return [s.gameOver, s.won, isGameOver(s).lost] })()', expected: [true, false, true] },
    ],
    hints: ['Split word into letters, map with guessed check', 'Track wrong count separately', 'Win when no underscores remain'],
    preview: {
      component: 'pokemon-guess',
      extract: ['getDisplay', 'processGuess', 'isGameOver'],
    },
  },
  {
    id: 136,
    title: 'Reaction Game (Juego de Reflejos)',
    category: 'React Native',
    difficulty: 'medium',
    timeEstimate: '15 min',
    prompt: `Implement the core timing logic for a reaction-speed game.

Write two functions:
1. \`startGame()\` — returns initial game state { phase: 'wait', score: 0, delay: number } with random 1-5s delay
2. \`handleTap(state, now)\` — processes a tap at timestamp \`now\`, returns updated state

Rules:
- Phase 'wait': ignore taps
- Phase 'active': record reaction time (now - targetShown), increment score, transition to 'wait' with new random delay
- Game ends after 10 seconds total (handle in UI)
- Phase 'result': game over, show final score`,
    starterCode: `function startGame() {
  // Return { phase: 'wait', score: 0, delay: random 1000-5000 }
  return { phase: 'wait', score: 0, delay: 0 }
}

function handleTap(state, now) {
  // state: { phase, score, targetShown }
  // Return updated state
  return state
}`,
    solution: `function startGame() {
  return { phase: 'wait', score: 0, delay: 1000 + Math.random() * 4000 }
}
function handleTap(state, now) {
  if (state.phase !== 'active') return state
  const reactionTime = now - state.targetShown
  return {
    phase: 'wait',
    score: state.score + 1,
    reactionTime,
    delay: 1000 + Math.random() * 4000,
  }
}`,
    explanation: `Two impurities make timing games untestable — the clock and the RNG — and this design quarantines both. \`Math.random()\` lives only in the state factories; the current time enters \`handleTap\` as the \`now\` **parameter** instead of being read via \`Date.now()\` inside. Injecting time is the whole trick: tests pass literal timestamps and assert exact reaction times, and the logic stays a synchronous pure transition.

The state is a **phase machine** — \`'wait' → 'active' → 'wait' … → 'result'\` — and the first line is its guard: any tap outside \`'active'\` returns the state *unchanged, same reference*. That's simultaneously the anti-cheat rule (mashing during 'wait' scores nothing) and a React optimization: returning the identical object lets a \`useState\`/\`useReducer\` update bail out of re-rendering entirely.

Division of labor is the other shipping concern: the pure layer decides *what* a tap means; the component owns the *when* — it schedules \`setTimeout(delay)\` to flip 'wait' into 'active' (stamping \`targetShown\`), runs the 10-second game clock, and clears timers on unmount. Timers, effects, and cleanup are UI-side machinery; none of it leaks into the logic.

**Red flag:** calling \`Date.now()\` inside \`handleTap\`. It still works — until you try to test it, replay it, or debug a reported score, and every run gives different numbers.

**Say it:** "It's a phase machine with time injected as a parameter — taps outside 'active' return the same reference, so cheating is impossible and React skips the render."`,
    tests: [
      { it: 'startGame returns wait phase with zero score', run: '(() => { const s = startGame(); return [s.phase, s.score] })()', expected: ['wait', 0] },
      { it: 'startGame delay in 1000-5000 range', run: '(() => { const d = startGame().delay; return d >= 1000 && d <= 5000 })()', expected: true },
      { it: 'tap in wait phase is ignored (same state back)', run: '(() => { const s = { phase: "wait", score: 0 }; return handleTap(s, 12345) === s })()', expected: true },
      { it: 'tap in result phase is ignored', run: 'handleTap({ phase: "result", score: 5 }, 99999).score', expected: 5 },
      { it: 'active tap records reaction time and returns to wait', run: '(() => { const s = handleTap({ phase: "active", score: 2, targetShown: 1000 }, 1250); return [s.reactionTime, s.phase, s.score] })()', expected: [250, 'wait', 3] },
      { it: 'new delay issued after a hit stays in range', run: '(() => { const s = handleTap({ phase: "active", score: 0, targetShown: 0 }, 100); return s.delay >= 1000 && s.delay <= 5000 })()', expected: true },
    ],
    hints: ['Phase machine: wait → active → wait...', 'Reaction time = now - targetShown', 'Game duration handled by UI'],
    preview: {
      component: 'reaction-game',
      extract: ['startGame', 'handleTap'],
    },
  },
  {
    id: 137,
    title: 'Stroop Color Game (Juego de Colores)',
    category: 'React Native',
    difficulty: 'medium',
    timeEstimate: '15 min',
    prompt: `Implement the logic functions for a Stroop-effect color game.

Write two functions:
1. \`getRound(round)\` — returns { word, displayColor }
   - \`word\`: the color NAME to display (changes each round)
   - \`displayColor\`: a different color to render it in (tricky!)
2. \`handleChoice(chosen, state)\` — returns { score, round, gameOver }
   - \`chosen\`: the button the user tapped
   - \`state\`: { score, round } — current state
   - Increment score if chosen matches the *word*, advance round
   - End game after 20 rounds`,
    starterCode: `const COLORS = ['RED', 'BLUE', 'GREEN', 'YELLOW']
const COLOR_MAP = { RED: '#ef4444', BLUE: '#3b82f6', GREEN: '#22c55e', YELLOW: '#eab308' }

function getRound(round) {
  // Return { word, displayColor } using COLORS and COLOR_MAP
  return { word: '', displayColor: '' }
}

function handleChoice(chosen, { score, round }) {
  // Return { score, round, gameOver }
  return { score, round, gameOver: false }
}`,
    solution: `const COLORS = ['RED', 'BLUE', 'GREEN', 'YELLOW']
const COLOR_MAP = { RED: '#ef4444', BLUE: '#3b82f6', GREEN: '#22c55e', YELLOW: '#eab308' }

function getRound(round) {
  return { word: COLORS[round % COLORS.length], displayColor: COLORS[(round + 1) % COLORS.length] }
}
function handleChoice(chosen, { score, round }) {
  const isCorrect = chosen === COLORS[round % COLORS.length]
  if (round >= 19) return { score: isCorrect ? score + 1 : score, round: round + 1, gameOver: true }
  return { score: isCorrect ? score + 1 : score, round: round + 1, gameOver: false }
}`,
    explanation: `The Stroop game's one rule — score when the choice matches the **word**, never the ink color — lives in a single comparison, and both functions deriving the round's word from the *same expression* (\`COLORS[round % COLORS.length]\`) is what keeps them consistent. \`getRound\` and \`handleChoice\` never exchange hidden state; the round index is the sole input, so the question shown and the answer scored can't drift apart.

Making rounds **deterministic functions of the index** (word cycles through COLORS, ink offset by one) is a deliberate testability choice: every round is reproducible, and the offset-by-one guarantees word ≠ displayColor by construction — the incongruence that makes Stroop hard. Production would randomize, and then you need the guard determinism gives you for free: re-roll while \`displayColor === word\`, or the round becomes a freebie. Say that trade-off out loud.

The boundary is the classic fencepost: rounds are 0-indexed, so index 19 is the 20th and final round — \`round >= 19\` flags \`gameOver\` on that choice while still scoring it. Off-by-one here either gives players 21 rounds or eats their last answer.

**Red flag:** scoring \`chosen === displayColor\`. The game still "works" — buttons respond, score moves — but you've built the opposite test (naming the ink), and no type checker will catch a rules bug. Encode rules in one pure function and unit-test the rule itself.

**Say it:** "Both functions derive the round's word from the same index expression, so question and scoring can't desync — and round 19 is the twentieth round, scored then ended."`,
    tests: [
      { it: 'round 0 shows RED as the word', run: 'getRound(0).word', expected: 'RED' },
      { it: 'word and displayColor always differ (the Stroop trick)', run: '[0, 1, 2, 3, 7].every(r => { const x = getRound(r); return x.word !== x.displayColor })', expected: true },
      { it: 'choosing the word scores a point', run: 'handleChoice("RED", { score: 0, round: 0 }).score', expected: 1 },
      { it: 'choosing the ink color does NOT score', run: '(() => { const r = getRound(0); return handleChoice(r.displayColor, { score: 0, round: 0 }).score })()', expected: 0 },
      { it: 'every choice advances the round', run: 'handleChoice("BLUE", { score: 3, round: 4 }).round', expected: 5 },
      { it: 'game ends exactly at round 20, not before', run: '[handleChoice("RED", { score: 0, round: 5 }).gameOver, handleChoice("RED", { score: 0, round: 19 }).gameOver]', expected: [false, true] },
    ],
    hints: ['Word cycles through COLORS by round index', 'Display color offset by 1 for the trick', 'Score only when chosen === word'],
    preview: {
      component: 'stroop-game',
      extract: ['getRound', 'handleChoice'],
    },
  },
  {
    id: 138,
    title: 'G-Counter CRDT for offline sync',
    category: 'React Native',
    difficulty: 'hard',
    timeEstimate: '15 min',
    prompt: `Implement a G-Counter (Grow-only Counter) CRDT for an offline-first Expo/React Native app.

A G-Counter is a Conflict-free Replicated Data Type where each replica (e.g. a device with an Expo SecureStore-assigned \`replicaId\`) tracks its own increments in a private slot. Counters are persisted locally (AsyncStorage / expo-sqlite) and merged whenever the device reconnects — taking element-wise max guarantees the replicas converge without a server or consensus. The total value is the sum of all slots.

Write four functions:
1. \`createGCounter(replicaCount)\` — return an array of \`replicaCount\` zeros
2. \`increment(counter, replicaId)\` — return a new counter with slot \`replicaId\` incremented by 1
3. \`merge(counterA, counterB)\` — return a new counter where each slot is Math.max of the two
4. \`value(counter)\` — return the sum of all slots`,
    starterCode: `function createGCounter(replicaCount) {
  // Return an array of zeros
  return []
}

function increment(counter, replicaId) {
  // Return a new counter with slot replicaId incremented
  return []
}

function merge(counterA, counterB) {
  // Return a new counter with element-wise max
  return []
}

function value(counter) {
  // Return the sum of all slots
  return 0
}`,
    solution: `function createGCounter(replicaCount) {
  return Array(replicaCount).fill(0)
}
function increment(counter, replicaId) {
  const next = [...counter]
  next[replicaId]++
  return next
}
function merge(counterA, counterB) {
  return counterA.map((v, i) => Math.max(v, counterB[i]))
}
function value(counter) {
  return counter.reduce((a, b) => a + b, 0)
}`,
    explanation: `Offline-first is the real interview topic here: a phone increments a counter on the subway, another device increments the same counter elsewhere, and when both come back online the app must converge **without a server deciding who wins**. The G-Counter's answer is structural: each replica writes only its own slot, so concurrent increments never touch the same data, and "conflict resolution" stops being a thing that can fail.

Why \`merge\` is element-wise \`Math.max\` and not addition: each slot is a *monotonic* counter owned by one writer, so the max of two observations of that slot is simply the most recent one. Max is **commutative, associative, and idempotent** — merge in any order, any number of times, through any gossip path, and every replica lands on the same state. The tests pin exactly those algebraic properties, because they *are* the correctness argument. Sum-merge fails idempotence: sync the same state twice and the count double-books.

\`value\` is the sum across slots — derived on read, never stored. In an Expo app the counter array lives in AsyncStorage keyed by a SecureStore-assigned \`replicaId\`; reconnect = exchange arrays, merge, persist. Note the trade-off honestly: **grow-only means no decrement** — the standard fix is a PN-Counter, two G-Counters (increments minus decrements).

**Red flag:** merging by summing, or incrementing another replica's slot "to correct it." Both destroy the single-writer invariant that makes convergence provable.

**Say it:** "Each replica owns one slot and merge is element-wise max — commutative, associative, idempotent — so replicas converge no matter how many times or in what order they sync."`,
    tests: [
      { it: 'createGCounter returns array of correct length', run: 'createGCounter(4).length', expected: 4 },
      { it: 'all values start at 0', run: 'JSON.stringify(createGCounter(3))', expected: '[0,0,0]' },
      { it: 'increment increases one slot', run: 'JSON.stringify(increment([0,0,0], 1))', expected: '[0,1,0]' },
      { it: 'increment does not mutate the input counter', run: '(() => { const c = [0, 0]; increment(c, 0); return c[0] })()', expected: 0 },
      { it: 'merge takes element-wise max', run: 'JSON.stringify(merge([1,2,0],[0,3,4]))', expected: '[1,3,4]' },
      { it: 'merge is commutative (A∪B === B∪A)', run: 'JSON.stringify(merge([1,2,0],[0,3,4])) === JSON.stringify(merge([0,3,4],[1,2,0]))', expected: true },
      { it: 'merge is idempotent (A∪A === A)', run: 'JSON.stringify(merge([1,2,3],[1,2,3]))', expected: '[1,2,3]' },
      { it: 'value returns sum of all slots', run: 'value([3,5,2])', expected: 10 },
    ],
    hints: [
      'G-Counter: each replica owns one slot — it only ever increments its own',
      'Merge = element-wise Math.max — this is what guarantees convergence',
      'Value is the sum, not the max — each slot is a separate monotonic counter',
      'Arrays are compared by JSON.stringify in tests',
    ],
  },
]
