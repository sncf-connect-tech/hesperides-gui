const api = require('../../helpers/api');
const assert = require('../../helpers/assert');
const send = require('../../helpers/send');
const { TechnoBuilder } = require('../../builders/TechnoBuilder');

Given(/^an existing(?: workingcopy)? techno(?: named "([^"]*)")?(?: with version "([^"]*)")?(?: (?:and|with) (?:this|a) template)?$/,
    /** @this CustomWorld */ async function (technoName, technoVersion) {
        this.technoBuilder = new TechnoBuilder();
        if (technoName) {
            this.technoBuilder.withName(technoName);
        }
        if (technoVersion) {
            this.technoBuilder.withVersion(technoVersion);
        }
        this.technoBuilder.withTemplateBuilder(this.templateBuilder);
        await api.createTechno(this.technoBuilder, this.templateBuilder.build());
        this.technoHistory.addTechnoBuilder(this.technoBuilder);
    });

When('I open the menu for creating a new techno', async function () {
    await send.clickById('e2e-navbar-techno');
    await send.clickById('e2e-navbar-techno-create');
});

When('I submit valid techno values', /** @this CustomWorld */ async function () {
    await send.inputByCss('#e2e-modal-techno-create input[name="technoName"]', this.technoBuilder.name);
    await send.inputByCss('#e2e-modal-techno-create input[name="technoVersion"]', this.technoBuilder.version);
    await send.clickByCss('#e2e-modal-techno-create button[type="submit"]');
});

Then(/^I am redirected to the(?: newly created)?( released)? techno page$/, /** @this CustomWorld */ async function (released) {
    const urlVersionType = released ? '' : `?type=${ this.technoBuilder.getVersionType() }`;
    const expectedUrl = `${ baseUrl }/#/techno/${ this.technoBuilder.name }/${ this.technoBuilder.version }${ urlVersionType }`;
    await assert.currentUrlEquals(expectedUrl);
});
