const api = require('../../helpers/api');

Given(/^a(?:n existing)?( production)? platform using this module$/,
    /** @this CustomWorld */ async function (production) {
        this.deployedModuleBuilder.fromModuleBuilder(this.moduleBuilder);
        this.platformBuilder.withDeployedModuleBuilder(this.deployedModuleBuilder);
        this.platformBuilder.isProductionPlatform = Boolean(production);
        await api.createPlatform(this.platformBuilder.build());
    });
