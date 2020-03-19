const send = require('../../helpers/send');

When(/^I (?:open|reopen) the techno menu$/, async function () {
    await send.clickById('e2e-navbar-techno');
});

When(/^I (?:open|reopen) the module menu$/, async function () {
    await send.clickById('e2e-navbar-module');
});

When(/^I (?:open|reopen) the application menu$/, async function () {
    await send.clickById('e2e-navbar-app');
});
