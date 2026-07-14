#!/bin/bash
# SessionStart hook for Hill Climbing.
#
# Purpose: fight documentation drift. CLAUDE.md's factual sections (§§1–2, 11) are
# a hand-maintained snapshot that rots every time an app is added or a version
# bumps. This hook prints the *live* repo state into the session context, so a
# stale handoff can no longer mislead a fresh session, and arms the advisory
# doc-freshness pre-commit guard (git hooks aren't cloned, and this repo's
# sessions clone fresh, so we point git at the committed hooks dir each session).
#
# stdout of a SessionStart hook is added to the session's context. Kept
# deliberately un-strict: a hook that errors could disrupt session startup.

root="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
cd "$root" 2>/dev/null || exit 0

# Arm the advisory pre-commit guard for this session (no-op if git unavailable).
git config core.hooksPath scripts/git-hooks 2>/dev/null || true

echo "===== Hill Climbing — live repo state ====="
echo "(Authoritative. CLAUDE.md §§1–2/11 is a snapshot that drifts; when it disagrees with the below, the docs are stale — update §§1–2 as part of your change.)"
echo
if [ -x scripts/state.sh ]; then
  ./scripts/state.sh 2>/dev/null || echo "(scripts/state.sh failed to run)"
else
  echo "(scripts/state.sh missing or not executable)"
fi
echo "==========================================="
