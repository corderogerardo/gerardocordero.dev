import type { Challenge } from '../challenges'

export const processChallenges: Challenge[] = [
  // ─── Dev Processes (87–91) ───
  {
    id: 87,
    title: 'EAS Build workflow',
    category: 'Dev Processes',
    difficulty: 'medium',
    timeEstimate: '5 min',
    prompt: `Describe the EAS Build workflow for creating a production iOS build.
List the commands from starting the build to distributing on TestFlight.`,
    starterCode: `# EAS Build workflow commands`,
    solution: `eas login                     # authenticate
eas build:configure           # create eas.json
eas build --platform ios      # start production build
eas build:list                # check build status
eas submit --platform ios     # submit to App Store Connect
# Then manage on App Store Connect -> TestFlight`,
    explanation: `The process failure this prevents: the release build that only works on one developer's Mac. A hand-run Xcode archive depends on local certificates, provisioning profiles, and Xcode version — undocumented state that walks out the door with that laptop. EAS Build moves the build to managed cloud infrastructure with credentials stored server-side, so any team member (or CI) can produce a byte-identical production artifact from a clean checkout.

The pipeline is four verbs: \`eas build:configure\` writes \`eas.json\`, whose build profiles (development / preview / production) pin environment per artifact; \`eas build --platform ios\` queues the signed build; \`eas submit\` uploads it to App Store Connect; TestFlight handles tester distribution and staged rollout from there.

The trade-off to defend: you're renting Expo's build farm instead of maintaining a macOS runner fleet. You give up some control (build queue, machine images) and gain reproducibility, managed code signing, and zero Xcode-upgrade maintenance — for most teams that trade pays for itself the first time Apple bumps the required Xcode version.

**Red flag:** describing the Xcode Organizer archive-and-upload flow as your release process. That answer says your releases depend on a person, not a pipeline.

**Say it:** "My iOS release is \`eas build --platform ios\` on a production profile plus \`eas submit\` — credentials live in EAS, not on a laptop, so the pipeline is reproducible from any machine."`,
    tests: [
      { it: 'authenticates with eas login', check: ['eas login'] },
      { it: 'starts an iOS build', check: ['eas build --platform ios'] },
      { it: 'submits to App Store Connect', check: ['eas submit'] },
      { it: 'covers TestFlight distribution', check: ['TestFlight'] },
    ],
    hints: ['eas build for CI', 'eas submit for delivery', 'eas.json profiles for envs'],
  },
  {
    id: 88,
    title: 'EAS Update channel strategy',
    category: 'Dev Processes',
    difficulty: 'medium',
    timeEstimate: '5 min',
    prompt: `Design an EAS Update channel strategy with development, staging, and production channels.
Write the eas.json configuration that maps branches to channels.`,
    starterCode: `// eas.json — write the channels config`,
    solution: `{
  "build": {
    "development": { "channel": "development" },
    "staging": { "channel": "staging" },
    "production": { "channel": "production" }
  }
}
// Then: eas update --branch staging --message "fix: ..."
// Users on staging channel receive the update`,
    explanation: `Channels exist to prevent one specific disaster: an untested JS bundle landing on production users' devices. A channel is baked into the binary at build time — a production build points at the production channel forever. A branch is where you publish updates. The channel→branch mapping is server-side, so "promote to production" is an explicit, auditable act (point the production channel at a tested branch, or republish) rather than a side effect of running the wrong command.

The strategy: one channel per environment, matching build profiles in \`eas.json\`. Developers publish freely to \`development\`; QA validates on \`staging\` builds; only vetted updates reach \`production\`. Rollback falls out of the same mechanism — republish the last known-good update and clients pick it as newest.

The safety boundary a senior states unprompted: OTA replaces JS and assets only, gated by \`runtimeVersion\`. Any native change rides a store release; an update whose runtime version doesn't match the installed binary is never served, because JS calling native code the binary lacks is an unfixable crash loop.

**Red flag:** answering "CodePush" as your current OTA tool. CodePush was retired with App Center in 2025 — EAS Update is the current answer, and naming the dead brand dates your production experience.

**Say it:** "Channels are baked into the binary, branches are where I publish — promotion to production is an explicit server-side mapping, gated by runtimeVersion so an update can never outrun its native code."`,
    tests: [
      { it: 'defines a development channel', check: ['"channel": "development"'] },
      { it: 'defines a staging channel', check: ['"channel": "staging"'] },
      { it: 'defines a production channel', check: ['"channel": "production"'] },
      { it: 'publishes with eas update to a branch', check: ['eas update --branch'] },
    ],
    hints: ['channel matches branch by convention', 'eas update targets a branch', 'Devices poll for updates'],
  },
  {
    id: 89,
    title: 'CI/CD with GitHub Actions for RN',
    category: 'Dev Processes',
    difficulty: 'hard',
    timeEstimate: '15 min',
    prompt: `Write a GitHub Actions workflow that runs on PRs to main:
1. Installs dependencies (pnpm)
2. Runs linter
3. Runs tests
4. Runs EAS build (dry-run)`,
    starterCode: `# .github/workflows/ci.yml
name: RN CI
on:
  pull_request:
    branches: [main]
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      # Your steps here`,
    solution: `name: RN CI
on:
  pull_request:
    branches: [main]
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: 'pnpm' }
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test
      - run: npx eas build --platform ios --profile preview --non-interactive`,
    explanation: `This workflow is where your SDLC choice becomes enforceable. In a waterfall-shaped process, testing is a phase — defects surface weeks after they were written, at maximum fix cost. Running lint, tests, and a build on every PR turns quality into a merge gate: "no merge without green CI and one approving review" is a written exit criterion, not a habit, and the feedback loop shrinks from weeks to minutes.

Mechanics worth naming: \`pull_request\` targeting \`main\` (not \`push\` after merge — you want the gate before integration), \`pnpm\` caching via \`setup-node\` so the gate stays fast enough that nobody routes around it, and \`--non-interactive\` because EAS in CI authenticates via an \`EXPO_TOKEN\` secret, never a login prompt. The build uses a \`preview\` profile: it proves the app still compiles and bundles without burning a production build or store credentials on every PR.

The trade-off: full native builds per PR are slow and cost build-queue minutes. Defensible middle ground — lint and unit tests on every PR, native builds on merge to \`main\` or on a label. What's non-negotiable is that the check runs before merge.

**Red flag:** a pipeline that only runs after merge to \`main\`. That's not a gate, it's an alarm that rings after the intruder is inside.

**Say it:** "CI on pull requests is my merge gate — lint, tests, and a non-interactive preview build must pass before integration, so defects are caught in minutes, not found in a release branch."`,
    tests: [
      { it: 'checks out the repo', check: ['actions/checkout'] },
      { it: 'installs dependencies with pnpm', check: ['pnpm install'] },
      { it: 'runs linter and tests', check: ['pnpm lint', 'pnpm test'] },
      { it: 'runs EAS build non-interactively for CI', check: ['eas build', '--non-interactive'] },
    ],
    hints: ['pnpm/action-setup for cache', 'eas build --non-interactive for CI', 'Matrix for iOS + Android'],
  },
  {
    id: 90,
    title: 'Code review simulation',
    category: 'Dev Processes',
    difficulty: 'medium',
    timeEstimate: '10 min',
    prompt: `Review this code snippet. Identify 3 issues and suggest fixes:
performance, style, and potential bug.`,
    starterCode: `function UserList({ users }) {
  const [filtered, setFiltered] = useState([])
  useEffect(() => {
    setFiltered(users.filter(u => u.active))
  }, [])
  return <FlatList data={filtered} renderItem={({item}) => <Text>{item.name}</Text>} />
}`,
    solution: `// Issues:
// 1. Bug: missing dependency 'users' in useEffect — only runs on mount, ignores prop changes
// 2. Performance: unnecessary state — derive filtered directly instead of useEffect
// 3. Style: missing keyExtractor on FlatList — causes re-render issues
// Fixed:
function UserList({ users }) {
  const filtered = useMemo(() => users.filter(u => u.active), [users])
  return <FlatList data={filtered} keyExtractor={item => String(item.id)} renderItem={({item}) => <Text>{item.name}</Text>} />
}`,
    explanation: `Code review is the merge gate that catches defects while they cost minutes instead of sprints — but only if the reviewer finds the defect that matters, ordered by severity, not by scroll position.

The blocking bug: the empty dependency array. The effect runs once on mount, so when the \`users\` prop changes, the list silently shows stale data. That's a correctness failure a snapshot test won't catch, because the first render is right.

The structural issue behind it: \`filtered\` is derived data stored as state. State-plus-effect to mirror a prop creates two sources of truth and an extra render per update. Deriving with \`useMemo(() => users.filter(...), [users])\` deletes the state, the effect, and the bug class in one move — the fix is less code, which is what a good review pushes toward.

Third, \`keyExtractor\`: without stable keys, FlatList falls back to index identity, causing wasted re-renders and wrong item recycling when the array reorders.

A senior review also labels findings — "blocking" versus "nit" — the same discipline as separating severity from priority in a bug tracker, so the author knows what must change before merge.

**Red flag:** leading with formatting nits while the dependency-array bug ships. Review that filters by ease of spotting instead of severity is process theater.

**Say it:** "The empty deps array is the blocking bug — stale UI on prop change; the fix is deriving with useMemo instead of mirroring props into state, plus a stable keyExtractor."`,
    tests: [
      { it: 'derives filtered data with useMemo', check: ['useMemo'] },
      { it: 'depends on users so prop changes propagate', check: ['[users]'] },
      { it: 'adds a stable keyExtractor', check: ['keyExtractor'] },
    ],
    hints: ['Check deps array', 'Derive vs store', 'keyExtractor identity'],
  },
  {
    id: 91,
    title: 'Agile estimation (story points)',
    category: 'Dev Processes',
    difficulty: 'easy',
    timeEstimate: '5 min',
    prompt: `You have a task to implement a "forgot password" flow.
Break it into subtasks and assign story points (Fibonacci: 1,2,3,5,8,13).`,
    starterCode: `// Break down "Forgot Password" flow
const subtasks = [
  // { task: '...', points: ... }
]`,
    solution: `const subtasks = [
  { task: 'Add "Forgot Password" link to login screen', points: 1 },
  { task: 'Create email input screen with validation', points: 3 },
  { task: 'Backend API endpoint for password reset email', points: 5 },
  { task: 'Email sending integration (SendGrid etc.)', points: 5 },
  { task: 'Create reset password screen with token validation', points: 3 },
  { task: 'Success/error feedback UI', points: 2 },
  { task: 'E2E test for the full flow', points: 3 },
  // Total: 22 points
]`,
    explanation: `The process failure estimation prevents: the business committing to a number whose hidden assumptions nobody wrote down. An estimate is a decision-support artifact, not a number — and the breakdown is where its honesty lives, because decomposing "forgot password" is what surfaces the work that isn't on the screen: the reset-token backend, the email-provider integration, token expiry handling, and the E2E test. Un-decomposed estimates are wrong precisely by the size of the invisible work.

Fibonacci points encode two senior ideas. First, relative sizing: you calibrate against the team's historical velocity ("yesterday's weather"), not against hours, because teams are far better at "this is like that other task" than at absolute time. Second, the widening gaps (5, 8, 13) admit that uncertainty grows with size — arguing 8 versus 9 is false precision the scale refuses to express. A 13 is a signal to split before it enters a sprint, not a task to attempt.

Note testing is a first-class subtask: if the Definition of Done says tested and reviewed, that effort belongs in the estimate, not smuggled in afterward.

**Red flag:** giving a single confident number. Padded or not, it signals you don't know estimates are probability distributions — always a range resting on stated assumptions, risks, and exclusions.

**Say it:** "I decompose until the hidden work is visible, size relatively against velocity with Fibonacci, and anything at 13 gets split — the breakdown is the estimate; the number is just its summary."`,
    tests: [
      { it: 'has at least 3 subtasks', run: 'subtasks.length >= 3', expected: true },
      { it: 'every subtask has a task description and points', run: 'subtasks.every(s => typeof s.task === "string" && s.task.length > 0 && typeof s.points === "number")', expected: true },
      { it: 'all points are on the Fibonacci scale', run: 'subtasks.every(s => [1, 2, 3, 5, 8, 13].includes(s.points))', expected: true },
      { it: 'total effort is a positive number', run: 'subtasks.reduce((sum, s) => sum + s.points, 0) > 0', expected: true },
    ],
    hints: ['Break by user-facing action', 'Fibonacci for relative sizing', 'Include testing'],
  },
]
