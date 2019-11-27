const cloneDeep = require('lodash/cloneDeep');

class TechnoBuilder {
    constructor() {
        // La recherche ne passe pas quand il y a un tiret dans le nom
        this.name = 'technoPtor';
        this.version = '1.0';
        this.isWorkingcopy = true;
        this.templateBuilders = [];
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

    getVersionType() {
        return this.isWorkingcopy ? 'workingcopy' : 'release';
    }

    build() {
        return {
            name: this.name,
            version: this.version,
            working_copy: this.isWorkingcopy,
        };
    }
}

exports.TechnoBuilder = TechnoBuilder;
