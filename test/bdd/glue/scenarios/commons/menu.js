const send = require('../../helpers/send');

When('I open the techno menu', async function () {
    await send.clickById('e2e-navbar-techno');
});

When('I open the module menu', async function () {
    await send.clickById('e2e-navbar-module');
});

When('I open the application menu', async function () {
    await send.clickById('e2e-navbar-app');
});
