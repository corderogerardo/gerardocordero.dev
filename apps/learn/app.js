/* PawWalk Academy engine — no dependencies. Lesson data: see lessons/FORMAT.md */
(function () {
  "use strict";

  const COURSE = window.COURSE || [];
  const STORE_KEY = window.STORE_KEY || "pawwalk-academy-v1";

  // ---------- Progress state ----------
  function loadState() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
    catch { return {}; }
  }
  const state = loadState();
  state.done = state.done || {};       // stepKey -> true | "help" | "skip"
  state.reveal = state.reveal || {};   // "mid/lid" -> number of revealed steps
  state.checks = state.checks || {};   // "stepKey/i" -> true (xcode checklist items)
  state.code = state.code || {};       // stepKey -> learner's editor text
  state.review = state.review || {};   // stepKey -> SRS card state (see srsSchedule)
  function save() { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }

  // Python was split out of the iOS shell; carry Python learners' progress
  // forward from the old shared store (course ids scope which keys are "mine").
  function migrateLegacyProgress() {
    try {
      // Only when this store has never existed — "Reset progress" writes "{}" as a
      // tombstone so a reset doesn't resurrect progress from the legacy store.
      if (STORE_KEY === "pawwalk-academy-v1" || localStorage.getItem(STORE_KEY) !== null) return;
      const legacy = JSON.parse(localStorage.getItem("pawwalk-academy-v1"));
      if (!legacy) return;
      const mine = new Set(COURSE.map((m) => m.id));
      let copied = false;
      for (const map of ["done", "reveal", "checks", "code"]) {
        for (const [key, val] of Object.entries(legacy[map] || {})) {
          if (mine.has(key.split("/")[0])) { state[map][key] = val; copied = true; }
        }
      }
      if (copied) save();
    } catch { /* ignore malformed legacy store */ }
  }
  migrateLegacyProgress();

  const sk = (m, l, s) => `${m.id}/${l.id}/${s}`;
  const lk = (m, l) => `${m.id}/${l.id}`;
  const gates = (step) => step.type === "quiz" || step.type === "exercise" || step.type === "xcode";
  const stepDone = (m, l, i) => !!state.done[sk(m, l, i)];
  const lessonDone = (m, l) => (state.reveal[lk(m, l)] || 0) > l.steps.length - 1 &&
    l.steps.every((s, i) => !gates(s) || stepDone(m, l, i));
  const lessonComplete = (m, l) => (state.reveal[lk(m, l)] || 0) >= l.steps.length && lessonDone(m, l);
  const estMin = (l) => Math.max(2, Math.round(l.steps.length * 1.5));

  // ---------- Spaced repetition (SM-2-lite) ----------
  // Ported from apps/portfolio/src/study/srs.ts (pure functions, epoch-day due dates).
  const todayEpochDay = () => Math.floor(Date.now() / 86400000);
  const srsIsDue = (entry, today) => !entry || entry.due <= (today != null ? today : todayEpochDay());
  // grade: "again" (wrong) | "good" (correct first try) — this UI only needs pass/fail.
  function srsSchedule(prev, grade, today) {
    today = today != null ? today : todayEpochDay();
    const ease0 = (prev && prev.ease != null) ? prev.ease : 2.3;
    if (grade === "again") {
      return { reps: 0, interval: 1, ease: Math.max(1.3, ease0 - 0.2), due: today };
    }
    const reps = ((prev && prev.reps) || 0) + 1;
    const ease = ease0;
    let interval;
    if (reps === 1) interval = 2;
    else if (reps === 2) interval = 4;
    else {
      const prevInterval = (prev && prev.interval) || 1;
      interval = Math.max(prevInterval + 1, Math.round(prevInterval * ease));
    }
    return { reps, interval, ease, due: today + interval };
  }

  // ---------- Tiny helpers ----------
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };

  // ---------- Mini markdown (per block) ----------
  function mdInline(s) {
    return esc(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  }
  function mdBlock(block) {
    const lines = block.split("\n");
    if (block.startsWith("```") && block.endsWith("```"))
      return `<pre class="md-code">${esc(block.replace(/^```[^\n]*\n?/, "").replace(/\n?```$/, ""))}</pre>`;
    if (block.startsWith("### ")) return `<h4>${mdInline(block.slice(4))}</h4>`;
    if (block.startsWith("## ")) return `<h3>${mdInline(block.slice(3))}</h3>`;
    if (lines.every((ln) => ln.startsWith("- ")))
      return `<ul>${lines.map((ln) => `<li>${mdInline(ln.slice(2))}</li>`).join("")}</ul>`;
    if (lines.every((ln) => /^\d+\. /.test(ln)))
      return `<ol>${lines.map((ln) => `<li>${mdInline(ln.replace(/^\d+\. /, ""))}</li>`).join("")}</ol>`;
    if (lines.every((ln) => ln.startsWith("> ")))
      return `<blockquote><p>${lines.map((ln) => mdInline(ln.slice(2))).join("<br>")}</p></blockquote>`;
    return `<p>${mdInline(block).replace(/\n/g, "<br>")}</p>`;
  }
  const md = (blocks) => (blocks || []).map(mdBlock).join("");

  // ---------- Syntax highlighting (per language) ----------
  const SWIFT_KW = new Set(("func var let if else guard return switch case default for while in do catch try throw throws " +
    "async await import struct class enum protocol extension init deinit self Self super static final private public " +
    "internal fileprivate open lazy weak unowned mutating nonmutating override required convenience some any nil true false " +
    "as is where defer break continue fallthrough repeat typealias associatedtype indirect inout get set willSet didSet actor").split(" "));
  const PY_KW = new Set(("def return if elif else for while in not and or is None True False import from as class " +
    "try except finally raise with pass break continue lambda yield global nonlocal del assert async await match case").split(" "));
  const KOTLIN_KW = new Set(("fun val var when object data sealed interface suspend override package companion by lazy " +
    "null true false is as in vararg out constructor init if else return for while do try catch finally throw import " +
    "class enum private public internal protected open abstract final lateinit crossinline noinline reified inline " +
    "typealias where super this break continue").split(" "));
  const RUBY_KW = new Set(("def end if elsif else unless case when then while until for in do return yield break next redo retry " +
    "begin rescue ensure raise class module self super nil true false and or not alias defined? require require_relative " +
    "include extend prepend private public protected attr_accessor attr_reader attr_writer new lambda proc loop puts p print gets").split(" "));
  const GO_KW = new Set(("package import func var const type struct interface map chan go defer select return if else for range switch " +
    "case default break continue fallthrough goto nil true false iota make new len cap append copy delete panic recover " +
    "string int int8 int16 int32 int64 uint uint8 uint16 uint32 uint64 uintptr byte rune float32 float64 complex64 complex128 bool error").split(" "));
  // Each language: keyword set + token regex with groups (comment)(string)(attr)(number)(word).
  // Swift and Kotlin share C-style comments/strings/annotations, so they share a token regex.
  const C_STYLE_RE = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\]|\\.)*")|(@\w+|#\w+)|\b(\d[\d_]*(?:\.\d[\d_]*)?)\b|\b([A-Za-z_]\w*)\b/g;
  const LANG = {
    swift: { kw: SWIFT_KW, re: C_STYLE_RE },
    kotlin: { kw: KOTLIN_KW, re: C_STYLE_RE },
    python: {
      kw: PY_KW,
      re: /(#[^\n]*)|((?:[fFrRbBuU]{1,2})?(?:"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'))|(@[\w.]+)|\b(\d[\d_]*(?:\.\d[\d_]*)?)\b|\b([A-Za-z_]\w*)\b/g,
    },
    ruby: {
      kw: RUBY_KW,
      re: /(#(?!\{)[^\n]*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(@@?\w+|\$\w+|:\w+[?!]?)|\b(\d[\d_]*(?:\.\d[\d_]*)?)\b|([A-Za-z_]\w*[?!]?)/g,
    },
    go: {
      kw: GO_KW,
      re: /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\]|\\.)*"|`[^`]*`|'(?:[^'\\]|\\.)*')|(@\w+)|\b(\d[\d_]*(?:\.\d[\d_]*)?)\b|\b([A-Za-z_]\w*)\b/g,
    },
  };
  function highlight(src, lang) {
    const { kw, re } = LANG[lang] || LANG.swift;
    re.lastIndex = 0;
    const out = [];
    let last = 0, mt;
    while ((mt = re.exec(src))) {
      out.push(esc(src.slice(last, mt.index)));
      last = re.lastIndex;
      const [full, com, str, attr, num, word] = mt;
      if (com) out.push(`<span class="tok-com">${esc(com)}</span>`);
      else if (str) out.push(`<span class="tok-str">${esc(str)}</span>`);
      else if (attr) out.push(`<span class="tok-attr">${esc(full)}</span>`);
      else if (num) out.push(`<span class="tok-num">${esc(num)}</span>`);
      else if (word && kw.has(word)) out.push(`<span class="tok-kw">${esc(word)}</span>`);
      else if (word && /^[A-Z]/.test(word)) out.push(`<span class="tok-type">${esc(word)}</span>`);
      else out.push(esc(full));
    }
    out.push(esc(src.slice(last)));
    return out.join("");
  }
  // A step's language: its own `lang`, else the module's `lang`, else Swift.
  const stepLang = (step, m) => step.lang || (m && m.lang) || "swift";
  function codeBlock(source, title, lang) {
    const wrap = el("div", "codeblock");
    if (title) wrap.appendChild(el("div", "code-title", `<span>⌘</span> ${esc(title)}`));
    const pre = el("pre");
    pre.innerHTML = highlight(source.replace(/^\n+|\s+$/g, ""), lang);
    wrap.appendChild(pre);
    if (lang === "python" || lang === "ruby") {
      const bar = title ? wrap.querySelector(".code-title") : el("div", "code-title code-title-run");
      if (!title) wrap.insertBefore(bar, pre);
      const runBtn = el("button", "run-btn", "▶ Run");
      const out = el("pre", "run-out");
      out.style.display = "none";
      runBtn.onclick = () => runCode(source, lang, out);
      bar.appendChild(runBtn);
      wrap.appendChild(out);
    }
    return wrap;
  }

  // ---------- In-browser code execution (Python via Pyodide, Ruby via ruby.wasm) ----------
  // ponytail: main-thread eval; move to a Worker if long-running user code becomes a thing
  const PYODIDE_JS = "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js";
  const RUBY_WASM_UMD = "https://cdn.jsdelivr.net/npm/@ruby/wasm-wasi@2.9.3-2.9.4/dist/browser.umd.js";
  const RUBY_WASM_BINARY = "https://cdn.jsdelivr.net/npm/@ruby/3.4-wasm-wasi@2.9.3-2.9.4/dist/ruby+stdlib.wasm";
  let pyodidePromise = null, rubyVMPromise = null;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error("script load failed: " + src));
      document.head.appendChild(s);
    });
  }

  function getPyodide(statusFn) {
    if (!pyodidePromise) {
      statusFn("Loading Python runtime… (~10 MB, one-time, cached by the browser)");
      pyodidePromise = loadScript(PYODIDE_JS)
        .then(() => window.loadPyodide())
        .then((py) => {
          py.setStdout({ batched: (msg) => py.__out.push(msg) });
          py.setStderr({ batched: (msg) => py.__out.push(msg) });
          return py;
        });
    }
    return pyodidePromise;
  }

  function getRubyVM(statusFn) {
    if (!rubyVMPromise) {
      statusFn("Loading Ruby runtime… (~10 MB, one-time, cached by the browser)");
      rubyVMPromise = loadScript(RUBY_WASM_UMD)
        .then(() => fetch(RUBY_WASM_BINARY))
        .then((resp) => WebAssembly.compileStreaming(resp))
        .then((mod) => window["ruby-wasm-wasi"].DefaultRubyVM(mod, { consolePrint: false }))
        .then(({ vm }) => vm);
    }
    return rubyVMPromise;
  }

  function showRunOut(out, text, isErr) {
    out.style.display = "";
    out.textContent = text;
    out.classList.toggle("err", !!isErr);
  }

  async function runCode(source, lang, out) {
    showRunOut(out, "Running…", false);
    try {
      if (lang === "python") {
        const py = await getPyodide((msg) => showRunOut(out, msg, false));
        py.__out = [];
        let errText = "";
        try {
          await py.runPythonAsync(source);
        } catch (e) {
          errText = String((e && e.message) || e);
        }
        const stdout = py.__out.join("\n");
        showRunOut(out, stdout + (errText ? (stdout ? "\n" : "") + errText : "") || "(no output)", !!errText);
      } else if (lang === "ruby") {
        const vm = await getRubyVM((msg) => showRunOut(out, msg, false));
        const wrapped = `require "stringio"\n$captured = StringIO.new\n$stdout = $captured\nbegin\n${source}\nensure\n  $stdout = STDOUT\nend\n$captured.string`;
        let text, isErr = false;
        try {
          text = vm.eval(wrapped).toString();
        } catch (e) {
          text = String((e && e.message) || e);
          isErr = true;
        }
        showRunOut(out, text || "(no output)", isErr);
      }
    } catch (e) {
      showRunOut(out, "Couldn't load the runtime (offline?). The Check button works without it.", true);
    }
  }

  // ---------- Code checking ----------
  // Keep in sync with tools/validate.mjs
  function normalize(code, lang) {
    code = lang === "python" ? code.replace(/#[^\n]*/g, " ")            // strip # comments (// is floor division!)
      : lang === "ruby" ? code.replace(/#(?!\{)[^\n]*/g, " ")           // strip # comments, keep #{ interpolation
      : code.replace(/\/\/[^\n]*/g, " ")    // strip line comments
            .replace(/\/\*[\s\S]*?\*\//g, " "); // strip block comments
    return code
      .replace(/\s+/g, " ")                 // collapse whitespace
      .replace(/\s*([^\w\s])\s*/g, "$1")    // drop spaces around punctuation
      .trim();
  }
  function runChecks(step, code, lang) {
    const n = normalize(code, lang);
    for (const rule of step.mustNot || []) {
      if (rule.re.test(n)) return { pass: false, hint: rule.hint };
    }
    for (const rule of step.checks || []) {
      if (!rule.re.test(n)) return { pass: false, hint: rule.hint };
    }
    return { pass: true };
  }

  // ---------- Step renderers ----------
  function renderText(step) {
    return el("div", "step", md(step.md));
  }

  function renderCode(step, m) {
    const wrap = el("div", "step");
    wrap.appendChild(codeBlock(step.source, step.title, stepLang(step, m)));
    if (step.caption) wrap.appendChild(el("p", null, mdInline(step.caption)));
    return wrap;
  }

  // Deterministic per-quiz shuffle so the correct answer's position carries no signal.
  function choiceOrder(n, seedStr) {
    let h = 2166136261;
    for (const c of seedStr) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
    const idx = Array.from({ length: n }, (_, k) => k);
    for (let i = n - 1; i > 0; i--) {
      h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
      const j = Math.abs(h) % (i + 1);
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    return idx;
  }

  function renderQuiz(step, m, l, i) {
    const key = sk(m, l, i);
    const card = el("div", "card step" + (state.done[key] ? " done" : ""));
    card.appendChild(el("div", "card-tag", `<span class="dot"></span><span class="mono-caption">Quick check</span>`));
    card.appendChild(el("h4", null, mdInline(step.q)));
    const choices = el("div", "choices");
    const feedback = el("div");
    choiceOrder(step.choices.length, key).forEach((ci) => {
      const c = step.choices[ci];
      const b = el("button", "choice", mdInline(c));
      if (state.done[key]) {
        b.disabled = true;
        if (ci === step.answer) b.classList.add("correct");
      } else {
        b.onclick = () => {
          if (ci === step.answer) {
            state.done[key] = true;
            save();
            choices.querySelectorAll("button").forEach((x) => (x.disabled = true));
            b.classList.add("correct");
            card.classList.add("done");
            feedback.innerHTML = `<div class="feedback ok">✓ Correct. ${mdInline(step.explain || "")}</div>`;
            refreshChrome(m, l);
          } else {
            b.classList.add("wrong");
            b.disabled = true;
            feedback.innerHTML = `<div class="feedback bad"><span class="fb-label">Not quite</span>${mdInline(step.nudge || "Think about it and try another answer.")}</div>`;
          }
        };
      }
      choices.appendChild(b);
    });
    card.appendChild(choices);
    if (state.done[key] && step.explain) {
      feedback.innerHTML = `<div class="feedback ok">✓ ${mdInline(step.explain)}</div>`;
    }
    card.appendChild(feedback);
    return card;
  }

  // ---------- Review pool (spaced-repetition quizzes) ----------
  // One entry per done quiz step: { m, l, i, key, step }. A done quiz with no
  // state.review entry yet is implicitly due now — no seed row is written for it.
  function reviewPool() {
    const pool = [];
    COURSE.forEach((m) => m.lessons.forEach((l) => l.steps.forEach((step, i) => {
      if (step.type !== "quiz") return;
      const key = sk(m, l, i);
      if (state.done[key]) pool.push({ m, l, i, key, step });
    })));
    return pool;
  }
  function reviewDueList() {
    const today = todayEpochDay();
    return reviewPool()
      .filter((c) => srsIsDue(state.review[c.key], today))
      .sort((a, b) => (state.review[a.key] ? state.review[a.key].due : -Infinity) -
        (state.review[b.key] ? state.review[b.key].due : -Infinity));
  }

  function renderReviewCard(c, onAdvance) {
    const { m, l, step, key } = c;
    const reps = (state.review[key] && state.review[key].reps) || 0;
    const card = el("div", "card step");
    card.appendChild(el("div", "card-tag", `<span class="dot"></span><span class="mono-caption">Review</span>`));
    const mi = COURSE.indexOf(m);
    card.appendChild(el("p", "mono-caption review-context",
      `Module ${String(mi).padStart(2, "0")} · ${esc(m.title)} — ${esc(l.title)}`));
    card.appendChild(el("h4", null, mdInline(step.q)));
    const choices = el("div", "choices");
    const feedback = el("div");
    let graded = false;
    const buttons = [];
    choiceOrder(step.choices.length, key + ":" + reps).forEach((ci) => {
      const b = el("button", "choice", mdInline(step.choices[ci]));
      buttons.push(b);
      b.onclick = () => {
        if (graded) return;
        graded = true;
        buttons.forEach((x, xi) => {
          x.disabled = true;
          if (x.__ci === step.answer) x.classList.add("correct");
        });
        if (ci === step.answer) {
          feedback.innerHTML = `<div class="feedback ok">✓ Correct. ${mdInline(step.explain || "")}</div>`;
          gradeReview(c, true, feedback);
        } else {
          b.classList.add("wrong");
          feedback.innerHTML = `<div class="feedback bad"><span class="fb-label">Not quite</span>${mdInline(step.explain || step.nudge || "")}</div>`;
          gradeReview(c, false, feedback);
        }
      };
      b.__ci = ci;
      choices.appendChild(b);
    });
    card.appendChild(choices);
    card.appendChild(feedback);

    function gradeReview(card2, pass, feedbackHost) {
      state.review[card2.key] = srsSchedule(state.review[card2.key], pass ? "good" : "again");
      save();
      renderOverall();
      const nextBtn = el("button", "btn", "Next →");
      nextBtn.style.marginTop = "12px";
      nextBtn.onclick = () => onAdvance(pass);
      feedbackHost.appendChild(nextBtn);
    }
    return card;
  }

  const REVIEW_SESSION_CAP = 20;
  function renderReviewView() {
    const content = document.getElementById("content");
    content.innerHTML = "";
    const wrap = el("div", "lesson-wrap review-wrap");

    // Drop review entries whose stepKey no longer resolves to a real quiz step.
    const validKeys = new Set(reviewPool().map((c) => c.key));
    let pruned = false;
    Object.keys(state.review).forEach((k) => { if (!validKeys.has(k)) { delete state.review[k]; pruned = true; } });
    if (pruned) save();

    let queue = reviewDueList().slice(0, REVIEW_SESSION_CAP);
    let correct = 0, seen = 0;
    const total = queue.length;

    wrap.appendChild(el("h2", "lesson-title", "Review"));
    wrap.appendChild(el("p", "mono-caption",
      `${total} due · quizzes you've answered come back on a schedule`));
    const slot = el("div");
    wrap.appendChild(slot);
    content.appendChild(wrap);

    function showNext() {
      slot.innerHTML = "";
      if (!queue.length) {
        const summary = el("div", "complete-card");
        summary.appendChild(el("div", "big", "🐾"));
        summary.appendChild(el("h3", null, `Reviewed ${seen} · ${correct} correct`));
        const back = el("a", "btn", "Back to the course");
        back.href = "#/";
        summary.appendChild(back);
        slot.appendChild(summary);
        return;
      }
      const c = queue.shift();
      slot.appendChild(renderReviewCard(c, (pass) => {
        seen++;
        if (pass) correct++;
        showNext();
      }));
    }
    if (!total) {
      const summary = el("div", "complete-card");
      summary.appendChild(el("div", "big", "🐾"));
      summary.appendChild(el("h3", null, "Nothing due right now"));
      summary.appendChild(el("p", null, "Come back later, or keep going with the course."));
      const back = el("a", "btn", "Back to the course");
      back.href = "#/";
      summary.appendChild(back);
      slot.appendChild(summary);
    } else {
      showNext();
    }
    window.scrollTo(0, 0);
  }

  function renderExercise(step, m, l, i) {
    const key = sk(m, l, i);
    const card = el("div", "card step" + (state.done[key] ? " done" : ""));
    card.appendChild(el("div", "card-tag", `<span class="dot"></span><span class="mono-caption">Write the code</span>`));
    if (step.title) card.appendChild(el("h4", null, esc(step.title)));
    card.appendChild(el("div", null, md(step.prompt)));

    const editor = el("textarea", "editor");
    editor.spellcheck = false;
    editor.value = state.code[key] != null ? state.code[key] : (step.starter || "");
    editor.rows = Math.max(4, (editor.value.split("\n").length + 2));
    editor.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const { selectionStart: s, selectionEnd: en } = editor;
        editor.value = editor.value.slice(0, s) + "    " + editor.value.slice(en);
        editor.selectionStart = editor.selectionEnd = s + 4;
      } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        checkBtn.click();
      }
    });
    editor.addEventListener("input", () => { state.code[key] = editor.value; save(); });
    card.appendChild(editor);

    let actions = el("div", "ex-actions");
    let feedback = el("div");
    let solutionSlot = el("div", "solution-reveal");
    let checkBtn = el("button", "btn", "Check my code");
    let resetBtn = el("button", "btn secondary", "Reset");
    let revealBtn = el("button", "linkish", "I'm stuck — show the solution");
    revealBtn.style.display = "none";
    let fails = 0;

    function markDone(how) {
      state.done[key] = how;
      save();
      card.classList.add("done");
      refreshChrome(m, l);
    }
    checkBtn.onclick = () => {
      const result = runChecks(step, editor.value, stepLang(step, m));
      if (result.pass) {
        feedback.innerHTML = `<div class="feedback ok">✓ ${esc(step.success || "That's exactly right. On to the next step!")}</div>`;
        markDone(solutionSlot.childElementCount ? "help" : true);
      } else {
        fails++;
        feedback.innerHTML = `<div class="feedback bad"><span class="fb-label">Not yet</span>${mdInline(result.hint || "Compare your code with the instructions again.")}</div>`;
        if (fails >= 2) revealBtn.style.display = "";
      }
    };
    resetBtn.onclick = () => {
      editor.value = step.starter || "";
      state.code[key] = editor.value;
      save();
      feedback.innerHTML = "";
    };
    revealBtn.onclick = () => {
      solutionSlot.innerHTML = "";
      solutionSlot.appendChild(codeBlock(step.solution, "Solution", stepLang(step, m)));
      const hint = el("p", null, "Type it out yourself (don't paste) — then hit <strong>Check my code</strong>. Typing is how it sticks.");
      solutionSlot.appendChild(hint);
      revealBtn.style.display = "none";
    };
    actions.append(checkBtn, resetBtn);
    const exLang = stepLang(step, m);
    let runOut = null;
    if (exLang === "python" || exLang === "ruby") {
      const runBtn = el("button", "btn secondary", "▶ Run");
      runBtn.onclick = () => {
        if (!runOut) { runOut = el("pre", "run-out"); runOut.style.display = "none"; card.appendChild(runOut); }
        runCode(editor.value, exLang, runOut);
      };
      actions.appendChild(runBtn);
    }
    actions.appendChild(revealBtn);
    card.append(actions, feedback, solutionSlot);
    if (state.done[key]) {
      feedback.innerHTML = `<div class="feedback ok">✓ Completed${state.done[key] === "help" ? " (with the solution's help)" : ""}.</div>`;
    }
    return card;
  }

  function renderXcode(step, m, l, i) {
    const key = sk(m, l, i);
    const card = el("div", "card xcode step" + (state.done[key] ? " done" : ""));
    card.appendChild(el("div", "card-tag", `<span class="dot"></span><span class="mono-caption">${esc(step.label || "Over to Xcode")}</span>`));
    if (step.title) card.appendChild(el("h4", null, esc(step.title)));
    if (step.intro) card.appendChild(el("div", null, md(step.intro)));
    const list = el("div");
    function syncDone() {
      const all = step.items.every((_, ci) => state.checks[`${key}/${ci}`]);
      if (all && !state.done[key]) { state.done[key] = true; save(); card.classList.add("done"); refreshChrome(m, l); }
    }
    step.items.forEach((item, ci) => {
      const ck = `${key}/${ci}`;
      const row = el("label", "check-item" + (state.checks[ck] ? " checked" : ""));
      const box = document.createElement("input");
      box.type = "checkbox";
      box.checked = !!state.checks[ck];
      box.onchange = () => {
        state.checks[ck] = box.checked;
        row.classList.toggle("checked", box.checked);
        save();
        syncDone();
      };
      row.append(box, el("span", null, mdInline(item)));
      list.appendChild(row);
    });
    card.appendChild(list);
    const skip = el("button", "linkish", "I'll do this on my Mac later — continue anyway");
    skip.onclick = () => { state.done[key] = "skip"; save(); card.classList.add("done"); refreshChrome(m, l); render(); };
    if (!state.done[key]) card.appendChild(skip);
    return card;
  }

  function renderStep(step, m, l, i) {
    switch (step.type) {
      case "text": return renderText(step);
      case "code": return renderCode(step, m);
      case "quiz": return renderQuiz(step, m, l, i);
      case "exercise": return renderExercise(step, m, l, i);
      case "xcode": return renderXcode(step, m, l, i);
      default: return el("div", "step", `<p>Unknown step type: ${esc(String(step.type))}</p>`);
    }
  }

  // ---------- Lesson page ----------
  let continueRow = null;
  function refreshChrome(m, l) {
    // Re-evaluate the continue button + sidebar without re-rendering (keeps editor state).
    if (continueRow) updateContinue(m, l, continueRow);
    renderSidebar(m, l);
    renderOverall();
  }

  function updateContinue(m, l, row) {
    row.innerHTML = "";
    const revealed = Math.min(state.reveal[lk(m, l)] || 1, l.steps.length);
    const lastIdx = revealed - 1;
    const lastStep = l.steps[lastIdx];
    const blocked = gates(lastStep) && !stepDone(m, l, lastIdx);
    if (revealed >= l.steps.length && !blocked) {
      row.style.display = "none";
      showCompletion(m, l);
      return;
    }
    row.style.display = "";
    const btn = el("button", "btn", "Continue ↓");
    btn.disabled = blocked;
    btn.onclick = () => {
      state.reveal[lk(m, l)] = revealed + 1;
      save();
      render(true);
    };
    row.appendChild(btn);
    if (blocked) row.appendChild(el("span", "hintline", "Finish the step above to keep going"));
  }

  function showCompletion(m, l) {
    if (document.querySelector(".complete-card")) return;
    const { next } = neighbors(m, l);
    const cardHost = document.getElementById("complete-slot");
    const card = el("div", "complete-card");
    card.appendChild(el("div", "big", "🐾"));
    card.appendChild(el("h3", null, `Lesson complete: ${esc(l.title)}`));
    card.appendChild(el("p", null, next ? "Nice work. Keep the streak going." : "That was the last lesson. You built the whole app!"));
    if (next) {
      const btn = el("button", "btn", `Next: ${esc(next.l.title)} →`);
      btn.onclick = () => { location.hash = `#/${next.m.id}/${next.l.id}`; };
      card.appendChild(btn);
    }
    cardHost.appendChild(card);
    renderSidebar(m, l);
    renderOverall();
  }

  function neighbors(m, l) {
    const flat = [];
    COURSE.forEach((mod) => mod.lessons.forEach((les) => flat.push({ m: mod, l: les })));
    const idx = flat.findIndex((x) => x.m.id === m.id && x.l.id === l.id);
    return { prev: flat[idx - 1] || null, next: flat[idx + 1] || null };
  }

  function renderLesson(m, l, keepScroll) {
    const content = document.getElementById("content");
    const prevScroll = keepScroll ? window.scrollY : 0;
    content.innerHTML = "";
    const wrap = el("div", "lesson-wrap");
    const mi = COURSE.indexOf(m), li = m.lessons.indexOf(l);
    const crumbRow = el("div", "crumb-row");
    crumbRow.appendChild(el("div", "crumbs mono-caption",
      `Module ${String(mi).padStart(2, "0")} · ${esc(m.title)} — Lesson ${li + 1} of ${m.lessons.length} · ~${estMin(l)} min`));
    const lessonResetBtn = el("button", "linkish lesson-reset", "↺ reset lesson");
    lessonResetBtn.onclick = () => {
      if (!confirm("Reset this lesson's progress?")) return;
      const prefix = `${m.id}/${l.id}/`;
      for (const map of [state.done, state.checks, state.code]) {
        for (const key of Object.keys(map)) if (key.startsWith(prefix)) delete map[key];
      }
      delete state.reveal[lk(m, l)];
      save();
      render(false);
    };
    crumbRow.appendChild(lessonResetBtn);
    wrap.appendChild(crumbRow);
    wrap.appendChild(el("h2", "lesson-title", esc(l.title)));

    const revealed = Math.max(1, Math.min(state.reveal[lk(m, l)] || 1, l.steps.length));
    state.reveal[lk(m, l)] = Math.max(state.reveal[lk(m, l)] || 1, 1);
    for (let i = 0; i < revealed; i++) wrap.appendChild(renderStep(l.steps[i], m, l, i));

    continueRow = el("div", "continue-row");
    wrap.appendChild(continueRow);
    wrap.appendChild(el("div", null)).id = "complete-slot";
    if ((state.reveal[lk(m, l)] || 1) >= l.steps.length && lessonDone(m, l)) {
      continueRow.style.display = "none";
      content.appendChild(wrap);
      showCompletion(m, l);
    } else {
      updateContinue(m, l, continueRow);
      content.appendChild(wrap);
    }

    if (keepScroll) {
      window.scrollTo(0, prevScroll);
      const steps = wrap.querySelectorAll(".step");
      const lastStep = steps[steps.length - 1];
      if (lastStep) lastStep.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo(0, 0);
    }
  }

  // ---------- Search ----------
  // Lazy index: one entry per lesson, built on first focus. text = lesson title +
  // every step's searchable fields, joined. textLower drives the substring match;
  // textOriginal (same join, original case) drives the snippet.
  let searchIndex = null;
  function buildSearchIndex() {
    searchIndex = [];
    COURSE.forEach((m) => m.lessons.forEach((l) => {
      const parts = [l.title];
      l.steps.forEach((step) => {
        parts.push(step.title, step.caption, step.q, step.label, step.source);
        parts.push(...(step.md || []), ...(step.prompt || []), ...(step.choices || []), ...(step.items || []));
      });
      const textOriginal = parts.filter(Boolean).join(" \n ");
      searchIndex.push({ m, l, textOriginal, textLower: textOriginal.toLowerCase() });
    }));
  }
  function searchLessons(query) {
    if (!searchIndex) buildSearchIndex();
    const q = query.toLowerCase();
    const hits = [];
    for (const entry of searchIndex) {
      const idx = entry.textLower.indexOf(q);
      if (idx === -1) continue;
      hits.push({ m: entry.m, l: entry.l, snippet: snippetAround(entry.textOriginal, idx, query.length) });
      if (hits.length >= 15) break;
    }
    return hits;
  }
  function snippetAround(text, idx, len) {
    const radius = 35;
    let start = Math.max(0, idx - radius);
    let end = Math.min(text.length, idx + len + radius);
    let snippet = text.slice(start, end).replace(/\s+/g, " ").trim();
    if (start > 0) snippet = "…" + snippet;
    if (end < text.length) snippet += "…";
    return snippet;
  }

  function renderSearchResults(host, query) {
    host.innerHTML = "";
    searchLessons(query).forEach((hit) => {
      const a = el("a", "search-result");
      a.href = `#/${hit.m.id}/${hit.l.id}`;
      a.innerHTML = `<div>${esc(hit.l.title)}</div>` +
        `<div class="mono-caption">${esc(hit.m.title)}</div>` +
        `<div class="search-snippet">${esc(hit.snippet)}</div>`;
      // Hash change fires renderSidebar() → restores the module list; just clear the query.
      a.addEventListener("click", () => { searchInput.value = ""; });
      host.appendChild(a);
    });
  }

  let searchInput = null;
  function ensureSearchInput() {
    if (searchInput) return;
    searchInput = document.createElement("input");
    searchInput.type = "search";
    searchInput.placeholder = "Search lessons…";
    searchInput.className = "search-input";
    searchInput.id = "lesson-search";
    document.getElementById("module-list").insertAdjacentElement("beforebegin", searchInput);

    let debounceTimer = null;
    const restoreModuleList = () => renderSidebar(lastActiveM, lastActiveL);
    searchInput.addEventListener("focus", () => { if (!searchIndex) buildSearchIndex(); });
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { searchInput.value = ""; restoreModuleList(); searchInput.blur(); }
    });
    searchInput.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      const query = searchInput.value.trim();
      if (query.length < 2) { restoreModuleList(); return; }
      const host = document.getElementById("module-list");
      debounceTimer = setTimeout(() => renderSearchResults(host, query), 150);
    });
  }

  // ---------- Sidebar ----------
  let lastActiveM = null, lastActiveL = null;
  function renderSidebar(activeM, activeL) {
    lastActiveM = activeM; lastActiveL = activeL;
    ensureSearchInput();
    const host = document.getElementById("module-list");
    host.innerHTML = "";
    COURSE.forEach((m, mi) => {
      const doneCount = m.lessons.filter((l) => lessonComplete(m, l)).length;
      const mod = el("div", "mod" + ((activeM && m.id === activeM.id) ? " open" : ""));
      const head = el("button", "mod-head");
      head.innerHTML = `<span class="emoji">${m.emoji || "📘"}</span><span>${String(mi).padStart(2, "0")} · ${esc(m.title)}</span>` +
        `<span class="count${doneCount === m.lessons.length ? " done" : ""}">${doneCount}/${m.lessons.length}</span>`;
      head.onclick = () => mod.classList.toggle("open");
      mod.appendChild(head);
      const list = el("div", "mod-lessons");
      m.lessons.forEach((l) => {
        const a = el("a", "lesson-link" + ((activeL && activeM && m.id === activeM.id && l.id === activeL.id) ? " active" : ""));
        a.href = `#/${m.id}/${l.id}`;
        a.innerHTML = `<span class="tick">${lessonComplete(m, l) ? "✓" : ""}</span><span>${esc(l.title)}</span>` +
          `<span class="est">~${estMin(l)}m</span>`;
        list.appendChild(a);
      });
      mod.appendChild(list);
      host.appendChild(mod);
    });
  }

  // Map link + Review badge, injected once under the overall progress bar.
  let overallLinksRow = null, mapLink = null, reviewBadge = null;
  function ensureOverallLinks() {
    if (overallLinksRow) return;
    overallLinksRow = el("div", "overall-links");
    mapLink = el("a", "mono-caption", "Map");
    mapLink.href = "#/map";
    reviewBadge = el("a", "mono-caption review-badge");
    reviewBadge.href = "#/review";
    overallLinksRow.append(mapLink, reviewBadge);
    document.querySelector(".overall").insertAdjacentElement("afterend", overallLinksRow);
  }

  function renderOverall() {
    const total = COURSE.reduce((n, m) => n + m.lessons.length, 0);
    const done = COURSE.reduce((n, m) => n + m.lessons.filter((l) => lessonComplete(m, l)).length, 0);
    const pct = total ? Math.round((done / total) * 100) : 0;
    document.getElementById("overall-fill").style.width = pct + "%";
    document.getElementById("overall-label").textContent = `${pct}%`;

    ensureOverallLinks();
    const dueN = reviewDueList().length;
    reviewBadge.textContent = `Review · ${dueN} due`;
    reviewBadge.style.display = dueN ? "" : "none";
  }

  // ---------- Curriculum map ----------
  function renderMapView() {
    const content = document.getElementById("content");
    content.innerHTML = "";
    const wrap = el("div", "lesson-wrap");
    wrap.appendChild(el("h2", "lesson-title", "Curriculum map"));
    const back = el("a", "linkish", "← Back to the course");
    back.href = "#/";
    wrap.appendChild(back);
    const grid = el("div", "map-grid");
    COURSE.forEach((m, mi) => {
      const doneCount = m.lessons.filter((l) => lessonComplete(m, l)).length;
      const totalMin = m.lessons.reduce((n, l) => n + estMin(l), 0);
      const complete = doneCount === m.lessons.length;
      const target = m.lessons.find((l) => !lessonComplete(m, l)) || m.lessons[0];
      const card = el("a", "map-card" + (complete ? " done" : ""));
      card.href = `#/${m.id}/${target.id}`;
      card.innerHTML =
        `<div class="map-card-emoji">${m.emoji || "📘"}</div>` +
        `<div class="map-card-title">${String(mi).padStart(2, "0")} · ${esc(m.title)}</div>` +
        `<div class="mono-caption">${doneCount}/${m.lessons.length} lessons · ~${totalMin} min</div>`;
      grid.appendChild(card);
    });
    wrap.appendChild(grid);
    content.appendChild(wrap);
    window.scrollTo(0, 0);
  }

  // ---------- Routing ----------
  function currentRoute() {
    const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
    let m = COURSE.find((x) => x.id === parts[0]);
    let l = m && m.lessons.find((x) => x.id === parts[1]);
    if (!m || !l) {
      // First lesson that isn't complete, else the very first.
      outer: for (const mod of COURSE) {
        for (const les of mod.lessons) {
          if (!lessonComplete(mod, les)) { m = mod; l = les; break outer; }
        }
      }
      if (!m) { m = COURSE[0]; l = m && m.lessons[0]; }
    }
    return { m, l };
  }

  function render(keepScroll) {
    if (!COURSE.length) {
      document.getElementById("content").innerHTML = "<p style='padding:40px'>No lessons loaded — check the script tags in index.html.</p>";
      return;
    }
    // #/review and #/map are their own views — intercept before currentRoute()'s
    // fallback-to-first-incomplete-lesson logic (it doesn't know these hashes).
    const hash = location.hash.replace(/^#\/?/, "");
    if (hash === "review" || hash === "map") {
      renderSidebar(null, null);
      renderOverall();
      if (hash === "review") renderReviewView(); else renderMapView();
      document.body.classList.remove("menu-open");
      return;
    }
    const { m, l } = currentRoute();
    renderSidebar(m, l);
    renderOverall();
    renderLesson(m, l, keepScroll);
    document.body.classList.remove("menu-open");
  }

  window.addEventListener("hashchange", () => render(false));
  document.getElementById("menu-toggle").onclick = () => document.body.classList.toggle("menu-open");
  document.getElementById("reset-progress").onclick = () => {
    if (confirm("Reset all course progress? This can't be undone.")) {
      localStorage.setItem(STORE_KEY, "{}"); // tombstone, not removeItem — see migrateLegacyProgress
      location.reload();
    }
  };

  render(false);
})();
