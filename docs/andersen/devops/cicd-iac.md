# DevOps — SDLC, CI/CD & IaC

### SDLC Stages
**They ask:** "Walk me through the SDLC stages, and where does DevOps actually change the traditional model?"

The classic stages — requirements, design, implementation, testing, deployment, maintenance — describe *what* work happens, but the traditional model treats them as sequential handoffs between separate teams. DevOps doesn't add a stage; it collapses the handoff boundaries, especially between "testing/deployment" and "maintenance," by making the same team own build, deploy, and operate with feedback looping continuously instead of only at the end.

That's the practical answer an interviewer wants: not the list of stages, but that DevOps turns the SDLC from a line into a loop — monitoring in production feeds directly back into the next requirements/design cycle.

**Say it:** "The stages themselves haven't changed — what DevOps changes is the handoff model, from sequential and siloed to a continuous loop where production feedback drives the next iteration."
**Red flag:** Describing DevOps as just "Waterfall but with more automation" — the shift is organizational (who owns what) as much as tooling.

### Core Git Workflow
**They ask:** "Walk me through your daily git workflow — and what's actually happening when you `git add` before `git commit`?"

`checkout`/`switch` moves between branches, `add` stages specific changes into the index (a separate area from the working directory), `commit` snapshots the index, `push` sends commits to a remote, `reset` moves the branch pointer (and optionally the index/working tree) backward. The staging index exists precisely so a commit can be *curated* — you can stage half a file's changes and leave the rest for a separate commit, which is what makes commits a meaningful unit of review rather than "whatever was in the working directory at save time."

```bash
git checkout -b feature/rate-limit
git add src/middleware/rate-limit.ts
git commit -m "feat: add token-bucket rate limiter"
git push -u origin feature/rate-limit
```

**Say it:** "The staging index is what lets a commit be a deliberate, reviewable unit instead of a dump of the working directory — I use it to split unrelated changes into separate commits."
**Red flag:** Always running `git add .` without looking at what's actually staged — that's how debug logging or a stray config change ends up in a commit meant to be a clean feature.

### Advanced Git Rebase Vs Merge
**They ask:** "When do you rebase instead of merge, and what's actually happening to the commit history in each?"

A merge creates a new commit with two parents, preserving the true history of when branches diverged and rejoined — nothing is rewritten, which is why it's safe on shared branches. A rebase replays your branch's commits one by one onto a new base, producing *new* commit hashes for identical-looking changes — it gives a linear, readable history, but it rewrites history, which is why rebasing a branch other people have already pulled causes divergent history and painful force-pushes for everyone else.

The rule that actually matters operationally: rebase freely on a *local, unshared* branch to clean it up before opening a PR; merge (or `--no-ff`) once a branch is shared, so you never rewrite commits someone else has based work on.

```bash
git fetch origin
git rebase origin/main        # local branch, not yet pushed/shared
```

**Say it:** "Rebase rewrites history, merge preserves it — I rebase to clean up a branch before it's shared, and merge once other people have based work on it, because rewriting shared history breaks everyone downstream."
**Red flag:** Rebasing a long-lived shared branch and force-pushing — anyone who already pulled it now has diverged, duplicate-looking commits and a painful reconciliation.

### Git Strategies And VCS Comparison
**They ask:** "Compare git flow, GitHub flow, and trunk-based development — which would you pick for a team shipping multiple times a day?"

git flow has long-lived `develop`, `release`, and `hotfix` branches — structured, but heavy, and it accumulates merge conflicts the longer a feature branch lives away from `main`. GitHub flow simplifies to a single long-lived `main` plus short feature branches merged via PR — lighter, and closer to what continuous deployment actually needs.

Trunk-based development goes further: everyone commits directly (or via very short-lived branches) to `main`, gated by feature flags rather than long-lived branches — that's the model that actually supports shipping multiple times a day, because there's no long-lived branch accumulating drift to reconcile. Git itself, versus Subversion or Mercurial, wins on distributed history (every clone is a full repo, so branching/merging is cheap and offline) — that's the property that made these lightweight branching strategies practical in the first place.

**Say it:** "For multiple deploys a day I'd push toward trunk-based development with feature flags — long-lived branches are exactly what makes high-frequency deployment painful, because the merge conflict grows with branch age."
**Red flag:** Defaulting to git flow for a team doing continuous deployment "because it's the standard" — its whole design assumes infrequent, batched releases.

## CI/CD

### Building A CI CD Pipeline
**They ask:** "Sketch a CI/CD pipeline for a typical service — what stages, and in what order?"

The order matters because each stage should be cheaper and faster than the next, so a pipeline fails as early as possible and doesn't waste minutes on a build that was going to fail linting anyway: lint/static-analysis first (seconds), then unit tests, then build, then integration tests, then deploy to staging, then (often gated) deploy to production.

```yaml
stages: [lint, test, build, integration, deploy-staging, deploy-prod]
deploy-prod:
  stage: deploy-prod
  when: manual
  only: [main]
```

**Say it:** "I order pipeline stages cheapest-and-fastest first, so a broken build fails on a 10-second lint step instead of after a 10-minute integration suite."
**Red flag:** Running the full test suite before linting — it burns CI minutes on a build that a 5-second syntax check would have caught immediately.

### CI Vs CD Deep Dive
**They ask:** "CI and CD get used almost interchangeably — what does each actually guarantee, and where's the line between continuous delivery and continuous deployment?"

Continuous Integration guarantees that every merge to the main branch is automatically built and tested — its whole purpose is catching integration problems within minutes of a merge instead of days later during a manual "integration week." Continuous Delivery extends that: every change that passes CI is automatically packaged into a deployable artifact and *could* be released at any time — but a human still decides when.

Continuous Deployment removes that last human gate — every change that passes the pipeline goes to production automatically. The distinction matters in an interview because "we do CD" is ambiguous until you specify which one — delivery with a manual release button, or deployment with no gate at all.

**Say it:** "CI is about catching integration problems fast; delivery means every passing build is release-ready; deployment means it actually ships without a human pressing a button — I always clarify which 'CD' a team means."
**Red flag:** Calling a pipeline "continuous deployment" when there's actually a manual approval gate before production — that's continuous delivery, and the distinction matters when someone assumes zero-touch releases.

### Deployment Strategies Rolling Blue Green Canary
**They ask:** "Compare all-at-once, rolling, blue-green, and canary deployments — how do you pick?"

All-at-once is the fastest and riskiest — every instance updates simultaneously, so a bad deploy means full downtime with no fallback. Rolling replaces instances gradually behind a load balancer, so there's no downtime, but during the rollout two versions serve traffic simultaneously, and rollback means rolling forward again rather than an instant switch.

Blue-green keeps two full parallel environments and switches traffic atomically — instant rollback (flip the router back), at the cost of running double the infrastructure during the switch. Canary routes a small percentage of real traffic to the new version first and watches error rates/metrics before ramping up — the best blast-radius control, at the cost of needing solid metrics and traffic-splitting infrastructure to do it safely.

```yaml
# canary: 5% of traffic to v2, promote on healthy metrics
trafficSplit:
  v1: 95
  v2: 5
```

**Say it:** "I pick by blast-radius tolerance versus infrastructure cost — canary for the smallest blast radius when I have the metrics to trust it, blue-green when instant rollback matters more than double infra cost, rolling as the solid default."
**Red flag:** Choosing all-at-once deployment for a production service "to keep it simple" — that's optimizing for pipeline simplicity at the cost of the one thing deployment strategy exists to protect: uptime during a bad release.

### CI CD Best Practices Templates And Hooks
**They ask:** "How do you keep a CI/CD pipeline maintainable across 20+ services instead of copy-pasted YAML everywhere?"

Copy-pasted pipeline config is a maintenance trap — a fix to the security-scan step means editing 20 files, and drift between them is inevitable. Reusable templates/includes (GitLab CI `include:`, GitHub Actions reusable workflows, shared Jenkins libraries) centralize the common stages so every service inherits the same lint/test/build/deploy shape, and a fix in one place propagates everywhere.

Hooks are the other lever — pre-commit and pre-push hooks catch cheap problems (formatting, secrets scanning) *before* they ever reach CI, which is strictly cheaper than discovering them in a pipeline run.

```yaml
# .gitlab-ci.yml
include:
  - project: 'platform/ci-templates'
    file: 'node-service.yml'
```

**Say it:** "I centralize pipeline logic into shared templates so a change to one stage doesn't mean editing every service's YAML — copy-paste pipelines are technical debt the moment there's a second service."
**Red flag:** Maintaining near-identical pipeline YAML across a dozen repos with no shared template — the first cross-cutting change (say, a new security scan) becomes a dozen separate PRs instead of one.

## Config Management & IaC

### Configuration Management From Scripts To Tools
**They ask:** "What's the actual difference between a shell script and a CM manifest, and when does a team need to graduate from one to the other?"

A script is imperative — it describes the *steps* to reach a state, and it's only correct if it's idempotent by careful hand-coding (checking "does this already exist" before every action). A manifest (Ansible playbook, Puppet manifest, Chef recipe) is declarative — you describe the *desired state*, and the tool figures out what actions are needed to get there, safely re-runnable by design.

Ansible is agentless (SSH-based, easiest to adopt incrementally); Puppet and Chef use a pull model with an agent and a central server, which scales better for large, continuously-enforced fleets but costs more to set up. Salt sits in between with fast pub-sub messaging for near-real-time execution across thousands of nodes.

```yaml
# ansible playbook — declarative desired state
- name: ensure nginx is installed and running
  hosts: web
  tasks:
    - apt: { name: nginx, state: present }
    - service: { name: nginx, state: started, enabled: true }
```

**Say it:** "A script describes steps and has to be hand-made idempotent; a CM manifest describes desired state and the tool guarantees idempotency — I reach for CM the moment 'run this script twice safely' becomes a real question."
**Red flag:** Running the same imperative shell script repeatedly across a fleet for configuration drift fixes — without idempotency checks, re-running it can double-apply changes or fail on a state it didn't expect.

### Infrastructure As Code And GitOps
**They ask:** "Why IaC over a runbook of manual console clicks, and what does GitOps add on top of plain IaC?"

IaC's core guarantee is reproducibility: infrastructure defined in version-controlled code means every environment is provisioned from the same source, diffs are reviewable in a PR, and "what changed in prod last Tuesday" has an actual git-blame answer instead of living in someone's memory of clicking through a console.

```hcl
resource "aws_instance" "web" {
  count         = 3
  ami           = var.ami_id
  instance_type = "t3.medium"
  tags = { Name = "web-${count.index}" }
}
```

GitOps takes IaC further: instead of a human or CI job pushing changes *to* infrastructure, a controller running *in* the cluster continuously reconciles live state against what's declared in a git repo — git becomes the single source of truth, and drift (someone manually `kubectl edit`-ing something) gets auto-corrected back to match git rather than silently persisting.

**Say it:** "IaC makes infrastructure changes reviewable and reproducible; GitOps closes the loop by having a controller continuously reconcile live state against git, so manual drift gets corrected automatically instead of silently diverging."
**Red flag:** Treating IaC as "done" once resources are defined in Terraform but still allowing manual console changes on top — that's the exact drift GitOps exists to eliminate, and plain IaC alone doesn't catch it after the fact.

### QA Testing Frameworks And Quality Gates
**They ask:** "What quality gates do you wire into a pipeline before code reaches production, and how do you decide what's a hard gate versus a warning?"

QA exists to catch defects before a user does, and different test types catch different classes of bugs at different costs — unit tests are cheap and fast (run on every commit), integration tests catch cross-component issues (run pre-merge), and end-to-end/contract tests are the most expensive but catch what only shows up when real systems talk to each other (run pre-deploy, sparingly).

A quality gate turns a metric into a pass/fail pipeline decision — coverage threshold, zero critical vulnerabilities from a security scan, performance budget not regressed. The judgment call is which gates are *hard* (block the merge/deploy) versus advisory: a hard gate on "no critical CVEs" is defensible; a hard gate on "100% coverage" usually just produces low-value tests written to satisfy the number.

**Say it:** "I make gates hard when a failure represents real risk — security, broken build, failing tests — and advisory when the metric is a proxy that can be gamed, like raw coverage percentage."
**Red flag:** Enforcing a hard 100% coverage gate — it doesn't measure test *quality*, and teams under that gate write brittle tests just to hit the number instead of testing what actually matters.

### CI/CD Tool Comparison — Jenkins, GitLab CI, GitHub Actions
**They ask:** "Jenkins, GitLab CI, GitHub Actions, CircleCI — what actually differs, and how would you choose for a new project?"

The split that matters is self-hosted-and-flexible versus managed-and-opinionated. Jenkins is self-hosted with a massive plugin ecosystem — it can do almost anything, but that flexibility means *you* own the server, its uptime, plugin version drift, and security patching; a stale Jenkins plugin is a common real-world CVE source. GitLab CI and GitHub Actions are managed, config-as-YAML, tightly integrated with their own SCM — GitHub Actions in particular wins on ecosystem for anything already hosted on GitHub, with a large marketplace of reusable actions. CircleCI is a managed third-party option that trades SCM lock-in for a faster, more polished UI and orbs (its version of reusable config packages).

The practical axis to name in an interview: **maintenance burden vs control**. A small team on GitHub gets the fastest time-to-first-pipeline with GitHub Actions and zero infra to run. A regulated enterprise with on-prem requirements or deeply custom build logic that no managed YAML schema can express often still lands on self-hosted Jenkins, accepting the operational cost for full control.

**Say it:** "The real trade-off isn't feature lists, it's who owns the server — Jenkins gives you full control at the cost of running and patching it yourself, while GitHub Actions/GitLab CI/CircleCI are managed and get you running fastest, which is why I default to the managed option unless there's a concrete reason — on-prem, compliance, exotic build logic — that needs Jenkins's control. Managed just moves the risk, it doesn't remove it: reusable actions/orbs, third-party dependencies, self-hosted runners, and credential misconfig are still supply-chain exposure I have to review."
**Red flag:** Recommending Jenkins for a new project "because it's the industry standard" without naming the operational cost. Jenkins's plugin ecosystem is also its biggest liability — an unpatched plugin is a recurring real-world attack vector. Managed CI/CD reduces that burden but doesn't eliminate it — treating a marketplace action or orb as automatically trustworthy is the same mistake in a different wrapper.
