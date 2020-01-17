class DeployedModuleBuilder {
    constructor() {
        this.id = 0;
        this.propertiesVersionId = 0;
        this.name = '';
        this.version = '';
        this.isWorkingCopy = true;
        this.modulePath = '#ABC#DEF';
        this.instances = [];
        this.logicGroup = 'ABC';
        this.valuedProperties = [];
        this.iterableProperties = [];
    }

    withModulePath(modulePath) {
        this.modulePath = modulePath;
    }

    withLogicGroup(logicGroup) {
        this.logicGroup = logicGroup;
    }

    fromModuleBuilder(moduleBuilder) {
        this.name = moduleBuilder.name;
        this.version = moduleBuilder.version;
        this.isWorkingCopy = moduleBuilder.isWorkingcopy;
    }

    getVersionType() {
        // L'opérateur ternaire ne fonctionne pas dans ce cas...
        if (this.isWorkingCopy) {
            return 'workingcopy';
        }
        return 'release';
    }

    setValuedProperties(valuedProperties) {
        this.valuedProperties = valuedProperties;
    }

    setIterableProperties(iterableProperties) {
        this.iterableProperties = iterableProperties;
    }

    addInstance(instanceName) {
        this.instances.push({ name: instanceName, properties: [] });
    }

    setInstancesProperties(instanceName, properties) {
        this.instances.forEach((instance) => {
            if (instance.name === instanceName) {
                instance.properties = properties;
            }
        });
    }

    setId(id) {
        this.id = id;
    }

    buildPropertiesPath() {
        return `${ this.modulePath }#${ this.name }#${ this.version }#${ this.getVersionType().toUpperCase() }`;
    }

    build() {
        return {
            id: this.id,
            properties_version_id: this.propertiesVersionId,
            name: this.name,
            version: this.version,
            working_copy: this.isWorkingCopy,
            path: this.modulePath,
            properties_path: this.buildPropertiesPath(),
            instances: this.instances.map((instance) => ({
                name: instance.name,
                key_values: instance.properties.map((property) => property.buildKeyValuePropertyInput()),
            })),
        };
    }

    buildValuedProperties() {
        return {
            properties_version_id: this.propertiesVersionId,
            key_value_properties: this.valuedProperties.map((valuedProperty) => valuedProperty.buildKeyValuePropertyInput()),
            iterable_properties: this.buildIterableProperties(),
        };
    }

    buildIterableProperties() {
        // Première étape : transformer la liste à plat en map
        const iterableMap = new Map();
        for (const iterableProperty of this.iterableProperties) {
            const itemMap = iterableMap.has(iterableProperty.iterableName) ? iterableMap.get(iterableProperty.iterableName) : new Map();
            const propertyMap = itemMap.has(iterableProperty.blockName) ? itemMap.get(iterableProperty.blockName) : new Map();
            propertyMap.set(iterableProperty.propertyName, iterableProperty.propertyValue);
            itemMap.set(iterableProperty.blockName, propertyMap);
            iterableMap.set(iterableProperty.iterableName, itemMap);
        }
        // Deuxième étape : recréer l'arbre des données attendues en input à l'aide des maps
        const iterablePropertiesInput = [];
        for (const [ iterableName, iterableItems ] of iterableMap) {
            const items = [];
            for (const [ itemTitle, itemProperties ] of iterableItems) {
                const values = [];
                for (const [ propertyName, propertyValue ] of itemProperties) {
                    values.push({
                        name: propertyName,
                        value: propertyValue,
                    });
                }
                items.push({
                    title: itemTitle,
                    values: values,
                });
            }
            iterablePropertiesInput.push({
                name: iterableName,
                iterable_valorisation_items: items,
            });
        }
        return iterablePropertiesInput;
    }

    incrementPropertiesVersionId() {
        this.propertiesVersionId++;
    }

    equalsByKey(deployedModuleBuilder) {
        // eslint-disable-next-line lodash/prefer-matches
        return this.name === deployedModuleBuilder.name &&
            this.version === deployedModuleBuilder.version &&
            this.isWorkingCopy === deployedModuleBuilder.isWorkingCopy;
    }
}

exports.DeployedModuleBuilder = DeployedModuleBuilder;
