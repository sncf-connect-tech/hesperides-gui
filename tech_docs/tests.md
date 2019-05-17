# Tests

## Tests unitaires
Ils sont à prioriser par rapport aux tests E2E tant que possible, _cf._ [Just Say No to More End-to-End Tests](https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html)
Ils sont idéaux pour tester le code logique "métier", typiquement celui des _factory_ Angular JS.

Ils sont implémentés dans le dossier [test/unit/](https://github.com/voyages-sncf-technologies/hesperides-gui/tree/master/test/unit)
et sont lancés par la commande `npm test`, qui instrumente le navigateur Firefox.

### Options d'exécution

    npm test -- --log-level=debug

    npm test -- --grep=nameOfDescribeBlock

    npm test -- --auto-watch --no-single-run


## Tests end-to-end
Ces tests nécessitent que le composant _backend_ soit lancé.

Ils sont implémentés dans le dossier [test/e2e/](https://github.com/voyages-sncf-technologies/hesperides-gui/tree/master/test/e2e)
et sont lancés par la commande `npm run e2e-tests`, qui instrumente le navigateur Chrome.

### Sélection d'éléments
Afin de permettre de sélectionner des élements de la page,
nous ne permettons l'introduction d'IDs HTML dédiés, débutant par le préfix `e2e-`.
Ces IDs doivent uniquement être utilisé pour les tests _end-to-end_, et jamais dans le code applicatif.

### Page objects
Nous adoptons ce _pattern_ décrit en détails dans cet article :
[Using Page Objects to Overcome Protractor's Shortcomings](http://www.thoughtworks.com/insights/blog/using-page-objects-overcome-protractors-shortcomings)

### Options d'exécution

    npm run e2e-tests -- --suite menus

    npm run e2e-tests -- --specs test/e2e/menus/menus-spec.js
