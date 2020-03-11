const send = require('../../helpers/send');

When(/^I (?:open|reopen) (the techno menu)?(the module menu)?(the application menu)?$/, async function (technoMenu, moduleMenu, applicationMenu) {
    if (technoMenu) {
        await send.clickById('e2e-navbar-techno');
    }
    if (moduleMenu) {
        await send.clickById('e2e-navbar-module');
    }
    if (applicationMenu) {
        await send.clickById('e2e-navbar-app');
    }
});
