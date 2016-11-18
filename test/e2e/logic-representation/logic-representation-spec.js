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

describe('Manage logical representation', function() {

    beforeAll(function() {
        console.log("START describe Manage logical representation");
        browser.get(hesperides_url+"/#/properties/"+data.new_application+"?platform="+data.new_platform);
    });
    it('should add a logic representation (BOX MODE)', function() {
        
        // set box mode
        var elm_box_mode = element(by.id("properties_show-box-mode-button"));
        vsct_utils.clickOnElement(elm_box_mode);
        // add first level
        var elm_add_logical_group_1 = element(by.id("box-properties_add-first-box-dialog-button"));
        vsct_utils.clickOnElement(elm_add_logical_group_1);
        var elm_logic_group_name_input_1 = element(by.id("add-box_new-logic-group-name"));
        elm_logic_group_name_input_1.sendKeys(data.logic_group_1);
        var elm_modal_create_logical_group = element(by.id("add-box_create-logic-group-button"));
        vsct_utils.clickOnElement(elm_modal_create_logical_group);

        // add second level
        var elm_add_logical_group_2 = element(by.id("box-renderer_add-logic-group-button-"+data.logic_group_1));
        vsct_utils.clickOnElement(elm_add_logical_group_2);
        var elm_logic_group_name_input_2 = element(by.id("add-box_new-logic-group-name"));
        elm_logic_group_name_input_2.sendKeys(data.logic_group_2);
        vsct_utils.clickOnElement(elm_modal_create_logical_group);

        // add module
        var elm_add_module = element(by.id("box-renderer_add-module-button-"+data.logic_group_2));
        vsct_utils.clickOnElement(elm_add_module);
        var elm_module_name_input = element(by.css('md-autocomplete input#search-module_input-module-autocomplete'));
        elm_module_name_input.sendKeys(data.new_module_name+" "+data.new_module_version);
        vsct_utils.selectFirstElemOfAutocomplete(elm_module_name_input, true, true, 3500);
        var elm_modal_create_module_button = element(by.id("search-module_add-module-button"));
        vsct_utils.clickOnElement(elm_modal_create_module_button);

        // add instance
        var elm_add_instance = element(by.id("property-tool-button_add-instance-button-"+data.new_module_name));
        vsct_utils.clickOnElement(elm_add_instance);
        var elm_instance_name = element(by.id("add-instance_instance-name-input"));
        elm_instance_name.sendKeys(data.new_instance_name);

        vsct_utils.clickToCreateAndCheckIfReallyCreated('add-instance_create-instance-button','box-renderer_editmodule-button-'+data.new_module_name,hesperides_url+'/rest/files/applications/'+data.new_application+'/platforms/'+data.new_platform+'/%23'+data.logic_group_1+'%23'+data.logic_group_2+'/'+data.new_module_name+'/'+data.new_module_version+'/instances/'+data.new_instance_name+'?isWorkingCopy=true');

        // display/hide instance
        expect(element.all(by.css("#div_instance-list-"+data.new_module_name)).count()).toEqual(0);
        vsct_utils.clickOnElement(element(by.id("md-button_show-all-instance-"+data.new_module_name)));
        vsct_utils.checkIfElementIsPresent("div_instance-list-"+data.new_module_name);
        vsct_utils.checkIfElementIsPresent("div_instance-"+data.new_module_name+"-"+data.new_instance_name);
        vsct_utils.clickOnElement(element(by.id("md-button_hide-all-instance-"+data.new_module_name)));
        expect(element.all(by.css("#div_instance-list-"+data.new_module_name)).count()).toEqual(0);

    });
    it('should add a logic representation (TREE MODE)', function() {

        // set tree mode
        var elm_tree_mode = element(by.id("properties_show-tree-mode-button"));
        vsct_utils.clickOnElement(elm_tree_mode);

        // add first level
        var elm_add_logical_group_1 = element(by.id("tree-properties_add-first-box-dialog-button"));
        vsct_utils.clickOnElement(elm_add_logical_group_1);
        var elm_logic_group_name_input_1 = element(by.id("add-box_new-logic-group-name"));
        elm_logic_group_name_input_1.sendKeys(data.logic_group_1);
        var elm_modal_create_logical_group = element(by.id("add-box_create-logic-group-button"));
        vsct_utils.clickOnElement(elm_modal_create_logical_group);

        // to display buttons, mouse has to be on element
        vsct_utils.moveMouseOnElement("tree-renderer_edit-logic-group-"+data.logic_group_1,2000);

        // add second level
        var elm_add_logical_group_2 = element(by.id("tree-renderer_add-logic-group-button-"+data.logic_group_1));
        vsct_utils.clickOnElement(elm_add_logical_group_2);
        var elm_logic_group_name_input_2 = element(by.id("add-box_new-logic-group-name"));
        elm_logic_group_name_input_2.sendKeys(data.logic_group_2);
        vsct_utils.clickOnElement(elm_modal_create_logical_group);

        // click on tree sign to show arbo
        var elm_tree_sign_1 = element(by.id("tree-renderer_tree-sign-"+data.logic_group_1));
        vsct_utils.clickOnElement(elm_tree_sign_1);

        // to display buttons, mouse has to be on element
        vsct_utils.moveMouseOnElement("tree-renderer_edit-logic-group-"+data.logic_group_2,2000);

        // add module
        var elm_add_module = element(by.id("tree-renderer_add-module-button-"+data.logic_group_2));
        vsct_utils.clickOnElement(elm_add_module);
        var elm_module_name_input = element(by.css('md-autocomplete input#search-module_input-module-autocomplete'));
        elm_module_name_input.sendKeys(data.new_module_name+" "+data.new_module_version);
        vsct_utils.selectFirstElemOfAutocomplete(elm_module_name_input, true, true, 3500);
        browser.waitForAngular();//ajout pour que l'autocompletion soit prise en compte au moment du test
        var elm_modal_create_module_button = element(by.id("search-module_add-module-button"));
        vsct_utils.clickOnElement(elm_modal_create_module_button);

        // click on tree sign to show arbo
        var elm_tree_sign_2 = element(by.id("tree-renderer_tree-sign-"+data.logic_group_2));
        vsct_utils.clickOnElement(elm_tree_sign_2);

        // to display buttons, mouse has to be on element
        vsct_utils.moveMouseOnElement("tree-renderer_edit-properties-module-button-"+data.new_module_name,2000);

        // add instance
        var elm_add_instance = element(by.id("property-tool-button_add-instance-button-"+data.new_module_name));
        vsct_utils.clickOnElement(elm_add_instance);
        var elm_instance_name = element(by.id("add-instance_instance-name-input"));
        elm_instance_name.sendKeys(data.new_instance_name);

        vsct_utils.clickToCreateAndCheckIfReallyCreated('add-instance_create-instance-button','tree-renderer_edit-properties-module-button-'+data.new_module_name,hesperides_url+'/rest/files/applications/'+data.new_application+'/platforms/'+data.new_platform+'/%23'+data.logic_group_1+'%23'+data.logic_group_2+'/'+data.new_module_name+'/'+data.new_module_version+'/instances/'+data.new_instance_name+'?isWorkingCopy=true');
    });
    afterAll(function(done) {
        process.nextTick(done);
    });
});
