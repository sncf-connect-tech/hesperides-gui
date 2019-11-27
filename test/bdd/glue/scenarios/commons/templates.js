const { TemplateBuilder } = require('../../builders/TemplateBuilder');
const assert = require('../../helpers/assert');
const send = require('../../helpers/send');

const getTemplateSelector = function (templateBuilder) {
    return `#e2e-template-list a[title="${ templateBuilder.location }/${ templateBuilder.filename }"]`;
};

Given('an existing template with this content', /** @this CustomWorld */ function (content) {
    this.templateBuilder = new TemplateBuilder();
    this.templateBuilder.withContent(content);
});

When(/^I add a new template to this (?:techno|module)$/, /** @this CustomWorld */ async function () {
    await send.clickById('e2e-template-list-create-template-button');
    await send.inputByCss('input[name="templateName"]', this.templateBuilder.name);
    await send.inputByCss('input[name="templateFilename"]', this.templateBuilder.filename);
    await send.inputByCss('input[name="templateLocation"]', this.templateBuilder.location);
    await send.clickByCss('button[type="submit"]');
    await browser.waitForAngular();
});

When(/^I download the template file for this (?:techno|module) template$/, /** @this CustomWorld */ async function () {
    await send.clickById(`e2e-template-list-download-button-for-${ this.templateBuilder.name }`);
});

When(/^I delete a template of this (?:techno|module)$/, /** @this CustomWorld */ async function () {
    await send.clickById(`e2e-template-list-trash-button-for-${ this.templateBuilder.name }`);
    await send.acceptAlert();
});

Then(/^the template is successfully added to the (?:techno|module)$/, /** @this CustomWorld */ async function () {
    const templateSelector = getTemplateSelector(this.templateBuilder);
    await assert.isPresentByCss(templateSelector);
});

Then(/^the template is successfully deleted from the (?:techno|module)$/, /** @this CustomWorld */ async function () {
    const templateSelector = getTemplateSelector(this.templateBuilder);
    await assert.isNotPresentByCss(templateSelector);
});

Then('the template file is downloaded and it has the content of the template', /** @this CustomWorld */ async function () {
    const filePath = downloadsPath + this.templateBuilder.filename;
    await assert.fileContains(filePath, this.templateBuilder.content);
});

Then(/^the existing template is also (?:copied|released)$/, /** @this CustomWorld */ async function () {
    const templateSelector = getTemplateSelector(this.templateBuilder);
    await assert.isPresentByCss(templateSelector);
});
