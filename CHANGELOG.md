# CHANGELOG
Le changelog du backend est ici: [hesperides/CHANGELOG.md](https://github.com/voyages-sncf-technologies/hesperides/blob/master/CHANGELOG.md)

Tous les changements notables sur ce projet sont documentés dans ce fichier.
Le format est basé sur [Keep a Changelog](http://keepachangelog.com).

Il est généré automatiquement à partir des commits dont le message débute par
`added:` / `changed:` / `deprecated:` / `removed:` / `fixed:` / `security:`
gâce à [gitchangelog](https://github.com/vaab/gitchangelog) :
```
pip install gitchangelog pystache
gitchangelog
```

Les messages de commit ne comprenant pas ces préfixes,
par exemple ceux suivant la convention [Conventional Commits](https://www.conventionalcommits.org)
débutant par `chore:` / `docs:` / `refactor:` / `style:` / `test:`,
ne seront simplement pas inclus dans ce changelog.

Pour automatiquement mettre à jour ce fichier à chaque commit,
placez le code suivant dans `.git/hooks/pre-commit` :
```
#!/bin/sh
git fetch --tags upstream && gitchangelog && git add CHANGELOG.md
```

<!-- gitchangelog START -->
## _(unreleased)_
### Added

- Tooltip indiquant lorsque des propriétés globales sont employées pour valoriser des propriétés - close #254. [Lucas Cimon]



## 2019-09-25
### Added

- Ability to create several logical groups at once - close #79 (#311) [Lucas Cimon]



## 2019-09-23
### Fixed

- #303: amélioration des tooltips lors de la valorisation. [Thomas L'Hostis]

- Tooltip du diff positionné au dessus des éléments pour éviter un problème d'affichage. [Thomas L'Hostis]

- #309: aligner le titre des colonnes à droite pour la plateforme de gauche dans le diff. [Thomas L'Hostis]

- Correction de l'état par défaut du bouton d'ouverture/fermeture des modules déployés. [Thomas L'Hostis]



## 2019-09-20
### Fixed

- Fix: frontend @pattern & @required annotations are now properly validated - close #175 (#298) [Lucas Cimon]



## 2019-09-19
### Fixed

- /profile page spinner never disapears - close #304 (#307) [Lucas Cimon]

- Mode plein écran dans l'éditeur de template - close #302 (#305) [Lucas Cimon]



## 2019-09-18
### Fixed

- Restoring "Create techno release" button + made TechnoService.create_workingcopy future-proof - close #262 (#299) [Lucas Cimon]



## 2019-09-10
### Added

- Liste des propriétés valorisables sur la page de module - close #160 (#296) [Lucas Cimon]


### Fixed

- On /diff page, not saving properties with a null value (#297) [Lucas Cimon]

- Restauration du mode plein écran - close #294. [Lucas Cimon]



## 2019-09-05
### Fixed

- Production switch "disabled" logic (#292) [Lucas Cimon]



## 2019-09-04
### Fixed

- Sticky default input value in change_module_version modal (#291) [Lucas Cimon]

  Will close https://github.com/voyages-sncf-technologies/hesperides/issues/747

- Do not use RTL to display left diff values, closes #289 (#290) [Etienne Girondel]



## 2019-08-14
### Fixed

- Correction du titre du résumé du diff de propriétés de modules. [Thomas L'Hostis]



## 2019-08-13
### Fixed

- Hiding banner when message contains just a newline. [Lucas Cimon]

- .transforms -> .transformations. [Lucas Cimon]

- Restauration du warning sur le /diff pour les propriétés globales - close #285 (#286) [Lucas Cimon]

- #281 Bug d'affichage du diff + Sauvegarde des propriétés itérables lors du report de propriétés. [Thomas L'Hostis]

- Ensuring that the "compare_stored_values" query param passed to /diff is always a boolean (#282) [Lucas Cimon]



## 2019-08-09
### Added

- Section sur les ACLS dans le manuel utilisateur + introduction de HTML tidy dans CI (#277) [Lucas Cimon]

- Banner from HTTP configurable through $BANNER_URL - close #251 (#276) [Lucas Cimon]



## 2019-08-07
### Fixed

- Avoid "Cannot set property 'properties_path' of undefined" when saving instance properties (#274) [Lucas Cimon]

- Suppression des "return" pour éviter de polluer les logs Sentry, qui provoquent des bugs (#273) [Lucas Cimon]

  * Fix: suppression des "return" pour éviter de polluer les logs Sentry, qui provoquent des bugs

  * Fix: avoid API error "Query parameter applicationName is missing"



## 2019-07-30
### Added

- /user /user + chips in /properties/$app header to manage prod AD groups (#260) [Lucas Cimon]

  * Add: /user /user + chips in /properties/$app header to manage prod AD groups

  * Close #268 : spinner au chargement du profil utilisateur


### Fixed

- Avoiding JS errors due to calling $mdMenu.cancel() instead of $mdMenu.destroy() + ignoring Unauthorized auth errors for Sentry #271 (#271) [Lucas Cimon]



## 2019-07-25
### Fixed

- Sentry tags parsing. [Lucas Cimon]



## 2019-07-10
### Added

- Support pour Sentry + plus d'info dans le menu 'à propos' [Lucas Cimon]



## 2019-07-04
### Fixed

- Les boutons "download" de ZIP (close #259) [Lucas Cimon]

- Conservation du filtre de sélection des modules dans la vue arbre lors d'un changement de plateforme (close #252) \+ prise en compte du "setting" global de dépliage des instances (close #239) \+ ajout des tests manquants + activation d'eslint sur les tests. [Lucas Cimon]



## 2019-06-18
### Added

- Warning affiché pour les plateformes non identifiées comme de production mais dont le nom débute par PRD ou PROD - close #255 (#257) [Lucas Cimon]



## 2019-06-05
### Fixed

- #248 Suppression d'un bloc après la première propriété itérable. [Thomas L'Hostis]



## 2019-06-03
### Fixed

- #244 Correction du diff de propriétés globales avec timestamp. [Thomas L'Hostis]



## 2019-05-28
### Fixed

- #244 Correction du diff de propriétés globales avec timestamp. [Thomas L'Hostis]



## 2019-05-24
### Fixed

- Retour à la logique originale du _diff wizard_ (fromPlatform non modifiable) + ajout loading spinner & date sur /diff - solve #238 (#243) [Lucas Cimon]



## 2019-05-22
### Fixed

- Il était impossible de choisir une date -> query param "timestamp" manquant dans URL page de diff (#240) [Lucas Cimon]



## 2019-05-21
### Fixed

- Datepicker pour comparaison de propriétés front (#236) [Lucas Cimon]



## 2019-05-20
### Fixed

- Correction du scroll tout en bas dans la vue arborescente lors d'un clic sur un module - close #227 (#234) [Lucas Cimon]

- Correction du diff de plateformes - il était impossible de choisir une autre plateforme (#233) [Lucas Cimon]

  * Fix: correction du diff de plateformes - il était impossible de choisir une autre plateforme

  * Fix: restauration des tooltips pour les propriétés itérables

  * Minor fix: ModuleService.get était appelé avec un argument is_working_copy incorrect



## 2019-05-17
### Fixed

- Fermeture du menu de la navbar une fois une techno / module / appli sélectionné + on empêche la création de nouveau groupe logique écrasant un existant avec le même nom - close #157 (#232) [Lucas Cimon]

- Comparaison des propriétés à une date spécifique - close #229 (#231) [Lucas Cimon]

- Alignement en largeur du champ de filtrage des propriétés globales par nom - close #226 (#230) [Lucas Cimon]



## 2019-05-16
### Fixed

- Le tooltip était manquant pour les propriétés sans valorisation + remplacement de l'appel à modules/search, plus pertinent fonctionnelement & en termes de perfs (#228) [Lucas Cimon]

- Correction de bug dans properties.js qui empêchait l'affichage des propriétés itérables (#225) [Lucas Cimon]



## 2019-05-15
### Added

- Une indication "password" dans le tooltip des propriétés correspondantes + refacto gestion des fonctionnalités de folding & search de la vue arborescente des modules de plateforme - fix #209 (#220) [Lucas Cimon]


### Fixed

- #211 Restriction des propriétés prédéfinies ignorées. [Thomas L'Hostis]



## 2019-05-14
### Added

- Bouton de déconnexion + nettoyage du CSS du menu (#215) [Lucas Cimon]


### Fixed

- #206 Bouton de fermeture de modal de création de techno, module et plateforme à nouveau fonctionnel (#216) [Thomas L'Hostis]

- #205 Ouverture des liens dans un nouvel onglet - dont le diff - à nouveau fonctionnelle (#217) [Thomas L'Hostis]

- #202 Sauvegarde des préférences à nouveau fonctionnelle (#213) [Thomas L'Hostis]

- Le bouton "Close" de la modale des paramètres fonctionne à nouveau - close #206. [Lucas Cimon]

  \+ ajout des événements PlatformRestore dans la modale d'historique

- Il désormais à nouveau possible de flaguer une plateforme comme "de production" - close #203. [Lucas Cimon]

  \+ suppression de l'état partagé Angular "session"
  \+ ajout d'un cache sur UserService.authenticate
  \+ suppression des polyfills sur les classes natives Regex & String



## 2019-05-13
### Fixed

- Boucle infinie évitée dans `HesperidesTemplateModal.token` - close #199 (#200) [Lucas Cimon]

- Correction du parsing du config.json (#198) [Lucas Cimon]

- ? en trop dans l'URL du détail des modules en workingCopy (#197) [Lucas Cimon]



## 2019-05-03
### Added

- Bouton de suppression de plateforme + champ pour restaurer une plateforme + corrige le bug d'accès en 2 temps aux propriétés de module - close #185 #186 (#187) [Lucas Cimon]


### Fixed

- #183 Montée de version de module déployé sans cocher la copie de propriétés (#184) [Thomas L'Hostis]



## 2019-04-26
### Added

- CHANGELOG.md + push Docker image sur hub avec version=date (#179) [Lucas Cimon]



## 2019-04-24
### Fixed

- Correction d'un regression - il doit être possible de comparer une plateforme avec elle-même (à une date antérieure) (#177) [Lucas Cimon]

- Le diff des propriétés globales tournait en boucle à cause d'appels à /modules/.../model avec un nom & une version indéfinis (#176) [Lucas Cimon]



<!-- gitchangelog END -->
