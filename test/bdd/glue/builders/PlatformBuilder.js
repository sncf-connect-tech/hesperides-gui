class PlatformBuilder {
    constructor() {
        this.platformName = 'DEV';
        this.applicationName = 'APP';
        this.version = '1.0';
        this.isProductionPlatform = false;
        this.deployedModuleBuilders = [];
        this.versionId = 0;
        this.hasPasswords = false;
    }

    withDeployedModuleBuilder(deployedModuleBuilder) {
        this.deployedModuleBuilders.push(deployedModuleBuilder);
    }

    build() {
        return {
            platform_name: this.platformName,
            application_name: this.applicationName,
            application_version: this.version,
            production: this.isProductionPlatform,
            modules: this.deployedModuleBuilders.map((deployedModuleBuilder) => deployedModuleBuilder.build()),
            version_id: this.versionId,
            has_passwords: this.hasPasswords,
        };
    }
}

exports.PlatformBuilder = PlatformBuilder;
