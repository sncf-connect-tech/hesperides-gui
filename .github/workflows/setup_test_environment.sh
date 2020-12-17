#!/usr/bin/env bash
google-chrome-stable --version
npm install
xvfb-run --server-args="-screen 0, 1024x768x24" npm run webdriver-start --verbose &
docker run --rm -p 8080:8080 -e SPRING_PROFILES_ACTIVE=noldap,fake_mongo hesperides/hesperides:latest &
sudo env "PATH=$PATH" npm start &
wget --waitretry=5 --retry-connrefused -T 60 -O - http://localhost:8080/rest/versions
