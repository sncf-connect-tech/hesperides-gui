const assert = require('../../helpers/assert');
const send = require('../../helpers/send');
const get = require('../../helpers/get');

When('I open the deployed module properties', /** @this CustomWorld */ async function () {
    await send.clickById(`e2e-tree-renderer-edit-module-button-${ this.moduleBuilder.name }`);
});

When('I click on the switch to display nothing but the required properties', async function () {
    await send.clickById('e2e-properties-required-only-switch-button');
});

When('I click on the switch to also display the deleted properties', async function () {
    await send.clickById('toggle-deleted-properties_switch');
});

When('I click on the switch to display only the global properties', async function () {
    await send.clickById('toggle-global-properties_switch');
});

When('I click on the switch to hide the global properties', async function () {
    await send.clickById('e2e-hide-global-properties-switch-button');
});

When('I select the first suggested global property', async function () {
    await send.clickByCss('.e2e-autocomplete-list-suggestions');
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

Then(/^the property "([^"]+)" is( not)? displayed$/, async function (propertyName, notDisplayed) {
    const propertyId = `simple-properties-list_key-property-input-${ propertyName }`;
    if (notDisplayed) {
        await assert.isNotPresentById(propertyId);
    } else {
        await assert.isPresentById(propertyId);
    }
});

Then(/^the global properties suggestion list is( not)? displayed$/, async function (notDisplayed) {
    if (notDisplayed) {
        await assert.isNotPresentByCss('.e2e-autocomplete-list-suggestions');
    } else {
        await assert.isPresentByCss('.e2e-autocomplete-list-suggestions');
    }
});

Then('the property {string} should have the value {string}', async function (propertyName, propertyValue) {
    await assert.containsValue(get.elementById(`e2e-simple-properties-list_value-property-input-${ propertyName }`), propertyValue);
});

Then('the tooltip of property {string} should contain', async function (propertyName, dataTable) {
    const propertyLabel = await get.elementByCss(`label#simple-properties-list_key-property-input-${ propertyName } i.e2e-property-tooltip`);
    for (const [ instanceName, instancePropertyValue ] of dataTable.raw()) {
        await assert.elementAttributeContainsText(propertyLabel, 'aria-label', `${ instanceName } = ${ instancePropertyValue }`);
    }
});

Then('only the property {string} and not {string} has dedicated icon check mark button', async function (firstGlobalProperty, secondGlobalProperty) {
    const firstGlobalPropertyElement = await get.elementById(`simple-properties-list_key-property-input-${ firstGlobalProperty }`);
    const secondGlobalPropertyElement = await get.elementById(`simple-properties-list_key-property-input-${ secondGlobalProperty }`);
    await assert.containsText(firstGlobalPropertyElement, '🌍');
    await assert.containsText(secondGlobalPropertyElement, '🌍');
    await assert.containsText(firstGlobalPropertyElement, '✅');
    await assert.doesNotContainText(secondGlobalPropertyElement, '✅');
});

Then('the value of property {string} is not marked as being the same as the default value', async function (property) {
    const propertyElement = await get.elementById(`simple-properties-list_key-property-input-${ property }`);
    await assert.doesNotContainText(propertyElement, '✔');
});

Then('the value of property {string} is marked as being the same as the default value', async function (property) {
    const propertyElement = await get.elementById(`simple-properties-list_key-property-input-${ property }`);
    await assert.containsText(propertyElement, '✔');
    await assert.containsText(propertyElement, '🛡️');
});
