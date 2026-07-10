'use client'

import React from 'react'
import { useMemo } from 'react'

function stripToTopLevel(code: string): string {
  let result = code
    .replace(/^import\s+.*?;?\s*$/gm, '')
    .replace(/import\s*\{[\s\S]*?\}\s*from\s*['"][\s\S]*?['"]\s*;?\s*/g, '')
  result = result.replace(
    /export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{[\s\S]*?\}\s*;?\s*$/,
    ''
  )
  result = result.replace(/^export\s+default\s+/gm, '')
  return result.trim()
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
