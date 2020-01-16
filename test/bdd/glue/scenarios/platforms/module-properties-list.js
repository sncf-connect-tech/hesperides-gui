const assert = require('../../helpers/assert');
const send = require('../../helpers/send');
const get = require('../../helpers/get');


When('I open the deployed module properties', /** @this CustomWorld */ async function () {
    await send.clickById(`e2e-tree-renderer-edit-module-button-${ this.moduleBuilder.name }`);
});

When('I click on the switch to display nothing but the required properties', async function () {
    await send.clickById('e2e-properties-required-only-switch-button');
});

Then('only the required properties are displayed', async function () {
    await get.elementsByCss('textarea.property-value').then(assert.itemsAreRequired);
});

Then('the required property is properly displayed', async function () {
    await assert.isPresentById('simple-properties-list_key-property-input-required-property');
});

Then('the property {string} contains the value {string}', async function (propertyName, propertyValue) {
    const moduleProperty = get.elementById(`e2e-simple-properties-list_value-property-input-${propertyName}`);
    await assert.containsValue(moduleProperty, propertyValue);
});

Then(/^the property "([^"]*)" value is( not)? crossed$/, async function(propertyName, notCrossed) {
    const moduleProperty = get.elementById(`e2e-simple-properties-list_value-property-input-${propertyName}`);
    if (notCrossed) {
        await assert.doesntContainCssClass(moduleProperty, 'differed-value-from-global');
    } else {
        await assert.containsCssClass(moduleProperty, 'differed-value-from-global');
    }
});
