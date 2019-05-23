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

### Bonnes pratiques
- pour sélectionner des élements de la page, introduisez des IDs HTML dédiés préfixés avec `e2e-`.
Ces IDs doivent uniquement être utilisé pour les tests _end-to-end_, et jamais dans le code applicatif.

- privilégier l'utilisation de `browser.wait( ExpectedConditions... )` à l'utilisation de `browser.sleep`

### En cas d'erreur
Un rapport HTMl avec capture d'écran est généré dans `test-reports-e2e/htmlReport.html`.

Sur Travis CI, il devrait être également possible d'avoir accès à ce rapport d'après [cette réponse sur StackOverflow](https://stackoverflow.com/a/55243704/636849) (non encore testé).

### Options d'exécution

    npm run e2e-tests -- --suite $suite

    npm run e2e-tests -- --specs test/e2e/menus/menus-spec.js --grep "$should"

Pour exécuter un unique test, une alternative à `--grep` est de simplement remplacer temporairement
un appel à `it($should, function...` par `fit(...`, le "f" signifiant "focus".
De même il est possible d'utiliser `fdescribe`.

Enfin, pour débuguer, vous pouvez insérer un appel à `browser.sleep(60000)` pour interrompre un test sur une ligne et garder le navigateur ouvert.
