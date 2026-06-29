#!/bin/sh
set -e

CERT_DIR="/etc/letsencrypt/live/xn--e1aaincbri4a7g.xn--p1ai"
CONF_DIR="/etc/nginx/conf.d"

rm -f "${CONF_DIR}"/*.conf

if [ -f "${CERT_DIR}/fullchain.pem" ] && [ -f "${CERT_DIR}/privkey.pem" ]; then
  cp /etc/nginx/templates/ssl/*.conf "${CONF_DIR}/"
else
  cp /etc/nginx/templates/http/*.conf "${CONF_DIR}/"
fi

exec nginx -g "daemon off;"
