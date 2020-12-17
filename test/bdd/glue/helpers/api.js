const rest = require('restling');

const onError = function (error) {
    console.error(error.message, error.statusCode, error.data);
};

exports.encodeHashSymbol = function (text) {
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

exports.updatePlatform = async function (platformBuilder, platformHistory, platform, urlPrefix = baseUrl) {
    await this.put(`${ urlPrefix }/rest/applications/${ platformBuilder.applicationName }/platforms`, platform);
    platformHistory.updatePlatformBuilder(platformBuilder);
};

const saveProperties = async function (api, platformBuilder, propertiesPath, properties, comment = 'comment', urlPrefix = baseUrl) {
    propertiesPath = api.encodeHashSymbol(propertiesPath);
    let url = `${ urlPrefix }/rest/applications/${ platformBuilder.applicationName }`;
    url += `/platforms/${ platformBuilder.platformName }`;
    url += `/properties?path=${ propertiesPath }`;
    url += `&platform_vid=${ platformBuilder.versionId }`;
    url += `&comment=${ comment }`;
    await api.put(url, properties);
};

exports.saveValuedProperties = async function (platformBuilder, deployedModuleBuilder, platformHistory, comment, urlPrefix) {
    await saveProperties(this, platformBuilder, deployedModuleBuilder.buildPropertiesPath(), deployedModuleBuilder.buildValuedProperties(), comment, urlPrefix);
    platformBuilder.updateDeployedModuleBuilder(deployedModuleBuilder);
    platformHistory.updatePlatformBuilder(platformBuilder);
};

exports.saveGlobalProperties = async function (platformBuilder, platformHistory, comment, urlPrefix) {
    await saveProperties(this, platformBuilder, '#', platformBuilder.buildGlobalProperties(), comment, urlPrefix);
    platformBuilder.incrementGlobalPropertiesVersionId();
    platformHistory.updatePlatformBuilder(platformBuilder);
};

exports.buildDiffUrl = function (fromPlatformBuilder, toPlatformBuilder, fromPropertiesPath, toPropertiesPath, storedValues, timestamp, originTimestamp) {
    fromPropertiesPath = this.encodeHashSymbol(fromPropertiesPath);
    toPropertiesPath = this.encodeHashSymbol(toPropertiesPath);
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
    if (originTimestamp) {
        url += `&origin_timestamp=${ originTimestamp }`;
    }
    return url;
};
