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

describe('Manage settings', () => {
    beforeEach(() => {
        browser.get(`${ hesperides_url }/#/properties/${ data.new_application }?platform=${ data.new_platform }`);
        // #nomorebloc utils.clickOnElement(element(by.id('e2e-properties-show-box-mode-button')));
        utils.resetDisplayInstancesByDefaultSettingToDefaultValue();
    });

    it('should not display instances of a platform by default', () => {
        expect(element.all(by.id(`e2e-instance-list-for-${ data.new_module_name }`)).count()).toEqual(0);
    });

    it('should display instances of a platform by default when the corresponding setting entry is set', () => {
        // enter in the settings panel
        utils.clickOnElement(element(by.id('e2e-navbar-settings')));

        var switchDisplayInstancesByDefault = element(by.id('e2e-modal-settings-switch-unfold-instances-by-default'));

        // Choose to show by default the instance.
        utils.clickOnElement(switchDisplayInstancesByDefault);
        expect(utils.hasClass(switchDisplayInstancesByDefault, 'md-checked')).toBe(true);
        utils.clickOnElement(element(by.id('e2e-modal-settings-button-close')));

        // Button clodeDialog don't valid the settings
        expect(element.all(by.id(`e2e-instance-list-for-${ data.new_module_name }`)).count()).toEqual(0);

        // enter in the settings panel
        utils.clickOnElement(element(by.id('e2e-navbar-settings')));
        expect(utils.hasClass(switchDisplayInstancesByDefault, 'md-checked')).toBe(false);

        // Choose to show by default the instance.
        utils.clickOnElement(switchDisplayInstancesByDefault);
        expect(utils.hasClass(switchDisplayInstancesByDefault, 'md-checked')).toBe(true);
        utils.clickOnElement(element(by.id('e2e-modal-settings-button-save')));

        expect(element.all(by.id(`e2e-instance-list-for-${ data.new_module_name }`)).count()).toEqual(1);
    });

    // it('should not display instances of a platform by default (TREE MODE)', () => {
    //     // Display Tree mode
    //     // #nomorebloc utils.clickOnElement(element(by.id('e2e-properties-show-tree-mode-button')));
    //
    //     expect(element.all(by.id(`e2e-tree-renderer-edit-module-button-${ data.new_module_name }`)).count()).toEqual(1);
    //     expect(element.all(by.id(`e2e-instance-list-for-${ data.new_module_name }`)).count()).toEqual(0);
    //     expect(element.all(by.id(`e2e-tree-renderer-edit-instance-button-${ data.new_instance_name }`)).count()).toEqual(0);
    //
    //     utils.clickOnElement(element(by.id('e2e-tree-properties-quick-display-button')));
    //     utils.clickOnElement(element(by.id('e2e-tree-properties-quick-display-button')));
    //
    //     expect(element.all(by.id(`e2e-tree-renderer-edit-module-button-${ data.new_module_name }`)).count()).toEqual(1);
    //     expect(element.all(by.id(`e2e-instance-list-for-${ data.new_module_name }`)).count()).toEqual(0);
    //     expect(element.all(by.id(`e2e-tree-renderer-edit-instance-button-${ data.new_instance_name }`)).count()).toEqual(0);
    //
    //     var treeButtonSignComponent = element(by.id(`e2e-tree-renderer-tree-sign-${ data.logic_group_1 }`));
    //     var treeButtonSignTechno = element(by.id(`e2e-tree-renderer-tree-sign-${ data.logic_group_2 }`));
    //     var treeButtonSignModule = element(by.id(`e2e-tree-renderer-tree-sign-${ data.new_module_name }`));
    //
    //     utils.checkIfElementContainsText(treeButtonSignComponent, '-');
    //     utils.checkIfElementContainsText(treeButtonSignTechno, '-');
    //     utils.checkIfElementContainsText(treeButtonSignModule, '+');
    //
    //     utils.clickOnElement(treeButtonSignModule);
    //
    //     expect(element.all(by.id(`e2e-tree-renderer-edit-module-button-${ data.new_module_name }`)).count()).toEqual(1);
    //     expect(element.all(by.id(`e2e-instance-list-for-${ data.new_module_name }`)).count()).toEqual(1);
    //     expect(element.all(by.id(`e2e-tree-renderer-edit-instance-button-${ data.new_instance_name }`)).count()).toEqual(1);
    //
    //     utils.checkIfElementContainsText(treeButtonSignComponent, '-');
    //     utils.checkIfElementContainsText(treeButtonSignTechno, '-');
    //     utils.checkIfElementContainsText(treeButtonSignModule, '-');
    //
    //     utils.clickOnElement(treeButtonSignModule);
    //
    //     expect(element.all(by.id(`e2e-tree-renderer-edit-module-button-${ data.new_module_name }`)).count()).toEqual(1);
    //     expect(element.all(by.id(`e2e-instance-list-for-${ data.new_module_name }`)).count()).toEqual(0);
    //     expect(element.all(by.id(`e2e-tree-renderer-edit-instance-button-${ data.new_instance_name }`)).count()).toEqual(0);
    //
    //     utils.checkIfElementContainsText(treeButtonSignComponent, '-');
    //     utils.checkIfElementContainsText(treeButtonSignTechno, '-');
    //     utils.checkIfElementContainsText(treeButtonSignModule, '+');
    //
    //     utils.clickOnElement(treeButtonSignModule);
    //
    //     utils.clickOnElement(element(by.id('e2e-tree-properties-quick-display-button')));
    //
    //     expect(element.all(by.id(`e2e-tree-renderer-edit-module-button-${ data.new_module_name }`)).count()).toEqual(0);
    //     expect(element.all(by.id(`e2e-instance-list-for-${ data.new_module_name }`)).count()).toEqual(0);
    //     expect(element.all(by.id(`e2e-tree-renderer-edit-instance-button-${ data.new_instance_name }`)).count()).toEqual(0);
    //
    //     utils.checkIfElementContainsText(treeButtonSignComponent, '+');
    //     expect(element.all(by.id(`e2e-tree-renderer-tree-sign-${ data.logic_group_2 }`)).count()).toEqual(0);
    //     expect(element.all(by.id(`e2e-tree-renderer-tree-sign-${ data.new_module_name }`)).count()).toEqual(0);
    //
    //     utils.clickOnElement(element(by.id('e2e-tree-properties-quick-display-button')));
    //
    //     expect(element.all(by.id(`e2e-tree-renderer-edit-module-button-${ data.new_module_name }`)).count()).toEqual(1);
    //     expect(element.all(by.id(`e2e-instance-list-for-${ data.new_module_name }`)).count()).toEqual(0);
    //     expect(element.all(by.id(`e2e-tree-renderer-edit-instance-button-${ data.new_instance_name }`)).count()).toEqual(0);
    //
    //     utils.checkIfElementContainsText(treeButtonSignComponent, '-');
    //     utils.checkIfElementContainsText(treeButtonSignTechno, '-');
    //     utils.checkIfElementContainsText(treeButtonSignModule, '+');
    // });
    //
    // it('should display instances of a platform by default when the corresponding setting entry is set (TREE MODE)', () => {
    //     // Choose to show by default the instance.
    //     utils.clickOnElement(element(by.id('e2e-navbar-settings')));
    //     utils.clickOnElement(element(by.id('e2e-modal-settings-switch-unfold-instances-by-default')));
    //     utils.clickOnElement(element(by.id('e2e-modal-settings-button-save')));
    //
    //     // Display Tree mode
    //     // #nomorebloc utils.clickOnElement(element(by.id('e2e-properties-show-tree-mode-button')));
    //
    //     expect(element.all(by.id(`e2e-tree-renderer-edit-module-button-${ data.new_module_name }`)).count()).toEqual(1);
    //     expect(element.all(by.id(`e2e-instance-list-for-${ data.new_module_name }`)).count()).toEqual(1);
    //     expect(element.all(by.id(`e2e-tree-renderer-edit-instance-button-${ data.new_instance_name }`)).count()).toEqual(1);
    //
    //     utils.clickOnElement(element(by.id('e2e-tree-properties-quick-display-button')));
    //     utils.clickOnElement(element(by.id('e2e-tree-properties-quick-display-button')));
    //
    //     expect(element.all(by.id(`e2e-tree-renderer-edit-module-button-${ data.new_module_name }`)).count()).toEqual(1);
    //     expect(element.all(by.id(`e2e-instance-list-for-${ data.new_module_name }`)).count()).toEqual(1);
    //     expect(element.all(by.id(`e2e-tree-renderer-edit-instance-button-${ data.new_instance_name }`)).count()).toEqual(1);
    //
    //     var treeButtonSignComponent = element(by.id(`e2e-tree-renderer-tree-sign-${ data.logic_group_1 }`));
    //     var treeButtonSignTechno = element(by.id(`e2e-tree-renderer-tree-sign-${ data.logic_group_2 }`));
    //     var treeButtonSignModule = element(by.id(`e2e-tree-renderer-tree-sign-${ data.new_module_name }`));
    //
    //     utils.checkIfElementContainsText(treeButtonSignComponent, '-');
    //     utils.checkIfElementContainsText(treeButtonSignTechno, '-');
    //     utils.checkIfElementContainsText(treeButtonSignModule, '-');
    //
    //     utils.clickOnElement(treeButtonSignModule);
    //
    //     expect(element.all(by.id(`e2e-tree-renderer-edit-module-button-${ data.new_module_name }`)).count()).toEqual(1);
    //     expect(element.all(by.id(`e2e-instance-list-for-${ data.new_module_name }`)).count()).toEqual(0);
    //     expect(element.all(by.id(`e2e-tree-renderer-edit-instance-button-${ data.new_instance_name }`)).count()).toEqual(0);
    //
    //     utils.checkIfElementContainsText(treeButtonSignComponent, '-');
    //     utils.checkIfElementContainsText(treeButtonSignTechno, '-');
    //     utils.checkIfElementContainsText(treeButtonSignModule, '+');
    //
    //     utils.clickOnElement(treeButtonSignModule);
    //
    //     expect(element.all(by.id(`e2e-tree-renderer-edit-module-button-${ data.new_module_name }`)).count()).toEqual(1);
    //     expect(element.all(by.id(`e2e-instance-list-for-${ data.new_module_name }`)).count()).toEqual(1);
    //     expect(element.all(by.id(`e2e-tree-renderer-edit-instance-button-${ data.new_instance_name }`)).count()).toEqual(1);
    //
    //     utils.checkIfElementContainsText(treeButtonSignComponent, '-');
    //     utils.checkIfElementContainsText(treeButtonSignTechno, '-');
    //     utils.checkIfElementContainsText(treeButtonSignModule, '-');
    //
    //     utils.clickOnElement(element(by.id('e2e-tree-properties-quick-display-button')));
    //
    //     expect(element.all(by.id(`e2e-tree-renderer-edit-module-button-${ data.new_module_name }`)).count()).toEqual(0);
    //     expect(element.all(by.id(`e2e-instance-list-for-${ data.new_module_name }`)).count()).toEqual(0);
    //     expect(element.all(by.id(`e2e-tree-renderer-edit-instance-button-${ data.new_instance_name }`)).count()).toEqual(0);
    //
    //     utils.checkIfElementContainsText(treeButtonSignComponent, '+');
    //     expect(element.all(by.id(`e2e-tree-renderer-tree-sign-${ data.logic_group_2 }`)).count()).toEqual(0);
    //     expect(element.all(by.id(`e2e-tree-renderer-tree-sign-${ data.new_module_name }`)).count()).toEqual(0);
    //
    //     utils.clickOnElement(element(by.id('e2e-tree-properties-quick-display-button')));
    //
    //     expect(element.all(by.id(`e2e-tree-renderer-edit-module-button-${ data.new_module_name }`)).count()).toEqual(1);
    //     expect(element.all(by.id(`e2e-instance-list-for-${ data.new_module_name }`)).count()).toEqual(1);
    //     expect(element.all(by.id(`e2e-tree-renderer-edit-instance-button-${ data.new_instance_name }`)).count()).toEqual(1);
    //
    //     utils.checkIfElementContainsText(treeButtonSignComponent, '-');
    //     utils.checkIfElementContainsText(treeButtonSignTechno, '-');
    //     utils.checkIfElementContainsText(treeButtonSignModule, '-');
    // });
    //
    // it('should set french language by default', () => {
    //     // Define flag element, and set by default English
    //     var navbarHelpMenu = element(by.id('e2e-navbar-help'));
    //     var settingsModalEnLangRadio = element(by.id('e2e-modal-settings-switch-lang-en'));
    //     var settingsModalFrLangRadio = element(by.id('e2e-modal-settings-switch-lang-fr'));
    //
    //     utils.clickOnElement(element(by.id('e2e-navbar-lang-en')));
    //     expect(navbarHelpMenu.getText()).toEqual(data.help_label);
    //
    //     // enter in the settings panel
    //     utils.clickOnElement(element(by.id('e2e-navbar-settings')));
    //
    //     // //////////////////////////////////////////////////////////////////////////
    //     // * Select French language by default with settings panel
    //     // Check english language is selected
    //     expect(utils.hasClass(settingsModalEnLangRadio, 'md-checked')).toBe(true);
    //     expect(utils.hasClass(settingsModalFrLangRadio, 'md-checked')).toBe(false);
    //
    //     // Choose to show by default the instance.
    //     utils.clickOnElement(settingsModalFrLangRadio);
    //     expect(utils.hasClass(settingsModalEnLangRadio, 'md-checked')).toBe(false);
    //     expect(utils.hasClass(settingsModalFrLangRadio, 'md-checked')).toBe(true);
    //     utils.clickOnElement(element(by.id('e2e-modal-settings-button-close')));
    //
    //     // Button clodeDialog don't valid the settings
    //     expect(navbarHelpMenu.getText()).toEqual(data.help_label);
    //
    //     // enter in the settings panel
    //     utils.clickOnElement(element(by.id('e2e-navbar-settings')));
    //
    //     // Choose to show by default the instance.
    //     utils.clickOnElement(settingsModalFrLangRadio);
    //     expect(utils.hasClass(settingsModalEnLangRadio, 'md-checked')).toBe(false);
    //     expect(utils.hasClass(settingsModalFrLangRadio, 'md-checked')).toBe(true);
    //     utils.clickOnElement(element(by.id('e2e-modal-settings-button-save')));
    //
    //     expect(navbarHelpMenu.getText()).toEqual(data.aide_label);
    // });
    //
    // it('should set english language by default', () => {
    //     // enter in the settings panel
    //     utils.clickOnElement(element(by.id('e2e-navbar-settings')));
    //
    //     var navbarHelpMenu = element(by.id('e2e-navbar-help'));
    //     var settingsModalEnLangRadio = element(by.id('e2e-modal-settings-switch-lang-en'));
    //     var settingsModalFrLangRadio = element(by.id('e2e-modal-settings-switch-lang-fr'));
    //
    //     // //////////////////////////////////////////////////////////////////////////
    //     // * Select English language by default with settings panel
    //     // Check french language is selected
    //     expect(utils.hasClass(settingsModalEnLangRadio, 'md-checked')).toBe(false);
    //     expect(utils.hasClass(settingsModalFrLangRadio, 'md-checked')).toBe(true);
    //
    //     // Choose english language
    //     utils.clickOnElement(settingsModalEnLangRadio);
    //     expect(utils.hasClass(settingsModalEnLangRadio, 'md-checked')).toBe(true);
    //     expect(utils.hasClass(settingsModalFrLangRadio, 'md-checked')).toBe(false);
    //     utils.clickOnElement(element(by.id('e2e-modal-settings-button-close')));
    //
    //     // Button clodeDialog don't valid the settings
    //     expect(navbarHelpMenu.getText()).toEqual(data.aide_label);
    //
    //     // enter in the settings panel
    //     utils.clickOnElement(element(by.id('e2e-navbar-settings')));
    //
    //     // Choose english language
    //     utils.clickOnElement(settingsModalEnLangRadio);
    //     expect(utils.hasClass(settingsModalEnLangRadio, 'md-checked')).toBe(true);
    //     expect(utils.hasClass(settingsModalFrLangRadio, 'md-checked')).toBe(false);
    //     utils.clickOnElement(element(by.id('e2e-modal-settings-button-save')));
    //
    //     expect(navbarHelpMenu.getText()).toEqual(data.help_label);
    //
    //     // //////////////////////////////////////////////////////////////////////////
    //     // * Select French language by default with main page shortcut flag
    //     utils.clickOnElement(element(by.id('e2e-navbar-lang-fr')));
    //     expect(navbarHelpMenu.getText()).toEqual(data.aide_label);
    //
    //     // enter in the settings panel
    //     utils.clickOnElement(element(by.id('e2e-navbar-settings')));
    //
    //     // Check french language is selected
    //     expect(utils.hasClass(settingsModalEnLangRadio, 'md-checked')).toBe(false);
    //     expect(utils.hasClass(settingsModalFrLangRadio, 'md-checked')).toBe(true);
    //
    //     utils.clickOnElement(element(by.id('e2e-modal-settings-button-close')));
    //
    //     // //////////////////////////////////////////////////////////////////////////
    //     // * Select English language by default with main page shortcut flag
    //     utils.clickOnElement(element(by.id('e2e-navbar-lang-en')));
    //     expect(navbarHelpMenu.getText()).toEqual(data.help_label);
    //
    //     // enter in the settings panel
    //     utils.clickOnElement(element(by.id('e2e-navbar-settings')));
    //
    //     // Check french language is selected
    //     expect(utils.hasClass(settingsModalEnLangRadio, 'md-checked')).toBe(true);
    //     expect(utils.hasClass(settingsModalFrLangRadio, 'md-checked')).toBe(false);
    //
    //     utils.clickOnElement(element(by.id('e2e-modal-settings-button-close')));
    // });
});
