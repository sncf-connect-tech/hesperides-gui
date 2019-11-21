const rest = require('restling');

exports.post = async function (url, body) {
    await rest.postJson(url, body).catch((error) => console.error(error.message, error.statusCode, error.data));
};

exports.addTemplateToModule = async function (moduleBuilder, template) {
    await this.post(`${ baseUrl }/rest/modules/${ moduleBuilder.name }/${ moduleBuilder.version }/${ moduleBuilder.getModuleType() }/templates`, template);
};

exports.createModule = async function (moduleBuilder) {
    await this.post(`${ baseUrl }/rest/modules`, moduleBuilder.build());
    const api = this;
    await moduleBuilder.templateBuilders.forEach(function (templateBuilder) {
        api.addTemplateToModule(moduleBuilder, templateBuilder.build());
    });
};

exports.createPlatform = async function (platform) {
    await this.post(`${ baseUrl }/rest/applications`, platform);
};
