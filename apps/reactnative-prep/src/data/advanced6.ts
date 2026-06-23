// Batch 6 - third-party integration patterns mined from Expo's official
// with-* examples library. Authored + adversarially verified via workflow.
import type { Flashcard } from "./flashcards";
import type { StudySection } from "./study";

export const ADVANCED6_FLASHCARD_FILTERS: { value: string; label: string }[] = [
  { value: "integrations", label: "Integrations" },
];

export const ADVANCED6_FLASHCARDS: Flashcard[] = [
  {
    "id": "int-1",
    "category": "integrations",
    "categoryLabel": "INTEGRATIONS",
    "question": "What ARE Expo's with-* examples, and how should you actually use one when adding a library to an existing app?",
    "answerHtml": "<p>The <code>expo/examples</code> repo holds dozens of directories named <code>with-&lt;library&gt;</code> (e.g. <code>with-stripe</code>, <code>with-maps</code>, <code>with-clerk</code>), each a <b>managed, focused demo</b> built around ONE library against the current SDK.</p><ul><li><b>They are not app architectures.</b> A typical one is a screen or two of wiring. Don't try to lift folder structure, state management, or navigation from them.</li><li><b>Mine the pattern, not the code:</b> the three things worth copying are the <b>dependency set</b>, the <b>app.json config plugins / permissions</b>, and the <b>minimal wiring</b> (provider + a few API calls).</li></ul><p>Workflow when you already have an app: read the example as reference (README -&gt; package.json -&gt; app.json -&gt; integration code -&gt; .env), then apply the pattern by hand. <b>Never scaffold an example on top of an existing project</b> — that overwrites your config.</p>",
    "level": "mid"
  },
  {
    "id": "int-2",
    "category": "integrations",
    "categoryLabel": "INTEGRATIONS",
    "question": "How do you scaffold a brand-new project from an Expo example, and what's the gotcha with the branch name?",
    "answerHtml": "<p>For greenfield work, scaffold directly from the example:</p><div class=\"code\">npx create-expo-app --example with-stripe\n# short form:\nnpx create-expo-app -e with-stripe</div><p>Every example also has a one-click launch URL: <code>https://launch.expo.dev/?github=https://github.com/expo/examples/tree/master/with-stripe</code>.</p><p><b>Gotcha:</b> the default branch of <code>expo/examples</code> is <code>master</code>, NOT <code>main</code>. This matters whenever you build a raw URL or sparse-checkout:</p><div class=\"code\">curl -s https://raw.githubusercontent.com/expo/examples/master/with-stripe/app.json</div><p>Use scaffold mode only for new projects; for an existing app, read the example and port the pattern by hand instead.</p>",
    "level": "mid"
  },
  {
    "id": "int-3",
    "category": "integrations",
    "categoryLabel": "INTEGRATIONS",
    "question": "When adapting an example into your existing app, why shouldn't you copy its package.json version pins, and what do you do instead?",
    "answerHtml": "<p>Examples track the <b>latest</b> SDK, so their <code>package.json</code> pins are aligned to that SDK — not to your (likely older) project. Copying exact versions installs packages that may be incompatible with your installed SDK and React Native version.</p><p>Instead, add only the <b>missing</b> dependencies and let Expo resolve the SDK-correct version:</p><div class=\"code\">npx expo install react-native-maps\nnpx expo install @stripe/stripe-react-native</div><p><code>npx expo install</code> reads your SDK and picks the version that matches it — that is exactly what it exists for. <b>Done</b> means every dep, config plugin, permission, and env var the example needs is accounted for in your app — not just that it looks wired up.</p>",
    "level": "mid"
  },
  {
    "id": "int-4",
    "category": "integrations",
    "categoryLabel": "INTEGRATIONS",
    "question": "Expo examples have no ios/ or android/ directories. How is native setup expressed, and what does that mean for adopting one?",
    "answerHtml": "<p>Managed examples are <b>prebuildless in source</b>: there are no committed <code>ios/</code> or <code>android/</code> folders. All native setup — permissions, native build flags, SDK keys, Info.plist / AndroidManifest entries — is declared via <b>config plugins</b> in <code>app.json</code> (or <code>app.config.js</code>), and applied at <code>npx expo prebuild</code> / EAS build time.</p><p>Example app.json fragment for a camera integration:</p><div class=\"code\">{\n  &quot;expo&quot;: {\n    &quot;plugins&quot;: [\n      [&quot;expo-camera&quot;, { &quot;cameraPermission&quot;: &quot;Allow $(PRODUCT_NAME) to use the camera&quot; }]\n    ]\n  }\n}</div><p>When adopting: <b>merge</b> only the plugins/permissions the example introduces into your existing <code>plugins</code> array — never replace your whole config block. If you have committed native dirs (a bare/prebuilt workflow), you must instead apply the plugin's effects manually or re-run prebuild.</p>",
    "level": "mid"
  },
  {
    "id": "int-5",
    "category": "integrations",
    "categoryLabel": "INTEGRATIONS",
    "question": "How do you integrate Stripe in an Expo app, and where does the secret key live?",
    "answerHtml": "<p><code>with-stripe</code> is a <b>full-stack</b> example: it pairs the <code>@stripe/stripe-react-native</code> client with <b>Expo Router API routes</b> (files like <code>app/api/&lt;name&gt;+api.ts</code>) that run server-side.</p><ul><li><b>Client</b> wraps the app in <code>&lt;StripeProvider&gt;</code> with the <i>publishable</i> key and calls <code>initPaymentSheet</code> / <code>presentPaymentSheet</code>.</li><li><b>Server (+api route)</b> uses the Stripe Node SDK with the <i>secret</i> key to create the PaymentIntent and returns its <code>client_secret</code> to the app.</li></ul><p><b>The secret key lives ONLY in the +api route, server-side.</b> It is read from a non-public env var (e.g. <code>process.env.STRIPE_SECRET_KEY</code>). It must NEVER be an <code>EXPO_PUBLIC_*</code> var, because anything prefixed <code>EXPO_PUBLIC_</code> is inlined into the JS bundle and shipped to every device. Only the publishable key belongs on the client.</p>",
    "level": "senior"
  },
  {
    "id": "int-6",
    "category": "integrations",
    "categoryLabel": "INTEGRATIONS",
    "question": "What's the rule for EXPO_PUBLIC_ environment variables in full-stack examples like Stripe, Clerk, and OpenAI?",
    "answerHtml": "<p>Any env var named <code>EXPO_PUBLIC_*</code> is <b>inlined into the client JS bundle at build time</b> and is fully visible to anyone with the app. So the rule is binary:</p><ul><li><b>Publishable / public identifiers</b> (Stripe publishable key, Clerk publishable key, Supabase anon key, a public API base URL) -&gt; fine as <code>EXPO_PUBLIC_*</code>.</li><li><b>Secrets</b> (Stripe secret key, OpenAI API key, Clerk secret key, any DB service-role key) -&gt; NEVER <code>EXPO_PUBLIC_*</code>. They live <b>server-side</b>, read as plain <code>process.env.X</code> inside an <b>Expo Router +api route</b>, and the client calls that route.</li></ul><p>This is exactly why full-stack examples (<code>with-stripe</code>, <code>with-clerk</code>, <code>with-openai</code>) ship a server tier: the +api route is the trust boundary. If you ever find yourself reaching for an <code>EXPO_PUBLIC_</code> secret, that's the signal to move the call behind a server route.</p>",
    "level": "senior"
  },
  {
    "id": "int-7",
    "category": "integrations",
    "categoryLabel": "INTEGRATIONS",
    "question": "How do auth integrations like with-clerk and with-auth0 wire into an Expo Router app?",
    "answerHtml": "<p>Auth integrations follow the same provider-at-the-root pattern, differing mainly in deps and config plugin:</p><ul><li><b>with-clerk:</b> wrap the root layout in <code>&lt;ClerkProvider publishableKey={...} tokenCache={...}&gt;</code>, use hooks like <code>useAuth()</code> / <code>useUser()</code>, and gate routes with <code>&lt;SignedIn&gt;</code> / <code>&lt;SignedOut&gt;</code>. Tokens are persisted via a <code>tokenCache</code> backed by <code>expo-secure-store</code>.</li><li><b>with-auth0:</b> uses the Auth0 SDK with native redirect URIs configured through its config plugin; login opens a native auth session (via <code>expo-web-browser</code> / <code>expo-auth-session</code>).</li><li><b>Self-hosted option:</b> for a library like Better Auth, the auth logic runs in <b>Expo Router +api routes</b>, so the session secret stays server-side.</li></ul><p>Common thread: publishable key on the client, sensitive token storage in SecureStore, and the OAuth redirect handled via your app scheme / deep link. This maps directly to your Valt Connect FaceID/TouchID + Salesforce auth flow — biometric gating layered over a token cache.</p>",
    "level": "mid"
  },
  {
    "id": "int-8",
    "category": "integrations",
    "categoryLabel": "INTEGRATIONS",
    "question": "What realtime-sync pattern does with-legend-state-supabase demonstrate, and why is it interesting for offline apps?",
    "answerHtml": "<p><code>with-legend-state-supabase</code> shows a <b>local-first sync</b> architecture: Legend-State observables are the source of truth in the UI, and a Supabase sync plugin keeps them in sync with Postgres over Supabase <b>Realtime</b> (websocket change subscriptions).</p><ul><li><b>Optimistic by default:</b> writes mutate the local observable immediately; the sync layer persists to Supabase and reconciles in the background, with retries when offline.</li><li><b>Persistence:</b> observables are persisted locally (e.g. via an MMKV or AsyncStorage adapter) so state survives restarts and the app is usable offline.</li><li><b>Realtime fan-in:</b> remote changes from other clients stream back in and merge into the observables, re-rendering only what changed.</li></ul><p>This is the canonical pattern behind your Valt Connect offline optimistic updates and version-based cache invalidation: mutate locally, sync in the background, reconcile on reconnect — here productized by Legend-State instead of hand-rolled.</p>",
    "level": "senior"
  },
  {
    "id": "int-9",
    "category": "integrations",
    "categoryLabel": "INTEGRATIONS",
    "question": "When would you reach for with-convex versus a GraphQL example like with-apollo, and what does each give you?",
    "answerHtml": "<p>Both are backend-integration patterns, but at different layers:</p><ul><li><b>with-convex:</b> a <b>realtime backend-as-a-service</b>. You wrap the app in <code>&lt;ConvexProvider&gt;</code> and call <code>useQuery</code> / <code>useMutation</code> against Convex functions. Queries are <b>reactive by default</b> — results re-render live when server data changes, with no manual subscription wiring. Good when you want backend + realtime + persistence as one managed product.</li><li><b>with-apollo:</b> a <b>client for an existing GraphQL API</b>. Wrap in <code>&lt;ApolloProvider&gt;</code> with an <code>ApolloClient</code>, use <code>useQuery</code> / <code>useMutation</code>; Apollo gives you a normalized cache, but realtime requires GraphQL subscriptions over a websocket link. Good when the server / schema already exists.</li></ul><p>Rule of thumb: greenfield realtime app -&gt; Convex; consuming an established schema (like AppSync GraphQL, as at Novacomp) -&gt; Apollo client over that endpoint.</p>",
    "level": "mid"
  },
  {
    "id": "int-10",
    "category": "integrations",
    "categoryLabel": "INTEGRATIONS",
    "question": "For local on-device persistence, what do with-sqlite and with-libsql each demonstrate, and how do they differ?",
    "answerHtml": "<p>Both show an embedded SQL database on the device, accessed through <code>expo-sqlite</code>:</p><ul><li><b>with-sqlite:</b> the baseline — open a DB with <code>SQLite.openDatabaseSync('app.db')</code>, run <code>execAsync</code> / <code>runAsync</code> / <code>getAllAsync</code>, and (modern API) use the <code>useSQLiteContext()</code> hook plus <code>&lt;SQLiteProvider&gt;</code> for migrations. Pure local storage, no network.</li><li><b>with-libsql:</b> uses the libSQL/Turso variant, which is SQLite-compatible but adds an <b>embedded replica that syncs to a remote Turso database</b>. You read/write locally at SQLite speed, and the replica syncs deltas to the cloud — local-first with a server of record.</li></ul><p>Choose <code>with-sqlite</code> for purely on-device data; choose <code>with-libsql</code> when you want that same local DB to also sync to a hosted copy.</p>",
    "level": "mid"
  },
  {
    "id": "int-11",
    "category": "integrations",
    "categoryLabel": "INTEGRATIONS",
    "question": "How does with-sentry set up error monitoring in Expo, and what makes the source-map step essential?",
    "answerHtml": "<p><code>with-sentry</code> uses <code>@sentry/react-native</code> wired through Expo:</p><ul><li>Add the <code>@sentry/react-native/expo</code> <b>config plugin</b> in <code>app.json</code> (with your org/project), and call <code>Sentry.init({ dsn, ... })</code> early in the root layout.</li><li>Wrap the app's root export with <code>Sentry.wrap(...)</code> so JS errors, native crashes, and (optionally) performance traces are captured.</li></ul><p><b>The essential step is uploading source maps.</b> The shipped JS is a Hermes-compiled, minified bundle, so raw stack traces are useless line/column noise. The Sentry Expo plugin / EAS build hook uploads the <b>source maps and Hermes debug IDs</b> at build time, letting Sentry symbolicate stacks back to your original code. Without that upload, every crash report is unreadable. The DSN is safe to ship (it's a public ingestion key, not a secret); the auth token used for uploads stays in CI, not the bundle.</p>",
    "level": "senior"
  },
  {
    "id": "int-12",
    "category": "integrations",
    "categoryLabel": "INTEGRATIONS",
    "question": "What's the setup pattern for native-heavy UI examples like with-maps, with-camera, and with-skia?",
    "answerHtml": "<p>These wrap native rendering/hardware libraries, and all three follow the same two-step shape: <b>install the lib, then declare its native needs via config plugin/permissions in app.json.</b></p><ul><li><b>with-maps:</b> <code>react-native-maps</code> rendering a <code>&lt;MapView&gt;</code> with <code>&lt;Marker&gt;</code>s. Map provider keys and location permission go through app.json; on iOS the default provider is Apple Maps unless you configure Google Maps.</li><li><b>with-camera:</b> <code>expo-camera</code>'s <code>&lt;CameraView&gt;</code>; the <code>expo-camera</code> config plugin declares the camera (and mic, if recording) permission strings, and you request runtime permission via the <code>useCameraPermissions()</code> hook.</li><li><b>with-skia:</b> <code>@shopify/react-native-skia</code> for GPU-accelerated 2D drawing inside a <code>&lt;Canvas&gt;</code> — no permissions, but it's a native module, so it needs a dev client / prebuild, not Expo Go.</li></ul><p>Takeaway: install with <code>npx expo install</code>, merge the plugin + permission strings, and remember anything with custom native code needs a development build.</p>",
    "level": "mid"
  },
  {
    "id": "int-13",
    "category": "integrations",
    "categoryLabel": "INTEGRATIONS",
    "question": "How do AI-chat examples like with-openai keep the model API key safe while still streaming responses to the device?",
    "answerHtml": "<p>These are <b>full-stack</b> examples built on <b>Expo Router +api routes</b>, specifically so the model key never reaches the client.</p><ul><li>The client sends the conversation to a local server route (e.g. <code>app/api/chat+api.ts</code>) — it never talks to OpenAI directly.</li><li>The +api route reads <code>process.env.OPENAI_API_KEY</code> (a plain, non-<code>EXPO_PUBLIC_</code> secret), calls the model, and <b>streams the response back</b> as the route's <code>Response</code> body.</li><li>The Vercel AI SDK pattern is common here — the route returns a streaming response and the client renders tokens incrementally via the AI SDK's React hooks (e.g. <code>useChat</code>).</li></ul><p>The architectural lesson: the secret API key is server-only, the client just hits your route, and streaming is preserved by returning a streamed <code>Response</code> from the +api handler. Putting the key in an <code>EXPO_PUBLIC_</code> var would leak it to every installed app.</p>",
    "level": "senior"
  },
  {
    "id": "int-14",
    "category": "integrations",
    "categoryLabel": "INTEGRATIONS",
    "question": "How does with-tailwindcss set up NativeWind, and what's the mental model versus plain StyleSheet?",
    "answerHtml": "<p><code>with-tailwindcss</code> wires up <b>NativeWind</b>, which compiles Tailwind utility classes into React Native styles so you can write <code>className=&quot;flex-1 items-center bg-white&quot;</code> on RN components.</p><p>Setup pattern: install <code>nativewind</code> + <code>tailwindcss</code>, add a <code>tailwind.config.js</code> whose <code>content</code> globs your component files, register the NativeWind <b>Babel preset and Metro transform</b>, and import the CSS entry. Then <code>className</code> works on <code>&lt;View&gt;</code>, <code>&lt;Text&gt;</code>, etc.</p><p><b>Mental model:</b> classes resolve into the same kind of style objects <code>StyleSheet.create</code> would produce — it's a styling syntax, not a runtime DOM/CSS engine. You get Tailwind's design tokens, responsive/variant modifiers, and dark-mode support, while it still maps down to native styles. Use it for velocity and a shared design vocabulary across web + native in a monorepo.</p>",
    "level": "mid"
  },
  {
    "id": "int-15",
    "category": "integrations",
    "categoryLabel": "INTEGRATIONS",
    "question": "with-socket-io and with-webrtc both do realtime, but at different layers. What does each demonstrate?",
    "answerHtml": "<p>They cover two distinct realtime tiers:</p><ul><li><b>with-socket-io:</b> a persistent <b>client-server websocket</b> channel. The client connects with <code>io(SERVER_URL)</code>, then uses <code>socket.emit(...)</code> and <code>socket.on(...)</code> for event-based, server-mediated messaging (chat, presence, live feeds). All traffic routes through your Socket.IO server, which is the auth/fan-out point.</li><li><b>with-webrtc:</b> <b>peer-to-peer</b> audio/video/data via <code>react-native-webrtc</code>. It captures media with <code>getUserMedia</code>, builds an <code>RTCPeerConnection</code>, and exchanges SDP offers/answers + ICE candidates through a <b>signaling channel</b> (often a websocket — which is exactly where Socket.IO commonly plays). Once connected, media flows directly peer-to-peer. It's a native module, so it needs a dev build plus camera/mic permissions in app.json.</li></ul><p>Rule: server-routed events -&gt; Socket.IO; direct low-latency media between users -&gt; WebRTC (with something like Socket.IO doing the signaling). This is the layer beneath a managed chat product like the Twilio Conversations realtime you shipped in Valt Connect.</p>",
    "level": "senior"
  },
  {
    "id": "int-16",
    "category": "integrations",
    "categoryLabel": "INTEGRATIONS",
    "question": "For on-device data visualization and ML, what do with-victory-native, with-google-vision, and with-tfjs-camera each show?",
    "answerHtml": "<p>Three distinct \"data in, visual/insight out\" integrations:</p><ul><li><b>with-victory-native:</b> charting with Victory Native (modern versions render on Skia). You feed data arrays into components like <code>&lt;CartesianChart&gt;</code> with line/bar series to draw performant native charts — good for dashboards and analytics screens.</li><li><b>with-google-vision:</b> calls the <b>Google Cloud Vision API</b> over the network — capture/pick an image, POST it (base64) to Vision for label/text/face detection. The API key is sensitive, so in production that call belongs behind a server route, not in an <code>EXPO_PUBLIC_</code> var.</li><li><b>with-tfjs-camera:</b> <b>on-device</b> ML — TensorFlow.js with the React Native adapter (<code>@tensorflow/tfjs-react-native</code>) runs a model against the live <code>expo-camera</code> stream (via <code>cameraWithTensors</code>) entirely locally, no server round-trip and no per-call key.</li></ul><p>Choosing: local charts -&gt; Victory Native; cloud-hosted recognition -&gt; Google Vision (key server-side); private/offline inference on the camera feed -&gt; tfjs-camera.</p>",
    "level": "mid"
  }
];

export const ADVANCED6_STUDY: StudySection[] = [
  {
    "id": "st-36",
    "num": "36",
    "title": "36 · Integration patterns (Expo examples)",
    "html": "<p>When you wire a third-party library or service into an Expo app, don't hand-roll it. Mine <b>expo/examples</b> — Expo's official library of ~80 <code>with-*</code> integration examples, each built around one library and maintained against the current SDK. They aren't full apps; the typical one is a single screen of ~100-200 lines. You're after the <i>pattern</i>, not the architecture.</p><p>The canonical integration pattern that repeats across nearly every example has three parts:</p><ul><li><b>Dependencies</b> — the minimal package set the integration needs. Don't copy the example's pinned versions: examples track the <i>latest</i> SDK, so their <code>package.json</code> pins won't match an older project. Add only the missing packages with <code>npx expo install &lt;pkg&gt;</code>, which resolves the SDK-correct version for <i>your</i> app.</li><li><b>app.json config plugins</b> — managed examples have no <code>ios/</code> or <code>android/</code> directories; all native setup (permissions, native deps, build settings) is declared as config plugins and permission strings in <code>app.json</code> / <code>app.config.*</code>. Merge only the plugins the example introduces into your existing config — never replace your block.</li><li><b>Minimal wiring</b> — a provider near the root, a hook or a few calls in a screen, plus any env vars (the example's <code>.env</code> holds placeholders, never real secrets — recreate its shape).</li></ul><p><b>Full-stack examples</b> (payments, AI) pair the client with <b>Expo Router <code>+api</code> routes</b> — server endpoints colocated in <code>app/</code> (e.g. <code>app/api/payment-intent+api.ts</code>). The pattern exists for one reason: <i>secret keys stay server-side</i>. The client calls your <code>+api</code> route; the route holds the Stripe secret key or OpenAI key and talks to the provider. The publishable key is all that ships in the bundle.</p><p>Two ways to use them. <b>Inspiration mode</b> (you already have an app): read <code>README.md</code> &rarr; <code>package.json</code> &rarr; <code>app.json</code> &rarr; the integration code &rarr; <code>.env</code>, then apply the pattern by hand; never scaffold an example on top of your project. <b>Scaffold mode</b> (greenfield): <code>npx create-expo --example with-stripe</code> spins up a fresh project from that example.</p><p>Real integrations worth knowing by name: <b>with-stripe</b> (payments + <code>+api</code> route), <b>with-clerk</b> (auth), <b>with-legend-state-supabase</b> (local-first sync backed by Supabase Postgres), <b>with-sqlite</b> (local DB), <b>with-sentry</b> (crash/error monitoring), <b>with-maps</b> (react-native-maps), <b>with-skia</b> (2D graphics/canvas), and <b>with-openai</b> (LLM via a server route). The default branch is <code>master</code>, and every example has a one-click launch URL.</p><div class=\"callout tip\"><span class=\"lbl\">New concept</span> The <code>+api</code> route is the Expo-native answer to \"where does my secret key live?\" In a classic RN app you'd stand up a separate Node/Lambda backend for that. With Expo Router, a file named <code>foo+api.ts</code> in <code>app/</code> <i>is</i> a server endpoint (deployed on EAS Hosting), so your payment-intent creation, webhook handling, and OpenAI proxying live in the same repo as the screens — and the secret key never enters the JS bundle.</div><div class=\"map\"><span class=\"lbl\">Your proof</span> You've already lived the secret-key-server-side discipline: Stripe + In-App Purchases on Valt Connect (purchase verification belongs on the server, exactly what a <code>+api</code> route formalizes), Twilio Conversations real-time chat (token minted server-side, client holds only the access token — same shape as <code>with-stripe</code>'s publishable-vs-secret split), OneSignal push, and AppSync GraphQL where resolvers and auth sat behind the API. Framing these as \"client provider + server route + config plugin\" is exactly how you'd narrate adopting <code>with-stripe</code> or <code>with-clerk</code>; your PSPDFKit native integration is the config-plugin half of the same story.</div>"
  },
  {
    "id": "st-37",
    "num": "37",
    "title": "37 · The learning method (how to use this guide)",
    "html": "<p>This guide isn't a wall of notes to re-read — re-reading feels productive and barely moves retention. The app is built around the techniques cognitive science actually backs, and using it the intended way is what makes the difference:</p><ul><li><b>Active recall</b> — every card asks you to <i>retrieve the answer before you reveal it</i>. The struggle of pulling it from memory is the encoding event; passively reading the answer is not. Always answer out loud or in your head first, <i>then</i> check.</li><li><b>Spaced repetition</b> — when you grade a card, the app schedules its next review. Easy cards drift far into the future; ones you fumble come back soon. Your job is to clear what's <b>Due</b> — the system decides the spacing, so you spend effort exactly where memory is decaying.</li><li><b>Interleaving</b> — don't drill one category to exhaustion. Mix categories and difficulty levels in a session. Switching topics is harder in the moment but builds the discrimination you need when an interviewer jumps from re-renders to system design with no warning.</li><li><b>Active problem-solving</b> — the coding and system-design prompts force you to generate a solution, not recognize one. That generative effort transfers to the live whiteboard far better than reading a model answer.</li><li><b>Teach-back / Feynman</b> — use the teleprompter to <i>say the explanation out loud</i> as if teaching a peer. The moment you stumble or hand-wave is the exact gap you didn't know you had. If you can't teach it simply, you don't own it yet.</li><li><b>Track your gaps</b> — watch the progress and per-level counts. Categories with low mastery or piling-up Due cards are your weak spots; let the numbers, not your gut, point you at what to study next.</li></ul><p>A concrete <b>daily loop</b> (~30-45 min) that exercises all six:</p><ul><li>Clear <b>today's Due cards</b> first — retrieve before revealing, then grade honestly (an undeserved \"Easy\" only schedules a relapse).</li><li>Do <b>1 coding prompt + 1 system-design prompt</b>, pulled from <i>different</i> categories to force interleaving.</li><li><b>Record one pitch</b> with the teleprompter — a Feynman-style teach-back of one concept or one of your shipped features — and listen back for the hand-wave.</li><li>Glance at <b>progress + level counts</b>; queue tomorrow's focus on whatever category is weakest or most overdue.</li></ul><div class=\"callout tip\"><span class=\"lbl\">New concept</span> <b>Desirable difficulty</b> — the techniques here are meant to feel <i>harder</i> than re-reading, and that's the point. Retrieval that's effortful, spacing that lets a little forgetting set in, and interleaving that denies you a comfortable rhythm all produce more durable memory than smooth, easy study. If a session feels easy, you're probably reviewing too soon or recognizing instead of recalling.</div><div class=\"map\"><span class=\"lbl\">Your proof</span> You don't need to invent stories — you've shipped them. When a card or prompt touches an area you've lived (Stripe + In-App Purchases, Twilio Conversations chat, OneSignal push, AppSync GraphQL, the PSPDFKit native integration, your re-render/perf fixes and RN 0.59&rarr;0.62 upgrades), make the teach-back about <i>that</i> work. Narrating a real decision out loud both nails the concept and rehearses the exact \"tell me about a time you…\" answer an interviewer will ask.</div>"
  }
];
