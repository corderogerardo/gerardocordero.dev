// Regex-based syntax highlighting. Zero dependencies.

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

const TS_KW = new Set(("const let var function return if else switch case default for while do break continue " +
  "class extends implements interface type enum namespace declare abstract public private protected readonly static " +
  "new this super import export from as void null undefined true false typeof instanceof in of keyof infer is satisfies " +
  "async await yield try catch finally throw delete get set constructor extends string number boolean object any unknown never " +
  "Promise Array Record Partial Readonly Pick Omit").split(" "));

const C_STYLE_RE = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\]|\\.)*")|(@\w+|#\w+)|\b(\d[\d_]*(?:\.\d[\d_]*)?)\b|\b([A-Za-z_]\w*)\b/g;

// TS strings include backtick template literals; comments are C-style. Reuse Go's regex shape.
const TS_RE = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`|'(?:[^'\\]|\\.)*')|(@[\w.]+)|\b(\d[\d_]*(?:\.\d[\d_]*)?)\b|\b([A-Za-z_]\w*)\b/g;

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
  ts: { kw: TS_KW, re: TS_RE },
};

export type LangId = keyof typeof LANG;

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function highlight(src: string, lang: LangId): string {
  const langDef = LANG[lang];
  if (!langDef) return esc(src);
  const { kw, re } = langDef;
  re.lastIndex = 0;
  const out: string[] = [];
  let last = 0;
  let mt: RegExpExecArray | null;
  while ((mt = re.exec(src)) !== null) {
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
