#!/usr/bin/env bash
# PostToolUse hook: after an edit to a portfolio TS/TSX file, run the type loop
# and, on failure, feed the errors back to Claude (exit 2) so it self-corrects.
# The tool-call JSON arrives on stdin.
set -uo pipefail

input=$(cat)

# Extract the edited file path (Edit / Write / MultiEdit all use tool_input.file_path).
file=$(printf '%s' "$input" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{const j=JSON.parse(d);process.stdout.write((j.tool_input&&j.tool_input.file_path)||'')}catch(e){process.stdout.write('')}})" 2>/dev/null)

# Only react to TypeScript files inside the portfolio app; ignore everything else.
case "$file" in
  *apps/portfolio/*.ts | *apps/portfolio/*.tsx) ;;
  *) exit 0 ;;
esac

# Resolve repo root (CLAUDE_PROJECT_DIR is set for hooks; fall back to git).
root="${CLAUDE_PROJECT_DIR:-$(git -C "$(dirname "$file")" rev-parse --show-toplevel 2>/dev/null)}"
[ -n "$root" ] || exit 0
cd "$root" || exit 0

out=$(pnpm --filter @gerardocordero/portfolio typecheck 2>&1)
if [ $? -ne 0 ]; then
  {
    echo "Typecheck failed after editing $file. Fix these type errors before continuing:"
    echo "$out" | grep -E 'error TS|\.tsx?[:(]' || echo "$out" | tail -20
  } >&2
  exit 2
fi
exit 0
