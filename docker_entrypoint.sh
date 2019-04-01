#!/bin/sh
set -o pipefail -o errexit -o nounset

# Inject API_ENDPOINT env variable in hesperides.conf
envsubst < /etc/nginx/conf.d/hesperides.conf.template > /etc/nginx/conf.d/hesperides.conf

if [ $# -gt 0 ]; then
    exec "$@"
else
    exec nginx -g 'daemon off;'
fi
