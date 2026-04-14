// Hermes on React Native 0.81 (Expo SDK 54) does not expose
// SharedArrayBuffer as a global. `webidl-conversions` — pulled in
// transitively via whatwg-url from `expo/src/winter/*` — reads
// SharedArrayBuffer.prototype.byteLength at module top level, which
// throws ReferenceError on Hermes and prevents AppRegistry from ever
// registering the root component.
//
// This file is injected via `metro.config.js` -> `serializer.getPolyfills`
// so it runs in the bundle prelude, before React Native's InitializeCore
// and before any `__r(...)` call in the bundle. Aliasing SharedArrayBuffer
// to ArrayBuffer lets the affected modules load; we don't rely on real
// shared-memory semantics anywhere in this app.
if (typeof globalThis.SharedArrayBuffer === "undefined") {
  globalThis.SharedArrayBuffer = ArrayBuffer;
}
