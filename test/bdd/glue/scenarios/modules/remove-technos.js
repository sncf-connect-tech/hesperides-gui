const assert = require('../../helpers/assert');
const send = require('../../helpers/send');

When('I remove this techno from this module', /** @this CustomWorld */ async function () {
    await send.clickById(`e2e-module-technos-${ this.technoBuilder.name }-remove-button`);
    await send.acceptAlert();
});

Then('the techno is successfully removed from the module', /** @this CustomWorld */ async function () {
    await assert.isNotPresentById(`e2e-module-technos-${ this.technoBuilder.name }`);
});
