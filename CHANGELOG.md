# CHANGELOG
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
gitchangelog && git add CHANGELOG.md
```

<!-- gitchangelog START -->
## None
### Added

- Added: CHANGELOG.md + push Docker image sur hub avec version=date. [Lucas Cimon]


### Fixed

- Correction d'un regression - il doit être possible de comparer une plateforme avec elle-même (à une date antérieure) (#177) [Lucas Cimon]

- Le diff des propriétés globales tournait en boucle à cause d'appels à /modules/.../model avec un nom & une version indéfinis (#176) [Lucas Cimon]



## 0.3.1
### Fixed

- Merge error. [Arnaud Prodhomme]

- Missing labels. [Arnaud Prodhomme]

- Miscellaneous character. [Arnaud Prodhomme]



## 0.3.0
### Fixed

- Same size of save properties button everywhere. [TSI]

- AutoScroll on edit properties. [TSI]

- Required properties star showing. [TSI]

- Showing star on required props event truncated. [TSI]

- Required properties can't be void for iterable properties. [TSI]

- Disable changing version from NDL. [TSI]

- Required properties can't be void. [TSI]

- Enabling validation button on change platform version and module name by default in module version change autocomplate. [TSI]

- Improving hesperides authentication at start up. Disabling production button on create moudles popups. [TSI]

- Spelling corrections ! [TSI]

- Reporting all the styles in css file. [TSI]

- Remiving password hidding. [TSI]

- Remove hidding password. [TSI]

- Spelling corrections. [TSI]

- Spelling corrections. [TSI]

- Opennng the simple properties accordion by default. [TSI]

- Fix : Hidding @password properties of production platform when the connected user is not a production user and user authentication review. [TSI]

- Disabling the production switch if user is not a production user. [TSI]

- Fixing module name autocomplate with '-' in search text. [TSI]

- Add the possibility to apply the filters on name and value. [TSI]

- Removing duplicated directivement in in properties.js. [TSI]

- Showing a message in model modal when no properties to show. [TSI]

- Ensuring the diff date is in the pass ! [TSI]

- Choose version from NDL when changing version. [TSI]

- Alert icon shown when file generation is on error in file previalization. [TSI]

- Event date in full frensh. Add of angular-i18n. [TSI]

- File download on file-modal and file-modal review. [TSI]

- Review of welcome page, menu text color and about hesperides popup. [TSI]

- Clickable title. [TSI]

- Title clickage + html modals review. [TSI]

- Md-divider spacing. [TSI]

- Adding responsive truncation on properties, global properties and instance properties. [TSI]

- Diff date selection. [TSI]

- Finalizing events perfs + bug fix on diff. [TSI]

- Stop reloading events when close button is clicked. [TSI]

- Reducing waiting time. [TSI]

- Ordering events from oldest to newest on events list. [TSI]

- Performance tuning for events list. [TSI]

- Reviewing global properties and properties pages. [TSI]

- Factoring platform color code functions + applying colors to diff modals. [TSI]

- Adding the pagination the events list. [TSI]

- Hidding line numbers of code mirror + Showing the diff datetime picket at show click. [TSI]

- Switch box/tree ajax loader. [TSI]

- The enterkey updates the global properties. [TSI]

- Reviewing instance properties dispay + uniformizing comment display + code refoctoring. [TSI]

- Making the date-time-picker follow the input. [TSI]



<!-- gitchangelog END -->
