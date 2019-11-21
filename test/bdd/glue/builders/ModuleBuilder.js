class ModuleBuilder {
    constructor() {
        this.name = 'module-ptor';
        this.version = '1.0';
        this.isWorkingcopy = true;
        this.templateBuilders = [];
        this.versionId = 0;
        this.technos = [];
    }

    withTemplateBuilder(templateBuilder) {
        this.templateBuilders.push(templateBuilder);
    }

    getModuleType() {
        return this.isWorkingcopy ? 'workingcopy' : 'release';
    }

    build() {
        return {
            name: this.name,
            version: this.version,
            working_copy: this.isWorkingcopy,
            version_id: this.versionId,
            technos: this.technos,
        };
    }
}

exports.ModuleBuilder = ModuleBuilder;
