#!/bin/bash
# Publishes the next 2 pages from daily-publish-queue.txt: commit -> push -> staging build+verify -> prod build+verify.
# Idempotent: safe to re-run if a previous run failed partway (won't double-commit, won't advance the queue on failure).
set -uo pipefail

REPO="/Users/chadihossam/Documents/Claude Code Project/AI Company"
QUEUE="$REPO/scripts/daily-publish-queue.txt"
LOG="$REPO/scripts/daily-publish.log"
SSH_KEY="$HOME/.ssh/id_ed25519_o2switch"
REMOTE="zash7309@cuivre.o2switch.net"
GIT_DEPLOY_KEY="$HOME/.ssh/id_ed25519_lenooai_deploy"
GIT_SSH_REMOTE="git@github.com:ShadiHossam/AI-Company-Website-.git"

exec >> "$LOG" 2>&1
echo "=== $(date) ==="

cd "$REPO" || { echo "FATAL: repo not found"; exit 1; }

PAGES=()
while IFS= read -r line; do
  [ -n "$line" ] && PAGES+=("$line")
done < <(head -n 2 "$QUEUE")
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

URL1="$(url_for "${PAGES[0]}")"
URL2="${PAGES[1]:+$(url_for "${PAGES[1]}")}"

echo "Target pages: $URL1 ${URL2:-}"

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
    git commit -m "feat: publish $URL1${URL2:+, $URL2}" || { echo "FAIL: commit"; exit 1; }
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

# --- STAGING ---
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
DEPLOY_TARGET=o2switch IS_STAGING=true SITE_URL=https://aicompany.usine.site NODE_ENV=production npx astro build
rm -f .env.deploy.tmp
/usr/sbin/cloudlinux-selector restart --json --interpreter nodejs --domain aicompany.usine.site --app-root apps/ai-company-website/astro-site
EOF
if [ $? -ne 0 ]; then echo "FAIL: staging deploy"; exit 1; fi

sleep 6
S1=$(curl -s -o /dev/null -w "%{http_code}" "http://aicompany.usine.site${URL1}")
echo "staging $URL1 -> $S1"
if [ -n "${URL2:-}" ]; then
  S2=$(curl -s -o /dev/null -w "%{http_code}" "http://aicompany.usine.site${URL2}")
  echo "staging $URL2 -> $S2"
else
  S2=200
fi

if [ "$S1" != "200" ] || [ "$S2" != "200" ]; then
  echo "ABORT: staging verify failed ($URL1=$S1 $URL2=${S2:-n/a}). Queue not advanced, prod not touched."
  exit 1
fi

# --- PROD ---
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
DEPLOY_TARGET=o2switch IS_STAGING=false SITE_URL=https://lenooai.com NODE_ENV=production npx astro build
rm -f .env.deploy.tmp
/usr/sbin/cloudlinux-selector restart --json --interpreter nodejs --domain lenooai.com --app-root apps/lenooai-com/repo/astro-site
EOF
if [ $? -ne 0 ]; then echo "FAIL: prod deploy"; exit 1; fi

sleep 6
P1=$(curl -s -o /dev/null -w "%{http_code}" "https://lenooai.com${URL1}")
echo "prod $URL1 -> $P1"
if [ -n "${URL2:-}" ]; then
  P2=$(curl -s -o /dev/null -w "%{http_code}" "https://lenooai.com${URL2}")
  echo "prod $URL2 -> $P2"
else
  P2=200
fi

if [ "$P1" != "200" ] || [ "$P2" != "200" ]; then
  echo "ABORT: prod verify failed ($URL1=$P1 $URL2=${P2:-n/a}). Queue not advanced, needs manual check."
  exit 1
fi

# Success: pop the published pages off the queue
tail -n +$((${#PAGES[@]} + 1)) "$QUEUE" > "$QUEUE.tmp" && mv "$QUEUE.tmp" "$QUEUE"
echo "SUCCESS: published $URL1${URL2:+, $URL2}. $(wc -l < "$QUEUE" | tr -d ' ') pages remaining in queue."
