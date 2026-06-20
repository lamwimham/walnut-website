#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${DOMAIN:-dl.walnut.evofarm.top}"
DEPLOY_PATH="${VULTR_DEPLOY_PATH:-/var/www/walnut/downloads}"
LETSENCRYPT_EMAIL="${LETSENCRYPT_EMAIL:-admin@evofarm.top}"
LIMITS_CONF="/etc/nginx/conf.d/walnut-download-limits.conf"
LOG_FORMAT_CONF="/etc/nginx/conf.d/walnut-download-log-format.conf"
GEOIP_CONF="/etc/nginx/conf.d/walnut-download-geoip.conf"
SNIPPET_CONF="/etc/nginx/snippets/walnut-download-common.conf"
SITE_CONF="/etc/nginx/sites-available/walnut-downloads"
ACCESS_LOG="/var/log/nginx/walnut-downloads-access.log"
ERROR_LOG="/var/log/nginx/walnut-downloads-error.log"
STATS_SCRIPT="/usr/local/bin/walnut-generate-download-stats"
STATS_STATE_DIR="/var/lib/walnut-download-stats"
STATS_STATE_FILE="${STATS_STATE_DIR}/state.json"
STATS_PUBLIC_DIR="${DEPLOY_PATH}/stats"
STATS_PUBLIC_FILE="${STATS_PUBLIC_DIR}/stats.json"
STATS_LOG="/var/log/walnut-download-stats.log"
STATS_CRON="/etc/cron.d/walnut-download-stats"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GENERATOR_SRC="${SCRIPT_DIR}/generate-download-stats.py"
CERT_FULLCHAIN="/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"
CERT_KEY="/etc/letsencrypt/live/${DOMAIN}/privkey.pem"
CERT_OPTIONS="/etc/letsencrypt/options-ssl-nginx.conf"
CERT_DHPARAM="/etc/letsencrypt/ssl-dhparams.pem"

if [[ "${EUID}" -eq 0 ]]; then
  SUDO=()
else
  SUDO=(sudo)
fi

if [[ ! "${DOMAIN}" =~ ^[a-zA-Z0-9.-]+$ ]]; then
  echo "Invalid DOMAIN: ${DOMAIN}" >&2
  exit 1
fi

if [[ ! "${DEPLOY_PATH}" =~ ^/[a-zA-Z0-9._/-]+$ ]]; then
  echo "Invalid VULTR_DEPLOY_PATH: ${DEPLOY_PATH}" >&2
  exit 1
fi

if [[ ! -f "${GENERATOR_SRC}" ]]; then
  echo "Missing stats generator: ${GENERATOR_SRC}" >&2
  exit 1
fi

is_installed() {
  dpkg-query -W -f='${Status}' "$1" 2>/dev/null | grep -q 'install ok installed'
}

install_missing_packages() {
  local missing=()
  local package
  for package in "$@"; do
    if ! is_installed "${package}"; then
      missing+=("${package}")
    fi
  done

  if ((${#missing[@]})); then
    echo "Installing packages: ${missing[*]}"
    if ! "${SUDO[@]}" apt-get update; then
      echo "apt-get update failed; trying install with existing package lists." >&2
    fi
    "${SUDO[@]}" apt-get install -y "${missing[@]}"
  fi
}

write_limits_conf() {
  echo "Installing Nginx rate-limit zone..."
  "${SUDO[@]}" tee "${LIMITS_CONF}" >/dev/null <<'EOF'
limit_conn_zone $binary_remote_addr zone=walnut_downloads:10m;
limit_req_zone $binary_remote_addr zone=walnut_download_requests:10m rate=120r/m;
EOF
}

write_geoip_conf() {
  echo "Installing GeoIP country database and Nginx module..."
  install_missing_packages libnginx-mod-http-geoip geoip-database
  if [[ ! -f /usr/share/GeoIP/GeoIP.dat ]]; then
    echo "GeoIP country database is missing: /usr/share/GeoIP/GeoIP.dat" >&2
    exit 1
  fi

  "${SUDO[@]}" tee "${GEOIP_CONF}" >/dev/null <<'EOF'
geoip_country /usr/share/GeoIP/GeoIP.dat;
EOF
}

write_log_format_conf() {
  echo "Installing structured download access log format..."
  "${SUDO[@]}" tee "${LOG_FORMAT_CONF}" >/dev/null <<'EOF'
log_format walnut_downloads_json escape=json
  '{'
  '"time":"$time_iso8601",'
  '"remote_addr":"$remote_addr",'
  '"method":"$request_method",'
  '"uri":"$request_uri",'
  '"status":$status,'
  '"body_bytes_sent":$body_bytes_sent,'
  '"bytes_sent":$bytes_sent,'
  '"country_code":"$geoip_country_code",'
  '"country_name":"$geoip_country_name",'
  '"cf_country":"$http_cf_ipcountry",'
  '"vercel_country":"$http_x_vercel_ip_country",'
  '"vercel_region":"$http_x_vercel_ip_country_region",'
  '"x_country":"$http_x_country",'
  '"x_region":"$http_x_region",'
  '"x_geo_country":"$http_x_geo_country",'
  '"x_geo_region":"$http_x_geo_region",'
  '"cloudfront_country":"$http_cloudfront_viewer_country"'
  '}';
EOF
}

write_snippet_conf() {
  echo "Installing shared download headers and limits..."
  "${SUDO[@]}" tee "${SNIPPET_CONF}" >/dev/null <<'EOF'
limit_conn walnut_downloads 8;
limit_conn_status 429;
limit_req zone=walnut_download_requests burst=240 nodelay;
limit_req_status 429;
limit_rate_after 10m;
limit_rate 20m;
max_ranges 4;
add_header Accept-Ranges bytes always;
add_header Access-Control-Allow-Origin "*" always;
EOF
}

write_http_site_conf() {
  echo "Installing HTTP download mirror server block..."
  "${SUDO[@]}" tee "${SITE_CONF}" >/dev/null <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;

    location = /downloads/latest/stats.json {
        alias ${STATS_PUBLIC_FILE};
        include /etc/nginx/snippets/walnut-download-common.conf;
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
    }

    location /downloads/versions/ {
        alias ${DEPLOY_PATH}/versions/;
        include /etc/nginx/snippets/walnut-download-common.conf;
        add_header Cache-Control "public, max-age=604800, immutable" always;
    }

    location /downloads/latest/ {
        alias ${DEPLOY_PATH}/latest/;
        include /etc/nginx/snippets/walnut-download-common.conf;
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
    }

    location = /nginx-health {
        access_log off;
        add_header Content-Type text/plain;
        return 200 "Nginx OK\n";
    }

    location / {
        return 404;
    }

    access_log ${ACCESS_LOG} walnut_downloads_json;
    error_log ${ERROR_LOG};
}
EOF
}

write_tls_site_conf() {
  echo "Installing HTTPS download mirror server block..."
  local dhparam_line=""
  if [[ -f "${CERT_DHPARAM}" ]]; then
    dhparam_line="    ssl_dhparam ${CERT_DHPARAM};"
  fi

  "${SUDO[@]}" tee "${SITE_CONF}" >/dev/null <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl ipv6only=on;
    server_name ${DOMAIN};

    ssl_certificate ${CERT_FULLCHAIN};
    ssl_certificate_key ${CERT_KEY};
    include ${CERT_OPTIONS};
${dhparam_line}

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;

    location = /downloads/latest/stats.json {
        alias ${STATS_PUBLIC_FILE};
        include /etc/nginx/snippets/walnut-download-common.conf;
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
    }

    location /downloads/versions/ {
        alias ${DEPLOY_PATH}/versions/;
        include /etc/nginx/snippets/walnut-download-common.conf;
        add_header Cache-Control "public, max-age=604800, immutable" always;
    }

    location /downloads/latest/ {
        alias ${DEPLOY_PATH}/latest/;
        include /etc/nginx/snippets/walnut-download-common.conf;
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
    }

    location = /nginx-health {
        access_log off;
        add_header Content-Type text/plain;
        return 200 "Nginx OK\n";
    }

    location / {
        return 404;
    }

    access_log ${ACCESS_LOG} walnut_downloads_json;
    error_log ${ERROR_LOG};
}
EOF
}

install_stats_generator() {
  echo "Installing download stats generator and cron..."
  "${SUDO[@]}" install -m 755 "${GENERATOR_SRC}" "${STATS_SCRIPT}"
  "${SUDO[@]}" install -d -m 700 "${STATS_STATE_DIR}"
  "${SUDO[@]}" install -d -m 755 "${STATS_PUBLIC_DIR}"
  "${SUDO[@]}" touch "${STATS_LOG}"
  "${SUDO[@]}" chmod 644 "${STATS_LOG}"

  "${SUDO[@]}" tee "${STATS_CRON}" >/dev/null <<EOF
SHELL=/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

*/10 * * * * root /usr/bin/python3 ${STATS_SCRIPT} --log ${ACCESS_LOG}.1 --log ${ACCESS_LOG} --output ${STATS_PUBLIC_FILE} --state ${STATS_STATE_FILE} --asset-root ${DEPLOY_PATH} >> ${STATS_LOG} 2>&1
EOF
  "${SUDO[@]}" chmod 644 "${STATS_CRON}"
}

run_stats_generator_once() {
  echo "Generating initial download stats..."
  "${SUDO[@]}" /usr/bin/python3 "${STATS_SCRIPT}" \
    --log "${ACCESS_LOG}.1" \
    --log "${ACCESS_LOG}" \
    --output "${STATS_PUBLIC_FILE}" \
    --state "${STATS_STATE_FILE}" \
    --asset-root "${DEPLOY_PATH}"
  "${SUDO[@]}" chmod 644 "${STATS_PUBLIC_FILE}"
}

ensure_tls_certificate() {
  if [[ -f "${CERT_FULLCHAIN}" && -f "${CERT_KEY}" && -f "${CERT_OPTIONS}" ]]; then
    return
  fi

  echo "Issuing TLS certificate..."
  install_missing_packages certbot python3-certbot-nginx
  write_http_site_conf
  "${SUDO[@]}" ln -sfn "${SITE_CONF}" /etc/nginx/sites-enabled/walnut-downloads
  "${SUDO[@]}" nginx -t
  "${SUDO[@]}" systemctl reload nginx
  "${SUDO[@]}" certbot certonly --nginx \
    -d "${DOMAIN}" \
    --non-interactive \
    --agree-tos \
    --email "${LETSENCRYPT_EMAIL}"
}

echo "Creating download mirror directories..."
"${SUDO[@]}" install -d -m 755 \
  "${DEPLOY_PATH}" \
  "${DEPLOY_PATH}/releases" \
  "${DEPLOY_PATH}/versions" \
  "${DEPLOY_PATH}/latest" \
  "${STATS_PUBLIC_DIR}"
"${SUDO[@]}" chown -R www-data:www-data "${DEPLOY_PATH}"

write_geoip_conf
write_limits_conf
write_log_format_conf
write_snippet_conf
install_stats_generator
ensure_tls_certificate
write_tls_site_conf
"${SUDO[@]}" ln -sfn "${SITE_CONF}" /etc/nginx/sites-enabled/walnut-downloads
"${SUDO[@]}" nginx -t
"${SUDO[@]}" systemctl reload nginx
run_stats_generator_once

echo "Download mirror Nginx endpoint is ready: https://${DOMAIN}/downloads/"
echo "Download stats endpoint is ready: https://${DOMAIN}/downloads/latest/stats.json"
echo "Download stats cron installed: ${STATS_CRON}"
