'use client'

import React from 'react'
import { useMemo } from 'react'
import { stripToTopLevel } from '@/lib/strip-code'

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
