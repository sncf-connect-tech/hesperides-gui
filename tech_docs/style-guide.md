# Guide de style

## Tests

### Expressions régulières et expressions Cucumber

Pour définir les étapes dans la glue, il est possible d'utiliser 2 syntaxes :
* Expression régulière
* [Expression Cucumber](https://cucumber.io/docs/cucumber/cucumber-expressions/)

Nous utilisons les 2 car la syntaxe Cucumber est plus simple à lire et à écrire mais ne donne pas autant de possibilités que les expressions régulières.

Par exemple :

    When('I select the property {string}', async function (property) {...

Est identique à :

    When(/^I select the property "([^"]*)"$/, async function (property) {...

Mais on ne peut pas faire ceci en syntaxe Cucumber :

    Then(/^the property "([^"]+)" is( not)? displayed$/, async function (propertyName, notDisplayed) {...

Car bien qu'on puisse définir des caractères optionnels (ici ` not`), il n'est pas possible de les récupérer comme paramètre en utilisant les expressions Cucumber.

Voir la [documentation officielle](https://cucumber.io/docs/cucumber/cucumber-expressions/).

### /** @this CustomWorld */

Ce commentaire est utilisé en préfixe des fonctions de définitions d'étapes pour indiquer à ESLint (et au développeur) que `this` fait référence à l'objet CustomWorld.

Il est inutile de préfixer les fonctions qui ne font pas appel à `this`.
