const api = require('../../helpers/api');
const assert = require('../../helpers/assert');
const send = require('../../helpers/send');
const { PlatformBuilder } = require('../../builders/PlatformBuilder');

Given(/^a(?:n existing)?( production)? (?:application|platform)(?: named "([^"]*)")?( with (?:this|those) modules?)?( in different logical groups)?$/,
    /** @this CustomWorld */ async function (production, platformName, withModules, differentLogicalGroups) {
        this.platformBuilder = new PlatformBuilder();
        this.platformBuilder.withProductionFlag(Boolean(production));
        if (platformName) {
            this.platformBuilder.withPlatformName(platformName);
        }
        if (withModules) {
            for (const [ index, moduleBuilder ] of this.moduleHistory.moduleBuilders.entries()) {
                this.deployedModuleBuilder.fromModuleBuilder(moduleBuilder);
                if (differentLogicalGroups) {
                    this.deployedModuleBuilder.withModulePath(`#ABC-${ index }`);
                }
                this.platformBuilder.withDeployedModuleBuilder(this.deployedModuleBuilder);
            }
        }
        const urlPrefix = production ? this.productionUserUrl : baseUrl;
        await api.createPlatform(this.platformBuilder.build(), urlPrefix);
        this.platformHistory.addPlatformBuilder(this.platformBuilder);
    });

When('I click on the button to create a new platform', async function () {
    await send.clickById('e2e-navbar-app-create');
});

When('I click on the button to create a new platform from another one', async function () {
    await send.clickById('e2e-navbar-app-create-from');
});

When('I submit valid values to create this platform', /** @this CustomWorld */ async function () {
    await send.inputByCss('#e2e-modal-platform-create input[name="platformApplication"]', this.platformBuilder.applicationName);
    await send.inputByCss('#e2e-modal-platform-create input[name="platformName"]', this.platformBuilder.platformName);
    await send.inputByCss('#e2e-modal-platform-create input[name="platformApplicationVersion"]', this.platformBuilder.version);
    await send.clickByCss('#e2e-modal-platform-create button[type="submit"]');
});

Then(/^I am redirected to the newly created platform page$/, /** @this CustomWorld */ async function () {
    const expectedUrl = `${ baseUrl }/#/properties/${ this.platformBuilder.applicationName }?platform=${ this.platformBuilder.platformName }`;
    await assert.currentUrlEquals(expectedUrl);
});

Then('the switch to create a production platform should be disabled', async function () {
    await assert.isDisabledById('e2e-modal-platform-create-is-prod-switch');
});

Then('the switch to create a production platform from another one should be disabled', async function () {
    await assert.isDisabledById('e2e-modal-platform-create-from-is-prod-switch');
});

Then('the switch to define the platform as a production should be disabled', async function () {
    await assert.isDisabledById('properties_isProduction-switch');
});
