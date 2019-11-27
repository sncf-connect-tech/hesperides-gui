const send = require('../../helpers/send');

When('I click on the button to create a copy of a techno', async function () {
    await send.clickById('e2e-navbar-techno-create-from');
});

When('I submit valid values to copy the existing techno, setting the version to {string}', /** @this CustomWorld */ async function (newVersion) {
    this.technoBuilder.withVersion(newVersion);
    await send.inputByCss('#e2e-modal-techno-create-from input[name="technoName"]', this.technoBuilder.name);
    await send.inputByCss('#e2e-modal-techno-create-from input[name="technoVersion"]', this.technoBuilder.version);
    await send.inputByCss('md-autocomplete input#techno-menu-modal-from_input-techno-autocomplete', this.technoBuilder.name);
    browser.waitForAngular();
    await send.clickById('selected_option');
    await send.clickByCss('#e2e-modal-techno-create-from button[type="submit"]');
    browser.waitForAngular();
});
