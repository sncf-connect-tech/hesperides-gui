const assert = require('../../helpers/assert');
const get = require('../../helpers/get');
const send = require('../../helpers/send');

When('I add an instance to this module', /** @this CustomWorld */ async function () {
    await browser.actions().mouseMove(get.elementById(`e2e-tree-renderer-edit-module-button-${ this.deployedModuleBuilder.name }`)).perform();
    await send.clickById(`e2e-deployed-module-controls-add-instance-button-${ this.deployedModuleBuilder.name }`);
    await send.inputById('e2e-add-instance-instance-name-input', 'XXX');
    await send.clickById('e2e-add-instance-create-instance-button');
});

Then('the instance is successfully to the module', /** @this CustomWorld */ async function () {
    await send.clickById(`e2e-tree-renderer-tree-sign-${ this.deployedModuleBuilder.name }`);
    await assert.isPresentById(`e2e-instance-${ this.deployedModuleBuilder.name }-XXX`);
});
