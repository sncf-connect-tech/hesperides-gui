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

describe('Manage logical representation', () => {

    beforeEach(() =>
        // Clean up: deleting any existing deployed modules
        utils.putHttpRequest(hesperides_url+'/rest/applications/'+data.new_application+'/platforms',
                                    {application_name: data.new_application, platform_name: data.new_platform, application_version: data.new_platform_version, modules: [], production: false})
            .then(() => browser.get(hesperides_url+"/#/properties/"+data.new_application+"?platform="+data.new_platform) )
    );

    it('should add a logic representation (BOX MODE)', () => {
        // set box mode
        utils.clickOnElement(element(by.id("e2e-properties-show-box-mode-button")));
        // add first level
        utils.clickOnElement(element(by.id("e2e-box-properties-add-first-box-dialog-button")));
        element(by.id("e2e-add-box-new-logic-group-name")).sendKeys(data.logic_group_1);
        utils.clickOnElement(element(by.id("e2e-add-box-create-logic-group-button")));

        // add second level
        utils.clickOnElement(element(by.id("e2e-box-renderer-add-logic-group-button-"+data.logic_group_1)));
        element(by.id("e2e-add-box-new-logic-group-name")).sendKeys(data.logic_group_2);
        utils.clickOnElement(element(by.id("e2e-add-box-create-logic-group-button")));

        // add module
        utils.clickOnElement(element(by.id("e2e-box-renderer-add-module-button-"+data.logic_group_2)));
        var elm_module_name_input = element(by.css('md-autocomplete input#e2e-search-module-input-module-autocomplete'));
        elm_module_name_input.sendKeys(data.new_module_name+" "+data.new_module_version);
        utils.selectFirstElemOfAutocomplete(elm_module_name_input, true, true, 3500);
        utils.clickOnElement(element(by.id("e2e-search-module-add-module-button")));

        // add instance
        utils.clickOnElement(element(by.id('e2e-deployed-module-controls-add-instance-button-' + data.new_module_name)));
        element(by.id("e2e-add-instance-instance-name-input")).sendKeys(data.new_instance_name);

        element(by.id('e2e-add-instance-create-instance-button')).click().then(() => {
            element(by.id('e2e-box-renderer-edit-module-button-'+data.new_module_name)).isPresent().then((isPresent) => {
                expect(isPresent).toBe(true);
                utils.checkResponseStatusCode(hesperides_url+'/rest/files/applications/'+data.new_application+'/platforms/'+data.new_platform+'/%23'+data.logic_group_1+'%23'+data.logic_group_2+'/'+data.new_module_name+'/'+data.new_module_version+'/instances/'+data.new_instance_name+'?isWorkingCopy=true',200);
            })
        });

        // display/hide instance
        expect(element.all(by.id("e2e-instance-list-for-"+data.new_module_name)).count()).toEqual(0);
        utils.clickOnElement(element(by.id("md-button_show-all-instance-"+data.new_module_name)));
        utils.checkIfElementIsPresent("e2e-instance-list-for-"+data.new_module_name);
        utils.checkIfElementIsPresent("e2e-instance-"+data.new_module_name+"-"+data.new_instance_name);
        utils.clickOnElement(element(by.id("md-button_hide-all-instance-"+data.new_module_name)));
        expect(element.all(by.id("e2e-instance-list-for-"+data.new_module_name)).count()).toEqual(0);
    });

    it('should add a logic representation (TREE MODE)', () => {
        // set tree mode
        utils.clickOnElement(element(by.id("properties_show-tree-mode-button")));

        // add first level
        utils.clickOnElement(element(by.id("e2e-tree-properties-add-first-box-dialog-button")));
        element(by.id("e2e-add-box-new-logic-group-name")).sendKeys(data.logic_group_1);
        utils.clickOnElement(element(by.id("e2e-add-box-create-logic-group-button")));

        // to display buttons, mouse has to be on element
        utils.moveMouseOnElement("e2e-tree-renderer-edit-logic-group-"+data.logic_group_1,
                                 "e2e-tree-renderer-add-logic-group-button-"+data.logic_group_1);

        // add second level
        utils.clickOnElement(element(by.id("e2e-tree-renderer-add-logic-group-button-"+data.logic_group_1)));
        element(by.id("e2e-add-box-new-logic-group-name")).sendKeys(data.logic_group_2);
        utils.clickOnElement(element(by.id("e2e-add-box-create-logic-group-button")));

        // click on tree sign to show arbo
        utils.clickOnElement(element(by.id("e2e-tree-renderer-tree-sign-"+data.logic_group_2)));

        // to display buttons, mouse has to be on element
        utils.moveMouseOnElement("e2e-tree-renderer-edit-logic-group-"+data.logic_group_2,
                                 "e2e-tree-renderer-add-module-button-"+data.logic_group_2);

        // add module
        utils.clickOnElement(element(by.id("e2e-tree-renderer-add-module-button-"+data.logic_group_2)));
        var elm_module_name_input = element(by.css('md-autocomplete input#e2e-search-module-input-module-autocomplete'));
        elm_module_name_input.sendKeys(data.new_module_name+" "+data.new_module_version);
        utils.selectFirstElemOfAutocomplete(elm_module_name_input, true, true, 3500);
        browser.waitForAngular();//ajout pour que l'autocompletion soit prise en compte au moment du test
        utils.clickOnElement(element(by.id("e2e-search-module-add-module-button")));

        // to display buttons, mouse has to be on element
        utils.moveMouseOnElement("e2e-tree-renderer-edit-properties-module-button-"+data.new_module_name,
                                 'e2e-deployed-module-controls-add-instance-button-' + data.new_module_name);

        // add instance
        utils.clickOnElement(element(by.id('e2e-deployed-module-controls-add-instance-button-' + data.new_module_name)));
        element(by.id("e2e-add-instance-instance-name-input")).sendKeys(data.new_instance_name);

        element(by.id('e2e-add-instance-create-instance-button')).click().then(() => {
            element(by.id('e2e-tree-renderer-edit-properties-module-button-'+data.new_module_name)).isPresent().then((isPresent) => {
                expect(isPresent).toBe(true);
                utils.checkResponseStatusCode(hesperides_url+'/rest/files/applications/'+data.new_application+'/platforms/'+data.new_platform+'/%23'+data.logic_group_1+'%23'+data.logic_group_2+'/'+data.new_module_name+'/'+data.new_module_version+'/instances/'+data.new_instance_name+'?isWorkingCopy=true',200);
            })
        });
    });

    afterAll((done) => process.nextTick(done) );
});
