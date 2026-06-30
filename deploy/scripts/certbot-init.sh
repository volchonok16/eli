#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="/var/www/infra/docker-compose.prod.yml"
ENV_FILE="/var/www/be/.env"
# shellcheck source=domains.sh
source /var/www/infra/scripts/domains.sh

EMAIL="${CERTBOT_EMAIL:-admin@xn--e1aaincbri4a7g.xn--p1ai}"

if docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" run --rm --entrypoint test certbot \
  -f "${CERT_DIR}/fullchain.pem" 2>/dev/null; then
  echo "Сертификаты уже выпущены, пропускаем certbot-init"
  exit 0
fi

echo "Запуск nginx (HTTP) для ACME challenge..."
docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" up -d nginx

filter_resolvable_domains

DOMAIN_ARGS=()
for domain in "${DOMAINS[@]}"; do
  DOMAIN_ARGS+=(-d "${domain}")
done

echo "Выпуск сертификатов Let's Encrypt для: ${DOMAINS[*]}"
set +e
docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" run --rm --entrypoint certbot certbot certonly \
  --webroot -w /var/www/certbot \
  --email "${EMAIL}" \
  --agree-tos \
  --no-eff-email \
  "${DOMAIN_ARGS[@]}"
certbot_rc=$?
set -e

if [ "${certbot_rc}" -ne 0 ]; then
  echo "WARNING: certbot не смог выпустить сертификат (код ${certbot_rc})" >&2
  exit 1
fi

echo "Перезапуск nginx с SSL..."
docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" up -d --force-recreate nginx

echo "Сертификаты успешно выпущены"
