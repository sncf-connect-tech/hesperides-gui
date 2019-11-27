const assert = require('../../helpers/assert');
const send = require('../../helpers/send');

When('I open the menu to display information about the application', async function () {
    await send.clickById('e2e-navbar-help');
    await send.clickById('e2e-navbar-help-about');
});

When('I open the techno menu', async function () {
    await send.clickById('e2e-navbar-techno');
});

When('I open the module menu', async function () {
    await send.clickById('e2e-navbar-module');
});

When('I open the application menu', async function () {
    await send.clickById('e2e-navbar-app');
});

Then('I should see the modal with information about the release', async function () {
    await assert.isPresentById('e2e-about-modal');
});

Then('I should be able to close the modal "about"', async function () {
    await send.clickById('e2e-close-about-modal-button');
    await assert.isNotPresentById('e2e-about-modal');
});
