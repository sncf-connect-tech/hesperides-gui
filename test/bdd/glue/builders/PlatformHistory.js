const cloneDeep = require('lodash/cloneDeep');

class PlatformHistory {
    constructor() {
        this.platformBuilders = [];
    }

    addPlatformBuilder(platformBuilder) {
        platformBuilder.incrementPlatformVersionId();
        this.platformBuilders.push(cloneDeep(platformBuilder));
    }

    findPlatformBuilderByName(platformName) {
        return this.platformBuilders.filter((platformBuilder) => platformBuilder.platformName === platformName)[0];
    }

    updatePlatformBuilder(platformBuilder) {
        platformBuilder.incrementPlatformVersionId();
        platformBuilder.setDeployedModuleIds();
        const updatedPlatformBuilder = cloneDeep(platformBuilder);

        this.platformBuilders = this.platformBuilders
            .map((existingPlatformBuilder) => (existingPlatformBuilder.equalsByKey(updatedPlatformBuilder) ?
                updatedPlatformBuilder : existingPlatformBuilder));
    }
}

exports.PlatformHistory = PlatformHistory;
