const assert = require('../../helpers/assert');
const send = require('../../helpers/send');

When('I search and select this module', /** @this CustomWorld */ async function () {
    await send.searchAndSelectFirstByCss('#e2e-navbar-module-autocomplete input', this.moduleBuilder.name);
});

Then('I am redirected to the selected module page', /** @this CustomWorld */ async function () {
    const expectedUrl = `${ baseUrl }/#/module/${ this.moduleBuilder.name }/${ this.moduleBuilder.version }?type=${ this.moduleBuilder.getVersionType() }`;
    await assert.currentUrlEquals(expectedUrl);
});
