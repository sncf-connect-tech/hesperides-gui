const assert = require('../../helpers/assert');
const send = require('../../helpers/send');

When('I search and select this application', /** @this CustomWorld */ async function () {
    await send.searchAndSelectFirstByCss('#e2e-navbar-application-autocomplete input', this.platformBuilder.applicationName);
});

Then('I am redirected to the selected application page', /** @this CustomWorld */ async function () {
    const expectedUrl = `${ baseUrl }/#/properties/${ this.platformBuilder.applicationName }`;
    await assert.currentUrlEquals(expectedUrl);
});
