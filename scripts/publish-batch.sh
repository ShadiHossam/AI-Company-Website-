#!/bin/bash
# Publishes the next N pages from a queue file: commit -> push -> staging build+verify -> prod build+verify.
# Idempotent: safe to re-run if a previous run failed partway (won't double-commit, won't advance the queue on failure).
# Usage: publish-batch.sh <queue_file> <count>
set -uo pipefail

REPO="/Users/chadihossam/Documents/Claude Code Project/AI Company"
QUEUE="$1"
COUNT="$2"
LOG="$REPO/scripts/daily-publish.log"
SSH_KEY="$HOME/.ssh/id_ed25519_o2switch"
REMOTE="zash7309@cuivre.o2switch.net"
GIT_DEPLOY_KEY="$HOME/.ssh/id_ed25519_lenooai_deploy"
GIT_SSH_REMOTE="git@github.com:ShadiHossam/AI-Company-Website-.git"

exec >> "$LOG" 2>&1
echo "=== $(date) [$(basename "$QUEUE") x$COUNT] ==="

cd "$REPO" || { echo "FATAL: repo not found"; exit 1; }

# Lock: EN and AR share this one repo/remote. launchd's catch-up-after-sleep can fire
# both at the same instant, and two concurrent git pushes to the same branch collide
# (non-fast-forward rejection). mkdir is atomic across processes, so use it as a lock.
LOCKDIR="$REPO/scripts/.publish.lock"
LOCK_WAIT=0
while ! mkdir "$LOCKDIR" 2>/dev/null; do
  LOCK_WAIT=$((LOCK_WAIT + 5))
  if [ "$LOCK_WAIT" -ge 600 ]; then
    echo "FATAL: could not acquire publish lock after 10 minutes (another run stuck?)"
    exit 1
  fi
  sleep 5
done
trap 'rmdir "$LOCKDIR" 2>/dev/null' EXIT

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
  GIT_SSH_COMMAND="ssh -i $GIT_DEPLOY_KEY -o IdentitiesOnly=yes" git push "$GIT_SSH_REMOTE" master:master || { echo "FAIL: push"; exit 1; }
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
# Remote builds occasionally crash (esbuild/rolldown worker killed) under this host's
# CloudLinux LVE resource limits, so retry with a cooldown before giving up.
STAGING_OK=1
for attempt in 1 2 3; do
  scp -i "$SSH_KEY" "$REPO/astro-site/.env.local" "$REMOTE:/home/zash7309/apps/ai-company-website/astro-site/.env.deploy.tmp"
  ssh -i "$SSH_KEY" "$REMOTE" bash -s <<'EOF'
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
# Cooldown: back-to-back staging+prod builds can hit the host's CloudLinux LVE resource
# limits (esbuild/rolldown worker crashes), so give it a moment before the second build.
sleep 25

PROD_OK=1
for attempt in 1 2 3; do
  scp -i "$SSH_KEY" "$REPO/astro-site/.env.local" "$REMOTE:/home/zash7309/apps/lenooai-com/repo/astro-site/.env.deploy.tmp"
  ssh -i "$SSH_KEY" "$REMOTE" bash -s <<'EOF'
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
echo "SUCCESS: published ${URLS[*]}. $(wc -l < "$QUEUE" | tr -d ' ') pages remaining in $(basename "$QUEUE")."
