const cloneDeep = require('lodash/cloneDeep');

class PlatformHistory {
    constructor() {
        this.platformBuilders = [];
    }

    getPlatformBuilders() {
        return this.platformBuilders;
    }

    addPlatformBuilder(platformBuilder) {
        this.platformBuilders.push(cloneDeep(platformBuilder));
    }
}

exports.PlatformHistory = PlatformHistory;
