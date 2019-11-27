const assert = require('../../helpers/assert');
const send = require('../../helpers/send');

When('I search for this application', /** @this CustomWorld */ async function () {
    await send.inputByCss('#e2e-navbar-application-autocomplete input', this.platformBuilder.applicationName);
    await browser.waitForAngular();
});

When('I click on the first element of the list of applications', async function () {
    await send.clickById('selected_option');
});

Then('I am redirected to the selected application page', /** @this CustomWorld */ async function () {
    const expectedUrl = `${ baseUrl }/#/properties/${ this.platformBuilder.applicationName }`;
    await assert.currentUrlEquals(expectedUrl);
});
