FROM java:8-jre
  
LABEL application.name=HES
LABEL application.desc="Hespérides, pour gérer les configurations des applications"
LABEL service.8080_tcp.name=hesperides-gui
LABEL service.8080_tcp.desc="Service pour l'api et la gui d'Hespérides"
LABEL service.8081_tcp.name=hesperides-admin
LABEL service.8081_tcp.desc="Service pour les tâches administratives"
  
COPY app.jar /jars/app.jar
COPY hesperides-gui /hesperides-gui
COPY docker-conf.yml /etc/hesperides/hesperides-configuration.yml
COPY start.sh /start.sh

VOLUME /etc/hesperides/
EXPOSE 8080
EXPOSE 8081

CMD ["/start.sh"]
