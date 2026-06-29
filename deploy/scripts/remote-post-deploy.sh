#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="/var/www/infra/docker-compose.prod.yml"
ENV_FILE="/var/www/be/.env"
SUDO_PASS="${SSH_SUDO_PASS:?SSH_SUDO_PASS is required}"

trap 'echo "Post-deploy failed at line ${LINENO}" >&2' ERR

sudo_cmd() {
  printf '%s' "${SUDO_PASS}" | sudo -S -p '' "$@"
}

echo "=== Проверка Docker ==="
if ! sudo_cmd docker --version >/dev/null 2>&1; then
  echo "ERROR: docker не установлен на сервере" >&2
  exit 1
fi

if ! sudo_cmd docker compose version; then
  echo "ERROR: docker compose plugin не найден на сервере" >&2
  exit 1
fi

compose() {
  sudo_cmd docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" "$@"
}

echo "=== Docker Compose: поднятие сервисов ==="
compose up -d --build --remove-orphans

echo "=== Certbot: выпуск/проверка сертификатов ==="
if compose run --rm --entrypoint test certbot \
  -f /etc/letsencrypt/live/xn--e1aaincbri4a7g.xn--p1ai/fullchain.pem 2>/dev/null; then
  sudo_cmd bash /var/www/infra/scripts/certbot-expand.sh
  sudo_cmd bash /var/www/infra/scripts/certbot-renew.sh
else
  sudo_cmd bash /var/www/infra/scripts/certbot-init.sh
fi

echo "=== Деплой завершён ==="
