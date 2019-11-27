class DeployedModuleBuilder {
    constructor() {
        this.id = 0;
        this.propertiesVersionId = 0;
        this.name = '';
        this.version = '';
        this.isWorkingCopy = true;
        this.modulePath = '#ABC#DEF';
        this.propertiesPath = '';
        this.instances = [];
    }

    withModulePath(modulePath) {
        this.modulePath = modulePath;
    }

    fromModuleBuilder(moduleBuilder) {
        this.name = moduleBuilder.name;
        this.version = moduleBuilder.version;
        this.isWorkingCopy = moduleBuilder.isWorkingcopy;
    }

    build() {
        return {
            id: this.id,
            properties_version_id: this.propertiesVersionId,
            name: this.name,
            version: this.version,
            working_copy: this.isWorkingCopy,
            path: this.modulePath,
            properties_path: this.propertiesPath,
            instances: this.instances,
        };
    }
}

exports.DeployedModuleBuilder = DeployedModuleBuilder;
