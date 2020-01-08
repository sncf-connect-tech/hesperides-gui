const assert = require('../../helpers/assert');
const send = require('../../helpers/send');

When('I open the preview file modal of this module', /** @this CustomWorld */ async function () {
    await send.clickById(`e2e-tree-renderer-module-preview-file-button-${ this.moduleBuilder.name }`);
});

When('I open the file preview of this template', /** @this CustomWorld */ async function () {
    await send.clickById(`e2e-file-modal-preview-${ this.templateBuilder.name }-button`);
});

When('I download the file of this template', /** @this CustomWorld */ async function () {
    await send.clickById(`e2e-file-modal-template-download-button-${ this.templateBuilder.name }`);
});

When('I download all the files of this module at once', async function () {
    await send.clickById('e2e-file-modal-template-download-all-button');
});

Then('the file preview of this template should contain', async function (content) {
    await assert.codeMirrorContains(content);
});

Then('the file of this template should contain', /** @this CustomWorld */ async function (content) {
    await assert.fileContains(this.templateBuilder.filename, content);
});
