#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="/var/www/infra/docker-compose.prod.yml"
ENV_FILE="/var/www/be/.env"
# shellcheck source=domains.sh
source /var/www/infra/scripts/domains.sh

EMAIL="${CERTBOT_EMAIL:-admin@xn--e1aaincbri4a7g.xn--p1ai}"

if ! docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" run --rm --entrypoint test certbot \
  -f "${CERT_DIR}/fullchain.pem" 2>/dev/null; then
  echo "Сертификат ещё не выпущен, пропускаем expand"
  exit 0
fi

filter_resolvable_domains

cert_domains=$(
  docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" run --rm --entrypoint sh certbot \
    -c "openssl x509 -in ${CERT_DIR}/fullchain.pem -noout -text 2>/dev/null | sed -n 's/.*DNS://p'"
)

missing_domains=()
for domain in "${DOMAINS[@]}"; do
  if ! printf '%s\n' "${cert_domains}" | grep -qxF "${domain}"; then
    missing_domains+=("${domain}")
  fi
done

if [ "${#missing_domains[@]}" -eq 0 ]; then
  echo "Сертификат уже покрывает все домены с DNS: ${DOMAINS[*]}"
  exit 0
fi

DOMAIN_ARGS=()
for domain in "${DOMAINS[@]}"; do
  DOMAIN_ARGS+=(-d "${domain}")
done

echo "Расширение сертификата, новые домены: ${missing_domains[*]}"
set +e
docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" run --rm --entrypoint certbot certbot certonly \
  --webroot -w /var/www/certbot \
  --expand \
  --email "${EMAIL}" \
  --agree-tos \
  --no-eff-email \
  "${DOMAIN_ARGS[@]}"
certbot_rc=$?
set -e

if [ "${certbot_rc}" -ne 0 ]; then
  echo "WARNING: certbot expand завершился с кодом ${certbot_rc}" >&2
  exit 1
fi

docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" up -d --force-recreate nginx

echo "Сертификат расширен"
