const cloneDeep = require('lodash/cloneDeep');

class PlatformBuilder {
    constructor() {
        this.platformName = 'DEV';
        this.applicationName = 'APP';
        this.version = '1.0';
        this.isProduction = false;
        this.deployedModuleBuilders = [];
        this.versionId = 0;
        this.hasPasswords = false;
        this.globalProperties = [];
        this.globalPropertiesVersionId = 0;
    }

    withPlatformName(platformName) {
        this.platformName = platformName;
    }

    withDeployedModuleBuilder(deployedModuleBuilder) {
        this.deployedModuleBuilders.push(cloneDeep(deployedModuleBuilder));
    }

    withProductionFlag(isProduction) {
        this.isProduction = isProduction;
    }

    setGlobalProperties(globalProperties) {
        this.globalProperties = globalProperties;
    }

    build() {
        return {
            platform_name: this.platformName,
            application_name: this.applicationName,
            application_version: this.version,
            production: this.isProduction,
            modules: this.deployedModuleBuilders.map((deployedModuleBuilder) => deployedModuleBuilder.build()),
            version_id: this.versionId,
            has_passwords: this.hasPasswords,
        };
    }

    buildGlobalProperties() {
        return {
            iterable_properties: [],
            key_value_properties: this.globalProperties.map((globalProperty) => globalProperty.buildKeyValuePropertyInput()),
            properties_version_id: this.globalPropertiesVersionId,
        };
    }

    findDeployedModuleBuilderByName(moduleName) {
        return this.deployedModuleBuilders.filter((deployedModuleBuilder) => deployedModuleBuilder.name === moduleName)[0];
    }

    updateDeployedModuleBuilder(deployedModuleBuilder) {
        deployedModuleBuilder.incrementPropertiesVersionId();
        const updatedDeployedModuleBuilder = cloneDeep(deployedModuleBuilder);
        this.deployedModuleBuilders = this.deployedModuleBuilders
            .map((existingDeployedModuleBuilder) => (existingDeployedModuleBuilder.equalsByKey(updatedDeployedModuleBuilder) ?
                updatedDeployedModuleBuilder : existingDeployedModuleBuilder));
    }

    incrementGlobalPropertiesVersionId() {
        this.globalPropertiesVersionId++;
    }

    incrementPlatformVersionId() {
        this.versionId++;
    }

    setDeployedModuleIds() {
        let maxId = 0;
        for (const deployedModuleBuilder of this.deployedModuleBuilders) {
            if (deployedModuleBuilder.id > maxId) {
                maxId = deployedModuleBuilder.id;
            }
        }
        for (const deployedModuleBuilder of this.deployedModuleBuilders) {
            if (!deployedModuleBuilder.id || deployedModuleBuilder.id < 1) {
                deployedModuleBuilder.setId(++maxId);
            }
        }
    }

    equalsByKey(platformBuilder) {
        return this.platformName === platformBuilder.platformName &&
            this.applicationName === platformBuilder.applicationName;
    }
}

exports.PlatformBuilder = PlatformBuilder;
