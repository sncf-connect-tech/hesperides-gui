FROM node:10-alpine
WORKDIR /usr/src/app
RUN apk add git
COPY package.json .
COPY package-lock.json .
COPY bundler.js .
COPY src src
RUN mv src/app/index.html src/app/index.html.template
# Using yarn instead of npm as long as we need http-server-legacy: https://github.com/indexzero/http-server/issues/518
RUN yarn install

FROM nginx:1.15-alpine
COPY --from=0 /usr/src/app/src/app                  /usr/share/nginx/html/
COPY --from=0 /usr/src/app/src/app/img/favicon.ico  /usr/share/nginx/html/
RUN rm                                              /etc/nginx/conf.d/default.conf
COPY nginx.conf                                     /etc/nginx/conf.d/hesperides.conf.template

ARG BUILD_TIME
ENV BUILD_TIME=$BUILD_TIME
ARG GIT_BRANCH
ENV GIT_BRANCH=$GIT_BRANCH
ARG GIT_COMMIT
ENV GIT_COMMIT=$GIT_COMMIT
ARG GIT_COMMIT_MSG
ENV GIT_COMMIT_MSG=$GIT_COMMIT_MSG
ARG GIT_TAG
ENV GIT_TAG=$GIT_TAG
ENV SENTRY_TAGS=GIT_BRANCH:$GIT_BRANCH,GIT_COMMIT:$GIT_COMMIT,GIT_TAG:$GIT_TAG

COPY docker_entrypoint.sh                           /
RUN chmod u+x                                       /docker_entrypoint.sh
ENTRYPOINT ["/docker_entrypoint.sh"]
