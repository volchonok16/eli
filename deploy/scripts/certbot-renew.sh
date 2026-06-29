#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="/var/www/infra/docker-compose.prod.yml"

echo "Проверка и обновление сертификатов..."
docker compose -f "${COMPOSE_FILE}" run --rm --entrypoint certbot certbot renew --quiet

echo "Перезагрузка nginx..."
docker compose -f "${COMPOSE_FILE}" exec -T nginx nginx -s reload

echo "Готово"
