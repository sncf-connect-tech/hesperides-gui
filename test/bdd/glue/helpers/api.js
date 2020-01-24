const rest = require('restling');

const onError = function (error) {
    console.error(error.message, error.statusCode, error.data);
};

const encodeHashSymbol = function (text) {
    return text.replace(/#/g, '%23');
};

exports.post = async function (url, body) {
    await rest.postJson(url, body).catch(onError);
};

exports.put = async function (url, body) {
    await rest.putJson(url, body).catch(onError);
};

exports.createTechno = async function (technoBuilder, template) {
    await this.post(`${ baseUrl }/rest/technos/${ technoBuilder.name }/${ technoBuilder.version }/${ technoBuilder.getVersionType() }/templates`, template);
};

exports.addTemplateToModule = async function (moduleBuilder, template) {
    await this.post(`${ baseUrl }/rest/modules/${ moduleBuilder.name }/${ moduleBuilder.version }/${ moduleBuilder.getVersionType() }/templates`, template);
};

exports.createModule = async function (moduleBuilder) {
    await this.post(`${ baseUrl }/rest/modules`, moduleBuilder.build());
    for (const templateBuilder of moduleBuilder.templateBuilders) {
        await this.addTemplateToModule(moduleBuilder, templateBuilder.build());
    }
};

exports.createPlatform = async function (platform, urlPrefix) {
    await this.post(`${ urlPrefix }/rest/applications`, platform);
};

const saveProperties = async function (api, platformBuilder, propertiesPath, properties) {
    propertiesPath = encodeHashSymbol(propertiesPath);
    let url = `${ baseUrl }/rest/applications/${ platformBuilder.applicationName }`;
    url += `/platforms/${ platformBuilder.platformName }`;
    url += `/properties?path=${ propertiesPath }`;
    url += `&platform_vid=${ platformBuilder.versionId }`;
    url += '&comment=fake-comment';
    await api.put(url, properties);
};

exports.saveValuedProperties = async function (platformBuilder, deployedModuleBuilder, platformHistory) {
    await saveProperties(this, platformBuilder, deployedModuleBuilder.buildPropertiesPath(), deployedModuleBuilder.buildValuedProperties());
    platformBuilder.updateDeployedModuleBuilder(deployedModuleBuilder);
    platformHistory.updatePlatformBuilder(platformBuilder);
};

exports.saveGlobalProperties = async function (platformBuilder, platformHistory) {
    await saveProperties(this, platformBuilder, '#', platformBuilder.buildGlobalProperties());
    platformBuilder.incrementGlobalPropertiesVersionId();
    platformHistory.updatePlatformBuilder(platformBuilder);
};

exports.buildDiffUrl = function (fromPlatformBuilder, toPlatformBuilder, fromPropertiesPath, toPropertiesPath, storedValues, timestamp) {
    fromPropertiesPath = encodeHashSymbol(fromPropertiesPath);
    toPropertiesPath = encodeHashSymbol(toPropertiesPath);
    let url = `${ baseUrl }/#/diff?application=${ fromPlatformBuilder.applicationName }`;
    url += `&platform=${ fromPlatformBuilder.platformName }`;
    url += `&properties_path=${ fromPropertiesPath }`;
    url += `&compare_application=${ toPlatformBuilder.applicationName }`;
    url += `&compare_platform=${ toPlatformBuilder.platformName }`;
    url += `&compare_path=${ toPropertiesPath }`;
    url += `&compare_stored_values=${ Boolean(storedValues) }`;
    if (timestamp) {
        url += `&timestamp=${ timestamp }`;
    }
    return url;
};
