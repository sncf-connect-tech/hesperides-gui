const send = require('../../helpers/send');
const get = require('../../helpers/get');

When('I click on the button to edit global properties', async function () {
    await send.clickById('e2e-tree-properties-display-global-properties-button');
});

When('I enter the following global properties', async function (dataTable) {
    for (const [ name, value ] of dataTable.raw()) {
        await send.inputById('new_kv_name', name);
        await send.inputById('new_kv_value', value);
    }
});

When('I save the global properties', async function () {
    await send.clickById('e2e-tree-properties-save-global-properties-button');
    await send.inputById('e2e-save-properties-modal_input-comment-autocomplete', get.getUniqueComment());
    await send.clickById('e2e-save-properties-modal_save-comment-button');
});
