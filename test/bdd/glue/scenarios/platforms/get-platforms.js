const assert = require('../../helpers/assert');
const get = require('../../helpers/get');
const send = require('../../helpers/send');

When('I open this application', /** @this CustomWorld */ async function () {
    await browser.get(`${ baseUrl }/#/properties/${ this.platformBuilder.applicationName }`);
    await browser.waitForAngular();
});

When(/^I open (?:this|the) platform(?: "([^"]*)")?( as a production user)?$/, /** @this CustomWorld */ async function (platformName, productionUser) {
    if (!platformName) {
        platformName = this.platformBuilder.platformName;
    }
    const urlPrefix = productionUser ? this.productionUserUrl : baseUrl;
    await browser.get(`${ urlPrefix }/#/properties/${ this.platformBuilder.applicationName }?platform=${ platformName }`);
    await browser.waitForAngular();
});

When('I click on the platform {string}', async function (platformName) {
    await send.clickById(`e2e-application-platform-button-${ platformName }`);
});

Then('I get a warning message saying that the platform has a workingcopy module', async function () {
    const warning = get.elementById('e2e-warning-production-platform-contains-workingcopy-modules');
    await assert.containsText(warning, 'A production platform should only contain released modules. This platform contains 1 working copy module(s)');
});
