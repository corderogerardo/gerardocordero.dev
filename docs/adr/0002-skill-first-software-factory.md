# ADR-0002: Build an Approval-Gated Software Factory as a Skill

## Status
Accepted

## Date
2026-10-20

## Context

The user maintains both monorepos and standalone projects and wants a repeatable way to raise their engineering foundation while learning each project's existing stack. Primary sources use “software factory” for different scopes, from deployable DevSecOps capabilities to project-template tools; there is no universal architecture to copy. The current monorepo already has pnpm/Turbo quality gates, CI, an architecture fitness check, agent instructions, and a skill registry, while other repositories use different tools.

An auto-applying CLI, a Backstage-style platform, or a single copied CI template would either overbuild the personal workflow or erase project-specific toolchains. Existing repositories may also contain uncommitted work, so a factory must inspect before it proposes changes.

## Decision

Implement the factory as a skill-first workflow for **existing repositories**. It must:

1. Classify the selected repository as a monorepo or standalone project and identify its actual stack, commands, instructions, CI, and skills.
2. Inventory existing quality gates before proposing a minimum foundation: a runnable local quality loop, CI parity, agent-facing quick start/context, skill discovery, and verification.
3. Present a repo-specific plan with exact target files and checks, then wait for explicit approval before changing target-project files.
4. Apply only approved changes, preserve unrelated work and project-specific toolchains, and report verification evidence.
5. Keep security, release, observability, metrics, and issue-workflow profiles opt-in until their requirements are established.

Validate the monorepo path in `gerardocordero.dev` and the standalone path in an isolated temporary fixture. Do not modify sibling repositories in this initiative. Create a portable skill in the canonical shared skill store only after the workflow and both topology paths are verified. Add deterministic helpers only when a concrete discovery or validation need justifies them.

## Alternatives Considered

### Build a self-service developer platform

A portal, catalog, and self-service provisioning system could serve many teams, but this initiative has no multi-team service-ownership or provisioning requirement. It adds operational surface without improving the requested project-by-project workflow.

### Build a general factory CLI first

A CLI could make deterministic inventory repeatable, but it must recognize many languages, package managers, CI providers, and repo conventions. Start with a guided skill and add a helper only for a measured deterministic gap.

### Automatically apply defaults to every repository

Bulk mutation risks overwriting human work and flattening project-specific conventions. The factory instead prepares an explicit plan and applies only after approval.

### Generate new repositories from templates

Templates are useful for new projects, but the user's first goal is to standardize existing projects. New-project generation is a separate profile, not part of this MVP.

## Consequences

- The factory can adapt to a monorepo or standalone project without assuming one stack or package manager.
- The first implementation is plan-first and approval-gated; no sibling repository is modified as part of validation.
- The current monorepo and a disposable standalone fixture provide two topology checks without consuming or overwriting a sibling project.
- The reusable skill's runtime discovery paths and installation points must be verified before it is published to the shared skill store.
- The minimum foundation is intentionally not a universal CI/CD, security, release, or metrics policy; those remain opt-in profiles.
