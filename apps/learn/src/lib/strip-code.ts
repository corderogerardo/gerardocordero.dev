/**
 * Strip module syntax so user-authored challenge code can run inside `new Function`.
 *
 * Shared by the test runner (`challenge-runner.ts`) and the live preview
 * (`usePreviewBridge.ts`) — they were separate copies that drifted, so a bug
 * fixed in one lived on in the other. Keep it in one place.
 *
 * It removes `import` statements and the `export` keyword, but never the
 * declaration itself: the runner and the bridge both look up names the user
 * defined (`getRound`, `GroceryList`, …), so `export default function Foo(){}`
 * has to survive as `function Foo(){}`, not be deleted wholesale.
 */
export function stripToTopLevel(code: string): string {
  // Anchored to line starts so a string/comment that merely contains the word
  // "import"/"export" isn't mangled. This is a lightweight strip, not a real
  // tokenizer — fine for the throwaway single-file challenge snippets it runs on.
  return code
    // `import … from '…'` — default, named, namespace, or multiline — plus bare
    // side-effect imports. Non-greedy so it stops at the first `from`.
    .replace(/^\s*import\b[\s\S]*?\bfrom\b\s*['"][^'"]*['"]\s*;?\s*$/gm, '')
    .replace(/^\s*import\s*['"][^'"]*['"]\s*;?\s*$/gm, '')
    // Strip the export keyword only (tolerating indentation); declaration stays.
    .replace(/^\s*export\s+(?:default\s+)?/gm, '')
    .trim()
}
