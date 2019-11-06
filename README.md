[![](https://api.travis-ci.org/voyages-sncf-technologies/hesperides-gui.svg?branch=master)](https://travis-ci.org/voyages-sncf-technologies/hesperides-gui)

[![](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)](http://makeapullrequest.com)
[![](https://img.shields.io/github/issues/voyages-sncf-technologies/hesperides-gui.svg)](https://github.com/voyages-sncf-technologies/hesperides-gui/issues)
[![](https://img.shields.io/github/contributors/voyages-sncf-technologies/hesperides-gui.svg)](https://img.shields.io/github/contributors/voyages-sncf-technologies/hesperides-gui.svg)
[![](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

Hesperides frontend
===================

Hesperides is an open source tool generating configuration files from a given template with [mustaches](https://mustache.github.io)
and the properties it stores per environment.

The backend lives in this repo: <https://github.com/voyages-sncf-technologies/hesperides>.

**Development status**: this project is currently maintained & actively developped by [e-Voyageurs SNCF](https://www.sncf.com/fr/groupe/newsroom/e-voyageurs-sncf).
The list of features planned is available in [ROADMAP.md](https://github.com/voyages-sncf-technologies/hesperides/blob/master/ROADMAP.md).


Documentation
=============

The user manual is contained in the `docs/` directory,
and available online here: <https://voyages-sncf-technologies.github.io/hesperides-gui/>

Technical documentation can be found in `CONTRIBUTING.md` and the `tech_docs/` directory.

Changelog
---------
All the last features & fixes are listed there: [CHANGELOG.md](https://github.com/voyages-sncf-technologies/hesperides-gui/blob/master/CHANGELOG.md).

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

Unit tests:
```shell
$ npm test
```

End-to-end tests :
```shell
$ npm start
$ npm run webdriver-start
$ npm run e2e-tests
```
