const assert = require('../../helpers/assert');
const send = require('../../helpers/send');

When('I add the existing module to this logic group', /** @this CustomWorld */ async function () {
    await send.mouseOnById('e2e-tree-renderer-edit-logic-group-ABC');
    await send.clickById(`e2e-tree-renderer-add-module-button-${ this.deployedModuleBuilder.logicGroup }`);
    await send.searchAndSelectFirstByCss('md-autocomplete input#e2e-search-module-input-module-autocomplete', this.moduleBuilder.name);
    await send.clickById('e2e-search-module-add-module-button');
});

Then('the module is successfully added to the logic group', /** @this CustomWorld */ async function () {
    await assert.isPresentById(`e2e-tree-renderer-edit-module-button-${ this.moduleBuilder.name }`);
});
