const api = require('../../helpers/api');

Given(/^I update this platform, adding module "([^"]*)"(?: with version "([^"]*)")? to logical group "([^"]*)"$/,
    /** @this CustomWorld */ async function (moduleName, moduleVersion, logicalGroupName) {
        const moduleBuilder = this.moduleHistory.findModuleBuilder(moduleName, moduleVersion);
        this.deployedModuleBuilder.fromModuleBuilder(moduleBuilder);
        this.deployedModuleBuilder.withModulePath(`#${ logicalGroupName }`);
        this.platformBuilder.withDeployedModuleBuilder(this.deployedModuleBuilder);
        await api.updatePlatform(this.platformBuilder, this.platformHistory, this.platformBuilder.build());
    });
