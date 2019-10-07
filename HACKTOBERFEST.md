# Hacktoberfest

This year, the Hesperides project takes part to [Hacktoberfest](https://hacktoberfest.digitalocean.com) !

We have labeled some of our issues with [#Hacktoberfest](https://github.com/voyages-sncf-technologies/hesperides-gui/labels/Hacktoberfest)
to make it easier for you to contribute :)

Now, Hesperides is a large project, with a lot of "buisness logic" you probably do not want to learn before your first contribution.
It's also maintained by French developpers 🥖 🧀.
But we will commit to write detailed descriptions in our [#Hacktoberfest](https://github.com/voyages-sncf-technologies/hesperides-gui/labels/Hacktoberfest) issues,
and the next sections will summarize the steps to quickly let you hack with the code.

## Start the backend API with Docker

Should be as simple as:

  docker run --rm -it -p 8080:8080 -e SPRING_PROFILES_ACTIVE=noldap,fake_mongo hesperides/hesperides

You should then be able to access our [Swagger](https://swagger.io) page at <http://localhost:8080/rest/swagger-ui.html>

You can use the following test credentials:

  user: user
  password: password

## Start the AngularJS frontend

Should be as simple as:

  git clone https://github.com/voyages-sncf-technologies/hesperides-gui
  npm install
  npm start

You can now visit <http://localhost>

## Create some test data

