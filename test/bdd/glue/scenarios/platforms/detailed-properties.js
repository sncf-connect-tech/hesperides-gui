const assert = require('../../helpers/assert');
const get = require('../../helpers/get');
const send = require('../../helpers/send');

When('I open the detailed properties of this platform', async function () {
    await send.clickById('e2e-deployed-module-controls-detailed-properties-button');
});

When('I click on the switch button to display the detailed global properties', async function () {
    await send.clickById('e2e-detailed-properties-show-globals');
});

When('I search for {string} in the detailed properties', async function (value) {
    await send.inputById('e2e-detailed-properties-search', value);
});

Then('the detailed properties contain the module properties', async function (dataTable) {
    for (const [ name, value, icon, tooltip ] of dataTable.raw()) {
        const prefix = `#e2e-detailed-property-${ name } .e2e-detailed-property`;
        await assert.equalsText(get.elementByCss(`${ prefix }-name`), name);
        await assert.equalsText(get.elementByCss(`${ prefix }-value`), value);
        await assert.equalsText(get.elementByCss(`${ prefix }-infos`), icon);
        if (tooltip) {
            await assert.elementAttributeContainsText(get.elementByCss(`${ prefix }-infos > span`), 'aria-label', tooltip);
        }
    }
});

Then('the detailed properties contain the global properties', async function (dataTable) {
    for (const [ name, value ] of dataTable.raw()) {
        const prefix = `#e2e-detailed-global-property-${ name } .e2e-detailed-property`;
        await assert.equalsText(get.elementByCss(`${ prefix }-name`), name);
        await assert.equalsText(get.elementByCss(`${ prefix }-value`), value);
    }
});

Then('the detailed properties contain the properties with the following modules', async function (dataTable) {
    for (const [ propertyName, printedPath ] of dataTable.raw()) {
        await assert.equalsText(get.elementByCss(`#e2e-detailed-property-${ propertyName } .e2e-detailed-property-module`), printedPath);
    }
});

Then('only one property is displayed in the detailed properties', async function () {
    const rows = get.elementsByCss('#e2e-detailed-module-properties tr');
    await assert.elementsCount(rows, 1);
});
