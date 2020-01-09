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

Ces tests nécessitent que les composants _backend_ et _frontend_ ainsi que
le webdriver (`npm run webdriver-start`) soient lancés.

Ils sont implémentés dans le dossier [test/e2e/](https://github.com/voyages-sncf-technologies/hesperides-gui/tree/master/test/e2e)
et sont lancés par la commande `npm run e2e-tests`, qui instrumente le navigateur Chrome.

### Bonnes pratiques

- Pour sélectionner des élements de la page, introduisez des IDs HTML dédiés préfixés avec `e2e-`.
Ces IDs doivent uniquement être utilisé pour les tests _end-to-end_, et jamais dans le code applicatif.

- Privilégier l'utilisation de `browser.wait( ExpectedConditions... )` à l'utilisation de `browser.sleep`

- `browser.waitForAngular` est à utiliser dans les cas suivants (liste non exhaustive) :
  - Lors de l'ouverture une page, d'un onglet ou d'une modale
  - Après un clic déclenchant du code géré par Angular (mais c'est déjà fait dans `send.clickBy...`)

### Options d'exécution

    npm run e2e-tests -- --suite $suite

    npm run e2e-tests -- --specs test/e2e/menus/menus-spec.js --grep "$should"

    npm run bdd-tests -- --specs test/bdd/features/platforms/save-module-properties.feature

Pour exécuter un unique test, une alternative à `--grep` est de simplement remplacer temporairement
un appel à `it($should, function...` par `fit(...`, le "f" signifiant "focus".
De même il est possible d'utiliser `fdescribe`.

Il est nécessaire d'avoir lancé tous les tests une première fois avant de lancer un test unitairement afin de créer le jeu de données de base.

Enfin, pour débuguer, vous pouvez insérer un appel à `browser.sleep(60000)` pour interrompre un test sur une ligne et garder le navigateur ouvert.
