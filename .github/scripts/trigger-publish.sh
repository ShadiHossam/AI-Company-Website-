#!/usr/bin/env bash
# POSTs the publish webhook for one queue ("en" or "ar") and fails the step unless
# the server answers 202. Prints the status and body so a failure says why,
# instead of curl -f's bare "exit code 22".
set -uo pipefail
target="$1"
url="${PUBLISH_WEBHOOK_URL:-http://aicompany.usine.site}/api/deploy/publish"
code=$(curl -s -o body.txt -w "%{http_code}" --max-time 30 -X POST "$url" \
  -H "Authorization: Bearer $WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d "{\"target\":\"$target\"}") || { echo "curl failed (exit $?) reaching $url"; exit 1; }
echo "$target: HTTP $code $(head -c 500 body.txt)"
[ "$code" = "202" ]
