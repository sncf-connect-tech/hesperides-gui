# Problèmes rencontrés

## `npm install`

Si `npm install` vous renvoie l'erreur suivante (ou similaire) :

> Could not install from "node_modules\http-server-legacy\ecstatic@git+https:\github.com\Blackbaud-ShaydeNofziger\node-ecstatic.git#d47ffccf932962295a1feb74334d3ab8d0b17a66"
as it does not contain a package.json file

Essayer avec YARN :

    npm install -g yarn
    [répertoire où yarn est installé]\yarn install


Si cela fonctionne, réessayer avec `npm install`.