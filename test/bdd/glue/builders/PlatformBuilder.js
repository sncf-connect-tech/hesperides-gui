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
}

exports.PlatformBuilder = PlatformBuilder;
