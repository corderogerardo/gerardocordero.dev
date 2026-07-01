// Spoken pitches — intros, "why Next.js", a technical deep-dive, STAR stories.
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
      "<p>Hi, I'm [name] — a frontend / full-stack engineer with [X] years building with React, and the last [Y] focused on Next.js and the App Router. I build web apps that feel fast and hold up under real traffic.</p>" +
      "<p>Most recently I [shipped / owned] [a product or surface] — [one concrete thing: e.g. a checkout flow, a marketing site, a dashboard] — used by [scale: e.g. tens of thousands of visitors a day], with a focus on rendering strategy, performance, and clean component boundaries.</p>" +
      "<p>I'm drawn to this role because it's senior, frontend-focused, and Next.js at its core.</p>",
    tipsHtml:
      "<span class=\"lbl\">Delivery &amp; pronunciation</span> Keep it a handshake, not a biography. Land on three concrete nouns (the product, the scale, the stack). Pronounce <i>Next.js</i> as “next-dot-J-S” (or just “Next”), <i>Vercel</i> as “ver-SELL”, <i>Turbopack</i> as “TUR-bo-pack”, <i>hydration</i> normally, not “hy-DRAY-shun” rushed. Smile on the last line — it signals genuine interest.",
  },
  {
    id: "p2",
    num: "Pitch 02",
    title: "The 60-second intro",
    metaHtml:
      "<span class=\"pill\">“Tell me about yourself” — full</span><span class=\"pill accent\">~60 sec</span>",
    scriptHtml:
      "<p>I'm [name], a frontend / full-stack engineer with [X] years in JavaScript and TypeScript, the last [Y] building product in Next.js and React.</p>" +
      "<p>What I do well: I design <b>component architecture that scales</b> — clear boundaries between Server and Client Components, sensible data-fetching patterns, and layouts that don't force a full page re-render for a small change. I make deliberate rendering and caching decisions instead of defaulting to “just make it a client component,” and I care about what the user actually feels: load time, interactivity, layout stability.</p>" +
      "<p>A recent highlight: [a specific project — what it did, your role, and one measurable result, e.g. cut LCP by 1.2s, dropped the client bundle by 40%, or moved a page from client-rendered to streamed and users noticed].</p>" +
      "<p>I'm looking for a senior frontend role where I can own rendering and performance decisions and raise the team's bar — which is exactly what this looks like.</p>",
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
      "<p>Start at the arc, not the resume. [I started building static sites / plain React SPAs, and moved toward frameworks because I got tired of solving routing and data-fetching from scratch on every project.]</p>" +
      "<p>Then 2–3 chapters, each one sentence of context + one thing you're proud of: <i>“At [company] I [built X], which taught me [Y].”</i> Show a progression — more ownership, bigger surfaces, more say in how things render.</p>" +
      "<p>Land on the present: <i>“Now I'm strongest at [rendering/caching strategy / performance / component architecture], and I want a role where I [own the frontend platform / mentor / scale a design system].”</i> Tie it back to this job.</p>",
    tipsHtml:
      "<span class=\"lbl\">Delivery</span> This is a <b>story with a through-line</b>, not a chronological dump. Pick the thread (e.g. “increasing ownership of frontend systems”) and make every chapter advance it. Practice the last sentence until it's crisp — it's what they remember.",
  },
  {
    id: "p4",
    num: "Pitch 04",
    title: "Why Next.js (and this stack)",
    metaHtml:
      "<span class=\"pill\">“Why do you like Next.js?”</span><span class=\"pill accent\">~45 sec</span>",
    scriptHtml:
      "<p>Plain React (or CRA) gets you components but leaves routing, data fetching, and rendering strategy entirely up to you — every team reinvents them slightly differently. Next.js gives me <b>file-system routing and a real rendering model</b> out of the box, so those decisions are consistent instead of ad hoc.</p>" +
      "<p>Concretely: Server Components mean a lot of my UI never ships as JavaScript at all — the bundle only carries what's actually interactive. The built-in caching and revalidation story lets me choose static, dynamic, or somewhere in between per route, deliberately. And it's one framework that carries a project from a weekend prototype all the way to a production app without a rewrite.</p>" +
      "<p>It scales from a marketing page to a full application without changing the mental model — that's rare and valuable.</p>",
    tipsHtml:
      "<span class=\"lbl\">Delivery</span> Contrast (plain React → Next.js) is persuasive. Don't bash React — frame Next as “React with a rendering and routing story.” If they use Remix or another meta-framework, mention you'd evaluate it on the same axes: rendering control, caching, and developer experience.",
  },
  {
    id: "p5",
    num: "Pitch 05",
    title: "Why this company / role",
    metaHtml:
      "<span class=\"pill\">“Why us?”</span><span class=\"pill accent\">~45 sec</span>",
    scriptHtml:
      "<p>Three honest reasons, tailored: <b>(1) the problem</b> — [what they're building and why it's interesting to you]; <b>(2) the technical fit</b> — [their stack/scale matches what I do: Next.js, [their rendering approach], [their scale]]; <b>(3) the role</b> — [senior ownership / the team / remote / the product surface].</p>" +
      "<p>Close with a forward-looking line: <i>“I'd want to spend my first weeks understanding [their core user flow] and finding where rendering or performance work has the most leverage.”</i></p>",
    tipsHtml:
      "<span class=\"lbl\">Delivery</span> Specificity is everything — name their product, a recent launch, or something from the JD. Generic “you're a great company” reads as no homework. Have one concrete, informed observation ready — ideally something you noticed by actually loading their site and checking the network tab.",
  },
  {
    id: "p6",
    num: "Pitch 06",
    title: "Technical deep-dive: RSC + the App Router mental model",
    metaHtml:
      "<span class=\"pill\">“Explain how the App Router works”</span><span class=\"pill accent\">~90 sec</span>",
    scriptHtml:
      "<p>Two things define the App Router: the <b>Server/Client Component split</b> and the <b>RSC payload</b>.</p>" +
      "<p>By default every component is a Server Component — it renders on the server (or at build time) and never ships its JavaScript to the browser. Add \"use client\" and a component opts into the client bundle, which is what lets it use state, effects, and browser APIs. The rule of thumb: push interactivity to the leaves and keep everything above it on the server.</p>" +
      "<p>The RSC payload is the serialized description of the server-rendered tree — not HTML, a compact format the client uses to reconcile. That's how a Server Component can render deep in a Client Component's tree via children without becoming client code itself. Knowing exactly which parts of a page ship JS, and why, is what separates “it works” from “I designed this deliberately.”</p>",
    tipsHtml:
      "<span class=\"lbl\">Delivery</span> This is the answer that proves seniority. Say the Server/Client boundary rule without hesitating — drill it. If they want depth, branch into how Server Components can be passed as children to Client Components without a client/server boundary violation. Sketch the tree with your hands as you talk; it helps you and them.",
  },
  {
    id: "p7",
    num: "Pitch 07",
    title: "STAR: a performance problem you fixed",
    metaHtml:
      "<span class=\"pill\">“Tell me about a hard bug”</span><span class=\"pill accent\">~90 sec</span>",
    scriptHtml:
      "<p><b>Situation:</b> [a page / flow] was [slow to load / janky on interaction] — [LCP was at X seconds / the bundle was Y KB / users were bouncing before it finished loading].</p>" +
      "<p><b>Task:</b> I owned finding and fixing the root cause without a rewrite.</p>" +
      "<p><b>Action:</b> I profiled instead of guessing — [ran Lighthouse / opened Chrome DevTools' performance panel / checked Vercel Analytics] and found [the cause: a client component that didn't need to be one / an unoptimized image / a waterfall of sequential fetches / a huge unused dependency]. I [converted it to a Server Component / used next/image / parallelized the fetches / removed the dependency], and added [a bundle-size check / a Lighthouse budget in CI] so it can't silently regress.</p>" +
      "<p><b>Result:</b> [LCP dropped from X to Y / bundle shrank by Z%], and the regression check means the win sticks.</p>",
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
      "<p><b>Situation:</b> we had to [choose between X and Y — e.g. SSR vs. static generation, a client state library vs. leaning on Server Components, one Next.js app vs. splitting into micro-frontends].</p>" +
      "<p><b>Task:</b> I had to make the call and get the team aligned.</p>" +
      "<p><b>Action:</b> I framed it by the constraints that actually mattered — [content freshness, team size, deploy cadence, SEO requirements] — and named the trade-off explicitly: <i>“[option A] buys us [benefit] at the cost of [downside].”</i> I [prototyped both / benchmarked the rendering cost / wrote a short doc] and recommended [the choice], with a fallback if [assumption] proved wrong.</p>" +
      "<p><b>Result:</b> [outcome], and because I'd written the trade-off down, we didn't relitigate it every sprint.</p>",
    tipsHtml:
      "<span class=\"lbl\">Delivery</span> Seniors are hired for judgment under uncertainty. Show you chose <i>deliberately</i> and named the cost — not that you picked the trendy option. “I'd make the same call again, and here's the one thing I'd watch” is a strong close.",
  },
  {
    id: "p9",
    num: "Pitch 09",
    title: "Explain it simply: Server Components vs. Client Components",
    metaHtml:
      "<span class=\"pill\">“Explain X to a junior”</span><span class=\"pill accent\">~60 sec</span>",
    scriptHtml:
      "<p>Think of a restaurant. A <b>Server Component</b> is food the kitchen preps before the doors even open — it's ready, it doesn't need the customer there, and nothing about assembling it has to happen at the table. A <b>Client Component</b> is a made-to-order dish at a live station — it has to happen in front of the customer because it reacts to what they choose right then.</p>" +
      "<p>Most of a menu can be prepped ahead. Only the parts that truly depend on the customer's live choices — clicking, typing, toggling — need that live station. That's why we default to Server Components and only reach for \"use client\" when something genuinely needs to run in the browser.</p>" +
      "<p>The payoff: the more you prep ahead, the less the customer waits at the table — which, translated back, means less JavaScript the browser has to download and run.</p>",
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
      "<p>“What's the rendering strategy on your main product today — mostly static, dynamic, streamed — and what's the biggest pain point with it?”</p>" +
      "<p>“How do you track Core Web Vitals and performance budgets, and what happens when a PR regresses one?”</p>" +
      "<p>“What does testing and CI look like for the frontend — unit, e2e, visual regression?”</p>" +
      "<p>“Where is the frontend paying down tech debt right now, and where would I have the most leverage early?”</p>",
    tipsHtml:
      "<span class=\"lbl\">Delivery</span> Asking about rendering strategy, performance budgets, and testing shows you think like an owner. Avoid only asking about perks. Listen to the answer and follow up — it should feel like a conversation, not a checklist.",
  },
];
