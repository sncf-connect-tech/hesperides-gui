const api = require('../../helpers/api');
const assert = require('../../helpers/assert');
const get = require('../../helpers/get');
const navigate = require('../../helpers/navigate');
const send = require('../../helpers/send');

const checkboxSelector = '.PropertiesEvents__left-column-checkbox';
const diffButtonId = 'e2e-properties-events-diff-button';
const loadMoreEventsButtonId = 'e2e-properties-events-load-more-button';

When('I open the module properties events', /** @this CustomWorld */ async function () {
    const logicGroup = this.deployedModuleBuilder.modulePath.split('#')[2];
    await send.mouseOnById(`e2e-tree-renderer-edit-module-button-${ logicGroup }-${ this.moduleBuilder.name }-${ this.moduleBuilder.version }`);
    await send.clickById('e2e-properties-events-open-modal-button');
});

When('I open the global properties events', /** @this CustomWorld */ async function () {
    await send.clickById('e2e-global-properties-events-open-modal-button');
});

When('I click on the properties events first panel title', async function () {
    const panels = get.elementsByCss('.PropertiesEvents__properties-panel-title');
    await panels.get(0).click();
    await browser.waitForAngular();
});

When('I search for {string} in the properties events', async function (inputValue) {
    await send.inputById('e2e-properties-events-search-input', inputValue);
});

When(/^I click on the switch to (?:expand|collapse) all properties events$/, async function () {
    await send.clickById('e2e-properties-events-expand-switch');
});

When('I click on the button to load more properties events', async function () {
    await send.clickById(loadMoreEventsButtonId);
});

When('I click on cross to close the properties events modal', async function () {
    await send.clickById('e2e-properties-events-close-cross');
});

When('I click on bottom right corner button to close the properties events modal', async function () {
    await send.clickById('e2e-properties-events-close-button');
});

When('I check the properties event at index {int}', async function (checkboxIndex) {
    await get.elementsByCss(checkboxSelector).get(checkboxIndex).click();
    await browser.waitForAngular();
});

When('I click on the button to launch the properties events diff', async function () {
    await send.clickById(diffButtonId);
});

When('I click on the switch to display only my properties events', async function () {
    await send.clickById('e2e-properties-events-my-events-switch');
});

Then('the properties events modal title contains {string}', async function (text) {
    const titleElement = get.elementById('e2e-properties-events-modal-title');
    await assert.containsText(titleElement, text);
});

Then(/^the properties events modal contains (\d+) events?$/, async function (eventsCount) {
    const events = get.elementsByCss('.PropertiesEvents__properties-panel-header');
    await assert.elementsCount(events, eventsCount);
});

Then(/^the properties events first panel has the following (added|updated|removed) properties$/, async function (propertiesType, dataTable) {
    const selector = `#e2e-properties-events-${ propertiesType }-properties .PropertiesEvents__col-tab-properties-datas`;
    for (const [ name, value, optionalNewValue ] of dataTable.raw()) {
        await assert.equalsText(get.elementsByCss(selector).get(0), name);
        await assert.equalsText(get.elementsByCss(selector).get(1), value);
        if (optionalNewValue) {
            await assert.equalsText(get.elementsByCss(selector).get(2), optionalNewValue);
        }
    }
});

Then(/^the properties events are (expanded|collapsed)$/, async function (actionType) {
    const panelsContent = get.elementsByCss('.PropertiesEvents__properties-panel-content');
    if (actionType === 'expanded') {
        await assert.elementsExist(panelsContent);
    } else {
        await assert.elementsDoNotExist(panelsContent);
    }
});

Then(/^the button to load more properties events is (enabled|disabled)$/, async function (buttonState) {
    if (buttonState === 'enabled') {
        await assert.isEnabledById(loadMoreEventsButtonId);
    } else {
        await assert.isDisabledById(loadMoreEventsButtonId);
    }
});

Then(/^the properties events modal( doesn't)? contains? the message that says there are no more events$/, async function (doesntContain) {
    const elements = get.elementsByCss('#e2e-properties-events-no-more-events');
    if (doesntContain) {
        await assert.elementsDoNotExist(elements);
    } else {
        await assert.elementsExist(elements);
    }
});

Then('the properties events modal contains the message that says there are no events to display', async function () {
    const elements = get.elementsByCss('#e2e-properties-events-no-events');
    await assert.elementsExist(elements);
});

Then('the properties events modal is closed', async function () {
    const elements = get.elementsByCss('#e2e-properties-events-modal');
    await assert.elementsDoNotExist(elements);
});

Then(/^the button to launch the diff from properties events is (enabled|disabled)$/, async function (buttonState) {
    if (buttonState === 'enabled') {
        await assert.isEnabledById(diffButtonId);
    } else {
        await assert.isDisabledById(diffButtonId);
    }
});

const validateCheckboxState = async function (checkbox, state) {
    if (state === 'enabled') {
        await assert.isNotDisabled(checkbox);
    } else {
        await assert.isDisabled(checkbox);
    }
};

Then(/^all the properties events checkboxes are (enabled|disabled)$/, async function (checkboxState) {
    const checkboxes = get.elementsByCss(checkboxSelector);
    await checkboxes.each(async function (checkbox) {
        await validateCheckboxState(checkbox, checkboxState);
    });
});

Then(/^properties event checkbox at index (\d+) is (enabled|disabled)$/, async function (checkboxIndex, checkboxState) {
    const checkbox = get.elementsByCss(checkboxSelector).get(checkboxIndex);
    await validateCheckboxState(checkbox, checkboxState);
});

Then('I get a new page with the module properties diff with event timestamps at index {int} and {int}',
    /** @this CustomWorld */ async function (firstIndex, secondIndex) {
        const platformBuilder = this.platformBuilder;
        const propertiesPath = this.deployedModuleBuilder.buildPropertiesPath();
        const checkboxes = get.elementsByCss(checkboxSelector);
        await checkboxes.get(firstIndex).getAttribute('data-timestamp').then(async function (firstTimestamp) {
            await checkboxes.get(secondIndex).getAttribute('data-timestamp').then(async function (secondTimestamp) {
                await navigate.toNewTab();
                const expectedUrl = api.buildDiffUrl(
                    platformBuilder,
                    platformBuilder,
                    propertiesPath,
                    propertiesPath,
                    null,
                    firstTimestamp,
                    secondTimestamp);
                await assert.currentUrlEquals(expectedUrl);
                await navigate.backToFirstTab();
            });
        });
    });

Then('the first properties event title contains {string}', async function (title) {
    const eventTitle = get.elementsByCss('.PropertiesEvents__properties-panel-title').get(0);
    await assert.containsText(eventTitle, title);
});
