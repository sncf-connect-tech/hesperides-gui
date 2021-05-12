#!/usr/bin/env bash

set -o pipefail -o errexit -o nounset -o xtrace

GIT_COMMIT_MSG="${1?'Required parameter'}"

docker build -t $DOCKER_IMAGE:$GITHUB_SHA \
  --label date=$(date +%F) \
  --label git_commit=$GITHUB_SHA \
  --build-arg BUILD_TIME=$(date +%FT%T) \
  --build-arg GIT_TAG=$(date +%F) \
  --build-arg GIT_BRANCH=$GITHUB_REF \
  --build-arg GIT_COMMIT=$GITHUB_SHA \
  --build-arg GIT_COMMIT_MSG="$GIT_COMMIT_MSG" .

# We validate that the image built can start without any error at the entrypoint level:
docker run --rm -e API_ENDPOINT=http://dummy:8080 $DOCKER_IMAGE:$GITHUB_SHA true
