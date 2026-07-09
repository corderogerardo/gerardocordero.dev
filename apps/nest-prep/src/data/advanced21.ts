// Batch 21 — Streams & backpressure: the four stream types (Readable/Writable/Duplex/Transform), piece-by-piece vs load-it-all-into-memory, what backpressure IS and how Node signals it (.write() returning false, pause/resume, highWaterMark), why pipe()/stream.pipeline() is the senior answer (wires backpressure + error propagation end-to-end), for await...of consumption, and the NestJS StreamableFile angle.
import type { Flashcard } from "./flashcards";
import type { QuizQuestion } from "./quiz";

export const ADVANCED21_FLASHCARDS: Flashcard[] = [
  {
    id: "a21-stream-types-1",
    category: "node",
    categoryLabel: "Node.js Core",
    question: `What are the four stream types in Node, and what does each one do?`,
    answerHtml: `<p><b>Readable</b> — a source you pull data <i>from</i> (<code>fs.createReadStream</code>, an HTTP request, <code>process.stdin</code>). <b>Writable</b> — a sink you push data <i>to</i> (<code>fs.createWriteStream</code>, an HTTP response, <code>process.stdout</code>). <b>Duplex</b> — both at once over independent read/write channels (a TCP <code>net.Socket</code>). <b>Transform</b> — a Duplex where the output is a function of the input (<code>zlib.createGzip</code>, a CSV parser, a cipher); you write chunks in and read transformed chunks out. The mental model: streams move data <b>piece-by-piece</b> through a pipeline instead of materializing the whole payload at once.</p>`,
  },
  {
    id: "a21-piece-by-piece-2",
    category: "node",
    categoryLabel: "Node.js Core",
    question: `Why process piece-by-piece with a stream instead of reading the whole thing into memory first?`,
    answerHtml: `<p>Because memory cost becomes <b>constant instead of proportional to payload size</b>. <code>fs.readFile('10gb.csv')</code> tries to hold all 10 GB as a Buffer in RAM — it OOM-crashes the process, or at best spikes heap and stalls the event loop. A stream holds only a small window (one chunk plus the buffer) at a time, so the same 10 GB flows through in a few MB of working memory. <b>Pitch:</b> "Buffering scales your memory with your biggest input; streaming decouples them — that's the difference between a service that survives a 2 GB upload and one that falls over on it." <b>Red flag:</b> reaching for <code>readFile</code>/<code>JSON.stringify</code> on anything whose size you don't control.</p>`,
  },
  {
    id: "a21-when-streams-win-3",
    category: "node",
    categoryLabel: "Node.js Core",
    question: `Name concrete cases where streaming clearly beats buffering.`,
    answerHtml: `<ul><li><b>Large files</b> — parse or transform a multi-GB CSV/log/export without loading it all (line-by-line or chunk-by-chunk).</li><li><b>Proxying / piping</b> — relay an upstream response straight to a client (<code>upstream.pipe(res)</code>) so bytes forward as they arrive, with no full copy in your process.</li><li><b>Real-time data</b> — anything unbounded or open-ended: a live log tail, a socket feed, an AI response streamed token-by-token — there's no "whole thing" to buffer.</li></ul><p>Rule of thumb: if the payload is large, unbounded, or you're just a conduit, stream it.</p>`,
  },
  {
    id: "a21-backpressure-def-4",
    category: "node",
    categoryLabel: "Node.js Core",
    question: `What IS backpressure, and what happens if you ignore it?`,
    answerHtml: `<p>Backpressure is the condition where a <b>Writable consumer can't keep up with a Readable producer</b> — e.g. reading a file from a fast local disk and writing it to a slow network socket. If you naively loop <code>readable.on('data', chunk =&gt; writable.write(chunk))</code> and ignore what <code>write()</code> tells you, the unwritten chunks pile up in the Writable's internal buffer <b>without bound</b>. Memory balloons until the process OOMs. Backpressure handling means the producer <b>slows down or pauses</b> when the consumer signals it's full — matching throughput to the slowest link. <b>Pitch:</b> "Backpressure is flow control for bytes: the fast side has to listen to the slow side, or you've just built an unbounded in-memory queue."</p>`,
  },
  {
    id: "a21-write-returns-false-5",
    category: "node",
    categoryLabel: "Node.js Core",
    question: `How does Node signal backpressure at the low level — what does writable.write() return and what do you do about it?`,
    answerHtml: `<p><code>writable.write(chunk)</code> returns a <b>boolean</b>: <code>true</code> means "keep going," <code>false</code> means "my internal buffer is at or over <code>highWaterMark</code> — stop sending." The correct manual protocol: when <code>write()</code> returns <code>false</code>, call <code>readable.pause()</code>, then wait for the writable's <code>'drain'</code> event before calling <code>readable.resume()</code>. That pause/resume cycle is exactly what stops the producer from outrunning the consumer. Getting this loop right by hand is fiddly and easy to leak — which is why almost nobody writes it manually (see the <code>pipeline()</code> card).</p>`,
  },
  {
    id: "a21-highwatermark-6",
    category: "node",
    categoryLabel: "Node.js Core",
    question: `What is highWaterMark, and what does tuning it actually trade off?`,
    answerHtml: `<p><code>highWaterMark</code> is the buffer threshold (bytes for binary streams, default 64 KB; object count for object-mode) at which a Writable's <code>write()</code> starts returning <code>false</code> and a Readable stops pulling more from its source. It's a <b>throughput-vs-memory knob</b>: a larger value buffers more before applying backpressure — fewer pause/resume cycles and better throughput on fast consumers, but more memory per stream and more sensitivity to a slow consumer. Smaller keeps memory tight at the cost of more frequent flow-control churn. It's a tuning parameter, <b>not</b> a substitute for handling backpressure — it only sets <i>where</i> the signal fires, not whether you obey it.</p>`,
  },
  {
    id: "a21-pipeline-7",
    category: "node",
    categoryLabel: "Node.js Core",
    question: `Why is stream.pipeline() (or pipe()) the senior answer for wiring streams together?`,
    answerHtml: `<p>Because it wires <b>both</b> backpressure <b>and</b> error propagation end-to-end, so you never hand-roll the <code>write()===false</code> / <code>pause</code> / <code>drain</code> / <code>resume</code> dance. <code>pipeline()</code> also fixes <code>pipe()</code>'s biggest footgun: if any stage errors, it <b>destroys every stream in the chain</b> (no leaked file descriptors or half-open sockets) and surfaces one error. The promise form reads cleanly:</p><pre><code>import { pipeline } from 'node:stream/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import { createGzip } from 'node:zlib';

await pipeline(
  createReadStream('big.csv'),
  createGzip(),
  createWriteStream('big.csv.gz'),
); // backpressure + errors handled end-to-end</code></pre><p><b>Red flag:</b> chaining <code>.pipe().pipe()</code> with no error handling — a mid-chain error leaks the other streams.</p>`,
  },
  {
    id: "a21-pipe-vs-pipeline-8",
    category: "node",
    categoryLabel: "Node.js Core",
    question: `What's the practical difference between readable.pipe(writable) and stream.pipeline()?`,
    answerHtml: `<p>Both propagate backpressure. The difference is <b>error handling and cleanup</b>. <code>.pipe()</code> does <i>not</i> forward errors and does <i>not</i> auto-destroy the other streams on failure — an error on the source leaves the destination open (a classic fd/socket leak), and you'd have to attach <code>'error'</code> handlers to every stream yourself. <code>pipeline()</code> takes the whole chain, destroys <b>all</b> streams if any one errors, and gives you a single completion signal (callback or promise). <b>Pitch:</b> "<code>pipe</code> handles backpressure but not failure; <code>pipeline</code> handles both — in production you reach for <code>pipeline</code>."</p>`,
  },
  {
    id: "a21-stream-promises-9",
    category: "node",
    categoryLabel: "Node.js Core",
    question: `What does node:stream/promises give you over the callback-style stream API?`,
    answerHtml: `<p><code>node:stream/promises</code> exposes promise-returning <code>pipeline()</code> and <code>finished()</code>, so stream completion becomes <code>await</code>-able and drops straight into <code>async</code>/<code>await</code> with normal <code>try/catch</code> — no callback nesting, no manual <code>'end'</code>/<code>'error'</code> wiring. <code>await pipeline(src, xform, dest)</code> resolves when the whole chain finishes and rejects (after destroying every stream) if any stage errors. It's the idiomatic modern way to run a stream to completion inside an async function, including inside a NestJS service method.</p>`,
  },
  {
    id: "a21-for-await-10",
    category: "node",
    categoryLabel: "Node.js Core",
    question: `How does for await...of let you consume a Readable, and what does it handle for you?`,
    answerHtml: `<p>A Readable is an <b>async iterable</b>, so <code>for await (const chunk of readable) { ... }</code> pulls one chunk at a time and <code>await</code>s your body before requesting the next. Because the loop only asks for the next chunk once the current one is processed, it applies backpressure to the source <b>for free</b> — no manual <code>pause</code>/<code>resume</code>. It also integrates with <code>try/catch</code> and cleans up on <code>break</code>/throw. It's the cleanest way to read line-by-line or record-by-record when you need per-chunk logic that a <code>pipeline()</code> transform would make awkward:</p><pre><code>for await (const line of rl) {
  await handle(line); // loop paces the source to your speed
}</code></pre>`,
  },
  {
    id: "a21-object-mode-11",
    category: "node",
    categoryLabel: "Node.js Core",
    question: `What is object mode, and when do you need it in a stream pipeline?`,
    answerHtml: `<p>By default streams carry <code>Buffer</code>/<code>string</code> chunks and <code>highWaterMark</code> counts <b>bytes</b>. In <code>objectMode: true</code>, each chunk is an arbitrary JS value and <code>highWaterMark</code> counts <b>objects</b> instead. You need it when a Transform emits structured records rather than bytes — e.g. a CSV parser that reads byte chunks and pushes parsed row objects downstream, or a stage that maps DB rows to DTOs. The rule: the moment a chunk stops being raw bytes and becomes a domain object, that stream (and everything downstream of it) must be in object mode.</p>`,
  },
  {
    id: "a21-nest-streamablefile-12",
    category: "node",
    categoryLabel: "Node.js Core",
    question: `How do you stream a file from a NestJS controller, and why StreamableFile instead of returning a Buffer?`,
    answerHtml: `<p>Wrap a Readable in <code>StreamableFile</code> and return it; Nest pipes it to the HTTP response and applies backpressure through the socket automatically:</p><pre><code>import { StreamableFile } from '@nestjs/common';
import { createReadStream } from 'node:fs';

@Get('report')
getReport(): StreamableFile {
  const file = createReadStream('big-report.pdf');
  return new StreamableFile(file); // set type/disposition via @Header or the options arg
}</code></pre><p>Returning a <code>Buffer</code> loads the entire file into heap first — fine for a 4 KB avatar, an OOM risk for a multi-GB export and it delays the first byte until the whole thing is read. <code>StreamableFile</code> forwards bytes as they're read, so memory stays flat and time-to-first-byte is low. Nest also handles destroying the stream if the client disconnects. <b>Pitch:</b> "Return a stream, not a Buffer, whenever the file size isn't small and bounded."</p>`,
  },
  {
    id: "a21-transform-backpressure-13",
    category: "node",
    categoryLabel: "Node.js Core",
    question: `In a Transform stream, how does backpressure flow through it, and what breaks it?`,
    answerHtml: `<p>A Transform sits in the middle: it's a Writable to its upstream and a Readable to its downstream, so backpressure <b>propagates through it in both directions</b>. If the downstream consumer is slow, the Transform's readable side fills, which makes its writable side apply backpressure to the upstream producer — the whole chain paces to the slowest link. What breaks it: doing <b>unbounded async buffering inside <code>_transform</code></b> (e.g. pushing every row into an array, or firing off unlimited concurrent async work per chunk) — that sidesteps the stream's own buffer and reintroduces the memory blowup streams were supposed to prevent. Respect <code>push()</code>'s return value and the callback timing.</p>`,
  },
];

export const ADVANCED21_QUIZ: QuizQuestion[] = [
  {
    id: "a21-qz-1",
    category: "node",
    categoryLabel: "Node.js Core",
    question: `Which stream type reads input and produces transformed output as a function of that input (e.g. gzip)?`,
    options: [`Readable`, `Writable`, `Duplex`, `Transform`],
    answer: 3,
    explanationHtml: `<p>A <b>Transform</b> is a Duplex whose readable output is derived from its writable input — you write chunks in and read transformed chunks out. <code>zlib.createGzip()</code>, cipher streams, and CSV parsers are Transforms. A plain Duplex (like a TCP socket) has independent read and write channels with no such relationship.</p>`,
  },
  {
    id: "a21-qz-2",
    category: "node",
    categoryLabel: "Node.js Core",
    question: `What does writable.write(chunk) returning false tell you?`,
    options: [
      `The write failed and the chunk was dropped`,
      `The stream has already ended`,
      `The internal buffer is at/over highWaterMark — pause the producer until 'drain'`,
      `The chunk was the wrong type for the stream`,
    ],
    answer: 2,
    explanationHtml: `<p><code>false</code> is the backpressure signal: the Writable's buffer has hit <code>highWaterMark</code>. The chunk was still accepted, but you should stop writing (<code>readable.pause()</code>) and wait for the <code>'drain'</code> event before resuming. It is <b>not</b> an error or a dropped write.</p>`,
  },
  {
    id: "a21-qz-3",
    category: "node",
    categoryLabel: "Node.js Core",
    question: `You chain three streams with sourceStream.pipe(transform).pipe(dest) and the source errors mid-flight. What's the problem versus using stream.pipeline()?`,
    options: [
      `Nothing — .pipe() destroys all streams on error just like pipeline()`,
      `.pipe() doesn't forward the error or auto-destroy the other streams, so dest can leak (open fd/socket); pipeline() destroys the whole chain and surfaces one error`,
      `.pipe() ignores backpressure, while pipeline() adds it`,
      `pipeline() is slower because it copies every chunk into an intermediate buffer`,
    ],
    answer: 1,
    explanationHtml: `<p>Both propagate backpressure. The difference is failure handling: <code>.pipe()</code> doesn't forward errors or clean up the other streams, so an error mid-chain can leave a destination stream open (a leaked file descriptor or socket). <code>pipeline()</code> destroys every stream in the chain on any error and gives you a single completion signal.</p>`,
  },
  {
    id: "a21-qz-4",
    category: "node",
    categoryLabel: "Node.js Core",
    question: `Why does for await (const chunk of readable) apply backpressure to the source without any manual pause/resume?`,
    options: [
      `It buffers the entire stream first, then iterates in memory`,
      `It sets highWaterMark to 0 automatically`,
      `The loop only requests the next chunk after the awaited body finishes, so the source is paced to the consumer's speed`,
      `Async iterators disable the internal stream buffer entirely`,
    ],
    answer: 2,
    explanationHtml: `<p>A Readable is an async iterable, and <code>for await...of</code> pulls one chunk, <code>await</code>s your loop body, then asks for the next. Because the next pull only happens once the current chunk is processed, the source naturally slows to match the consumer — backpressure with no manual <code>pause()</code>/<code>resume()</code>.</p>`,
  },
  {
    id: "a21-qz-5",
    category: "node",
    categoryLabel: "Node.js Core",
    question: `A NestJS controller must return a 2 GB report file to the client. What's the right return value?`,
    options: [
      `Read it with fs.readFile and return the Buffer`,
      `Return a StreamableFile wrapping fs.createReadStream(path)`,
      `JSON.stringify the file contents and return the string`,
      `Load it into memory once and cache the Buffer for all requests`,
    ],
    answer: 1,
    explanationHtml: `<p>Return <code>new StreamableFile(createReadStream(path))</code>. Nest pipes it to the response, forwarding bytes as they're read so memory stays flat and time-to-first-byte is low, and destroys the stream if the client disconnects. Returning a <code>Buffer</code> would load all 2 GB into the heap first — an OOM risk and a latency hit.</p>`,
  },
];
