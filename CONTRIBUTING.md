![Une poignée de main](tech_docs/contributing.svg)

<!-- Pour mettre à jour ce sommaire: markdown-toc --indent "    " -i CONTRIBUTING.md -->

<!-- toc -->

- [Introduction](#introduction)
- [Documentation technique](#documentation-technique)
- [Contribuer au code](#contribuer-au-code)
    * [Environnement de développement](#environnement-de-developpement)
    * [Intégration continue](#integration-continue)
    * [Revues de code](#revues-de-code)
    * [Problèmes rencontrés](#problemes-rencontres)
        + [`npm install`](#npm-install)
- [Contribuer à la documentation](#contribuer-a-la-documentation)

<!-- tocstop -->

# Introduction
Tout d'abord, merci de souhaiter contribuer à Hesperides !

Il y a plein de façons d'aider le projet :
- tout d'abord, testez-le et dites-nous ce que vous en pensez !
- signalez-nous d'éventuels **bugs** que vous rencontrez
- suggérerez de **nouvelles fonctionnalités** ou des améliorations
- [**contribuez au code**](#contribuer-au-code) en corrigeant des bugs ou en ajoutant des fonctionnalités via des _pull requests_

Pour tout ça, le meilleure manière d'entrer en contact avec nous est via le système d'[issues](https://github.com/voyages-sncf-technologies/hesperides/issues) de GitHub,
même simplement si vous avez des questions.

# Documentation technique
Elle est située dans le dossier [tech_docs/](https://github.com/voyages-sncf-technologies/hesperides-gui/tree/master/tech_docs)
et détaille la structure du code ainsi que les conventions employées pour le CSS et les tests par exemple.

# Contribuer au code
Pour les nouveaux venus, nous maintenons une liste de [tâches faciles](https://github.com/voyages-sncf-technologies/hesperides/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22),
incluant des corrections de bugs ou des émaliorations simples, pour vous permettre de débuter doucement avec le code.

Globalement voici comment procéder pour contribuer au code :
1. Assurez-vous qu'il existe une [issue](https://github.com/voyages-sncf-technologies/hesperides/issues) détaillant la modification que vous voulez effectuer, bug ou fonctionnalité.
Idéalement, indiquez dans cette _issue_ que vous commencez à travailler dessus.
2. Créez un [fork de ce repo](https://help.github.com/articles/fork-a-repo/) et installez votre [environnement de développement](#environnement-de-developpement).
3. Codez !
4. Poussez vos modifications sous forme de _commit_ sur votre _fork_.
Idéalement, sur une branche dédiée et pas sur `master` pour vous permettre de travailler sur plusieurs tâches en parallèle.
5. [Créer une _pull request_](https://help.github.com/articles/creating-a-pull-request/), et assurez-vous que [Travis CI](#integration-continue) la valide.
Mentionnez-le ensuite dans l'_issue_ correspondante, et demandez une [revue de code](#revues-de-code).
6. Il est très probable qu'on vous suggère de faire quelques modifications : ajoutez simplement des _commits_ sur la branche de votre _fork_
et ils seront automatiquement inclus dans la _pull request_.

Lorsque vous aurez adressés tous les retours faits lors de la revue de code,
un mainteneur du projet fusionnera votre contribution au code,
en [_squashant_](https://help.github.com/articles/about-pull-request-merges/#squash-and-merge-your-pull-request-commits) vos _commits_.

Et voilà !

## Environnement de développement
Vous aurez besoin d'une version récente de NodeJS et de `npm`.

De plus, nous utilisons Docker pour _packager_ et déployer l'application.
Vous en aurez besoin pour lancer le [_backend_](https://github.com/voyages-sncf-technologies/hesperides) :

    docker run --rm -p 8080:8080 -e SPRING_PROFILES_ACTIVE=noldap,fake_mongo hesperides/hesperides

### Hooks de pre-commit

## pre-commit hooks

Afin d'effectuer certaines validations automatisées à chaque commit,
ce projet emploie des _hooks_ `git` de `pre-commit`, via [l'outil Python du même nom](http://pre-commit.com).

Les _hooks_ configurés sont listés dans le fichier de configuration [.pre-commit-config.yaml](.pre-commit-config.yaml),
et sont exécutés via [Travis CI](https://travis-ci.org/voyages-sncf-technologies/vboard).
Aucune PR ne sera mergée si ces _hooks_ remontent des erreurs.

Dans la mesure du possible, installez ces _hooks_ sur votre poste de développement.
Si vous ne pouvez pas ou ne voulez pas prendre le temps de le faire, vous devrez vous baser sur les logs de Travis CI
pour débugger d'eventuelles erreurs qu'ils détecteraient.

Pour les installer sur votre poste de développement, vous aurez besoin de Python,
et du paquet `pre-commit` qui peut être installé avec `pip`.
Pour configurer `git` afin qu'il exécute les _hooks_ à chaque commit, lancez la commande suivante :

    pre-commit install

Si besoin, vous pouvez lancer manuellement les _hooks_ :

    pre-commit run $hook_name             # exécute un unique hook sur tous les fichiers modifiés
    pre-commit run --files $file1 $file2  # exécute tous les hooks sur les fichiers spécifiés
    pre-commit run --all-files            # exécute tous les hooks sur tous les fichiers


## Intégration continue
[Travis CI](https://travis-ci.org/voyages-sncf-technologies/hesperides-gui) est configuré via le fichier `.travis.yml` pour exécuter les validations suivantes sur chaque _pull request_:
- analyse statique du code avec `eslint`
- exécutions de tous les _hooks_ de `pre-commit`
- tests unitaires avec Karma
- tests _end to end_ avec Protractor

## Revues de code
Chaque _pull request_ doit être relue par au moins un mainteneur du projet, et obtenir son approbation.

Les revues de code doivent suivre ces principes :
- [yelp guidelines](https://engineeringblog.yelp.com/2017/11/code-review-guidelines.html)
- [conseils de Sebastien Charrier](https://www.youtube.com/watch?v=6aQK6GoTbxM)

## Problèmes rencontrés

### `npm install`
Si `npm install` vous renvoie l'erreur suivante (ou similaire) :

> Could not install from "node_modules\http-server-legacy\ecstatic@git+https:\github.com\Blackbaud-ShaydeNofziger\node-ecstatic.git#d47ffccf932962295a1feb74334d3ab8d0b17a66"
as it does not contain a package.json file

Essayer avec YARN :

    npm install -g yarn
    [répertoire où yarn est installé]\yarn install


Si cela fonctionne, réessayer avec `npm install`.

# Contribuer à la documentation
Pour visualiser la documentation sur votre machine :

    npm run serve-doc
