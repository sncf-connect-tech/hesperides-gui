const assert = require('../../helpers/assert');

Then(/^I get the following( success)? notification: "([^"]*)"?$/, async function (success, message) {
    await assert.notification(Boolean(success), message);
});
