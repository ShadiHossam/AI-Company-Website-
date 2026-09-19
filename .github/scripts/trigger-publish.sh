#!/usr/bin/env bash
# POSTs the publish webhook for one queue ("en" or "ar") and exits 0 only on 202.
#
# Since 2026-09-17 some GitHub runner IPs get a 503 block page from o2switch's
# front end before the request reaches the app, while other runners get through.
# So retry with a pause, alternating between the two hosts that serve the same
# webhook (staging direct, and prod behind Cloudflare). The server-side
# publish-batch.sh holds a lock, so a late duplicate trigger just waits.
set -uo pipefail
target="$1"
hosts=(http://aicompany.usine.site https://lenooai.com)
attempts=4

for ((i = 0; i < attempts; i++)); do
  url="${hosts[i % 2]}/api/deploy/publish"
  code=$(curl -s -o body.txt -w "%{http_code}" --max-time 30 -X POST "$url" \
    -H "Authorization: Bearer $WEBHOOK_SECRET" \
    -H "Content-Type: application/json" \
    -d "{\"target\":\"$target\"}") || code="curl-exit-$?"
  title=$(grep -o '<title>[^<]*' body.txt 2>/dev/null | head -1 | cut -c8-)
  echo "$target attempt $((i + 1)): $url -> $code ${title:-$(head -c 200 body.txt 2>/dev/null)}"
  [ "$code" = "202" ] && exit 0
  # 401/400 mean we reached the app and something is actually wrong; don't retry.
  case "$code" in 400|401|404) exit 1 ;; esac
  [ $((i + 1)) -lt "$attempts" ] && sleep 45
done
exit 1
