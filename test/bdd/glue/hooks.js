const rest = require('restling');
const { BeforeAll, Before, After, AfterAll, setWorldConstructor, setDefaultTimeout } = require('cucumber');
const { ModuleBuilder } = require('./builders/ModuleBuilder');
const { TemplateBuilder } = require('./builders/TemplateBuilder');
const { PlatformBuilder } = require('./builders/PlatformBuilder');
const { DeployedModuleBuilder } = require('./builders/DeployedModuleBuilder');

BeforeAll(function (next) {
    console.log('BeforeAll hook');
    next();
});

Before(/** @this CustomWorld */ async function () {
    console.log('Before hook');
    const errorCallback = function (error) {
        if (error.statusCode !== 404) { // we ignore errors only if the entity did not exist
            console.error(`HTTP ${ error.statusCode }: ${ error.data }`);
            throw error;
        }
    };
    await rest.del(`${ baseUrl }/rest/applications/${ this.platformBuilder.applicationName }/platforms/${ this.platformBuilder.platformName }`).catch(errorCallback);
    await rest.del(`${ baseUrl }/rest/modules/${ this.moduleBuilder.name }/${ this.moduleBuilder.version }/${ this.moduleBuilder.getModuleType() }`).catch(errorCallback);
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
        this.moduleBuilder = new ModuleBuilder();
        this.templateBuilder = new TemplateBuilder();
        this.platformBuilder = new PlatformBuilder();
        this.deployedModuleBuilder = new DeployedModuleBuilder();
    }
}

// World is an isolated context for each scenario,
// exposed to the hooks and steps as `this`
setWorldConstructor(CustomWorld);

setDefaultTimeout(60 * 1000);
