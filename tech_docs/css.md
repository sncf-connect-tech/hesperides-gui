# CSS

Voici les principes de structuration que nous voulons mettres en place :

## Méthodologie BEM
Intro officielle : http://getbem.com/introduction/

Quelques règles de base :
- un ficher CSS par composant
- on n'utilise pas de sélecteur d'`#id` en CSS
- on limite le cumul de sélecteurs en employant des classes dédiés,
en employant [la convention de nommage BEM](http://getbem.com/naming/): `.block__elem--modifier`
Exemples : `.User__appList`, `.PropertiesList__valueAutocomplete__choice`
- les termes à proscrire pour nomme les classes CSS : `hesperides`

## Autres
- éviter tant que possible d'employer `!important`, il s'agit d'un _code smell_ reconnu
- employer `rem` plutôt que `px` comme unité :
[explanation on StackOverflow](https://stackoverflow.com/a/43131958/636849), [autre justification en français](https://blog.lesieur.name/pourquoi-j-utilise-l-unite-rem-et-non-l-unite-pixel/)
