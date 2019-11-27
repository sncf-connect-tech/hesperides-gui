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
        await api.createPlatform(this.platformBuilder.build());
        this.platformHistory.addPlatformBuilder(this.platformBuilder);
    });

When('I click on the button to create a new platform', async function () {
    await send.clickById('e2e-navbar-app-create');
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
