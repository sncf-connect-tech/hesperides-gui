#!/bin/bash

# tempo : wait for the start of ELS/REDIS
sleep 10

java -jar /jars/app.jar server /etc/hesperides/hesperides-configuration.yml
