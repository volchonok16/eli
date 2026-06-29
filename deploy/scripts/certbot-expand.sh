#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="/var/www/infra/docker-compose.prod.yml"
# shellcheck source=domains.sh
source /var/www/infra/scripts/domains.sh

EMAIL="${CERTBOT_EMAIL:-admin@xn--e1aaincbri4a7g.xn--p1ai}"

if ! docker compose -f "${COMPOSE_FILE}" run --rm --entrypoint test certbot \
  -f "${CERT_DIR}/fullchain.pem" 2>/dev/null; then
  echo "Сертификат ещё не выпущен, пропускаем expand"
  exit 0
fi

DOMAIN_ARGS=()
for domain in "${DOMAINS[@]}"; do
  DOMAIN_ARGS+=(-d "${domain}")
done

echo "Расширение сертификата (новые домены)..."
docker compose -f "${COMPOSE_FILE}" run --rm --entrypoint certbot certbot certonly \
  --webroot -w /var/www/certbot \
  --expand \
  --email "${EMAIL}" \
  --agree-tos \
  --no-eff-email \
  "${DOMAIN_ARGS[@]}"

docker compose -f "${COMPOSE_FILE}" up -d --force-recreate nginx

echo "Сертификат расширен"
