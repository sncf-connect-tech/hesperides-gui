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
### Fixed

- Il désormais à nouveau possible de flaguer une plateforme comme "de production" [Lucas Cimon]

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
