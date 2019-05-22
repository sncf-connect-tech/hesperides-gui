/*
 * This file is part of the Hesperides distribution.
 * (https://github.com/voyages-sncf-technologies/hesperides)
 * Copyright (c) 2016 VSCT.
 *
 * Hesperides is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as
 * published by the Free Software Foundation, version 3.
 *
 * Hesperides is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

var utils = require('../utils.js');

describe('Manage platforms', () => {

    beforeAll(() => {
        browser.get(hesperides_url);
        // delete platform on hesperides for cleaning
        utils.deleteHttpRequest(hesperides_url+'/rest/applications/'+data.new_application+'/platforms/'+data.new_platform);
        utils.deleteHttpRequest(hesperides_url+'/rest/applications/'+data.new_application+'/platforms/'+data.new_platform+'_from');
    });

    it('should create platform', () => {
        utils.clickOnElement(element(by.id("e2e-navbar-app")));
        utils.clickOnElement(element(by.id("e2e-navbar-app-create")));
        
        // fill in fields
        element(by.css('#e2e-modal-platform-create input[name="platformApplication"]')).sendKeys(data.new_application);
        element(by.css('#e2e-modal-platform-create input[name="platformName"]')).sendKeys(data.new_platform);
        element(by.css('#e2e-modal-platform-create input[name="platformApplicationVersion"]')).sendKeys(data.new_platform_version);

        element(by.css('#e2e-modal-platform-create button[type="submit"]')).click().then(() => {
            element(by.id('properties_show-platform-event-button')).isPresent().then((isPresent) => {
                expect(isPresent).toBe(true);
                utils.checkResponseStatusCode(hesperides_url+'/rest/applications/'+data.new_application+'/platforms/'+data.new_platform,200);
            })
        });
    });

    it('should find platform on autocomplete in menu "applications"', () => {
        utils.clickOnElement(element(by.id("e2e-navbar-app")));

        element(by.id("input-4")).sendKeys(data.new_application);
        browser.waitForAngular();//ajout pour que l'autocompletion soit prise en compte au moment du test

        browser.driver.findElements(by.css('.md-autocomplete-suggestions li')).
            then((elems) => expect(elems.length).toBeGreaterThan(0) );
    });

    it('should create platform from an existing one', () => {
        //utils.clickOnElement(element(by.id("e2e-navbar-app"))); // already open by previous test
        utils.clickOnElement(element(by.id("e2e-navbar-app-create-from")));

        element(by.css('#e2e-modal-platform-create-from input[name="platformApplication"]')).sendKeys(data.new_application);
        element(by.css('#e2e-modal-platform-create-from input[name="platformName"]')).sendKeys(data.new_platform+"_from");
        element(by.css('#e2e-modal-platform-create-from input[name="platformApplicationVersion"]')).sendKeys(data.new_platform_version+"_from");

        element(by.css('md-autocomplete input#e2e-modal-platform-create-from-input-application-autocomplete')).sendKeys(data.new_application);
        utils.selectFirstElemOfAutocomplete(element(by.css('md-autocomplete input#e2e-modal-platform-create-from-input-application-autocomplete')), false, true, 3500);
        browser.waitForAngular();//ajout pour que l'autocompletion soit prise en compte au moment du test

        var elm_platformNameFrom = element(by.css('md-autocomplete input#e2e-modal-platform-create-from-input-platform-autocomplete'));
        elm_platformNameFrom.sendKeys(data.new_platform);
        utils.selectFirstElemOfAutocomplete(elm_platformNameFrom, false, true, 3500);
        browser.waitForAngular();//ajout pour que l'autocompletion soit prise en compte au moment du test

        element(by.css('#e2e-modal-platform-create-from button[type="submit"]')).click().then(() => {
            element(by.id('properties_show-platform-event-button')).isPresent().then((isPresent) => {
                expect(isPresent).toBe(true);
                utils.checkResponseStatusCode(hesperides_url+'/rest/applications/'+data.new_application+'/platforms/'+data.new_platform+'_from',200);
            })
        });
    });

    it('should filter platforms correctly', () => {
        browser.get(hesperides_url+"/#/properties/"+data.new_application);

        element(by.id("properties_platform-filter-input")).sendKeys(data.new_application);

        browser.driver.findElements(by.css('.shared-list-inline li')).
            then((elems) => expect(elems.length).toBeGreaterThan(0) );
    });

    it('should change version of a platform correctly', () => {
        browser.get(hesperides_url+"/#/properties/"+data.new_application+"?platform="+data.new_platform);

        element(by.css('[ng-click="change_platform_version(platform)"]')).click();

        var elm_new_version_platformName = element(by.css("md-input-container#new-version-input-container input"));
        elm_new_version_platformName.sendKeys(protractor.Key.ENTER);
        elm_new_version_platformName.sendKeys(data.change_platform_version);
        elm_new_version_platformName.sendKeys(protractor.Key.ENTER );

        utils.checkIfElementContainsText(element(by.css('[ng-click="change_platform_version(platform)"]')), data.change_platform_version);
    });
});
