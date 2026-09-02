#!/bin/bash
# CI counterpart of scripts/publish-batch.sh (which ran via o2switch server cron).
# Runs from a GitHub Actions runner instead: checkout/commit/push happen on the
# runner's own git remote (already authenticated by actions/checkout), and only
# the staging/prod build+restart steps reach out to o2switch over SSH.
#
# No mkdir-lock here (unlike the server version) because the workflow runs the
# en/ar batches sequentially as dependent jobs instead of via two independent
# cron entries that could fire at the same instant.
#
# Usage: ci-publish-batch.sh <queue_file> <count>
# Requires SSH_KEY_PATH env var pointing at a private key authorized on the
# o2switch host, and astro-site/.env.local already present in the checkout.
set -uo pipefail

QUEUE="$1"
COUNT="$2"
SSH_KEY="${SSH_KEY_PATH:-$HOME/.ssh/id_ed25519_o2switch}"
REMOTE="zash7309@cuivre.o2switch.net"

echo "=== $(date -u) [$(basename "$QUEUE") x$COUNT] ==="

PAGES=()
while IFS= read -r line; do
  [ -n "$line" ] && PAGES+=("$line")
done < <(head -n "$COUNT" "$QUEUE")
if [ "${#PAGES[@]}" -eq 0 ]; then
  echo "Queue empty. Nothing left to publish."
  exit 0
fi

url_for() {
  local f="$1"
  f="${f#astro-site/src/pages}"
  f="${f%.astro}"
  f="${f%/index}"
  [ -z "$f" ] && f="/"
  echo "$f"
}

URLS=()
for p in "${PAGES[@]}"; do
  URLS+=("$(url_for "$p")")
done
echo "Target pages: ${URLS[*]}"

# Stage + commit only if not already committed (idempotent retry support)
TO_ADD=()
for p in "${PAGES[@]}"; do
  if [ -n "$(git status --porcelain -- "$p")" ]; then
    TO_ADD+=("$p")
  fi
done

if [ "${#TO_ADD[@]}" -gt 0 ]; then
  git add "${TO_ADD[@]}"
  if ! git diff --cached --quiet; then
    git commit -m "feat: publish ${URLS[*]}" || { echo "FAIL: commit"; exit 1; }
  fi
else
  echo "Pages already committed, checking if push is still needed (retry of a prior partial run)."
fi

git fetch origin --quiet
if [ -n "$(git log origin/master..HEAD --oneline)" ]; then
  git push origin master || { echo "FAIL: push"; exit 1; }
fi

SHA="$(git rev-parse --short HEAD)"
echo "Deploying HEAD $SHA"

verify_urls() {
  local base="$1"
  local ok=0
  for u in "${URLS[@]}"; do
    local code
    code=$(curl -s -o /dev/null -w "%{http_code}" "${base}${u}")
    echo "$(echo "$base" | grep -q lenooai && echo prod || echo staging) $u -> $code"
    [ "$code" = "200" ] || ok=1
  done
  return $ok
}

# --- STAGING ---
STAGING_OK=1
for attempt in 1 2 3; do
  scp -i "$SSH_KEY" -o StrictHostKeyChecking=accept-new astro-site/.env.local "$REMOTE:/home/zash7309/apps/ai-company-website/astro-site/.env.deploy.tmp"
  ssh -i "$SSH_KEY" -o StrictHostKeyChecking=accept-new "$REMOTE" bash -s <<'EOF'
set -e
source /home/zash7309/nodevenv/apps/ai-company-website/astro-site/22/bin/activate
cd /home/zash7309/apps/ai-company-website/astro-site
git fetch origin --quiet
git checkout master --quiet
git pull origin master --quiet
npm install --include=dev --silent
set -a; source .env.deploy.tmp; set +a
RAYON_NUM_THREADS=2 DEPLOY_TARGET=o2switch IS_STAGING=true SITE_URL=https://aicompany.usine.site NODE_ENV=production npx astro build
rm -f .env.deploy.tmp
/usr/sbin/cloudlinux-selector restart --json --interpreter nodejs --domain aicompany.usine.site --app-root apps/ai-company-website/astro-site
EOF
  if [ $? -eq 0 ]; then
    STAGING_OK=0
    break
  fi
  echo "staging deploy attempt $attempt failed, retrying after cooldown..."
  sleep 30
done
if [ "$STAGING_OK" -ne 0 ]; then echo "FAIL: staging deploy (3 attempts)"; exit 1; fi

sleep 6
if ! verify_urls "http://aicompany.usine.site"; then
  echo "ABORT: staging verify failed. Queue not advanced, prod not touched."
  exit 1
fi

# --- PROD ---
sleep 25

PROD_OK=1
for attempt in 1 2 3; do
  scp -i "$SSH_KEY" -o StrictHostKeyChecking=accept-new astro-site/.env.local "$REMOTE:/home/zash7309/apps/lenooai-com/repo/astro-site/.env.deploy.tmp"
  ssh -i "$SSH_KEY" -o StrictHostKeyChecking=accept-new "$REMOTE" bash -s <<'EOF'
set -e
source /home/zash7309/nodevenv/apps/lenooai-com/repo/astro-site/22/bin/activate
cd /home/zash7309/apps/lenooai-com/repo/astro-site
git fetch origin --quiet
git checkout master --quiet
git pull origin master --quiet
npm install --include=dev --silent
set -a; source .env.deploy.tmp; set +a
RAYON_NUM_THREADS=2 DEPLOY_TARGET=o2switch IS_STAGING=false SITE_URL=https://lenooai.com NODE_ENV=production npx astro build
rm -f .env.deploy.tmp
/usr/sbin/cloudlinux-selector restart --json --interpreter nodejs --domain lenooai.com --app-root apps/lenooai-com/repo/astro-site
EOF
  if [ $? -eq 0 ]; then
    PROD_OK=0
    break
  fi
  echo "prod deploy attempt $attempt failed, retrying after cooldown..."
  sleep 30
done
if [ "$PROD_OK" -ne 0 ]; then echo "FAIL: prod deploy (3 attempts)"; exit 1; fi

sleep 6
if ! verify_urls "https://lenooai.com"; then
  echo "ABORT: prod verify failed. Queue not advanced, needs manual check."
  exit 1
fi

# Success: pop the published pages off the queue
tail -n +$((${#PAGES[@]} + 1)) "$QUEUE" > "$QUEUE.tmp" && mv "$QUEUE.tmp" "$QUEUE"
git add "$QUEUE"
git commit -m "chore: advance $(basename "$QUEUE") after publishing ${URLS[*]}"
git push origin master
echo "SUCCESS: published ${URLS[*]}. $(wc -l < "$QUEUE" | tr -d ' ') pages remaining in $(basename "$QUEUE")."
