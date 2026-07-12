# Flashcards — React (Andersen matrix, all levels)

Every matrix row as an interviewer question. Filter by level (J1→S2) and category in the deck.

## React

### React

- What is ReactDOM and why is it a separate package from React? — [answer](react-1.md#reactdom-and-render) {J1, J2, J3}
- Before React 17, why did every JSX file need `import React` even if you never wrote `React.` anywhere? — [answer](react-1.md#importing-react-before-17) {J1, J2, J3}
- What problem do Fragments solve? — [answer](react-1.md#fragments) {J1, J2, J3}
- What is Fiber in React? — [answer](react-1.md#fiber-the-basics) {J1, J2}
- At a basic level, how does React decide what to render first? — [answer](react-1.md#scheduling-and-priority) {J1, J2}
- What is a functional component and how do you hold state in one? — [answer](react-1.md#functional-components) {J1, J2}
- Write a class component with state and a data fetch. — [answer](react-1.md#class-components) {J1, J2}
- Why are props read-only, and how does a child send data back to a parent? — [answer](react-1.md#props-and-reverse-data-flow) {J1, J2}
- What actually happens when you call `setState`? — [answer](react-1.md#state-and-setstate) {J1, J2}
- How did React validate props at runtime before TypeScript? — [answer](react-1.md#runtime-prop-validation) {J1, J2}
- What is a ref and when do you need one? — [answer](react-1.md#refs-the-basics) {J1, J2}
- What are portals for? — [answer](react-1.md#portals) {J1, J2}
- Show the ways to conditionally render, and where the traps are. — [answer](react-1.md#conditional-rendering) {J1, J2}
- How do React's JSX handlers differ from native DOM handlers? — [answer](react-1.md#jsx-event-handlers) {J1, J2, J3}
- How do you keep `this` correct in a class handler, and does this matter with hooks? — [answer](react-1.md#handler-binding-and-context) {J1, J2, J3}
- What is a SyntheticEvent and why does React wrap native events? — [answer](react-1.md#syntheticevent) {J1, J2, J3}
- Briefly, what categories of events does React support? — [answer](react-1.md#event-types) {J1, J2, J3}
- Controlled versus uncontrolled components — trade-offs? — [answer](react-1.md#controlled-vs-uncontrolled) {J1, J2, J3}
- How would you implement a custom form from scratch? — [answer](react-1.md#building-custom-forms) {J1, J2, J3}
- How does event bubbling work in React, and how is it different from the DOM? — [answer](react-1.md#event-bubbling-in-react) {J1, J2, J3}
- What's a mock server and why use one in a React project? — [answer](react-1.md#mock-servers) {J1, J2, J3}
- Why and how would you use WebSockets in a React app? — [answer](react-1.md#websockets-in-react) {J1, J2, J3}
- What is Redux for, and what are its three principles? — [answer](react-1.md#three-redux-principles) {J1, J2, J3, M1}
- What does `connect` do and where does it sit in the architecture? — [answer](react-1.md#the-connect-hoc) {J1, J2, J3, M1}
- What is an action in Redux? — [answer](react-1.md#redux-actions) {J1, J2, J3, M1}
- What rules must a reducer follow, and write one. — [answer](react-1.md#redux-reducers) {J1, J2, J3, M1}
- What is middleware in Redux and what's it for? — [answer](react-1.md#redux-middleware) {J1, J2, J3, M1}
- How does redux-form fit into a React + Redux app? — [answer](react-1.md#redux-form) {J1, J2, J3, M1}
- Why were hooks introduced — what do they solve? — [answer](react-1.md#why-hooks) {J2, J3}
- What does `useEffect` do, and explain its dependency array and cleanup. — [answer](react-1.md#useeffect) {J2, J3}
- Compare `useState`, `useReducer`, and `useContext`. — [answer](react-1.md#usestate-usereducer-usecontext) {J2, J3}
- When do `useCallback` and `useMemo` actually help? — [answer](react-1.md#usecallback-and-usememo) {J2, J3}
- Explain the Fiber architecture in depth — the two phases and the two trees. — [answer](react-1.md#fiber-the-deep-cut) {J3, M1, M2}
- How does React prioritize and schedule work at a good level of detail? — [answer](react-1.md#scheduling-priority-lanes) {J3, M1, M2}
- Why does reconciliation recurse over child elements, and what guides the diff? — [answer](react-1.md#recursion-over-children) {J3, M1, M2}
- What are the real pros and cons of functional components versus classes? — [answer](react-1.md#functional-components-in-depth) {J3, M1, M2, M3, S1}
- Give a deep take on class components and why functional ones are preferred. — [answer](react-1.md#class-components-in-depth) {J3, M1, M2, M3, S1}
- Why is `setState` asynchronous, how is it batched, and what's the callback for? — [answer](react-1.md#setstate-batching-and-async) {J3, M1, M2, M3, S1}
- Walk through the main lifecycle methods and their order. — [answer](react-1.md#lifecycle-methods) {J3, M1, M2, M3, S1}
- Why add Flow or TypeScript when React already has prop-types? — [answer](react-1.md#static-typing-with-typescript) {J3, M1, M2, M3, S1}
- What are `PureComponent` and `React.memo` for, and how do they differ from a plain component? — [answer](react-1.md#purecomponent-and-memo) {J3, M1, M2, M3, S1}
- What are refs really for, and how does `forwardRef` fit in? — [answer](react-1.md#forwardref) {J3, M1, M2, M3, S1}

### React

- What is React.Context and when do you actually reach for it? — [answer](react-2.md#react-context) {J3, M1, M2, M3, S1}
- What are portals for, and can you give a concrete case where you'd reach for one? — [answer](react-2.md#portals-in-practice) {J3, M1, M2, M3, S1}
- Explain the render-props pattern and what problem it solves. — [answer](react-2.md#render-props) {J3, M1, M2, M3, S1}
- What are Reselect and Recompose used for? — [answer](react-2.md#reselect-and-recompose) {J3}
- What is virtualization and what problem does it solve? — [answer](react-2.md#list-virtualization) {J3}
- Explain Concurrent Mode and Suspense in your own words. — [answer](react-2.md#concurrent-mode-and-suspense) {J3}
- How do lazy-loading and tree shaking reduce bundle size? — [answer](react-2.md#bundle-splitting-lazy-loading-and-tree-shaking) {J3}
- How do you use React DevTools and Redux DevTools? — [answer](react-2.md#react-and-redux-devtools) {J3}
- Where are service workers useful in a React app? — [answer](react-2.md#service-workers) {J3}
- What is SSR and how does hydration fit in? — [answer](react-2.md#server-side-rendering-basics) {J3}
- What are Jest and Enzyme for, and how do they differ? — [answer](react-2.md#jest-and-enzyme) {J3, M1}
- What is snapshot testing and when is it worth using? — [answer](react-2.md#snapshot-testing) {J3, M1}
- What are e2e tests for, and how do they differ from unit and integration tests? — [answer](react-2.md#end-to-end-testing) {J3, M1}
- How do you work with React Router? — [answer](react-2.md#react-router) {J3}
- Walk me through Route, Switch, and Link. — [answer](react-2.md#react-router-api-route-switch-link) {J3}
- How do you lazy-load routes and why? — [answer](react-2.md#lazy-routes) {J3, M1, M2, M3, S1, S2}
- Why was ReactDOM moved into its own library? — [answer](react-2.md#why-reactdom-is-a-separate-package) {M1, M2, M3, S1, S2}
- What does JSX compile to, and why did older code need React in scope? — [answer](react-2.md#jsx-to-js-compilation) {M1, M2, M3, S1, S2}
- What is SyntheticEvent and what events does React support through it? — [answer](react-2.md#syntheticevent-supported-events) {M1, M2, M3, S1, S2}
- Go deeper on how React's event system routes events. — [answer](react-2.md#event-types-deep-dive) {M1, M2, M3, S1, S2}
- What's an uncontrolled component and when would you use one? — [answer](react-2.md#uncontrolled-components) {M1, M2, M3, S1, S2}
- Why use Formik or React Final Form instead of hand-rolling forms? — [answer](react-2.md#form-libraries-formik-and-react-final-form) {M1, M2, M3, S1, S2}
- How does event bubbling work through a portal? — [answer](react-2.md#portal-event-bubbling) {M1, M2, M3, S1, S2}
- What are keys for, and how does shouldComponentUpdate help performance? — [answer](react-2.md#keys-and-shouldcomponentupdate) {M1, M2, M3}
- How does Reselect memoization actually work, and where does it break? — [answer](react-2.md#reselect-and-recompose-in-depth) {M1, M2, M3}
- How do you implement virtualization with a library? — [answer](react-2.md#virtualization-libraries) {M1, M2, M3}
- When do useMemo and useCallback actually help versus add noise? — [answer](react-2.md#usememo-vs-usecallback) {M1, M2, M3}
- Explain lazy loading and how dynamic imports enable it. — [answer](react-2.md#lazy-and-dynamic-imports) {M1, M2, M3}
- Which concurrent UI patterns do you apply and when? — [answer](react-2.md#concurrent-ui-patterns) {M1, M2, M3}
- How do you optimize a webpack bundle beyond lazy-loading? — [answer](react-2.md#bundle-optimization-chunks-and-import-cost) {M1, M2, M3}
- How do you find and fix a performance bottleneck with DevTools? — [answer](react-2.md#profiling-with-devtools) {M1, M2, M3}
- Walk through the service worker lifecycle and why registration might fail. — [answer](react-2.md#service-worker-internals) {M1, M2, M3}
- Compare the ReactDOMServer render methods. — [answer](react-2.md#reactdomserver-render-methods) {M1, M2, M3}
- Explain how React Router works under the hood. — [answer](react-2.md#how-react-router-works) {M1, M2}
- Which hooks does React Router provide and how do you use them? — [answer](react-2.md#routing-hooks) {M1, M2}
- What are Route, Switch, Link, and Redirect each for? — [answer](react-2.md#react-router-api-with-redirect) {M1, M2}
- What are the history, location, and match objects, and how do they differ from the native ones? — [answer](react-2.md#history-location-match) {M1, M2}
- What is connected-react-router and why use it? — [answer](react-2.md#connected-react-router) {M1, M2}
- How do you interact with a server in React, and Axios versus Fetch? — [answer](react-2.md#working-with-an-api-axios-and-fetch) {M1, M2, M3, S1}
- What's a mock server and which tools do you use? — [answer](react-2.md#mock-servers) {M1, M2, M3, S1}
- How and why do you use WebSockets in a React app? — [answer](react-2.md#websockets-with-react) {M1, M2, M3, S1}
- Why can't hooks run in conditions or loops, and how do you branch instead? — [answer](react-2.md#rules-of-hooks) {M1, M2, M3, S1, S2}

### React

- You have three state hooks — how do you decide which one a piece of state belongs in? — [answer](react-3.md#choosing-usestate-usereducer-usecontext) {M1, M2, M3, S1, S2}
- What's a custom hook, and what does extracting one actually buy you? — [answer](react-3.md#custom-hooks) {M1, M2, M3, S1, S2}
- Walk me through the less common hooks — when do you actually reach for each? — [answer](react-3.md#useref-useimperativehandle-uselayouteffect-usedebugvalue) {M1, M2, M3, S1, S2}
- How do you test different kinds of React entities — a plain component, a utility, a HOC, a modal rendered in a portal? — [answer](react-3.md#testing-components-hocs-and-modals) {M2, M3, S1}
- When is snapshot testing genuinely useful, and when does it become noise? — [answer](react-3.md#snapshot-testing) {M2, M3, S1, S2}
- What do e2e tests give you that unit and integration tests don't, and how does Cypress fit? — [answer](react-3.md#end-to-end-testing-with-cypress) {M2, M3, S1}
- How do you write reducers today — still switch/case, or Redux Toolkit? What changed? — [answer](react-3.md#reducers-and-redux-toolkit) {M2, M3, S1, S2}
- Redux middleware — what is it, and can you write one? — [answer](react-3.md#writing-custom-middleware) {M2, M3, S1, S2}
- What problem do selectors solve, and why memoize them? — [answer](react-3.md#selectors) {M2, M3, S1, S2}
- What is redux-form, and how does it fit the Redux ecosystem? — [answer](react-3.md#redux-form) {M2, M3, S1, S2}
- Name an alternative to plain Redux and explain the different philosophy. — [answer](react-3.md#redux-alternatives-mobx-and-sagas) {M2, M3, S1, S2}
- Explain Fiber at a deep level — what is a fiber node and how does the two-phase work loop function? — [answer](react-3.md#fiber-internals) {M3, S1, S2}
- How does React decide what to render first — explain the scheduling model fully. — [answer](react-3.md#fiber-work-prioritization) {M3, S1, S2}
- Why does reconciliation involve recursion over children, and how does React apply it in practice? — [answer](react-3.md#recursion-over-child-elements) {M3, S1, S2}
- Explain how React Router works internally — could you sketch a minimal version? — [answer](react-3.md#how-react-router-works) {M3, S1, S2}
- Which hooks does React Router expose, and when would you write your own routing hook? — [answer](react-3.md#routing-hooks) {M3, S1, S2}
- What's the difference between BrowserRouter, StaticRouter, HashRouter, and MemoryRouter? — [answer](react-3.md#router-types-browser-static-memory) {M3, S1, S2}
- What are the history, location, and match objects, and how do they differ from the native browser equivalents? — [answer](react-3.md#history-location-match) {M3, S1, S2}
- What is connected-react-router, why use it, and how would you build it from scratch? — [answer](react-3.md#connected-react-router) {M3, S1, S2}
- When do you choose Component over PureComponent, and how do you find what's actually re-rendering too much? — [answer](react-3.md#component-vs-purecomponent-profiling) {S1, S2}
- Explain the Reselect and Recompose APIs in depth. — [answer](react-3.md#reselect-and-recompose-api) {S1, S2}
- What is virtualization and why does rendering a long list need it? — [answer](react-3.md#list-virtualization) {S1, S2}
- useMemo and useCallback have a cost too — how do you decide when they're worth it? — [answer](react-3.md#avoiding-over-memoization) {S1, S2}
- How does lazy loading work in React, and what actually happens at the bundle level? — [answer](react-3.md#lazy-and-dynamic-imports) {S1, S2}
- Explain the concurrent rendering APIs — useTransition, useDeferredValue, and Suspense for data. — [answer](react-3.md#concurrent-rendering-and-suspense) {S1, S2}
- Beyond code-splitting, how do you keep a React bundle small and well-cached? — [answer](react-3.md#bundle-optimization-and-caching) {S1, S2}
- Walk me through profiling a slow React screen with the DevTools. — [answer](react-3.md#profiling-with-devtools) {S1, S2}
- How do service workers work, and what are the common reasons one fails to register? — [answer](react-3.md#service-worker-registration) {S1, S2}
- Explain SSR end to end — how does it work, and what does hydration actually do? — [answer](react-3.md#server-side-rendering-deep-dive) {S1, S2}
- If I call setState three times in a sync handler versus inside a setTimeout or async callback, how many re-renders happen and why? — [answer](react-3.md#batching-and-setstate-timing) {S2}
- Name the class lifecycle methods and explain their execution order across mount, update, and unmount. — [answer](react-3.md#lifecycle-method-order) {S2}
- Why do we need React.memo, and how is it different from PureComponent? — [answer](react-3.md#why-reactmemo) {S2}
- What do refs really mean in React, and what are the legitimate use cases? — [answer](react-3.md#the-meaning-of-refs) {S2}
- How do you apply Context well, and what's the deep understanding of its cost? — [answer](react-3.md#applying-context) {S2}
- A portal renders its DOM outside the parent — so how do events bubble through it? — [answer](react-3.md#event-bubbling-through-portals) {S2}
- What is a HOC, and can you write a custom one? When would you still use it over a hook? — [answer](react-3.md#higher-order-components) {S2}
- How do you structure a test suite — the pyramid, patterns, and where TDD fits? — [answer](react-3.md#test-patterns-and-the-testing-pyramid) {S2}
- You write e2e tests regularly — how do you keep them fast and non-flaky in practice? — [answer](react-3.md#e2e-as-a-regular-practice) {S2}
- At a high level, how do you interact with a server in React, and how does that change with Redux or a data library? — [answer](react-3.md#server-interaction-strategy) {S2}
- Explain WebSockets in a React app in depth — the lifecycle, and how you manage the connection cleanly? — [answer](react-3.md#websockets-in-react) {S2}

## Browser API

### Browser & Web APIs

- What is the DOM and how does the browser build it? — [answer](browser-api.md#dom-basics) {J1}
- How do you toggle a CSS class in JavaScript, and why prefer classList? — [answer](browser-api.md#classlist-vs-classname) {J1}
- What are the ways to get elements from the DOM? — [answer](browser-api.md#finding-elements) {J1}
- How do you attach and remove event handlers, and how do you stop an event? — [answer](browser-api.md#dom-event-handling) {J1}
- What is a cookie and how do you set and read one? — [answer](browser-api.md#cookies) {J1, J2}
- localStorage vs sessionStorage — when do you use each? — [answer](browser-api.md#web-storage) {J1, J2}
- Walk me through a basic HTML document and the block vs inline distinction. — [answer](browser-api.md#html-document-structure) {J1, J2}
- How does selector specificity work, and how do you hide an element? — [answer](browser-api.md#css-fundamentals) {J1, J2}
- How do you navigate between DOM nodes, and what's console.log vs console.dir? — [answer](browser-api.md#dom-navigation) {J2, J3, M1, M2}
- Explain client* vs offset* vs scroll*, and how to get an element's rectangle. — [answer](browser-api.md#element-size-and-position) {J2, J3, M1, M2}
- How do you read the actual applied style of an element, and what is cssText? — [answer](browser-api.md#computed-styles) {J2, J3, M1, M2}
- What's the real difference between getElementsBy* and querySelectorAll? — [answer](browser-api.md#getelement-vs-queryselector) {J2, J3, M1, M2}
- Explain bubbling, capturing, and event delegation. — [answer](browser-api.md#event-propagation-and-delegation) {J2, J3, M1, M2}
- How do you control a cookie's lifetime and security? — [answer](browser-api.md#cookie-attributes) {J3, M1, M2}
- How do you set, read, and clear web storage, and how do tabs stay in sync? — [answer](browser-api.md#storage-events) {J3, M1, M2}
- What is IndexedDB and when would you use it over localStorage? — [answer](browser-api.md#indexeddb-basics) {J3, M1, M2}
- What's the difference between minification and uglification? — [answer](browser-api.md#minification) {J3, M1}
- How does browser caching work and how do you compress assets? — [answer](browser-api.md#browser-caching) {J3, M1}
- What are Web Workers and why do we need them? — [answer](browser-api.md#web-workers-intro) {J3, M1}
- How do HTML forms, media, SVG, and meta tags work together? — [answer](browser-api.md#html-media-and-forms) {J3, M1, M2}
- How does Flexbox work and what makes a layout responsive? — [answer](browser-api.md#flexbox-and-responsive) {J3, M1, M2}
- What is tree shaking and how do you avoid shipping duplicate dependencies? — [answer](browser-api.md#tree-shaking) {M2, M3, S1}
- Explain async vs defer on script tags, and what critical CSS is. — [answer](browser-api.md#async-vs-defer) {M2, M3, S1}
- Walk through creating, messaging, terminating, and error-handling a Web Worker. — [answer](browser-api.md#web-worker-lifecycle) {M2, M3, S1}
- What is a Service Worker and what are the steps to use one? — [answer](browser-api.md#service-worker-basics) {M2, M3, S1}
- What are Web Components and what does Shadow DOM give you? — [answer](browser-api.md#web-components-and-shadow-dom) {M3, S1, S2}
- Which element size/position properties can you write to, versus only read? — [answer](browser-api.md#writeable-geometry-properties) {M3, S1, S2}
- How do you dispatch custom events, and what's the difference between the page-load events? — [answer](browser-api.md#custom-events-and-load-events) {M3, S1, S2}
- How do you delete a cookie, and what are the size, GDPR, and third-party constraints? — [answer](browser-api.md#cookie-removal-gdpr-third-party) {M3, S1, S2}
- What are the storage limits for localStorage and sessionStorage? — [answer](browser-api.md#storage-size-limits) {M3, S1, S2}
- How does IndexedDB versioning work and how do cursors help? — [answer](browser-api.md#indexeddb-versioning-and-cursors) {M3, S1, S2}
- What do the template, iframe, and canvas elements each do? — [answer](browser-api.md#template-iframe-canvas) {M3, S1, S2}
- When do you use Grid over Flexbox, and how do transitions differ from keyframe animations? — [answer](browser-api.md#grid-animations-vendor-prefixes) {M3, S1, S2}
- Gzip vs Brotli, and static vs dynamic compression — when does each apply? — [answer](browser-api.md#gzip-vs-brotli) {S2}
- How do you lazy-load code chunks and why? — [answer](browser-api.md#lazy-loading-code-chunks) {S2}
- What are shared workers and embedded workers, and how does CSP affect workers? — [answer](browser-api.md#shared-workers-and-csp) {S2}
- How do Service Workers compare to AppCache, and how do you version them? — [answer](browser-api.md#service-workers-vs-appcache) {S2}

## TypeScript

### TypeScript

- Walk me through TypeScript's special types — `void`, `never`, `unknown` — and when you reach for union and literal types. — [answer](typescript.md#basic-types) {J1, J2}
- How does an `interface` differ from a `class`, and how do optional, readonly, and function-typed members work? — [answer](typescript.md#interface-vs-class) {J1, J2}
- How do you type a function's parameters and return, including rest and optional params? — [answer](typescript.md#typing-functions) {J1, J2}
- What do `public`, `private`, and `protected` do, and what are parameter properties? — [answer](typescript.md#access-modifiers) {J1, J2}
- Explain numeric versus string enums, and computed versus constant members. — [answer](typescript.md#enums) {J1, J2, J3}
- Why do declaration files exist, and what does the `declare` keyword do? — [answer](typescript.md#declaration-files) {J1, J2, J3}
- How does type casting work, and how do you write simple and class generics? — [answer](typescript.md#type-casting-and-generics) {J3, M1, M2}
- What are indexable types, and what does it mean to use a class as an interface? — [answer](typescript.md#indexable-types) {J3, M1, M2}
- How do you type `this` in a function, and why would you need to? — [answer](typescript.md#typing-this) {J3, M1, M2}
- What is an abstract class and when do you use one over an interface? — [answer](typescript.md#abstract-classes) {J3, M1, M2, M3, S1}
- What are namespaces and should you use them in a modern codebase? — [answer](typescript.md#namespaces) {M1, M2, M3, S1}
- How do you constrain a generic, use class types in generics, and how do you think about `void`? — [answer](typescript.md#generic-constraints) {M3, S1, S2}
- What's a construct signature on an interface, and what are hybrid types? — [answer](typescript.md#construct-signatures-and-hybrid-types) {M3, S1, S2}
- How do you write overloads for a function type, and when are they worth it? — [answer](typescript.md#function-overloads) {M3, S1, S2}
- What does a private constructor enable? — [answer](typescript.md#private-constructors) {S2}
- What's the difference between how a `const enum` and a regular enum behave at runtime versus compile time? — [answer](typescript.md#enums-at-runtime) {S2}
- What are your best practices for typings and declaration files in a real project? — [answer](typescript.md#typing-best-practices) {S2}

## JavaScript

### ES5 fundamentals

- What gets logged if you read a `var` before its declaration, and how does `==` differ from `===`? — [answer](../_shared/js-es5.md#control-flow-and-hoisting) {J1, J2}
- How many ways can you create an object, and how do you iterate its keys? — [answer](../_shared/js-es5.md#working-with-objects) {J1, J2}
- What is the garbage collector and why does JS need one? — [answer](../_shared/js-es5.md#why-a-garbage-collector) {J1, J2}
- List JavaScript's data types. — [answer](../_shared/js-es5.md#the-data-types) {J1, J2}
- How do you get and set the year, month, and day on a Date? — [answer](../_shared/js-es5.md#reading-and-setting-dates) {J1, J2}
- How do you clone an object with JSON methods, and when does it break? — [answer](../_shared/js-es5.md#cloning-with-json) {J1, J2}
- What are the ways to define a function, and what's an IIFE for? — [answer](../_shared/js-es5.md#function-forms-and-iifes) {J1}
- How is `this` determined, and how do you bind it? — [answer](../_shared/js-es5.md#the-value-of-this) {J1}
- Explain `__proto__` versus `prototype` and the prototype chain. — [answer](../_shared/js-es5.md#prototypes-and-the-chain) {J1, J2, J3}
- What does 'blocking code' mean in a single-threaded runtime? — [answer](../_shared/js-es5.md#blocking-the-main-thread) {J1}
- What's the difference between setTimeout and setInterval, and how do you cancel them? — [answer](../_shared/js-es5.md#timers-settimeout-and-setinterval) {J1}
- Name the two ways to build a RegExp and the two main methods to use it. — [answer](../_shared/js-es5.md#regex-basics) {J1, J2}
- What is the `arguments` object, why is it 'array-like', and give a recursion example. — [answer](../_shared/js-es5.md#arguments-and-recursion) {J2, J3}
- Define a closure using lexical environment and scope, and show one. — [answer](../_shared/js-es5.md#closures-and-scope) {J2, J3}
- How do try/catch and throw work, and what can you throw? — [answer](../_shared/js-es5.md#trycatch-and-throwing) {J2, J3}
- Predict the order when a `setTimeout(…,0)` and a resolved Promise both queue. — [answer](../_shared/js-es5.md#macrotasks-and-microtasks) {J2, J3, M1}
- How does `var` behave, what happens without any keyword, and what does 'use strict' change? — [answer](../_shared/js-es5.md#var-and-use-strict) {J3, M1, M2, M3, S1}
- When you assign an object to a new variable, what's shared — and what are property descriptors? — [answer](../_shared/js-es5.md#object-references-and-descriptors) {J3, M1, M2}
- Explain the mark-and-sweep algorithm and what 'reachable' means. — [answer](../_shared/js-es5.md#mark-and-sweep) {J3, M1, M2}
- How does type conversion work, and what does `typeof` return for each type? — [answer](../_shared/js-es5.md#type-conversion-and-typeof) {J3, M1, M2, M3}
- How do you parse a string into a Date, and what's risky about it? — [answer](../_shared/js-es5.md#parsing-dates) {J3, M1, M2, M3}
- How do you turn an object into JSON, and what gets dropped? — [answer](../_shared/js-es5.md#serializing-with-jsonstringify) {J3, M1, M2, M3}
- What do assertions and quantifiers do in a regex, and how do you escape special characters? — [answer](../_shared/js-es5.md#quantifiers-and-escaping) {J3, M1, M2}
- What is currying, how would you traverse a nested object recursively, and what does `new Function` do? — [answer](../_shared/js-es5.md#currying-and-new-function) {M1, M2, M3, S1, S2}
- A closure keeps variables alive — when does that memory get collected? — [answer](../_shared/js-es5.md#when-closures-free-memory) {M1, M2, M3, S1, S2}
- How does prototypal inheritance differ from classical OOP inheritance? — [answer](../_shared/js-es5.md#prototypal-vs-classical-inheritance) {M1, M2, M3, S1}
- What is `finally` for, and what properties does an Error carry? — [answer](../_shared/js-es5.md#finally-and-the-error-object) {M1, M2}
- JS is single-threaded — how does it do 'concurrency'? — [answer](../_shared/js-es5.md#concurrency-without-threads) {M2, M3, S1, S2}
- What is requestAnimationFrame and why prefer it over setInterval for animation? — [answer](../_shared/js-es5.md#requestanimationframe) {M2, M3, S1, S2}
- How do you deep-clone an object, and how would you model a linked list with objects? — [answer](../_shared/js-es5.md#deep-clone-and-linked-lists) {M3, S1, S2}
- What optimizations do modern garbage collectors use beyond mark-and-sweep? — [answer](../_shared/js-es5.md#generational-and-incremental-gc) {M3, S1, S2}
- How do you catch errors that escape your try/catch blocks? — [answer](../_shared/js-es5.md#global-error-handling-with-windowonerror) {M3, S1, S2}
- How do capture groups and character ranges work, and what advanced flags exist? — [answer](../_shared/js-es5.md#groups-ranges-and-flags) {M3, S1, S2}
- How do you handle UTC versus local time, and how do you check a Date is valid? — [answer](../_shared/js-es5.md#utc-time-zones-and-valid-dates) {S1, S2}
- What's the second argument to JSON.parse for? — [answer](../_shared/js-es5.md#the-jsonparse-reviver) {S1, S2}
- Why is 'eval is evil' a rule of thumb? — [answer](../_shared/js-es5.md#why-eval-is-evil) {S2}
- How do you find an object's constructor through its prototype? — [answer](../_shared/js-es5.md#recovering-the-constructor) {S2}

### ES6+

- Walk me through the ES6 basics you reach for daily — let/const, destructuring, arrow functions. — [answer](../_shared/js-es6.md#modern-bindings-and-syntax) {J1, J2}
- How do imports and exports work in ES modules? — [answer](../_shared/js-es6.md#es-modules) {J1, J2}
- Show me class syntax in JS — constructor, inheritance, private fields. — [answer](../_shared/js-es6.md#class-fundamentals) {J1, J2}
- Make a simple GET request with fetch and handle the response. — [answer](../_shared/js-es6.md#fetch-basics) {J1, J2, J3}
- When do you use Map over a plain object, and what does `??` solve that `||` doesn't? — [answer](../_shared/js-es6.md#map-set-and-nullish-coalescing) {J3, M1, M2, M3}
- Why do some teams ban default exports, and what's a re-export for? — [answer](../_shared/js-es6.md#default-exports-and-re-exports) {J3, M1, M2, M3}
- What does `instanceof` actually check, and when do static methods make sense? — [answer](../_shared/js-es6.md#instanceof-and-static-members) {J3, M1, M2}
- What do promises give you over callbacks, and what are their states? — [answer](../_shared/js-es6.md#promises-versus-callbacks) {J3, M1}
- Give me an async/await example and show how you handle errors. — [answer](../_shared/js-es6.md#async-functions-and-error-handling) {J3, M1}
- What is a Symbol and where is it genuinely useful? — [answer](../_shared/js-es6.md#the-symbol-type) {M1, M2, M3}
- How do you download binary data with fetch and set request headers? — [answer](../_shared/js-es6.md#advanced-fetch-binary-and-headers) {M1, M2}
- Explain promise chaining, value fall-through, and what `finally` is for. — [answer](../_shared/js-es6.md#promise-chaining-and-finally) {M2, M3}
- Convert a promise chain to async/await, including an async class method. — [answer](../_shared/js-es6.md#rewriting-promises-with-async-await) {M2, M3}
- How does a generator work, and how do you compose two of them? — [answer](../_shared/js-es6.md#generators-and-composition) {M2, M3}
- How do you share behavior across classes without deep inheritance — mixins, decorators, functional inheritance? — [answer](../_shared/js-es6.md#mixins-and-decorators) {M3, S1, S2}
- What's the real difference between XMLHttpRequest and fetch? — [answer](../_shared/js-es6.md#xhr-versus-fetch) {M3, S1, S2}
- Explain WeakMap versus Map, what Proxy/Reflect enable, and tagged templates. — [answer](../_shared/js-es6.md#weakmap-proxy-and-tagged-templates) {S1, S2}
- Why does BigInt exist and what should you watch out for? — [answer](../_shared/js-es6.md#bigint) {S1, S2}
- How do you lazy-load a module, and what's a module namespace export? — [answer](../_shared/js-es6.md#dynamic-imports-and-namespace-exports) {S1, S2}
- Compare Promise.all, race, and allSettled — and sketch an all polyfill. — [answer](../_shared/js-es6.md#promise-combinators) {S1, S2}
- What is async/await actually doing under the hood? — [answer](../_shared/js-es6.md#async-await-under-the-hood) {S1, S2}
- Explain the iterator protocol, sending values into a generator, and async generators. — [answer](../_shared/js-es6.md#iterators-and-async-generators) {S1, S2}

## Software Engineering Practices

### Engineering

- Explain the difference between a class and an object, and walk me through the four OOP pillars. — [answer](../_shared/engineering-1.md#oop-fundamentals) {J1, J2, J3}
- What is an algorithm, and which basic data structures do you reach for day to day? — [answer](../_shared/engineering-1.md#algorithms-and-data-structures-basics) {J1, J2, J3}
- Walk me through how you debug an issue you've never seen before. — [answer](../_shared/engineering-1.md#debugging-process) {J1, J2}
- What is REST? — [answer](../_shared/engineering-1.md#rest-fundamentals) {J1, J2, J3}
- What is GraphQL and what problem does it solve? — [answer](../_shared/engineering-1.md#graphql-fundamentals) {J1, J2, J3}
- What is AJAX, and how would you make a basic request and handle the response? — [answer](../_shared/engineering-1.md#ajax-and-xhr) {J1, J2, J3}
- Why do we need CORS? — [answer](../_shared/engineering-1.md#why-cors-exists) {J1, J2, J3}
- How does long polling work? — [answer](../_shared/engineering-1.md#long-polling-mechanics) {J1, J2, J3}
- What are the main WebSocket API methods and events on the client? — [answer](../_shared/engineering-1.md#websocket-api) {J1, J2, J3}
- What are the API methods and events for Server-Sent Events? — [answer](../_shared/engineering-1.md#server-sent-events-api) {J1, J2, J3}
- What is refactoring, and what makes it different from just changing code? — [answer](../_shared/engineering-1.md#refactoring-concept) {J1, J2}
- Explain test plan, suite, and case, the main test types, and what makes a good unit test. — [answer](../_shared/engineering-1.md#testing-fundamentals-and-first) {J1, J2}
- What is functional programming, and what are its core building blocks? — [answer](../_shared/engineering-1.md#functional-programming-basics) {J2, J3}
- Why follow the code conventions defined on a project, even ones you'd have written differently? — [answer](../_shared/engineering-1.md#code-conventions) {J2, J3}
- What is reactive programming, and what are its main building blocks? — [answer](../_shared/engineering-1.md#reactive-programming-basics) {J3, M1}
- What is an automated build, and what does a build tool actually do for a JS project? — [answer](../_shared/engineering-1.md#build-automation-and-cicd) {J3, M1}
- How do you use the browser console effectively, and how do you think about logging in production? — [answer](../_shared/engineering-1.md#console-and-logging) {J3, M1, M2}
- Cover HTTP vs HTTPS, how you'd store passwords, hash vs HMAC, and the common form/URL attacks. — [answer](../_shared/engineering-1.md#web-security-basics) {J3}
- What code smells and anti-patterns do you watch for, and how do you manage technical debt? — [answer](../_shared/engineering-1.md#code-smells-and-technical-debt) {J3, M1, M2, M3}
- Explain the testing pyramid, TDD vs BDD, and the difference between stubs and mocks. — [answer](../_shared/engineering-1.md#testing-pyramid-and-test-doubles) {J3, M1}
- Give me a practiced take on polymorphism and walk through SOLID. — [answer](../_shared/engineering-1.md#polymorphism-and-solid) {M1, M2, M3}
- Contrast imperative and functional style, and explain functors, monads, and currying. — [answer](../_shared/engineering-1.md#functors-monads-and-currying) {M1, M2}
- Explain Big-O and how you'd reason about sorting and searching algorithms. — [answer](../_shared/engineering-1.md#big-o-sorting-and-searching) {M1, M2, M3, S1}
- REST lists caching as an architectural constraint — why does it matter and how does it work over HTTP? — [answer](../_shared/engineering-1.md#rest-caching-constraint) {M1, M2, M3, S1}
- When would you choose GraphQL over REST, and what do you give up? — [answer](../_shared/engineering-1.md#graphql-vs-rest) {M1, M2, M3, S1}
- Explain OPTIONS, HEAD, and PATCH, and the real difference between PUT, PATCH, and POST. — [answer](../_shared/engineering-1.md#http-methods-put-vs-patch-vs-post) {M1, M2, M3, S1}

### Engineering

- Which response headers actually control CORS, and what does the browser do with them? — [answer](../_shared/engineering-2.md#cors-headers) {M1, M2, M3, S1}
- How is long polling different from regular polling, and when would you reach for it? — [answer](../_shared/engineering-2.md#long-polling-vs-polling) {M1, M2, M3, S1}
- Do WebSockets follow the same-origin policy? How do you integrate one safely? — [answer](../_shared/engineering-2.md#websocket-cross-origin) {M1, M2, M3, S1}
- How does CORS apply to Server-Sent Events and the EventSource API? — [answer](../_shared/engineering-2.md#sse-with-cors) {M1, M2, M3, S1}
- Walk me through common threat categories and where symmetric vs asymmetric crypto fit. — [answer](../_shared/engineering-2.md#security-threats-and-cryptography) {M1, M2, M3}
- What's the point of code review, and which metrics do you actually track? — [answer](../_shared/engineering-2.md#code-review-and-metrics) {M1, M2}
- Reactive programming sounds clean — what actually goes wrong when you implement it? — [answer](../_shared/engineering-2.md#reactive-programming-challenges) {M2, M3, S1}
- How do you structure a multi-phase build on a CI server? — [answer](../_shared/engineering-2.md#ci-build-pipelines) {M2, M3}
- What does a JavaScript testing stack look like, and how does BDD fit in? — [answer](../_shared/engineering-2.md#javascript-testing-stack) {M2, M3, S1, S2}
- Give me a real pure function, and explain tail call optimization. — [answer](../_shared/engineering-2.md#pure-functions-and-tail-calls) {M3, S1, S2}
- How do you configure profiling, logging, and monitoring with third-party tools? — [answer](../_shared/engineering-2.md#third-party-profilers-and-monitoring) {M3, S1, S2}
- How do you enforce code quality with tooling across a JS/TS project? — [answer](../_shared/engineering-2.md#code-quality-tooling) {M3, S1, S2}
- What design patterns and architectural patterns do you actually apply, and when? — [answer](../_shared/engineering-2.md#design-patterns-and-architecture) {S1}
- What is GRASP, and how does it relate to SOLID? — [answer](../_shared/engineering-2.md#grasp) {S1, S2}
- What does continuous integration actually require, beyond 'we have a CI server'? — [answer](../_shared/engineering-2.md#continuous-integration) {S1, S2}
- Walk me through OWASP Top 10 thinking and how TLS actually protects a request. — [answer](../_shared/engineering-2.md#owasp-and-tls) {S1, S2}
- What does 'refactoring to patterns' mean, and how do you manage technical debt as a policy? — [answer](../_shared/engineering-2.md#refactoring-to-patterns) {S1, S2}
- How do you reason about architecture qualities, and how do cloud service models factor in? — [answer](../_shared/engineering-2.md#architecture-qualities-and-cloud) {S2}
- A reactive *system* is more than reactive programming — what are its four characteristics? — [answer](../_shared/engineering-2.md#reactive-systems) {S2}
- How do you actually calculate the complexity of an algorithm? — [answer](../_shared/engineering-2.md#complexity-calculation) {S2}
- REST is defined by six architectural constraints — name them and why they matter. — [answer](../_shared/engineering-2.md#rest-six-constraints) {S2}
- What do the CONNECT and TRACE HTTP methods do, and how do you push XHR beyond the basics? — [answer](../_shared/engineering-2.md#connect-and-trace) {S2}
- Before CORS existed there was JSONP — what's the difference and why did CORS win? — [answer](../_shared/engineering-2.md#jsonp-vs-cors) {S2}
- What are WebSocket extensions and subprotocols, and how do they differ? — [answer](../_shared/engineering-2.md#websocket-extensions-and-subprotocols) {S2}
- SSE and WebSockets both push from the server — when do you pick which? — [answer](../_shared/engineering-2.md#eventsource-vs-websocket) {S2}

## Software Development Processes

### Process

- What's the point of a bug tracking system like Jira or Redmine — why not just a spreadsheet or Slack messages? — [answer](../_shared/dev-processes.md#why-bug-trackers-exist) {J1, J2, J3}
- Walk me through the core Git operations your team relies on day to day. — [answer](../_shared/dev-processes.md#git-branching-and-merging) {J1, J2, J3}
- How do you estimate the effort for a task once you have a work breakdown structure? — [answer](../_shared/dev-processes.md#estimating-from-a-wbs) {J2, J3}
- What's the difference between Agile, Scrum, and Kanban? — [answer](../_shared/dev-processes.md#agile-vs-scrum-vs-kanban) {J2, J3, M1}
- What SDLC models do you know, and how do you pick one for a project? — [answer](../_shared/dev-processes.md#choosing-an-sdlc-model) {J3, M1, M2, M3}
- How do you actually use boards, dashboards, and plugins in a tool like Jira? — [answer](../_shared/dev-processes.md#boards-dashboards-and-plugins) {M1, M2, M3, S1, S2}
- What's the difference between git reset and git revert, and when do you blame a file? — [answer](../_shared/dev-processes.md#reset-vs-revert) {M1, M2}
- How do you estimate a large, complex project — beyond summing task hours? — [answer](../_shared/dev-processes.md#pert-and-critical-path) {M1, M2, M3}
- Contrast the Waterfall and Agile life cycles, and describe the Scrum team and its roles. — [answer](../_shared/dev-processes.md#waterfall-lifecycle-and-scrum-roles) {M2, M3, S1}
- How would you set up and govern version control infrastructure for a team — including reading history and applying patches? — [answer](../_shared/dev-processes.md#versioning-infrastructure-and-patches) {M3, S1, S2}
- As a project scales, how do you define the code-review and unit-testing process within your SDLC? — [answer](../_shared/dev-processes.md#scaling-process-reviews-and-tests) {S1, S2}
- How do you produce a project estimate at the pre-sale phase, with risks and assumptions documented? — [answer](../_shared/dev-processes.md#evaluation-reports-and-parametric-models) {S1, S2}
- Run me through Scrum and Kanban end to end — their artifacts and events. — [answer](../_shared/dev-processes.md#scrum-and-kanban-artifacts-and-events) {S2}
