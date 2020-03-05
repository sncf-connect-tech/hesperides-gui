const assert = require('../../helpers/assert');
const get = require('../../helpers/get');
const send = require('../../helpers/send');

When('I open the left properties panel', async function () {
    await send.clickById('e2e-diff-onlyleft-toggle-button');
});

When('I open the differing properties panel', async function () {
    await send.clickById('e2e-diff-differing-toggle-button');
});

When('I open the common properties panel', async function () {
    await send.clickById('e2e-diff-common-toggle-button');
});

When('I open the right properties panel', async function () {
    await send.clickById('e2e-diff-onlyright-toggle-button');
});

When('I disable differing characters highlight', async function () {
    await send.clickById('e2e-highlight-differing-characters-button');
});

Then('I get the following properties only on the left platform', async function (dataTable) {
    for (const [ name, value ] of dataTable.raw()) {
        await assert.containsText(get.elementByCss(`#e2e-diff-onlyleft-property-${ name } .diff-property-name`), name);
        await assert.containsText(get.elementByCss(`#e2e-diff-onlyleft-property-${ name } .diff-property-final-value`), value);
    }
});

Then('I get the following common properties', async function (dataTable) {
    for (const [ name, value ] of dataTable.raw()) {
        await assert.containsText(get.elementByCss(`#e2e-diff-common-property-${ name } .diff-property-name`), name);
        await assert.containsText(get.elementByCss(`#e2e-diff-common-property-${ name } .diff-property-final-value-left`), value);
        await assert.containsText(get.elementByCss(`#e2e-diff-common-property-${ name } .diff-property-final-value-right`), value);
    }
});

Then('I get the following differing properties', async function (dataTable) {
    for (const [ name, leftValue, rightValue ] of dataTable.raw()) {
        await assert.containsText(get.elementByCss(`#e2e-diff-differing-property-${ name } .diff-property-name`), name);
        await assert.containsText(get.elementByCss(`#e2e-diff-differing-property-${ name } .diff-property-final-value-left`), leftValue);
        await assert.containsText(get.elementByCss(`#e2e-diff-differing-property-${ name } .diff-property-final-value-right`), rightValue);
    }
});

Then('I get the following properties only on the right platform', async function (dataTable) {
    for (const [ name, value ] of dataTable.raw()) {
        await assert.containsText(get.elementByCss(`#e2e-diff-onlyright-property-${ name } .diff-property-name`), name);
        await assert.containsText(get.elementByCss(`#e2e-diff-onlyright-property-${ name } .diff-property-final-value`), value);
    }
});

Then(/^the property "([^"]*)" value has "([^"]*)" highlighted on the (left|right)?$/, async function (propertyName, highlightedPart, side) {
    const elem = get.elementByCss(`#e2e-diff-differing-properties-${ side }-${ propertyName } .diff-property-final-value-${ side } .diff-char-highlight-${ side }`);
    await assert.equalsText(elem, highlightedPart);
});

Then('the property {string} has no highlighted characters', async function (propertyName) {
    await assert.isNotPresentByCss(`#e2e-diff-differing-properties-left-${ propertyName } .diff-property-final-value-left .diff-char-highlight-left`);
    await assert.isNotPresentByCss(`#e2e-diff-differing-properties-right-${ propertyName } .diff-property-final-value-right .diff-char-highlight-right`);
});

Then(/^the property "([^"]+)" is( not)? displayed in the common properties panel$/, async function (propertyName, notDisplayed) {
    const propertyId = `e2e-diff-common-property-${ propertyName }`;
    if (notDisplayed) {
        await assert.isDisplayedById('e2e-diff-common-properties');
        await assert.isNotPresentById(propertyId);
    } else {
        await assert.isDisplayedById(propertyId);
    }
});
