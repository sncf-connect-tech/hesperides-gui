const assert = require('../../helpers/assert');
const send = require('../../helpers/send');

When('I search for this techno', /** @this CustomWorld */ async function () {
    await send.inputByCss('#e2e-navbar-techno-autocomplete input', this.technoBuilder.name);
    await browser.waitForAngular();
});

When('I click on the first element of the list of technos', async function () {
    await send.clickById('selected_option');
});

Then('I am redirected to the selected techno page', /** @this CustomWorld */ async function () {
    const expectedUrl = `${ baseUrl }/#/techno/${ this.technoBuilder.name }/${ this.technoBuilder.version }?type=${ this.technoBuilder.getVersionType() }`;
    await assert.currentUrlEquals(expectedUrl);
});
