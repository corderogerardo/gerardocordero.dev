# ADR-0003: Expand the Software Factory to the Full Delivery Workflow

## Status
Accepted

## Date
2026-10-29

## Context

ADR-0002 established a skill-first, approval-gated foundation for standardizing existing repositories. The user has now selected the complete workflow in the supplied 38-chapter reference, not only its repository-intake foundation. The reference groups its work into Language, Planning, and Review, and carries a feature from shared terms and decisions through a map, spec, tickets, implementation, PR/review, and retro.

The repository already has skills for domain modeling, glossary and ADR work, Wayfinder maps, specs, tickets, implementation, and standards/spec review. Duplicating those capabilities would create competing instructions. The clear missing capabilities are a spec-to-implementation orchestrator and a retrospective skill, plus one factory entry point that routes and composes the existing skills.

## Decision

Keep ADR-0002's repository-foundation and monorepo/standalone profiles, and extend the reusable factory with a complete feature-delivery workflow:

1. **Language:** route uncertain concepts through the existing domain-modeling and grill-with-docs skills; scenario-test terms; keep the target repository's canonical glossary/context artifact; offer or retain ADRs only for hard-to-reverse, surprising, real trade-offs; prune stale entries when appropriate.
2. **Planning:** send tiny, clear work directly; use grilling for a bounded unresolved decision; use Wayfinder when the destination or path is too uncertain for one session. Preserve map scope, fog/frontier, ticket types, research, and prototype evidence.
3. **Spec and tickets:** turn a completed map into a spec and linked implementation tickets, carrying map and prototype references forward. Prefer installed target-repository skills and provide a portable factory fallback when they are absent.
4. **Implementation:** add `implement-spec` to orchestrate approved specs and tasks in fresh, bounded contexts, respecting dependency order, verification commands, and disjoint edit surfaces.
5. **Review and PR evidence:** keep deterministic checks, automated standards/spec review, and human review distinct. PR material includes a summary, relevant before/after evidence, and Merge Danger (reversibility and blast radius). Uncertain judgments remain with the human.
6. **Retro:** add `retro` to inspect bounded session and review evidence, propose evidence-backed improvements to standards, global instructions, pruning, tool economy, checks, or navigation, and wait for the human to select recommendations before changing anything.

The factory preserves target-project conventions and the explicit plan/approval gate. The reference's product-specific refund, notification, and bookmarks examples remain examples rather than universal product rules. Remote trackers, credentials, PR publication, push, and other remote actions still require explicit authorization for the destination and operation. Existing unrelated work remains untouched.

## Alternatives Considered

### Keep the repository-foundation-only scope

This preserves ADR-0002 exactly but fails the user's explicit selection of the complete reference workflow.

### Create a separate skill for every chapter

The reference already maps to several installed skills. One orchestrator plus only the missing implementation and retro capabilities keeps a single route and avoids duplicate definitions.

### Let retro apply its own improvements

Automatic self-modification can create an unbounded loop and make the agent environment worse. Retro therefore proposes changes and leaves selection to the human.

## Consequences

- The factory covers repository foundation and feature delivery while retaining topology-specific discovery.
- Existing skills remain the source of truth for their stages; the factory passes lineage between them and verifies their outputs.
- The reusable skill package gains `implement-spec` and `retro` and an on-demand workflow reference.
- Offline fixtures can validate routing and evidence requirements without publishing issues or PRs.
- The original accepted scope remains recorded in ADR-0002 as historical context.
