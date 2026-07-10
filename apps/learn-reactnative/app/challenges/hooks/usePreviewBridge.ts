'use client'

import React from 'react'
import { useMemo } from 'react'

function stripToTopLevel(code: string): string {
  return code
    .replace(/^import\s+.*?;?\s*$/gm, '')
    .replace(/import\s*\{[\s\S]*?\}\s*from\s*['"][\s\S]*?['"]\s*;?\s*/g, '')
    // Strip the export keyword only: the declaration itself has to survive, or
    // the names in `extract` resolve to nothing.
    .replace(/^export\s+(?:default\s+)?/gm, '')
    .trim()
}

/** Compile user code and return extracted top-level bindings. */
export function usePreviewBridge(
  code: string,
  extract: string[],
): Record<string, unknown> | null {
  return useMemo(() => {
    try {
      const clean = stripToTopLevel(code)
      if (!clean) return null
      const fn = new Function('React', `${clean}; return { ${extract.join(', ')} }`)
      return fn(React) as Record<string, unknown>
    } catch {
      return null
    }
  }, [code, extract])
}
