const assert = require('../../helpers/assert');
const get = require('../../helpers/get');
const send = require('../../helpers/send');

When('I filter deployed modules on {string}', async function (filter) {
    await send.inputById('e2e-tree-properties-filter', filter);
});

Then('the deployed module filter still contains {string}', async function (filterText) {
    const filterInput = get.elementById('e2e-tree-properties-filter');
    await assert.containsValue(filterInput, filterText);
});

Then('there is only one deployed module displayed', async function () {
    const deployedModules = get.elementsByCss('.module-link');
    await assert.elementsCount(deployedModules, 1);
});
