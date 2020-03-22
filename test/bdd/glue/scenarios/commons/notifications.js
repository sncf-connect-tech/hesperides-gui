const assert = require('../../helpers/assert');
const send = require('../../helpers/send');

When('I accept the alert', async function () {
    await send.acceptAlert();
});

Then(/^I get the following( success)? notification: "([^"]*)"?$/, async function (success, message) {
    await assert.notification(Boolean(success), message);
});
