const api = require('../../helpers/api');
const assert = require('../../helpers/assert');
const send = require('../../helpers/send');
const { ModuleBuilder } = require('../../builders/ModuleBuilder');

Given(/^an existing(?: workingcopy)? module(?: named "([^"]*)")?(?: with version "([^"]*)")?( (?:and|with) (this|a)? template)?( (?:and|with) (these)? templates)?( (?:and|with) required and not required properties)?( (?:and|with) this techno)?$/,
    /** @this CustomWorld */ async function (moduleName, moduleVersion, withThisTemplate, withTheseTemplates, withRequiredAndNotRequiredProperties, withTechno) {
        this.moduleBuilder = new ModuleBuilder();
        if (moduleName) {
            this.moduleBuilder.withName(moduleName);
        }
        if (moduleVersion) {
            this.moduleBuilder.withVersion(moduleVersion);
        }
        if (withRequiredAndNotRequiredProperties) {
            this.templateBuilder.setContent('{{ simple-property }}{{ required-property | @required }}');
            this.moduleBuilder.withTemplateBuilder(this.templateBuilder);
        }
        if (withThisTemplate) {
            this.moduleBuilder.withTemplateBuilder(this.templateBuilder);
        } else if (withTheseTemplates) {
            for (const templateBuilder of this.templateHistory.templateBuilders) {
                this.moduleBuilder.withTemplateBuilder(templateBuilder);
            }
        }
        if (withTechno) {
            this.moduleBuilder.withTechnoBuilder(this.technoBuilder);
        }
        await api.createModule(this.moduleBuilder);
        this.moduleHistory.addModuleBuilder(this.moduleBuilder);
    });

When('I click on the button to create a new module', async function () {
    await send.clickById('e2e-navbar-module-create');
});

When('I submit valid values to create this module', /** @this CustomWorld */ async function () {
    await send.inputByCss('#e2e-modal-module-create input[name="moduleName"]', this.moduleBuilder.name);
    await send.inputByCss('#e2e-modal-module-create input[name="moduleVersion"]', this.moduleBuilder.version);
    await send.clickByCss('#e2e-modal-module-create button[type="submit"]');
});

Then(/^I am redirected to the(?: newly created)?( released)? module page$/, /** @this CustomWorld */ async function (released) {
    const urlVersionType = released ? '' : `?type=${ this.moduleBuilder.getVersionType() }`;
    const expectedUrl = `${ baseUrl }/#/module/${ this.moduleBuilder.name }/${ this.moduleBuilder.version }${ urlVersionType }`;
    await assert.currentUrlEquals(expectedUrl);
});
