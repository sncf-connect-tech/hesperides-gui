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
var utils = require('../utils.js');

describe('Manage settings', function() {

    beforeAll(function() {
        console.log("START describe Manage settings");
        browser.get(hesperides_url+"/#/properties/"+data.new_application+"?platform="+data.new_platform);

        // set box mode
        var elm_box_mode = element(by.id("e2e-properties-show-box-mode-button"));
        utils.clickOnElement(elm_box_mode);
    });
    it('should test instance block display when set show mode instance by default', function() {
        // Check no instance is displayed for an application
        expect(element.all(by.css("#e2e-instance-list-for-"+data.new_module_name)).count()).toEqual(0);

        // enter in the settings panel
        utils.clickOnElement(element(by.id("e2e-navbar-settings")));

        var elm_switch_hide_show_instance = element(by.id("switch_hide-show-instance"));
        var elm_button_closeDialog = element(by.id("button_closeDialog"));
        var elm_button_saveSettings = element(by.id("button_saveSettings"));

        ////////////////////////////////////////////////////////////////////////////
        // * Show instance by defaults
        // Check switch "hide/show instance" is not checked
        expect(utils.hasClass(elm_switch_hide_show_instance, 'md-checked')).toBe(false);

        // Choose to show by default the instance.
        utils.clickOnElement(elm_switch_hide_show_instance);
        expect(utils.hasClass(elm_switch_hide_show_instance, 'md-checked')).toBe(true);
        utils.clickOnElement(elm_button_closeDialog);

        //Button clodeDialog don't valid the settings
        expect(element.all(by.id("e2e-instance-list-for-"+data.new_module_name)).count()).toEqual(0);

        // enter in the settings panel
        utils.clickOnElement(element(by.id("e2e-navbar-settings")));

        // Choose to show by default the instance.
        utils.clickOnElement(elm_switch_hide_show_instance);
        expect(utils.hasClass(elm_switch_hide_show_instance, 'md-checked')).toBe(true);
        utils.clickOnElement(elm_button_saveSettings);

        //Button saveSettings valid the settings
        expect(element.all(by.id("e2e-instance-list-for-"+data.new_module_name)).count()).toEqual(1);

    });
    it('should test instance block display when set hide mode instance by default', function() {

        // enter in the settings panel
        utils.clickOnElement(element(by.id("e2e-navbar-settings")));

        var elm_switch_hide_show_instance = element(by.id("switch_hide-show-instance"));
        var elm_button_closeDialog = element(by.id("button_closeDialog"));
        var elm_button_saveSettings = element(by.id("button_saveSettings"));

        ////////////////////////////////////////////////////////////////////////////
        // * Hide instance by defaults
        // Check switch "hide/show instance" is checked
        expect(utils.hasClass(elm_switch_hide_show_instance, 'md-checked')).toBe(true);

        // Choose to hide by default the instance.
        utils.clickOnElement(elm_switch_hide_show_instance);
        expect(utils.hasClass(elm_switch_hide_show_instance, 'md-checked')).toBe(false);
        utils.clickOnElement(elm_button_closeDialog);

        //Button clodeDialog don't valid the settings
        expect(element.all(by.css("#e2e-instance-list-for-"+data.new_module_name)).count()).toEqual(1);

        // enter in the settings panel
        utils.clickOnElement(element(by.id("e2e-navbar-settings")));

        // Choose to hide by default the instance.
        utils.clickOnElement(elm_switch_hide_show_instance);
        expect(utils.hasClass(elm_switch_hide_show_instance, 'md-checked')).toBe(false);
        utils.clickOnElement(elm_button_saveSettings);

        //Button saveSettings valid the settings
        expect(element.all(by.css("#e2e-instance-list-for-"+data.new_module_name)).count()).toEqual(0);
    });
    it('should test instance tree display when set show mode instance by default', function() {

        // enter in the settings panel
        utils.clickOnElement(element(by.id("e2e-navbar-settings")));

        var elm_switch_hide_show_instance = element(by.id("switch_hide-show-instance"));
        var elm_button_saveSettings = element(by.id("button_saveSettings"));
        var elm_button_sign_component = element(by.id("e2e-tree-renderer-tree-sign-"+data.logic_group_1));
        var elm_button_sign_techno = element(by.id("e2e-tree-renderer-tree-sign-"+data.logic_group_2));
        var elm_button_sign_module = element(by.id("e2e-tree-renderer-tree-sign-"+data.new_module_name));

        ////////////////////////////////////////////////////////////////////////////
        // * Show instance by defaults
        // Choose to show by default the instance.
        utils.clickOnElement(elm_switch_hide_show_instance);
        utils.clickOnElement(elm_button_saveSettings);

        // Display Tree mode
        utils.clickOnElement(element(by.id("properties_show-tree-mode-button")));

        // Check no instance is displayed for an application
        expect(element.all(by.css("#e2e-instance-tree-list-"+data.new_module_name)).count()).toEqual(0);

        // Quick display the plateform
        utils.clickOnElement(element(by.id("e2e-tree-properties-quick-display-button")));

        //Button saveSettings valid the settings
        expect(element.all(by.css("#e2e-instance-tree-list-"+data.new_module_name)).count()).toEqual(1);
        expect(element.all(by.css("#e2e-tree-renderer-edit-properties-"+data.new_instance_name+"-button")).count()).toEqual(1);

        // Sign Button are all to -
        utils.checkIfElementContainsText(elm_button_sign_component,"-");
        utils.checkIfElementContainsText(elm_button_sign_techno,"-");
        utils.checkIfElementContainsText(elm_button_sign_module,"-");

        // Clic on sign module button close only instance list
        utils.clickOnElement(elm_button_sign_module);

        expect(element.all(by.css("#e2e-instance-tree-list-"+data.new_module_name)).count()).toEqual(0);
        expect(element.all(by.css("#e2e-tree-renderer-edit-properties-"+data.new_instance_name+"-button")).count()).toEqual(0);

        // Sign Button are all to -
        utils.checkIfElementContainsText(elm_button_sign_component,"-");
        utils.checkIfElementContainsText(elm_button_sign_techno,"-");
        utils.checkIfElementContainsText(elm_button_sign_module,"+");

        // Clic on sign module button reopen only instance list
        utils.clickOnElement(elm_button_sign_module);

        expect(element.all(by.css("#e2e-instance-tree-list-"+data.new_module_name)).count()).toEqual(1);
        expect(element.all(by.css("#e2e-tree-renderer-edit-properties-"+data.new_instance_name+"-button")).count()).toEqual(1);

        // Sign Button are all to -
        utils.checkIfElementContainsText(elm_button_sign_component,"-");
        utils.checkIfElementContainsText(elm_button_sign_techno,"-");
        utils.checkIfElementContainsText(elm_button_sign_module,"-");

        // Quick hide the platform
        utils.clickOnElement(element(by.id("e2e-tree-properties-quick-display-button")));

        //Button saveSettings valid the settings
        expect(element.all(by.css("#e2e-instance-tree-list-"+data.new_module_name)).count()).toEqual(0);
        expect(element.all(by.css("#e2e-tree-renderer-edit-properties-"+data.new_instance_name+"-button")).count()).toEqual(0);

        // Sign Button are all to -
        utils.checkIfElementContainsText(elm_button_sign_component,"+");
        expect(element.all(by.id("e2e-tree-renderer-tree-sign-"+data.logic_group_2)).count()).toEqual(0);
        expect(element.all(by.id("e2e-tree-renderer-tree-sign-"+data.new_module_name)).count()).toEqual(0);

        // Re Quick display the plateform
        utils.clickOnElement(element(by.id("e2e-tree-properties-quick-display-button")));

        //Button saveSettings valid the settings
        expect(element.all(by.css("#e2e-instance-tree-list-"+data.new_module_name)).count()).toEqual(1);
        expect(element.all(by.css("#e2e-tree-renderer-edit-properties-"+data.new_instance_name+"-button")).count()).toEqual(1);

        // Sign Button are all to -
        utils.checkIfElementContainsText(elm_button_sign_component,"-");
        utils.checkIfElementContainsText(elm_button_sign_techno,"-");
        utils.checkIfElementContainsText(elm_button_sign_module,"-");
    });
    it('should test instance tree display when set hide mode instance by default', function() {
        // enter in the settings panel
        utils.clickOnElement(element(by.id("e2e-navbar-settings")));

        var elm_switch_hide_show_instance = element(by.id("switch_hide-show-instance"));
        var elm_button_saveSettings = element(by.id("button_saveSettings"));
        var elm_button_sign_component = element(by.id("e2e-tree-renderer-tree-sign-"+data.logic_group_1));
        var elm_button_sign_techno = element(by.id("e2e-tree-renderer-tree-sign-"+data.logic_group_2));
        var elm_button_sign_module = element(by.id("e2e-tree-renderer-tree-sign-"+data.new_module_name));

        ////////////////////////////////////////////////////////////////////////////
        // * Hide instance by defaults
        // Choose to show by default the instance.
        utils.clickOnElement(elm_switch_hide_show_instance);
        utils.clickOnElement(elm_button_saveSettings);

        // Display Tree mode
        utils.clickOnElement(element(by.id("properties_show-tree-mode-button")));

        // Check no instance is displayed for an application
        expect(element.all(by.css("#e2e-instance-tree-list-"+data.new_module_name)).count()).toEqual(0);

        // Quick display the plateform
        utils.clickOnElement(element(by.id("e2e-tree-properties-quick-display-button")));

        //Button saveSettings valid the settings
        expect(element.all(by.css("#e2e-instance-tree-list-"+data.new_module_name)).count()).toEqual(0);
        expect(element.all(by.css("#e2e-tree-renderer-edit-properties-"+data.new_instance_name+"-button")).count()).toEqual(0);

        // Sign Button are all to -
        utils.checkIfElementContainsText(elm_button_sign_component,"-");
        utils.checkIfElementContainsText(elm_button_sign_techno,"-");
        utils.checkIfElementContainsText(elm_button_sign_module,"+");

        // Clic on sign module button close only instance list
        utils.clickOnElement(elm_button_sign_module);

        expect(element.all(by.css("#e2e-instance-tree-list-"+data.new_module_name)).count()).toEqual(1);
        expect(element.all(by.css("#e2e-tree-renderer-edit-properties-"+data.new_instance_name+"-button")).count()).toEqual(1);

        // Sign Button are all to -
        utils.checkIfElementContainsText(elm_button_sign_component,"-");
        utils.checkIfElementContainsText(elm_button_sign_techno,"-");
        utils.checkIfElementContainsText(elm_button_sign_module,"-");

        // Clic on sign module button reopen only instance list
        utils.clickOnElement(elm_button_sign_module);

        expect(element.all(by.css("#e2e-instance-tree-list-"+data.new_module_name)).count()).toEqual(0);
        expect(element.all(by.css("#e2e-tree-renderer-edit-properties-"+data.new_instance_name+"-button")).count()).toEqual(0);

        // Sign Button are all to -
        utils.checkIfElementContainsText(elm_button_sign_component,"-");
        utils.checkIfElementContainsText(elm_button_sign_techno,"-");
        utils.checkIfElementContainsText(elm_button_sign_module,"+");

        // To check save of display instance after quick hide instance list
        // Clic on sign module button reopen only instance list
        utils.clickOnElement(elm_button_sign_module);

        // Quick hide the platform
        utils.clickOnElement(element(by.id("e2e-tree-properties-quick-display-button")));

        //Button saveSettings valid the settings
        expect(element.all(by.css("#e2e-instance-tree-list-"+data.new_module_name)).count()).toEqual(0);
        expect(element.all(by.css("#e2e-tree-renderer-edit-properties-"+data.new_instance_name+"-button")).count()).toEqual(0);

        // Sign Button are all to -
        utils.checkIfElementContainsText(elm_button_sign_component,"+");
        expect(element.all(by.id("e2e-tree-renderer-tree-sign-"+data.logic_group_2)).count()).toEqual(0);
        expect(element.all(by.id("e2e-tree-renderer-tree-sign-"+data.new_module_name)).count()).toEqual(0);

        // Re Quick display the plateform
        utils.clickOnElement(element(by.id("e2e-tree-properties-quick-display-button")));

        //Button saveSettings valid the settings
        expect(element.all(by.css("#e2e-instance-tree-list-"+data.new_module_name)).count()).toEqual(1);
        expect(element.all(by.css("#e2e-tree-renderer-edit-properties-"+data.new_instance_name+"-button")).count()).toEqual(1);

        // Sign Button are all to -
        utils.checkIfElementContainsText(elm_button_sign_component,"-");
        utils.checkIfElementContainsText(elm_button_sign_techno,"-");
        utils.checkIfElementContainsText(elm_button_sign_module,"-");
    });
    it('should set activate copy property instance by default', function() {
        // Display Block mode
        utils.clickOnElement(element(by.id("e2e-properties-show-box-mode-button")));

        // Display instance
        utils.clickOnElement(element(by.id("md-button_show-all-instance-"+data.new_module_name)));
        var elem_update_instance = element(by.id("e2e-deployed-module-controls-update-version-button-"+data.new_module_name));

        // enter in the settings panel
        utils.clickOnElement(element(by.id("e2e-navbar-settings")));

        var elm_switch_copyInstance = element(by.id("switch_copy-instance"));
        var elm_button_closeDialog = element(by.id("button_closeDialog"));
        var elm_button_saveSettings = element(by.id("button_saveSettings"));

        ////////////////////////////////////////////////////////////////////////////
        // * Activate copy property instance by defaults
        // Check switch "active default option copy properties from application" is not checked
        expect(utils.hasClass(elm_switch_copyInstance, 'md-checked')).toBe(false);

        // Choose to copy by default the property of the instance.
        utils.clickOnElement(elm_switch_copyInstance);
        expect(utils.hasClass(elm_switch_copyInstance, 'md-checked')).toBe(true);
        utils.clickOnElement(elm_button_closeDialog);

        //Button clodeDialog don't valid the settings
        utils.clickOnElement(elem_update_instance);

        var elm_moduleFrom = element(by.css('md-autocomplete input#change-module-version-from_input-module-autocomplete'));
        elm_moduleFrom.sendKeys(data.new_module_version);
        browser.waitForAngular();

        browser.driver.findElements(by.css('.md-autocomplete-suggestions li')).
        then(function(elems) {
                utils.clickOnElement(elems[0]);
            }
        );
        expect(utils.hasClass(element(by.id("switch_copy-property-from-instance")), 'md-checked')).toBe(false);
        utils.clickOnElement(element(by.id('button_closeDialog')));

        // enter in the settings panel
        utils.clickOnElement(element(by.id("e2e-navbar-settings")));

        // Choose to copy by default the property of the instance.
        utils.clickOnElement(elm_switch_copyInstance);
        expect(utils.hasClass(elm_switch_copyInstance, 'md-checked')).toBe(true);
        utils.clickOnElement(elm_button_saveSettings);

        //Button saveSettings valid the settings
        utils.clickOnElement(elem_update_instance);

        var elm_moduleFrom = element(by.css('md-autocomplete input#change-module-version-from_input-module-autocomplete'));
        elm_moduleFrom.sendKeys(data.new_module_version);
        browser.waitForAngular();

        browser.driver.findElements(by.css('.md-autocomplete-suggestions li')).
        then(function(elems) {
                utils.clickOnElement(elems[0]);
            }
        );
        expect(utils.hasClass(element(by.id("switch_copy-property-from-instance")), 'md-checked')).toBe(true);
        utils.clickOnElement(element(by.id('button_closeDialog')));
    });
    it('should set deactivate copy property instance by default', function() {
        ////////////////////////////////////////////////////////////////////////////
        // * Deactivate copy property instance by defaults

        // Display Block mode
        utils.clickOnElement(element(by.id("e2e-properties-show-box-mode-button")));

        // Display instance
        utils.clickOnElement(element(by.id("md-button_show-all-instance-"+data.new_module_name)));
        var elem_update_instance = element(by.id("e2e-deployed-module-controls-update-version-button-"+data.new_module_name));

        // enter in the settings panel
        // Check switch "active default option copy properties from application" is checked
        utils.clickOnElement(element(by.id("e2e-navbar-settings")));

        var elm_switch_copyInstance = element(by.id("switch_copy-instance"));
        var elm_button_closeDialog = element(by.id("button_closeDialog"));
        var elm_button_saveSettings = element(by.id("button_saveSettings"));

        expect(utils.hasClass(elm_switch_copyInstance, 'md-checked')).toBe(true);

        // Choose to not copy by default the property of the instance.
        utils.clickOnElement(elm_switch_copyInstance);
        expect(utils.hasClass(elm_switch_copyInstance, 'md-checked')).toBe(false);
        utils.clickOnElement(elm_button_closeDialog);

        //Button clodeDialog don't valid the settings
        utils.clickOnElement(elem_update_instance);

        var elm_moduleFrom = element(by.css('md-autocomplete input#change-module-version-from_input-module-autocomplete'));
        elm_moduleFrom.sendKeys(data.new_module_version);
        browser.waitForAngular();

        browser.driver.findElements(by.css('.md-autocomplete-suggestions li')).
        then(function(elems) {
                utils.clickOnElement(elems[0]);
            }
        );
        expect(utils.hasClass(element(by.id("switch_copy-property-from-instance")), 'md-checked')).toBe(true);
        utils.clickOnElement(element(by.id('button_closeDialog')));

        // enter in the settings panel
        utils.clickOnElement(element(by.id("e2e-navbar-settings")));

        // Choose to not copy by default the property of the instance.
        utils.clickOnElement(elm_switch_copyInstance);
        expect(utils.hasClass(elm_switch_copyInstance, 'md-checked')).toBe(false);
        utils.clickOnElement(elm_button_saveSettings);

        //Button saveSettings valid the settings
        utils.clickOnElement(elem_update_instance);

        var elm_moduleFrom = element(by.css('md-autocomplete input#change-module-version-from_input-module-autocomplete'));
        elm_moduleFrom.sendKeys(data.new_module_version);
        browser.waitForAngular();

        browser.driver.findElements(by.css('.md-autocomplete-suggestions li')).
        then(function(elems) {
                utils.clickOnElement(elems[0]);
            }
        );
        expect(utils.hasClass(element(by.id("switch_copy-property-from-instance")), 'md-checked')).toBe(false);
        utils.clickOnElement(element(by.id('button_closeDialog')));
    });
    it('should set french language by default', function() {
        // Define flag element, and set by default English
        var elm_flag_en = element(by.id("e2e-navbar-lang-en"));
        var elm_help_menu = element(by.id('e2e-navbar-help'));
        var elm_panel_settings = element(by.id("e2e-navbar-settings"));

        utils.clickOnElement(elm_flag_en);
        expect(elm_help_menu.getText()).toEqual(data.help_label);

        // enter in the settings panel
        utils.clickOnElement(elm_panel_settings);

        var elm_button_language_en = element(by.id("radio-button_language-en"));
        var elm_button_language_fr = element(by.id("radio-button_language-fr"));
        var elm_button_closeDialog = element(by.id("button_closeDialog"));
        var elm_button_saveSettings = element(by.id("button_saveSettings"));

        ////////////////////////////////////////////////////////////////////////////
        // * Select French language by default with settings panel
        // Check english language is selected
        expect(utils.hasClass(elm_button_language_en, 'md-checked')).toBe(true);
        expect(utils.hasClass(elm_button_language_fr, 'md-checked')).toBe(false);

        // Choose to show by default the instance.
        utils.clickOnElement(elm_button_language_fr);
        expect(utils.hasClass(elm_button_language_en, 'md-checked')).toBe(false);
        expect(utils.hasClass(elm_button_language_fr, 'md-checked')).toBe(true);
        utils.clickOnElement(elm_button_closeDialog);

        //Button clodeDialog don't valid the settings
        expect(elm_help_menu.getText()).toEqual(data.help_label);

        // enter in the settings panel
        utils.clickOnElement(element(by.id("e2e-navbar-settings")));

        // Choose to show by default the instance.
        utils.clickOnElement(elm_button_language_fr);
        expect(utils.hasClass(elm_button_language_en, 'md-checked')).toBe(false);
        expect(utils.hasClass(elm_button_language_fr, 'md-checked')).toBe(true);
        utils.clickOnElement(elm_button_saveSettings);

        //Button saveSettings valid the settings
        expect(elm_help_menu.getText()).toEqual(data.aide_label);

    });
    it('should set english language by default', function() {
        // enter in the settings panel
        utils.clickOnElement(element(by.id("e2e-navbar-settings")));

        var elm_flag_en = element(by.id("e2e-navbar-lang-en"));
        var elm_flag_fr = element(by.id("e2e-navbar-lang-fr"));
        var elm_help_menu = element(by.id('e2e-navbar-help'));

        var elm_button_language_en = element(by.id("radio-button_language-en"));
        var elm_button_language_fr = element(by.id("radio-button_language-fr"));
        var elm_button_closeDialog = element(by.id("button_closeDialog"));
        var elm_button_saveSettings = element(by.id("button_saveSettings"));

        ////////////////////////////////////////////////////////////////////////////
        // * Select English language by default with settings panel
        // Check french language is selected
        expect(utils.hasClass(elm_button_language_en, 'md-checked')).toBe(false);
        expect(utils.hasClass(elm_button_language_fr, 'md-checked')).toBe(true);

        // Choose english language
        utils.clickOnElement(elm_button_language_en);
        expect(utils.hasClass(elm_button_language_en, 'md-checked')).toBe(true);
        expect(utils.hasClass(elm_button_language_fr, 'md-checked')).toBe(false);
        utils.clickOnElement(elm_button_closeDialog);

        //Button clodeDialog don't valid the settings
        expect(elm_help_menu.getText()).toEqual(data.aide_label);

        // enter in the settings panel
        utils.clickOnElement(element(by.id("e2e-navbar-settings")));

        // Choose english language
        utils.clickOnElement(elm_button_language_en);
        expect(utils.hasClass(elm_button_language_en, 'md-checked')).toBe(true);
        expect(utils.hasClass(elm_button_language_fr, 'md-checked')).toBe(false);
        utils.clickOnElement(elm_button_saveSettings);

        //Button saveSettings valid the settings
        expect(elm_help_menu.getText()).toEqual(data.help_label);

        ////////////////////////////////////////////////////////////////////////////
        // * Select French language by default with main page shortcut flag
        utils.clickOnElement(elm_flag_fr);
        expect(elm_help_menu.getText()).toEqual(data.aide_label);

        // enter in the settings panel
        utils.clickOnElement(element(by.id("e2e-navbar-settings")));

        // Check french language is selected
        expect(utils.hasClass(elm_button_language_en, 'md-checked')).toBe(false);
        expect(utils.hasClass(elm_button_language_fr, 'md-checked')).toBe(true);

        utils.clickOnElement(elm_button_closeDialog);

        ////////////////////////////////////////////////////////////////////////////
        // * Select English language by default with main page shortcut flag
        utils.clickOnElement(elm_flag_en);
        expect(elm_help_menu.getText()).toEqual(data.help_label);

        // enter in the settings panel
        utils.clickOnElement(element(by.id("e2e-navbar-settings")));

        // Check french language is selected
        expect(utils.hasClass(elm_button_language_en, 'md-checked')).toBe(true);
        expect(utils.hasClass(elm_button_language_fr, 'md-checked')).toBe(false);

        utils.clickOnElement(elm_button_closeDialog);
    });
    afterAll(function(done) {
        process.nextTick(done);
    });
});
