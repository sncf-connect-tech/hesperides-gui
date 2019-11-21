const assert = require('../../helpers/assert');
const get = require('../../helpers/get');

When('I open the platform', /** @this CustomWorld */ async function () {
    await browser.get(`${ baseUrl }/#/properties/${ this.platformBuilder.applicationName }?platform=${ this.platformBuilder.platformName }`);
});


Then('I get a warning message saying that the platform has a workingcopy module', async function () {
    const warning = get.elementById('e2e-warning-production-platform-contains-workingcopy-modules');
    await assert.containsText(warning, 'A production platform should only contain released modules. This platform contains 1 working copy module(s)');
});
