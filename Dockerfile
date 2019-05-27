FROM node:8-alpine
WORKDIR /usr/src/app
RUN apk add git
COPY package.json .
COPY package-lock.json .
COPY bundler.js .
COPY src src
# Using yarn instead of npm as long as we need http-server-legacy: https://github.com/indexzero/http-server/issues/518
RUN yarn install
RUN sed "s/BUILD_TIME = '.*'/BUILD_TIME = '$(date +%F_%T)'/" src/app/index.html > src/app/index.html.template
RUn rm src/app/index.html

FROM nginx:1.15-alpine
COPY --from=0 /usr/src/app/src/app                  /usr/share/nginx/html/
COPY --from=0 /usr/src/app/src/app/img/favicon.ico  /usr/share/nginx/html/
RUN rm                                              /etc/nginx/conf.d/default.conf
COPY nginx.conf                                     /etc/nginx/conf.d/hesperides.conf.template
COPY docker_entrypoint.sh                           /
RUN chmod u+x                                       /docker_entrypoint.sh
ENTRYPOINT ["/docker_entrypoint.sh"]
