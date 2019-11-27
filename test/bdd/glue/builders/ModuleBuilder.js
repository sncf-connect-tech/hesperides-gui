const cloneDeep = require('lodash/cloneDeep');

class ModuleBuilder {
    constructor() {
        this.name = 'module-ptor';
        this.version = '1.0';
        this.isWorkingcopy = true;
        this.templateBuilders = [];
        this.versionId = 0;
        this.technoBuilders = [];
    }

    withName(name) {
        this.name = name;
    }

    withVersion(version) {
        this.version = version;
    }

    withIsWorkingcopy(isWorkingcopy) {
        this.isWorkingcopy = isWorkingcopy;
    }

    withTemplateBuilder(templateBuilder) {
        this.templateBuilders.push(cloneDeep(templateBuilder));
    }

    withTechnoBuilder(techoBuilder) {
        this.technoBuilders.push(cloneDeep(techoBuilder));
    }

    getVersionType() {
        return this.isWorkingcopy ? 'workingcopy' : 'release';
    }

    build() {
        return {
            name: this.name,
            version: this.version,
            working_copy: this.isWorkingcopy,
            version_id: this.versionId,
            technos: this.technoBuilders.map((technoBuilder) => technoBuilder.build()),
        };
    }
}

exports.ModuleBuilder = ModuleBuilder;
