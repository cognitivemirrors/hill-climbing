#!/usr/bin/env bash
# Hill Climbing — live repo state.
#
# Run this before trusting CLAUDE.md's prose snapshot. The handoff's factual
# sections (§§1–2, 11) rot every time an app is added or a version bumps; this
# script reads the real state so drift is visible in one command.
#
# Read-only (ls / grep / git). No writes, no dependencies.
#
#   ./scripts/state.sh

cd "$(dirname "$0")/.." || exit 1

echo "# Hill Climbing — live state @ $(git rev-parse --short HEAD 2>/dev/null || echo no-git)"
echo

echo "## Apps + in-product version labels"
for f in *.html; do
  label=$(grep -oE 'id="version-label"[^>]*>[^<]+' "$f" 2>/dev/null | sed -E 's/.*>//' | head -1)
  if [ -z "$label" ]; then
    label=$(grep -oE "VERSION *= *['\"][^'\"]+" "$f" 2>/dev/null | sed -E "s/.*['\"]//" | head -1)
  fi
  printf '  %-18s %s\n' "$f" "${label:-—}"
done
echo

echo "## Tier"
grep -oE 'const TIER = [0-9]+' meditate.html 2>/dev/null | sed 's/^/  /' || echo "  (TIER not found)"
echo

echo "## Versioning / workflow"
echo "  git tags:            $(git tag 2>/dev/null | wc -l | tr -d ' ')  (0 = tag convention lapsed; versions live in per-app labels + commit msgs)"
echo "  sw.js CACHE_VERSION: $(grep -oE 'hc-v[0-9.]+' sw.js 2>/dev/null | head -1)"
echo "  recent PR merges:"
git log --oneline -25 2>/dev/null | grep -i 'merge pull request' | head -5 | sed 's/^/    /'
echo

echo "## PWA coverage (apps present vs. precached in sw.js)"
echo "  precached: $(grep -oE '[a-z]+\.html' sw.js 2>/dev/null | sed 's/\.html$//' | sort -u | tr '\n' ' ')"
echo "  NOT precached: $(comm -23 \
  <(ls *.html 2>/dev/null | sed 's/\.html$//' | sort) \
  <(grep -oE '[a-z]+\.html' sw.js 2>/dev/null | sed 's/\.html$//' | sort -u) | tr '\n' ' ')"
echo

echo "## Governance docs — last touched"
for d in CONSTRAINTS.md REQUIREMENTS.md BACKLOG.md KNOWN_RISKS.md CLAUDE.md README.md; do
  printf '  %-16s %s\n' "$d" "$(git log -1 --format='%cs  %s' -- "$d" 2>/dev/null)"
done
