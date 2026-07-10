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
  return code
    // `import … from '…'` — default, named, namespace, or multiline — plus bare
    // side-effect imports. Non-greedy so it stops at the first `from`.
    .replace(/\bimport\b[\s\S]*?\bfrom\b\s*['"][^'"]*['"]\s*;?/g, '')
    .replace(/\bimport\s*['"][^'"]*['"]\s*;?/g, '')
    // Strip the export keyword only (tolerating indentation); declaration stays.
    .replace(/^\s*export\s+(?:default\s+)?/gm, '')
    .trim()
}
