const api = require('../../helpers/api');

Given(/^I update this platform, adding module "([^"]*)"(?: with version "([^"]*)")? to logical group "([^"]*)"$/,
    /** @this CustomWorld */ async function (moduleName, moduleVersion, logicalGroupName) {
        const moduleBuilder = this.moduleHistory.findModuleBuilder(moduleName, moduleVersion);
        this.deployedModuleBuilder.fromModuleBuilder(moduleBuilder);
        this.deployedModuleBuilder.withModulePath(`#${ logicalGroupName }`);
        this.platformBuilder.withDeployedModuleBuilder(this.deployedModuleBuilder);
        await api.updatePlatform(this.platformBuilder, this.platformHistory, this.platformBuilder.build());
    });

Given(/^I update this platform, removing module "([^"]*)"$/, /** @this CustomWorld */ async function (moduleName) {
    this.platformBuilder.removeDeployedModuleBuilderByName(moduleName);
    await api.updatePlatform(this.platformBuilder, this.platformHistory, this.platformBuilder.build());
});

Given(/^I update this platform, setting module "([^"]*)" version to "([^"]*)"/,
    /** @this CustomWorld */ async function (moduleName, newModuleVersion) {
        const moduleBuilder = this.moduleHistory.findModuleBuilder(moduleName, newModuleVersion);
        this.deployedModuleBuilder.fromModuleBuilder(moduleBuilder);
        this.platformBuilder.setDeployedModuleBuilders([ this.deployedModuleBuilder ]);
        await api.updatePlatform(this.platformBuilder, this.platformHistory, this.platformBuilder.build());
    });

Given(/^I update this platform version to "([^"]*)"( as production user)?$/,
    /** @this CustomWorld */ async function (newPlatformVersion, productionUser) {
        this.platformBuilder.withVersion(newPlatformVersion);
        const urlPrefix = productionUser ? this.productionUserUrl : baseUrl;
        await api.updatePlatform(this.platformBuilder, this.platformHistory, this.platformBuilder.build(), urlPrefix);
    });

Given('the platform version is updated {int} times', /** @this CustomWorld */ async function (updatesCount) {
    for (let index = 0; index < updatesCount; index++) {
        this.platformBuilder.withVersion(`${ index }.1`);
        await api.updatePlatform(this.platformBuilder, this.platformHistory, this.platformBuilder.build());
    }
});
