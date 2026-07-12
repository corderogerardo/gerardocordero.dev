# Node.js — streams

### The four stream types
**They ask:** "Node has four kinds of streams — Readable, Writable, Duplex, Transform — what's each for?"

Streams exist so you never have to hold an entire resource (a file, an HTTP body, a DB result set) in memory at once — you process it in chunks as they arrive. **Readable** is a source you read chunks from (`fs.createReadStream`, an incoming HTTP request body). **Writable** is a sink you write chunks to (`fs.createWriteStream`, an outgoing HTTP response). **Duplex** is both independently — reading and writing are separate channels that don't have to relate (a TCP socket). **Transform** is a Duplex where what you write *becomes* what you read, transformed (`zlib.createGzip`, a CSV-to-JSON converter).

```js
fs.createReadStream('in.txt')       // Readable
  .pipe(zlib.createGzip())          // Transform
  .pipe(fs.createWriteStream('in.txt.gz')); // Writable
```

**Say it:** "Readable and Writable are one-directional; Duplex is both directions independently; Transform is a Duplex where the output is a function of the input — that's the whole taxonomy, and everything in Node's stream-based APIs is one of those four."
**Red flag:** Calling a `net.Socket` "just a Readable" — a socket is Duplex, and treating it as read-only misses that you can write back on the same connection.

### Backpressure
**They ask:** "What is backpressure in streams, and what happens if you ignore it?"

Backpressure is the mechanism that keeps a fast producer from overwhelming a slow consumer — without it, piping a fast disk read into a slow network write would buffer unboundedly in memory until the process runs out. `writable.write(chunk)` returns `false` when its internal buffer has crossed the `highWaterMark`, which is the stream's signal to "stop pushing, I'm behind" — the producer should pause until the writable emits `'drain'`.

```js
// manual backpressure handling — this is exactly what .pipe() does for you
function pipeManually(readable, writable) {
  readable.on('readable', () => {
    let chunk;
    while ((chunk = readable.read()) !== null) {
      const ok = writable.write(chunk);
      if (!ok) {
        readable.pause();
        writable.once('drain', () => readable.resume()); // 'readable' fires again once resumed
        break;
      }
    }
  });
  readable.on('end', () => writable.end());
}
```

Ignoring the `false` return value and writing anyway doesn't error — it just buffers in memory unboundedly, which is a real, common cause of OOM crashes in Node services that pipe data without respecting the return value.

**Say it:** "Backpressure is write() returning false when the internal buffer is over highWaterMark — respecting it means pausing the source until 'drain', and ignoring it is a slow-motion memory leak that OOMs under real load."
**Red flag:** Not knowing `write()` has a return value at all — using it purely for its side effect and never checking whether the consumer is falling behind.

### pipe() vs pipeline()
**They ask:** "Why does the Node docs recommend stream.pipeline() over manual .pipe() chains?"

`.pipe()` handles backpressure for you, but it does **not** clean up properly on error — if a stream in the middle of a `.pipe()` chain errors, the other streams in the chain are left open (file descriptors leak, sockets stay half-open) unless you manually wire up error listeners on every stream and close the rest yourself. `pipeline()` (from `node:stream`) does that cleanup automatically: if any stream in the chain errors or one side closes early, every other stream in the chain is destroyed, and it gives you one callback (or a promise via `stream/promises`) for the whole operation instead of scattered `'error'` listeners.

```js
const { pipeline } = require('node:stream/promises');

await pipeline(
  fs.createReadStream('big.csv'),
  csvParser(),
  fs.createWriteStream('out.json')
); // any failure anywhere cleans up every stream in the chain
```

**Say it:** "pipe() handles backpressure but leaks resources on error unless you wire up cleanup by hand; pipeline() does the same piping plus guarantees every stream in the chain is destroyed on any failure — that's why it's the recommended default now."
**Red flag:** Chaining several `.pipe()` calls in production code with no `'error'` listener on any of them — an error on any stream but the last one is silently swallowed and the process just hangs with leaked handles.

### Object mode streams
**They ask:** "What is object mode in streams, and when would you use it?"

By default a stream operates on `Buffer`/`string` chunks — it's built for bytes. Object mode (`{ objectMode: true }`) lets a stream's chunks be *any* JS value, including whole objects, which is what turns streams into a general-purpose "process one item at a time without buffering the whole collection" pipeline — not just an I/O primitive.

```js
const { Transform } = require('node:stream');

const toUpperName = new Transform({
  objectMode: true,
  transform(row, enc, cb) {
    cb(null, { ...row, name: row.name.toUpperCase() });
  },
});
// pipe a stream of parsed DB rows through it, one row at a time, no full array in memory
```

This is how libraries like a CSV/JSON row parser or a database cursor wrapper expose "iterate a huge result set without loading it all" as a stream API, reusing the same backpressure and piping machinery bytes-based streams get.

**Say it:** "Object mode swaps the chunk unit from bytes to arbitrary JS values, which is how you get streaming semantics — one item at a time, backpressure included — over things that aren't files or sockets, like a large DB cursor."
**Red flag:** Trying to `.pipe()` a byte stream into an object-mode stream (or vice versa) without a Transform to convert between them — the chunk types don't match and you'll get garbage data or a thrown error.

### Piping streams to compress/transform on the fly
**They ask:** "How would you gzip a file being streamed to an HTTP response without loading it into memory?"

The point is that streaming and transformation compose — you don't read-then-compress-then-send, you build a pipeline where each stage only ever holds one chunk at a time, so memory use stays flat regardless of file size. `zlib.createGzip()` is itself a Transform stream, so it slots directly between a Readable source and a Writable sink.

```js
app.get('/download', (req, res) => {
  res.setHeader('Content-Encoding', 'gzip');
  pipeline(
    fs.createReadStream('large-report.csv'),
    zlib.createGzip(),
    res, // the HTTP response is itself a Writable stream
    (err) => { if (err) console.error('pipeline failed', err); }
  );
});
```

The response object (`res`) being a Writable stream is the detail that makes this work end to end — you're not buffering the compressed output anywhere; each gzip chunk is written to the socket as soon as it's produced.

**Say it:** "zlib.createGzip() is a Transform, and the HTTP response is a Writable, so I just pipeline read → gzip → response — memory stays flat because at any instant only one chunk is in flight through the whole pipeline, no matter how large the file is."
**Red flag:** Reading the whole file into a Buffer, gzipping it with the sync API, then sending it — that defeats the entire point of streaming and reintroduces the exact memory ceiling streams exist to avoid.

### Implementing a custom Transform stream
**They ask:** "How would you implement a custom Transform stream, and what do you have to get right?"

You extend `Transform` and implement `_transform(chunk, encoding, callback)`, which receives one incoming chunk and must call `callback(err, transformedChunkOrNothing)` — calling `callback` is what signals "I'm ready for the next chunk," so forgetting to call it (or calling it twice) stalls or corrupts the pipeline. If you need to emit output that doesn't map 1:1 to input chunks (buffering partial lines until you see a newline, say), use `this.push(data)` inside `_transform` for zero-or-more outputs per input chunk, and implement `_flush(callback)` to emit anything still buffered when the input ends.

```js
class LineSplitter extends Transform {
  constructor() { super({ objectMode: true }); this._buf = ''; }
  _transform(chunk, enc, cb) {
    this._buf += chunk;
    const lines = this._buf.split('\n');
    this._buf = lines.pop(); // keep the incomplete tail
    for (const line of lines) this.push(line);
    cb();
  }
  _flush(cb) {
    if (this._buf) this.push(this._buf);
    cb();
  }
}
```

**Say it:** "_transform must call its callback exactly once per chunk to signal readiness for the next one, push() is for emitting zero-or-more outputs per input, and _flush is where any buffered leftover gets emitted when the source ends — miss any of those three and the stream either stalls or drops data."
**Red flag:** Doing async work inside `_transform` without waiting for it before calling `callback` — the stream will pull the next chunk before your async work finishes, breaking ordering guarantees the whole point of a Transform depends on.

### Error handling across a stream pipeline
**They ask:** "You chain three streams with .pipe(). One errors mid-flight. What happens, and what should you do instead?"

With manual `.pipe()`, there's no coordinated teardown across the chain — an error on an earlier stream isn't automatically forwarded to the ones after it, so if nothing is listening for it, that error is unhandled (and on a stream, an unhandled `'error'` event can crash the process). Meanwhile the other streams in the chain don't know anything went wrong and stay open — file descriptors and sockets leak until you explicitly `destroy()` or `unpipe()` them yourself. That's exactly the failure `stream.pipeline()` was built to fix: it wires an error/completion callback across the whole chain and **destroys every stream that's still active** (streams that already ended or closed are skipped) if any one of them fails or the destination closes early. So the senior answer is "use `pipeline` (or its promise form) as the safer default" — one error cleans up the entire chain instead of you wiring teardown by hand. One HTTP caveat: if the destination is an `http` response, `pipeline` destroys its socket on error, so you can't reliably write an error body afterward — decide the status/body *before* the response starts streaming.

```js
const { pipeline } = require('node:stream/promises');
await pipeline(
  fs.createReadStream('in.gz'),
  zlib.createGunzip(),
  fs.createWriteStream('out.txt'),
); // any stage errors → all streams destroyed, promise rejects
```

**Say it:** "A raw .pipe() chain leaks streams when one errors because the error doesn't propagate — pipeline() destroys every stage on failure and gives me one place to catch it, so that's what I use for anything real."
**Red flag:** Adding a `.on('error')` handler to only the last stream in a `.pipe()` chain. An error on an earlier stream never reaches it, and the earlier streams are never destroyed — you've handled the wrong end of the pipe.


### highWaterMark and stream throughput
**They ask:** "What is highWaterMark, and when would you tune it?"

`highWaterMark` is the buffer threshold that drives backpressure, and it applies to both Readable and Writable streams — it's the number of bytes (or objects, in object mode) a stream will buffer internally before it signals "slow down": on a readable, crossing it pauses further internal reads; on a writable, `.write()` returns `false`. The default is small and version-dependent (64 KB per byte stream on current Node — it was 16 KB on older releases like Node 18; 16 objects in object mode) — a deliberate memory-vs-throughput trade: bigger means fewer, larger reads/writes and higher throughput, at the cost of more memory held per stream. It's a buffering threshold, not a hard memory cap — a stream can still exceed it briefly since a `.write()` in flight or a large chunk isn't rejected, just flagged. You raise it for high-throughput bulk transfer where memory is cheap; you *lower* it when you have thousands of concurrent streams and need to reduce per-stream buffering. It's a tuning knob, not a correctness one — backpressure works at any value.

**Say it:** "highWaterMark is the backpressure threshold for both readable and writable streams — how much each buffers before it tells the other side to slow down. I raise it for bulk throughput and lower it when I have many concurrent streams and need to reduce per-stream buffering."
**Red flag:** Cranking `highWaterMark` way up to "make streams faster" on a server with many concurrent connections — you multiply the buffer by every open stream and can blow the heap under load. The default exists for a reason.
