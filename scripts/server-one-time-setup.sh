#!/usr/bin/env bash
# One-time setup on Alibaba Cloud Linux 3 (run as root or with sudo).
set -euo pipefail

DEPLOY_USER="${DEPLOY_USER:-deploy}"
DEPLOY_PATH="${DEPLOY_PATH:-/home/${DEPLOY_USER}/china}"
NODE_MAJOR="${NODE_MAJOR:-22}"

echo "==> Install Node.js ${NODE_MAJOR}, pnpm, pm2, rsync"
curl -fsSL https://rpm.nodesource.com/setup_${NODE_MAJOR}.x | bash -
dnf install -y nodejs rsync
npm install -g pnpm pm2

echo "==> Create deploy user and directory"
id "${DEPLOY_USER}" &>/dev/null || useradd -m -s /bin/bash "${DEPLOY_USER}"
mkdir -p "${DEPLOY_PATH}"
chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "${DEPLOY_PATH}"

echo "==> PM2 startup on boot (run the command pm2 prints if different)"
sudo -u "${DEPLOY_USER}" env DEPLOY_PATH="${DEPLOY_PATH}" bash -lc '
  cd "$DEPLOY_PATH"
  pm2 startup systemd -u "$USER" --hp "$HOME" || true
'

cat <<EOF

Done. Next steps (manual):

1. As ${DEPLOY_USER}, add your GitHub Actions deploy public key to:
   ~/.ssh/authorized_keys

2. Create ${DEPLOY_PATH}/.env with runtime secrets:
   DASHSCOPE_API_KEY=...
   QWEN_MODEL=qwen-plus
   QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
   BOCHA_API_KEY=...

3. In GitHub repo → Settings → Secrets, set:
   SSH_HOST, SSH_USER, SSH_PRIVATE_KEY, DEPLOY_PATH=${DEPLOY_PATH}
   VITE_BAIDU_TONGJI_ID (for CI build)

4. Push to main — Actions will rsync .output/ and restart PM2.

EOF
