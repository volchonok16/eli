#!/usr/bin/env bash
set -euo pipefail

SSH_IP="${SSH_IP:?}"
SSH_USER="${SSH_USER:?}"
SSH_PORT="${SSH_PORT:-22}"
SSH_PASS="${SSH_PASS:?}"
SSH_SUDO_PASS="${SSH_SUDO_PASS:?}"
ENV_FILE="${ENV_FILE:?}"

SSH_OPTS=(-p "${SSH_PORT}" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null)

ssh_cmd() {
  sshpass -p "${SSH_PASS}" ssh "${SSH_OPTS[@]}" "${SSH_USER}@${SSH_IP}" "$@"
}

sudo_remote() {
  local escaped
  escaped=$(printf '%q' "$*")
  ssh_cmd "echo '${SSH_SUDO_PASS}' | sudo -S bash -c ${escaped}"
}

rsync_to_remote() {
  local src="$1"
  local dest="$2"
  local tmp="/home/${SSH_USER}/deploy-tmp/$(basename "${dest}")"

  ssh_cmd "mkdir -p /home/${SSH_USER}/deploy-tmp"
  sshpass -p "${SSH_PASS}" rsync -az --delete \
    -e "ssh ${SSH_OPTS[*]}" \
    "${src}" "${SSH_USER}@${SSH_IP}:${tmp}/"
  sudo_remote "mkdir -p ${dest} && rsync -a --delete ${tmp}/ ${dest}/"
  ssh_cmd "rm -rf /home/${SSH_USER}/deploy-tmp"
}

echo "=== Создание директорий на сервере ==="
sudo_remote "mkdir -p /var/www/admin /var/www/app /var/www/be /var/www/infra/scripts"
sudo_remote "chown -R ${SSH_USER}:${SSH_USER} /var/www/admin /var/www/app /var/www/be /var/www/infra"

echo "=== Деплой admin ==="
rsync_to_remote "admin/dist/" "/var/www/admin"

echo "=== Деплой frontend ==="
rsync_to_remote "frontend/dist/" "/var/www/app"

echo "=== Деплой backend ==="
ssh_cmd "mkdir -p /home/${SSH_USER}/deploy-tmp/be"
sshpass -p "${SSH_PASS}" rsync -az \
  -e "ssh ${SSH_OPTS[*]}" \
  --delete \
  be/dist/ be/package.json be/package-lock.json be/prisma/ be/Dockerfile be/.dockerignore \
  "${SSH_USER}@${SSH_IP}:/home/${SSH_USER}/deploy-tmp/be/"
sudo_remote "mkdir -p /var/www/be && rsync -a --delete /home/${SSH_USER}/deploy-tmp/be/ /var/www/be/"
ssh_cmd "rm -rf /home/${SSH_USER}/deploy-tmp/be"

echo "=== Деплой инфраструктуры ==="
ssh_cmd "mkdir -p /home/${SSH_USER}/deploy-tmp/infra"
sshpass -p "${SSH_PASS}" rsync -az \
  -e "ssh ${SSH_OPTS[*]}" \
  deploy/ \
  "${SSH_USER}@${SSH_IP}:/home/${SSH_USER}/deploy-tmp/infra/"
sudo_remote "rsync -a /home/${SSH_USER}/deploy-tmp/infra/ /var/www/infra/"
sudo_remote "find /var/www/infra/scripts -name '*.sh' -exec chmod +x {} +"
sudo_remote "chmod +x /var/www/infra/nginx/docker-entrypoint.sh"
ssh_cmd "rm -rf /home/${SSH_USER}/deploy-tmp/infra"

echo "=== Запись .env и post-deploy ==="
printf '%s' "${ENV_FILE}" | ssh_cmd "cat > /tmp/be.env"
sudo_remote "cp /tmp/be.env /var/www/be/.env && chmod 600 /var/www/be/.env && chown ${SSH_USER}:${SSH_USER} /var/www/be/.env && rm -f /tmp/be.env"

ssh_cmd "SSH_SUDO_PASS='${SSH_SUDO_PASS}' bash -s" < deploy/scripts/remote-post-deploy.sh
