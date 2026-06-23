// Thin wrapper around Chrome's Built-in AI Prompt API (Gemini Nano, on-device).
// Everything feature-detects so the UI can degrade gracefully elsewhere.

/* eslint-disable @typescript-eslint/no-explicit-any */

export type AiAvailability =
  | "unsupported"
  | "unavailable"
  | "downloadable"
  | "downloading"
  | "available";

function lm(): any | null {
  if (typeof window === "undefined") return null;
  return (window as any).LanguageModel ?? null;
}

export function isPromptApiSupported(): boolean {
  return !!lm();
}

// Recent Chrome builds require every Prompt API request to declare its input
// and output languages. Omit them and Chrome logs "No output language was
// specified…" and — more importantly — can refuse to emit text in an
// "untested" language with a NotSupportedError, which surfaces to the user as
// the tutor failing to answer. The tutor coaches in English, so we attest
// English in / English out. Supported codes today: en, es, ja, de, fr.
//
// This MUST be applied to both availability() and create(): the readiness
// check is keyed on the options you pass, so if the two disagree the answer
// availability() gave no longer describes the session you actually build.
const LANGUAGE_OPTIONS = {
  expectedInputs: [{ type: "text", languages: ["en"] }],
  expectedOutputs: [{ type: "text", languages: ["en"] }],
};

function withLanguage(opts: any = {}): any {
  // Caller-supplied keys win, so a future bilingual surface can override.
  return { ...LANGUAGE_OPTIONS, ...opts };
}

export async function promptAvailability(opts?: any): Promise<AiAvailability> {
  const L = lm();
  if (!L || typeof L.availability !== "function") return "unsupported";
  try {
    return (await L.availability(withLanguage(opts))) as AiAvailability;
  } catch {
    return "unavailable";
  }
}

export async function createSession(
  opts: any = {},
  onProgress?: (loaded: number) => void,
): Promise<any> {
  const L = lm();
  if (!L) throw new Error("Prompt API not supported");
  return L.create({
    ...withLanguage(opts),
    monitor(m: any) {
      try {
        m.addEventListener("downloadprogress", (e: any) =>
          onProgress?.(e.loaded),
        );
      } catch {
        /* ignore */
      }
    },
  });
}

/** Prompt the model, streaming chunks to `onChunk`. Returns the full text. */
export async function streamPrompt(
  session: any,
  text: string,
  onChunk: (full: string) => void,
): Promise<string> {
  // Newer builds: promptStreaming returns a ReadableStream of incremental text.
  if (typeof session.promptStreaming === "function") {
    const stream = session.promptStreaming(text);
    let full = "";
    try {
      for await (const chunk of stream as AsyncIterable<string>) {
        full += chunk;
        onChunk(full);
      }
      return full;
    } catch {
      // fall through to non-streaming
    }
  }
  const full = await session.prompt(text);
  onChunk(full);
  return full;
}
