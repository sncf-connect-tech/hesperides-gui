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
        const existingPlatformBuilder = this.platformBuilders.find((platformBuilder) =>
            platformBuilder.platformName === platformName);

        if (!existingPlatformBuilder) {
            throw new Error(`Can't find platform builder by name "${ platformName }"`);
        }
        return existingPlatformBuilder;
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
