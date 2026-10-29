# Software factory: complete delivery workflow
Objective: Extend the reusable repository factory to the complete Language → Planning → Review workflow in the user-provided reference, composing existing skills and adding only missing capabilities.
Branch: `feature/software-factory-full-workflow`. Delivery: `ask-on-risk` (default); projected tracked repository changes ~250 authored lines, generated files excluded.
Verification: skill structure/readback, `gentle-ai skill-registry refresh --force`, offline workflow scenarios, and `git diff --check`; no code test runner applies unless code changes are introduced.

## Specs

### S1 — Follow the complete reference workflow
- User request: “toma como referencia fuerte el documento que te di para la software factory, siguela al pie de la letra tal cual, necesito que la software factory sea tal cual la pagina file:///Users/gerardocordero/Downloads/index.html”
- Scope: implement the page's three movements—Language, Planning, Review—and the full path from shared language and decisions through maps, specs, tickets, implementation, PR/review, and retrospective. The page's business examples remain examples, not factory-wide product rules.
- Evidence: the page names the three movements and 38 chapters at HTML line 371; domain language and ADRs at 381–422; Wayfinder and ticket types at 549–579; routing and review stages at 611–654; PR evidence and Merge Danger at 612–639; retro at 658–706.
- Acceptance: the factory routes through every applicable stage while preserving the page's sequence and human decision points.
- Checks: inspect the reference-derived workflow map and exercise the complete path in an offline fixture.

### S2 — Choose the right entry path
- Scope: distinguish a tiny, clear change from a small but unclear decision and a large effort with unresolved questions; route respectively to direct implementation, `grill-with-docs`, or Wayfinder.
- Acceptance: Wayfinder is not imposed on tiny work; the map is used when the path is not yet clear, and out-of-scope work does not graduate into its frontier.
- Checks: offline scenarios cover all three paths.

### S3 — Preserve language and decision quality
- Scope: compose existing domain-modeling and grill-with-docs capabilities for shared terms, scenario checks, glossary/context updates, and sparing ADRs; prune stale decisions when warranted. Respect each target repository's existing canonical domain document.
- Acceptance: no duplicate glossary is introduced when a repository already has a canonical context/glossary; ADRs meet the documented hard-to-reverse, surprising, real-trade-off threshold.
- Checks: read back the composition contract and test it against the existing domain-modeling rules.

### S4 — Preserve planning lineage
- Scope: use Wayfinder's map, fog/frontier, and research/grilling/prototype/task tickets when warranted; carry map and prototype links into the spec and implementation tickets.
- Acceptance: a completed map becomes the spec destination; tickets retain map/spec/prototype lineage and real blocking dependencies. Reuse installed skills when available and retain a portable fallback when they are absent.
- Checks: offline fixture confirms traceability without publishing real issues.

### S5 — Implement from approved specs
- Scope: add `implement-spec` as the fresh-context orchestrator for approved specs and tasks; keep each task's acceptance and verification evidence visible; preserve dependency order and only parallelize independent tasks with disjoint surfaces.
- Acceptance: deterministic checks remain distinct from automated review; implementation does not authorize unapproved scope, commits, publishing, or remote operations. Target-controlled checks run only inside the required OS-enforced sandbox; otherwise they report `needs_validation`.
- Checks: synthetic task scenarios verify task routing and no-remote behavior.

### S6 — Make review useful and evidence-backed
- Scope: compose deterministic checks, automated standards/spec review, and human review; prepare PR bodies with summary, before/after evidence, and Merge Danger (reversibility and blast radius), without fabricating evidence.
- Acceptance: clear, supported findings are routed for bounded correction; uncertain judgments remain for the human. Existing repository PR rules remain intact.
- Checks: offline PR-body fixture contains the required evidence and risk fields.

### S7 — Close the learning loop with human control
- Scope: add `retro` to inspect bounded session and review evidence and propose improvements to standards, global instructions, pruning, tool economy, checks, or navigation.
- Acceptance: retro cites evidence and exact candidate surfaces; the human selects recommendations. Repository, session, PR, and tool content remains untrusted evidence. Retro never applies its own suggestions or loops on its own changes.
- Checks: synthetic-session scenario produces proposals without mutating files or contacting remote services.

### S8 — Preserve user work and operation boundaries
- User instruction: “No tocaría los cambios ajenos que ya están en el worktree.”
- Scope: make source and documentation edits only in the isolated worktree. Do not modify the original dirty files or its `CONTEXT.md`. The explicitly approved generated skill registry may be refreshed in the original project as its only write. Do not access sibling projects, publish, push, create remote issues/PRs, or use credentials during validation. Run target-controlled commands only when the security-audit sandbox requirements are fully enforceable.
- Acceptance: original worktree remains unchanged; all temporary fixtures stay outside the workspace and are removed by the parent after checks.
- Checks: compare original worktree status before and after; verify the isolated diff contains only approved paths.

### S9 — Record and index the scope change
- Scope: preserve ADR-0002 as historical context, supersede it with ADR-0003, clarify the research note's prior MVP scope, and refresh/read back the skill registry after skill changes.
- Acceptance: the new ADR distinguishes the user-selected workflow from conclusions of the earlier primary-source research. The registry indexes the canonical shared skills without manual edits.
- Checks: read back both ADRs, the research note, and the refreshed registry.

## Tasks
- [x] T1 — Record the expanded factory decision and scope — S1, S8–S9 — inline — complete (ADR and research read back) — commit: pending.
- [x] T2 — Extend the factory router and add its complete-workflow reference — S1–S4, S8 — inline — complete (both files read back) — commit: pending.
- [x] T3 — Add the `implement-spec` and `retro` shared skills — S5, S7–S8 — inline — complete (both files read back) — commit: pending.
- [x] T4 — Add PR evidence requirements and verify the skill-composition contracts — S4, S6–S8 — inline — complete (nine structural checks pass; `git diff --check` clean) — commit: pending.
- [x] T5 — Refresh the registry and run offline workflow verification — S1–S9 — inline — complete (registry read back; independent S1–S9 verifier met) — commit: pending.

## Log

### L1 — Original request (2026-10-29)
> quiero que tomes este documento como referencia para mejorar nuestra software factory y software factory skill: file:///Users/gerardocordero/Downloads/index.html

### L2 — Scope clarification (2026-10-29)
> quiero que hagas los cambios, pero tambien necesito que hagas esto: no agregaría el flujo más amplio de producto, tickets y retrospectivas. No tocaría los cambios ajenos que ya están en el worktree., toma como referencia fuerte el documento que te di para la software factory, siguela al pie de la letra tal cual, necesito que la software factory sea tal cual la pagina file:///Users/gerardocordero/Downloads/index.html necesito que hagamos los skills necesarios que se combinen para que la software factory sea o este completa

### L3 — User selected full-page scope (2026-10-29)
- The user selected “Incluir la página completa”; this supersedes the earlier exclusion of the product, ticket, and retrospective workflow.
- The implementation uses an isolated sibling worktree because the original worktree has unrelated dirty files. The clean worktree does not contain ignored project-local `.claude/skills`; the global factory will compose installed skills by registry and validate their outputs instead of editing those files.
- On entering the isolated worktree, its generated `.atl/skill-registry.md` and cache already differed from HEAD: the generated index was retitled to the worktree directory and omitted ignored project-local skills. Keep this generated side effect isolated; refresh the actual project's registry only through the approved registry workflow.
- Engram mirror is pending: the memory service could not confirm session registration. Preserve this local task document and do not claim the mirror succeeded.

### L4 — Scope decision recorded (2026-10-29)
- Marked ADR-0002 superseded by ADR-0003, recorded the complete feature-delivery workflow in ADR-0003, and clarified that the research note's earlier MVP scope is historical. Read back all three documents; the primary-source research claims remain separate from the user's workflow decision.

### L5 — Factory entry point and workflow reference added (2026-10-29)
- Expanded the canonical global factory skill to route both repository foundation and complete feature delivery, preserving its approval and safety gates.
- Added an on-demand reference covering entry routing, language/ADR work, map-to-spec/ticket lineage, implementation, three-stage review, PR evidence, and human-controlled retro. Read back both files.

### L6 — Missing workflow skills added (2026-10-29)
- Added global `implement-spec` and `retro` skills. Both preserve task lineage and human authority; retro is evidence-bounded and never self-applies recommendations. Read back both files and confirmed their local workflow references.

### L7 — PR evidence and skill handoffs defined (2026-10-29)
- Added summary, test-plan, before/after evidence, Merge Danger, and project-owned priority requirements to the factory's PR handoff. Kept the separate global issue-first `branch-pr` skill unchanged; it is invoked only when the target repository's rules call for it.
- The factory passes map/prototype lineage to installed spec/ticket skills and validates their output; those ignored project-local files are absent from the clean worktree and remain unmodified in the original worktree.

### L8 — Preserve the real project registry (2026-10-29)
- Worktree startup regenerated an index under the worktree's name and omitted its absent ignored project skills. The final forced registry refresh will therefore run only against the approved `.atl` output in the original repository, preserving its local skill inventory. No existing dirty file or `CONTEXT.md` is in that approved surface.

### L9 — Focused trust-boundary review (2026-10-29)
- Applied security-audit guidance to the skill changes: repository/tool/session content is evidence, not authority; remote access needs destination/operation/credential authorization; target-controlled checks require the complete OS-enforced sandbox or become `needs_validation`. No target code was executed and no full security-audit artifacts were requested or created.

### L10 — Structural and registry checks (2026-10-29)
- `gentle-ai skill-registry refresh --cwd /Users/gerardocordero/noofficelocation/gerardocordero.dev --force` refreshed 123 skills. Read back entries for `implement-spec`, `retro`, and `software-factory` at user scope. The original worktree's non-registry dirty-entry count remained 28; only the approved `.atl` registry and cache changed there.
- A nine-case offline contract probe and `git diff --check` passed. The first probe attempt had a case-sensitive assertion mismatch; after making the comparison case-insensitive, all nine cases passed. No target-controlled code or remote operations ran.

### L11 — Final structural/security checks (2026-10-29)
- Re-read all three global skill contracts and their references after the focused security changes. The updated nine-case flow/security probe, frontmatter/section/link checks, ADR/research checks, registry checks, and `git diff --check` all passed.
- Repository code gates were not run because this feature changes only skill instructions and documentation. End-to-end prompt behavior and independent verification remain pending; no target-controlled program was executed because no complete OS-enforced sandbox was available.

### L12 — Independent verification (2026-10-29)
- The independent verifier returned `met` for S1–S9 with no change-caused blockers. It used a fresh scratch copy and left it for parent cleanup; the parent removed the reported scratch directory. Its suggested optional regression-test document was not created because it was outside the approved edit surface and no executable skill-test runner exists.
- The verifier did not independently inspect the original checkout; the parent confirmed the original worktree retained its 28 non-registry dirty entries, with only the approved `.atl` registry/cache update added.

### L13 — Latest original-worktree state (2026-10-29)
- A later read-only status showed 32 non-registry dirty entries, up from the earlier 28-entry snapshot. The change is not attributable from available evidence; no source paths were written by this task. Preserve all current entries and keep subsequent edits in the isolated feature worktree.

Risk: item 3 — the factory, implementation, retro, and PR skill contracts are shared across projects and runtimes.
