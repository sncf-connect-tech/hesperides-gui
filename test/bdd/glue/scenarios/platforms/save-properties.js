const api = require('../../helpers/api');
const { ValuedProperty } = require('../../entities/ValuedProperty');
const { IterableProperty } = require('../../entities/IterableProperty');

Given(/^the platform has these (valued|global) properties( saved by production user)?(?: with comment "([^"]*)")?$/,
    /** @this CustomWorld */ async function (propertiesNature, productionUser, comment, dataTable) {
        const valuedProperties = [];
        for (const [ name, value ] of dataTable.raw()) {
            valuedProperties.push(new ValuedProperty(name, value));
        }
        const urlPrefix = productionUser ? this.productionUserUrl : baseUrl;
        if (propertiesNature === 'valued') {
            this.deployedModuleBuilder.setValuedProperties(valuedProperties);
            await api.saveValuedProperties(this.platformBuilder, this.deployedModuleBuilder, this.platformHistory, comment, urlPrefix);
        } else if (propertiesNature === 'global') {
            this.platformBuilder.setGlobalProperties(valuedProperties);
            await api.saveGlobalProperties(this.platformBuilder, this.platformHistory, comment, urlPrefix);
        }
    });

Given('the platform has these iterable properties', /** @this CustomWorld */ async function (dataTable) {
    const iterableProperties = [];
    for (const [ iterableName, blockName, propertyName, propertyValue ] of dataTable.raw()) {
        iterableProperties.push(new IterableProperty(iterableName, blockName, propertyName, propertyValue));
    }
    this.deployedModuleBuilder.setIterableProperties(iterableProperties);
    await api.saveValuedProperties(this.platformBuilder, this.deployedModuleBuilder, this.platformHistory);
});

Given('the deployed module has these instances', /** @this CustomWorld  */ async function (dataTable) {
    for (const [ instanceName ] of dataTable.raw()) {
        this.deployedModuleBuilder.addInstance(instanceName);
    }
    this.platformBuilder.updateDeployedModuleBuilder(this.deployedModuleBuilder);
    await api.updatePlatform(this.platformBuilder, this.platformHistory, this.platformBuilder.build());
});

Given('the instance {string} has these valued properties', /** @this CustomWorld */ async function (instanceName, dataTable) {
    const properties = [];
    for (const [ name, value ] of dataTable.raw()) {
        properties.push(new ValuedProperty(name, value));
    }
    this.deployedModuleBuilder.setInstancesProperties(instanceName, properties);
    this.platformBuilder.updateDeployedModuleBuilder(this.deployedModuleBuilder);
    await api.updatePlatform(this.platformBuilder, this.platformHistory, this.platformBuilder.build());
});

Given('the platform has a property that is updated {int} times', /** @this CustomWorld */ async function (updatesCount) {
    for (let index = 0; index <= updatesCount; index++) {
        const valuedProperties = [];
        valuedProperties.push(new ValuedProperty('property', index));
        this.deployedModuleBuilder.setValuedProperties(valuedProperties);
        await api.saveValuedProperties(this.platformBuilder, this.deployedModuleBuilder, this.platformHistory);
    }
});
