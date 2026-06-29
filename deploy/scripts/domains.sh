CERT_DIR="/etc/letsencrypt/live/xn--e1aaincbri4a7g.xn--p1ai"

DOMAINS=(
  "xn--e1aaincbri4a7g.xn--p1ai"
  "admin.xn--e1aaincbri4a7g.xn--p1ai"
  "api.xn--e1aaincbri4a7g.xn--p1ai"
  "minio.xn--e1aaincbri4a7g.xn--p1ai"
)

domain_resolves() {
  if command -v dig >/dev/null 2>&1; then
    dig +short A "$1" @8.8.8.8 2>/dev/null | grep -qE '^[0-9.]+$'
    return
  fi

  host -t A "$1" 8.8.8.8 2>/dev/null | grep -q 'has address'
}

filter_resolvable_domains() {
  local filtered=()
  local domain

  for domain in "${DOMAINS[@]}"; do
    if domain_resolves "${domain}"; then
      filtered+=("${domain}")
    else
      echo "Пропускаем ${domain}: нет публичной DNS A-записи" >&2
    fi
  done

  if [ "${#filtered[@]}" -eq 0 ]; then
    echo "ERROR: ни один домен из списка не резолвится в публичном DNS" >&2
    return 1
  fi

  DOMAINS=("${filtered[@]}")
}
