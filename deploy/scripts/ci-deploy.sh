#!/usr/bin/env bash
set -euo pipefail

SSH_IP="${SSH_IP:?SSH_IP is required}"
SSH_USER="${SSH_USER:?SSH_USER is required}"
SSH_PORT="${SSH_PORT:-22}"
SSH_PASS="${SSH_PASS:?SSH_PASS is required}"
SSH_SUDO_PASS="${SSH_SUDO_PASS:?SSH_SUDO_PASS is required}"
ENV_FILE="${ENV_FILE:?ENV_FILE is required}"

SSH_OPTS=(-p "${SSH_PORT}" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null)
SUDO_PASS_B64=$(printf '%s' "${SSH_SUDO_PASS}" | base64 -w0)

trap 'echo "Deploy failed at line ${LINENO}" >&2' ERR

ssh_cmd() {
  SSHPASS="${SSH_PASS}" sshpass -e ssh "${SSH_OPTS[@]}" "${SSH_USER}@${SSH_IP}" "$@"
}

sudo_remote() {
  local escaped
  escaped=$(printf '%q' "$*")
  ssh_cmd "printf '%s' '${SUDO_PASS_B64}' | base64 -d | sudo -S -p '' bash -c ${escaped}"
}

rsync_to_remote() {
  local src="$1"
  local dest="$2"
  local tmp="/home/${SSH_USER}/deploy-tmp/$(basename "${dest}")"

  ssh_cmd "mkdir -p /home/${SSH_USER}/deploy-tmp"
  SSHPASS="${SSH_PASS}" sshpass -e rsync -az --delete \
    -e "ssh -p ${SSH_PORT} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" \
    "${src}" "${SSH_USER}@${SSH_IP}:${tmp}/"
  sudo_remote "mkdir -p ${dest} && rsync -a --delete ${tmp}/ ${dest}/"
  ssh_cmd "rm -rf /home/${SSH_USER}/deploy-tmp"
}

echo "=== Deploy started: ${SSH_USER}@${SSH_IP}:${SSH_PORT} ==="

echo "=== Проверка SSH ==="
ssh_cmd "echo ok"

echo "=== Создание директорий на сервере ==="
sudo_remote "mkdir -p /var/www/admin /var/www/app /var/www/be /var/www/infra"
sudo_remote "chown -R ${SSH_USER}:${SSH_USER} /var/www/admin /var/www/app /var/www/be /var/www/infra"

echo "=== Деплой admin ==="
rsync_to_remote "admin/dist/" "/var/www/admin"

echo "=== Деплой frontend ==="
rsync_to_remote "frontend/dist/" "/var/www/app"

echo "=== Деплой backend ==="
ssh_cmd "mkdir -p /home/${SSH_USER}/deploy-tmp/be"
SSHPASS="${SSH_PASS}" sshpass -e rsync -az \
  -e "ssh -p ${SSH_PORT} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" \
  --delete \
  be/dist be/package.json be/package-lock.json be/prisma be/Dockerfile be/.dockerignore \
  "${SSH_USER}@${SSH_IP}:/home/${SSH_USER}/deploy-tmp/be/"
sudo_remote "mkdir -p /var/www/be && rsync -a --delete /home/${SSH_USER}/deploy-tmp/be/ /var/www/be/"
ssh_cmd "rm -rf /home/${SSH_USER}/deploy-tmp/be"

echo "=== Деплой инфраструктуры ==="
ssh_cmd "mkdir -p /home/${SSH_USER}/deploy-tmp/infra"
SSHPASS="${SSH_PASS}" sshpass -e rsync -az \
  -e "ssh -p ${SSH_PORT} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" \
  deploy/ \
  "${SSH_USER}@${SSH_IP}:/home/${SSH_USER}/deploy-tmp/infra/"
sudo_remote "rsync -a /home/${SSH_USER}/deploy-tmp/infra/ /var/www/infra/"
sudo_remote "chmod +x /var/www/infra/nginx/docker-entrypoint.sh || true"
sudo_remote "for f in /var/www/infra/scripts/*.sh; do [ -f \"\$f\" ] && chmod +x \"\$f\"; done"
ssh_cmd "rm -rf /home/${SSH_USER}/deploy-tmp/infra"

echo "=== Запись .env и post-deploy ==="
printf '%s' "${ENV_FILE}" | ssh_cmd "cat > /tmp/be.env"
sudo_remote "install -m 600 -o ${SSH_USER} -g ${SSH_USER} /tmp/be.env /var/www/be/.env && rm -f /tmp/be.env"

ssh_cmd "export SSH_SUDO_PASS=\$(printf '%s' '${SUDO_PASS_B64}' | base64 -d); bash -s" \
  < deploy/scripts/remote-post-deploy.sh

echo "=== Deploy finished successfully ==="
