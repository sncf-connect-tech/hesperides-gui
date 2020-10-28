#!/usr/bin/env bash
set -o pipefail -o errexit -o nounset -o xtrace
cd $(dirname ${BASH_SOURCE[0]})
google-chrome-stable --version
npm install
export DISPLAY=:99.0
# sudo is needed here, cf. https://docs.travis-ci.com/user/gui-and-headless-browsers/#starting-a-web-server
sudo env "PATH=$PATH" npm run webdriver-start --verbose &
docker run --rm -p 8080:8080 -e SPRING_PROFILES_ACTIVE=noldap,fake_mongo hesperides/hesperides:latest &
sudo env "PATH=$PATH" npm start &
wget --waitretry=5 --retry-connrefused -T 60 -O - http://localhost:8080/rest/versions
npm run bdd-tests -- --specs=test/bdd/features/$1
