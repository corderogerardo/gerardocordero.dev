'use client'

import React from 'react'
import { useMemo } from 'react'
import { stripToTopLevel } from '@/lib/strip-code'

/**
 * Compile user code and return extracted top-level bindings.
 *
 * `new Function` here is deliberate and browser-local: `code` is the learner's
 * own text from their own challenge editor, compiled and run in their own tab —
 * the same model as CodeSandbox/JSFiddle, with no attacker-controlled input
 * crossing a trust boundary. (Not a Web Worker: this is throwaway practice
 * content; if reused more broadly, isolate execution to bound runaway loops.)
 */
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
