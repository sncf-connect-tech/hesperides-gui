// eslint-disable-next-line no-unused-vars
const assert = require('assert');

When(/I open the menu for creating new workingcopy modules$/, async () => {
    await element(by.id('e2e-navbar-module')).click();
    await element(by.id('e2e-navbar-module-create')).click();
});

When(/I submit valid values$/, async () => {
    await element(by.css('#e2e-modal-module-create input[name="moduleName"]')).sendKeys(testModuleName);
    await element(by.css('#e2e-modal-module-create input[name="moduleVersion"]')).sendKeys(testModuleVersion);
    await element(by.css('#e2e-modal-module-create button[type="submit"]')).click();
});

Then(/I am redirected to the newly created module page$/, async () => {
    const expectedUrl = `${ baseUrl }/#/module/${ testModuleName }/${ testModuleVersion }?type=workingcopy`;
    await browser.driver.wait(() => browser.driver.getCurrentUrl().then((url) => url === expectedUrl));
});

Then(/a message inform me of its successful creation$/, async () => {
    // eslint-disable-next-line no-warning-comments
    // TODO: replicate utils.checkSuccessNotification behaviour
});
