const assert = require('../../helpers/assert');
const send = require('../../helpers/send');
const get = require('../../helpers/get');

const getPropertyId = function (propertyName) {
    return `simple-properties-list_key-property-input-${ propertyName }`;
};

const getPropertyInputId = function (propertyName) {
    return `e2e-simple-properties-list_value-property-input-${ propertyName }`;
};

When('I open the deployed module properties', /** @this CustomWorld */ async function () {
    const logicGroup = this.deployedModuleBuilder.modulePath.split('#')[2];
    await send.clickById(`e2e-tree-renderer-edit-module-button-${ logicGroup }-${ this.moduleBuilder.name }-${ this.moduleBuilder.version }`);
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
    await get.elementsByCss('.property-label').then(async function (propertyLabels) {
        for (const propertyLabel of propertyLabels) {
            assert.isPresentWithClass(propertyLabel.$('span'), 'property-required');
        }
    });
});

Then('the properties are displayed with dedicated icons', async function () {
    const defaultElement = await get.elementById(getPropertyId('default-property'));
    const passwordElement = await get.elementById(getPropertyId('password-property'));
    const patternElement = await get.elementById(getPropertyId('pattern-property'));
    const requiredElement = await get.elementById(getPropertyId('required-property'));
    const globalElement = await get.elementById(getPropertyId('global-property'));
    await assert.containsText(defaultElement, '🛡️');
    await assert.containsText(passwordElement, '🔒');
    await assert.containsText(patternElement, '(.*)');
    await assert.containsText(requiredElement, '*');
    await assert.containsText(globalElement, '🌍');
});

Then(/^the property "([^"]+)" is( not)? displayed$/, async function (propertyName, notDisplayed) {
    const propertyId = getPropertyId(propertyName);
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
    await assert.containsValue(get.elementById(getPropertyInputId(propertyName)), propertyValue);
});

Then('the tooltip of property {string} should contain', async function (propertyName, dataTable) {
    const propertyLabel = await get.elementByCss(`label#${ getPropertyId(propertyName) } i.e2e-property-tooltip`);
    for (const [ instanceName, instancePropertyValue ] of dataTable.raw()) {
        await assert.elementAttributeContainsText(propertyLabel, 'aria-label', `${ instanceName } = ${ instancePropertyValue }`);
    }
});

Then(/^the module property "([^"]*)" is( not)? marked as having the same value as the default value$/, async function (propertyName, isNotMarked) {
    const propertyElement = await get.elementById(getPropertyId(propertyName));
    const icon = '✔';
    if (isNotMarked) {
        await assert.doesNotContainText(propertyElement, icon);
    } else {
        await assert.containsText(propertyElement, icon);
        await assert.containsText(propertyElement, '🛡️');
    }
});

Then(/^the module property "([^"]*)" is( not)? marked as being overridden by a global with the same value$/, async function (propertyName, isNotMarked) {
    const propertyElement = await get.elementById(getPropertyId(propertyName));
    const icon = '✅';
    if (isNotMarked) {
        await assert.doesNotContainText(propertyElement, icon);
    } else {
        await assert.containsText(propertyElement, icon);
    }
});

Then('the input of the property {string} is disabled', async function (propertyName) {
    await assert.isDisplayedById(getPropertyInputId(propertyName));
});
