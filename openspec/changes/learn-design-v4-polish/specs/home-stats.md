# Delta for Home Stats Hairline Row

## MODIFIED Requirements

### Requirement: Home stats grid must use hairline dividers, single accent token, no bordered cards

The home page stats section must render as a grid of stat items divided by hairline dividers (vertical on mobile, horizontal on desktop), with no bordered or rounded card boxes around individual stats. Stat numbers must use a single accent token. The grid must explicitly collapse into a single column below 768px.

(Previously: The stats grid in `HomePageClient.tsx` used four separate `rounded-2xl border border-border bg-card p-4 text-center` divs, each with its own border and background, creating a card-on-card monotony against the hero card. Stat numbers used `text-accent` but each stat was visually isolated in its own bordered card.)

The system **MUST** replace the four bordered card divs with a single `grid grid-cols-2 gap-3 sm:grid-cols-4` container. Stat item divs **MUST NOT** contain `rounded-2xl`, `border`, `border-border`, `bg-card`, or `p-4` classes. Each stat value **MUST** use `text-accent` (single accent token) for the number display. The container **MUST** include `divide-y sm:divide-y-0 sm:divide-x` for hairline dividers between items. Below 768px, the divider behavior **MUST** collapse to vertical-only (`divide-y`) with `sm:divide-y-0 sm:divide-x` switching to horizontal at desktop.

#### Scenario: Hairline dividers, no card boxes, single accent

- GIVEN: Home page renders with 4 stat items (lessons, courses, decks, languages)
- WHEN: The stats grid is displayed on mobile (<768px)
- THEN: Stats appear in a single column with vertical hairline dividers (`divide-y`) between each item
- AND: Each stat item has no rounded corners or border/background boxes — only the divider hairline
- AND: Stat numbers use `text-accent` (single shared token, not individual color overrides)
- AND: The grid fills the available width without horizontal dividers on mobile

#### Scenario: Desktop divider switch

- GIVEN: Home page renders with 4 stat items at ≥768px viewport width
- WHEN: The stats grid is displayed on desktop
- THEN: Stats appear in a 4-column grid (`sm:grid-cols-4`)
- AND: Horizontal hairline dividers appear (`sm:divide-x`) between columns
- AND: Vertical dividers are removed (`sm:divide-y-0`)
- AND: Stat numbers still use `text-accent` single token

#### Scenario: Dark mode parity

- GIVEN: Home page in dark mode (`.dark` class on `body`)
- WHEN: The stats grid renders
- THEN: Hairline dividers are visible against the dark background
- AND: Stat numbers use `text-accent-foreground` color from the dark token set
- AND: No residual card box shadows or borders are visible