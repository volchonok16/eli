#!/bin/sh
set -e

CERT_DIR="/etc/letsencrypt/live/xn--e1aaincbri4a7g.xn--p1ai"
CONF_DIR="/etc/nginx/conf.d"

rm -f "${CONF_DIR}"/*.conf

cert_has_domain() {
  domain="$1"
  openssl x509 -in "${CERT_DIR}/fullchain.pem" -noout -text 2>/dev/null \
    | grep -q "DNS:${domain}"
}

ssl_conf_covered_by_cert() {
  ssl_conf="$1"
  domain

  while read -r domain; do
    [ -n "${domain}" ] || continue
    domain=${domain%;}
    if ! cert_has_domain "${domain}"; then
      return 1
    fi
  done <<EOF
$(awk '/listen 443 ssl/,/^}/ {
  if ($1 == "server_name") {
    for (i = 2; i <= NF; i++) print $i
  }
}' "${ssl_conf}")
EOF

  return 0
}

if [ -f "${CERT_DIR}/fullchain.pem" ] && [ -f "${CERT_DIR}/privkey.pem" ]; then
  for ssl_conf in /etc/nginx/templates/ssl/*.conf; do
    name=$(basename "${ssl_conf}")
    if ssl_conf_covered_by_cert "${ssl_conf}"; then
      cp "${ssl_conf}" "${CONF_DIR}/"
    elif [ -f "/etc/nginx/templates/http/${name}" ]; then
      cp "/etc/nginx/templates/http/${name}" "${CONF_DIR}/"
    fi
  done
else
  cp /etc/nginx/templates/http/*.conf "${CONF_DIR}/"
fi

exec nginx -g "daemon off;"
