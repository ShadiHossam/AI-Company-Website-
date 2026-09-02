#!/bin/bash
# CI counterpart of scripts/daily-publish-ar.sh. Same pacing: 1/day from 2026-08-24, 2/day from 2026-08-30, 3/day from 2026-09-07.
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TODAY="$(date -u +%Y-%m-%d)"
if [[ "$TODAY" > "2026-09-06" ]]; then
  COUNT=3
elif [[ "$TODAY" > "2026-08-30" ]]; then
  COUNT=2
else
  COUNT=1
fi
"$DIR/ci-publish-batch.sh" "$DIR/daily-publish-queue-ar.txt" "$COUNT"
