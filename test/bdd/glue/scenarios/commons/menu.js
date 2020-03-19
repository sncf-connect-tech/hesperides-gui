const send = require('../../helpers/send');

When('I (re)open the techno menu', async function () {
    await send.clickById('e2e-navbar-techno');
});

When('I (re)open the module menu', async function () {
    await send.clickById('e2e-navbar-module');
});

When('I (re)open the application menu', async function () {
    await send.clickById('e2e-navbar-app');
});
