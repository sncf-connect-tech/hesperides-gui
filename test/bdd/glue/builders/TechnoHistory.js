const cloneDeep = require('lodash/cloneDeep');

class TechnoHistory {
    constructor() {
        this.technoBuilders = [];
    }

    getTechnoBuilders() {
        return this.technoBuilders;
    }

    addTechnoBuilder(technoBuilder) {
        this.technoBuilders.push(cloneDeep(technoBuilder));
    }
}

exports.TechnoHistory = TechnoHistory;
