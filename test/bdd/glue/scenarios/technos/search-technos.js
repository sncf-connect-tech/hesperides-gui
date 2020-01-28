const assert = require('../../helpers/assert');
const send = require('../../helpers/send');

When('I search and select this techno in the menu', /** @this CustomWorld */ async function () {
    await send.searchAndSelectFirstByCss('#e2e-navbar-techno-autocomplete input', this.technoBuilder.name);
});

Then('I am redirected to the selected techno page', /** @this CustomWorld */ async function () {
    const expectedUrl = `${ baseUrl }/#/techno/${ this.technoBuilder.name }/${ this.technoBuilder.version }?type=${ this.technoBuilder.getVersionType() }`;
    await assert.currentUrlEquals(expectedUrl);
});
