const assert = require('../helpers/assertions');

Then('I get a the following success notification: {string}', async function (message) {
    await assert.checkSuccessNotification(message);
});
