const api = require('../../helpers/api');
const { ValuedProperty } = require('../../builders/ValuedProperty');
const { IterableProperty } = require('../../builders/IterableProperty');

Given(/^the platform has these (valued|global) properties$/, /** @this CustomWorld */ async function (propertiesNature, dataTable) {
    const valuedProperties = [];
    for (const [ name, value ] of dataTable.raw()) {
        valuedProperties.push(new ValuedProperty(name, value));
    }
    if (propertiesNature === 'valued') {
        this.deployedModuleBuilder.setValuedProperties(valuedProperties);
        await api.saveValuedProperties(this.platformBuilder, this.deployedModuleBuilder, this.platformHistory);
    } else if (propertiesNature === 'global') {
        this.platformBuilder.setGlobalProperties(valuedProperties);
        await api.saveGlobalProperties(this.platformBuilder, this.platformHistory);
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
