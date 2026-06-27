// Structured lessons for studying React Native & Expo — beginner → senior.
// HTML content rendered by <RichText /> from prep-kit.
import type { Level } from "@gerardocordero/prep-kit";

export type Lesson = {
  id: string;
  category: string;
  categoryLabel: string;
  level: Level;
  title: string;
  blurb: string;
  html: string;
};

export const LESSONS: Lesson[] = [
  // ─────────────────────────── CORE ───────────────────────────
  {
    id: "core-1",
    category: "core",
    categoryLabel: "RN CORE",
    level: "junior",
    title: "How React Native Renders: Bridge, JSI, and Hermes",
    blurb: "The thread model and execution architecture that explain every RN performance rule.",
    html: `<p>React Native runs your JavaScript on a separate thread from the UI thread. In the <b>old architecture</b> (pre-0.68), JS and native communicated via a JSON bridge — serialising every message to JSON, crossing a thread boundary, and deserialising on the other side. This was the root cause of most RN performance problems: any heavy JS work blocked the bridge and caused dropped frames.</p>
<p>The <b>New Architecture</b> (Fabric + JSI) replaces the bridge with <b>JavaScript Interface (JSI)</b> — a C++ layer that lets JS hold direct references to native objects and call native functions synchronously, without serialisation. Fabric is the new renderer: it builds the component tree in C++ and can calculate layout on any thread. Together, they eliminate the async-only constraint.</p>
<p><b>Hermes</b> is Meta's JavaScript engine optimised for React Native. Unlike V8 or JavaScriptCore, Hermes pre-compiles JS to bytecode at build time, so startup is faster and memory usage is lower. It ships as the default engine from RN 0.70 and is required for the New Architecture. You can verify it's running with <code>HermesInternal !== undefined</code>.</p>
<p>Three threads you care about: <b>JS thread</b> (runs your React code, state updates, effects), <b>UI thread</b> (renders native views, handles gestures), <b>Shadow/Layout thread</b> (Yoga layout calculations). Keep the JS thread free of synchronous work and long loops — that's the rule every performance optimisation flows from.</p>`,
  },
  {
    id: "core-2",
    category: "core",
    categoryLabel: "RN CORE",
    level: "junior",
    title: "Core Primitives: View, Text, ScrollView, and When to Use Each",
    blurb: "The handful of native components you build everything from — and their non-obvious rules.",
    html: `<p>React Native doesn't render to the DOM. Every component maps to a native widget. Knowing which primitive to reach for — and its constraints — is the first skill.</p>
<ul>
  <li><code>&lt;View&gt;</code> — the generic container. Maps to <code>UIView</code> on iOS and <code>android.view.View</code> on Android. Supports flexbox layout, touch event handlers, and style. Use it the way you'd use a <code>&lt;div&gt;</code>.</li>
  <li><code>&lt;Text&gt;</code> — all text must be wrapped in <code>&lt;Text&gt;</code>. Text nodes outside it will throw in development. <code>&lt;Text&gt;</code> inside <code>&lt;Text&gt;</code> inherits style (unlike <code>&lt;View&gt;</code>), which is useful for inline bold/italic.</li>
  <li><code>&lt;Image&gt;</code> — requires explicit <code>width</code> and <code>height</code> or the image won't render. For remote images, <code>contentFit</code> replaces the old <code>resizeMode</code> prop in Expo Image.</li>
  <li><code>&lt;ScrollView&gt;</code> — renders all children eagerly. Fine for short lists; for long ones use <code>&lt;FlatList&gt;</code> (virtualised) instead. Never nest a <code>&lt;FlatList&gt;</code> inside a <code>&lt;ScrollView&gt;</code> with the same scroll axis — the inner list won't scroll.</li>
  <li><code>&lt;TextInput&gt;</code> — the mobile keyboard input. Always pair with <code>onChangeText</code> and a state variable. <code>keyboardType</code>, <code>returnKeyType</code>, <code>autoCapitalize</code>, and <code>secureTextEntry</code> are the most-reached props.</li>
  <li><code>&lt;Pressable&gt;</code> — the modern touchable. Replaces <code>TouchableOpacity</code> and <code>TouchableHighlight</code>. Accepts a function child to apply pressed-state styles: <code>style={"{"}({"{"}pressed{"}"}) =&gt; pressed &amp;&amp; styles.pressed{"}"}</code>.</li>
</ul>`,
  },
  {
    id: "core-3",
    category: "core",
    categoryLabel: "RN CORE",
    level: "junior",
    title: "StyleSheet.create and the Layout System",
    blurb: "Why StyleSheet.create isn't optional, and how Yoga/flexbox in RN differs from the web.",
    html: `<p>React Native uses <b>Yoga</b> — a cross-platform Flexbox layout engine — instead of the browser's CSS engine. Most flexbox properties work the same, but a few differ: <code>flexDirection</code> defaults to <code>'column'</code> (not <code>row</code>), there's no <code>display: grid</code>, no CSS cascade, and units are density-independent pixels (no <code>px</code>, <code>em</code>, or <code>%</code> except in a few specific props).</p>
<p><code>StyleSheet.create({"{"}{"{"}…{"}"}{"}"}</code> is not just a naming convention. In development it validates property names and values immediately. In production, it registers the style object once and sends a numeric ID to the native thread instead of the full object on every render — reducing bridge traffic (or JSI calls). Inline style objects create new references on every render and bypass this optimisation.</p>
<p>The two layout patterns you'll use most: <b>fill the parent</b> (<code>flex: 1</code> on a child inside a parent with dimensions) and <b>stack children</b> (parent as a column/row flex container, children with <code>flex</code> or fixed sizes). Absolute positioning (<code>position: 'absolute'</code> + <code>top/right/bottom/left</code>) escapes normal flow, exactly like CSS.</p>
<p>A common gotcha: <code>overflow: 'hidden'</code> clips children on both platforms, but <code>border-radius</code> + overflow clipping behaves slightly differently on Android below API 28. If you need a clipped rounded container on Android, wrap it in a <code>View</code> with the <code>borderRadius</code> applied and use <code>overflow: 'hidden'</code> on that wrapper, not on the inner content.</p>`,
  },
  {
    id: "core-4",
    category: "core",
    categoryLabel: "RN CORE",
    level: "mid",
    title: "Component Lifecycle in React Native (Hooks Edition)",
    blurb: "Mount, update, and cleanup — and the RN-specific timing quirks that differ from web.",
    html: `<p>In function components with hooks, the lifecycle maps to: mount = first render + effects fire, update = re-render when state/props change + effects fire if deps changed, unmount = cleanup functions in <code>useEffect</code> return values run.</p>
<p><code>useEffect(() =&gt; { /* setup */ return () =&gt; { /* cleanup */ }; }, [deps])</code> — the deps array controls when the effect re-runs. Empty array = runs once on mount. No array = runs after every render (rarely useful). Specific deps = runs when those values change. The lint rule <code>react-hooks/exhaustive-deps</code> enforces correct deps — don't suppress it.</p>
<p>RN-specific considerations: <b>AppState</b> events fire when the app foregrounds/backgrounds — subscribe in a <code>useEffect</code> and remove the listener in the cleanup. <b>BackHandler</b> (Android) needs a similar pattern. Forgetting to remove these listeners is a common memory leak.</p>
<p>One important difference from web: the JS thread doesn't pause when the app backgrounds — your code keeps running. If you have a polling interval or animation running, you should pause it on <code>AppState</code> → <code>'background'</code> and resume on <code>'active'</code>, both for battery and correctness. React Navigation provides <code>useFocusEffect</code> which triggers when a screen comes into focus within the stack — useful for refreshing data that may have changed while navigating away.</p>`,
  },
  {
    id: "core-5",
    category: "core",
    categoryLabel: "RN CORE",
    level: "mid",
    title: "Platform-Specific Code: Platform.OS, .ios.ts, and Platform.select",
    blurb: "Three patterns for writing code that behaves differently on iOS vs Android — and when to use each.",
    html: `<p>React Native apps run on multiple platforms from one codebase. Three tools let you diverge when you need to.</p>
<p><b>1. <code>Platform.OS</code> inline</b> — use for single-value differences: <code>paddingTop: Platform.OS === 'ios' ? 44 : 0</code>. Simple but scatters platform checks throughout the file. Good for one-off values.</p>
<p><b>2. <code>Platform.select({"{"} ios: …, android: …, default: … {"}"})</code></b> — cleaner for larger objects: <code>StyleSheet.create({"{"} container: Platform.select({"{"} ios: iosStyles, android: androidStyles {"}"}) {"}"})</code>. Returns the matching platform's value at runtime.</p>
<p><b>3. Platform-specific file extensions</b> — <code>Button.ios.tsx</code> and <code>Button.android.tsx</code> let Metro/Expo bundle the right file automatically. Import as <code>import Button from './Button'</code> and Metro resolves to the correct platform file. Use this when platform implementations diverge significantly — it keeps each file clean.</p>
<p>A fourth option for Expo-managed apps: the <code>Platform.Version</code> check for OS version-specific behaviour (e.g., <code>Platform.Version &gt;= 14</code> for iOS 14+ APIs). Combine this with <code>Platform.OS</code> for a platform+version guard. For device-capability checks (has notch? has dynamic island?), <code>expo-device</code> provides <code>modelId</code> and screen dimension helpers — don't hard-code pixel cutoffs.</p>`,
  },

  // ─────────────────────────── EXPO ───────────────────────────
  {
    id: "expo-1",
    category: "expo",
    categoryLabel: "EXPO SDK",
    level: "junior",
    title: "Managed vs Bare Workflow: The Real Trade-off",
    blurb: "What Expo's managed workflow actually controls — and when bare is worth the cost.",
    html: `<p><b>Managed workflow</b> means Expo owns the native project files (<code>ios/</code> and <code>android/</code> directories don't exist in your repo). You configure native behaviour through <code>app.json</code> / <code>app.config.js</code> and Expo config plugins. The build runs on EAS Build (cloud) which generates native projects on the fly. You never manually open Xcode or Android Studio for routine work.</p>
<p><b>Bare workflow</b> means you've run <code>npx expo prebuild</code> (or started with <code>npx react-native init</code>). The <code>ios/</code> and <code>android/</code> directories live in your repo and you control them directly. You can use any native library, write native code freely, and customise the build in any way. The cost: you own the native projects. Every React Native upgrade may require manual migration of those directories.</p>
<p>The practical guide: <b>start managed</b>. The managed workflow supports 99% of app features through Expo SDK modules, and config plugins let you extend native behaviour without ejecting. Run <code>npx expo prebuild</code> only when you need something a plugin can't express — and even then, commit the generated files so CI can build them. The old concept of "ejecting" is gone; prebuild is the replacement and it's reversible (you can delete and regenerate the native directories).</p>
<p>One critical nuance: <b>EAS Build is not optional in managed workflow</b> for production apps. You cannot produce a signed IPA/APK without EAS Build (or a local simulator build with <code>npx expo run:ios</code>). The managed workflow trades local build control for cloud build convenience.</p>`,
  },
  {
    id: "expo-2",
    category: "expo",
    categoryLabel: "EXPO SDK",
    level: "mid",
    title: "Config Plugins: Extending Native Without Ejecting",
    blurb: "How Expo plugins work, how to write one, and when you actually need to.",
    html: `<p>A <b>config plugin</b> is a function that runs during <code>npx expo prebuild</code> and modifies the generated native projects. It receives the Expo config and returns a modified version, with hooks to touch <code>AndroidManifest.xml</code>, <code>Info.plist</code>, Gradle files, or any native file the build produces.</p>
<p>Most Expo SDK modules ship with their own config plugin — you just list the module name in the <code>plugins</code> array of <code>app.config.js</code> and prebuild wires the native code. You only write a custom plugin when you need a native change that no existing plugin covers: adding a custom permission, injecting a build flag, writing a new XML file, or setting a specific AndroidManifest attribute.</p>
<p>A minimal plugin structure:</p>
<pre><code>// plugins/withMyFeature.ts
import { ConfigPlugin, withAndroidManifest } from '@expo/config-plugins';
const withMyFeature: ConfigPlugin = (config) =&gt;
  withAndroidManifest(config, async (mod) =&gt; {
    mod.modResults.manifest.$['android:usesCleartextTraffic'] = 'false';
    return mod;
  });
export default withMyFeature;</code></pre>
<p>Register it in <code>app.config.js</code>: <code>plugins: ['./plugins/withMyFeature']</code>. Run <code>npx expo prebuild</code> to see the change applied to the generated native files. The generated native directories can be regenerated at any time — treat them as a build output, not a source of truth, and git-ignore them if you always prebuild on CI.</p>`,
  },
  {
    id: "expo-3",
    category: "expo",
    categoryLabel: "EXPO SDK",
    level: "mid",
    title: "EAS Build: Build Profiles, Credentials, and What Happens in the Cloud",
    blurb: "What EAS Build actually does, how build profiles work, and the credential model.",
    html: `<p>EAS Build runs your native build on Expo's infrastructure. You define <b>build profiles</b> in <code>eas.json</code> — named configurations (like <code>development</code>, <code>preview</code>, <code>production</code>) that control the platform, distribution type, environment variables, and whether credentials are needed.</p>
<p>A typical <code>eas.json</code>:</p>
<pre><code>{
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "preview":     { "distribution": "internal" },
    "production":  { "autoIncrement": true }
  }
}</code></pre>
<p><b>Credentials:</b> for iOS you need an Apple Developer team, a Distribution Certificate, and a Provisioning Profile. For Android, a keystore. EAS Credentials (<code>eas credentials</code>) generates and stores these on Expo's servers, encrypted. In CI you only need <code>EXPO_TOKEN</code> — EAS fetches credentials automatically. Never commit keystores or <code>.p12</code> files to the repo.</p>
<p>The build flow: you run <code>eas build --platform ios --profile production</code>, EAS checks out your commit on a Mac builder (for iOS) or Linux (for Android), runs <code>npx expo prebuild</code> if needed, installs pods/Gradle deps, builds the native binary, signs it with your credentials, and uploads the artifact. The build logs are fully visible in the EAS dashboard. You get a download link or auto-submit to the stores depending on your profile config.</p>`,
  },
  {
    id: "expo-4",
    category: "expo",
    categoryLabel: "EXPO SDK",
    level: "mid",
    title: "OTA Updates with EAS Update: What Changes and What Doesn't",
    blurb: "The JS-bundle update model, the update channels, and the limits you must understand.",
    html: `<p><b>EAS Update</b> (formerly Expo Updates) lets you push JS bundle changes to users without going through the App Store or Play Store review process. It updates the JavaScript layer only — no native code changes, no new binary, no review wait.</p>
<p>The model: you publish an update with <code>eas update --branch production --message "fix layout"</code>. On next app launch (or after a configurable background check interval), the app downloads the new bundle and applies it on the subsequent launch. You can configure <code>UpdatesConfig</code> in <code>app.json</code> to control the check interval and whether updates are applied immediately or on next restart.</p>
<p><b>What OTA can update:</b> all JavaScript and TypeScript code, assets bundled with the JS (images, fonts via <code>require()</code>), and JSON data files. <b>What it cannot update:</b> native code (Swift, Kotlin, Objective-C, Java), new native dependencies (anything that requires a CocoaPods or Gradle change), changes to <code>Info.plist</code> / <code>AndroidManifest.xml</code>, or new Expo SDK modules added after the binary was built.</p>
<p>Channels let you stage rollouts: <code>eas update --branch staging</code> for your test group, <code>eas update --branch production</code> for all users. You link a channel to a build profile in <code>eas.json</code> with <code>"channel": "production"</code>. Critical rule: the update's SDK version must match the installed binary — pushing an update built against SDK 52 to a device running an SDK 51 binary will be ignored (or crash). EAS Update enforces this runtime version check.</p>`,
  },
  {
    id: "expo-5",
    category: "expo",
    categoryLabel: "EXPO SDK",
    level: "mid",
    title: "expo-router: File-Based Routing from Zero to Production",
    blurb: "The routing model, layouts, and the patterns that make expo-router scale.",
    html: `<p>expo-router brings the Next.js file-based routing mental model to React Native. Files in the <code>app/</code> directory become routes: <code>app/index.tsx</code> is <code>/</code>, <code>app/profile.tsx</code> is <code>/profile</code>, <code>app/settings/index.tsx</code> is <code>/settings</code>.</p>
<p><b>Layouts:</b> <code>_layout.tsx</code> files wrap every route in the same directory. They're where you add tab bars (<code>&lt;Tabs&gt;</code>), navigation stacks (<code>&lt;Stack&gt;</code>), drawers, or providers that all child screens share. The root <code>app/_layout.tsx</code> wraps the entire app — where you put auth guards, providers, and the splash screen logic.</p>
<p><b>Dynamic routes:</b> <code>app/post/[id].tsx</code> matches <code>/post/123</code>. Inside, <code>useLocalSearchParams&lt;{"{"} id: string {"}"}&gt;()</code> gives you typed access to the segment. For catch-all routes: <code>app/[...rest].tsx</code>. For groups that share a layout without affecting the URL: <code>app/(auth)/login.tsx</code> — the parentheses make the segment invisible in the URL.</p>
<p>Navigation is <code>router.push('/profile')</code>, <code>router.replace('/login')</code>, or <code>&lt;Link href="/profile"&gt;</code>. Modals: <code>&lt;Stack.Screen options={"{"}{ presentation: 'modal' }{"}"} /&gt;</code> inside the layout. expo-router integrates deeply with deep links and Universal Links — if you configure <code>scheme</code> in <code>app.json</code> and <code>associatedDomains</code> for Universal Links, expo-router handles route parsing automatically.</p>`,
  },

  // ─────────────────────────── DATA & STATE ───────────────────────────
  {
    id: "data-1",
    category: "data",
    categoryLabel: "DATA & STATE",
    level: "junior",
    title: "useState vs useReducer: Choosing the Right Tool",
    blurb: "The decision rule — and why the wrong choice makes components hard to reason about.",
    html: `<p>Both hooks manage state in a function component — the difference is the shape of the update logic. <code>useState</code> is a setter: you call it with the next value (or a function of the old value). <code>useReducer</code> is a dispatch: you send a typed action and a pure function computes the next state.</p>
<p>Reach for <code>useState</code> when: the state is a single value or a small group of independent values, updates are simple assignments, and the component is local and not shared. <code>const [count, setCount] = useState(0)</code> — the setter is the whole API.</p>
<p>Reach for <code>useReducer</code> when: state transitions are complex (multiple fields that change together), the next state depends on the previous state in non-trivial ways, or you want the update logic testable in isolation. A reducer is a pure function — you can unit test every transition without rendering a component.</p>
<p>A practical signal: if you find yourself writing three related <code>useState</code> calls and the setters always fire together (<code>setLoading(true); setData(null); setError(null)</code>), consolidate them into one <code>useReducer</code> with a <code>{ loading, data, error }</code> state shape. The reducer makes the transitions explicit and prevents the "partial update" bugs where one setter fires but another doesn't.</p>`,
  },
  {
    id: "data-2",
    category: "data",
    categoryLabel: "DATA & STATE",
    level: "mid",
    title: "Zustand in React Native: Stores, Selectors, and Persistence",
    blurb: "How Zustand's subscription model avoids re-renders — and how to persist to AsyncStorage.",
    html: `<p>Zustand stores are created outside React with <code>create()</code>. A store is a function that receives <code>set</code> and returns an object with state and actions. Components subscribe via a selector function — they re-render only when the selected slice changes, not on every store update.</p>
<pre><code>const useTaskStore = create&lt;TaskState&gt;((set) =&gt; ({
  tasks: [] as Task[],
  addTask: (t) =&gt; set((s) =&gt; ({ tasks: [...s.tasks, t] })),
  removeTask: (id) =&gt; set((s) =&gt; ({ tasks: s.tasks.filter(t =&gt; t.id !== id) })),
}));</code></pre>
<p>Selector discipline is the key performance lever: <code>const tasks = useTaskStore(s =&gt; s.tasks)</code> subscribes only to <code>tasks</code>. If you write <code>const store = useTaskStore()</code> (no selector), the component re-renders on any store change. For objects, combine with <code>shallow</code> from Zustand: <code>useTaskStore(s =&gt; ({ tasks: s.tasks, add: s.addTask }), shallow)</code>.</p>
<p>Persistence: wrap the store with <code>persist</code> middleware from <code>zustand/middleware</code>. In React Native, you need to provide a custom storage that wraps AsyncStorage:</p>
<pre><code>import AsyncStorage from '@react-native-async-storage/async-storage';
const storage = { getItem: AsyncStorage.getItem, setItem: AsyncStorage.setItem, removeItem: AsyncStorage.removeItem };
create(persist(myStore, { name: 'task-store', storage: createJSONStorage(() =&gt; storage) }));</code></pre>
<p>For sensitive data, replace <code>AsyncStorage</code> with <code>expo-secure-store</code> in the same adapter. Note that <code>expo-secure-store</code> values are strings only — <code>createJSONStorage</code> handles serialisation for you.</p>`,
  },
  {
    id: "data-3",
    category: "data",
    categoryLabel: "DATA & STATE",
    level: "mid",
    title: "React Query in React Native: Fetching, Caching, and Background Refresh",
    blurb: "The query key model, stale-while-revalidate, and the RN-specific AppState integration.",
    html: `<p>React Query (<code>@tanstack/react-query</code>) manages server state — data that lives on a server and needs to be fetched, cached, and kept fresh. It separates server state from UI state (which Zustand/useState handle) and handles the async lifecycle that you'd otherwise write by hand: loading, error, refetch, retry, pagination, and optimistic updates.</p>
<p>The mental model: every query has a <b>query key</b> (an array). React Query caches results by key. <code>useQuery({ queryKey: ['task', id], queryFn: () =&gt; fetchTask(id) })</code> — on mount it checks the cache; if data exists and is fresh (within <code>staleTime</code>), it returns it immediately without a network call. If stale, it returns the cached data immediately (fast UI) and refetches in the background (stale-while-revalidate).</p>
<p>React Native integration tip: React Query's <code>QueryClient</code> has an <code>onlineManager</code> and a focus manager. On the web, focus manager uses the window focus event. In RN, you should wire it to <code>AppState</code> so queries refetch when the app foregrounds:</p>
<pre><code>import { focusManager } from '@tanstack/react-query';
AppState.addEventListener('change', (state) =&gt; {
  focusManager.setFocused(state === 'active');
});</code></pre>
<p>Mutations (<code>useMutation</code>) handle writes. Use <code>onSuccess</code> to invalidate the relevant query keys and trigger a refetch: <code>queryClient.invalidateQueries({ queryKey: ['tasks'] })</code>. For optimistic updates, set data immediately in <code>onMutate</code> and roll back in <code>onError</code>.</p>`,
  },
  {
    id: "data-4",
    category: "data",
    categoryLabel: "DATA & STATE",
    level: "mid",
    title: "AsyncStorage: The Right and Wrong Uses",
    blurb: "What AsyncStorage actually is, what it's safe for, and what to use instead for sensitive data.",
    html: `<p><code>@react-native-async-storage/async-storage</code> is a simple key-value store backed by plain files on disk: on Android in <code>/data/data/&lt;package&gt;/files/</code>, on iOS in the app's <code>Documents/</code> directory. Both locations are accessible to backups (iTunes/ADB) and — on rooted/jailbroken devices — to any process with elevated permissions. The data is <b>plaintext</b>.</p>
<p><b>Safe to store in AsyncStorage:</b> UI preferences (dark mode, language), feature flags, cached non-sensitive API responses, onboarding completion flags, shopping cart state, non-financial local data. Anything where leakage causes embarrassment but not financial or personal harm.</p>
<p><b>Never store in AsyncStorage:</b> auth tokens (access or refresh), passwords, PINs, payment card data, social security numbers, health records, private keys, or any credential that grants access to an account. For these, use <code>expo-secure-store</code>, which writes to the iOS Keychain and Android Keystore — hardware-backed, backup-excluded, and app-sandboxed.</p>
<p>AsyncStorage is asynchronous and returns Promises. Common mistake: reading a value and assuming it's ready before the first render. Pattern: read in <code>useEffect</code> (or during app init in a loading screen) and hold a loading state until the read resolves. For Zustand stores, the <code>persist</code> middleware handles this with a <code>hasHydrated</code> signal you can await before rendering protected screens.</p>`,
  },
  {
    id: "data-5",
    category: "data",
    categoryLabel: "DATA & STATE",
    level: "senior",
    title: "Offline-First Architecture: Queues, Sync, and Conflict Resolution",
    blurb: "Designing a React Native app that works without a network connection and syncs reliably when it returns.",
    html: `<p>An offline-first app treats the local database as the source of truth and the server as a sync target — the opposite of the typical "fetch, then render" model. Users can create, edit, and delete data without a connection; changes are queued and synced when the network returns.</p>
<p><b>The three components:</b> a <b>local store</b> (SQLite via <code>expo-sqlite</code>, or a structured key-value store), a <b>sync queue</b> (pending operations persisted to disk so they survive app kills), and a <b>sync engine</b> (background process that drains the queue, handles retries, and resolves conflicts).</p>
<p><b>Conflict resolution</b> is the hard part. Three strategies: <b>last-write-wins</b> (every record has a server timestamp; highest timestamp wins — simple but loses concurrent edits), <b>operational transforms</b> (merge character-level changes, used by collaborative editors like Notion — complex but lossless), and <b>vector clocks / CRDTs</b> (data structures that merge automatically without central coordination — ideal for append-only or set-like data). For most CRUD apps, last-write-wins per-field with a conflict notification ("this item was edited on another device") is sufficient and practical.</p>
<p>React Native tools: <code>expo-sqlite</code> for structured local data, <code>@react-native-community/netinfo</code> for reachability detection, React Query's <code>networkMode: 'always'</code> to queue mutations offline. For production offline-first apps, consider WatermelonDB (a lazy-loading, observable SQLite layer designed for RN) or PowerSync/Triplit for built-in cloud sync.</p>`,
  },

  // ─────────────────────────── NAVIGATION ───────────────────────────
  {
    id: "nav-1",
    category: "navigation",
    categoryLabel: "NAVIGATION",
    level: "junior",
    title: "Navigation Patterns: Stack, Tabs, Modals, and Drawers",
    blurb: "The four navigation containers and which UX pattern each is designed for.",
    html: `<p>React Native apps combine navigation containers to build their UX hierarchy. In expo-router, these map directly to file-system layout components.</p>
<p><b>Stack</b> (<code>&lt;Stack&gt;</code>) is a push/pop navigation — the classic screen-slides-in-from-right pattern. Use it for detail screens, forms, and any drill-down flow. The header with a back button is provided automatically. <code>router.push('/detail')</code> adds to the stack; <code>router.back()</code> pops.</p>
<p><b>Tabs</b> (<code>&lt;Tabs&gt;</code>) render a bottom tab bar (or top on Android, though bottom is the native convention). Each tab maintains its own navigation stack independently — navigating within one tab doesn't affect another. Good for top-level app sections that users switch between frequently. Don't nest tabs inside stacks at the same level; it breaks the UX expectation.</p>
<p><b>Modals</b> — a stack screen with <code>presentation: 'modal'</code> slides up from the bottom (iOS sheet pattern) or renders full-screen. Use for contextual actions that don't deserve a new "home" (a new-item form, a picker, a confirmation dialog). The user dismisses it and returns to where they were.</p>
<p><b>Drawers</b> (<code>@react-navigation/drawer</code>) slide in from the side. Use sparingly — they're less discoverable on mobile than tab bars and are often a sign that the information architecture needs simplifying. Best for admin/settings-heavy apps or when the number of top-level sections exceeds what fits in a tab bar (5 is the practical limit).</p>`,
  },
  {
    id: "nav-2",
    category: "navigation",
    categoryLabel: "NAVIGATION",
    level: "mid",
    title: "expo-router Layouts: _layout.tsx, Groups, and Slot",
    blurb: "How layout files compose to wrap screens without re-rendering the entire tree.",
    html: `<p>In expo-router, every <code>_layout.tsx</code> file acts as a persistent wrapper for all routes in its directory. The key insight: the layout renders once and stays mounted — only the screen content (the child route) changes when you navigate. This is how tab bars and headers stay stable while the content switches.</p>
<p><b>Route groups</b> (<code>(groupName)</code>) let you share a layout between routes without adding a URL segment. <code>app/(auth)/_layout.tsx</code> can add an auth guard; <code>app/(auth)/login.tsx</code> and <code>app/(auth)/register.tsx</code> both get the guard, but the URLs are <code>/login</code> and <code>/register</code> (no <code>/auth/</code> prefix).</p>
<p><b><code>&lt;Slot&gt;</code></b> is the placeholder inside a layout that renders the current child route. Use it when you want to wrap a route in something custom without adding a Stack or Tabs navigator:</p>
<pre><code>// app/(protected)/_layout.tsx
export default function ProtectedLayout() {
  const { user } = useAuth();
  if (!user) return &lt;Redirect href="/login" /&gt;;
  return &lt;Slot /&gt;; // render the matched child route
}</code></pre>
<p>Nested layouts compose: a root <code>_layout.tsx</code> with tabs, each tab's directory with its own Stack layout. The stack header renders inside the tab bar content area — it doesn't fight the tab bar for space. For maximum control, use <code>Stack.Screen</code> inside a screen file to set per-screen options (title, header right button, presentation style) without touching the layout file.</p>`,
  },
  {
    id: "nav-3",
    category: "navigation",
    categoryLabel: "NAVIGATION",
    level: "mid",
    title: "Deep Links and Universal Links in Expo",
    blurb: "How custom URL schemes and Universal Links differ, and how expo-router handles both.",
    html: `<p>Deep links open your app to a specific screen from outside — another app, a browser, an email. Two mechanisms: <b>custom URL schemes</b> (<code>myapp://profile/123</code>) and <b>Universal Links</b> (iOS) / <b>App Links</b> (Android) — regular HTTPS URLs (<code>https://myapp.com/profile/123</code>) that the OS routes to your app instead of the browser.</p>
<p>Custom schemes are easy to implement but have a security problem: any other app can register the same scheme and intercept your deep links. Never put sensitive tokens (password reset, OAuth codes) in custom scheme URLs. Universal Links are cryptographically bound to your domain via an HTTPS-served JSON file (<code>apple-app-site-association</code> for iOS, <code>assetlinks.json</code> for Android) that only you control — they're the right choice for any sensitive flow.</p>
<p>In Expo: set <code>"scheme": "myapp"</code> in <code>app.json</code> for the custom scheme. For Universal Links add <code>"associatedDomains": ["applinks:myapp.com"]</code> in the <code>ios</code> config and configure <code>intentFilters</code> in the <code>android</code> config. Serve the AASA/assetlinks files from your domain with the correct headers (<code>Content-Type: application/json</code> without redirect).</p>
<p>expo-router handles both automatically — the URL is parsed into the same file-system route tree. A URL <code>myapp://profile/123</code> or <code>https://myapp.com/profile/123</code> both resolve to <code>app/profile/[id].tsx</code> if your route is set up correctly. Test with <code>npx uri-scheme open myapp://profile/123 --ios</code> on a simulator.</p>`,
  },
  {
    id: "nav-4",
    category: "navigation",
    categoryLabel: "NAVIGATION",
    level: "mid",
    title: "Typed Route Params and useLocalSearchParams",
    blurb: "How to pass data between screens safely, with full TypeScript coverage in expo-router.",
    html: `<p>In expo-router, route parameters come from two sources: <b>path segments</b> (<code>/post/[id]</code> — the <code>id</code> part) and <b>search params</b> (<code>/search?q=react</code>). Both are accessed via <code>useLocalSearchParams()</code>, which returns a record of string values.</p>
<p>Typed access: <code>const { id } = useLocalSearchParams&lt;{"{"} id: string {"}"}&gt;()</code>. expo-router provides a Typed Routes feature (beta as of SDK 52) where you can declare param shapes and get end-to-end type safety on <code>router.push</code> and <code>useLocalSearchParams</code>.</p>
<p>Passing complex data: search params are strings, so for objects either stringify (<code>JSON.stringify</code>) and parse on arrival, or — better — pass only an ID and fetch the data in the destination screen from a shared store. Encoding large payloads in the URL is fragile and breaks the URL as a bookmark.</p>
<p><code>useLocalSearchParams</code> vs <code>useGlobalSearchParams</code>: local returns params for the <b>current</b> screen only; global returns the params of the currently focused route anywhere in the navigator tree. Use local 99% of the time — global is for cases where a parent layout needs to read a child screen's params, which is usually a sign of an architectural issue. For sharing state between sibling screens, a Zustand store or React context is cleaner than reading global params.</p>`,
  },
  {
    id: "nav-5",
    category: "navigation",
    categoryLabel: "NAVIGATION",
    level: "senior",
    title: "Auth Flows: Redirect Guards, Protected Routes, and Session Restore",
    blurb: "The correct pattern for protecting routes and restoring sessions without layout flicker.",
    html: `<p>Auth flows in expo-router have one key challenge: the app renders before it knows whether the user is authenticated (async session restore). The naive approach — conditionally rendering a login screen — produces a flash of the protected content before the redirect fires.</p>
<p>The correct pattern: <b>hold rendering until auth state is known</b>. Keep a <code>loading</code> flag that starts <code>true</code>, attempt to restore the session (<code>SecureStore.getItemAsync('refresh_token')</code> + a token refresh), then set <code>loading = false</code> with either an authenticated or unauthenticated state. During loading, return <code>null</code> or the SplashScreen — never render the protected routes.</p>
<pre><code>// app/_layout.tsx
export default function RootLayout() {
  const { user, loading } = useAuthStore();
  useEffect(() =&gt; { if (!loading) SplashScreen.hideAsync(); }, [loading]);
  if (loading) return null;
  return (
    &lt;Stack&gt;
      &lt;Stack.Screen name="(auth)" redirect={!user ? false : true} /&gt;
      &lt;Stack.Screen name="(app)"  redirect={user  ? false : true} /&gt;
    &lt;/Stack&gt;
  );
}</code></pre>
<p>expo-router's <code>&lt;Redirect&gt;</code> component or the <code>redirect</code> prop on <code>Stack.Screen</code> fire synchronously within the render — no flash. The route group approach (<code>(auth)</code> for login screens, <code>(app)</code> for protected screens) with Slot-based layouts in each group cleanly separates auth and app navigation without conditional logic scattered across every screen.</p>`,
  },

  // ─────────────────────────── PERFORMANCE ───────────────────────────
  {
    id: "perf-1",
    category: "performance",
    categoryLabel: "PERFORMANCE",
    level: "mid",
    title: "useMemo and useCallback: When They Help and When They Hurt",
    blurb: "The mental model for memoisation — and why overusing it makes performance worse.",
    html: `<p><code>useMemo</code> caches a computed value; <code>useCallback</code> caches a function reference. Both only help when: (1) the computation is expensive, OR (2) the result is passed as a prop to a <code>React.memo</code>-wrapped child or a hook dep that compares by reference.</p>
<p>When they do NOT help (and add cost): wrapping a cheap computation (<code>useMemo(() =&gt; a + b, [a, b])</code> — the overhead of running the memo logic exceeds the cost of the addition), or stabilising a function that isn't passed anywhere deps-sensitive. Every <code>useMemo</code>/<code>useCallback</code> call adds to React's bookkeeping — the hook has to store the previous deps, compare them on every render, and decide whether to return the cached value or recompute.</p>
<p>The right question before memoising: <b>do I have a measured performance problem caused by this specific value/function changing?</b> Profile first with React DevTools (the Profiler tab) or with <code>why-did-you-render</code>. If a child re-renders unnecessarily because a callback prop changes identity on every render, that's when <code>useCallback</code> pays for itself.</p>
<p><code>React.memo</code> wraps a component and skips re-render if all props are shallowly equal. It's most valuable for <b>list items</b> (rendered many times, expensive subtrees) and <b>heavy pure components</b> that receive stable props. Combining <code>React.memo</code> on the child with <code>useCallback</code>/<code>useMemo</code> for the props it receives is the correct pattern — neither alone is complete.</p>`,
  },
  {
    id: "perf-2",
    category: "performance",
    categoryLabel: "PERFORMANCE",
    level: "mid",
    title: "FlatList vs FlashList: Windowing, Recycling, and When It Matters",
    blurb: "How virtualisation works in React Native and when FlashList is worth the dependency.",
    html: `<p><b>Virtualisation</b> means only the rows visible on screen (plus a small buffer) are rendered as native views. Rows that scroll off-screen are unmounted (or their views recycled). Without it, a 1000-item list creates 1000 native views up front — slow initial render and high memory usage.</p>
<p><code>FlatList</code> (built into React Native) virtualises by default. Key performance props: <code>keyExtractor</code> (stable unique key per item, avoid array index), <code>getItemLayout</code> (if all items are the same height, providing this avoids measuring every row and dramatically speeds up scrollToOffset/scrollToIndex), <code>windowSize</code> (default 21 — number of viewport heights to render above/below the visible area; reduce to 5–7 for memory-heavy lists), <code>initialNumToRender</code> (items to render before the first paint; set to the number visible on screen).</p>
<p><b>FlashList</b> (<code>@shopify/flash-list</code>) recycles native views (like RecyclerView on Android / UICollectionView on iOS). Instead of unmounting off-screen items, it reuses the existing views and updates their content — no native view creation/destruction cost. This is faster for fast scrolling through long lists and measurably reduces frame drops on large feeds. The trade-off: slightly more complex API, and items must have a consistent size type (<code>overrideItemType</code>) for best recycling.</p>
<p>Decision rule: for fewer than ~100 items, FlatList is fine. For feeds that can grow to hundreds or thousands of items, FlashList is the upgrade worth taking. Always test on a real low-end device (not the simulator) — the difference only shows up in realistic conditions.</p>`,
  },
  {
    id: "perf-3",
    category: "performance",
    categoryLabel: "PERFORMANCE",
    level: "mid",
    title: "Image Optimisation in React Native",
    blurb: "Format choices, caching, and why Expo Image replaces the built-in Image component.",
    html: `<p>Images are the number-one source of memory pressure in most React Native apps. Unoptimised images cause janky scrolling, OOM crashes on low-end Android, and slow time-to-first-meaningful-paint.</p>
<p><b>Format:</b> prefer WebP over JPEG/PNG for network images — same quality at 25–35% smaller file size. For icons and logos, SVG (via <code>react-native-svg</code>) scales without quality loss and has zero size penalty. PNG only for images that require transparency and can't use WebP.</p>
<p><b>Expo Image</b> (<code>expo-image</code>) is the replacement for the built-in <code>&lt;Image&gt;</code> component. It adds: disk and memory caching (so the same image URL doesn't re-download), blurhash placeholder (a tiny hash that renders a blurred preview while loading), priority loading (<code>priority="high"</code> for above-the-fold images), and the modern <code>contentFit</code>/<code>contentPosition</code> props replacing <code>resizeMode</code>. It uses Glide (Android) and SDWebImage (iOS) under the hood — battle-tested native image loaders.</p>
<p>Sizing: always specify explicit <code>width</code> and <code>height</code> or use <code>style={"{"}{"{"}flex: 1{"}"}{"}"}</code> in a bounded container. Images without dimensions don't render until the native side measures them — a visible layout shift. For remote images of unknown dimensions, fetch the dimensions first or use an aspect-ratio container (<code>aspectRatio: 16/9</code> + <code>width: '100%'</code>).</p>`,
  },
  {
    id: "perf-4",
    category: "performance",
    categoryLabel: "PERFORMANCE",
    level: "senior",
    title: "Profiling React Native: DevTools, Systrace, and What to Look For",
    blurb: "The tools for finding dropped frames, slow JS, and native-side bottlenecks — and how to read the output.",
    html: `<p>Three profiling tools, from easiest to deepest:</p>
<p><b>React DevTools Profiler</b> — shows which components re-rendered during a recorded interaction and how long they took. Look for: components with a high "Render duration" bar that shouldn't be re-rendering (the grey "did not render" state is your target for static components), large trees that re-render when only one leaf changed (a missing <code>React.memo</code>), and the "Why did this render?" tool that names the prop or state that triggered the re-render.</p>
<p><b>Flipper (JS/Metro profiler)</b> — Flipper's Performance tab captures CPU profiles of the JS thread. Look for: long tasks that block the JS thread (the thread can only do one thing at a time), synchronous storage reads blocking renders, and expensive serialisation (JSON.parse of large payloads on the main thread). Move long computations to a background thread with <code>expo-task-manager</code> or to a worklet with Reanimated.</p>
<p><b>Systrace / Android GPU profiler / Xcode Instruments</b> — the native layer. For iOS: Instruments' Core Animation template shows frame timing. For Android: <code>adb shell atrace</code> or the GPU profiler in Android Studio. Use these when you've ruled out JS-thread issues and suspect layout inflation, expensive native measure passes, or shader compilation stutter (the "jank on first scroll" problem on Android — use <code>initialNumToRender</code> and warm-up the GPU before the list is shown).</p>
<p>The universal diagnosis flow: frame drop → is the JS thread pegged? (Profiler) → is it a re-render problem? (DevTools) → is it a native draw problem? (Systrace/Instruments). Fix the outermost layer first.</p>`,
  },
  {
    id: "perf-5",
    category: "performance",
    categoryLabel: "PERFORMANCE",
    level: "senior",
    title: "React Native Animations: Animated API vs Reanimated vs Skia",
    blurb: "Which animation library is right for which use case — and why running on the UI thread matters.",
    html: `<p>React Native's built-in <code>Animated</code> API drives animations by passing values across the bridge (or JSI in New Architecture). Simple animations (fade, translate) work fine, but any animation that updates every frame needs a frame-by-frame value calculated on the JS thread — and any JS work that takes too long drops the frame. This is why complex gesture-driven animations feel laggy with the basic Animated API.</p>
<p><b>React Native Reanimated</b> (<code>react-native-reanimated</code>) solves this by running animation logic as <b>worklets</b> — small functions compiled to run directly on the UI thread. Gesture callbacks, spring physics, and interpolations all execute without touching the JS thread. The result: silky 60/120fps animations even if the JS thread is busy. The API: <code>useSharedValue</code> (a value that lives on the UI thread), <code>useAnimatedStyle</code> (derives styles from shared values, runs on UI thread), and <code>withSpring</code>/<code>withTiming</code> animation functions.</p>
<p><b>React Native Skia</b> (<code>@shopify/react-native-skia</code>) is for <b>custom rendering</b> — drawing paths, gradients, blur effects, and animations that the native view system can't express. It runs a Skia canvas on a separate thread, independent of both JS and the UI thread. Reach for it when you need chart animations, particle effects, custom UI that looks identical on both platforms, or blur/filter effects without the GPU limitations of <code>Blur</code> components.</p>
<p>Decision: simple show/hide → <code>Animated</code>. Gestures, parallax, shared element transitions → Reanimated. Custom drawn UI or complex visual effects → Skia. All three can coexist in the same app.</p>`,
  },
];

/** Group lessons by category, preserving declaration order. */
export function lessonsByCategory(
  lessons: Lesson[],
): { category: string; categoryLabel: string; lessons: Lesson[] }[] {
  const map = new Map<string, { category: string; categoryLabel: string; lessons: Lesson[] }>();
  for (const l of lessons) {
    if (!map.has(l.category)) {
      map.set(l.category, { category: l.category, categoryLabel: l.categoryLabel, lessons: [] });
    }
    map.get(l.category)!.lessons.push(l);
  }
  return [...map.values()];
}
