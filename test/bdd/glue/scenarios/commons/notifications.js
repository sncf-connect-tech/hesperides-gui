
const assert = require('../../helpers/assert');

Then(/^I get the following( success)? notification: "([^"]*)"?$/, async function (success, message) {
    await assert.notification(Boolean(success), message);
});

Then('I do not get any {string} notification', async function (success) {
    await assert.thereAreNoNotifications(Boolean(success));
});

Then('I get a confirmation popIn', async function () {
    await assert.isPresentById('e2e-tree-renderer-edit-module-button-LOGIC-2-module-1');
});
