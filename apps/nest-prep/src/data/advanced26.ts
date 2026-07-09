// Batch 26 — AWS for Node.js: Lambda (Firecracker microVM, scale-to-zero, cold starts, memory-scales-CPU, Powertools), the Lambda vs Fargate vs EC2 compute decision, S3/DynamoDB/RDS data choices, SQS vs SNS fan-out, API Gateway, IAM least-privilege, and the hybrid Lambda+Fargate serverless pattern.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";

export const ADVANCED26_FLASHCARDS: Flashcard[] = [
  {
    id: "a26-lambda-model-1",
    category: "aws",
    categoryLabel: "AWS & Cloud",
    question: `What is the execution model of a Node.js Lambda function, and what does "scales to zero" actually buy you?`,
    answerHtml: `<p>Each Lambda invocation runs your single-threaded Node process inside a <b>Firecracker microVM</b> — a lightweight, strongly-isolated VM AWS spins up per concurrent execution. Concurrency is horizontal: 100 simultaneous requests means up to 100 microVMs, each handling exactly one event at a time. "Scales to zero" means when there's no traffic there are no running instances and you pay nothing — no idle server to keep warm. That's the killer property for spiky or low-volume workloads: a webhook handler that fires twice a day costs cents, not a month of EC2. <b>Pitch it:</b> "Lambda trades steady-state efficiency for zero idle cost and zero capacity planning — perfect when traffic is bursty or unpredictable."</p>`,
  },
  {
    id: "a26-lambda-coldstart-2",
    category: "aws",
    categoryLabel: "AWS & Cloud",
    question: `What is a Lambda cold start, roughly how long is it for Node.js, and what actually drives it?`,
    answerHtml: `<p>A cold start is the latency of standing up a fresh microVM and initializing your function: download/unpack the code, boot the Node runtime, then run your module-level init (imports, DB pool creation, SDK clients) before the handler runs. For Node it's typically <b>~100–500ms</b>, dominated by init code and bundle size — not the runtime boot itself. Every subsequent invocation on that warm instance skips all of it. <b>Levers:</b> shrink the bundle (tree-shake, bundle with esbuild), lazy-load heavy SDK clients you don't always need, keep init cheap, and reach for <b>provisioned concurrency</b> only when p99 latency on a user-facing path genuinely can't tolerate the occasional cold start. <b>Red flag:</b> "just add provisioned concurrency" as the reflex answer — it reintroduces the idle cost Lambda exists to avoid.</p>`,
  },
  {
    id: "a26-lambda-memory-cpu-3",
    category: "aws",
    categoryLabel: "AWS & Cloud",
    question: `Why is Lambda's memory setting the most misunderstood tuning knob, and what's a sane default?`,
    answerHtml: `<p>On Lambda, <b>memory linearly scales CPU</b> (and network/IO) — it's the only lever you have. Setting 128MB doesn't just cap memory, it starves your function of CPU, so a CPU-bound task can run <i>slower and cost more</i> at low memory because it runs longer. Around <b>1024MB you get roughly 1 full vCPU</b>, which makes it a good default for typical Node request/JSON work. The right move is to <b>profile with AWS Lambda Power Tuning</b> across memory sizes and pick the cost/latency knee — don't guess. <b>Red flag:</b> "I set it to 128MB to save money." That's cargo-cult thrift; the bill is memory × duration, and more memory often finishes fast enough to be cheaper.</p>`,
  },
  {
    id: "a26-lambda-powertools-4",
    category: "aws",
    categoryLabel: "AWS & Cloud",
    question: `What is Lambda Powertools and why reach for it instead of hand-rolling logging/tracing?`,
    answerHtml: `<p><b>AWS Lambda Powertools for TypeScript</b> is a batteries-included utility library for the three things every serious Lambda needs: <b>structured JSON logging</b> (correlation IDs, cold-start flag, sampling), <b>tracing</b> (X-Ray subsegments with one decorator/middleware), and <b>custom metrics</b> (EMF — embed metrics in logs, no extra API calls). It saves you re-inventing observability per function and gives you a consistent, queryable log shape across the whole fleet. <b>Pitch it:</b> "Powertools makes observability the default, not an afterthought — structured logs and traces from day one instead of <code>console.log</code> archaeology at 3am."</p>`,
  },
  {
    id: "a26-lambda-alarms-5",
    category: "aws",
    categoryLabel: "AWS & Cloud",
    question: `Why should you alarm on Lambda error RATE rather than raw error count, and what else is worth alarming on?`,
    answerHtml: `<p>Raw error <i>count</i> scales with traffic — 50 errors is a crisis at 100 req/min and noise at 100k req/min. Alarming on the <b>error rate</b> (errors ÷ invocations) makes the alarm meaningful at any scale and stops it from screaming every time traffic spikes. Pair it with alarms on <b>Throttles</b> (you hit a concurrency limit), <b>Duration p99 approaching the timeout</b>, and <b>DLQ/async delivery failures</b>. <b>Red flag:</b> a static "alert if errors &gt; 10" threshold — it's simultaneously too noisy under load and too quiet at low traffic, so people mute it and miss the real incident.</p>`,
  },
  {
    id: "a26-compute-decision-6",
    category: "aws",
    categoryLabel: "AWS & Cloud",
    question: `Give the decision framework for Lambda vs Fargate vs EC2. When does each win?`,
    answerHtml: `<p>Think in terms of <b>traffic shape and control</b>:</p>
<ul><li><b>Lambda</b> — event-driven, spiky, or bursty work that can live within the constraints (15-min max, single event per instance, cold starts). Scales to zero, no capacity planning. Great for APIs behind API Gateway, webhooks, queue consumers, cron.</li>
<li><b>Fargate</b> — <b>warm serverless containers</b>: you run a normal long-lived Node process (Express/Nest) with no server to patch, but you <b>pay for idle</b>. Best for steady-state traffic, long-running or always-on workers, WebSocket servers, and anything that would fight Lambda's 15-min/cold-start/statelessness limits.</li>
<li><b>EC2</b> — when you need what serverless won't give you: <b>GPUs, &gt;4 vCPU or &gt;30GB RAM per task, custom kernels/drivers, or bin-packing many processes</b> onto reserved capacity for cost at large steady scale.</li></ul>
<p><b>Pitch it:</b> "Lambda for spiky and event-driven, Fargate for steady-state containers, EC2 only when I need special hardware or maximum control."</p>`,
  },
  {
    id: "a26-lambda-fargate-crossover-7",
    category: "aws",
    categoryLabel: "AWS & Cloud",
    question: `People quote a "~1.5M requests/month" crossover where Fargate beats Lambda on cost. How should a senior engineer treat that number?`,
    answerHtml: `<p>As a <b>rough intuition, not a rule</b>. The crossover exists because Lambda's pay-per-invocation model gets expensive once you're running near-continuously, while Fargate's fixed hourly container is cheaper when it's busy most of the time. But the actual break-even is entirely a function of <b>your memory size, average duration, and traffic pattern</b> — a 128MB/50ms function and a 1769MB/8s function cross over at wildly different volumes, and bursty traffic keeps Lambda winning far past any headline figure because Fargate would sit idle between bursts. <b>The senior answer:</b> "I've seen ~1.5M req/mo cited, but I wouldn't plan on it — I'd model my own workload's memory, duration, and traffic shape, because the crossover moves by an order of magnitude depending on those." <b>Red flag:</b> quoting the number as settled truth.</p>`,
  },
  {
    id: "a26-s3-patterns-8",
    category: "aws",
    categoryLabel: "AWS & Cloud",
    question: `What are the three S3 patterns every Node backend engineer should reach for, and why?`,
    answerHtml: `<ul><li><b>Presigned URLs</b> — the client uploads/downloads <i>directly</i> to/from S3 using a time-limited signed URL your backend generates. Bytes never pass through your Node process, so you don't burn Lambda duration or Fargate bandwidth streaming files, and you sidestep API Gateway's payload limits.</li>
<li><b>Multipart / resumable uploads</b> — split large objects into parts uploaded in parallel and retried independently; essential for big files and flaky mobile networks, and the only sane way to move multi-GB objects.</li>
<li><b>CloudFront in front</b> — a CDN cache over the bucket for low-latency global reads, TLS, and origin protection (lock the bucket to the CloudFront origin so nobody hits S3 directly).</li></ul>
<p><b>Red flag:</b> proxying uploads through your app server "so I can validate them" — validate via a presigned POST policy or an S3-triggered Lambda, not by turning your API into a file pipe.</p>`,
  },
  {
    id: "a26-dynamodb-9",
    category: "aws",
    categoryLabel: "AWS & Cloud",
    question: `What does "design DynamoDB around access patterns" mean, and why is partition-key choice the whole ballgame?`,
    answerHtml: `<p>DynamoDB gives you <b>single-digit-millisecond</b> reads/writes at any scale — but only if you model the table around the <b>queries you'll run</b>, not the entities you have. Unlike SQL, you don't get ad-hoc joins or arbitrary filters cheaply; you enumerate your access patterns up front and design keys (and GSIs) so each pattern is a direct key lookup. The <b>partition key</b> determines how data is sharded: a well-distributed key spreads load evenly, while a <b>hot key</b> (e.g. everything under one tenant, or a <code>status=ACTIVE</code> value) funnels traffic to one partition and throttles. <b>Pitch it:</b> "In Dynamo I design the table backwards from the queries — access patterns first, then keys — because a bad partition key is a scaling cliff you hit in production, not a schema you migrate later." <b>Red flag:</b> treating Dynamo like a relational DB and reaching for <code>Scan</code> + filter.</p>`,
  },
  {
    id: "a26-rds-10",
    category: "aws",
    categoryLabel: "AWS & Cloud",
    question: `When do you pick RDS over DynamoDB, and what are Multi-AZ and read replicas actually for?`,
    answerHtml: `<p>Pick <b>RDS</b> (managed Postgres/MySQL) when you need <b>relational integrity, ad-hoc queries, joins, transactions, and a mature SQL ecosystem</b> — most CRUD business apps. Two features people conflate: <b>Multi-AZ</b> is for <b>availability</b> — a synchronous standby in another AZ that AWS fails over to automatically on instance/AZ failure; it does <i>not</i> serve reads. <b>Read replicas</b> are for <b>read scaling</b> — asynchronous copies you point read-heavy traffic at, accepting mild replication lag. <b>Red flag:</b> "we added a read replica for high availability" — that's mixing the two; the replica is async and can be stale, Multi-AZ is the HA story. <b>Node gotcha:</b> Lambda + RDS means connection-pool exhaustion under scale — reach for <b>RDS Proxy</b> or Dynamo instead.</p>`,
  },
  {
    id: "a26-sqs-sns-11",
    category: "aws",
    categoryLabel: "AWS & Cloud",
    question: `SQS vs SNS — what's the core difference, and why do you often combine them?`,
    answerHtml: `<p><b>SQS is a queue</b>: messages sit durably until <i>one</i> consumer pulls and processes them (point-to-point, buffered, retried, with a DLQ for poison messages). <b>SNS is pub/sub</b>: a message published to a topic is pushed <i>immediately</i> to every subscriber (fan-out), with no buffering or per-subscriber retry durability on its own. The classic pattern is <b>SNS → multiple SQS queues (the "fan-out" pattern)</b>: SNS broadcasts one event to N topics-subscribers, each an SQS queue owned by a different service, so every consumer gets a <b>durable, independently-retryable, independently-paced</b> copy. <b>Pitch it:</b> "SNS decouples the publisher from how many consumers exist; SQS gives each consumer durability and back-pressure. Together you get durable fan-out — one publish, N services that can each fail and retry without losing the event."</p>`,
  },
  {
    id: "a26-api-gateway-12",
    category: "aws",
    categoryLabel: "AWS & Cloud",
    question: `What does API Gateway handle so your Node function doesn't have to?`,
    answerHtml: `<p>API Gateway is the managed front door between the internet and your Lambda/Fargate backend. It offloads cross-cutting concerns at the edge: <b>throttling &amp; rate limiting</b> (per-key usage plans that shed load before it reaches your function), <b>authorization</b> (Cognito, JWT, or a custom Lambda authorizer that runs before your handler), <b>request validation</b> (reject malformed payloads against a schema so bad input never invokes your code), plus TLS, CORS, and API keys. <b>Pitch it:</b> "API Gateway is where I put auth, throttling, and validation so my function only ever sees authenticated, well-formed, rate-limited requests — the function does business logic, the gateway does the gatekeeping." <b>Red flag:</b> re-implementing rate limiting inside the Lambda, where it still costs you an invocation to reject the request.</p>`,
  },
  {
    id: "a26-iam-least-privilege-13",
    category: "aws",
    categoryLabel: "AWS & Cloud",
    question: `What does IAM least-privilege look like in practice, and what's the difference between function-level and task-level roles?`,
    answerHtml: `<p>Least-privilege means each compute unit gets an IAM role scoped to <b>exactly the actions and resources it needs</b> — this function may <code>dynamodb:PutItem</code> on <i>this one table's ARN</i>, nothing more. In Lambda that's the <b>function's execution role</b>: ideally one narrow role <i>per function</i>, not a shared "app can do everything" role. In ECS/Fargate that's the <b>task role</b> (permissions your container code uses), kept distinct from the <b>task execution role</b> (permissions ECS itself needs to pull the image and write logs). <b>Pitch it:</b> "One narrow role per function or per task, scoped to specific ARNs — so a compromised function can't pivot into the rest of the account." <b>Red flag:</b> a wildcard <code>Resource: "*"</code> or a single fat role reused across every function — that's the blast radius that turns one bug into an account-wide incident.</p>`,
  },
  {
    id: "a26-hybrid-pattern-14",
    category: "aws",
    categoryLabel: "AWS & Cloud",
    question: `Describe the hybrid Lambda + Fargate serverless architecture and why you'd split a system that way.`,
    answerHtml: `<p>You don't have to pick one — mature serverless systems run <b>Lambda for the spiky, event-driven edges and Fargate for the steady-state core</b>. Concretely: API Gateway → <b>Lambda</b> for request/response endpoints, webhooks, and cron; <b>SNS/SQS/EventBridge</b> gluing services together; and <b>Fargate</b> for the workloads that fight Lambda's limits — long-running jobs beyond 15 minutes, always-on workers draining a queue, WebSocket/streaming servers, or anything CPU-heavy enough that per-invocation billing hurts. <b>Pitch it:</b> "I match each workload to the runtime that fits its traffic shape — Lambda where scale-to-zero and burst handling win, Fargate where a long-lived warm container is cheaper and simpler — and wire them together with queues and topics so each piece scales and fails independently." That's the senior move: not "serverless vs containers," but the <b>right tool per workload</b> inside one system.</p>`,
  },
];

export const ADVANCED26_QUIZ: QuizQuestion[] = [
  {
    id: "a26-qz-1",
    category: "aws",
    categoryLabel: "AWS & Cloud",
    question: `Your Node.js Lambda is CPU-bound (image resizing) and you set it to 128MB "to save money." It runs slowly and the bill is high. What's the most likely fix?`,
    options: [
      `Split the work across two 128MB functions to parallelize`,
      `Increase the memory setting, because on Lambda memory linearly scales CPU — more memory can finish faster and cost less`,
      `Switch the function to ARM but keep 128MB`,
      `Add provisioned concurrency to remove the slowness`,
    ],
    answer: 1,
    explanationHtml: `<p>On Lambda, memory is the only performance knob and it <b>linearly scales CPU</b>. At 128MB a CPU-bound task is starved of CPU, so it runs longer — and since you pay memory × duration, it can cost <i>more</i> than a higher-memory setting that finishes fast. Profile with Lambda Power Tuning and pick the cost/latency knee (often around 1024MB ≈ 1 vCPU or higher for CPU work). Provisioned concurrency addresses cold starts, not per-invocation compute speed.</p>`,
  },
  {
    id: "a26-qz-2",
    category: "aws",
    categoryLabel: "AWS & Cloud",
    question: `A candidate says "Fargate is cheaper than Lambda above ~1.5M requests/month, so we should migrate." What's the best senior response?`,
    options: [
      `Agree and migrate immediately — 1.5M is the industry-standard break-even`,
      `The crossover is real but heavily dependent on memory size, duration, and traffic shape, so model your own workload rather than trusting a headline number`,
      `Disagree — Fargate is never cheaper than Lambda at any scale`,
      `The number only applies to Python Lambdas, not Node.js`,
    ],
    answer: 1,
    explanationHtml: `<p>A crossover exists because Lambda's per-invocation cost adds up near continuous load while Fargate's fixed hourly container is cheaper when busy — but the actual break-even moves by an order of magnitude with your <b>memory, average duration, and traffic pattern</b>. Bursty traffic keeps Lambda winning far past any headline figure because a Fargate container would sit idle between bursts. The senior move is to model the specific workload, not treat ~1.5M req/mo as settled truth.</p>`,
  },
  {
    id: "a26-qz-3",
    category: "aws",
    categoryLabel: "AWS & Cloud",
    question: `You need to broadcast an "order placed" event so that three independent services (email, analytics, fulfillment) each process it durably and can retry on their own. What's the standard AWS pattern?`,
    options: [
      `A single SQS queue that all three services poll`,
      `SNS topic fanning out to three separate SQS queues, one per service`,
      `Three SNS topics the order service publishes to sequentially`,
      `An RDS table the services poll for new rows`,
    ],
    answer: 1,
    explanationHtml: `<p>The durable fan-out pattern is <b>SNS → multiple SQS queues</b>. SNS pub/sub broadcasts one publish to every subscriber; giving each service its <b>own SQS queue</b> subscription means each gets a durable, independently-retryable, independently-paced copy (with its own DLQ). A single shared SQS queue is point-to-point — only one consumer gets each message — so it can't fan out to three services.</p>`,
  },
  {
    id: "a26-qz-4",
    category: "aws",
    categoryLabel: "AWS & Cloud",
    question: `Which statement about RDS Multi-AZ vs read replicas is correct?`,
    options: [
      `Multi-AZ serves read traffic from the standby to scale reads; read replicas provide automatic failover`,
      `Multi-AZ is a synchronous standby for automatic failover (availability) and does not serve reads; read replicas are asynchronous copies for read scaling and can be stale`,
      `Both serve reads and both provide automatic failover — they're interchangeable`,
      `Read replicas are synchronous and Multi-AZ is asynchronous`,
    ],
    answer: 1,
    explanationHtml: `<p><b>Multi-AZ</b> = availability: a synchronous standby in another AZ that AWS fails over to automatically; it does <i>not</i> serve read traffic. <b>Read replicas</b> = read scaling: asynchronous copies you direct read-heavy traffic to, accepting some replication lag (so reads can be stale). Conflating them ("we added a replica for HA") is a common red flag — the replica is async and not a failover target the way the Multi-AZ standby is.</p>`,
  },
  {
    id: "a26-qz-5",
    category: "aws",
    categoryLabel: "AWS & Cloud",
    question: `A single Lambda execution role grants "dynamodb:*" on all resources ("Resource": "*") and is reused across every function in the account. Why is this a problem?`,
    options: [
      `It's fine — one shared role is easier to manage and has no security downside`,
      `It violates least-privilege: any compromised function can touch every DynamoDB table, making the blast radius the whole account instead of one table`,
      `Wildcard resources make Lambda cold starts slower`,
      `DynamoDB rejects wildcard IAM policies, so the functions won't work at all`,
    ],
    answer: 1,
    explanationHtml: `<p>Least-privilege means each function's execution role is scoped to <b>exactly the actions and specific resource ARNs it needs</b>. A wildcard <code>dynamodb:*</code> on <code>Resource: "*"</code> shared across all functions means a bug or compromise in <i>one</i> function can read/write/delete <i>every</i> table — the blast radius becomes the entire account. The fix is one narrow role per function, scoped to specific table ARNs and specific actions (e.g. just <code>PutItem</code> on one table).</p>`,
  },
];
