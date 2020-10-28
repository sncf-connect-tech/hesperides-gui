const assert = require('../../helpers/assert');
const get = require('../../helpers/get');
const send = require('../../helpers/send');

const sendPropertyValue = async function (propertyName, propertyValue) {
    await send.inputById(`e2e-simple-properties-list_value-property-input-${ propertyName }`, propertyValue);
};

When('I enter the following module properties', async function (dataTable) {
    for (const [ name, value ] of dataTable.raw()) {
        await sendPropertyValue(name, value);
    }
});

When('I type the value {string} for the property {string}', async function (propertyValue, propertyName) {
    await sendPropertyValue(propertyName, propertyValue);
});

When('I save the module properties', async function () {
    await send.clickById('e2e-tree-properties-save-module-properties-button');
    await send.inputById('e2e-save-properties-modal_input-comment-autocomplete', get.uniqueComment());
    await send.clickById('e2e-save-properties-modal_save-comment-button');
});

Then('the save button is enabled', async function () {
    await assert.isEnabledById('e2e-tree-properties-save-module-properties-button');
});

Then('the save button is disabled', async function () {
    await assert.isDisabledById('e2e-tree-properties-save-module-properties-button');
});
