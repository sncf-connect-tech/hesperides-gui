
const assert = require('../../helpers/assert');
const send = require('../../helpers/send');

When(/^I copy this logic group "([^"]*)" to the existing logic group "([^"]*)"( with the same module name)?$/, async function (logicGroupSource, logicGroupDestination, withTheSameModuleName) {
    await send.mouseOnById(`e2e-tree-renderer-edit-logic-group-${ logicGroupSource }`);
    await send.clickById(`e2e-tree-renderer-copy-box-button-${ logicGroupSource }`);
    await send.mouseOnById(`e2e-logic-group-to-select-${ logicGroupDestination }`);
    if (withTheSameModuleName) {
        await send.clickByIdAndAcceptAlert(`e2e-logic-group-to-select-${ logicGroupDestination }`);
    } else {
        await send.clickById(`e2e-logic-group-to-select-${ logicGroupDestination }`);
    }
});

When('I copy this logic group {string} to a new logic group {string}', async function (logicGroupSource, newLogicGroup) {
    await send.mouseOnById(`e2e-tree-renderer-edit-logic-group-${ logicGroupSource }`);
    await send.clickById(`e2e-tree-renderer-copy-box-button-${ logicGroupSource }`);
    await send.inputById('e2e-copy-to-new-logic-group-input', newLogicGroup);
    await send.clickById('e2e-copy-to-new-logic-group-button');
});

Then('the deployed module {string} of logic group {string} are successful copied to logic group {string}', /** @this CustomWorld */ async function (module, logicGroupSource, logicGroupDestination) {
    await assert.isPresentById(`e2e-tree-renderer-edit-module-button-${ logicGroupDestination }-${ module }-${ this.moduleBuilder.version }`);
});


Then('the deployed module {string} with version {string} is successful copied to logic group {string}', async function (module, version, logicGroupDestination) {
    await assert.isPresentById(`e2e-tree-renderer-edit-module-button-${ logicGroupDestination }-${ module }-${ version }`);
});
