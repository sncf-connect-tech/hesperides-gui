[![](https://travis-ci.org/voyages-sncf-technologies/hesperides-gui.svg)](https://travis-ci.org/voyages-sncf-technologies/hesperides-gui)

[![](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)](http://makeapullrequest.com)
[![](https://img.shields.io/github/issues/voyages-sncf-technologies/hesperides-gui.svg)](https://github.com/voyages-sncf-technologies/hesperides-gui/issues)
[![](https://img.shields.io/github/contributors/voyages-sncf-technologies/hesperides-gui.svg)](https://img.shields.io/github/contributors/voyages-sncf-technologies/hesperides-gui.svg)
[![](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

Hesperides-gui
==============

Hesperides is an open source tool with a frontend (hesperides-gui) and a backend (hesperides).

It lets you easily generate content from a template file (using mustache) in a given environment.

The backend part is here: <https://github.com/voyages-sncf-technologies/hesperides>.

Documentation
=============

<https://voyages-sncf-technologies.github.io/hesperides-gui/>

Build
=====

```shell
$ npm install
```

Run
===

```shell
$ npm start
```

It should launch a server available at http://localhost:80 using a backend on http://localhost:8080

Tests
=====

Linter:
```shell
$ npm run lint
```

Karma unit tests:
```shell
$ npm test
```

Run the webdriver-manager :
```shell
$ npm run webdriver-start
```

Run the endto-end tests in another window :
```shell
$ npm run e2e-tests
```
