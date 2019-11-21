const api = require('../../helpers/api');

Given('a platform using this module', /** @this CustomWorld */ async function () {
    this.deployedModuleBuilder.fromModuleBuilder(this.moduleBuilder);
    this.platformBuilder.withDeployedModuleBuilder(this.deployedModuleBuilder);
    await api.createPlatform(this.platformBuilder.build());
});
