#!/bin/bash

set -e

PROJECT="/www/wwwroot/Auroka/auroka-frontend/auroka"
BRANCH="main"
LOG_DIR="$PROJECT/logs"
LOG_FILE="$LOG_DIR/deploy.log"

mkdir -p "$LOG_DIR"

exec >> "$LOG_FILE" 2>&1

echo ""
echo "=========================================="
echo "        AUROKA DEPLOYMENT START"
echo "=========================================="
echo "Date   : $(date '+%Y-%m-%d %H:%M:%S')"
echo "Branch : $BRANCH"
echo "Project: $PROJECT"
echo ""

cd "$PROJECT"

echo "[1/6] Checking Git status..."
git status --short

echo ""
echo "[2/6] Fetching latest source..."
git fetch origin "$BRANCH"

echo ""
echo "[3/6] Updating source..."
git reset --hard "origin/$BRANCH"

echo ""
echo "[4/6] Installing dependencies..."
npm ci

echo ""
echo "[5/6] Building Next.js..."
npm run build

echo ""
echo "[6/6] Restarting PM2..."

if pm2 describe auroka > /dev/null 2>&1; then
    pm2 restart auroka --update-env
else
    pm2 start ecosystem.config.js
fi

pm2 save

echo ""
echo "=========================================="
echo "       AUROKA DEPLOYMENT SUCCESS"
echo "=========================================="
echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""