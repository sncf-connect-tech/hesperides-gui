const cloneDeep = require('lodash/cloneDeep');

class ModuleHistory {
    constructor() {
        this.moduleBuilders = [];
    }

    addModuleBuilder(moduleBuilder) {
        this.moduleBuilders.push(cloneDeep(moduleBuilder));
    }

    findModuleBuilder(moduleName, moduleVersion) {
        const existingModuleBuilder = this.moduleBuilders.find((moduleBuilder) =>
            moduleBuilder.name === moduleName &&
            (!moduleVersion || moduleBuilder.version === moduleVersion));

        if (!existingModuleBuilder) {
            let message = `Can't find module builder by name "${ moduleName }"`;
            if (moduleVersion) {
                message += ` and version "${ moduleVersion }"`;
            }
            throw new Error(message);
        }
        return existingModuleBuilder;
    }
}

exports.ModuleHistory = ModuleHistory;
