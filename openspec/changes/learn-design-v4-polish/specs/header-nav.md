# Delta for Header Nav Fix

## MODIFIED Requirements

### Requirement: "Courses" nav item must point to `/#courses` with localized labels

The header navigation "Courses" item must have its `href` changed from `/en/learn/ios` to `/#courses`. The nav labels must be driven by localized `nav.*` i18n keys present in both `en.json` and `es.json`. The anchor link must never trigger an `isActive` state (accepted behavior — index anchors do not have a meaningful "active" condition). Keyboard focus rings must be preserved on all nav items.

(Previously: The "Courses" nav item in `site-header.tsx` had `href: '/en/learn/ios'`, a hardcoded English target that navigated to a specific iOS course page. Nav labels were hardcoded English strings (`'Home'`, `'Courses'`, `'Practice'`) without i18n support. The `isActive` check could potentially match the anchor link, causing an active state on a non-page anchor.)

The system **MUST** change the "Courses" nav item `href` from `/en/learn/ios` to `/#courses`. The system **MUST** replace all hardcoded nav labels with `useI18n().t('nav.*')` lookups using new i18n keys. The system **MUST** add the following `nav.*` keys to both `en.json` and `es.json`: `nav.home`, `nav.courses`, `nav.practice`, `nav.flashcards`, `nav.challenges`, `nav.open_menu`, `nav.close_menu`. The `isActive` function **MUST** not match the `/#courses` anchor link (accepted: anchor links to page sections do not have a meaningful active state). Keyboard focus rings (`focus-visible:ring-primary`) **MUST** be preserved on all nav items.

#### Scenario: Courses href navigation

- GIVEN: User is on any learn route and clicks the "Courses" nav item
- WHEN: The nav item is activated
- THEN: The browser navigates to `/#courses` (not `/en/learn/ios`)
- AND: The URL hash `courses` targets the HomePageClient courses section `id="courses"`

#### Scenario: Localized nav labels in English

- GIVEN: User locale is `en`
- WHEN: The header nav renders
- THEN: `nav.home` resolves to "Home", `nav.courses` resolves to "Courses", `nav.practice` resolves to "Practice"
- AND: All other `nav.*` keys (`nav.flashcards`, `nav.challenges`, `nav.open_menu`, `nav.close_menu`) resolve to their English strings

#### Scenario: Localized nav labels in Spanish

- GIVEN: User locale is `es`
- WHEN: The header nav renders
- THEN: `nav.home` resolves to "Academy", `nav.courses` resolves to "Cursos", `nav.practice` resolves to "Practice"
- AND: `nav.flashcards` resolves to "Flashcards", `nav.challenges` resolves to "Retos"
- AND: `nav.open_menu` resolves to "Menú abierto", `nav.close_menu` resolves to "Menú cerrado"

#### Scenario: Anchor link never shows active state

- GIVEN: User is on the home page and the nav shows "Courses" → `/#courses`
- WHEN: The navigation item is inspected for `isActive` styling
- THEN: The `/#courses` anchor link does NOT receive the `bg-primary text-primary-foreground` active state class
- AND: The item displays in its default/hover state only (accepted behavior for section anchors)

## ADDED Requirements

### Requirement: HomePageClient courses section must have id="courses" and scroll-mt

The HomePageClient component's courses section must render with `id="courses"` and a top margin offset (`scroll-mt-*`) to account for the sticky header height when navigating via the `/#courses` anchor.

The system **MUST** add `id="courses"` to the courses section element in `HomePageClient.tsx`. The system **MUST** add a `scroll-mt-*` utility class (e.g., `scroll-mt-20` or `scroll-mt-16`) to provide adequate top-margin offset so that the courses section content is not hidden behind the sticky header.

#### Scenario: Anchor link targets courses section

- GIVEN: User clicks "Courses" nav item, browser navigates to `/#courses`
- WHEN: The page scrolls to the courses section
- THEN: The viewport positions the courses section below the sticky header with adequate margin
- AND: The section element has `id="courses"` attribute
- AND: The section includes `scroll-mt-20` (or equivalent) to offset from header