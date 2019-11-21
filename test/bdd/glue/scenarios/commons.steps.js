const assert = require('../helpers/assert');

Then('I get a the following success notification: {string}', async function (message) {
    await assert.checkSuccessNotification(message);
});
