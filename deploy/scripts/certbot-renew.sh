#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="/var/www/infra/docker-compose.prod.yml"
ENV_FILE="/var/www/be/.env"

echo "Проверка и обновление сертификатов..."
docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" run --rm --entrypoint certbot certbot renew --quiet

echo "Перезагрузка nginx..."
docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" exec -T nginx nginx -s reload

echo "Готово"
