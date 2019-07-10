#!/usr/bin/env bash

set -o pipefail -o errexit -o nounset

# Build a docker image and push it to docker hub (only when it's not a pull request)
if [ -n "${DOCKER_USER:-}" ] && [ -n "${DOCKER_PASS:-}" ]; then
    docker login -u $DOCKER_USER -p $DOCKER_PASS
    if [ "$TRAVIS_BRANCH" == "master" ]; then
        export TAG=latest
    else
        export TAG=$(echo $TRAVIS_BRANCH | sed -e 's/\//_/g' -e 's/\#//g' -e 's/\-/_/g')
    fi
    docker build -t hesperides/hesperides-gui:$TAG --label git_commit=$TRAVIS_COMMIT --label date=$(date +%F) \
        --build-arg BUILD_TIME=$(date +%F_%T) --build-arg GIT_TAG=$(date +%F) --build-arg GIT_BRANCH=$TRAVIS_BRANCH --build-arg GIT_COMMIT=$TRAVIS_COMMIT --build-arg GIT_COMMIT_MSG="$TRAVIS_COMMIT_MESSAGE" .
    echo "✓ Docker image built"
    docker push hesperides/hesperides-gui:$TAG
    echo "✓ Docker image pushed to public hub with version $TAG"
    docker tag hesperides/hesperides-gui:$TAG hesperides/hesperides-gui:$(date +%F)
    docker push hesperides/hesperides-gui:$(date +%F)
    echo "✓ Docker image pushed to public hub with version $(date +%F)"
else
    echo '✗ Missing $DOCKER_USER or $DOCKER_PASS environment variable'
fi