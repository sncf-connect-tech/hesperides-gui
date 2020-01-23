const api = require('../../helpers/api');
const assert = require('../../helpers/assert');
const get = require('../../helpers/get');
const navigate = require('../../helpers/navigate');
const send = require('../../helpers/send');
const moment = require('moment');

let selectedTimestamp = null;
const globalPropertiesPath = '#';
const toggleDifferingPropertiesButtonId = 'e2e-diff-differing-toggle-button';

When('I open the modal to compare global properties', async function () {
    selectedTimestamp = null;
    await send.clickById('e2e-tree-properties-display-global-properties-diff-button');
});

When(/^I select the platform to compare(?: "([^"]*)")$/, async function (platformName) {
    await send.clickById(`e2e-platform-to-compare-button-${ platformName }`);
});

When('I launch the diff of global properties', async function () {
    await send.clickById('e2e-global-properties-diff-runcomparison-button');
});

When('I select the global properties stored values comparison option', async function () {
    await send.clickById('e2e-global-properties-diff-option-stored');
});

When('I select a specific date to compare global properties', async function () {
    await send.clickById('e2e-global-properties-diff-select-date-switch');
    // Vérifie que le calendrier s'affiche automatiquement
    await assert.isPresentByCss('.angularjs-datetime-picker');
    // Sélectionne une date un mois plus tôt
    await send.clickByCss('.adp-prev');
    await send.clickByCssContainingText('.adp-day.selectable', '12');
    // Vérifie que le calendrier se ferme automatiquement
    await assert.isNotPresentByCss('.angularjs-datetime-picker');
    // Récupère la date sélectionnée
    // eslint-disable-next-line no-return-assign
    await get.elementById('look-past-date-time').getAttribute('value').then(function (selectedDate) {
        selectedTimestamp = Number(moment(selectedDate, 'YYYY-MM-DD HH:mm:ss Z'));
    });
});

When('I open the diff of global properties', /** @this CustomWorld */ async function () {
    const fromPlatformBuilder = this.platformHistory.platformBuilders[0];
    const toPlatformBuilder = this.platformHistory.platformBuilders[1];
    await browser.get(api.buildDiffUrl(fromPlatformBuilder, toPlatformBuilder, globalPropertiesPath, globalPropertiesPath));
    await browser.waitForAngular();
});

When('I open the differing properties panel', async function () {
    await send.clickById(toggleDifferingPropertiesButtonId);
});

When('I disable differing characters highlight', async function () {
    await send.clickById('e2e-highlight-differing-characters-button');
});

Then(/^I get a new page with the global properties( stored values)? diff$/, /** @this CustomWorld */ async function (storedValues) {
    await navigate.toNewTab();
    const fromPlatformBuilder = this.platformHistory.platformBuilders[0];
    const toPlatformBuilder = this.platformHistory.platformBuilders[1];
    const expectedUrl = api.buildDiffUrl(fromPlatformBuilder, toPlatformBuilder, globalPropertiesPath, globalPropertiesPath, storedValues);
    await assert.currentUrlEquals(expectedUrl);
    await navigate.backToFirstTab();
});

Then('I get a new page with the global properties diff with timestamp', /** @this CustomWorld */ async function () {
    await navigate.toNewTab();
    const expectedUrl = api.buildDiffUrl(this.platformBuilder, this.platformBuilder, globalPropertiesPath, globalPropertiesPath, false, selectedTimestamp);
    await assert.currentUrlEquals(expectedUrl);
    await navigate.backToFirstTab();
});

Then('I get the following properties only on left platform', async function (dataTable) {
    const toggleButtonId = 'e2e-diff-onlyleft-toggle-button';
    await send.clickById(toggleButtonId);
    let index = 0;
    for (const [ name, value ] of dataTable.raw()) {
        await assert.elementAtIndexContainsTextByCss('#e2e-diff-onlyleft-properties .diff-property-name', index, name);
        await assert.elementAtIndexContainsTextByCss('#e2e-diff-onlyleft-properties .diff-property-final-value', index, value);
        index++;
    }
    await send.clickById(toggleButtonId);
});

Then('I get the following common properties', async function (dataTable) {
    const toggleButtonId = 'e2e-diff-common-toggle-button';
    await send.clickById(toggleButtonId);
    let index = 0;
    for (const [ name, value ] of dataTable.raw()) {
        await assert.elementAtIndexContainsTextByCss('#e2e-diff-common-properties .diff-property-name', index, name);
        await assert.elementAtIndexContainsTextByCss('#e2e-diff-common-properties .diff-property-final-value-left', index, value);
        await assert.elementAtIndexContainsTextByCss('#e2e-diff-common-properties .diff-property-final-value-right', index, value);
        index++;
    }
    await send.clickById(toggleButtonId);
});

Then('I get the following differing properties', async function (dataTable) {
    await send.clickById(toggleDifferingPropertiesButtonId);
    let index = 0;
    for (const [ name, leftValue, rightValue ] of dataTable.raw()) {
        await assert.elementAtIndexContainsTextByCss('#e2e-diff-differing-properties .diff-property-name', index, name);
        await assert.elementAtIndexContainsTextByCss('#e2e-diff-differing-properties .diff-property-final-value-left', index, leftValue);
        await assert.elementAtIndexContainsTextByCss('#e2e-diff-differing-properties .diff-property-final-value-right', index, rightValue);
        index++;
    }
    await send.clickById(toggleDifferingPropertiesButtonId);
});

Then('I get the following properties only on right platform', async function (dataTable) {
    const toggleButtonId = 'e2e-diff-onlyright-toggle-button';
    await send.clickById(toggleButtonId);
    let index = 0;
    for (const [ name, value ] of dataTable.raw()) {
        await assert.elementAtIndexContainsTextByCss('#e2e-diff-onlyright-properties .diff-property-name', index, name);
        await assert.elementAtIndexContainsTextByCss('#e2e-diff-onlyright-properties .diff-property-final-value', index, value);
        index++;
    }
    await send.clickById(toggleButtonId);
});

Then(/^the property "([^"]*)" value has "([^"]*)" highlighted on the (left|right)?$/, async function (propertyName, highlightedPart, side) {
    const elem = get.elementByCss(`#e2e-diff-differing-properties-${ side }-${ propertyName } .diff-property-final-value-${ side } .diff-char-highlight-${ side }`);
    await assert.equalsText(elem, highlightedPart);
});

Then(/^the property "([^"]*)" has no highlighted characters$/, async function (propertyName) {
    await assert.isNotPresentByCss(`#e2e-diff-differing-properties-left-${ propertyName } .diff-property-final-value-left .diff-char-highlight-left`);
    await assert.isNotPresentByCss(`#e2e-diff-differing-properties-right-${ propertyName } .diff-property-final-value-right .diff-char-highlight-right`);
});
