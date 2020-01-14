const assert = require('../../helpers/assert');
const send = require('../../helpers/send');
const get = require('../../helpers/get');

// Const Selectors
const propertyValueSelector = 'textarea.property-value';
const propertyCrossedValueSelector = 'textarea.property-value.differed-value-from-global';


When('I open the deployed module properties', /** @this CustomWorld */ async function () {
    await send.clickById(`e2e-tree-renderer-edit-module-button-${ this.moduleBuilder.name }`);
});

When('I click on the switch to display nothing but the required properties', async function () {
    await send.clickById('e2e-properties-required-only-switch-button');
});

Then('only the required properties are displayed', async function () {
    await get.elementsByCss(propertyValueSelector).then(assert.itemsAreRequired);
});

Then('the required property is properly displayed', async function () {
    await assert.isPresentById('simple-properties-list_key-property-input-required-property');
});

Then('the property {string} contain value {string}', async function (propertyName, propertyValue) {
    const moduleProperty = get.elementById(`e2e-simple-properties-list_value-property-input-${propertyName}`);
    await assert.containsValue(moduleProperty, propertyValue);
});

Then(/^the property "([^"]*)" is(?: "([^"]*)")? crossed$/, async function(propertyName, crossNegation) {
    await assert.isDisplayedById(`e2e-simple-properties-list_value-property-input-${propertyName}`);
    crossNegation ?
        await assert.isNotPresentByCss(propertyCrossedValueSelector) : await assert.isPresentByCss(propertyCrossedValueSelector);
});
