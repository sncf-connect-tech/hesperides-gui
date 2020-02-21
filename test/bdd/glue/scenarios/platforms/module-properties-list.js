const assert = require('../../helpers/assert');
const send = require('../../helpers/send');
const get = require('../../helpers/get');
var { Then } = require('cucumber');
var { When } = require('cucumber');

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

When(/^I enter "([^"]*-\{\{)" in the valuation field of the property "([^"]+)"$/, async function (inputValue, property) {
    const textAreaId = `e2e-simple-properties-list_value-property-input-${ property }`;
    await send.clickById(textAreaId);
    await send.inputById(textAreaId, inputValue);
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

Then(/^The autocompletion list suggestions is displayed$/, async function () {
    await assert.isPresentByCss('.e2e-autocomplete-list-suggestions');
    await send.clickByCss('.e2e-autocomplete-list-suggestions');
});

Then(/^the textarea of the property "([^"]+)" should contain "([^"]*-\{\{ [^"]* }})"$/, async function (property, inputText) {
    const textAreaId = `e2e-simple-properties-list_value-property-input-${ property }`;
    const textAreaElement = await get.elementById(textAreaId);
    await assert.containsValue(textAreaElement, inputText);
});
