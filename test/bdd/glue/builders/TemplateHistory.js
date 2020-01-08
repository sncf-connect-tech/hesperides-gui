const cloneDeep = require('lodash/cloneDeep');

class TemplateHistory {
    constructor() {
        this.templateBuilders = [];
    }

    getTemplateBuilders() {
        return this.templateBuilders;
    }

    addTemplateBuilder(templateBuilder) {
        this.templateBuilders.push(cloneDeep(templateBuilder));
    }
}

exports.TemplateHistory = TemplateHistory;
