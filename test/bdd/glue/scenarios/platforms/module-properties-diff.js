const api = require('../../helpers/api');
const assert = require('../../helpers/assert');
const get = require('../../helpers/get');
const navigate = require('../../helpers/navigate');
const send = require('../../helpers/send');
const moment = require('moment');

let selectedTimestamp = null;

When(/^I open the modal to compare (?:this|the) module(?: "([^"]*)")? properties$/, /** @this CustomWorld */ async function (moduleName) {
    selectedTimestamp = null;
    if (!moduleName) {
        moduleName = this.moduleBuilder.name;
    }
    await send.mouseOnById(`e2e-tree-renderer-edit-module-button-${ moduleName }`);
    await send.clickById(`e2e-deployed-module-controls-diff-properties-button-${ moduleName }`);
});

When('I click on the NEXT button', async function () {
    await send.clickById('e2e-properties-diff-next-button');
});

When('I launch the diff of module properties', async function () {
    await send.clickById('e2e-properties-diff-runcomparison-button');
});

When('I select the module properties stored values comparison option', async function () {
    await send.clickById('e2e-module-properties-diff-option-stored');
});

When('I select a specific date to compare this module properties', async function () {
    await send.clickById('e2e-properties-diff-wizard-switch');
    // Vérifie que le calendrier s'affiche automatiquement
    await assert.isPresentByCss('.angularjs-datetime-picker');
    // Sélectionne une date un mois plus tôt
    await send.clickByCss('.adp-prev');
    await send.clickByCssContainingText('.adp-day.selectable', '12');
    // Vérifie que le calendrier se ferme automatiquement
    await assert.isNotPresentByCss('.angularjs-datetime-picker');
    // Récupère la date sélectionnée
    // eslint-disable-next-line no-return-assign
    await get.elementById('look-past-date-time').getAttribute('value').then(function (selectedDate) {
        selectedTimestamp = Number(moment(selectedDate, 'YYYY-MM-DD HH:mm:ss Z'));
    });
});

When('I choose module {string} to compare with the selected module', async function (toModuleName) {
    await send.clickById('e2e-module-properties-diff-choose-other-module');
    await send.clickById(`e2e-module-properties-diff-choose-other-module-${ toModuleName }`);
});

When('I open the diff of properties for this module between platform {string} and {string}',
    /** @this CustomWorld */ async function (fromPlatformName, toPlatformName) {
        const fromPlatformBuilder = this.platformHistory.findPlatformBuilderByName(fromPlatformName);
        const toPlatformBuilder = this.platformHistory.findPlatformBuilderByName(toPlatformName);
        const propertiesPath = this.deployedModuleBuilder.buildPropertiesPath();
        await browser.get(api.buildDiffUrl(fromPlatformBuilder, toPlatformBuilder, propertiesPath, propertiesPath));
        await browser.waitForAngular();
    });

When('I click on the switch to hide the deleted properties', async function () {
    await send.clickById('e2e-diff-toggle-deleted-property-top');
});

Then(/^I get a new page with the module properties( stored values)? diff(?: between platform "([^"]*)" and platform "([^"]*)")?(?: between module "([^"]*)" and module "([^"]*)")?$/,
    /** @this CustomWorld */async function (storedValues, fromPlatformName, toPlatformName, fromModuleName, toModuleName) {
        await navigate.toNewTab();
        const fromPlatformBuilder = fromPlatformName ? this.platformHistory.findPlatformBuilderByName(fromPlatformName) : this.platformBuilder;
        const toPlatformBuilder = toPlatformName ? this.platformHistory.findPlatformBuilderByName(toPlatformName) : this.platformBuilder;
        const fromDeployedModuleBuilder = fromModuleName ? this.platformBuilder.findDeployedModuleBuilderByName(fromModuleName) : this.deployedModuleBuilder;
        const toDeployedModuleBuilder = toModuleName ? this.platformBuilder.findDeployedModuleBuilderByName(toModuleName) : this.deployedModuleBuilder;
        const expectedUrl = api.buildDiffUrl(
            fromPlatformBuilder,
            toPlatformBuilder,
            fromDeployedModuleBuilder.buildPropertiesPath(),
            toDeployedModuleBuilder.buildPropertiesPath(),
            storedValues);
        await assert.currentUrlEquals(expectedUrl);
        await navigate.backToFirstTab();
    });

Then('I get a new page with the module properties diff with timestamp', /** @this CustomWorld */ async function () {
    await navigate.toNewTab();
    const expectedUrl = api.buildDiffUrl(this.platformBuilder, this.platformBuilder, this.deployedModuleBuilder.buildPropertiesPath(), false, selectedTimestamp);
    await assert.currentUrlEquals(expectedUrl);
    await navigate.backToFirstTab();
});
