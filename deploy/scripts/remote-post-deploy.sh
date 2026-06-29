#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="/var/www/infra/docker-compose.prod.yml"
SUDO_PASS="${SSH_SUDO_PASS:?SSH_SUDO_PASS is required}"

sudo_cmd() {
  echo "${SUDO_PASS}" | sudo -S "$@"
}

echo "=== Docker Compose: поднятие сервисов ==="
cd /var/www/infra
sudo_cmd docker compose -f "${COMPOSE_FILE}" up -d --build --remove-orphans

echo "=== Certbot: выпуск/проверка сертификатов ==="
if sudo_cmd docker compose -f "${COMPOSE_FILE}" run --rm --entrypoint test certbot \
  -f /etc/letsencrypt/live/xn--e1aaincbri4a7g.xn--p1ai/fullchain.pem 2>/dev/null; then
  sudo_cmd bash /var/www/infra/scripts/certbot-expand.sh
  sudo_cmd bash /var/www/infra/scripts/certbot-renew.sh
else
  sudo_cmd bash /var/www/infra/scripts/certbot-init.sh
fi

echo "=== Деплой завершён ==="
