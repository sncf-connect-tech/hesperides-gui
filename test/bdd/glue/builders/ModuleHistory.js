const cloneDeep = require('lodash/cloneDeep');

class ModuleHistory {
    constructor() {
        this.moduleBuilders = [];
    }

    addModuleBuilder(moduleBuilder) {
        this.moduleBuilders.push(cloneDeep(moduleBuilder));
    }

    findModuleBuilder(moduleName, moduleVersion) {
        return this.moduleBuilders.filter((moduleBuilder) =>
            moduleBuilder.name === moduleName &&
            (!moduleVersion || moduleBuilder.version === moduleVersion))[0];
    }
}

exports.ModuleHistory = ModuleHistory;
