#!/bin/bash
# CI counterpart of scripts/daily-publish-en.sh. Same pacing: 2/day, bumps to 3/day from 2026-09-01 onward.
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TODAY="$(date -u +%Y-%m-%d)"
if [[ "$TODAY" > "2026-08-31" ]]; then
  COUNT=3
else
  COUNT=2
fi
"$DIR/ci-publish-batch.sh" "$DIR/daily-publish-queue.txt" "$COUNT"
