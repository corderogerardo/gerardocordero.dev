# Flashcards — Senior React Native

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


## JavaScript

### ES5 fundamentals (J1–S1)

- Walk me through JavaScript's control-flow constructs, and explain what hoisting does to this code. — [answer](level-js-es5.md#control-flow-and-hoisting) {J1, J2}
- What are the different ways to create an object in JavaScript, and how do you read, add, and remove its properties? — [answer](level-js-es5.md#object-properties-and-creation) {J1, J2}
- What is a garbage collector and why does a language need one? — [answer](level-js-es5.md#why-garbage-collection-exists) {J1, J2}
- List JavaScript's data types and tell me which are primitives. — [answer](level-js-es5.md#the-data-types) {J1, J2}
- How do you construct a Date and read or set its year, month, and day? — [answer](level-js-es5.md#working-with-date) {J1, J2}
- How would you deep-clone a plain object using JSON, and when does that break? — [answer](level-js-es5.md#cloning-with-json) {J1, J2}
- What kinds of functions does JavaScript have, and what problem does an IIFE solve? — [answer](level-js-es5.md#function-types-and-iifes) {J1}
- What determines the value of `this` inside a function, and how do you control it? — [answer](level-js-es5.md#this-and-binding) {J1}
- Explain the difference between `__proto__` and `prototype`, and how the prototype chain resolves a property. — [answer](level-js-es5.md#prototypes-and-the-prototype-chain) {J1, J2, J3}
- JavaScript is single-threaded — so what happens when a piece of code takes a long time to run? — [answer](level-js-es5.md#blocking-code-and-the-single-thread) {J1}
- What do `setTimeout` and `setInterval` do, why do you need them, and how do you stop them? — [answer](level-js-es5.md#timers-settimeout-and-setinterval) {J1}
- How do you create a regular expression, what are its two main methods, and how do you make a search global and case-insensitive? — [answer](level-js-es5.md#regular-expression-basics) {J1, J2}
- What is the `arguments` object, why is it 'array-like', and can you write a recursive function? — [answer](level-js-es5.md#function-constructor-arguments-recursion) {J2, J3}
- Define a closure, and give a concrete example of why they're useful. — [answer](level-js-es5.md#closures-and-lexical-scope) {J2, J3}
- How do you handle exceptions in JavaScript, and when should you throw your own? — [answer](level-js-es5.md#trycatch-and-throwing-errors) {J2, J3}
- Explain the event loop, and predict the output order when a `setTimeout(…, 0)` and a resolved Promise are both queued. — [answer](level-js-es5.md#macrotasks-and-microtasks) {J2, J3, M1}
- What's wrong with `var`, what happens if you assign to a variable without declaring it, and what does `'use strict'` change? — [answer](level-js-es5.md#var-implicit-globals-and-strict-mode) {J3, M1, M2, M3, S1}
- What happens when an object is used where a primitive is expected, and how do property descriptors and getters/setters give you control? — [answer](level-js-es5.md#object-internals-descriptors-and-conversion) {J3, M1, M2}
- How does JavaScript's garbage collector actually decide what to free, and how can you still leak memory in a GC'd language? — [answer](level-js-es5.md#mark-and-sweep-and-reachability) {J3, M1, M2}
- Explain implicit vs explicit type conversion, and what `typeof` can and can't tell you. — [answer](level-js-es5.md#type-conversion-and-typeof) {J3, M1, M2, M3}
- How do you parse a date string into a Date, and what makes date parsing risky? — [answer](level-js-es5.md#parsing-dates) {J3, M1, M2, M3}
- How does `JSON.stringify` convert an object, and what does it silently drop or transform? — [answer](level-js-es5.md#serializing-objects-to-json) {J3, M1, M2, M3}
- Explain quantifiers and anchors in a regex, and why escaping matters. — [answer](level-js-es5.md#regex-quantifiers-assertions-and-escaping) {J3, M1, M2}
- How does prototypal inheritance differ from the classical OOP inheritance in languages like Java, and how do you build it with constructor functions? — [answer](level-js-es5.md#prototypal-vs-classical-inheritance) {M1, M2, M3, S1}
- What is the `finally` block for, and what properties does an Error object carry? — [answer](level-js-es5.md#finally-and-the-error-object) {M1, M2}

### ES6+ (J1–S1)

- Run me through the ES6 features you use daily — let/const, destructuring, arrow functions, and the modern array/object helpers. — [answer](level-js-es6.md#es6-syntax-essentials) {J1, J2}
- How do ES module imports and exports work — named, namespace, and aliasing? — [answer](level-js-es6.md#modules-importexport) {J1, J2}
- Show me class basics — inheritance and how private and protected members work in JS. — [answer](level-js-es6.md#classes-syntax-inheritance-privacy) {J1, J2}
- How do you make a simple request with fetch and handle the response? — [answer](level-js-es6.md#basic-fetch) {J1, J2, J3}
- When do you pick Map or Set over an object, and how does nullish coalescing differ from ||? — [answer](level-js-es6.md#mapset-assign-vs-spread-nullish-coalescing) {J3, M1, M2, M3}
- Why do some teams treat default exports as bad practice, and what problem does re-exporting solve? — [answer](level-js-es6.md#default-exports-and-re-exports) {J3, M1, M2, M3}
- How does instanceof actually work, and when do you use static properties or methods? — [answer](level-js-es6.md#instanceof-and-static-members) {J3, M1, M2}
- What states does a promise have, and what do promises fix about callbacks? — [answer](level-js-es6.md#promises-states-vs-callbacks-errors) {J3, M1}
- Give me an async function example — how do you handle errors, and what's the common performance trap? — [answer](level-js-es6.md#asyncawait-basics-and-errors) {J3, M1}
- What is a Symbol and when would you actually use one? — [answer](level-js-es6.md#symbol-type) {M1, M2, M3}
- How do you send and read headers with fetch, and how do you get binary data out of a response? — [answer](level-js-es6.md#advanced-fetch-headers-and-binary-data) {M1, M2}
- Explain promise chaining and fall-through, how you build a custom promise, and what finally is for. — [answer](level-js-es6.md#promise-chaining-custom-promises-finally) {M2, M3}
- How do you convert a .then chain to async/await, and can class methods be async? — [answer](level-js-es6.md#rewriting-promises-with-asyncawait) {M2, M3}
- How do generators work, and how do you compose them? — [answer](level-js-es6.md#generators-and-iterators) {M2, M3}

## React

### React foundations (J1–S1)

- What is Fiber in React, and in your own words, what does it do? — [answer](level-react.md#react-fiber) {J1, J2}
- At a basic level, how does React decide what to work on first? — [answer](level-react.md#scheduling-and-priority) {J1, J2}
- How do you work with state in a class versus a functional component, and what does setState do? — [answer](level-react.md#component-state-basics) {J1, J2}
- What is a ref in React, and why would you need one? — [answer](level-react.md#refs-why-and-what) {J1, J2}
- What is Redux for, and what are its three principles? — [answer](level-react.md#redux-three-principles) {J1, J2, J3, M1, M2}
- What does Redux's `connect` do, and what role does it play in the architecture? — [answer](level-react.md#connect-hoc) {J1, J2, J3, M1, M2}
- What is an action in Redux, and what makes it different from a function call? — [answer](level-react.md#redux-actions) {J1, J2, J3, M1, M2}
- What rules must a reducer follow, and can you write one? — [answer](level-react.md#redux-reducers) {J1, J2, J3, M1, M2}
- What is middleware in Redux, and why does it exist? — [answer](level-react.md#redux-middleware) {J1, J2, J3, M1, M2}
- What are hooks, and what problem did they solve? — [answer](level-react.md#why-hooks) {J2, J3}
- Which lifecycle methods does `useEffect` replace, what's the second argument, and how do you clean up? — [answer](level-react.md#useeffect) {J2, J3}
- How do `useState`, `useReducer`, and `useContext` work, and what do they take? — [answer](level-react.md#usestate-usereducer-usecontext) {J2, J3}
- When and why would you use `useCallback` and `useMemo`? — [answer](level-react.md#usecallback-and-usememo) {J2, J3}
- Explain how Fiber is implemented and how a render actually proceeds. — [answer](level-react.md#fiber-internals) {J3, M1, M2}
- Explain in depth how React's prioritization works. — [answer](level-react.md#scheduler-priorities) {J3, M1, M2}
- Why is `setState` asynchronous, and how do the updater form and callback work? — [answer](level-react.md#setstate-and-batching) {J3, M1}
- Walk me through the main lifecycle methods and what each is for. — [answer](level-react.md#lifecycle-methods) {J3, M1}
- What are `PureComponent` and `React.memo` for, why did they appear, and how do they differ from a plain component? — [answer](level-react.md#purecomponent-and-memo) {J3, M1}
- What are refs for, and how does `forwardRef` fit in? — [answer](level-react.md#refs-and-forwardref) {J3, M1}
- Explain the concept of React Context and when you'd use it. — [answer](level-react.md#react-context) {J3, M1}

## React Native

### RN foundations (J1–S1)

- A new hire can't get the app to build on either platform. Walk me through what actually has to be in place. — [answer](level-react-native.md#xcode-and-android-studio-setup) {J1, J2, J3}
- What is the bare workflow, and when would you choose it? — [answer](level-react-native.md#bare-workflow) {J1, J2, J3}
- How does the managed Expo workflow work day to day, from CLI to a running project? — [answer](level-react-native.md#managed-workflow) {J1, J2, J3}
- Which CLI commands do you actually run in a normal RN/Expo day, and what does each do? — [answer](level-react-native.md#expo-cli-commands) {J1, J2, J3}
- What is Metro, and what breaks when it misbehaves? — [answer](level-react-native.md#metro-bundler) {J1, J2, J3}
- How do you structure navigation with React Navigation — stacks, tabs, drawers? — [answer](level-react-native.md#react-navigation-basics) {J1, J2, J3}
- What's React Native Navigation, and how does it differ from React Navigation? — [answer](level-react-native.md#react-native-navigation-basics) {J1, J2, J3}
- What is AsyncStorage and what should you never use it for? — [answer](level-react-native.md#asyncstorage-basics) {J1, J2, J3}
- When would you use requestAnimationFrame instead of setTimeout? — [answer](level-react-native.md#requestanimationframe) {J1, J2, J3}
- How does layout work in React Native — how is it different from CSS flexbox on the web? — [answer](level-react-native.md#flexbox-layout) {J2, J3}
- What do styled-components give you in RN, and what's the cost? — [answer](level-react-native.md#styled-components) {J2, J3}
- How do you get and respond to screen size in RN, and what's the gotcha? — [answer](level-react-native.md#dimensions-api) {J2, J3}
- What is onLayout and why not just use Dimensions to size things? — [answer](level-react-native.md#onlayout) {J2, J3}
- Why use FlatList over a ScrollView with a map for a long list? — [answer](level-react-native.md#virtualizedlist-vs-scrollview) {J2, J3}
- How do you keep content out from under the notch and home indicator? — [answer](level-react-native.md#safeareaview) {J2, J3}
- Walk me through a basic animation with RN's Animated API. — [answer](level-react-native.md#animated-api-basics) {J3}
- The app stutters. Using the Performance Monitor, how do you diagnose it? — [answer](level-react-native.md#frame-drops-and-performance-monitor) {J3}
- What is a provisioning profile and what problem does it solve? — [answer](level-react-native.md#provisioning-profile) {J3, M1}
- What's a distribution certificate and how does it differ from a development one? — [answer](level-react-native.md#distribution-certificate) {J3, M1}
- What does 'validating' an app before submission actually check? — [answer](level-react-native.md#app-validation) {J3, M1}
- Walk me through getting an iOS app from build to the App Store. — [answer](level-react-native.md#app-store-distribution) {J3, M1}
- How does publishing to Google Play differ from the App Store? — [answer](level-react-native.md#google-play-distribution) {J3, M1}
- What role does the APNs certificate play in iOS push notifications? — [answer](level-react-native.md#apns-certificate) {J3, M1}
- What is a device token and how does the push flow use it? — [answer](level-react-native.md#device-token) {J3, M1}
- How do you inspect component state and network traffic while debugging RN? — [answer](level-react-native.md#react-native-debugger) {J3}
- What was Flipper used for, and where does it stand now? — [answer](level-react-native.md#flipper) {J3}
- How do you debug a native Android crash or log output? — [answer](level-react-native.md#logcat) {J3}
- Beyond a single fade, how do you compose complex animations with the Animated API? — [answer](level-react-native.md#animated-composition-and-imperative-animations) {M1, M2, M3, S1}
- Why Reanimated over the Animated API, and how does its model differ? — [answer](level-react-native.md#reanimated-declarative-api) {M1, M2, M3, S1}
- How do gestures work in RN, and how do you combine them with animation? — [answer](level-react-native.md#gesture-responder-system) {M1, M2, M3, S1}
- An animation is smooth on iOS but janky on Android. How do you approach it? — [answer](level-react-native.md#cross-platform-animation-optimization) {M1, M2, M3, S1}
- How do you make React Navigation work properly on the web? — [answer](level-react-native.md#react-navigation-on-web) {M1, M2, M3}
- What does react-native-screens do, and how do modals and overlays fit in? — [answer](level-react-native.md#react-native-screens-and-modals) {M1, M2, M3}
- How do you keep AsyncStorage in sync with your React state without bugs? — [answer](level-react-native.md#asyncstorage-and-state-sync) {M1, M2, M3}
- When do you use secure storage, and what are its trade-offs? — [answer](level-react-native.md#secure-storage) {M1, M2, M3}
- How does linking native libraries work, and when do you link manually? — [answer](level-react-native.md#linking-native-libraries) {M1, M2, M3, S1}
- How does JavaScript actually communicate with native code in React Native? — [answer](level-react-native.md#js-to-native-bridge-communication) {M1, M2, M3, S1}
- How do you expose a native view to React, and how do you debug it? — [answer](level-react-native.md#native-ui-components) {M1, M2, M3, S1}
- What is Hermes and why would you enable it? — [answer](level-react-native.md#hermes-engine) {M1, M2, M3, S1}
- What is Headless JS and when is it the right tool? — [answer](level-react-native.md#headless-js) {M1, M2, M3, S1}
- What is Fabric and how does it differ from the old rendering system? — [answer](level-react-native.md#fabric-renderer) {M1, M2, M3, S1}
- What is JSI and why is it foundational to the New Architecture? — [answer](level-react-native.md#jsi) {M1, M2, M3, S1}
- How do you handle runtime permissions so the app is store-compliant and doesn't get rejected? — [answer](level-react-native.md#app-permissions) {M2, M3}
- What is TLS/certificate pinning and what threat does it stop? — [answer](level-react-native.md#tls-pinning) {M2, M3}

## Software Engineering Practices

### Engineering foundations (J1–S1)

- What's the difference between a class and an object, and can you define the four pillars of OOP? — [answer](level-engineering.md#oop-fundamentals) {J1, J2, J3}
- What is an algorithm, and which basic data structures do you reach for day to day? — [answer](level-engineering.md#algorithms-and-data-structures-basics) {J1, J2, J3}
- Walk me through how you debug a bug you've never seen before. — [answer](level-engineering.md#the-debugging-process) {J1, J2}
- What is REST? — [answer](level-engineering.md#rest-fundamentals) {J1, J2, J3}
- What is GraphQL and what problem does it solve? — [answer](level-engineering.md#graphql-fundamentals) {J1, J2, J3}
- What is AJAX, how do you make a basic request, and which HTTP methods map to CRUD? — [answer](level-engineering.md#ajax-and-xhr-basics) {J1, J2, J3}
- Why do we need CORS? — [answer](level-engineering.md#why-cors-exists) {J1, J2, J3}
- How does long polling work? — [answer](level-engineering.md#how-long-polling-works) {J1, J2, J3}
- What are the main WebSocket API methods and events? — [answer](level-engineering.md#websocket-api-basics) {J1, J2, J3}
- What are Server-Sent Events, and what's the API? — [answer](level-engineering.md#server-sent-events-basics) {J1, J2, J3}
- What is refactoring, and when do you do it? — [answer](level-engineering.md#what-refactoring-is) {J1, J2}
- Explain test plan, suite, and case, the main test types, and what makes a good unit test. — [answer](level-engineering.md#testing-fundamentals-and-first) {J1, J2}
- What is functional programming and what are its core concepts? — [answer](level-engineering.md#functional-programming-fundamentals) {J2, J3}
- How do you make sure you follow a project's code conventions? — [answer](level-engineering.md#following-code-conventions) {J2, J3}
- What is reactive programming, and what are its main building blocks? — [answer](level-engineering.md#reactive-programming-fundamentals) {J3, M1}
- What's an automated build, and what does a build tool actually do? — [answer](level-engineering.md#automated-builds-basics) {J3, M1}
- How do you use the browser console and logging to troubleshoot? — [answer](level-engineering.md#logging-and-the-browser-console) {J3, M1, M2}
- Cover HTTP vs HTTPS, how you store passwords, and the common form/URL attacks. — [answer](level-engineering.md#web-security-fundamentals) {J3}
- What code smells and anti-patterns do you watch for, and how do you manage technical debt? — [answer](level-engineering.md#code-smells-and-technical-debt) {J3, M1, M2, M3}
- Explain the testing pyramid, TDD vs BDD, and the difference between a stub and a mock. — [answer](level-engineering.md#testing-pyramid-tdd-and-test-doubles) {J3, M1}
- Walk me through SOLID, and give a real example of one you've applied. — [answer](level-engineering.md#solid-principles) {M1, M2, M3}
- Contrast imperative and functional style, and explain functors, monads, and currying. — [answer](level-engineering.md#functors-monads-and-composition) {M1, M2}
- Explain Big-O notation and compare a few sorting and searching algorithms. — [answer](level-engineering.md#big-o-and-sorting-algorithms) {M1, M2, M3, S1}
- Caching is a REST constraint — how does it actually work over HTTP? — [answer](level-engineering.md#rest-caching-constraint) {M1, M2, M3, S1}
- When would you choose GraphQL over REST, and what do you give up? — [answer](level-engineering.md#graphql-versus-rest) {M1, M2, M3, S1}
- Difference between PUT, PATCH, and POST — and what do OPTIONS and HEAD do? Also, AJAX vs COMET? — [answer](level-engineering.md#put-patch-post-and-comet) {M1, M2, M3, S1}
- Walk me through the CORS headers and when a preflight happens. — [answer](level-engineering.md#cors-headers-and-preflight) {M1, M2, M3, S1}
- Long polling vs regular polling — what's the difference and where do you use each? — [answer](level-engineering.md#long-polling-versus-regular-polling) {M1, M2, M3, S1}
- How do WebSockets handle cross-origin, and how do you integrate them into an app? — [answer](level-engineering.md#websocket-cross-origin-and-integration) {M1, M2, M3, S1}
- How does CORS work with SSE and EventSource? — [answer](level-engineering.md#eventsource-and-cors) {M1, M2, M3, S1}
- Name some threat categories, explain JSON hijacking, and contrast symmetric and asymmetric cryptography. — [answer](level-engineering.md#threats-and-cryptography) {M1, M2, M3}
- What's your approach to code review, and which software metrics do you actually use? — [answer](level-engineering.md#code-review-and-software-metrics) {M1, M2}
- What are the hard parts of implementing reactive programming in practice? — [answer](level-engineering.md#reactive-programming-challenges) {M2, M3, S1}
- How do you build and maintain a real CI/CD pipeline beyond just running tests? — [answer](level-engineering.md#cicd-pipelines-and-release-automation) {M2, M3}
- Cover the GoF pattern groups, the main macro-architecture patterns, and where UML fits. — [answer](level-engineering.md#architecture-and-design-patterns) {S1}

## Software Development Processes

### Process foundations (J1–S1)

- Why do teams use a bug tracker like Jira instead of a spreadsheet or a Slack thread? — [answer](level-dev-processes.md#bug-tracking-systems) {J1, J2, J3}
- Walk me through the basic Git operations you use every day and how branching lets a team work in parallel. — [answer](level-dev-processes.md#git-fundamentals-for-teamwork) {J1, J2, J3}
- How do you estimate the effort for a task you've been assigned? — [answer](level-dev-processes.md#task-estimation-from-a-wbs) {J2, J3}
- What's the difference between Agile, Scrum, and Kanban? — [answer](level-dev-processes.md#agile-vs-scrum-and-kanban) {J2, J3, M1}
- What SDLC models do you know, and how do you decide which one fits a project? — [answer](level-dev-processes.md#sdlc-models-and-choosing-one) {J3, M1, M2, M3}
- Beyond commit and push — how do you configure a repo, inspect history, and undo changes safely? — [answer](level-dev-processes.md#git-repository-administration) {M1, M2}
- How do you estimate a whole feature or release, not just a single task — and how do you defend the number? — [answer](level-dev-processes.md#estimating-complex-projects) {M1, M2, M3}
- Compare the Waterfall and Agile life cycles, and describe how a Scrum team is structured. — [answer](level-dev-processes.md#waterfall-vs-agile-and-scrum-roles) {M2, M3, S1}
