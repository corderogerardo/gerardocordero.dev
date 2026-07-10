# Senior React Native — Study Guide

Senior-depth answers to **every row of a senior React Native knowledge matrix** —
all six skill categories, 91 skills total:

| Category | Skills | File |
|---|---|---|
| React Native | 38 (12 themes) | [01-react-native.md](01-react-native.md) |
| React | 12 | [02-react.md](02-react.md) |
| JavaScript (ES6+ / ES5) | 8 + 12 | [03-javascript.md](03-javascript.md) |
| Software Engineering Practices | 16 | [04-engineering-practices.md](04-engineering-practices.md) |
| Software Development Processes | 5 | [05-dev-processes.md](05-dev-processes.md) |

## How the matrix works

- **Levels are cumulative.** This guide only covers what is *new* at the senior tier.
  The interviewer assumes every level below it as well — worth a skim of mid-level
  material once this guide feels solid.
- **All six categories are fair game.** The assessment draws from the whole matrix,
  not just the React Native tab.
- **The matrix is a few years old in places.** Rows name Flipper, the standalone React
  Native Debugger, `expo eject`, CodePush-era OTA. Every answer here covers the classic
  concept *and* the current state (React Native DevTools, `expo prebuild`/CNG, EAS
  Update) — showing you know both is a seniority signal, not a digression.

## How to study

Each entry is: **They ask** (the question as the interviewer phrases it) → a senior
answer (why first, then mechanics, then trade-offs) → **Say it** (one line to deliver
verbatim) → **Red flag** (the common answer that hurts you). Read a session's entries,
then drill them from [flashcards.md](flashcards.md) *out loud, in English* — recognition
is not recall.

## 10-session schedule

| # | Scope | Entries |
|---|---|---|
| 1 | Environment and Expo (Xcode/AS, workflows, CLI, OTA, Metro) | 6 |
| 2 | Animation + Routing + Timers | 7 |
| 3 | Publishing and Distribution + Push Notifications + Permissions | 8 |
| 4 | Storages + Layout + TLS Pinning | 8 |
| 5 | Native Modules (Hermes, JSI, Fabric, Headless JS) + Debugging | 9 |
| 6 | React (Fiber, batching, lifecycle, Redux, hooks) | 12 |
| 7 | JS (ES6+) | 8 |
| 8 | JS (ES5) | 12 |
| 9 | Software Engineering Practices | 16 |
| 10 | Software Development Processes + full flashcard sweep | 5 + review |

## Checklist

### React Native

**Environment and Expo**

- [ ] [Xcode & Android Studio](01-react-native.md#xcode--android-studio)
- [ ] [Bare workflow (Expo)](01-react-native.md#bare-workflow-expo)
- [ ] [Managed workflow (Expo)](01-react-native.md#managed-workflow-expo)
- [ ] [CLI](01-react-native.md#cli)
- [ ] [OTA updates](01-react-native.md#ota-updates)
- [ ] [Metro bundler](01-react-native.md#metro-bundler)

**Animation**

- [ ] [React Native Animated](01-react-native.md#react-native-animated)
- [ ] [React Native Reanimated](01-react-native.md#react-native-reanimated)
- [ ] [Gesture Responder System](01-react-native.md#gesture-responder-system)

**Routing**

- [ ] [React Navigation](01-react-native.md#react-navigation)
- [ ] [React Native Navigation](01-react-native.md#react-native-navigation)

**Publishing and Distribution**

- [ ] [Provisioning profile](01-react-native.md#provisioning-profile)
- [ ] [Distribution certificate](01-react-native.md#distribution-certificate)
- [ ] [App validation](01-react-native.md#app-validation)
- [ ] [App Store distribution](01-react-native.md#app-store-distribution)
- [ ] [Google Play distribution](01-react-native.md#google-play-distribution)

**Push Notifications**

- [ ] [APNs certificates](01-react-native.md#apns-certificates)
- [ ] [Device token](01-react-native.md#device-token)

**Storages**

- [ ] [Async Storage](01-react-native.md#async-storage)
- [ ] [Secure Storage](01-react-native.md#secure-storage)

**Layout**

- [ ] [Flex](01-react-native.md#flex)
- [ ] [Styled components](01-react-native.md#styled-components)
- [ ] [onLayout](01-react-native.md#onlayout)
- [ ] [Lists](01-react-native.md#lists)
- [ ] [SafeAreaView](01-react-native.md#safeareaview)

**Native Modules**

- [ ] [Communication between native and RN](01-react-native.md#communication-between-native-and-rn)
- [ ] [Native UI components](01-react-native.md#native-ui-components)
- [ ] [Hermes](01-react-native.md#hermes)
- [ ] [Headless JS](01-react-native.md#headless-js)
- [ ] [Fabric](01-react-native.md#fabric)
- [ ] [JSI](01-react-native.md#jsi)

**Debugging**

- [ ] [React Native Debugger](01-react-native.md#react-native-debugger)
- [ ] [Flipper](01-react-native.md#flipper)
- [ ] [Logcat](01-react-native.md#logcat)

**Timers**

- [ ] [requestAnimationFrame](01-react-native.md#requestanimationframe)
- [ ] [InteractionManager](01-react-native.md#interactionmanager)

**Permissions**

- [ ] [App Permissions](01-react-native.md#app-permissions)

**Network**

- [ ] [TLS Pinning](01-react-native.md#tls-pinning)


### React

**Reconciliation**

- [ ] [Fiber](02-react.md#fiber)
- [ ] [Jobs](02-react.md#jobs)

**Components**

- [ ] [State](02-react.md#state)
- [ ] [Lifecycle methods](02-react.md#lifecycle-methods)
- [ ] [PureComponent and memo](02-react.md#purecomponent-and-memo)
- [ ] [Refs](02-react.md#refs)
- [ ] [Context](02-react.md#context)

**Redux**

- [ ] [Reducers](02-react.md#reducers)
- [ ] [Middlewares](02-react.md#middlewares)
- [ ] [Selectors](02-react.md#selectors)

**Hooks**

- [ ] [Why hooks](02-react.md#why-hooks)
- [ ] [useState, useReducer, useContext](02-react.md#usestate-usereducer-usecontext)


### JavaScript

**JS (ES6+)**

- [ ] [WeakMap, WeakSet, Proxy and tagged templates](03-javascript.md#weakmap-weakset-proxy-and-tagged-templates)
- [ ] [BigInt](03-javascript.md#bigint)
- [ ] [Modules](03-javascript.md#modules)
- [ ] [Classes](03-javascript.md#classes)
- [ ] [Promise](03-javascript.md#promise)
- [ ] [Async await](03-javascript.md#async-await)
- [ ] [Generators and iterators](03-javascript.md#generators-and-iterators)
- [ ] [Fetch](03-javascript.md#fetch)

**JS (ES5)**

- [ ] [eval is evil](03-javascript.md#eval-is-evil)
- [ ] [Deep copy and object structures](03-javascript.md#deep-copy-and-object-structures)
- [ ] [Garbage collector](03-javascript.md#garbage-collector)
- [ ] [Date and time](03-javascript.md#date-and-time)
- [ ] [JSON](03-javascript.md#json)
- [ ] [Functions](03-javascript.md#functions)
- [ ] [Execution context](03-javascript.md#execution-context)
- [ ] [Prototypes and inheritance](03-javascript.md#prototypes-and-inheritance)
- [ ] [Error handling](03-javascript.md#error-handling)
- [ ] [Event loop](03-javascript.md#event-loop)
- [ ] [Scheduling](03-javascript.md#scheduling)
- [ ] [Regular expressions](03-javascript.md#regular-expressions)


### Software Engineering Practices

**Architecture and Craft**

- [ ] [Architecture and Design](04-engineering-practices.md#architecture-and-design)
- [ ] [OOP](04-engineering-practices.md#oop)
- [ ] [Functional programming](04-engineering-practices.md#functional-programming)
- [ ] [Reactive programming](04-engineering-practices.md#reactive-programming)
- [ ] [Algorithms and data structures](04-engineering-practices.md#algorithms-and-data-structures)

**Delivery and Operations**

- [ ] [Builds and CI CD](04-engineering-practices.md#builds-and-ci-cd)
- [ ] [Troubleshooting, Logging and Monitoring](04-engineering-practices.md#troubleshooting-logging-and-monitoring)

**Network**

- [ ] [REST](04-engineering-practices.md#rest)
- [ ] [AJAX](04-engineering-practices.md#ajax)
- [ ] [CORS](04-engineering-practices.md#cors)
- [ ] [Web Socket](04-engineering-practices.md#web-socket)
- [ ] [Server Sent Events](04-engineering-practices.md#server-sent-events)

**Quality and Security**

- [ ] [Security and Cryptography](04-engineering-practices.md#security-and-cryptography)
- [ ] [Refactoring](04-engineering-practices.md#refactoring)
- [ ] [Testing processes](04-engineering-practices.md#testing-processes)
- [ ] [Code review and code standards](04-engineering-practices.md#code-review-and-code-standards)


### Software Development Processes

**Processes**

- [ ] [Process Planning (SDLC)](05-dev-processes.md#process-planning-sdlc)
- [ ] [Bug tracking systems](05-dev-processes.md#bug-tracking-systems)
- [ ] [Version Control System (Git)](05-dev-processes.md#version-control-system-git)
- [ ] [Estimations](05-dev-processes.md#estimations)
- [ ] [Development methodologies](05-dev-processes.md#development-methodologies)

