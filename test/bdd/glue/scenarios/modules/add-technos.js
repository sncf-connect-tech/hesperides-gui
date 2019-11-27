const assert = require('../../helpers/assert');
const send = require('../../helpers/send');

When('I add this techno to this module', /** @this CustomWorld */ async function () {
    await send.clickById('e2e-module-technos-add-button');
    await send.inputByCss('#nameInput input', this.technoBuilder.name);
    await browser.waitForAngular();
    await send.clickById('selected_option');
});

Then('the techno is successfully added to the module', /** @this CustomWorld */ async function () {
    await assert.isPresentById(`e2e-module-technos-${ this.technoBuilder.name }`);
});
