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

## Create some test data
The following `curl` commands should be enough to get you started:
```
curl --fail -u user:password http://localhost:8080/rest/modules -H 'Content-Type: application/json' -d '{
  "name": "test-module",
  "version": "1.0",
  "working_copy": true,
  "version_id": 0
}'
curl --fail -u user:password http://localhost:8080/rest/modules/test-module/1.0/workingcopy/templates -H 'Content-Type: application/json' -d '{
  "content": "{{foo}}",
  "filename": "app.conf",
  "location": "/tmp",
  "name": "app.conf",
  "version_id": 0
}'
curl --fail -u user:password http://localhost:8080/rest/applications -H 'Content-Type: application/json' -d '{
  "application_name": "TEST_APP",
  "application_version": "1.0",
  "platform_name": "TEST_PTF",
  "modules": [{
      "path": "#GROUP",
      "name": "test-module",
      "version": "1.0",
      "working_copy": true
  }],
  "version_id": 0
}'
```

## Start the AngularJS frontend
Should be as simple as:

    git clone https://github.com/voyages-sncf-technologies/hesperides-gui
    npm install
    npm start

You should now be able to visit <http://localhost/#/properties/TEST_APP?platform=TEST_PTF> and start hacking the JS / HTML code !

If you want to get a little bit familiar with Hesperides frontend, try the following :
1. change the value of the property `foo` on the platform `TEST_PTF` of application `TEST_APP`
2. navigate to the module page of `test-module#1.0#WORKINGCOPY` and some text of your choice to the template
3. preview the final value of the `app.conf` file by finding the "eye" icon and clicking on it
