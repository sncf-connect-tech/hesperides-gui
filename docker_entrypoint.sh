#!/bin/sh
set -o pipefail -o errexit -o nounset

# Inject API_ENDPOINT env variable as a JS constant in index.html
sed -i "s~ENDPOINT = ''~ENDPOINT = '${API_ENDPOINT:-}'~" /usr/share/nginx/html/index.html

exec nginx -g 'daemon off;'
