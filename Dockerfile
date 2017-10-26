FROM nginx:1.11

COPY ./docker/nginx.conf /etc/nginx/nginx.conf

ADD ./src/app /usr/share/nginx/html

EXPOSE 80