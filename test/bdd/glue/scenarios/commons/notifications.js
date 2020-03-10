
const assert = require('../../helpers/assert');

Then(/^I get the following( success)? notification: "([^"]*)"?$/, async function (success, message) {
    await assert.notification(Boolean(success), message);
});

Then('I do not get any {string} notification', async function (success) {
    await assert.thereAreNoNotifications(Boolean(success));
});
