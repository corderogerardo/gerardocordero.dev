# Software Factory: Research and MVP Scope

## Working definition

The reviewed primary sources do not establish one universal software-factory architecture. In the DoD/USAF context, a software factory is a deployable DevSecOps capability for producing, securing, deploying, and operating software. In other contexts, the same term can name a much narrower project-template tool. The name alone does not justify building a developer portal or platform. [1][2]

For this repository, use **software factory** to mean a repeatable, standards-backed path from repository intake to verified delivery, using reusable guidance and automation. It should discover the repository before proposing changes, and preserve the existing toolchain rather than impose one.

## Related concepts

| Concept | What it covers | Relationship to a software factory |
|---|---|---|
| Repository template | Copies or generates an initial repository structure. GitHub templates and Backstage Software Templates are examples. [3][4] | A starting point can be one input to a factory; it does not by itself inspect or verify an existing repository. |
| CI/CD pipeline | Automates workflow jobs such as build, test, and deployment. [5] | A pipeline is a delivery mechanism inside a factory, not the entire intake-to-verified-delivery path. |
| Developer portal/platform | Backstage is a framework for a developer portal; the CNCF platform paper describes a broader integrated developer experience. [6][7] | A portal can expose factory capabilities, but this MVP does not need one. |
| Secure development framework | NIST SSDF describes secure development practices that can be integrated into an SDLC. [8] | Security is an optional profile for this minimal factory, not a factory definition by itself. |

## Minimum useful foundation

For the user's existing-repository goal, a minimal factory should:

1. Classify a repository as a monorepo or standalone project and identify its actual stack and package/build tooling.
2. Inventory its existing quality loop, CI, agent instructions, and skill registry before proposing changes.
3. Produce a repository-specific plan with explicit edit surfaces; wait for approval before changing target-project files.
4. Apply only the approved plan, then run the repository's existing gates and report the evidence.
5. Keep stack-specific details in adapters or disclosed references; do not impose one package manager, CI provider, release model, or language.

The first profile is intentionally narrow: repository discovery, quality-loop/CI parity, agent-facing quick start/context, skill discovery, approval, and verification. Release automation, observability, trend metrics, issue workflows, and security automation remain opt-in until their requirements are established.

## Current starting point

- The current monorepo already has a pnpm/Turbo quality loop and workspace-specific CI gates (`AGENTS.md:5-20`; `package.json:4-12`; `.github/workflows/ci.yml:21-48,330-572`).
- It has a deterministic architecture fitness check and an ADR describing its boundary and known follow-ups (`scripts/architecture-fitness.mjs:43-88,168-235`; `docs/adr/0001-workspace-dependency-boundaries.md:12-41`).
- `apps/template-prep` is a domain-specific starter for study sites; it is not a general repository factory (`apps/template-prep/README.md:3-29`).
- `interviews-tv` is a distinct Bun/Nx monorepo; `noofficelocation` is a standalone project with its own CI. Neither sibling is a write target for this initiative; use an isolated standalone fixture instead.
- Before this initiative, the active skill registry had no dedicated software-factory skill. Relevant existing building blocks include `ci-cd-and-automation`, `setup-pre-commit`, `setup-matt-pocock-skills`, `setup-ts-deep-modules`, `scaffold-exercises`, `shared-kit-extraction`, `skill-creator`, and `writing-for-agents` (`.atl/skill-registry.md`). The new global skill is now indexed in the current registry (120 entries).
- A disabled archive contains `monorepo-architect`, which covers monorepo tool selection, workspaces, caching, and pipelines but not standalone projects or approval-gated standardization. `llama-factory`, `theme-factory`, and `meme-factory` are unrelated name matches. The archived skill was inspected, not restored.

## Decision for this MVP

Implement a skill-first, approval-gated workflow for standardizing existing repositories. Validate the monorepo path in `gerardocordero.dev` and the standalone path in a temporary fixture. Do not build a portal, apply changes to sibling repositories, or claim benchmark results. Create the reusable replication skill only after the workflow and both topology checks are complete.

## Open assumptions and limits

- This MVP serves the user's existing project fleet; multi-team platform ownership and self-service provisioning are not established requirements.
- The standalone branch is exercised with a temporary Node fixture, not by modifying a real standalone sibling project. Other languages and CI providers remain untested as standalone targets.
- The factory does not generate new repositories or promise security, release, observability, metrics, or issue-workflow coverage. Those need separate profiles and approval.
- No performance benchmark is claimed. The checks establish local quality-loop and CI-command parity for the fixture only.
- The workflow relies on repository manifests and instructions as evidence. If they cannot disambiguate the topology or gates, the skill must stop and request a scoped decision rather than guess.

## Sources

1. U.S. Air Force DevSecOps — DoD Software Modernization / DevSecOps Platform: <https://software.af.mil/dsop/>.
2. Microsoft Learn — Use HAT Software Factory to create a hosted application: <https://learn.microsoft.com/en-us/dynamics365/unified-service-desk/use-hat-software-factory-create-hosted-application?view=dynamics-usd-4.3>.
3. GitHub Docs — Creating a repository from a template: <https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template>.
4. Backstage Docs — Software Templates: <https://backstage.io/docs/features/software-templates/>.
5. GitHub Docs — Understanding GitHub Actions: <https://docs.github.com/en/actions/about-github-actions/understanding-github-actions>.
6. Backstage Docs — What is Backstage?: <https://backstage.io/docs/overview/what-is-backstage/>.
7. CNCF TAG App Delivery — Platforms White Paper: <https://tag-app-delivery.cncf.io/whitepapers/platforms/>.
8. NIST SP 800-218 — Secure Software Development Framework (SSDF): <https://csrc.nist.gov/pubs/sp/800/218/final>.
