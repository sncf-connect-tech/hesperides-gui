const api = require('./helpers/api');
const rest = require('restling');
const fs = require('fs');
const { BeforeAll, Before, After, AfterAll, setWorldConstructor, setDefaultTimeout } = require('cucumber');
const { TechnoBuilder } = require('./builders/TechnoBuilder');
const { ModuleBuilder } = require('./builders/ModuleBuilder');
const { TemplateBuilder } = require('./builders/TemplateBuilder');
const { PlatformBuilder } = require('./builders/PlatformBuilder');
const { DeployedModuleBuilder } = require('./builders/DeployedModuleBuilder');
const { TemplateHistory } = require('./builders/TemplateHistory');
const { TechnoHistory } = require('./builders/TechnoHistory');
const { ModuleHistory } = require('./builders/ModuleHistory');
const { PlatformHistory } = require('./builders/PlatformHistory');

BeforeAll(function (next) {
    console.log('BeforeAll hook');
    next();
});

Before(/** @this CustomWorld */ async function () {
    console.log('Before hook');
    const world = this;
    await browser.get(baseUrl);

    // Supprime le fichier téléchargé (limité à ce fichier). L'idéal serait de stocker les
    // fichiers dans un dossier spécifique pour supprimer ce dossier avant chaque scénario
    // mais c'est à la création de ce dossire que ça plante sur Travis (problème de droits).
    // Une autre solution serait de créer ce dossier à la main, le commiter et le vider
    // plutôt que le supprimer avant chaque scénario.
    await fs.promises.unlink(downloadsPath + this.templateBuilder.filename).catch(function () {
    });

    // Pour une raison obscure les collections `techno` et `module` ont
    // besoin d'être initialisées par une demande de création...
    await rest.get(`${ baseUrl }/rest/technos`).catch(async function () {
        await api.createTechno(world.technoBuilder, world.templateBuilder.build());
    }).then(async function () {
        await rest.get(`${ baseUrl }/rest/modules`).catch(async function () {
            await api.createModule(world.moduleBuilder);
        });
    }).then(async function () {
        // Nettoyage des données
        await rest.get(`${ baseUrl }/rest/applications`).then(async function (applications) {
            // Garde-fou permettant d'éviter de supprimer
            // des données autres que celles de test
            if (applications.data.length > 10) {
                throw new Error('Be careful with which data you are erasing');
            }
            for (const application of applications.data) {
                await rest.get(`${ baseUrl }/rest/applications/${ application.name }`).then(async function (currentApplication) {
                    for (const platform of currentApplication.data.platforms) {
                        await rest.del(`${ world.productionUserUrl }/rest/applications/${ application.name }/platforms/${ platform.platform_name }`);
                    }
                });
            }
        });
    }).then(async function () {
        await rest.get(`${ baseUrl }/rest/modules`).then(async function (modules) {
            for (const moduleName of modules.data) {
                await rest.get(`${ baseUrl }/rest/modules/${ moduleName }`).then(async function (moduleVersions) {
                    for (const moduleVersion of moduleVersions.data) {
                        await rest.get(`${ baseUrl }/rest/modules/${ moduleName }/${ moduleVersion }`).then(async function (versionTypes) {
                            for (const versionType of versionTypes.data) {
                                await rest.del(`${ world.productionUserUrl }/rest/modules/${ moduleName }/${ moduleVersion }/${ versionType }`);
                            }
                        });
                    }
                });
            }
        });
    }).then(async function () {
        await rest.get(`${ baseUrl }/rest/technos`).then(async function (technos) {
            for (const technoName of technos.data) {
                await rest.get(`${ baseUrl }/rest/technos/${ technoName }`).then(async function (technoVersions) {
                    for (const technoVersion of technoVersions.data) {
                        await rest.get(`${ baseUrl }/rest/technos/${ technoName }/${ technoVersion }`).then(async function (versionTypes) {
                            for (const versionType of versionTypes.data) {
                                await rest.del(`${ world.productionUserUrl }/rest/technos/${ technoName }/${ technoVersion }/${ versionType }`);
                            }
                        });
                    }
                });
            }
        });
    });
});

After(function () {
    console.log('After hook (does not execute on test failure):');
});

AfterAll(function (next) {
    console.log('AfterAll hook');
    next();
});

class CustomWorld {
    constructor() {
        this.productionUserUrl = 'http://prod:password@localhost';
        this.technoBuilder = new TechnoBuilder();
        this.moduleBuilder = new ModuleBuilder();
        this.templateBuilder = new TemplateBuilder();
        this.platformBuilder = new PlatformBuilder();
        this.deployedModuleBuilder = new DeployedModuleBuilder();
        this.templateHistory = new TemplateHistory();
        this.technoHistory = new TechnoHistory();
        this.moduleHistory = new ModuleHistory();
        this.platformHistory = new PlatformHistory();
    }
}

// World is an isolated context for each scenario,
// exposed to the hooks and steps as `this`
setWorldConstructor(CustomWorld);

setDefaultTimeout(60 * 1000);
