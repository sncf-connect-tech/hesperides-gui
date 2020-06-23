const api = require('../../helpers/api');
const assert = require('../../helpers/assert');
const get = require('../../helpers/get');
const navigate = require('../../helpers/navigate');
const send = require('../../helpers/send');

const checkboxSelector = '.PlatformEvents__left-column-checkbox';
const diffButtonId = 'e2e-platform-events-diff-button';
const loadMoreEventsButtonId = 'e2e-platform-events-load-more-button';

When('I open the platform events modal', async function () {
    await send.clickById('e2e-platform-events-open-modal-button');
});

When(/^I click on the switch to (?:expand|collapse) all platform events$/, async function () {
    await send.clickById('e2e-platform-events-expand-switch');
});

When('I search for {string} in the platform events', async function (inputValue) {
    await send.inputById('e2e-platform-events-search-input', inputValue);
});

When('I click on the platform events first panel title', async function () {
    const panels = get.elementsByCss('.PlatformEvents__platform-panel-title');
    await panels.get(0).click();
    await browser.waitForAngular();
});

When('I click on the button to load more platform events', async function () {
    await send.clickById(loadMoreEventsButtonId);
});

When('I click on cross to close the platform events modal', async function () {
    await send.clickById('e2e-platform-events-close-cross');
});

When('I click on bottom right corner button to close the platform events modal', async function () {
    await send.clickById('e2e-platform-events-close-button');
});

When('I check the platform event at index {int}', async function (checkboxIndex) {
    await get.elementsByCss(checkboxSelector).get(checkboxIndex).click();
    await browser.waitForAngular();
});

When('I click on the button to launch the platform events diff', async function () {
    await send.clickById(diffButtonId);
});

When('I click on the switch to display only my platform events', async function () {
    await send.clickById('e2e-platform-events-my-events-switch');
});

Then('the platform events modal title is {string}', async function (expectedTitle) {
    const modalTitle = get.elementById('e2e-platform-events-modal-title');
    await assert.equalsText(modalTitle, expectedTitle);
});

Then(/^the platform events modal contains (\d+) events?$/, async function (eventsCount) {
    const events = get.elementsByCss('.PlatformEvents__platform-panel-header');
    await assert.elementsCount(events, eventsCount);
});

Then('the changes of the platform event at index {int} contain {string}', async function (eventIndex, changeText) {
    const changes = get.elementsByCss('.PlatformEvents__platform-events-list').get(eventIndex);
    await assert.containsText(changes, changeText);
});

Then(/^the platform events are (expanded|collapsed)$/, async function (actionType) {
    const panelContent = get.elementsByCss('.PlatformEvents__platform-panel-content');
    if (actionType === 'expanded') {
        await assert.elementsExist(panelContent);
    } else {
        await assert.elementsDoNotExist(panelContent);
    }
});

Then(/^the button to load more platform events is (enabled|disabled)$/, async function (buttonState) {
    if (buttonState === 'enabled') {
        await assert.isEnabledById(loadMoreEventsButtonId);
    } else {
        await assert.isDisabledById(loadMoreEventsButtonId);
    }
});

Then(/^the platform events modal( doesn't)? contains? the message that says there are no more events$/, async function (doesntContain) {
    const elements = get.elementsByCss('#e2e-platform-events-no-more-events');
    if (doesntContain) {
        await assert.elementsDoNotExist(elements);
    } else {
        await assert.elementsExist(elements);
    }
});

Then('the platform events modal is closed', async function () {
    const elements = get.elementsByCss('#e2e-platform-events-modal');
    await assert.elementsDoNotExist(elements);
});

Then(/^the button to launch the diff from platform events is (enabled|disabled)$/, async function (buttonState) {
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

Then(/^all the platform events checkboxes are (enabled|disabled)$/, async function (checkboxState) {
    const checkboxes = get.elementsByCss(checkboxSelector);
    await checkboxes.each(async function (checkbox) {
        await validateCheckboxState(checkbox, checkboxState);
    });
});

Then(/^platform event checkbox at index (\d+) is (enabled|disabled)$/, async function (checkboxIndex, checkboxState) {
    const checkbox = get.elementsByCss(checkboxSelector).get(checkboxIndex);
    await validateCheckboxState(checkbox, checkboxState);
});

Then('I get a new page with the global properties diff with event timestamps at index {int} and {int}',
    /** @this CustomWorld */ async function (firstIndex, secondIndex) {
        const platformBuilder = this.platformBuilder;
        const platformPath = '#';
        const checkboxes = get.elementsByCss(checkboxSelector);
        await checkboxes.get(firstIndex).getAttribute('data-timestamp').then(async function (firstTimestamp) {
            await checkboxes.get(secondIndex).getAttribute('data-timestamp').then(async function (secondTimestamp) {
                await navigate.toNewTab();
                const expectedUrl = api.buildDiffUrl(
                    platformBuilder,
                    platformBuilder,
                    platformPath,
                    platformPath,
                    null,
                    firstTimestamp,
                    secondTimestamp);
                await assert.currentUrlEquals(expectedUrl);
                await navigate.backToFirstTab();
            });
        });
    });

Then('the first platform event title contains {string}', async function (title) {
    const eventTitle = get.elementsByCss('.PlatformEvents__platform-panel-title').get(0);
    await assert.containsText(eventTitle, title);
});

