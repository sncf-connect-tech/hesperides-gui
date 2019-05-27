#!/bin/sh
set -o pipefail -o errexit -o nounset

if [ -n "${PROXY_TIMEOUT_IN_SECS:-}" ]; then
    export PROXY_TIMEOUT_DIRECTIVES="proxy_connect_timeout ${PROXY_TIMEOUT_IN_SECS}s; proxy_send_timeout ${PROXY_TIMEOUT_IN_SECS}s; proxy_read_timeout ${PROXY_TIMEOUT_IN_SECS}s; send_timeout ${PROXY_TIMEOUT_IN_SECS}s;"
fi
# Inject env variables in hesperides.conf:
envsubst < /etc/nginx/conf.d/hesperides.conf.template > /etc/nginx/conf.d/hesperides.conf

# Inject env variables in index.html:
envsubst < /usr/share/nginx/html/index.html.template > /usr/share/nginx/html/index.html

if [ $# -gt 0 ]; then
    exec "$@"
else
    exec nginx -g 'daemon off;'
fi
