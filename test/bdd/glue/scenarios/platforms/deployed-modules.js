const assert = require('../../helpers/assert');
const get = require('../../helpers/get');
const send = require('../../helpers/send');

When('I filter deployed modules on {string}', async function (filter) {
    await send.inputById('e2e-tree-properties-filter', filter);
});

When('I open an URL pointing to this deployed module', /** @this CustomWorld */ async function () {
    const { applicationName, platformName } = this.platformBuilder;
    const propertiesPath = this.deployedModuleBuilder.buildPropertiesPath();
    await browser.get(`${ baseUrl }/#/properties/${ applicationName }?platform=${ platformName }#${ encodeURIComponent(propertiesPath) }`);
    await browser.waitForAngular();
});

Then('the deployed module filter still contains {string}', async function (filterText) {
    const filterInput = get.elementById('e2e-tree-properties-filter');
    await assert.containsValue(filterInput, filterText);
});

Then('there is only one deployed module displayed', async function () {
    const deployedModules = get.elementsByCss('.module-link');
    await assert.elementsCount(deployedModules, 1);
});

Then('the properties of this deployed module are displayed', /** @this CustomWorld */ async function () {
    const { name, version, isWorkingCopy } = this.deployedModuleBuilder;
    const formTitle = get.elementById('e2e-tree-properties-form-title');
    await assert.containsText(formTitle, `Properties attached to | ${ name }, ${ version }${ isWorkingCopy ? ' (working copy)' : '' }`);
});
