// Spoken pitches — intros, "why NestJS", a technical deep-dive, STAR stories.
// Generic senior-candidate framing: fill the [bracketed] placeholders with your own detail.
export type Pitch = {
  id: string;
  num: string;
  title: string;
  metaHtml: string;
  scriptHtml: string;
  tipsHtml: string;
};

export const PITCHES_INTRO_HTML =
  "<span class=\"lbl\">How to practice</span> Don't memorize word-for-word — it sounds robotic. Learn the <b>shape</b> of each answer (the beats), then say it in your own words and swap the [brackets] for your real detail. Record, watch once, fix one thing, record again. Three takes beats thirty re-reads.";

export const PITCHES: Pitch[] = [
  {
    id: "p1",
    num: "Pitch 01",
    title: "The 30-second intro",
    metaHtml:
      "<span class=\"pill\">“Tell me about yourself” — short</span><span class=\"pill accent\">~30 sec</span>",
    scriptHtml:
      "<p>Hi, I'm [name] — a backend engineer with [X] years in Node.js and the last [Y] focused on NestJS and TypeScript. I build and scale APIs and services.</p>" +
      "<p>Most recently I [shipped / owned] [a service or domain] — [one concrete thing: e.g. an auth service, a payments pipeline, a GraphQL API] — handling [scale: e.g. a few thousand RPS], with a focus on clean module boundaries, testing, and observability.</p>" +
      "<p>I'm drawn to this role because it's senior, backend-focused, and NestJS at its core.</p>",
    tipsHtml:
      "<span class=\"lbl\">Delivery &amp; pronunciation</span> Keep it a handshake, not a biography. Land on three concrete nouns (the domain, the scale, the stack). Pronounce <i>Nest</i> as “nest”, <i>NestJS</i> as “nest-J-S”, <i>Fastify</i> as “FAST-ify”, <i>Prisma</i> as “PRIZ-ma”. Smile on the last line — it signals genuine interest.",
  },
  {
    id: "p2",
    num: "Pitch 02",
    title: "The 60-second intro",
    metaHtml:
      "<span class=\"pill\">“Tell me about yourself” — full</span><span class=\"pill accent\">~60 sec</span>",
    scriptHtml:
      "<p>I'm [name], a backend / full-stack engineer with [X] years in JavaScript and TypeScript, the last [Y] building services in NestJS on Node.</p>" +
      "<p>What I do well: I design <b>modular, testable</b> services — clear module boundaries, dependency injection, validated DTOs — and I care about what happens after deploy: structured logging, tracing, graceful shutdown, and not blocking the event loop. I'm comfortable across the data layer (Postgres with TypeORM/Prisma, Redis), auth (JWT + RBAC), and async work (queues, events).</p>" +
      "<p>A recent highlight: [a specific project — what it did, your role, and one measurable result, e.g. cut p99 latency by 40% or shipped a microservice that handles N events/day].</p>" +
      "<p>I'm looking for a senior backend role where I can own architecture and raise the team's bar — which is exactly what this looks like.</p>",
    tipsHtml:
      "<span class=\"lbl\">Delivery</span> Three beats: who you are → what you're good at → one proof point. Pause after the proof point. Don't list every technology — name the ones in <i>their</i> job description.",
  },
  {
    id: "p3",
    num: "Pitch 03",
    title: "The 2-minute career story",
    metaHtml:
      "<span class=\"pill\">“Walk me through your background”</span><span class=\"pill accent\">~2 min</span>",
    scriptHtml:
      "<p>Start at the arc, not the resume. [I started in [frontend/full-stack], moved to backend because I liked owning the data and the contracts.]</p>" +
      "<p>Then 2–3 chapters, each one sentence of context + one thing you're proud of: <i>“At [company] I [built X], which taught me [Y].”</i> Show a progression — more ownership, bigger systems, more impact.</p>" +
      "<p>Land on the present: <i>“Now I'm strongest at [DI-driven service design / performance / distributed systems], and I want a role where I [own architecture / mentor / scale a platform].”</i> Tie it back to this job.</p>",
    tipsHtml:
      "<span class=\"lbl\">Delivery</span> This is a <b>story with a through-line</b>, not a chronological dump. Pick the thread (e.g. “increasing ownership of backend systems”) and make every chapter advance it. Practice the last sentence until it's crisp — it's what they remember.",
  },
  {
    id: "p4",
    num: "Pitch 04",
    title: "Why NestJS (and this stack)",
    metaHtml:
      "<span class=\"pill\">“Why do you like NestJS?”</span><span class=\"pill accent\">~45 sec</span>",
    scriptHtml:
      "<p>Express is great but unopinionated — large apps drift into spaghetti. NestJS gives me <b>structure and dependency injection</b> on top of Node's HTTP layer, so the architecture is consistent and testable from day one.</p>" +
      "<p>Concretely: the module system enforces boundaries, DI makes everything mockable, and the request pipeline — guards, interceptors, pipes, filters — gives me clean places for auth, validation, and cross-cutting concerns. And because it's TypeScript end-to-end, the compiler catches whole classes of bugs.</p>" +
      "<p>It scales from a modular monolith to microservices without changing the programming model — that's rare and valuable.</p>",
    tipsHtml:
      "<span class=\"lbl\">Delivery</span> Contrast (Express → Nest) is persuasive. Don't bash Express — frame Nest as “Express with an architecture.” If they use Fastify, mention Nest is adapter-agnostic and you'd reach for Fastify on throughput-critical services.",
  },
  {
    id: "p5",
    num: "Pitch 05",
    title: "Why this company / role",
    metaHtml:
      "<span class=\"pill\">“Why us?”</span><span class=\"pill accent\">~45 sec</span>",
    scriptHtml:
      "<p>Three honest reasons, tailored: <b>(1) the problem</b> — [what they're building and why it's interesting to you]; <b>(2) the technical fit</b> — [their stack/scale matches what I do: NestJS, [their data stack], [their scale]]; <b>(3) the role</b> — [senior ownership / the team / remote / the domain].</p>" +
      "<p>Close with a forward-looking line: <i>“I'd want to spend my first weeks understanding [their core service] and finding where I can add leverage fastest.”</i></p>",
    tipsHtml:
      "<span class=\"lbl\">Delivery</span> Specificity is everything — name their product, a recent launch, or something from the JD. Generic “you're a great company” reads as no homework. Have one concrete, informed observation ready.",
  },
  {
    id: "p6",
    num: "Pitch 06",
    title: "Technical deep-dive: DI + the request lifecycle",
    metaHtml:
      "<span class=\"pill\">“Explain how NestJS works”</span><span class=\"pill accent\">~90 sec</span>",
    scriptHtml:
      "<p>Two things define Nest: <b>dependency injection</b> and the <b>request lifecycle</b>.</p>" +
      "<p>DI: classes declare what they need in the constructor, and the IoC container provides it. The type is the token; at bootstrap Nest builds the dependency graph and instantiates bottom-up, caching singletons. That's why everything is loosely coupled and trivially mockable in tests.</p>" +
      "<p>The lifecycle: a request flows through <b>middleware → guards → interceptors → pipes → the handler → interceptors again → exception filters</b>. Each has a job — guards do authorization, pipes validate and transform, interceptors wrap the handler for things like caching and timeouts, filters shape errors. Knowing that order lets me put each concern in exactly the right place.</p>",
    tipsHtml:
      "<span class=\"lbl\">Delivery</span> This is the answer that proves seniority. Say the lifecycle order without hesitating — drill it. If they want depth, branch into REQUEST-scope bubbling or the Reflector for RBAC. Keep your hands moving left-to-right as you list the pipeline; it helps you and them.",
  },
  {
    id: "p7",
    num: "Pitch 07",
    title: "STAR: a performance problem you fixed",
    metaHtml:
      "<span class=\"pill\">“Tell me about a hard bug”</span><span class=\"pill accent\">~90 sec</span>",
    scriptHtml:
      "<p><b>Situation:</b> [an endpoint / service] was [slow / timing out] under load — [p99 jumped to X / it fell over at Y RPS].</p>" +
      "<p><b>Task:</b> I owned finding and fixing the root cause without a rewrite.</p>" +
      "<p><b>Action:</b> I measured instead of guessing — [checked event-loop lag / read traces / captured a flamegraph] and found [the cause: an N+1 query / blocking CPU work / a missing index / unbounded concurrency]. I [batched the query with a DataLoader / moved the work to a worker thread / added the index / bounded concurrency], and added [a cache / a regression test].</p>" +
      "<p><b>Result:</b> [p99 dropped from X to Y / throughput Nx'd], and I added an alert on [loop lag / p99] so it can't silently regress.</p>",
    tipsHtml:
      "<span class=\"lbl\">Delivery</span> The signature line is <i>“I profiled instead of guessing.”</i> Lead with the metric and end with the metric. Keep Action the longest part. If you don't have a dramatic story, a real small one told precisely beats an invented big one.",
  },
  {
    id: "p8",
    num: "Pitch 08",
    title: "STAR: a tough technical trade-off",
    metaHtml:
      "<span class=\"pill\">“A decision you'd defend”</span><span class=\"pill accent\">~90 sec</span>",
    scriptHtml:
      "<p><b>Situation:</b> we had to [choose between X and Y — e.g. monolith vs microservice, SQL vs NoSQL, sync vs queue].</p>" +
      "<p><b>Task:</b> I had to make the call and get the team aligned.</p>" +
      "<p><b>Action:</b> I framed it by the constraints that actually mattered — [scale, consistency, team size, deadline] — and named the trade-off explicitly: <i>“[option A] buys us [benefit] at the cost of [downside].”</i> I [prototyped / benchmarked / wrote a short ADR] and recommended [the choice], with a fallback if [assumption] proved wrong.</p>" +
      "<p><b>Result:</b> [outcome], and because I'd documented the trade-off, we didn't relitigate it later.</p>",
    tipsHtml:
      "<span class=\"lbl\">Delivery</span> Seniors are hired for judgment under uncertainty. Show you chose <i>deliberately</i> and named the cost — not that you picked the trendy option. “I'd make the same call again, and here's the one thing I'd watch” is a strong close.",
  },
  {
    id: "p9",
    num: "Pitch 09",
    title: "Explain it simply: the event loop",
    metaHtml:
      "<span class=\"pill\">“Explain X to a junior”</span><span class=\"pill accent\">~60 sec</span>",
    scriptHtml:
      "<p>Node runs your JavaScript on a <b>single thread</b>. Think of one chef in a kitchen: they can start many dishes (network calls, file reads) and let the ovens (the OS and a small thread pool) cook in the background, checking back when something's ready. That's why Node handles thousands of slow I/O operations at once.</p>" +
      "<p>The catch: if the chef stops to chop a mountain of vegetables by hand — a heavy CPU task — every other dish waits. That's <b>blocking the event loop</b>. So we keep CPU-heavy work off that thread: worker threads or a queue.</p>" +
      "<p>That single mental model — great at waiting, bad at grinding — explains most Node performance advice.</p>",
    tipsHtml:
      "<span class=\"lbl\">Delivery</span> The ability to teach simply <i>is</i> the senior signal (the Feynman test). One analogy, carried all the way through, beats five technical terms. Watch the interviewer nod before you add detail.",
  },
  {
    id: "p10",
    num: "Pitch 10",
    title: "Questions to ask them",
    metaHtml:
      "<span class=\"pill\">“Any questions for us?”</span><span class=\"pill accent\">~always</span>",
    scriptHtml:
      "<p>Always have 3–4 ready. Good ones signal seniority:</p>" +
      "<p>“What does the service architecture look like today — modular monolith, microservices, somewhere in between — and what's the biggest pain point?”</p>" +
      "<p>“How do you handle testing, CI/CD, and observability? What's the on-call story?”</p>" +
      "<p>“What would success in this role look like in the first 90 days?”</p>" +
      "<p>“Where is the codebase paying down tech debt, and where would I have the most leverage early?”</p>",
    tipsHtml:
      "<span class=\"lbl\">Delivery</span> Asking about architecture, testing, and on-call shows you think like an owner. Avoid only asking about perks. Listen to the answer and follow up — it should feel like a conversation, not a checklist.",
  },
  {
    id: "p11",
    num: "Pitch 11",
    title: "Express vs Fastify vs NestJS",
    metaHtml:
      "<span class=\"pill\">“Which framework, and why?”</span><span class=\"pill accent\">~75 sec</span>",
    scriptHtml:
      "<p>They map to different needs. <b>Express</b> is the universal, unopinionated middleware layer — great for BFFs, webhooks, and thin proxies. <b>Fastify</b> is the throughput play: schema-based serialization and plugin encapsulation. <b>NestJS</b> is the structure play: modules, DI, and a request pipeline that scales with the team and the codebase.</p>" +
      "<p>On speed — I quote the numbers, but honestly. The official fastify/benchmarks hello-world run has Fastify around <b>45,140 req/s</b> vs Express around <b>10,702</b> — about 4.5× in <i>that</i> run; other benchmarks land closer to 2–3×. But the repo itself says those numbers “do not pretend to represent a real-world scenario,” and they run on noisy shared CI hardware, so results vary. I treat them as <b>directional</b>, never a headline.</p>" +
      "<p>Because in a real workload the framework is rarely the bottleneck — the database, downstream calls, and business logic dominate. So I pick on <b>team fit and structure</b>, and reach for NestJS. And if a specific service is genuinely throughput-critical, Nest runs on the <b>Fastify adapter</b> and recovers most of that speed — I don't have to choose.</p>",
    tipsHtml:
      "<span class=\"lbl\">Delivery</span> Say the benchmark numbers, then immediately undercut them with the repo's own disclaimer — that self-correction is the senior signal; a candidate who quotes “4.5× faster” as fact reads as junior. <span class=\"lbl\">Red flag</span> Never let the pitch land on raw req/s. Land it on “the DB dominates real workloads” and “Nest-on-Fastify means I don't have to trade structure for speed.” Pronounce <i>Fastify</i> “FAST-ify.”",
  },
  {
    id: "p12",
    num: "Pitch 12",
    title: "The trade-off formula",
    metaHtml:
      "<span class=\"pill\">Meta-skill: how to frame any answer</span><span class=\"pill accent\">reusable</span>",
    scriptHtml:
      "<p>The senior meta-skill isn't knowing the answer — it's <b>framing the decision</b>. One sentence, every time: <i>“Option A optimizes X at the cost of Y; given constraints Z, I'd choose ___ and revisit if [threshold].”</i></p>" +
      "<p>Concretely, say they ask whether to run a heavy export inline or on a queue: <i>“Doing it synchronously optimizes simplicity and immediate feedback, at the cost of holding a request open and risking timeouts under load. Queuing it optimizes resilience and throughput, at the cost of eventual-consistency complexity and a job-status UX. Given our export runs a few seconds and traffic is spiky, I'd queue it — and I'd revisit the sync path only if p95 job latency drops under a second and volume stays low.”</i></p>" +
      "<p>Notice what that does: it names both costs, ties the choice to a real constraint, and gives a measurable trigger to reopen it — p95/p99 latency, error rate, cost per request. That's the difference between “I picked the queue” and “I made a decision I can defend and unwind.”</p>",
    tipsHtml:
      "<span class=\"lbl\">Delivery</span> Drill the formula until it's reflexive — it works for any question, not just this one. Always attach a <b>numeric threshold</b> to the “revisit if” clause; a vague “we'd reconsider later” wastes the whole move. <span class=\"lbl\">Red flag</span> Picking the trendy option and defending it after the fact. Seniors are hired for judgment under uncertainty — show you weighed the cost <i>before</i> choosing.",
  },
  {
    id: "p13",
    num: "Pitch 13",
    title: "A CARL story skeleton",
    metaHtml:
      "<span class=\"pill\">Behavioral: structure any story</span><span class=\"pill accent\">≤3 min</span>",
    scriptHtml:
      "<p>Use <b>CARL — Context, Actions, Results, Learnings</b>. The Learnings beat is what STAR misses, and it's the one that signals maturity: it shows you reflect, not just execute. Lead with your <b>largest-scope</b> story even if it's not a literal match, and quantify the impact.</p>" +
      "<p><b>Context:</b> [the system + the stakes — e.g. [service] was [failing / at a decision point] affecting [X users / $Y / a deadline]; I owned [scope].]</p>" +
      "<p><b>Actions:</b> [what <i>you</i> did — the framework you used, the alternatives you rejected and why, who you aligned. “I [measured / benchmarked / wrote an ADR], chose [X] over [Y] because [constraint].”]</p>" +
      "<p><b>Results:</b> [the measurable outcome — “[metric] moved from [A] to [B]” / “[incident] resolved in [N] with a blameless post-mortem and owners assigned.”]</p>" +
      "<p><b>Learnings:</b> [what you'd do differently and what you carried forward — “I'd [change] earlier; since then I [new practice].”]</p>",
    tipsHtml:
      "<span class=\"lbl\">Delivery</span> Keep it under 3 minutes — Actions is the longest beat, Context the shortest. Lead with scope and the framework, close on the metric. <span class=\"lbl\">Red flag</span> Describing <i>what the team</i> did instead of what <b>you</b> did, and skipping Learnings — that omission is what makes a strong-actions story still read as mid-level. A small real story told precisely beats an inflated one.",
  },
];
