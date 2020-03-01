const assert = require('../../helpers/assert');
const get = require('../../helpers/get');
const send = require('../../helpers/send');

let selectedBlockId = null;

When('I open the iterable properties', async function () {
    await send.clickById('e2e-properties-list_display-iterable-properties-button');
});

When('I add a new block with the title {string} for the iterable property {string}', async function (blockTitle, iterablePropertyName) {
    await send.clickById(`e2e-iterable-property-${ iterablePropertyName }-add-bloc-button`);
    await get.elementsByCss(`#e2e-iterable-property-${ iterablePropertyName }-blocks .iterable-bloc`).then(async function (blocks) {
        await blocks[0].getAttribute('block-id').then(async function (blockId) {
            selectedBlockId = blockId;
            await send.inputByCss(`#iterable-block-${ blockId } input.iterable-title-value`, blockTitle);
        });
    });
});

When('I enter the following values for the first block of the iterable property {string}', async function (iterablePropertyName, dataTable) {
    for (const [ name, value ] of dataTable.raw()) {
        await send.inputById(`e2e-iterable-property-${ iterablePropertyName }-bloc-${ selectedBlockId }-value-${ name }`, value);
    }
});

When('I remove the first block of the iterable property {string}', async function (iterablePropertyName) {
    await get.elementsByCss(`#e2e-iterable-property-${ iterablePropertyName }-blocks .iterable-bloc`).then(async function (blocks) {
        await blocks[0].getAttribute('block-id').then(async function (blockId) {
            selectedBlockId = blockId;
            await send.clickById(`e2e-iterable-property-loop-bloc-${ blockId }-remove-bloc-button`);
        });
    });
});

When('this block does not appear anymore', async function () {
    await assert.isNotPresentById(`iterable-block-${ selectedBlockId }`);
});
