const assert = require('../../helpers/assert');
const send = require('../../helpers/send');

const addLogicGroupToPlatform = async function (deployedModuleBuilder) {
    await send.clickById('e2e-tree-properties-add-first-box-dialog-button');
    await send.inputById('e2e-add-box-new-logic-group-name', deployedModuleBuilder.logicGroup);
    await send.clickById('e2e-add-box-create-logic-group-button');
};

When('I add a logic group to this platform', /** @this CustomWorld */ async function () {
    await addLogicGroupToPlatform(this.deployedModuleBuilder);
});

When('I add several logic groups at once to this platform', /** @this CustomWorld */ async function () {
    this.deployedModuleBuilder.withLogicGroup('ABC#DEF#GHI');
    await addLogicGroupToPlatform(this.deployedModuleBuilder);
});

When('I add a logic group to this logic group', /** @this CustomWorld */ async function () {
    await send.mouseOnById('e2e-tree-renderer-edit-logic-group-ABC');
    await send.clickById(`e2e-tree-renderer-add-logic-group-button-${ this.deployedModuleBuilder.logicGroup }`);
    this.deployedModuleBuilder.withLogicGroup('DEF');
    await send.inputById('e2e-add-box-new-logic-group-name', this.deployedModuleBuilder.logicGroup);
    await send.clickById('e2e-add-box-create-logic-group-button');
});

Then('the logic group is successfully added', /** @this CustomWorld */ async function () {
    await assert.isPresentById(`e2e-tree-renderer-edit-logic-group-${ this.deployedModuleBuilder.logicGroup }`);
});

Then('the logic groups are successfully added', /** @this CustomWorld */ async function () {
    const logicGroups = this.deployedModuleBuilder.logicGroup.split('#');
    for (const logicGroup of logicGroups) {
        await assert.isPresentById(`e2e-tree-renderer-edit-logic-group-${ logicGroup }`);
    }
});
