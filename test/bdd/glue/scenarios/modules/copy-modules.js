const send = require('../../helpers/send');

When('I click on the button to create a copy of a module', async function () {
    await send.clickById('e2e-navbar-module-create-from');
});

When('I submit valid values to copy the existing module, setting the version to {string}', /** @this CustomWorld */ async function (newVersion) {
    this.moduleBuilder.withVersion(newVersion);
    await send.inputByCss('#e2e-modal-module-create-from input[name="moduleName"]', this.moduleBuilder.name);
    await send.inputByCss('#e2e-modal-module-create-from input[name="moduleVersion"]', this.moduleBuilder.version);
    await send.searchAndSelectFirstByCss('md-autocomplete input#module-menu-modal-from_input-module-autocomplete', this.moduleBuilder.name);
    await send.clickByCss('#e2e-modal-module-create-from button[type="submit"]');
});
