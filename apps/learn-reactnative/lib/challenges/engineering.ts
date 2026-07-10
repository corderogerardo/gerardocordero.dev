import type { Challenge } from '../challenges'

export const engineeringChallenges: Challenge[] = [
  // ─── Engineering Practices (71–86) ───
  {
    id: 71,
    title: 'Jest test — describe/it/expect',
    category: 'Engineering Practices',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `Write a Jest test suite for a sum function.
Test with positive numbers, negative numbers, and zero.`,
    starterCode: `function sum(a, b) {
  return a + b
}

// Write tests
describe('sum', () => {
  // Your tests here
})`,
    solution: `describe('sum', () => {
  it('adds positive numbers', () => {
    expect(sum(2, 3)).toBe(5)
  })
  it('adds negative numbers', () => {
    expect(sum(-1, -2)).toBe(-3)
  })
  it('adds zero', () => {
    expect(sum(0, 5)).toBe(5)
  })
})`,
    explanation: `A test suite's job is to make change cheap: unit tests sit at the bottom of the pyramid because they give the fastest feedback for the lowest cost, and \`describe\`/\`it\` is where every JavaScript testing conversation starts. The structure matters more than it looks: \`describe\` names the unit under test, each \`it\` reads as a behavior specification ("it adds negative numbers"), and one assertion concept per \`it\` means a failure message tells you exactly *which* behavior broke — a single \`it\` with ten expects fails as one opaque red X.

The \`describe\`/\`it\` style is BDD's heritage: tests written as readable behavior specs, Given-When-Then compressed into a sentence. Choosing the three cases here (positive, negative, zero) is the actual skill being probed — partitioning the input space instead of testing one happy path three ways.

Stack context worth having ready: Mocha + Chai + Sinon was the composable trio, Jasmine bundled all three, and Jest superseded that generation by shipping runner, assertions, mocking, snapshots, and coverage in one tool.

**Red flag:** equating BDD with using \`describe\`/\`it\` syntax. The syntax is only the residue — the practice is behavior-language specs agreed with product before code.

**Say it:** "Each \`it\` is a one-sentence behavior spec over a partition of the input space — positive, negative, zero — so a failure names the exact behavior that regressed."`,
    tests: [
      { it: 'groups tests in a describe block', check: ['describe('] },
      { it: 'defines individual cases with it()', check: ['it('] },
      { it: 'asserts with expect + toBe', check: ['expect(', 'toBe('] },
    ],
    hints: ['describe groups tests', 'it defines a test case', 'expect + matcher (toBe)'],
  },
  {
    id: 72,
    title: 'Testing async code',
    category: 'Engineering Practices',
    difficulty: 'medium',
    timeEstimate: '5 min',
    prompt: `Write a Jest test for an async function fetchUserName.
Test that it resolves to the correct name and that it rejects on error.`,
    starterCode: `async function fetchUserName(id) {
  if (id < 0) throw new Error('Invalid id')
  return { 1: 'Alice', 2: 'Bob' }[id] || 'Unknown'
}

// Write tests`,
    solution: `it('returns Alice for id 1', async () => {
  const name = await fetchUserName(1)
  expect(name).toBe('Alice')
})

it('throws for negative id', async () => {
  await expect(fetchUserName(-1)).rejects.toThrow('Invalid id')
})`,
    explanation: `Async tests are where suites silently rot, because the failure mode is a test that *passes vacuously*. If you forget to \`await\` — or forget to \`return\` the promise — the test function exits before the assertion runs, Jest marks it green, and you now have a test that would stay green if the implementation were deleted. That's worse than no test: it's false confidence with a maintenance cost.

The two idioms to have cold: \`await\` the happy path and assert on the resolved value; use \`await expect(promise).rejects.toThrow(...)\` for the failure path. The \`rejects\` matcher exists because the naive alternative — \`try { await fn() } catch (e) { expect(e.message)... }\` — has a hole: if the function *doesn't* throw, no assertion runs and the test passes. Jest's answer for the try/catch style is \`expect.assertions(1)\`, but \`.rejects\` makes the intent declarative and closes the hole in one line.

**Red flag:** testing a rejection with a bare try/catch and no guard against the no-throw path. The interviewer is specifically listening for whether you know that test can pass when the code is broken.

**Say it:** "I assert rejections with \`await expect(...).rejects.toThrow\` because a try/catch without \`expect.assertions\` passes silently when the function stops throwing."`,
    tests: [
      { it: 'uses async test functions with await', check: ['async', 'await'] },
      { it: 'asserts the rejection path with .rejects.toThrow', check: ['rejects', 'toThrow'] },
      { it: 'asserts the resolved value', check: ['expect('] },
    ],
    hints: ['async/await in test functions', '.rejects.toThrow for errors', '.resolves.toBe alternative'],
  },
  {
    id: 73,
    title: 'Mock functions with Jest',
    category: 'Engineering Practices',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Create a Jest mock function for a callback. Test that it was called,
with the correct arguments, and exactly N times.`,
    starterCode: `function processItems(items, callback) {
  items.forEach(item => callback(item))
}

// Write tests with a mock`,
    solution: `it('calls callback for each item', () => {
  const mockCallback = jest.fn(x => x * 2)
  processItems([1, 2, 3], mockCallback)
  expect(mockCallback).toHaveBeenCalledTimes(3)
  expect(mockCallback).toHaveBeenCalledWith(1)
  expect(mockCallback).toHaveBeenCalledWith(2)
  expect(mockCallback).toHaveBeenCalledWith(3)
})`,
    explanation: `\`jest.fn()\` exists to test the *contract at a boundary*: when your unit's job is "call this collaborator correctly," the mock records every call so you can assert on the interaction instead of the collaborator's side effects. \`toHaveBeenCalledTimes\` catches both under-calling (skipped items) and over-calling (double-fires — the bug class behind duplicate analytics events and double payments), and \`toHaveBeenCalledWith\` pins the argument contract.

The vocabulary distinction interviewers probe, inherited from Sinon: a **spy** records calls without changing behavior, a **stub** replaces behavior to control the test's inputs, and a **mock** carries pre-programmed expectations that fail the test themselves. \`jest.fn()\` collapses all three into one API — it spies always, stubs when you give it an implementation, and becomes assertion material via the matchers.

The senior discipline is knowing when *not* to mock. Every mock couples the test to an implementation detail: mock too much and refactoring breaks tests while behavior stays correct, which trains the team to ignore red. Mock at real boundaries — network, time, randomness, native modules — and let everything inside the unit run for real.

**Red flag:** mocking every dependency reflexively. A suite where refactors break tests but bugs don't is testing implementation, not behavior.

**Say it:** "I mock at boundaries — network, time, native modules — and assert the call contract with \`toHaveBeenCalledTimes\` and \`toHaveBeenCalledWith\`; everything inside the unit runs real."`,
    tests: [
      { it: 'creates the mock with jest.fn', check: ['jest.fn'] },
      { it: 'asserts the call count', check: ['toHaveBeenCalledTimes'] },
      { it: 'asserts the arguments', check: ['toHaveBeenCalledWith'] },
    ],
    hints: ['jest.fn() creates mock', 'toHaveBeenCalledTimes, toHaveBeenCalledWith', 'Mock tracks all calls'],
  },
  {
    id: 74,
    title: 'Testing React Native components',
    category: 'Engineering Practices',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Write a test for a Counter component using React Native Testing Library.
Test that pressing the + button increments the displayed count.`,
    starterCode: `function Counter() {
  const [count, setCount] = useState(0)
  return (
    <View>
      <Text testID="count">{count}</Text>
      <Button testID="inc" title="+" onPress={() => setCount(c => c + 1)} />
    </View>
  )
}

// Write test`,
    solution: `it('increments count on press', () => {
  const { getByTestId } = render(<Counter />)
  fireEvent.press(getByTestId('inc'))
  expect(getByTestId('count')).toHaveTextContent('1')
})`,
    explanation: `React Native Testing Library's design principle is the whole answer: test through the UI contract — what the user sees and does — never through implementation details. This test renders the component, simulates the press a user would make, and asserts on the *rendered text*. It never touches \`useState\`, never reads component internals. That's why it survives refactors: swap \`useState\` for \`useReducer\` or a store and the test stays green, because the behavior it specifies didn't change. A test that asserts on internal state does the opposite — it breaks on refactors and misses real regressions in what renders.

This is the middle layer of the testing pyramid: many Jest unit tests for pure logic below it, few Detox/Maestro E2E flows above it, and RNTL integration tests carrying the "does the component actually behave" load at a fraction of E2E cost.

Query choice is a signal too: RNTL's guidance prefers user-facing queries — \`getByText\`, \`getByRole\`, accessibility labels — over \`testID\`, because those queries fail when the accessible experience breaks. \`testID\` is the pragmatic fallback for elements with no user-visible handle.

**Red flag:** asserting on state values or snapshot-testing the whole tree instead of asserting the visible outcome — both couple the test to internals.

**Say it:** "RNTL tests assert through the UI contract — press the button, expect the rendered text — so refactoring internals never breaks them and real regressions always do."`,
    tests: [
      { it: 'renders the component under test', check: ['render('] },
      { it: 'simulates the press with fireEvent', check: ['fireEvent.press'] },
      { it: 'asserts on the rendered output', check: ['getByTestId', 'toHaveTextContent'] },
    ],
    hints: ['render from @testing-library/react-native', 'fireEvent to simulate', 'toHaveTextContent matcher'],
  },
  {
    id: 75,
    title: 'Snapshot testing',
    category: 'Engineering Practices',
    difficulty: 'medium',
    timeEstimate: '5 min',
    prompt: `Write a snapshot test for a simple Greeting component that accepts a name prop.
The snapshot should capture the rendered output.`,
    starterCode: `function Greeting({ name }) {
  return <Text>Hello, {name}!</Text>
}

// Write snapshot test`,
    solution: `it('matches snapshot', () => {
  const tree = render(<Greeting name="Alice" />)
  expect(tree).toMatchSnapshot()
})`,
    explanation: `Snapshot tests are a regression tripwire, not a specification. \`toMatchSnapshot\` serializes the rendered tree to a \`.snap\` file on first run, commits it, and fails any future run whose output differs. The value is coverage-per-keystroke: one line guards the entire rendered structure of a presentational component against accidental change.

The trap is that a snapshot asserts "output equals whatever it was" — it encodes the *current* state as correct without anyone deciding it is. That has two failure modes. First, giant snapshots of deep trees fail on every unrelated change, and a test that cries wolf gets \`-u\`'d without reading. Second, \`jest -u\` run blindly converts a real regression into a committed expectation — the tool's one-keystroke update is its own biggest hazard. The discipline: keep snapshots small (single presentational components, or inline snapshots that live in the test file where reviewers actually see them), and treat a snapshot diff in review with the same attention as a code diff, because it *is* the assertion changing.

Behavioral assertions still beat snapshots for anything with logic — snapshot the static Greeting, but test the Counter by pressing and asserting.

**Red flag:** "we have great coverage, it's all snapshots" — serialization coverage isn't behavioral coverage, and habitual \`-u\` means the suite approves anything.

**Say it:** "Snapshots are tripwires for presentational components — I keep them small and review \`.snap\` diffs as assertions, because updating one blindly is deleting a test."`,
    tests: [
      { it: 'renders the component', check: ['render('] },
      { it: 'uses the snapshot matcher', check: ['toMatchSnapshot'] },
    ],
    hints: ['toMatchSnapshot creates a .snap file', 'Commit snapshots to repo', 'Update with -u flag'],
  },
  {
    id: 76,
    title: 'Test coverage thresholds',
    category: 'Engineering Practices',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `Configure Jest to enforce coverage thresholds in jest.config.js:
80% for branches, functions, lines, and statements.`,
    starterCode: `// jest.config.js
module.exports = {
  // Your config here
}`,
    solution: `module.exports = {
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}`,
    explanation: `A coverage threshold is a quality gate: the build fails when coverage drops below the line, which turns "we should write tests" from a culture hope into a CI precondition. Without the gate, coverage only ever ratchets down — every rushed PR shaves a percent and nobody notices until the number is meaningless.

Know what the four metrics actually measure: **statements** and **lines** are near-duplicates (was this code executed), **functions** catches entirely untested helpers, and **branches** is the one that earns its keep — 100% line coverage can still miss every \`else\`, and branch coverage is what exposes the untested error path.

The senior caveats: coverage measures *execution*, not *assertion quality* — a test that calls everything and asserts nothing scores perfectly, which is why the number is a floor, not a goal. And a global threshold punishes the wrong people: it blocks today's PR because of debt written years ago. The stronger pattern, which SonarQube-class gates formalize, is thresholds on *new code* — old debt is grandfathered, new debt is stopped at the door. Jest approximates this with per-directory thresholds on the modules you're actively hardening.

**Red flag:** chasing 100% — the last percentiles buy assertion-free tests written to satisfy the meter.

**Say it:** "Coverage is a floor enforced in CI, not a goal — I gate on branches, not lines, and prefer thresholds on new code so the gate stops new debt instead of relitigating old debt."`,
    tests: [
      { it: 'defines a coverageThreshold block', check: ['coverageThreshold'] },
      { it: 'covers all four metrics', check: ['branches', 'functions', 'lines', 'statements'] },
      { it: 'sets the 80% bar', check: ['80'] },
    ],
    hints: ['coverageThreshold in jest config', 'global or per-file patterns', 'Fails if below threshold'],
  },
  {
    id: 77,
    title: 'Console.log debugging pattern',
    category: 'Engineering Practices',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `Add strategic console.log statements to a nested function to trace
the flow of data. Use labeled logging so each log shows which function produced it.`,
    starterCode: `function outer(x) {
  function middle(y) {
    function inner(z) {
      return z * 2
    }
    return inner(y + 1)
  }
  return middle(x * 2)
}

// Add labeled console.log statements to trace the data flow`,
    solution: `function outer(x) {
  console.log('[outer] input:', x)
  function middle(y) {
    console.log('[middle] input:', y)
    function inner(z) {
      console.log('[inner] input:', z, 'output:', z * 2)
      return z * 2
    }
    const result = inner(y + 1)
    console.log('[middle] output:', result)
    return result
  }
  const result = middle(x * 2)
  console.log('[outer] output:', result)
  return result
}`,
    explanation: `Print debugging is legitimate — every senior uses it — but the difference between noise and signal is *structure*. The pattern here is deliberate: a \`[functionName]\` label on every line so interleaved output stays attributable, and logging both input and output at each layer so one read of the console shows exactly where the data diverged from your mental model. Unlabeled \`console.log(x)\` scattered around forces you to correlate values to call sites from memory, which is where the technique gets its bad reputation.

Two upgrades to name in an interview. First, in React Native the structured console feeds straight into React Native DevTools (the modern debugger that replaced Flipper for JS debugging), where a breakpoint often beats twenty logs — logs shine when the bug is *timing- or flow-shaped* and stepping would perturb it. Second, logs have a lifecycle: trace logs like these are scaffolding and come out before merge, while what ships is *structured logging with levels*, stripped or gated in release builds — \`console.log\` in a hot path costs real performance in production, and logged payloads are a classic PII leak (\`babel-plugin-transform-remove-console\` is the standard strip).

**Red flag:** "I'd add console.logs" as your *production* debugging answer — production is crash reporting and breadcrumbs; ad-hoc logs are a local tool.

**Say it:** "I label every trace log with its source and log inputs and outputs in pairs — and none of it ships: release builds get leveled, stripped, PII-safe logging."`,
    tests: [
      { it: 'returns correct value', run: 'outer(3)', expected: 14 },
      { it: 'handles zero input', run: 'outer(0)', expected: 2 },
      { it: 'handles negative input', run: 'outer(-2)', expected: -6 },
      { it: 'labels logs with the function name', check: ['[outer]', '[middle]', '[inner]'] },
    ],
    hints: ['Label logs with [functionName]', 'Log inputs and outputs', 'Remove before committing'],
  },
  {
    id: 78,
    title: 'React DevTools profiler',
    category: 'Engineering Practices',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Wrap a performance-sensitive component tree with React.Profiler and
log the render timing data (id, phase, actualDuration) to the console.`,
    starterCode: `function onRender(id, phase, actualDuration) {
  // Your profiling callback here
}

export default function App() {
  return (
    // Wrap with Profiler
    <ExpensiveTree />
  )
}`,
    solution: `function onRender(id, phase, actualDuration) {
  console.log(\`\${id} [\${phase}]: \${actualDuration.toFixed(2)}ms\`)
}

export default function App() {
  return (
    <Profiler id="App" onRender={onRender}>
      <ExpensiveTree />
    </Profiler>
  )
}`,
    explanation: `The \`<Profiler>\` component exists so render performance becomes a *measured number* instead of a vibe — and measurement-before-optimization is the entire senior position on React performance. Wrapping a subtree gives you a callback on every committed render with the data that matters: \`id\` (which tree), \`phase\` (\`"mount"\` vs \`"update"\` — a slow mount is a one-time cost, a slow *update* on every keystroke is the bug), and \`actualDuration\` (time spent rendering this commit, including children).

Why the programmatic API instead of just the DevTools flamegraph? Because the callback composes into tooling: log it in development, or feed it to your performance monitoring in production so regressions show up as trends across releases rather than as user complaints. The DevTools Profiler UI (available for React Native through React Native DevTools) is where you *investigate*; \`<Profiler>\` is how you *watch continuously*.

The workflow it enables: measure, find the component whose \`actualDuration\` dominates, fix that one thing (\`memo\`, moving state down, virtualizing a list), measure again. Note Profiler adds its own small overhead — wrap the suspect subtree, not the entire app, and don't leave dev-only logging in release.

**Red flag:** reaching for \`React.memo\` and \`useCallback\` everywhere *before* measuring — memoization has its own cost, and unmeasured optimization is how codebases accrete complexity with no user-visible win.

**Say it:** "I profile before I memoize — \`actualDuration\` on the update phase tells me which subtree actually burns the frame budget, and I fix only what the measurement names."`,
    tests: [
      { it: 'wraps the tree with Profiler', check: ['<Profiler', 'id='] },
      { it: 'passes the onRender callback', check: ['onRender'] },
      { it: 'logs the actual duration', check: ['actualDuration'] },
    ],
    hints: ['Profiler requires id + onRender', 'actualDuration in ms', 'Phase is "mount" or "update"'],
  },
  {
    id: 79,
    title: 'Flipper network inspector',
    category: 'Engineering Practices',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Network inspection tooling has churned: Flipper is deprecated, and React Native DevTools
now ships a Network panel. But a logging fetch wrapper is still the portable answer — it works in
every environment and feeds your own telemetry.

Write fetchWithLogging(url, options, fetchImpl = fetch) that logs the method and URL before the
request and the response status after, then returns the response. Inject fetchImpl so it's testable.`,
    starterCode: `// Create a fetch wrapper that logs requests
function fetchWithLogging(url, options = {}, fetchImpl = fetch) {
  // Your code here
  return fetchImpl(url, options)
}`,
    solution: `function fetchWithLogging(url, options = {}, fetchImpl = fetch) {
  const method = options.method || 'GET'
  console.log(\`[Network] \${method} \${url}\`)
  return fetchImpl(url, options).then(response => {
    console.log(\`[Network] \${method} \${url} -> \${response.status}\`)
    return response
  })
}`,
    explanation: `The network boundary is where mobile apps actually fail — flaky radios, misconfigured backends, auth expiry — so instrumenting it is observability, not debugging vanity. Tooling context first, because it dates candidates: Flipper is deprecated; interactive inspection now lives in React Native DevTools' Network panel (or a proxy like Charles/mitmproxy when you need to see traffic below JS). The wrapper pattern survives all tooling churn because it's *yours*: the same seam that logs in development feeds timing spans to Sentry or your analytics in production.

Three mechanics carry the design. Logging before *and* after gives you the request that never came back — the before-line with no after-line is the hung request a single completion log can never show you. Returning the response keeps the wrapper transparent: callers chain \`.json()\` exactly as if it were bare \`fetch\`. And injecting \`fetchImpl\` as a parameter is the same testability move as injecting clocks or randomness — the tests below pass a fake and assert the contract without touching the network.

**Red flag:** reading the body inside the logger. \`response.json()\` consumes the body stream — the caller then gets "Body already read". If you must log payloads, \`response.clone()\` first, and keep payload logging out of release builds: bodies are where PII lives.

**Say it:** "I instrument the fetch boundary with a transparent wrapper — log before and after, return the response untouched, inject the fetch implementation so the contract is testable without a network."`,
    tests: [
      { it: 'returns the response from the wrapped fetch', run: "(() => { const fake = () => ({ then: fn => fn({ status: 200 }) }); return fetchWithLogging('/api', {}, fake).status })()", expected: 200 },
      { it: 'forwards url and options to the implementation', run: "(() => { let seen = null; const fake = (u, o) => { seen = u + ':' + (o.method || 'GET'); return { then: fn => fn({ status: 204 }) } }; fetchWithLogging('/users', { method: 'POST' }, fake); return seen })()", expected: '/users:POST' },
      { it: 'defaults the method to GET', run: "(() => { let m = null; const fake = (u, o) => { m = o.method || 'GET'; return { then: fn => fn({ status: 200 }) } }; fetchWithLogging('/x', {}, fake); return m })()", expected: 'GET' },
      { it: 'passes the response through unchanged (identity)', run: "(() => { const resp = { status: 500 }; const fake = () => ({ then: fn => fn(resp) }); return fetchWithLogging('/err', {}, fake) === resp })()", expected: true },
    ],
    hints: ['Wrap fetch, log before and after', 'Return the response for chaining', 'Injecting fetchImpl makes it testable — same move as injecting a clock'],
  },
  {
    id: 80,
    title: 'Error logging service',
    category: 'Engineering Practices',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Create a simple error logging service that captures error messages,
stack traces, and timestamps, storing them in memory and exposing a getAll method.
It should handle both Error objects and plain string errors.`,
    starterCode: `class ErrorLogger {
  constructor() {
    this.errors = []
  }
  log(error) {
    // Your code here
  }
  getAll() {
    return this.errors
  }
}`,
    solution: `class ErrorLogger {
  constructor() {
    this.errors = []
  }
  log(error) {
    this.errors.push({
      message: error.message || String(error),
      stack: error.stack || null,
      timestamp: new Date().toISOString(),
    })
  }
  getAll() {
    return this.errors
  }
}`,
    explanation: `This is a toy Sentry, and the reason to build the toy is to be able to say what the real thing does and why it must exist *before* the incident. Production observability is what turns "users say it's broken" into a stack trace with context — without it you're debugging blind on devices you don't own.

The structure of each entry is the lesson. **Message** alone is useless at scale ("undefined is not a function" times ten thousand); **stack** is what makes an error actionable — and the React Native-specific trap is that release-build stacks are minified Hermes frames, unreadable unless your release pipeline uploads source maps (and dSYMs/ProGuard mappings for native). Symbol upload is a CI step, not a manual chore. **Timestamp** is what lets you correlate an error spike with the release or backend deploy that caused it.

The defensive \`error.message || String(error)\` matters because JavaScript lets you \`throw 'oops'\` — a logger that assumes Error objects crashes on exactly the sloppy code most likely to throw strings. An error handler that itself throws is the worst bug class in observability.

**Red flag:** "we'd add logging to investigate" — that admits nothing was in place. The senior answer names crash reporting, breadcrumbs, and symbol upload as pre-launch infrastructure.

**Say it:** "I treat symbol upload as a release-pipeline gate and crash-free session rate as the rollout go/no-go — monitoring is configured before the incident, not during it."`,
    tests: [
      { it: 'starts empty', run: 'new ErrorLogger().getAll().length', expected: 0 },
      { it: 'captures the message from an Error object', run: "(() => { const l = new ErrorLogger(); l.log(new Error('boom')); return l.getAll()[0].message })()", expected: 'boom' },
      { it: 'handles a plain string being thrown', run: "(() => { const l = new ErrorLogger(); l.log('plain failure'); return l.getAll()[0].message })()", expected: 'plain failure' },
      { it: 'accumulates multiple errors', run: "(() => { const l = new ErrorLogger(); l.log(new Error('a')); l.log(new Error('b')); return l.getAll().length })()", expected: 2 },
      { it: 'records an ISO timestamp string', run: "(() => { const l = new ErrorLogger(); l.log(new Error('t')); const ts = l.getAll()[0].timestamp; return typeof ts === 'string' && ts.includes('T') })()", expected: true },
    ],
    hints: ['Capture message, stack, timestamp', 'error.message || String(error) survives thrown strings', 'This is what Sentry/Crashlytics do — plus source-map upload in CI'],
  },
  {
    id: 81,
    title: 'React Native performance monitor',
    category: 'Engineering Practices',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Create a PerformanceMonitor component that shows JS-thread FPS
by counting requestAnimationFrame callbacks and sampling with setInterval. Update every second.`,
    starterCode: `export default function PerformanceMonitor() {
  // Your code here
  return null
}`,
    solution: `export default function PerformanceMonitor() {
  const [fps, setFps] = useState(0)
  const frameCount = useRef(0)
  useEffect(() => {
    let rafId
    const frame = () => {
      frameCount.current++
      rafId = requestAnimationFrame(frame)
    }
    rafId = requestAnimationFrame(frame)
    const interval = setInterval(() => {
      setFps(frameCount.current)
      frameCount.current = 0
    }, 1000)
    return () => {
      clearInterval(interval)
      cancelAnimationFrame(rafId)
    }
  }, [])
  return <Text style={{ fontSize: 10 }}>{fps} FPS</Text>
}`,
    explanation: `The technique is honest and the caveats are the interview. Counting \`requestAnimationFrame\` callbacks per second measures the **JS thread**: if your JS FPS drops, something is blocking the event loop — a heavy render pass, JSON parsing, an accidental O(n²). But React Native runs UI on a separate thread, so JS FPS and UI FPS diverge — a native-driven animation (\`useNativeDriver\`, Reanimated worklets) stays at 60 while JS is frozen, and vice versa. Reporting one number as "the FPS" is the junior mistake; know *which thread* you measured. The in-app Perf Monitor (dev menu) shows both for exactly this reason.

Implementation details that carry the points: the counter lives in a \`useRef\` because incrementing it 60 times a second in \`useState\` would itself cause 60 renders a second — the monitor becoming the perf problem. The cleanup returns from \`useEffect\` and cancels *both* the interval and the rAF loop; leaking a rAF loop after unmount is a real memory-and-CPU leak.

Also say where this fits: an overlay like this is a dev tool. Production performance is measured as trends — cold start, TTI, slow/frozen frame rates via performance monitoring — not by shipping an FPS counter.

**Red flag:** measuring in a dev build and quoting the numbers — dev mode disables optimizations and runs dramatically slower; performance claims come from release builds on mid-range hardware.

**Say it:** "rAF counting measures the JS thread only — UI runs on its own thread in React Native — so I always name which thread dropped frames, and I measure on release builds."`,
    tests: [
      { it: 'counts frames with requestAnimationFrame', check: ['requestAnimationFrame'] },
      { it: 'samples once per second', check: ['setInterval', '1000'] },
      { it: 'keeps the counter in a ref to avoid render churn', check: ['useRef'] },
      { it: 'cleans up the interval on unmount', check: ['clearInterval'] },
    ],
    hints: ['requestAnimationFrame counts frames', 'setInterval samples over 1s', 'useRef for the counter — useState would re-render 60×/s'],
  },
  {
    id: 82,
    title: 'DRY — extract reusable hook',
    category: 'Engineering Practices',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Refactor duplicate code into a custom useFetch hook that takes a URL
and returns { data, isLoading, error }.`,
    starterCode: `// Extract this pattern into a reusable hook
export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(setUsers).finally(() => setLoading(false))
  }, [])
  // ...
}`,
    solution: `function useFetch(url) {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    fetch(url)
      .then(r => r.json())
      .then(d => { if (!cancelled) setData(d) })
      .catch(e => { if (!cancelled) setError(e) })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [url])
  return { data, isLoading, error }
}`,
    explanation: `Custom hooks are how React does DRY for *stateful* logic: the fetch-loading-error triad appears on every screen, and extracting it means the pattern is fixed in one place when it needs fixing. Which it does — the naive version everyone writes first has a race condition: if \`url\` changes (or the component unmounts) while a request is in flight, the *old* response lands last and overwrites the new one. The \`cancelled\` flag in the effect cleanup is the minimal fix; it's also the answer to the "can't perform a state update on an unmounted component" class of bug. In an interview, volunteering the race is worth more than the extraction itself.

Two more signals in the shape: \`[url]\` in the dependency array makes the hook re-fetch when its input changes — a hook that ignores its argument after mount is a stale-data bug; and returning a named object \`{ data, isLoading, error }\` beats a tuple because call sites stay self-documenting.

The honest scope statement: this hook has no caching, deduplication, or retry. That's not a flaw in the exercise — it's why production apps use TanStack Query or SWR, which are this hook with the hard parts done.

**Red flag:** DRY-ing two snippets that are only *coincidentally* similar. Duplication is cheaper than the wrong abstraction — extract when the pattern has proven itself (rule of three), not on the second occurrence.

**Say it:** "I extract the triad into \`useFetch\` with a cancellation flag for the in-flight race — and I say out loud that caching and dedup are why the real version is TanStack Query."`,
    tests: [
      { it: 'manages data, loading, and error state', check: ['useState', 'error'] },
      { it: 'fetches in an effect keyed on the url', check: ['useEffect', '[url]'] },
      { it: 'returns the named-object contract', check: ['isLoading'] },
      { it: 'guards against the stale-response race', check: ['cancelled'] },
    ],
    hints: ['Extract common pattern into hook', 'Include url in deps — and handle the in-flight race with a cancelled flag', 'Return a named object: { data, isLoading, error }'],
  },
  {
    id: 83,
    title: 'Single Responsibility: component splitting',
    category: 'Engineering Practices',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Split this monolithic screen into three components:
UserHeader (avatar + name), UserStats (followers + following), UserBio (description).
Give each component narrow props — only the fields it renders.`,
    starterCode: `export default function UserProfile({ user }) {
  // This is too large — split it!
  return (
    <View>
      <Image source={{ uri: user.avatar }} />
      <Text>{user.name}</Text>
      <Text>Followers: {user.followers}</Text>
      <Text>Following: {user.following}</Text>
      <Text>{user.bio}</Text>
    </View>
  )
}`,
    solution: `function UserHeader({ avatar, name }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Image source={{ uri: avatar }} style={{ width: 48, height: 48, borderRadius: 24 }} />
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 12 }}>{name}</Text>
    </View>
  )
}

function UserStats({ followers, following }) {
  return (
    <View style={{ flexDirection: 'row', gap: 16 }}>
      <Text>{followers} followers</Text>
      <Text>{following} following</Text>
    </View>
  )
}

function UserBio({ bio }) {
  return <Text>{bio}</Text>
}

export default function UserProfile({ user }) {
  return (
    <View>
      <UserHeader avatar={user.avatar} name={user.name} />
      <UserStats followers={user.followers} following={user.following} />
      <UserBio bio={user.bio} />
    </View>
  )
}`,
    explanation: `Single Responsibility for components means one *reason to change* per component: the header changes when identity display changes, stats when the metrics change, bio when the description treatment changes. The monolith forces every one of those changes through the same file — merge conflicts, wider review surface, and a component nobody can test in isolation.

The detail that separates a senior split from a cosmetic one is the **props contract**. Passing narrow props (\`avatar\`, \`name\`) instead of the whole \`user\` object does three things: the component's dependencies are visible in its signature; it's reusable anywhere you have a name and an avatar, not just where you have this exact User shape; and \`React.memo\` becomes effective, because primitive props compare cheaply while a fresh \`user\` object reference defeats memoization every render. Passing \`user\` everywhere is SRP theater — the coupling survives the split.

Worth naming the placement framework: SOLID governs how a class or component is *designed*; GRASP governs where a responsibility *lives*. This exercise is GRASP's Information Expert applied to UI — give the rendering responsibility to the component that holds exactly the data it needs.

**Red flag:** splitting purely by visual layout while threading the entire \`user\` object into every child — you've multiplied files without reducing coupling.

**Say it:** "I split by reason-to-change and keep props narrow — each child declares exactly the fields it renders, which is also what makes memoization actually work."`,
    tests: [
      { it: 'defines the three components', check: ['UserHeader', 'UserStats', 'UserBio'] },
      { it: 'composes them in the parent', check: ['<UserHeader', '<UserStats', '<UserBio'] },
      { it: 'passes narrow props, not the whole user object', check: ['avatar={', 'followers={'] },
    ],
    hints: ['One component per responsibility', 'Narrow props: only the fields the component renders', 'Compose in parent'],
  },
  {
    id: 84,
    title: 'Custom ESLint rule idea',
    category: 'Engineering Practices',
    difficulty: 'hard',
    timeEstimate: '10 min',
    prompt: `Implement a custom ESLint rule that flags console.log statements.
Define the rule as an object with meta and create(context); the visitor checks each
CallExpression and reports when the callee is console.log (but not console.warn/error).`,
    starterCode: `// A custom ESLint rule object
const noConsoleLog = {
  meta: { type: 'suggestion' },
  create(context) {
    return {
      // Your CallExpression visitor here
    }
  },
}`,
    solution: `const noConsoleLog = {
  meta: { type: 'suggestion', docs: { description: 'disallow console.log' } },
  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.object?.name === 'console' && node.callee.property?.name === 'log') {
          context.report({ node, message: 'Unexpected console.log — use the logger service' })
        }
      },
    }
  },
}`,
    explanation: `The principle behind writing lint rules: automate every objective judgment so human review is spent on design, naming, and correctness — a reviewer flagging \`console.log\` by hand is a wasted senior, and a rule enforces the standard on every push forever, without the social cost of nitpicking a colleague.

Mechanics: ESLint parses source into an AST and your rule registers *visitors* keyed by node type. \`CallExpression\` fires for every call in the file; you inspect the callee's shape — a \`MemberExpression\` whose object is \`console\` and property is \`log\` — and \`context.report\` attaches the diagnostic to the exact node, which is what puts the squiggle on the right token. The optional chaining (\`callee.object?.name\`) is load-bearing, not style: a plain call like \`foo()\` has no \`callee.object\`, and a rule that crashes on valid code takes down the whole lint run. Rules must be total over the language.

Ecosystem context to volunteer: flat config is ESLint's current format (default since v9); TSLint was deprecated in 2019 and its rules live on in typescript-eslint; and rules can ship *autofixes* — the difference between a complaint and a correction.

**Red flag:** proposing grep or a pre-commit regex for this. Regex can't tell \`console.log(\` from a string containing it or a local variable named \`console\` — the AST is exactly why lint rules are reliable and greps are advisory.

**Say it:** "Lint rules exist so review never argues about the objective layer — I visit \`CallExpression\` nodes, match the callee shape on the AST, and report on the node so the fix lands on the right token."`,
    tests: [
      { it: 'reports console.log calls', run: "(() => { const reports = []; const visitor = noConsoleLog.create({ report: r => reports.push(r.message) }); visitor.CallExpression({ callee: { object: { name: 'console' }, property: { name: 'log' } } }); return reports.length })()", expected: 1 },
      { it: 'does not flag console.warn', run: "(() => { const reports = []; const visitor = noConsoleLog.create({ report: r => reports.push(r.message) }); visitor.CallExpression({ callee: { object: { name: 'console' }, property: { name: 'warn' } } }); return reports.length })()", expected: 0 },
      { it: 'survives plain function calls (no member callee)', run: "(() => { const reports = []; const visitor = noConsoleLog.create({ report: r => reports.push(r.message) }); visitor.CallExpression({ callee: { name: 'foo' } }); return reports.length })()", expected: 0 },
      { it: 'report message names the offense', run: "(() => { const reports = []; const visitor = noConsoleLog.create({ report: r => reports.push(r.message) }); visitor.CallExpression({ callee: { object: { name: 'console' }, property: { name: 'log' } } }); return reports[0].includes('console.log') })()", expected: true },
    ],
    hints: ['AST node type CallExpression', 'Check callee.object?.name === "console" — optional chaining so foo() doesn\'t crash the rule', 'context.report({ node, message }) to flag'],
  },
  {
    id: 85,
    title: 'Git bisect scenario',
    category: 'Engineering Practices',
    difficulty: 'hard',
    timeEstimate: '10 min',
    prompt: `Describe the git bisect workflow to find a commit that introduced a bug.
Then write a script that automates git bisect with a test command.`,
    starterCode: `# Write the git bisect commands you'd run`,
    solution: `git bisect start
git bisect bad          # current commit is broken
git bisect good v1.0    # known good tag
git bisect run npm test # runs the test at each step, auto-finds the bad commit
# git bisect run uses exit codes: 0 = good, 1-124 = bad, 125 = skip (can't test this commit)
git bisect reset        # return to the original HEAD`,
    explanation: `Bisect turns "somewhere in the last 500 commits" into nine checkouts: it binary-searches history, so the cost is O(log n) test runs instead of the O(n) of reading diffs — 1,000 commits is ~10 steps. The prerequisite is one honest \`good\` reference (a release tag beats a guess: a wrongly-marked \`good\` sends the whole search into the wrong half, and that failure mode is silent).

\`git bisect run\` is the senior move: hand it any command and it drives the entire search unattended, deciding by exit code — 0 marks the commit good, 1–124 bad, and **125 means skip** (this commit can't be tested at all, e.g. it doesn't build). The command doesn't have to be your test suite; a five-line script that greps output or curls an endpoint works, and writing a *targeted* repro script usually beats running the full suite at every step.

What bisect quietly rewards is the hygiene you had months earlier: small atomic commits that each build and pass. If half your history is broken mid-refactor commits, every bisect turns into a skip-fest — "every commit green" is not ceremony, it's what keeps bisect usable. Finish with \`git bisect reset\` to return to your original HEAD.

**Red flag:** answering "I'd read through the recent diffs" — that's linear search performed by the most expensive CPU in the room. Name the binary search and the automation.

**Say it:** "I give bisect one known-good tag and a repro script, and \`git bisect run\` binary-searches history unattended — exit code 125 skips unbuildable commits, and small green commits are what make it land on one culprit."`,
    tests: [
      { it: 'starts the bisect session', check: ['git bisect start'] },
      { it: 'marks the endpoints', check: ['git bisect bad', 'git bisect good'] },
      { it: 'automates with bisect run', check: ['git bisect run'] },
      { it: 'cleans up with reset', check: ['git bisect reset'] },
    ],
    hints: ['git bisect start/bad/good', 'git bisect run with a script — exit 0 good, 1 bad, 125 skip', 'Binary search: O(log n) checkouts through history'],
  },
  {
    id: 86,
    title: 'Code review checklist',
    category: 'Engineering Practices',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `Create a code review checklist as a comment block covering:
functionality, performance, security, testing, and style for a React Native PR.`,
    starterCode: `/*
 * Code Review Checklist
 *
 * 1. Functionality: ...
 * 2. Performance: ...
 * 3. Security: ...
 * 4. Testing: ...
 * 5. Style: ...
 */`,
    solution: `/*
 * Code Review Checklist
 *
 * 1. Functionality: Does the code solve the problem? Edge cases: empty states, offline, slow network?
 * 2. Performance: Unnecessary re-renders? List virtualization? Heavy computations memoized? Measured, not guessed?
 * 3. Security: User input validated? Tokens in Keychain/Keystore, not AsyncStorage? Deep link params sanitized? No secrets in the diff?
 * 4. Testing: Unit tests for logic? Component tests assert behavior, not internals? Error states covered?
 * 5. Style: Handled by ESLint/Prettier in CI — style comments in review mean a missing lint rule.
 */`,
    explanation: `A checklist is only half the answer; the other half is knowing *what review is for*. The principle: automate every objective judgment — formatting, imports, obvious foot-guns — so human review is spent on what machines can't judge: design, correctness, naming, and knowledge transfer. That's why item 5 in this checklist is deliberately self-erasing: if a reviewer is commenting on style, the fix is a lint rule, not a review comment. Passing lint should be a CI precondition of review, not a request made in it.

The RN-specific items are where the checklist earns its keep: tokens in Keychain/Keystore rather than unencrypted AsyncStorage (that's OWASP's insecure-storage category, not a preference), deep-link parameters treated as untrusted input, and "measured, not guessed" on performance — a review that demands \`useMemo\` everywhere without a profile is cargo cult.

Process multipliers that outweigh any checklist item: small PRs (review quality collapses with diff size), author-first descriptions (what and why before the diff, so the reviewer isn't reverse-engineering intent), and review-as-partnership — the goal is helping the author ship, with the checklist as shared standard rather than ammunition.

**Red flag:** describing review as "catching style violations and bugs" — that frames the reviewer as a gate. The linter owns style; reviewers own design, correctness, and spreading context across the team.

**Say it:** "I automate the objective layer so review is spent on design and correctness — a style comment in review means we're missing a lint rule, and small PRs are the biggest review-quality lever we have."`,
    tests: [
      { it: 'covers all five dimensions', check: ['Functionality', 'Performance', 'Security', 'Testing', 'Style'] },
      { it: 'includes RN-specific security items', check: ['Keychain'] },
      { it: 'mentions edge cases', check: ['dge case'] },
    ],
    hints: ['Cover all dimensions', 'Be specific to RN: secure storage, deep links, re-renders', 'Style belongs to the linter — reviewers own design and correctness'],
  },
]
