# TestID Contract Compliance Audit - Portfolio App

**Audit Scope**: All `.tsx`, `.ts`, `.js` files in `apps/portfolio/src/` (excluding `__tests__/`, `jest-setup.ts`, `node_modules`)

**Contract Requirements**:
- Tab buttons: `tab-<route>` (e.g., `tab-home`, `tab-study`, `tab-profile`)
- Screen roots: `screen-<name>` (each tab screen's root ScrollView)
- Used by both Jest RNTL tests and Maestro e2e flows (.maestro/smoke.yml, walk-tabs.yml, study.yml)

---

## ✅ COMPLIANT: Uses `tab-<route>` or `screen-<name>` pattern

### Tab Buttons - `_layout.tsx` (line 70)

| testID | route.name | Status |
|--------|-----------|--------|
| `tab-index` | index | ✅ Compliant |
| `tab-study` | study | ✅ Compliant |
| `tab-ask` | ask | ✅ Compliant |
| `tab-experience` | experience | ✅ Compliant |
| `tab-projects` | projects | ✅ Compliant |
| `tab-education` | education | ✅ Compliant |
| `tab-contact` | contact | ✅ Compliant |

**File**: `apps/portfolio/app/(tabs)/_layout.tsx:70`  
**Pattern**: `testID={`tab-${route.name}`}` — Matches `tab-<route>` contract exactly.

### Tab Screens - Root ScrollView testIDs

| File | testID | Screen Name | Status |
|------|--------|-------------|--------|
| `ask.tsx:71` | `screen-ask` | Ask | ✅ Compliant |
| `education.tsx:493` | `screen-education` | Education | ✅ Compliant |
| `index.tsx:208` | `screen-status` | Status (Home) | ✅ Compliant |
| `experience.tsx:287` | `screen-experience` | Experience | ✅ Compliant |
| `projects.tsx:325` | `screen-projects` | Projects | ✅ Compliant |
| `contact.tsx:285` | `screen-contact` | Contact | ✅ Compliant |
| `study.tsx:145` | `screen-study` | Study | ✅ Compliant |

**All 7 tab screens** have `testID="screen-<name>"` on their root `ScrollView`, matching the `screen-<name>` contract exactly.

---

## ⚠️ PARTIALLY COMPLIANT: Uses testID but non-standard pattern

These testIDs are present but do not follow the `tab-<route>` or `screen-<name>` contract pattern. They are internal element testIDs within screens.

### Study Screen Internal Elements - `study.tsx`

| Line | testID | Element | Pattern |
|------|--------|---------|---------|
| 175 | `study-subject-${s.id}` | Subject picker button | ⚠️ Non-standard: `study-subject-N` |
| 249 | `study-cat-${c.value}` | Category filter button | ⚠️ Non-standard: `study-cat-label` |
| 283 | `flashcard` | Flashcard pressable | ⚠️ Non-standard: `flashcard` |
| 338 | `grade-${g.value}` | Grade buttons (Again/Hard/Good/Easy) | ⚠️ Non-standard: `grade-again` etc. |
| 409 | `study-ahead` | Study ahead button | ⚠️ Non-standard: `study-ahead` |

### Other Screens - Internal/Form Elements

| File | Line | testID | Element | Pattern |
|------|------|--------|---------|---------|
| `ask.tsx:110` | `ask-input` | Text input field | ⚠️ Non-standard: form element ID |
| (various) | - | - | - | - |

**Note**: These internal testIDs are used for RNTL unit testing within the study screen and do not affect the root-level contract compliance. They are valid testIDs but use project-specific naming conventions.

---

## ❌ NON-COMPLIANT: No testID or different naming

**Zero (0) findings** of completely missing testIDs on root elements or non-matching naming patterns.

All 7 tab screen roots have `screen-<name>` and all 7 tab bar buttons have `tab-<route>`.

**Top 10 Most Common Non‑Compliant Patterns** (ranked by frequency):

Since no root-level non-compliance exists, the "non-compliant" category consists of internal element testIDs with project‑specific patterns. The top 5 most common non‑standard patterns observed:

1. **`study-subject-${id}`** — 1 occurrence (subject picker buttons in Study screen)
2. **`study-cat-${value}`** — 1 occurrence (category filter buttons in Study screen)
3. **`flashcard`** — 1 occurrence (flashcard pressable in Study screen)
4. **`grade-${value}`** — 1 occurrence (grade selection buttons in Study screen)
5. **`study-ahead`** — 1 occurrence (study ahead button in Study screen)

*No patterns with frequency > 1 exist in the non‑compliant category, as all root elements are fully compliant.*

---

## Components Missing testIDs on Root/Interactive Elements

**Zero (0) components** missing testIDs on their root ScrollView or tab bar buttons.

All screen roots and tab bar buttons have the required testIDs. The only elements without testIDs are deeply nested interactive elements (e.g., text spans, vectors, decorative views) which are outside the contract scope.

---

## Audit Summary

| Category | Count | Percentage |
|----------|-------|------------|
| ✅ Compliant (root testIDs) | 7 screens + 7 tab buttons | 100% |
| ⚠️ Partial (internal testIDs) | 5 elements in Study screen + 1 in Ask screen | — |
| ❌ Non‑compliant (missing/wrong) | 0 | 0% |

**Key Findings**:
1. **Full compliance** at the contract level: every tab button and every tab screen root ScrollView has the correct testID pattern.
2. **Study screen** has 5 internal elements with project‑specific testID patterns (`study-subject-*`, `study-cat-*`, `flashcard`, `grade-*`, `study-ahead`) — these are valid testIDs but do not follow the `tab-<route>`/`screen-<name>` contract.
3. **No remedial action needed** for the contract — the audit passes at the root/testID‑routing level.
4. **Consider adding** the internal study testIDs to a separate component‑level testing strategy if deeper RNTL coverage is desired.

---

## Files Audited

| File | TestIDs Found | Compliance |
|------|--------------|------------|
| `apps/portfolio/app/(tabs)/_layout.tsx` | 7 (`tab-*`) | ✅ Fully compliant |
| `apps/portfolio/app/(tabs)/ask.tsx` | 2 (`screen-ask`, `ask-input`) | ✅ Root compliant |
| `apps/portfolio/app/(tabs)/education.tsx` | 1 (`screen-education`) | ✅ Fully compliant |
| `apps/portfolio/app/(tabs)/index.tsx` | 1 (`screen-status`) | ✅ Fully compliant |
| `apps/portfolio/app/(tabs)/experience.tsx` | 1 (`screen-experience`) | ✅ Fully compliant |
| `apps/portfolio/app/(tabs)/projects.tsx` | 1 (`screen-projects`) | ✅ Fully compliant |
| `apps/portfolio/app/(tabs)/contact.tsx` | 1 (`screen-contact`) | ✅ Fully compliant |
| `apps/portfolio/app/(tabs)/study.tsx` | 7 (1 root + 6 internal) | ✅ Root compliant, internal non-standard |
| `apps/portfolio/src/study/content/react-native.ts` | 0 (comment only) | N/A |