const send = require('../../helpers/send');

When('I click on the button to create the release of this module', async function () {
    await send.clickById('e2e-module-create-release-button');
});

When('I submit the module release version', /** @this CustomWorld */ async function () {
    await send.inputByCss('input[name="release-version"]', this.moduleBuilder.version);
    await send.clickByCss('button[type="submit"]');
    this.moduleBuilder.withIsWorkingcopy(false);
});
