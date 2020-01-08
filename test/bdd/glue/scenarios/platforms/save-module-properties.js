const assert = require('../../helpers/assert');
const get = require('../../helpers/get');
const send = require('../../helpers/send');

When('I enter the following module properties', async function (dataTable) {
    for (const [ name, value ] of dataTable.raw()) {
        await send.inputById(`e2e-simple-properties-list_value-property-input-${ name }`, value);
    }
});

When('I save the module properties', async function () {
    await send.clickById('e2e-tree-properties-save-module-properties-button');
    await send.inputById('e2e-save-properties-modal_input-comment-autocomplete', get.getUniqueComment());
    await send.clickById('e2e-save-properties-modal_save-comment-button');
});

Then('the save button is disabled', async function () {
    await assert.isDisabledById('e2e-tree-properties-save-module-properties-button');
});
