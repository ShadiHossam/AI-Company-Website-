#!/usr/bin/env bash
# POSTs the publish webhook for one queue ("en" or "ar") and exits 0 only on 202.
#
# Since 2026-09-17 some GitHub runner IPs get a 503 block page from o2switch's
# front end before the request reaches the app, while other runners get through.
# So retry with a pause. Only the HTTPS prod host is used: the bearer secret must
# never go over plain HTTP, and staging still has no trusted certificate. The
# server-side publish-batch.sh holds a lock, so a late duplicate trigger just waits.
set -uo pipefail
target="$1"
attempts=4

path=/api/deploy/publish
body="{\"target\":\"$target\"}"

for ((i = 0; i < attempts; i++)); do
  url="https://lenooai.com$path"
  # Signed per attempt (see astro-site/src/lib/webhookAuth.ts): the server
  # rejects requests older than 5 minutes and any signature it has seen.
  ts=$(date +%s)
  sig=$(printf '%s' "$ts.POST.$path.$body" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" -hex | sed 's/^.* //')
  code=$(curl -s -o body.txt -w "%{http_code}" --max-time 30 -X POST "$url" \
    -H "X-Timestamp: $ts" \
    -H "X-Signature: $sig" \
    -H "Content-Type: application/json" \
    -d "$body") || code="curl-exit-$?"
  title=$(grep -o '<title>[^<]*' body.txt 2>/dev/null | head -1 | cut -c8-)
  echo "$target attempt $((i + 1)): $url -> $code ${title:-$(head -c 200 body.txt 2>/dev/null)}"
  [ "$code" = "202" ] && exit 0
  # 401/400 mean we reached the app and something is actually wrong; don't retry.
  case "$code" in 400|401|404) exit 1 ;; esac
  [ $((i + 1)) -lt "$attempts" ] && sleep 45
done
exit 1
