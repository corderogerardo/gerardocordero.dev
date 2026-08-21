# Delta for i18n nav Keys

## ADDED Requirements

### Requirement: Seven new nav.* i18n keys must be present in both en.json and es.json

The locale files must contain exactly seven new `nav.*` i18n keys, present in both `en.json` and `es.json` with parallel key sets and appropriately translated values. These keys power the header nav labels and must be used via `useI18n().t('nav.*')` in `site-header.tsx`.

The system **MUST** add the following keys to `apps/learn/src/locales/en.json`:
- `nav.home`: "Home"
- `nav.courses`: "Courses"
- `nav.practice`: "Practice"
- `nav.flashcards`: "Flashcards"
- `nav.challenges`: "Challenges"
- `nav.open_menu`: "Menu"
- `nav.close_menu`: "Close"

The system **MUST** add the following keys to `apps/learn/src/locales/es.json`, with Spanish translations:
- `nav.home`: "Academy"
- `nav.courses`: "Cursos"
- `nav.practice`: "Práctica"
- `nav.flashcards`: "Flashcards" (kept as-is, commonly used in both languages)
- `nav.challenges`: "Retos"
- `nav.open_menu`: "Menú abierto"
- `nav.close_menu`: "Menú cerrado"

The system **MUST** ensure that the key sets in `en.json` and `es.json` are parallel (same seven keys present in both) with culturally appropriate translations for each locale.

#### Scenario: en.json has all seven nav keys

- GIVEN: `en.json` is loaded
- WHEN: The object is inspected for `nav.*` keys
- THEN: All seven keys (`nav.home` through `nav.close_menu`) exist as own properties
- AND: Each value is a plain string (not nested, not an object)

#### Scenario: es.json has all seven nav keys parallel to en.json

- GIVEN: `es.json` is loaded
- WHEN: The object is inspected for `nav.*` keys
- THEN: All seven keys exist as own properties with the same names as in `en.json`
- AND: Values are Spanish translations appropriate for a Spanish-language interface

#### Scenario: site-header.tsx uses nav keys via useI18n

- GIVEN: `site-header.tsx` is rendered with a locale set
- WHEN: The nav items display
- THEN: Each `<span>` or button label is sourced from `useI18n().t('nav.courses')` etc., not from hardcoded English strings
- AND: The `nav.home`, `nav.courses`, `nav.practice`, `nav.flashcards`, `nav.challenges`, `nav.open_menu`, `nav.close_menu` keys are the only source of nav label text

## MODIFIED Requirements

### Requirement: site-header.tsx nav labels must use useI18n().t('nav.*') instead of hardcoded strings

The `site-header.tsx` component must replace all hardcoded English nav labels with `useI18n().t('nav.*')` lookups. The `navItems` array must use label keys instead of literal strings.

(Previously: The `navItems` array in `site-header.tsx` had hardcoded English labels: `{ label: 'Home', icon: Brain }, { label: 'Courses', icon: BookOpen }, { label: 'Practice', icon: Code2 }`. These were not internationalized and would not adapt to the user's locale.)

The system **MUST** replace the hardcoded `label` values in the `navItems` array with `useI18n().t('nav.home')`, `useI18n().t('nav.courses')`, and `useI18n().t('nav.practice')`. The `reactNativeItems` must similarly use `nav.flashcards` and `nav.challenges`. The `isActive` function and all other nav logic remains unchanged.

#### Scenario: English locale renders nav labels from i18n keys

- GIVEN: Locale is `en`, `site-header.tsx` is rendered
- WHEN: The nav items are inspected
- THEN: "Home" appears (from `nav.home`), "Courses" appears (from `nav.courses`), "Practice" appears (from `nav.practice`)
- AND: No hardcoded English strings "Home", "Courses", "Practice" appear in the nav markup

#### Scenario: Spanish locale renders nav labels from i18n keys

- GIVEN: Locale is `es`, `site-header.tsx` is rendered
- WHEN: The nav items are inspected
- THEN: "Academy" appears (from `nav.home`), "Cursos" appears (from `nav.courses`), "Práctica" appears (from `nav.practice`)
- AND: The i18n lookup is the sole source of nav label text