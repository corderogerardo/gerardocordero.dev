// The build-data script serializes RegExp from vm sandboxes as
// { source, flags }. This reconstructs them at runtime.

export interface SerializedRegExp {
  source: string;
  flags: string;
}

export function deserializeRe(re: unknown): RegExp {
  if (re instanceof RegExp) return re;
  if (re && typeof re === "object" && "source" in re && typeof (re as SerializedRegExp).source === "string") {
    return new RegExp((re as SerializedRegExp).source, (re as SerializedRegExp).flags || undefined);
  }
  return /(?:)/;
}
