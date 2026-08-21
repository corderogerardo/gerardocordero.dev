# Delta for RN Palette Unification

## MODIFIED Requirements

### Requirement: RN .rn-root token palette must use global oklch vars only

The `.rn-root` component and its descendants must inherit global oklch design tokens from `globals.css` and must NOT contain duplicate `:root`/`.dark` token blocks. The scoped `.rn-root` reset may exist but must reference tokens via `var()` functional notation, not raw `hsl(var(--...))` values.

(Previously: `reactnative.css` contained full `:root` and `.dark` blocks with duplicated token definitions — `--background`, `--foreground`, `--primary`, etc. — producing a visible two-tone split between the global-header tokens and the `.rn-root` body on practice pages. The `border-color` property used `hsl(var(--border))` referencing the duplicated local tokens.)

The system **MUST** remove the duplicate `:root` and `.dark` token blocks from `reactnative.css` (approximately 46 lines). The `.rn-root` component **MUST** retain only the scoped reset, and any `hsl(var(--border))` reference **MUST** be rewritten as `var(--border)` to reference the global token defined in `globals.css`. The `.rn-root` **MUST NOT** redefine editorial palette tokens (`--background`, `--foreground`, `--primary`, etc.) that are already sourced from `globals.css`.

#### Scenario: Warm canvas → cool canvas alignment

- GIVEN: A practice page with `.rn-root` body on a light-mode viewport
- WHEN: The page renders with the unified token palette
- THEN: The `.rn-root` background uses `oklch(0.985 0.003 247)` (cool 262° hue) consistent with `globals.css`, not the warm 245° hue from the duplicated blocks
- AND: The `.rn-root` text uses `oklch(0.21 0.03 260)` foreground, matching global tokens
- AND: The `border-color` resolves to `var(--border)` = `oklch(0.9 0.008 255`, not a locally-defined hsl value

#### Scenario: Scoped reset only, no duplicate tokens

- GIVEN: The `reactnative.css` file as modified
- WHEN: A practice page renders
- THEN: No `:root` or `.dark` at-rules exist inside `@layer base` in `reactnative.css`
- AND: The `.rn-root` rule set contains only `box-sizing`, `border-color: var(--border)`, `min-height: 100vh`, and `@apply bg-background text-foreground`
- AND: All other token references (`--background`, `--foreground`, etc.) are resolved from `globals.css` via Tailwind's `@layer theme` import