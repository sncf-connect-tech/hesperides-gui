const assert = require('../../helpers/assert');
const get = require('../../helpers/get');
const send = require('../../helpers/send');

When('I click on the button to copy the logical group {string}', async function (logicalGroupName) {
    await send.mouseOnById(`e2e-tree-renderer-edit-logic-group-${ logicalGroupName }`);
    await send.clickById(`e2e-tree-renderer-copy-box-button-${ logicalGroupName }`);
});

When('I input the new logical group {string}', async function (newLogicalGroup) {
    await send.inputById('e2e-copy-to-new-logic-group-input', newLogicalGroup);
});

When('I chose the option to select an existing logical group', async function () {
    await send.clickById('e2e-copy-logical-group-to-existing-one-option');
});

When('I select the existing logical group {string}', async function (logicalGroupName) {
    await send.mouseOnById(`e2e-logic-group-to-select-${ logicalGroupName }`);
    await send.clickById(`e2e-logic-group-to-select-${ logicalGroupName }`);
});

When(/^I click on the button to save the copy of this logical group( and accept the alert)?$/, async function (acceptAlert) {
    if (acceptAlert) {
        await send.clickByIdAndAcceptAlert('e2e-copy-logical-group-save-button');
    } else {
        await send.clickById('e2e-copy-logical-group-save-button');
    }
});

When('I click on the button to close the modal to copy a logical group', async function () {
    await send.clickById('e2e-copy-logical-group-close-button');
});

Then('the option to copy the logical group to a new one is selected', async function () {
    await assert.isSelectedOptionById('e2e-copy-logical-group-to-new-one-option');
});

Then('I can see the copy summary {string}', async function (copySummary) {
    const elem = get.elementById('e2e-copy-logical-group-summary');
    await assert.containsText(elem, copySummary);
});

Then(/^the deployed module "([^"]*)"(?: with version "([^"]*)")? is successfully copied to logical group "([^"]*)"$/,
    /** @this CustomWorld */ async function (moduleName, moduleVersion, logicalGroupName) {
        moduleVersion = moduleVersion || this.moduleBuilder.version;
        await assert.isPresentById(`e2e-tree-renderer-edit-module-button-${ logicalGroupName }-${ moduleName }-${ moduleVersion }`);
    });

Then('the logical group copy modal is still open', async function () {
    await assert.isPresentById('e2e-copy-logical-group-modal');
});

Then(/^the logical group copy modal is( not)? closed$/, async function (isNotClosed) {
    const modalId = 'e2e-copy-logical-group-modal';
    if (isNotClosed) {
        await assert.isPresentById(modalId);
    } else {
        await assert.isNotPresentById(modalId);
    }
});
//
// When(/^I copy this logic group "([^"]*)" to the existing logic group "([^"]*)"( with the same module name)?$/, async function (logicGroupSource, logicGroupDestination, withTheSameModuleName) {
//     await send.mouseOnById(`e2e-tree-renderer-edit-logic-group-${ logicGroupSource }`);
//     await send.clickById(`e2e-tree-renderer-copy-box-button-${ logicGroupSource }`);
//     await send.clickById('e2e-copy-logical-group-to-existing-one-option');
//     await send.mouseOnById(`e2e-logic-group-to-select-${ logicGroupDestination }`);
//     await send.clickById(`e2e-logic-group-to-select-${ logicGroupDestination }`);
//     if (withTheSameModuleName) {
//         await send.clickByIdAndAcceptAlert('e2e-saveButton');
//     } else {
//         await send.clickById('e2e-saveButton');
//     }
// });
//
// When('I copy this logic group {string} to a new logic group {string}', async function (logicGroupSource, newLogicGroup) {
//     await send.mouseOnById(`e2e-tree-renderer-edit-logic-group-${ logicGroupSource }`);
//     await send.clickById(`e2e-tree-renderer-copy-box-button-${ logicGroupSource }`);
//     await send.clickById('e2e-copy-logical-group-to-new-one-option');
//     await send.inputById('e2e-copy-to-new-logic-group-input', newLogicGroup);
//     await send.clickById('e2e-saveButton');
// });
//
// Then('the deployed module {string} of logic group {string} are successful copied to logic group {string}', /** @this CustomWorld */ async function (module, logicGroupSource, logicGroupDestination) {
//     await assert.isPresentById(`e2e-tree-renderer-edit-module-button-${ logicGroupDestination }-${ module }-${ this.moduleBuilder.version }`);
// });
//
// Then('the deployed module {string} with version {string} is successful copied to logic group {string}', async function (module, version, logicGroupDestination) {
//     await assert.isPresentById(`e2e-tree-renderer-edit-module-button-${ logicGroupDestination }-${ module }-${ version }`);
// });
