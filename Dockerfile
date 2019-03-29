FROM node:8-alpine
WORKDIR /usr/src/app
RUN echo '{"allow_root": true}' > /root/.bowerrc
RUN apk add git
COPY . .
RUN npm install
RUN npm run postinstall

FROM nginx:1.15-alpine
COPY --from=0 /usr/src/app/src/app                  /usr/share/nginx/html/
COPY --from=0 /usr/src/app/src/app/img/favicon.ico  /usr/share/nginx/html/
