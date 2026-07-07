// In-browser code execution (Python via Pyodide, Ruby via ruby.wasm).
// Singleton runtimes loaded lazily.

const PYODIDE_JS = "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js";
const RUBY_WASM_UMD = "https://cdn.jsdelivr.net/npm/@ruby/wasm-wasi@2.9.3-2.9.4/dist/browser.umd.js";
const RUBY_WASM_BINARY = "https://cdn.jsdelivr.net/npm/@ruby/3.4-wasm-wasi@2.9.3-2.9.4/dist/ruby+stdlib.wasm";

let pyodidePromise: Promise<any> | null = null;
let rubyVMPromise: Promise<any> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("script load failed: " + src));
    document.head.appendChild(s);
  });
}

async function getPyodide(): Promise<any> {
  if (!pyodidePromise) {
    pyodidePromise = loadScript(PYODIDE_JS)
      .then(() => (window as any).loadPyodide())
      .then((py: any) => {
        py.setStdout({ batched: (msg: string) => py.__out.push(msg) });
        py.setStderr({ batched: (msg: string) => py.__out.push(msg) });
        return py;
      });
  }
  return pyodidePromise;
}

async function getRubyVM(): Promise<any> {
  if (!rubyVMPromise) {
    rubyVMPromise = loadScript(RUBY_WASM_UMD)
      .then(() => fetch(RUBY_WASM_BINARY))
      .then((resp) => WebAssembly.compileStreaming(resp))
      .then((mod) => (window as any)["ruby-wasm-wasi"].DefaultRubyVM(mod, { consolePrint: false }))
      .then(({ vm }: any) => vm);
  }
  return rubyVMPromise;
}

export async function runCode(
  source: string,
  lang: string,
  out: HTMLPreElement,
): Promise<void> {
  try {
    if (lang === "python") {
      const py = await getPyodide();
      py.__out = [];
      let errText = "";
      try {
        await py.runPythonAsync(source);
      } catch (e: any) {
        errText = String((e && e.message) || e);
      }
      const stdout = py.__out.join("\n");
      const text = stdout + (errText ? (stdout ? "\n" : "") + errText : "") || "(no output)";
      out.textContent = text;
      out.classList.toggle("err", !!errText);
    } else if (lang === "ruby") {
      const vm = await getRubyVM();
      const wrapped = [
        'require "stringio"',
        "$captured = StringIO.new",
        "$stdout = $captured",
        "begin",
        source,
        "ensure",
        "  $stdout = STDOUT",
        "end",
        "$captured.string",
      ].join("\n");
      let text: string, isErr = false;
      try {
        text = vm.eval(wrapped).toString();
      } catch (e: any) {
        text = String((e && e.message) || e);
        isErr = true;
      }
      out.textContent = text || "(no output)";
      out.classList.toggle("err", isErr);
    }
  } catch {
    out.textContent = "Couldn't load the runtime (offline?). The Check button works without it.";
    out.classList.add("err");
  }
}
