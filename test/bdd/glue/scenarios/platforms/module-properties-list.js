const assert = require('../../helpers/assert');
const send = require('../../helpers/send');
const get = require('../../helpers/get');

When('I open the deployed module properties', /** @this CustomWorld */ async function () {
    await send.clickById(`e2e-tree-renderer-edit-module-button-${ this.moduleBuilder.name }`);
});

When('I click on the switch to display nothing but the required properties', async function () {
    await send.clickById('e2e-properties-required-only-switch-button');
});

When('I display the deleted properties', async function () {
    await send.clickById('toggle-deleted-properties_switch');
});

When('I click on the switch to display also the global properties', async function () {
    await send.clickById('toggle-global-properties_switch');
});

Then('only the required properties are displayed', async function () {
    await get.elementsByCss('textarea.property-value').then(assert.itemsAreRequired);
});

Then('the properties are displayed with dedicated icons', async function () {
    const defaultElement = await get.elementById('simple-properties-list_key-property-input-default-property');
    const passwordElement = await get.elementById('simple-properties-list_key-property-input-password-property');
    const patternElement = await get.elementById('simple-properties-list_key-property-input-pattern-property');
    const requiredElement = await get.elementById('simple-properties-list_key-property-input-required-property');
    const globalElement = await get.elementById('simple-properties-list_key-property-input-global-property');
    await assert.containsText(defaultElement, '🛡️');
    await assert.containsText(passwordElement, '🔒');
    await assert.containsText(patternElement, '(.*)');
    await assert.containsText(requiredElement, '*');
    await assert.containsText(globalElement, '🌍');
});

Then(/the property "([^"]+)" is( not)? displayed/, async function (propertyName, notDisplayed) {
    const propertyId = `simple-properties-list_key-property-input-${ propertyName }`;
    if (notDisplayed) {
        await assert.isNotPresentById(propertyId);
    } else {
        await assert.isPresentById(propertyId);
    }
});
