#!/bin/bash
# AR queue: 1/day, flat.
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COUNT=1
"$DIR/publish-batch.sh" "$DIR/daily-publish-queue-ar.txt" "$COUNT"
