const assert = require('../../helpers/assert');
const get = require('../../helpers/get');
const send = require('../../helpers/send');

When(/^(?:I add this techno to this module|I search and select this techno on the module page)$/, /** @this CustomWorld */ async function () {
    await send.clickById('e2e-module-technos-add-button');
    await send.searchAndSelectFirstByCss('#e2e-module-technos-search input', this.technoBuilder.name);
});

Then('the techno is successfully added to the module', /** @this CustomWorld */ async function () {
    await assert.isPresentById(`e2e-module-technos-${ this.technoBuilder.name }`);
});

Then('the first techno of this module is {string}', async function (technoDescription) {
    const technos = await get.elementsByCss('#e2e-module-technos button');
    assert.containsText(technos[0], technoDescription);
});
