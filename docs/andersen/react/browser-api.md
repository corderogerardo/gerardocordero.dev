# Browser API

### DOM basics
**They ask:** "What is the DOM and how does the browser build it?"

The DOM matters because it's the single source of truth your JavaScript mutates — get its shape wrong and every query, event, and reflow you write is guessing. The DOM is the browser's live, in-memory object model of a parsed HTML document: the parser turns tags into a tree of nodes (elements, text, comments) rooted at `document`, and JS reads and writes that tree through APIs like `document.querySelector`.

It's a tree because HTML nesting is a tree: `<html>` contains `<body>` contains `<div>`, each a node with a parent and children. "Live" is the key word — mutating a node updates what the user sees, and the tree reflects the current state, not the original source text. You inspect it live in DevTools' Elements panel, which shows the DOM (post-JS), not the raw HTML response.

**Say it:** "The DOM is the browser's live object-tree representation of the parsed document — my JS reads and writes that tree, and the Elements panel shows its current state, not the original HTML source."
**Red flag:** Saying "the DOM is the HTML." The HTML is the source text; the DOM is the parsed, live, JS-mutable tree that can differ from it completely.

### classList vs className
**They ask:** "How do you toggle a CSS class in JavaScript, and why prefer classList?"

Prefer `classList` because it edits classes surgically without clobbering the others — `className` is a single string, so any assignment replaces the whole attribute and silently drops classes another script or framework added. That's a common source of "my style disappeared" bugs.

`element.classList` exposes `add`, `remove`, `toggle`, `contains`, and `replace`, each operating on one token. `className` is the raw space-separated string — fine for reading or a full reset, dangerous for incremental changes. For one-off dynamic styles use `element.style.color = 'red'` (sets inline styles, highest specificity), but for anything reusable, toggle a class instead so the styling stays in CSS.

```js
el.classList.toggle('active');        // flips just this one class
el.classList.add('error', 'shake');   // adds without touching others
el.className = 'active';              // wipes every other class — careful
```

**Say it:** "I use classList.add/remove/toggle so I change one class without wiping the rest; I only assign className when I deliberately want to reset every class."
**Red flag:** Doing `el.className += ' active'` in a loop — it works until two code paths race and one overwrites the other. classList.add is idempotent and isolated.

### Finding elements
**They ask:** "What are the ways to get elements from the DOM?"

Pick your selector by intent: a stable single node by id, or a CSS-matched set. Getting this right avoids brittle traversal code that breaks when markup shifts.

The modern default is `querySelector` (first match) and `querySelectorAll` (all matches), both taking any CSS selector — `document.querySelector('.card > h2')`. The legacy family is `getElementById`, `getElementsByClassName`, and `getElementsByTagName`. Two practical differences: `querySelectorAll` returns a **static** NodeList (a snapshot), while `getElementsBy*` return **live** HTMLCollections that update as the DOM changes; and `getElementById` is marginally faster but only does ids.

```js
document.getElementById('nav');          // one id, fastest
document.querySelector('#nav .active');   // any CSS selector, first hit
document.querySelectorAll('li.done');     // static NodeList you can forEach
```

**Say it:** "I reach for querySelector/querySelectorAll because they take any CSS selector and return a predictable static list; getElementById is my pick when I have a stable id and want the fastest lookup."
**Red flag:** Iterating a live HTMLCollection while adding matching nodes — it grows under you and can loop forever. Snapshot it with querySelectorAll or `[...collection]` first.

### DOM event handling
**They ask:** "How do you attach and remove event handlers, and how do you stop an event?"

Use `addEventListener` because it stacks multiple handlers, supports options like `once` and `capture`, and can be cleanly removed — the old `onclick =` property allows only one handler and is easy to overwrite by accident.

To remove a listener you must pass the **same function reference** you added, so name your handler rather than passing an inline arrow. Basic event types: mouse (`click`, `mousedown`), keyboard (`keydown`, `keyup`), form (`submit`, `input`, `change`), and lifecycle (`load`, `DOMContentLoaded`). To stop default browser behavior call `event.preventDefault()` (e.g. block a form submit); to stop the event travelling further call `event.stopPropagation()`.

```js
function onClick(e) { e.preventDefault(); }
btn.addEventListener('click', onClick);
btn.removeEventListener('click', onClick); // same reference required
```

**Say it:** "I use addEventListener with a named handler so I can remove it later, and I separate preventDefault (cancel the browser's default) from stopPropagation (stop bubbling) — they solve different problems."
**Red flag:** Trying to `removeEventListener` an inline arrow function — it's a new reference each time, so the listener never detaches and you leak.

### Cookies
**They ask:** "What is a cookie and how do you set and read one?"

A cookie matters because it's the one storage that's automatically attached to every matching HTTP request — that's what makes it the classic server-session mechanism, and also why it's the wrong tool for bulk client data (it adds weight to every request).

A cookie is a small key=value string the browser stores per-domain and sends back in the `Cookie` header. From JS you read and write via `document.cookie`, which behaves oddly: reading returns all cookies as one `"a=1; b=2"` string, and writing one assignment sets or updates a single cookie without erasing the others.

```js
document.cookie = 'theme=dark; path=/; max-age=3600';
const raw = document.cookie; // "theme=dark; sessionId=abc"
```

**Say it:** "A cookie is a small per-domain string the browser auto-sends on every request — great for session identifiers, wrong for large data because it inflates every request."
**Red flag:** Treating `document.cookie` like a normal object you can overwrite wholesale. Writing sets one cookie at a time; reading gives you a string you must parse.

### Web Storage
**They ask:** "localStorage vs sessionStorage — when do you use each?"

Choose by lifetime, because that's the only real difference and picking wrong means data either vanishes too early or lingers too long. Both are synchronous key/value string stores scoped to an origin, and unlike cookies they're **not** sent to the server — pure client state.

`localStorage` persists until explicitly cleared, surviving tab and browser restarts, and is shared across all tabs of the origin. `sessionStorage` is scoped to a single tab and cleared when that tab closes. Use localStorage for durable preferences (theme, feature flags); use sessionStorage for per-tab, throwaway state like a multi-step form's progress that shouldn't leak into other tabs.

```js
localStorage.setItem('theme', 'dark');   // survives restart
sessionStorage.setItem('step', '2');     // dies with the tab
```

**Say it:** "Both are origin-scoped string stores that never hit the server; localStorage persists across restarts and tabs, sessionStorage is per-tab and dies when the tab closes."
**Red flag:** Storing auth tokens in localStorage without thinking about XSS — any injected script can read it. For sensitive session data an HttpOnly cookie is safer because JS can't touch it.

### HTML document structure
**They ask:** "Walk me through a basic HTML document and the block vs inline distinction."

A well-formed document matters because the browser's parser, accessibility tree, and SEO all key off structure — sloppy markup degrades all three silently. The skeleton is `<!DOCTYPE html>`, then `<html lang>`, a `<head>` (metadata, title, scripts, styles) and a `<body>` (visible content).

The core distinction is display flow. Block elements (`<div>`, `<p>`, `<h1>`, `<section>`) start on a new line and take full available width; inline elements (`<span>`, `<a>`, `<strong>`) sit within a line and take only their content's width. Links use `<a href>` with an optional `target="_blank"` to open a new tab — always pair that with `rel="noopener"` to stop the new page reaching back via `window.opener`. Tables use `<table>/<thead>/<tbody>/<tr>/<th>/<td>`; special characters use entities like `&amp;`, `&lt;`, `&nbsp;`.

**Say it:** "Block elements break onto a new line and fill the width; inline elements flow within a line — and any target=\"_blank\" link gets rel=\"noopener\" so the opened page can't hijack window.opener."
**Red flag:** Using `<div>`s for everything. Semantic tags (`<nav>`, `<header>`, `<button>`) give you accessibility and keyboard behavior for free — reinventing them with divs is more code and worse UX.

### CSS fundamentals
**They ask:** "How does selector specificity work, and how do you hide an element?"

Specificity decides which rule wins, and misjudging it is why people reach for `!important` and create unmaintainable stylesheets. Weight is counted as (inline, ids, classes/attributes/pseudo-classes, elements): an id beats any number of classes, a class beats any number of elements. Ties break on source order — last one wins.

For hiding, know the trade-off: `display: none` removes the element from layout entirely (no space, not focusable, hidden from most screen readers); `visibility: hidden` keeps its space but makes it invisible and non-interactive; `opacity: 0` keeps space *and* pointer events. Margin is space outside the border (collapses between siblings); padding is space inside, between border and content. `z-index` orders overlapping positioned elements, but only within the same stacking context.

**Say it:** "Specificity is inline > id > class > element, ties broken by order; and I pick display:none to remove from layout, visibility:hidden to keep the space, opacity:0 when I still want it to receive clicks."
**Red flag:** Reaching for `!important` to win a specificity fight. It just moves the war one level up. Fix the selector or the source order instead.

### DOM navigation
**They ask:** "How do you navigate between DOM nodes, and what's console.log vs console.dir?"

Knowing element-only vs any-node navigation avoids the classic bug where whitespace text nodes surprise your traversal. Every node exposes `parentNode`, `childNodes` (includes text/comment nodes), `firstChild`, `nextSibling` — the raw node view. Elements also expose element-only variants: `parentElement`, `children`, `firstElementChild`, `nextElementSibling`. Prefer the element variants unless you specifically need text nodes.

The DOM tree is created by the parser as it reads HTML top-to-bottom, which is why a script in `<head>` can't see body elements that haven't been parsed yet. `console.log` on a DOM node prints it as HTML-like markup you can expand; `console.dir` prints it as a JS object showing its properties (like `.className`, `.dataset`) — useful when you want the property view, not the rendered element.

```js
el.children[0];            // first child element, skips text nodes
el.childNodes[0];          // could be a whitespace text node
console.dir(el);           // property view instead of markup view
```

**Say it:** "I use the element-only navigation properties — children, nextElementSibling — so stray whitespace text nodes don't trip me up, and console.dir when I want a node's JS properties instead of its markup."
**Red flag:** Using `childNodes[0]` expecting the first element. Between tags there's usually a whitespace text node, so you get that instead.

### Element size and position
**They ask:** "Explain client* vs offset* vs scroll*, and how to get an element's rectangle."

These property families matter because measuring the wrong one gives you numbers that quietly exclude the scrollbar or the border, breaking your layout math. `offsetWidth/Height` is the full rendered box including borders and scrollbar; `clientWidth/Height` is the inner area including padding but excluding border and scrollbar; `scrollWidth/Height` is the full content size including the overflow you can't see.

For absolute on-screen geometry use `getBoundingClientRect()`, which returns `top/left/right/bottom/width/height` **relative to the viewport** — combine with `window.scrollY` for document-relative coordinates. `scrollTop/scrollLeft` tell you how far a scrollable element is scrolled.

```js
const r = el.getBoundingClientRect();  // viewport-relative
const pageTop = r.top + window.scrollY; // document-relative
```

**Say it:** "offset* includes border and scrollbar, client* is the padding box without them, scroll* is the full content including overflow — and getBoundingClientRect gives me viewport-relative coordinates for positioning."
**Red flag:** Using `offsetTop` for a fixed tooltip position. `offsetTop` is relative to the offset parent, not the viewport — getBoundingClientRect is what you want for on-screen placement.

### Computed styles
**They ask:** "How do you read the actual applied style of an element, and what is cssText?"

You need `getComputedStyle` because `element.style` only sees inline styles — it's blind to anything from a stylesheet or class, so reading `element.style.color` on a class-styled element returns empty. `getComputedStyle(el)` returns the final resolved values after the cascade, in absolute units (e.g. `color` as `rgb(...)`, sizes in `px`).

`style.cssText` is the write-side shortcut: it sets the entire inline `style` attribute in one assignment instead of property-by-property — handy for applying several inline styles at once, but it replaces any existing inline styles.

```js
getComputedStyle(el).fontSize;      // "16px" — resolved, read-only
el.style.cssText = 'color:red; margin:0'; // sets whole inline style at once
```

**Say it:** "element.style only reads inline styles, so to get what's actually rendered from a class or stylesheet I use getComputedStyle, which returns resolved absolute values."
**Red flag:** Debugging "why is my color empty?" by logging `el.style.color` when the color comes from CSS. That property is inline-only — getComputedStyle is the read path.

### getElement vs querySelector
**They ask:** "What's the real difference between getElementsBy* and querySelectorAll?"

The difference that bites is **live vs static** collections, because it changes how your loop behaves as the DOM mutates. `getElementsByClassName`/`getElementsByTagName` return **live** HTMLCollections that auto-update when matching nodes are added or removed. `querySelectorAll` returns a **static** NodeList — a snapshot frozen at query time.

`querySelector*` also accepts full CSS selectors (`.a > .b:first-child`), while `getElementById` takes only an id and `getElementsByClassName` only class names. NodeList has `forEach` built in; HTMLCollection doesn't, so you spread it. Live collections can be marginally faster for repeated re-checks but are a footgun in mutation loops.

```js
const live = document.getElementsByClassName('row'); // updates as DOM changes
const snap = document.querySelectorAll('.row');       // frozen snapshot
```

**Say it:** "querySelectorAll gives a static snapshot and takes any CSS selector; getElementsBy* return live collections that update as the DOM changes — which is a subtle bug source in loops."
**Red flag:** `for (let i=0; i<coll.length; i++)` deleting matching nodes from a live HTMLCollection — length shrinks under you and you skip elements. Snapshot with querySelectorAll first.

### Event propagation and delegation
**They ask:** "Explain bubbling, capturing, and event delegation."

Delegation matters because it lets one listener cover an entire dynamic list — fewer handlers, less memory, and it works for nodes added after you wired it up. It's built on propagation: an event travels down from the root to the target (**capturing** phase), then back up (**bubbling** phase). Handlers run in the bubbling phase by default; pass `{ capture: true }` to run during capture.

Delegation attaches one listener to a stable ancestor and inspects `event.target`, usually via `event.target.closest('.item')` to scope it. Form events like `submit`, `input`, and `change` also participate — `submit` bubbles from the form so you can delegate it too.

```js
list.addEventListener('click', (e) => {
  const item = e.target.closest('.item');
  if (item) select(item);   // one handler, works for future items
});
```

**Say it:** "Events capture down then bubble up; I delegate to a stable ancestor and match on event.target.closest, so one listener handles a whole list including dynamically-added rows."
**Red flag:** Binding a click handler to every row in a list that re-renders. New rows miss the handler and you leak old ones — delegate to the container instead.

### Cookie attributes
**They ask:** "How do you control a cookie's lifetime and security?"

Cookie attributes matter because they're your only defense against a cookie being stolen or sent over plaintext — the security lives entirely in the flags. Lifetime is set with `Max-Age` (seconds) or `Expires` (a date); omit both and it's a **session cookie** that dies when the browser closes.

For security: `Secure` restricts the cookie to HTTPS; `HttpOnly` hides it from JavaScript (`document.cookie` can't read it), which blocks XSS theft; `SameSite` (`Strict`/`Lax`/`None`) controls whether it's sent on cross-site requests, defending against CSRF. `HttpOnly` is server-set — you can't add it from client JS.

```
Set-Cookie: sid=abc; Max-Age=3600; Secure; HttpOnly; SameSite=Lax
```

**Say it:** "For a session cookie I set HttpOnly so JS can't read it, Secure so it's HTTPS-only, and SameSite=Lax to blunt CSRF — the security is in the flags, not the value."
**Red flag:** Storing a session token in a JS-readable cookie or localStorage. Without HttpOnly, one XSS payload exfiltrates it. Session identifiers belong in HttpOnly cookies.

### Storage events
**They ask:** "How do you set, read, and clear web storage, and how do tabs stay in sync?"

The cross-tab `storage` event is the senior detail here — it's how you keep multiple open tabs consistent without polling. The API itself is simple: `setItem(key, value)`, `getItem(key)`, `removeItem(key)`, and `clear()` — all string-only, so you `JSON.stringify` objects going in and `JSON.parse` coming out.

The `storage` event fires on **other** tabs of the same origin when a value changes — not on the tab that made the change. That asymmetry is deliberate: the writing tab already knows. Use it to broadcast logout or theme changes across tabs.

```js
localStorage.setItem('user', JSON.stringify(user));
window.addEventListener('storage', (e) => {
  if (e.key === 'user' && !e.newValue) logout(); // fired in OTHER tabs
});
```

**Say it:** "Storage is string-only so I JSON-serialize; and the storage event fires in other tabs, not the one that wrote — that's how I sync logout or theme across tabs."
**Red flag:** Expecting the `storage` event in the same tab that called setItem. It only fires elsewhere — for same-tab reactions you handle it inline after writing.

### IndexedDB basics
**They ask:** "What is IndexedDB and when would you use it over localStorage?"

IndexedDB matters because it's the browser's real database — asynchronous, transactional, and able to store structured objects and large blobs, where localStorage is a tiny synchronous string store that blocks the main thread. Reach for it for offline data, caches of API responses, or anything past a few megabytes.

You open a database (`indexedDB.open(name, version)`), create **object stores** (like tables) and indexes inside an `upgradeneeded` handler, then do reads/writes inside a **transaction** scoped to a mode (`readonly`/`readwrite`). Everything is event- or promise-based, so it never blocks rendering.

```js
const req = indexedDB.open('app', 1);
req.onupgradeneeded = (e) => e.target.result.createObjectStore('todos', { keyPath: 'id' });
req.onsuccess = (e) => {
  const tx = e.target.result.transaction('todos', 'readwrite');
  tx.objectStore('todos').put({ id: 1, text: 'buy milk' });
};
```

**Say it:** "IndexedDB is the browser's async, transactional, structured database — I use it for offline data and large caches where localStorage's synchronous string-only model would block the main thread."
**Red flag:** Using localStorage for megabytes of data or inside a hot loop. It's synchronous and blocks rendering; IndexedDB is the async, structured alternative.

### Minification
**They ask:** "What's the difference between minification and uglification?"

These matter because they're the cheapest bytes you'll ever save — pure transport-size wins with zero behavior change. **Minification** strips what the parser doesn't need: whitespace, comments, and newlines. **Uglification** (a term popularized by UglifyJS) goes further — it rewrites the code, shortening local variable and function names (`userName` → `a`), collapsing expressions, and dropping dead code, while preserving behavior.

In practice modern bundlers (esbuild, Terser, SWC) do both in one pass; "minify" now colloquially covers name-mangling too. The result is smaller downloads and faster parse time. It's separate from compression (gzip/Brotli), which happens at the transport layer on top.

**Say it:** "Minification removes whitespace and comments; uglification also mangles identifiers and drops dead code — both shrink the source, and gzip/Brotli then compress that on the wire."
**Red flag:** Confusing minification with compression. Minification rewrites the source; gzip/Brotli compress the bytes in transit. They stack — you do both.

### Browser caching
**They ask:** "How does browser caching work and how do you compress assets?"

Caching matters because the fastest request is the one never made — proper cache headers turn repeat visits into near-instant loads. The browser caches resources based on response headers: `Cache-Control` (`max-age`, `immutable`, `no-cache`) sets freshness, while `ETag`/`Last-Modified` enable revalidation — a `304 Not Modified` skips re-downloading unchanged bytes.

The standard pattern is **content-hashed filenames** (`app.9f3c.js`) served with a long `max-age` and `immutable`: the file never changes, so cache it forever; a new deploy produces a new hash and a fresh URL. For transport size, compress text assets with gzip or Brotli at the server/CDN. Images use modern formats (WebP/AVIF) and appropriate sizing.

**Say it:** "I hash filenames and serve them Cache-Control: immutable with a long max-age — the content can't change under a URL, so a new deploy is just a new hash and a guaranteed cache-bust."
**Red flag:** Setting a long max-age on an un-hashed `app.js`. Users get stale code after a deploy with no way to bust it. Hash the filename so the URL changes with the content.

### Web Workers intro
**They ask:** "What are Web Workers and why do we need them?"

Web Workers matter because JavaScript is single-threaded — one long computation freezes the entire UI, and a worker is how you keep the main thread responsive. A Web Worker runs a script on a **separate background thread**, so heavy work (parsing big JSON, image processing, crypto) doesn't block rendering or input handling.

Workers have no DOM access and don't share memory with the main thread; they communicate by message-passing (`postMessage`/`onmessage`), with data structured-cloned across the boundary (or transferred for `ArrayBuffer`s). That isolation is the point — no shared mutable state means no race conditions on the DOM.

```js
const w = new Worker('crunch.js');
w.postMessage(bigData);
w.onmessage = (e) => render(e.data); // result comes back off-thread
```

**Say it:** "JS is single-threaded, so any long computation freezes the UI — a Web Worker moves that work to a background thread that talks back via postMessage, keeping the main thread free for rendering and input."
**Red flag:** Saying a worker can update the DOM. It can't — no DOM access. It computes and posts a result back; the main thread does the DOM update.

### HTML media and forms
**They ask:** "How do HTML forms, media, SVG, and meta tags work together?"

These matter because they're the semantic and functional backbone the browser gives you for free — reinventing them in JS is more code and worse accessibility. Forms wrap inputs; the `name` attribute is the key sent on submit, input `type` (`email`, `date`, `number`) triggers native validation and mobile keyboards, and `<label for>` binds text to a control for accessibility and larger tap targets.

Media: `<img>` with `srcset` for responsive images, `<video>`/`<audio>` with `controls`. SVG is inline vector markup you can style and script with CSS/JS — sharp at any scale and often smaller than a PNG for icons. Meta tags in `<head>` configure the page: `<meta charset>`, `<meta name="viewport">` (mandatory for responsive/mobile), and `<meta name="description">` plus Open Graph tags for SEO and link previews.

**Say it:** "Native input types give me validation and the right mobile keyboard for free, SVG stays crisp at any scale and is scriptable, and the viewport meta tag is non-negotiable for responsive layout."
**Red flag:** Forgetting `<meta name="viewport">`. Without it mobile browsers render at desktop width and zoom out — your responsive CSS never engages.

### Flexbox and responsive
**They ask:** "How does Flexbox work and what makes a layout responsive?"

Flexbox matters because it solved one-dimensional layout — distributing space along a row or column — that used to need floats and clearfix hacks. You set `display: flex` on a container; `justify-content` aligns along the main axis, `align-items` along the cross axis, and `flex` on children controls grow/shrink/basis.

Responsive design means the layout adapts to viewport and capability, not fixed pixels: fluid units (`%`, `rem`, `fr`), `max-width` instead of `width`, and media queries (`@media (min-width: 768px)`) to reflow at breakpoints — mobile-first, adding complexity as space grows. Preprocessors like SASS/LESS add variables, nesting, and mixins that compile to plain CSS, reducing repetition; their advantage is authoring ergonomics, not runtime behavior. Pseudo-classes (`:hover`, `:nth-child`) target states; pseudo-elements (`::before`, `::after`) inject styleable content.

**Say it:** "Flexbox handles one-dimensional distribution along an axis; responsive means fluid units plus mobile-first media queries so the layout reflows by space available, not a fixed width."
**Red flag:** Building responsive layouts with fixed pixel widths and hiding overflow. Use fluid units and max-width so content adapts instead of clipping.

### Tree shaking
**They ask:** "What is tree shaking and how do you avoid shipping duplicate dependencies?"

Tree shaking matters because it deletes code your users download but never run — dead weight in every bundle. It's dead-code elimination at the module level: the bundler statically analyzes ES module `import`/`export` and drops exports nothing references. It only works with **static ES modules**, not CommonJS `require`, because static imports are analyzable at build time; side-effectful modules must be marked (`"sideEffects": false` in package.json) so the bundler knows it's safe to prune.

Dependency **duplication** happens when two packages depend on different versions of the same library and npm/pnpm installs both — inflating the bundle. You detect it with `npm ls <pkg>` or a bundle analyzer, and resolve it by aligning version ranges, deduping (`npm dedupe`), or peer-dependency hoisting.

**Say it:** "Tree shaking is module-level dead-code elimination — it only works on static ES imports, which is why I avoid CommonJS in shared libs and mark sideEffects:false so the bundler can prune safely."
**Red flag:** Expecting tree shaking to prune a CommonJS `require` or a `import * as _ from 'lodash'`. Import named members from ESM builds so the bundler can drop the rest.

### async vs defer
**They ask:** "Explain async vs defer on script tags, and what critical CSS is."

`async` and `defer` matter because a plain `<script>` blocks HTML parsing while it downloads and executes — the classic cause of a blank screen. Both attributes let the download happen in parallel with parsing; they differ in **when** the script runs. `defer` waits until parsing finishes and runs scripts **in order**, right before `DOMContentLoaded` — ideal for app code that needs the DOM. `async` runs each script the moment it downloads, **out of order** — fine for independent third-party scripts (analytics) that don't depend on the DOM or each other.

**Critical CSS** is the minimal styling needed to render above-the-fold content; you inline it in `<head>` so first paint isn't blocked waiting on an external stylesheet, then load the rest asynchronously. It attacks render-blocking CSS the way defer attacks render-blocking JS.

```html
<script src="app.js" defer></script>   <!-- ordered, after parse -->
<script src="analytics.js" async></script> <!-- whenever it lands -->
```

**Say it:** "defer downloads in parallel and runs in order after parsing — my pick for app code; async runs as soon as it lands, out of order — fine for independent third-party scripts."
**Red flag:** Putting `async` on scripts that depend on each other or on the DOM. Execution order isn't guaranteed — one may run before its dependency. Use defer for ordered, DOM-dependent code.

### Web Worker lifecycle
**They ask:** "Walk through creating, messaging, terminating, and error-handling a Web Worker."

Owning the full lifecycle matters because a worker you never terminate is a leaked thread, and unhandled worker errors fail silently. You create one with `new Worker('worker.js')`, communicate via `postMessage` on both sides and `onmessage` to receive, and shut it down with `worker.terminate()` from the main thread (or `close()` inside the worker) — always terminate when done to free the thread.

Errors: attach `worker.onerror` to catch uncaught exceptions in the worker (it gives you `message`, `filename`, `lineno`). Workers can spawn **subworkers** for further parallelism. Data crosses the boundary by structured clone; pass `[buffer]` as the transfer list to move an `ArrayBuffer` with zero copy.

```js
const w = new Worker('w.js');
w.postMessage(data);
w.onmessage = (e) => use(e.data);
w.onerror = (e) => report(e.message);
w.terminate(); // free the thread when finished
```

**Say it:** "I postMessage in, listen on onmessage, attach onerror so worker exceptions aren't silent, and always terminate when done so I'm not leaking a background thread."
**Red flag:** Spawning workers per task and never terminating them. Threads accumulate. Terminate on completion, or pool a fixed set of workers.

### Service Worker basics
**They ask:** "What is a Service Worker and what are the steps to use one?"

A Service Worker matters because it's a programmable network proxy sitting between your app and the network — it's what makes offline support, custom caching, and push notifications possible. It's a worker the browser runs in the background, decoupled from any page, that can intercept every `fetch` from your origin.

Setup requires **HTTPS** (or localhost) for security. The lifecycle: **register** it (`navigator.serviceWorker.register('/sw.js')`), the browser **installs** it (where you pre-cache assets in the `install` event), then it **activates** (where you clean up old caches), and thereafter it intercepts requests via the `fetch` event — you decide cache-first, network-first, etc. To remove stale caches, in `activate` you diff `caches.keys()` against your current cache name and delete the rest.

```js
self.addEventListener('activate', (e) => e.waitUntil(
  caches.keys().then(keys => Promise.all(
    keys.filter(k => k !== CACHE_V2).map(k => caches.delete(k))
  ))
));
```

**Say it:** "A Service Worker is a background network proxy for my origin — register, install (pre-cache), activate (purge old caches), then intercept fetch to serve cache-first or network-first; it needs HTTPS."
**Red flag:** Never cleaning old caches in `activate`. They accumulate across deploys and serve stale assets. Version the cache name and delete non-matching keys on activate.

### Web Components and Shadow DOM
**They ask:** "What are Web Components and what does Shadow DOM give you?"

Web Components matter because they're the platform's native answer to reusable, framework-agnostic UI — a custom element you can drop into React, Vue, or plain HTML alike. The set is: **Custom Elements** (`customElements.define('my-card', class extends HTMLElement {...})`), **Shadow DOM** for encapsulation, and **`<template>`** for inert reusable markup.

Shadow DOM is the key isolation primitive: `element.attachShadow({ mode: 'open' })` creates a scoped subtree whose styles and DOM don't leak out and aren't affected by the page's global CSS. That scoping is exactly what CSS lacks by default — a component's `p { color: red }` stays inside the component instead of restyling the whole page.

```js
class MyCard extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }); }
}
customElements.define('my-card', MyCard);
```

**Say it:** "Web Components are native reusable elements; Shadow DOM gives them true style and DOM encapsulation, so their internal CSS can't leak out and the page's global styles can't leak in."
**Red flag:** Claiming Shadow DOM is just for styling. It also scopes the DOM tree and event retargeting — it's genuine encapsulation, not a CSS trick.

### Writeable geometry properties
**They ask:** "Which element size/position properties can you write to, versus only read?"

This matters because assigning to a read-only geometry property fails silently — no error, no effect, and you waste time debugging. Most measurement properties are **read-only**: `offsetWidth/Height/Top/Left`, `clientWidth/Height`, `scrollWidth/Height`, and everything from `getBoundingClientRect()`. They report computed layout; you can't set layout by assigning to them.

The **writable** ones are the scroll offsets: `scrollTop` and `scrollLeft` — set them to programmatically scroll an element (`el.scrollTop = 0` jumps to top). For scrolling you also have methods like `scrollTo()`, `scrollBy()`, and `scrollIntoView()`. To change size or position you set **CSS** (`el.style.width`, `el.style.top` with positioning), not the geometry read-outs.

```js
el.scrollTop = 0;              // writable — scrolls to top
el.offsetWidth = 500;         // no-op — read-only, silently ignored
el.style.width = '500px';     // this is how you set size
```

**Say it:** "The offset*, client*, scroll*Width/Height and getBoundingClientRect values are all read-only measurements; only scrollTop and scrollLeft are writable — to change size or position I set CSS, not those read-outs."
**Red flag:** Assigning `el.offsetTop = 100` to move an element. It's read-only and silently ignored — set `el.style.top` with a positioning context instead.

### Custom events and load events
**They ask:** "How do you dispatch custom events, and what's the difference between the page-load events?"

Custom events matter because they let components communicate through the DOM's own bubbling system instead of tight coupling — a decoupled pub/sub you get for free. You create one with `new CustomEvent('thing', { detail: payload, bubbles: true })` and fire it with `element.dispatchEvent(...)`; listeners read `event.detail`. `bubbles: true` lets ancestors delegate to it.

The load events differ by what's ready: **`DOMContentLoaded`** fires when the HTML is parsed and the DOM is built — but before images/stylesheets finish — so it's the right hook for wiring up JS. **`load`** (on `window`) fires only after *all* resources including images and iframes have loaded. `beforeunload` fires as the user leaves.

```js
el.dispatchEvent(new CustomEvent('added', { detail: { id }, bubbles: true }));
document.addEventListener('DOMContentLoaded', init); // DOM ready, images maybe not
```

**Say it:** "CustomEvent with a detail payload lets components talk through DOM bubbling; and I hook DOMContentLoaded for DOM-ready JS, reserving window.load for when I truly need images and all resources in."
**Red flag:** Waiting for `window.load` to initialize the app. It blocks on every image — the UI sits dead meanwhile. Use DOMContentLoaded for anything that only needs the DOM.

### Cookie removal, GDPR, third-party
**They ask:** "How do you delete a cookie, and what are the size, GDPR, and third-party constraints?"

This matters because cookie handling is a legal surface now, not just a technical one — getting consent or third-party policy wrong is a compliance risk. You **delete** a cookie by re-setting it with an expiry in the past (`Max-Age=0` or `Expires` in the past), matching the same path and domain — there's no direct delete API.

Constraints: each cookie is capped around **4KB**, with a per-domain limit (~50 cookies) — another reason not to store data there. Under GDPR, non-essential cookies (analytics, ads) require explicit opt-in consent before you set them; strictly-necessary cookies are exempt. **Third-party cookies** — set by a domain other than the page's — power cross-site tracking and are being phased out by browsers; use first-party storage and server-side alternatives instead.

```js
document.cookie = 'theme=; Max-Age=0; path=/'; // delete via past expiry
```

**Say it:** "You delete a cookie by re-setting it with a past expiry on the same path and domain; and under GDPR non-essential cookies need explicit opt-in — third-party cookies are being deprecated, so I lean on first-party storage."
**Red flag:** Setting analytics cookies before consent, or trying to delete a cookie without matching its original path/domain — the re-set misses and the cookie survives.

### Storage size limits
**They ask:** "What are the storage limits for localStorage and sessionStorage?"

Knowing the ceiling matters because Web Storage throws a `QuotaExceededError` when you overflow it, and unhandled that can break your app on a full store. Both localStorage and sessionStorage are capped at roughly **5MB per origin** in most browsers (it's not formally standardized, so treat 5MB as the practical limit). The quota is per-origin and shared across the store.

Because it's synchronous and string-only, it's the wrong place for large or structured data — that's what IndexedDB (far larger, often disk-bound quotas) is for. Wrap writes in try/catch to handle quota errors gracefully, and store only small key/value config.

```js
try { localStorage.setItem('big', huge); }
catch (e) { if (e.name === 'QuotaExceededError') fallbackToIndexedDB(); }
```

**Say it:** "Web Storage is about 5MB per origin and synchronous, so I keep it for small config and move anything large or structured to IndexedDB, wrapping writes in try/catch for QuotaExceededError."
**Red flag:** Caching large API payloads in localStorage. You'll hit the ~5MB quota and throw — and every write blocks the main thread. IndexedDB is the right store.

### IndexedDB versioning and cursors
**They ask:** "How does IndexedDB versioning work and how do cursors help?"

Versioning matters because it's how you evolve a schema that already lives on users' machines — you can't just alter tables server-side. IndexedDB ties schema changes to the **version number** passed to `open(name, version)`. Bumping it fires `onupgradeneeded`, the **only** place you may create or delete object stores and indexes; you migrate old data there. The transaction in that handler is a special `versionchange` transaction.

**Cursors** matter for iterating large result sets without loading everything into memory. `store.openCursor()` (optionally over an index and a key range) yields records one at a time — you call `cursor.continue()` to advance. That's how you page, filter, or search large stores efficiently instead of pulling the whole store into an array.

```js
const req = store.openCursor(IDBKeyRange.bound('a', 'm'));
req.onsuccess = (e) => {
  const cur = e.target.result;
  if (cur) { visit(cur.value); cur.continue(); } // one record at a time
};
```

**Say it:** "Schema changes only happen in onupgradeneeded, gated by the version number — that's my migration hook — and cursors let me iterate large stores record-by-record instead of loading everything into memory."
**Red flag:** Trying to create an object store outside `onupgradeneeded`. It throws — store/index creation is only legal during a version upgrade.

### template, iframe, canvas
**They ask:** "What do the template, iframe, and canvas elements each do?"

These matter because each solves a distinct problem the others can't, and confusing them leads to the wrong tool. **`<template>`** holds inert, un-rendered markup — its content isn't parsed as active DOM (no image loads, no scripts run) until you clone it with `template.content.cloneNode(true)`. It's the efficient way to stamp out repeated structure client-side.

**`<iframe>`** embeds a separate, isolated browsing context — its own document, its own origin — used for sandboxing third-party content (ads, embeds, payment widgets); `sandbox` and `allow` attributes tighten its permissions. **`<canvas>`** is a scriptable bitmap surface you draw on imperatively via `getContext('2d')` or WebGL — for charts, games, image manipulation. Canvas is pixels (no DOM per shape), which is why it scales to thousands of draws where SVG's per-node DOM would choke.

**Say it:** "template is inert clonable markup, iframe is an isolated browsing context for sandboxing third-party content, and canvas is a scriptable pixel surface — I pick canvas over SVG when I'm drawing thousands of shapes."
**Red flag:** Reaching for innerHTML string-building to repeat rows when `<template>` + cloneNode is cleaner and doesn't re-parse HTML each time. And embedding untrusted content without the iframe `sandbox` attribute.

### Grid, animations, vendor prefixes
**They ask:** "When do you use Grid over Flexbox, and how do transitions differ from keyframe animations?"

Choosing the right layout tool matters because forcing one to do the other's job produces fragile CSS. **Grid** is two-dimensional — rows *and* columns at once — so it's for page-level and complex layouts; **Flexbox** is one-dimensional, for distributing items along a single axis. They compose: Grid for the overall structure, Flex inside a cell.

Animation: **`transition`** interpolates between two states triggered by a change (hover, class toggle) — simple A-to-B. **`@keyframes`** + `animation` define multi-step sequences that can loop and run without a trigger — more control for complex motion. **Vendor-prefixed** properties (`-webkit-`, `-moz-`) were how experimental features shipped before standardization; today you let Autoprefixer add them from browser-support data rather than hand-writing them.

**Say it:** "Grid is two-dimensional for overall layout, Flexbox one-dimensional for a single axis — I nest them; and transitions handle simple state-change tweens while keyframes drive multi-step or looping animation."
**Red flag:** Hand-writing `-webkit-` prefixes in 2020s CSS. Autoprefixer manages them from real browser-support data — manual prefixes rot and bloat the stylesheet.

### Gzip vs Brotli
**They ask:** "Gzip vs Brotli, and static vs dynamic compression — when does each apply?"

This matters because compression is a large, cheap transfer-size win, and the static/dynamic choice trades CPU for ratio. **Brotli** generally achieves better compression ratios than gzip on text (HTML/CSS/JS), especially at high quality levels, thanks to a built-in dictionary and better modeling; gzip is universally supported and faster to compress. Browsers advertise support via `Accept-Encoding` and the server picks via `Content-Encoding`.

**Static** compression pre-compresses assets at build/deploy time and serves the stored `.br`/`.gz` file — you can afford Brotli's slowest, highest-ratio level because it's paid once. **Dynamic** compression compresses on each response (for generated HTML/API output) at request time, so you use a lower, faster level to avoid CPU cost per request. Rule of thumb: static-highest for build artifacts, dynamic-moderate for dynamic responses.

**Say it:** "Brotli beats gzip on text ratio but costs more CPU — so I pre-compress static assets at max Brotli level once at build, and use a lower, faster level for dynamically-generated responses."
**Red flag:** Running max-level Brotli dynamically on every API response. The per-request CPU cost can outweigh the bytes saved — reserve the slow levels for static, build-time compression.

### Lazy loading code chunks
**They ask:** "How do you lazy-load code chunks and why?"

Lazy loading matters because it cuts the initial bundle to only what the first screen needs — everything else downloads on demand, so time-to-interactive drops. The mechanism is the **dynamic `import()`**, which returns a promise and tells the bundler to emit that module as a separate chunk fetched at runtime.

The common trigger is route-based splitting: load a route's code when the user navigates to it (in React, `React.lazy(() => import('./Page'))` with `<Suspense>` for the fallback). You can also split on interaction — load a heavy modal or editor only when opened. Combine with `<link rel="prefetch">` or webpack magic comments to warm the chunk during idle time, so the eventual load feels instant.

```js
const Editor = React.lazy(() => import('./Editor')); // its own chunk
// <Suspense fallback={<Spinner/>}><Editor/></Suspense>
```

**Say it:** "I split with dynamic import() so each route or heavy feature is its own chunk loaded on demand, shrinking the initial bundle — and prefetch the likely-next chunk during idle so the load feels instant."
**Red flag:** Lazy-loading everything, including tiny components above the fold. Each split adds a request and a loading state — split at route and heavy-feature boundaries, not every component.

### Shared workers and CSP
**They ask:** "What are shared workers and embedded workers, and how does CSP affect workers?"

Sharing one worker across tabs matters because it avoids spinning up a duplicate background thread and connection per tab — one worker, shared state. A **SharedWorker** is reachable from multiple browsing contexts (tabs/iframes) of the same origin; they connect through a `port` (`worker.port.postMessage`), so a single worker can coordinate all tabs — one WebSocket, shared cache. A dedicated Worker, by contrast, belongs to the single page that created it.

An **embedded (inline) worker** is created from a script string via a Blob URL instead of a separate file — handy for bundling a small worker inline. **Content Security Policy** governs both: the `worker-src` (falling back to `child-src`/`script-src`) directive controls where worker scripts may load from, and a strict CSP can block `blob:` URLs — which breaks inline workers unless you allow `blob:` in `worker-src`.

**Say it:** "A SharedWorker is one worker shared across all tabs of an origin via ports — great for a single shared connection; and CSP's worker-src controls worker sources, so a strict policy can block the blob: URLs that inline workers rely on."
**Red flag:** Assuming an inline (Blob) worker just works under any CSP. If `worker-src` doesn't allow `blob:`, it's blocked — you either allow it or ship the worker as a real file.

### Service Workers vs AppCache
**They ask:** "How do Service Workers compare to AppCache, and how do you version them?"

This matters because AppCache was deprecated precisely for the failures Service Workers fix — leading with that shows you know the history, not just the API. **AppCache** used a declarative manifest that was rigid, notoriously buggy (stale-forever caches, all-or-nothing updates, confusing fallback rules) and is now removed from browsers. **Service Workers** replaced it with an imperative, programmable `fetch`-interception model: you write the exact caching strategy (cache-first, network-first, stale-while-revalidate) per request.

For structured offline data, pair the Service Worker with **IndexedDB** as the storage layer — the SW intercepts requests and reads/writes IndexedDB, since it can't touch localStorage (localStorage is synchronous and unavailable in workers). **Versioning** a Service Worker: name your cache with a version (`cache-v3`), pre-cache in `install`, and delete non-matching cache names in `activate` so a new SW cleanly retires the old assets. The browser byte-compares `sw.js` on each load to detect updates.

**Say it:** "Service Workers replaced AppCache's rigid, buggy declarative manifest with programmable fetch interception; I version the cache name, pre-cache on install, purge old caches on activate, and use IndexedDB for structured offline data since workers can't use localStorage."
**Red flag:** Proposing AppCache for offline support — it's removed from browsers. And forgetting to bump the cache name on deploy, so users are stuck on stale cached assets with no clean upgrade path.
