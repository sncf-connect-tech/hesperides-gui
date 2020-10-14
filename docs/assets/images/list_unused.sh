#!/bin/bash

set -o pipefail -o errexit -o nounset

cd $( dirname "${BASH_SOURCE[0]}" )/../..

find assets/images/ -type f -exec sh -c 'grep -qF {} *.html || echo {}' \;
