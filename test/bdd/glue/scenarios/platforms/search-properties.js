const api = require('../../helpers/api');
const assert = require('../../helpers/assert');
const get = require('../../helpers/get');
const navigate = require('../../helpers/navigate');
const send = require('../../helpers/send');

const searchInputNameId = 'search_property_name';
const searchInputValueId = 'search_property_value';
const propertyModuleCellSelector = '.e2e-search-properties-property-module';
const inputFilterId = 'e2e-search-properties-result-filter';
const resultCountId = 'e2e-search-properties-result-count';
const displayMorePropertiesButtonId = 'e2e-search-properties-display-more-button';

When('I click on the search properties menu button', async function () {
    await send.clickById('e2e-navbar-search-properties');
});

When(/^I search properties(?: with name "([^"]*)")?(?: (?:and|with) value "([^"]*)")?$/, async function (propertyName, propertyValue) {
    await send.inputById(searchInputNameId, propertyName || '');
    await send.inputById(searchInputValueId, propertyValue || '');
    await send.clickById('e2e-search-properties-submit-button');
});

When(/^I click on the property's module$/, async function () {
    await send.clickByCss(propertyModuleCellSelector);
});

When('I filter properties search result with {string}', async function (filterValue) {
    await send.inputById(inputFilterId, filterValue);
});

When('I open the search properties page with parameter {string}', async function (urlParameter) {
    await browser.get(`${ baseUrl }/#/search-properties?${ urlParameter }`);
    await browser.waitForAngular();
});

When('I click on the button to display more properties', async function () {
    await send.clickById(displayMorePropertiesButtonId);
});

When('I filter the search results with {string}', async function (input) {
    await send.inputById(inputFilterId, input);
});

Then('the properties search form is empty', async function () {
    const name = get.elementById(searchInputNameId);
    await assert.equalsText(name, '');
    const value = get.elementById(searchInputValueId);
    await assert.equalsText(value, '');
});

Then('the properties search result count message is not present', async function () {
    await assert.isNotPresentById(resultCountId);
});

Then('the properties search result filter is not present', async function () {
    await assert.isNotPresentById(inputFilterId);
});

Then('the properties search result table is not present', async function () {
    await assert.isNotPresentById('e2e-search-properties-result-table');
});

Then(/^the properties search result filter is( not)? displayed$/, async function (isNotDisplayed) {
    if (isNotDisplayed) {
        await assert.isNotDisplayedById(inputFilterId);
    } else {
        await assert.isDisplayedById(inputFilterId);
    }
});

Then('the page url ends with {string}', async function (urlEnd) {
    const expectedUrl = `${ baseUrl }/#/${ urlEnd }`;
    await assert.currentUrlEquals(expectedUrl);
});

Then('the properties search result count message is {string}', async function (message) {
    const element = get.elementById(resultCountId);
    await assert.containsText(element, message);
});

Then('the properties search result table contains exactly', async function (dataTable) {
    for (const [ name, value, module, platform, application ] of dataTable.raw()) {
        const prefix = `#e2e-search-properties-result-table-row-${ name }-${ value }-${ platform }-${ application }`;
        await assert.equalsText(get.elementByCss(`${ prefix } .e2e-search-properties-property-name`), name);
        await assert.equalsText(get.elementByCss(`${ prefix } .e2e-search-properties-property-value`), value);
        // Pour module, platform et application j'ajoute 2 espaces à la valeur parce qu'à
        // cause de l'icône de lien externe le texte contient 2 espaces et aussi parce qu'on
        // ne peut pas faire de `trim` sur la valeur de l'élément dans `assert.equalsText`
        await assert.equalsText(get.elementByCss(`${ prefix } ${ propertyModuleCellSelector }`), `${ module }  `);
        await assert.equalsText(get.elementByCss(`${ prefix } .e2e-search-properties-property-platform`), `${ platform }  `);
        await assert.equalsText(get.elementByCss(`${ prefix } .e2e-search-properties-property-application`), `${ application }  `);
    }
});

Then('a new tab opens directly to this module', /** @this CustomWorld */ async function () {
    await navigate.toNewTab();
    const applicationName = this.platformBuilder.applicationName;
    const platformName = this.platformBuilder.platformName;
    const modulePathUrl = api.encodeHashSymbol(this.deployedModuleBuilder.buildPropertiesPath());
    const expectedUrl = `http://localhost/#/properties/${ applicationName }?platform=${ platformName }#${ modulePathUrl }`;
    await assert.currentUrlEquals(expectedUrl);
    await navigate.backToFirstTab();
});

Then('the button to display more properties is not present anymore', async function () {
    await assert.isNotPresentById(displayMorePropertiesButtonId);
});
