const cloneDeep = require('lodash/cloneDeep');

class ModuleHistory {
    constructor() {
        this.moduleBuilders = [];
    }

    getModuleBuilders() {
        return this.moduleBuilders;
    }

    addModuleBuilder(moduleBuilder) {
        this.moduleBuilders.push(cloneDeep(moduleBuilder));
    }
}

exports.ModuleHistory = ModuleHistory;
