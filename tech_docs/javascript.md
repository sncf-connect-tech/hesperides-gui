# Javascript _coding style_

Dans la mesure du possible, en plus des conventions imposées par `eslint`, on essaie de respecter les règles suivantes.

## Général

- nommage en `camelCase`
- on préfère `const` & `let` à `var`
- on préfère les fonctions natives `.forEach` / `.map` / `.filter` à leurs équivalent Lodash
- dans les expressions booléens type `if`, on évite les appels inutiles à `_.isUndefined`
et les comparaisons avec `false` / `null` ou `''` quand il suffit de savoir la valeur est "falsy"

## Angular

- comme on ne minifie pas le code, on évite le tableau listant le nom des dépendances lors de leur injection
