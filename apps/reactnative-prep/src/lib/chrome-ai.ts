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

export async function promptAvailability(opts?: any): Promise<AiAvailability> {
  const L = lm();
  if (!L || typeof L.availability !== "function") return "unsupported";
  try {
    return (await L.availability(opts)) as AiAvailability;
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
    ...opts,
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
