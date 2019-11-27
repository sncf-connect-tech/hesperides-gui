const rest = require('restling');

exports.post = async function (url, body) {
    await rest.postJson(url, body).catch((error) => console.error(error.message, error.statusCode, error.data));
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

exports.createPlatform = async function (platform) {
    await this.post(`${ baseUrl }/rest/applications`, platform);
};
