const api = require('../../helpers/api');
const assert = require('../../helpers/assertions');
const send = require('../../helpers/user-events');

Given('an existing module with required properties and non-required properties', /** @this CustomWorld */ async function () {
    this.templateBuilder.withContent('{{ simple-property }}{{ required-property | @required }}');
    this.moduleBuilder.withTemplateBuilder(this.templateBuilder);
    await api.createModule(this.moduleBuilder);
});

When('I open the menu for creating new workingcopy modules', async function () {
    await send.clickById('e2e-navbar-module');
    await send.clickById('e2e-navbar-module-create');
});

When('I submit valid values', /** @this CustomWorld */ async function () {
    await send.inputByCss('#e2e-modal-module-create input[name="moduleName"]', this.moduleBuilder.name);
    await send.inputByCss('#e2e-modal-module-create input[name="moduleVersion"]', this.moduleBuilder.version);
    await send.clickByCss('#e2e-modal-module-create button[type="submit"]');
});

Then('I am redirected to the newly created module page', /** @this CustomWorld */ async function () {
    const expectedUrl = `${ baseUrl }/#/module/${ this.moduleBuilder.name }/${ this.moduleBuilder.version }?type=workingcopy`;
    await assert.checkUrl(expectedUrl);
});
