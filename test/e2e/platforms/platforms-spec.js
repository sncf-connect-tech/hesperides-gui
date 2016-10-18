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

var rest = require('restling');
var vsct_utils = require('../lib/lib.js');

describe('Manage platforms', function() {

    beforeAll(function() {
        console.log("START describe Manage platforms");
        browser.get(hesperides_url);
        // delete platform on hesperides for cleaning
        var path_to_platform = hesperides_url+'/rest/applications/'+data.new_application+'/platforms/'+data.new_platform;
        vsct_utils.deleteHttpRequest(path_to_platform,200,rest_options);

        var path_to_platform_from = hesperides_url+'/rest/applications/'+data.new_application+'/platforms/'+data.new_platform+'_from';
        vsct_utils.deleteHttpRequest(path_to_platform_from,200,rest_options);
    });
    it('should create platform', function() {
        var elm_applicationMenu = element(by.id("menu_application-menu"));
        vsct_utils.clickOnElement(elm_applicationMenu);
        var elm_createPlatformMenu = element(by.id("menu_application-create-menu"));
        vsct_utils.clickOnElement(elm_createPlatformMenu);
        
        // fill in fields
        var elm_platformApplication = element(by.id('platformApplication'));
        elm_platformApplication.sendKeys(data.new_application);
        var elm_platformName = element(by.id('platformName'));
        elm_platformName.sendKeys(data.new_platform);
        var elm_platformApplicationVersion = element(by.id('platformApplicationVersion'));
        elm_platformApplicationVersion.sendKeys(data.new_platform_version);

        vsct_utils.clickToCreateAndCheckIfReallyCreated('platform-menu-modal_create-button','properties_show-platform-event-button',hesperides_url+'/rest/applications/'+data.new_application+'/platforms/'+data.new_platform);

    });
    it('should find platform on autocomplete in menu "applications"', function() {
        var elm_applicationMenu = element(by.id("menu_application-menu"));
        vsct_utils.clickOnElement(elm_applicationMenu);

        var input_autocomplete_applications = element(by.id("input-4"));
        input_autocomplete_applications.sendKeys(data.new_application);
        browser.waitForAngular();//ajout pour que l'autocompletion soit prise en compte au moment du test

        browser.driver.findElements(by.css('.md-autocomplete-suggestions li')).
            then(function(elems) {
                expect(elems.length).toBeGreaterThan(0);
            }
        );
    });
    it('should create platform from an existing one', function() {
        var elm_applicationMenu = element(by.id("menu_application-menu"));
        vsct_utils.clickOnElement(elm_applicationMenu);
        var elm_createPlatformFromMenu = element(by.id("menu_application-create-from-menu"));
        vsct_utils.clickOnElement(elm_createPlatformFromMenu);
        
        var elm_platformApplication = element(by.id('platformApplication'));
        elm_platformApplication.sendKeys(data.new_application);
        var elm_platformName = element(by.id('platformName'));
        elm_platformName.sendKeys(data.new_platform+"_from");
        var elm_platformApplicationVersion = element(by.id('platformApplicationVersion'));
        elm_platformApplicationVersion.sendKeys(data.new_platform_version+"_from");

        var elm_applicationNameFrom = element(by.css('md-autocomplete input#platform-menu-modal-from_input-application-autocomplete'));
        elm_applicationNameFrom.sendKeys(data.new_application);
        vsct_utils.selectFirstElemOfAutocomplete(elm_applicationNameFrom, false, true, 3500);
        browser.waitForAngular();//ajout pour que l'autocompletion soit prise en compte au moment du test

        var elm_platformNameFrom = element(by.css('md-autocomplete input#platform-menu-modal-from_input-platform-autocomplete'));
        elm_platformNameFrom.sendKeys(data.new_platform);
        vsct_utils.selectFirstElemOfAutocomplete(elm_platformNameFrom, false, true, 3500);
        browser.waitForAngular();//ajout pour que l'autocompletion soit prise en compte au moment du test

        vsct_utils.clickToCreateAndCheckIfReallyCreated('platform-menu-modal-from_from-button','properties_show-platform-event-button',hesperides_url+'/rest/applications/'+data.new_application+'/platforms/'+data.new_platform+'_from');

    });
    it('should filter platforms correctly', function() {
        browser.get(hesperides_url+"/#/properties/"+data.new_application);

        var elm_filter_platform_input = element(by.id("properties_platform-filter-input"));
        elm_filter_platform_input.sendKeys(data.new_application);

        browser.driver.findElements(by.css('.shared-list-inline li')).
            then(function(elems) {
                expect(elems.length).toBeGreaterThan(0);
            }
        );
    });
});
