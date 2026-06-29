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

free_web_ports() {
  echo "=== Освобождение портов 80/443 ==="
  for svc in nginx apache2 caddy; do
    if sudo_cmd systemctl is-active --quiet "${svc}" 2>/dev/null; then
      echo "Останавливаем системный ${svc}..."
      sudo_cmd systemctl stop "${svc}"
      sudo_cmd systemctl disable "${svc}" 2>/dev/null || true
    fi
  done

  local ids
  ids=$(sudo_cmd sh -c 'docker ps -q --filter publish=80; docker ps -q --filter publish=443' | sort -u || true)
  if [ -n "${ids}" ]; then
    echo "Останавливаем Docker-контейнеры на 80/443..."
    # shellcheck disable=SC2086
    sudo_cmd docker stop ${ids}
  fi

  if sudo_cmd ss -tlnH sport = :80 2>/dev/null | grep -q .; then
    echo "ERROR: порт 80 занят другим процессом:" >&2
    sudo_cmd ss -tlnp sport = :80 || true
    exit 1
  fi
}

free_web_ports

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
