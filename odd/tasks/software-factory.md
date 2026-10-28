# Software factory
Objective: Research and implement an approval-gated, skill-first factory for standardizing existing monorepos and standalone projects; validate this monorepo plus a temporary standalone fixture, then create a reusable global skill.
Branch: `feature/monorepo-deepening`. Delivery: `ask-on-risk` (default); forecast ~500–700 authored lines, generated files excluded. Verification: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm architecture:check`, factory fixture checks, and registry/readback checks as applicable.

## Specs

### S1 — Research the software-factory concept
- User request: “investiguemos y aprendamos que es una software factory, busquemos skills”
- Scope: Use primary sources; distinguish a repeatable software-production path from a template, CI/CD pipeline, developer portal, or platform. Report that the term has no universal architecture rather than imposing one.
- Acceptance: `docs/architecture/software-factory-research.md` cites each substantive claim with a full primary-source URL, records the active skills searched and adjacent skills, and identifies open assumptions.
- Checks: Read back the report; verify its cited URLs and source ownership.

### S2 — Standardize existing repositories, not generate new ones
- User selected: “Estandarizar repos existentes (Recommended)”
- Scope: The factory inventories an existing repository and proposes a repo-specific foundation. New-project generation, a portal, and broad release/observability policy are out of scope unless separately authorized.
- Acceptance: The factory distinguishes monorepo and standalone layouts and does not assume a shared language, package manager, or CI provider.
- Checks: Exercise both repository shapes using the current monorepo and an isolated standalone fixture.

### S3 — Plan before applying repository changes
- User selected: “Plan y aprobación (Recommended)”
- Scope: The factory classifies the repository, inventories its existing toolchain and quality gates, and presents a specific plan before it writes target-project files. It applies only the approved plan and verifies the result.
- Acceptance: No target-project mutation occurs before explicit approval; approved changes remain limited to the named repository and approved edit surfaces.
- Checks: A rejected/unapproved plan leaves the fixture tree unchanged; an approved plan reports its writes and verification results.

### S4 — Establish a minimum factory foundation
- User selected: “Fundación mínima (Recommended)”
- Scope: Include repository/topology and stack discovery, a runnable quality loop, CI parity, agent-facing quick-start/context, skill discovery, and approval plus verification. Security, release, observability, metrics, and issue workflows remain opt-in profiles.
- Acceptance: Each detected gate is based on repository evidence; existing commands and policy are preserved unless the approved plan explicitly changes them.
- Checks: Compare the plan against the current monorepo and the standalone fixture; run each applicable gate after approved changes.

### S5 — Use a skill-first implementation
- User selected: “Skill-first (Recommended)”
- Scope: The primary workflow is agent-guided; add a deterministic helper only if discovery or validation demonstrably needs one.
- Acceptance: The implementation does not become a general project-generator CLI or self-service portal by default.
- Checks: Skill behavior is exercised against the monorepo and standalone fixture; any helper has focused tests.

### S6 — Validate two repository shapes without touching sibling projects
- User selected: “Fixture temporal (Recommended)”
- Scope: Use `gerardocordero.dev` as the monorepo pilot and a temporary standalone fixture. Do not modify sibling repositories during this initiative.
- Acceptance: Both shapes are classified and receive an evidence-based plan; the fixture lives outside the workspace and is removed by the parent after verification.
- Checks: Verify no sibling-project files changed; report the fixture path and remove it after use.

### S7 — Create a reusable replication skill last
- User request: “al final creemos una skill que nos permita replicar la software factory a otros proyectos sean monorepos o no”
- Scope: Create a portable skill after the factory workflow and both topology checks are complete. Use the canonical user skill store `~/.agents/skills` so it can be discovered across projects; this location is an assumption grounded in the existing shared-skill setup.
- Acceptance: The skill can discover, plan, await approval, apply, and verify repository-specific factory changes without assuming a monorepo or a particular stack. It contains no private project paths as defaults.
- Checks: Follow `docs/skill-style-guide.md` if present, otherwise the bundled `skill-creator` guide; run `gentle-ai skill-registry refresh --cwd <repo> --force` and read back the resulting registry. Verify the skill through a monorepo and standalone invocation plan.

## Tasks
- [x] T1 — Write the primary-source research and active-skill inventory — Spec S1, route: inline synthesis from completed research handoff, status: complete (report read back; primary-source claims checked), commit: 3a6bebe.
- [x] T2 — Specify the factory workflow, profile contract, and approval gate — Specs S2–S5, route: inline, status: complete (ADR read back), commit: 3a6bebe.
- [x] T3 — Implement topology-specific factory references for monorepo and standalone projects — Specs S2–S5, route: delegated (parallel writers with disjoint surfaces; trigger: two independent topology adapters), status: complete (both read back; verifier blocker corrected and rechecked), commit: 3a6bebe.
- [x] T4 — Validate the monorepo and standalone-fixture flows — Specs S3–S6, route: inline, status: complete (monorepo no-op plan; fixture plan/apply and gates passed), commit: 3a6bebe.
- [x] T5 — Create the reusable global skill and refresh the registry last — Spec S7, route: inline, status: complete (global package/readback/runtime links/registry verified), commit: 3a6bebe.
- [x] T6 — Run applicable repo gates, review the full diff, and close with evidence — Specs S1–S7, route: inline, status: complete (S1/S6 independently rechecked; gates passed; RDD under budget), commit: 3a6bebe.

## Log

### L1 — Original request (2026-10-20)
> si hazlo, en el trasncurso tambien quiero que investiguemos y aprendamos que es una software factory, busquemos skills, y la implementemos para monorepos y proyectos individuales, tambien al final creemos una skill que nos permita replicar la software factory a otros proyectos sean monorepos o no

### L2 — Product decisions (2026-10-20)
- “Plan y aprobación (Recommended)” — inventory and propose first; wait for explicit approval before writing target-project files.
- “Estandarizar repos existentes (Recommended)” — standardize existing repos rather than start with new-project generation.
- “Fixture temporal (Recommended)” — use the current monorepo and a temporary standalone fixture; leave sibling repos unchanged.
- “Skill-first (Recommended)” — guided workflow is primary; deterministic helper only when justified.
- “Fundación mínima (Recommended)” — repository/stack discovery, quality loop, CI parity, agent context, skill registry, approval, and verification; other profiles remain opt-in.
- The user chose a reusable skill as the final deliverable; place it in the canonical shared skill store, subject to verifying the runtime discovery paths before installation.

### L3 — Research evidence and current state (2026-10-20)
- Primary-source handoff found no universal software-factory architecture: sources range from a deployable DoD DevSecOps capability to narrow project-template tools. Working definition: a repeatable, standards-backed path from repo intake to verified delivery, using reusable standards and automation.
- Existing monorepo assets: pnpm/Turbo quality loop and CI (`AGENTS.md:5-20`, `package.json:4-12`, `.github/workflows/ci.yml:21-48`), architecture fitness check (`scripts/architecture-fitness.mjs:43-88,168-235`, ADR-0001), and a domain-specific `apps/template-prep` starter.
- Local comparison: `interviews-tv` uses Bun/Nx; the standalone `noofficelocation` repo has CI. No dedicated software-factory skill appeared in active registries; adjacent skills cover CI/CD, repo setup, scaffolding, shared-kit extraction, and skill authoring.
- Several sibling repositories have dirty or untracked state, including untracked `.codegraph` directories. They are excluded from this implementation.
- Sources: https://software.af.mil/dsop/ ; https://learn.microsoft.com/en-us/dynamics365/unified-service-desk/use-hat-software-factory-create-hosted-application?view=dynamics-usd-4.3 ; https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template ; https://backstage.io/docs/features/software-templates/ ; https://tag-app-delivery.cncf.io/whitepapers/platforms/ ; https://csrc.nist.gov/pubs/sp/800/218/final
- Remaining execution assumption: `docs/skill-style-guide.md` is absent; use the bundled `skill-creator` reference. The project `docs/architecture/` directory is the existing home for the research/design note.

### L4 — Research artifact verification (2026-10-20)
- Wrote and read back `docs/architecture/software-factory-research.md`; checked the AF DevSecOps, Microsoft HAT, and CNCF primary sources directly. Other cited primary-source evidence is recorded in the research handoff.
- No code or sibling-project files changed. T1 is complete; its commit identity will be recorded when the first reviewable work-unit slice is committed.

### L5 — Factory workflow decision (2026-10-20)
- Recorded ADR-0002: skill-first workflow for existing repositories, topology/stack discovery, evidence-based plan, explicit approval before edits, approved apply, and verification.
- Security, release, observability, metrics, issue workflows, and new-project generation remain out of the MVP. A general portal/CLI is not selected; add deterministic helper code only if discovery or testing proves it necessary.
- Validated ADR-0002 structure against the repository's existing ADR-0001 convention and read it back. T2 is complete; commit identity remains pending the first work-unit slice.

### L6 — Topology references and independent verification (2026-10-20)
- Parallel writers added monorepo and standalone references under the ignored project `.agents/skills/software-factory/references/` staging path. The parent read both back and ran the requested structural checks.
- `gentle-ai review assess --cwd ... --agent opencode --json --escalate-item 2` returned `high/unassessable`: `.agents/` is git-ignored, so the references were not in its inventory. This is not a review receipt; the assessment will be revisited only when the final candidate can be assessed.
- An independent verifier found S4 missing agent-facing quick-start/context and skill-discovery guidance in the standalone profile. The parent made one correction; a limited recheck closed that blocker and parent grep returned `S4 standalone contract: PASS`.
- Both verifier scratch directories were removed. T3 is complete; references still need promotion into the canonical shared skill package before final installation.

### L7 — Factory runs and skill installation (2026-10-20)
- Applied the factory discovery/plan logic to `gerardocordero.dev`: classified the pnpm/Turbo repository from workspace declarations; the documented `pnpm typecheck`, `pnpm lint`, `pnpm test`, and `pnpm architecture:check` gates already satisfy the minimum foundation, so the factory plan is a no-op for project files.
- Applied the standalone flow to a temporary fixture under the approved temp root. The plan-only tree hash stayed unchanged; the pre-authorized fixture plan added only `AGENTS.md` and `.github/workflows/ci.yml`. `npm ci --offline --ignore-scripts --no-audit --no-fund`, `npm run check`, and `npm test -- --test-reporter=dot` passed. No linter or dependency was invented; no remote workflow was run.
- Created the final skill package at the canonical shared location `~/.agents/skills/software-factory/` with monorepo and standalone references. Relative symlinks in Claude, OpenCode, Codex, Hermes, Pi, and the current project resolve to the canonical package.
- Refreshed `.atl/skill-registry.md` to 120 skills and confirmed the user-scope software-factory entry. Skill structure/readback checks passed. No sibling repository was modified.
- The final independent skill verifier was cancelled by the runtime; T6 remains pending until parent-side checks and an independent targeted recheck complete.

### L8 — Archived skill inventory (2026-10-20)
- A targeted read-only search found archived `monorepo-architect`, which covers monorepo tooling but not the approval-gated standalone/monorepo factory. `llama-factory`, `theme-factory`, and `meme-factory` are unrelated name matches. None was restored or activated.
- Before this initiative, the active registry had no dedicated software-factory skill; the new global skill is now indexed in the current registry. Added the archive finding to the research note.

### L9 — Final verification and cleanup (2026-10-28)
- Independent S1 recheck returned `met`: all eight primary-source URLs were fetched from their official owners; no citation mismatch was found. The research report's open assumptions are explicit.
- Independent S6 recheck initially returned unmet because the original temporary fixture was empty. The parent rebuilt one standalone fixture, observed an unchanged plan-only hash, and reran the approved apply and tests. A focused verifier recheck then returned `met`.
- Final native assessment over the six intended repository paths returned `risk: medium`, `review_due: false`, `review_due_reason: under_budget`, with 236 changed lines. No native review lifecycle was started; this is not a review receipt.
- Removed the verifier scratch directories and all temporary standalone fixtures created for this initiative. Sibling repositories were not modified. Global skill source and five runtime links remain installed.
- T6 complete: `pnpm typecheck`, `pnpm lint`, `pnpm test` (35 tests), and `pnpm architecture:check` passed; standalone `npm ci --offline`, `npm run check`, and `npm test` passed in the rebuilt fixture. Work-unit commit: `3a6bebe`.
