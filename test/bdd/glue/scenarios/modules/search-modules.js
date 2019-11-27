const assert = require('../../helpers/assert');
const send = require('../../helpers/send');

When('I search for this module', /** @this CustomWorld */ async function () {
    await send.inputByCss('#e2e-navbar-module-autocomplete input', this.moduleBuilder.name);
    await browser.waitForAngular();
});

When('I click on the first element of the list of modules', async function () {
    await send.clickById('selected_option');
});

Then('I am redirected to the selected module page', /** @this CustomWorld */ async function () {
    const expectedUrl = `${ baseUrl }/#/module/${ this.moduleBuilder.name }/${ this.moduleBuilder.version }?type=${ this.moduleBuilder.getVersionType() }`;
    await assert.currentUrlEquals(expectedUrl);
});
