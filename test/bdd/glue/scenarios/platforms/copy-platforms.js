const assert = require('../../helpers/assert');
const get = require('../../helpers/get');
const send = require('../../helpers/send');

When('I click on the button to create a copy of a platform', async function () {
    await send.clickById('e2e-navbar-app-create-from');
});

When('I submit valid values to copy the existing platform', /** @this CustomWorld */ async function () {
    const firstPlatformName = this.platformBuilder.platformName;
    this.platformBuilder.withPlatformName('TEST');
    // Saisie de la nouvelle plateforme
    await send.inputByCss('#e2e-modal-platform-create-from input[name="platformApplication"]', this.platformBuilder.applicationName);
    await send.inputByCss('#e2e-modal-platform-create-from input[name="platformName"]', this.platformBuilder.platformName);
    await send.inputByCss('#e2e-modal-platform-create-from input[name="platformApplicationVersion"]', this.platformBuilder.version);
    // Sélection de la platforme d'origine
    await send.inputByCss('md-autocomplete input#e2e-modal-platform-create-from-input-application-autocomplete', this.platformBuilder.applicationName);
    await browser.waitForAngular();
    await send.clickById('selected_option');
    await send.inputByCss('md-autocomplete input#e2e-modal-platform-create-from-input-platform-autocomplete', firstPlatformName);
    await browser.waitForAngular();
    await get.elementsByCss('#selected_option').get(1).click();
    // Validation
    await send.clickByCss('#e2e-modal-platform-create-from button[type="submit"]');
});

Then(/^the platform's module is also copied$/, /** @this CustomWorld */ async function () {
    await assert.isPresentById(`e2e-tree-renderer-edit-module-button-${ this.moduleBuilder.name }`);
});
