# Javascript _coding style_

Dans la mesure du possible, en plus des conventions imposées par `eslint`, on essaie de respecter les règles suivantes.

## Général

- nommage en `camelCase`
- on préfère `const` & `let` à `var`
- on préfère les fonctions natives `.forEach` / `.map` / `.filter` à leurs équivalent Lodash
- dans les expressions booléens type `if`, on évite les appels inutiles à `_.isUndefined`
et les comparaisons avec `false` / `null` ou `''` quand il suffit de savoir la valeur est "falsy"

## Angular

- ⚠ attention à toujours avoir un **point** dans la valeur associée à un `ng-model` , quitte à préfixer par `$ctrl.`.
[Référence](http://jimhoskins.com/2012/12/14/nested-scopes-in-angularjs.html) :

> Whenever you have ng-model there’s gotta be a dot in there somewhere. If you don’t have a dot, you’re doing it wrong.

Pour détecter ces cas : `grep 'ng-model="[^.]\+"' -R $(git ls-files src)`

- comme on ne minifie pas le code, on évite le tableau listant le nom des dépendances lors de leur injection

### Debug

Voici quelques morceaux de code utiles pour déboguer l'application,
depuis la console JS de votre navigateur :

    var $rootScope = angular.element(document.body).scope()

    angular.element($('<a CSS selector>')).scope() // ou .controller()

    // Une fois un élement `$0` sélectionné avec l'inspecteur :
    var scope = angular.element($0).scope()

    var injector = angular.element(document.body).injector()
    injector.get('<serviceName>')

Vous pouvez également afficher la valeur d'attributs de votre scope dans le HTML ainsi :

    <pre><code>{{ attribut | json }}</code></pre>
