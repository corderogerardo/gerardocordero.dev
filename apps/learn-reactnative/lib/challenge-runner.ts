import type { TestCase } from './challenges'

export interface TestResult {
  name: string
  passed: boolean
  expected: unknown
  actual: unknown
  error: string | null
}

export interface RunResult {
  results: TestResult[]
  passed: number
  failed: number
  runtimeError: string | null
}

function normalizeValue(val: unknown): unknown {
  if (typeof val === 'number' && Number.isNaN(val)) return 'NaN'
  if (typeof val === 'number') return Math.round(val * 100) / 100
  if (Array.isArray(val)) return val.map(normalizeValue)
  if (val !== null && typeof val === 'object') {
    const obj: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      obj[k] = normalizeValue(v)
    }
    return obj
  }
  return val
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(normalizeValue(a)) === JSON.stringify(normalizeValue(b))
}

/** Remove ES module boilerplate and component-function bodies.
 *  Keeps top-level declarations (const, let, var, function) so tests can eval them. */
function stripToTopLevel(code: string): string {
  let result = code
    .replace(/^import\s+.*?;?\s*$/gm, '')
    .replace(/import\s*\{[\s\S]*?\}\s*from\s*['"][\s\S]*?['"]\s*;?\s*/g, '')

  // Remove `export default function Foo(...) { ... }` component bodies at end of code
  result = result.replace(
    /export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{[\s\S]*?\}\s*;?\s*$/,
    ''
  )

  // Remove `export default` from any remaining location
  result = result.replace(/^export\s+default\s+/gm, '')

  return result.trim()
}

/** Run pattern-based check: verify all required strings exist in user code */
function runChecks(code: string, patterns: string[]): TestResult[] {
  return patterns.map(pattern => ({
    name: `Code contains \`${pattern}\``,
    passed: code.includes(pattern),
    expected: pattern,
    actual: pattern,
    error: code.includes(pattern) ? null : `Missing from code: \`${pattern}\``,
  }))
}

export function runTests(code: string, tests: TestCase[]): RunResult {
  const results: TestResult[] = []
  let passed = 0
  let failed = 0
  let runtimeError: string | null = null

  for (const test of tests) {
    if (test.check) {
      const checkResults = runChecks(code, test.check)
      for (const r of checkResults) {
        if (r.passed) passed++
        else failed++
        results.push(r)
      }
      continue
    }

    const result: TestResult = {
      name: test.it,
      passed: false,
      expected: test.expected ?? null,
      actual: null,
      error: null,
    }

    try {
      const cleanCode = stripToTopLevel(code)
      const sandbox = new Function('console', `
        ${cleanCode}
        return (function() {
          try {
            return eval(${JSON.stringify(test.run)})
          } catch (e) {
            return { __sandboxError: e instanceof Error ? e.message : String(e) }
          }
        })()
      `)

      const mockConsole = { log: () => {}, error: () => {} }
      const actual = sandbox(mockConsole)

      if (actual && typeof actual === 'object' && '__sandboxError' in (actual as object)) {
        result.error = (actual as { __sandboxError: string }).__sandboxError
        result.passed = false
        failed++
      } else {
        result.actual = normalizeValue(actual)
        result.passed = deepEqual(actual, test.expected)
        if (result.passed) passed++
        else failed++
      }
    } catch (e) {
      result.error = e instanceof Error ? e.message : String(e)
      result.passed = false
      failed++
      if (!runtimeError) runtimeError = result.error
    }

    results.push(result)
  }

  return { results, passed, failed, runtimeError }
}
