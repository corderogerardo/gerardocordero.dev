# Flashcards — Andersen React Native S2

All 91 matrix rows as interviewer-style questions. Answer out loud in English, then check yourself against the linked entry (each ends with a **Say it** line you can deliver verbatim). Cards where you stumble go back into tomorrow's pile.

## React Native

### Environment and Expo

- How do you test deep links on both platforms, and what do you actually configure in Xcode's Signing tab? — [answer](01-react-native.md#xcode--android-studio)
- When would you eject to the bare workflow, and what does ejecting look like today? — [answer](01-react-native.md#bare-workflow-expo)
- Why would you choose the managed workflow for a production app — isn't it too limiting for serious work? — [answer](01-react-native.md#managed-workflow-expo)
- Beyond `expo start`, what CLI commands and flags do you actually use to build, update, and manage credentials? — [answer](01-react-native.md#cli)
- What are over-the-air updates in React Native, what can they change, and what would you use today? — [answer](01-react-native.md#ota-updates)
- Walk me through how Metro works — what happens between saving a file and seeing the change on the device. — [answer](01-react-native.md#metro-bundler)

### Animation

- What does `useNativeDriver: true` actually do, and why can an Animated animation still stutter or leak memory? — [answer](01-react-native.md#react-native-animated)
- How does Reanimated achieve gesture-driven animations that Animated can't, and what are worklets and shared values under the hood? — [answer](01-react-native.md#react-native-reanimated)
- Walk me through how React Native decides which view handles a touch — the responder negotiation — and where PanResponder fits. — [answer](01-react-native.md#gesture-responder-system)

### Routing

- How would you build a custom transition animation between two screens in React Navigation, and how do you make it work with SSR on web? — [answer](01-react-native.md#react-navigation)
- Why would a team pick Wix's React Native Navigation over React Navigation, and how do you add a custom transition there? — [answer](01-react-native.md#react-native-navigation)

### Publishing and Distribution

- What is a provisioning profile, what does it contain, and why do signing builds fail when it's wrong? — [answer](01-react-native.md#provisioning-profile)
- Walk me through how Apple code-signing certificates work — how you generate one and what the private key means for the team. — [answer](01-react-native.md#distribution-certificate)
- Before you upload a build to App Store Connect, how do you validate it, and what does validation actually check? — [answer](01-react-native.md#app-validation)
- Take me through the full path from a finished build to users running it from the App Store. — [answer](01-react-native.md#app-store-distribution)
- How does releasing on Google Play differ from the App Store — tracks, signing, rollout? — [answer](01-react-native.md#google-play-distribution)

### Push Notifications

- Walk me through how APNs works end to end, and how you configure the credentials that let your server send pushes. — [answer](01-react-native.md#apns-certificates)
- What exactly is a device token, and how do you handle it correctly on the backend? — [answer](01-react-native.md#device-token)

### Storages

- Would you store an auth token in AsyncStorage? What are its vulnerabilities? — [answer](01-react-native.md#async-storage)
- How do you store credentials securely in React Native, and how does the iOS Keychain actually protect them? — [answer](01-react-native.md#secure-storage)

### Layout

- How does flexbox in React Native differ from the web, and what does `flex: 1` actually mean? — [answer](01-react-native.md#flex)
- Would you use styled-components in a React Native project? Defend the choice against `StyleSheet.create`. — [answer](01-react-native.md#styled-components)
- When does `onLayout` fire, and what's the classic mistake teams make with it? — [answer](01-react-native.md#onlayout)
- How does FlatList stay fast with ten thousand items, and why does `keyExtractor` matter? — [answer](01-react-native.md#lists)
- How do you handle notches and home indicators correctly on both iOS and Android? — [answer](01-react-native.md#safeareaview)

### Native Modules

- Walk me through how JavaScript talks to native in React Native — old architecture and new. — [answer](01-react-native.md#communication-between-native-and-rn)
- You need a native view RN doesn't provide — say a camera preview or a map. How do you expose it to JavaScript? — [answer](01-react-native.md#native-ui-components)
- Why does React Native ship its own JS engine, and how does Hermes differ from JSC or V8? — [answer](01-react-native.md#hermes)
- How do you run JavaScript in the background when the app has no UI — a data-only push or a geofence event, for example? — [answer](01-react-native.md#headless-js)
- What is Fabric, and what does it actually change compared to the old renderer? — [answer](01-react-native.md#fabric)
- What is JSI, what problems does it solve, and where have you seen it used in production? — [answer](01-react-native.md#jsi)

### Debugging

- You've used React Native Debugger — walk me through how it worked, and what you'd use today. How do you handle a non-default Metro port? — [answer](01-react-native.md#react-native-debugger)
- Teams still have Flipper in their setup docs. What did it give you, how did the device connection and certificates work, and what replaces it now? — [answer](01-react-native.md#flipper)
- A native Android module misbehaves only in the release build. How do you debug it with Logcat, and how does that differ from a debug build? — [answer](01-react-native.md#logcat)

### Timers

- Why would you drive a JS-side animation with requestAnimationFrame instead of setInterval with a 16ms delay? Aren't they the same thing? — [answer](01-react-native.md#requestanimationframe)
- A screen janks during its navigation transition because it fetches and renders heavy data on mount. How does InteractionManager solve this, and how does it know when the transition is over? — [answer](01-react-native.md#interactionmanager)

### Permissions

- Walk me through how you handle a camera or location permission in React Native — what differs between iOS and Android, and how do you deal with a user who denied it? — [answer](01-react-native.md#app-permissions)

### Network

- How would you implement certificate pinning in a React Native app on both platforms, and what operational risks does it introduce? — [answer](01-react-native.md#tls-pinning)

## React

### Reconciliation

- Describe React's Fiber architecture at a deep level — what a fiber actually is, why the rewrite happened, and how the two phases work. — [answer](02-react.md#fiber)
- How does React schedule work? Walk me through what happens between calling setState and the screen updating when other work is competing. — [answer](02-react.md#jobs)

### Components

- If I call `setState` three times in an event handler, how many re-renders happen? What changes if the calls sit inside a `setTimeout` or a promise `.then`? — [answer](02-react.md#state)
- Walk me through the class lifecycle in order — mount, update, unmount — and explain why the `componentWill*` methods were deprecated. — [answer](02-react.md#lifecycle-methods)
- Why does React.memo exist, and when does wrapping a component in it actually do nothing? — [answer](02-react.md#purecomponent-and-memo)
- What are refs really for? Give me concrete cases where a ref is the right tool and state would be wrong. — [answer](02-react.md#refs)
- When a context value changes, what re-renders? How would you architect around that, and when do you reach for an external store instead? — [answer](02-react.md#context)

### Redux

- What is a reducer, and how do you write one — classic switch/case versus Redux Toolkit? — [answer](02-react.md#reducers)
- Can you write a Redux middleware from scratch? What does the signature look like and why is it curried? — [answer](02-react.md#middlewares)
- What are selectors for? Explain in your own words why you wouldn't just read state directly in components. — [answer](02-react.md#selectors)

### Hooks

- Why did React introduce hooks, and why can't you call a hook inside a condition or a loop? How do you handle branching logic then? — [answer](02-react.md#why-hooks)
- When do you reach for useState versus useReducer, and where does useContext fit in? — [answer](02-react.md#usestate-usereducer-usecontext)

## JavaScript

### JS (ES6+)

- What problems do WeakMap and Proxy solve that a plain Map or object can't, and where have you seen tagged templates in real code? — [answer](03-javascript.md#weakmap-weakset-proxy-and-tagged-templates)
- When would a JavaScript Number silently corrupt your data, and how does BigInt fix it? — [answer](03-javascript.md#bigint)
- How does dynamic import enable code splitting, and what's the React Native equivalent given Metro ships one bundle? — [answer](03-javascript.md#modules)
- class is syntactic sugar over prototypes — can you rewrite a class hierarchy with constructor functions, and how do you compose behavior without multiple inheritance? — [answer](03-javascript.md#classes)
- Write Promise.all from scratch. Then tell me when you'd reach for race, allSettled, or any instead. — [answer](03-javascript.md#promise)
- What does async/await actually do under the hood, and how do you express Promise.all with it? — [answer](03-javascript.md#async-await)
- How does next(value) communicate with yield, and where have you actually used generators? — [answer](03-javascript.md#generators-and-iterators)
- What's the real difference between XHR and fetch(), and what does that mean in React Native? — [answer](03-javascript.md#fetch)

### JS (ES5)

- Why is `eval` considered evil, and when would you ever reach for it? — [answer](03-javascript.md#eval-is-evil)
- How do you deep-clone an object in JavaScript, and can you sketch a linked list on plain objects? — [answer](03-javascript.md#deep-copy-and-object-structures)
- How does a modern JavaScript garbage collector work — what do generational, incremental, and idle-time collection mean? — [answer](03-javascript.md#garbage-collector)
- How does JavaScript's Date handle timezones, and how do you check that a Date object is actually valid? — [answer](03-javascript.md#date-and-time)
- What does the reviver callback in JSON.parse do, and when have you used it? — [answer](03-javascript.md#json)
- Walk an unknown nested object recursively, explain what `new Function` does differently from a normal closure, and write a generic curry helper. — [answer](03-javascript.md#functions)
- When does a lexical environment get garbage-collected, and how can a closure become a memory leak? — [answer](03-javascript.md#execution-context)
- How do you get an object's constructor through its prototype, and when is `obj.constructor` lying to you? — [answer](03-javascript.md#prototypes-and-inheritance)
- What is `window.onerror` for, and what's the equivalent in a React Native app in production? — [answer](03-javascript.md#error-handling)
- JavaScript is single-threaded — so how does it handle thousands of concurrent operations, and in what order do `setTimeout` and `Promise.then` callbacks run? — [answer](03-javascript.md#event-loop)
- Why does `requestAnimationFrame` exist when `setTimeout(fn, 16)` seems to do the same thing? — [answer](03-javascript.md#scheduling)
- Explain named groups, lookarounds, and the flags beyond `g`, `i`, `m` — and when would you refuse to solve a problem with a regex? — [answer](03-javascript.md#regular-expressions)

## Software Engineering Practices

### Architecture and Craft

- What quality attributes drive an architecture, and which enterprise or cloud patterns have you actually applied? — [answer](04-engineering-practices.md#architecture-and-design)
- What is GRASP, and how does it differ from SOLID? — [answer](04-engineering-practices.md#oop)
- Give me real examples of pure functions in your code, and explain tail call optimization — can you rely on it in JavaScript? — [answer](04-engineering-practices.md#functional-programming)
- What makes a system reactive? Define the four characteristics from the Reactive Manifesto. — [answer](04-engineering-practices.md#reactive-programming)
- How do you reason about algorithm complexity, and where has it actually mattered in a mobile app? — [answer](04-engineering-practices.md#algorithms-and-data-structures)

### Delivery and Operations

- Describe your CI/CD setup for a React Native app. How do you handle signing, build numbers, and releases — and can you build from the command line without the pipeline? — [answer](04-engineering-practices.md#builds-and-ci-cd)
- Your app is crashing in production but works fine locally. Walk me through your observability setup — what tools do you have in place before the incident, and how do you profile once you reproduce it? — [answer](04-engineering-practices.md#troubleshooting-logging-and-monitoring)

### Network

- REST gets thrown around loosely — what are the actual architectural constraints, and why do they matter? — [answer](04-engineering-practices.md#rest)
- Beyond GET and POST — what do CONNECT and TRACE do, and what can XHR do that fetch still can't? — [answer](04-engineering-practices.md#ajax)
- Compare JSONP and CORS — and does any of this even apply in React Native? — [answer](04-engineering-practices.md#cors)
- Walk me through the WebSocket handshake — and what are subprotocols and extensions for? — [answer](04-engineering-practices.md#web-socket)
- EventSource versus WebSocket — when would you pick each, and what's the story in React Native? — [answer](04-engineering-practices.md#server-sent-events)

### Quality and Security

- Walk me through the OWASP Top 10, name some concrete authentication attacks, and explain what actually happens in a TLS handshake. — [answer](04-engineering-practices.md#security-and-cryptography)
- How do you refactor a legacy area safely, and how would you define and report a technical-debt policy to non-technical stakeholders? — [answer](04-engineering-practices.md#refactoring)
- Describe your JavaScript testing strategy — what BDD means to you, and where tools like Jasmine, Mocha/Chai/Sinon, Karma, and Jest fit. — [answer](04-engineering-practices.md#testing-processes)
- How do you set up code-quality standards for a team — linting, policy documents, and services like SonarQube? — [answer](04-engineering-practices.md#code-review-and-code-standards)

## Software Development Processes

### Processes

- How does your choice of SDLC model change where testing and code review live, and how do you scale the process when the project grows from one team to several? — [answer](05-dev-processes.md#process-planning-sdlc)
- Beyond creating tickets, how do you actually use boards, dashboards, and plugins in Jira or a similar tracker to run a project? — [answer](05-dev-processes.md#bug-tracking-systems)
- You're asked to define the version-control infrastructure and policy for a new mobile project. What do you set up, and which advanced Git operations do you actually use? — [answer](05-dev-processes.md#version-control-system-git)
- A pre-sale needs an estimate for an app you've never seen. What does your evaluation report contain, and how do you use historical data? — [answer](05-dev-processes.md#estimations)
- Walk me through Scrum planning from start to end — artifacts and events — and then do the same for Kanban. When would you pick each? — [answer](05-dev-processes.md#development-methodologies)
