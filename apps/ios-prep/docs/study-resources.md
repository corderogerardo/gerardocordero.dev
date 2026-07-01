# Study content sources

External reference repos used as source material when authoring new
flashcards, quiz questions, and study-guide sections for this app. These are
curated *inspiration and fact-checking references* — content here is
original, hand-written prose/code in `src/data/`, not copied from these
repos.

| Repo | What it is | Informed |
|---|---|---|
| [vsouza/awesome-ios](https://github.com/vsouza/awesome-ios) | Curated list of iOS libraries, tools, and learning resources. | The "evaluating & choosing third-party libraries" and curated-resources framing in `advanced34.ts`. |
| [eleev/ios-learning-materials](https://github.com/eleev/ios-learning-materials) | Large collection of advanced Swift/SwiftUI/architecture/algorithms learning materials. | Cross-checking depth/coverage of Swift language and architecture topics already in `study.ts` / `advanced*.ts`. |
| [ochococo/Design-Patterns-In-Swift](https://github.com/ochococo/Design-Patterns-In-Swift) | The Gang-of-Four design patterns implemented in Swift (creational, structural, behavioral). | The new "Design patterns in Swift" study section and flashcards/quiz in `advanced34.ts` (`dp*` ids). |
| [dkhamsing/open-source-ios-apps](https://github.com/dkhamsing/open-source-ios-apps) | Directory of real, open-source iOS apps with links to their source. | The "learning from open-source apps" study section — how to read a real codebase for architecture decisions. |
| [nalexn/clean-architecture-swiftui](https://github.com/nalexn/clean-architecture-swiftui) | Reference implementation of Clean Architecture + SwiftUI + Combine (`AppState`, `DIContainer`, `Interactor`s). | The new "Clean Architecture with SwiftUI" study section and flashcards/quiz (`ca*` ids) in `advanced34.ts`. |

## Adding more

Drop new source repos in the table above with a one-line description and
which file/section they informed, then author the content per the
"Study engine" / data-file conventions in the root `CLAUDE.md`.
