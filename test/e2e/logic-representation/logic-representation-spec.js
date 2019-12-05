/* eslint-disable no-use-before-define */
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
    beforeEach(() => {
        // Clean up: deleting any existing "_copy" platform & deployed modules
        utils.deleteHttpRequest(`${ hesperides_url }/rest/applications/${ data.new_application }/platforms/${ data.new_platform }_copy`);
        return utils.putHttpRequest(`${ hesperides_url }/rest/applications/${ data.new_application }/platforms`,
            { application_name: data.new_application, platform_name: data.new_platform, application_version: data.new_platform_version, modules: [], production: false })
            .then(() => browser.get(`${ hesperides_url }/#/properties/${ data.new_application }?platform=${ data.new_platform }`));
    });

    it('should add a logic representation', () => {
        // set box mode
        // #nomorebloc utils.clickOnElement(element(by.id('e2e-properties-show-box-mode-button')));
        // add first level
        utils.clickOnElement(element(by.id('e2e-tree-properties-add-first-box-dialog-button')));
        element(by.id('e2e-add-box-new-logic-group-name')).sendKeys(data.logic_group_1);
        utils.clickOnElement(element(by.id('e2e-add-box-create-logic-group-button')));

        // add second level
        browser.actions().mouseMove(element(by.id(`e2e-tree-renderer-edit-logic-group-${ data.logic_group_1 }`))).perform();
        utils.clickOnElement(element(by.id(`e2e-tree-renderer-add-logic-group-button-${ data.logic_group_1 }`)));
        element(by.id('e2e-add-box-new-logic-group-name')).sendKeys(data.logic_group_2);
        utils.clickOnElement(element(by.id('e2e-add-box-create-logic-group-button')));

        // add module
        browser.actions().mouseMove(element(by.id(`e2e-tree-renderer-edit-logic-group-${ data.logic_group_2 }`))).perform();
        utils.clickOnElement(element(by.id(`e2e-tree-renderer-add-module-button-${ data.logic_group_2 }`)));
        var elm_module_name_input = element(by.css('md-autocomplete input#e2e-search-module-input-module-autocomplete'));
        elm_module_name_input.sendKeys(`${ data.new_module_name } ${ data.new_module_version }`);
        utils.selectFirstElemOfAutocomplete(elm_module_name_input);
        utils.clickOnElement(element(by.id('e2e-search-module-add-module-button')));

        // add instance
        browser.actions().mouseMove(element(by.id(`e2e-tree-renderer-edit-module-button-${ data.new_module_name }`))).perform();
        utils.clickOnElement(element(by.id(`e2e-deployed-module-controls-add-instance-button-${ data.new_module_name }`)));
        element(by.id('e2e-add-instance-instance-name-input')).sendKeys(data.new_instance_name);

        element(by.id('e2e-add-instance-create-instance-button')).click().then(() => {
            element(by.id(`e2e-tree-renderer-edit-module-button-${ data.new_module_name }`)).isPresent().then((isPresent) => {
                expect(isPresent).toBe(true);
                utils.checkResponseStatusCode(`${ hesperides_url }/rest/files/applications/${ data.new_application }/platforms/${ data.new_platform }/%23${ data.logic_group_1 }%23${ data.logic_group_2 }/${ data.new_module_name }/${ data.new_module_version }/instances/${ data.new_instance_name }?isWorkingCopy=true`, 200);
            });
        });

        // display/hide instance
        expect(element.all(by.id(`e2e-instance-list-for-${ data.new_module_name }`)).count()).toEqual(0);
        utils.clickOnElement(element(by.id(`e2e-tree-renderer-tree-sign-${ data.new_module_name }`)));
        utils.checkIfElementIsPresent(`e2e-instance-list-for-${ data.new_module_name }`);
        utils.checkIfElementIsPresent(`e2e-instance-${ data.new_module_name }-${ data.new_instance_name }`);
        utils.clickOnElement(element(by.id(`e2e-tree-renderer-tree-sign-${ data.new_module_name }`)));
        expect(element.all(by.id(`e2e-instance-list-for-${ data.new_module_name }`)).count()).toEqual(0);
    });

    it('should add several logic groups at once', () => {
        // set box mode
        // #nomorebloc utils.clickOnElement(element(by.id('e2e-properties-show-box-mode-button')));
        // add first level
        utils.clickOnElement(element(by.id('e2e-tree-properties-add-first-box-dialog-button')));
        element(by.id('e2e-add-box-new-logic-group-name')).sendKeys(`${ data.logic_group_1 }#${ data.logic_group_2 }`);
        utils.clickOnElement(element(by.id('e2e-add-box-create-logic-group-button')));

        // add module
        browser.actions().mouseMove(element(by.id(`e2e-tree-renderer-edit-logic-group-${ data.logic_group_2 }`))).perform();
        utils.clickOnElement(element(by.id(`e2e-tree-renderer-add-module-button-${ data.logic_group_2 }`)));
        var elm_module_name_input = element(by.css('md-autocomplete input#e2e-search-module-input-module-autocomplete'));
        elm_module_name_input.sendKeys(`${ data.new_module_name } ${ data.new_module_version }`);
        utils.selectFirstElemOfAutocomplete(elm_module_name_input);
        browser.waitForAngular();
        utils.clickOnElement(element(by.id('e2e-search-module-add-module-button')));

        // add instance
        browser.actions().mouseMove(element(by.id(`e2e-tree-renderer-edit-module-button-${ data.new_module_name }`))).perform();
        utils.clickOnElement(element(by.id(`e2e-deployed-module-controls-add-instance-button-${ data.new_module_name }`)));
        element(by.id('e2e-add-instance-instance-name-input')).sendKeys(data.new_instance_name);

        element(by.id('e2e-add-instance-create-instance-button')).click().then(() => {
            element(by.id(`e2e-tree-renderer-edit-module-button-${ data.new_module_name }`)).isPresent().then((isPresent) => {
                expect(isPresent).toBe(true);
                utils.checkResponseStatusCode(`${ hesperides_url }/rest/files/applications/${ data.new_application }/platforms/${ data.new_platform }/%23${ data.logic_group_1 }%23${ data.logic_group_2 }/${ data.new_module_name }/${ data.new_module_version }/instances/${ data.new_instance_name }?isWorkingCopy=true`, 200);
            });
        });

        // display/hide instance
        expect(element.all(by.id(`e2e-instance-list-for-${ data.new_module_name }`)).count()).toEqual(0);
        utils.clickOnElement(element(by.id(`e2e-tree-renderer-tree-sign-${ data.new_module_name }`)));
        utils.checkIfElementIsPresent(`e2e-instance-list-for-${ data.new_module_name }`);
        utils.checkIfElementIsPresent(`e2e-instance-${ data.new_module_name }-${ data.new_instance_name }`);
        utils.clickOnElement(element(by.id(`e2e-tree-renderer-tree-sign-${ data.new_module_name }`)));
        expect(element.all(by.id(`e2e-instance-list-for-${ data.new_module_name }`)).count()).toEqual(0);
    });

    // #nomorebloc afterEach(() => utils.setDefaultDisplayModeSetting('bloc'));
});

// function treeModeAddLogicGroupModuleAndInstance(logicGroup1, logicGroup2, moduleName, moduleVersion, newInstanceName) {
//     // add first level
//     utils.clickOnElement(element(by.id('e2e-tree-properties-add-first-box-dialog-button')));
//     element(by.id('e2e-add-box-new-logic-group-name')).sendKeys(logicGroup1);
//     utils.clickOnElement(element(by.id('e2e-add-box-create-logic-group-button')));
//
//     // to display buttons, mouse has to be on element
//     utils.moveMouseOnElement(`e2e-tree-renderer-edit-logic-group-${ logicGroup1 }`,
//         `e2e-tree-renderer-add-logic-group-button-${ logicGroup1 }`);
//
//     // add second level
//     utils.clickOnElement(element(by.id(`e2e-tree-renderer-add-logic-group-button-${ logicGroup1 }`)));
//     element(by.id('e2e-add-box-new-logic-group-name')).sendKeys(logicGroup2);
//     utils.clickOnElement(element(by.id('e2e-add-box-create-logic-group-button')));
//
//     // click on tree sign to show arbo
//     utils.clickOnElement(element(by.id(`e2e-tree-renderer-tree-sign-${ logicGroup2 }`)));
//
//     // to display buttons, mouse has to be on element
//     utils.moveMouseOnElement(`e2e-tree-renderer-edit-logic-group-${ logicGroup2 }`,
//         `e2e-tree-renderer-add-module-button-${ logicGroup2 }`);
//
//     // add module
//     utils.clickOnElement(element(by.id(`e2e-tree-renderer-add-module-button-${ logicGroup2 }`)));
//     var elm_module_name_input = element(by.css('md-autocomplete input#e2e-search-module-input-module-autocomplete'));
//     utils.clearAndSendkeys(elm_module_name_input, `${ moduleName } ${ moduleVersion }`);
//     utils.selectFirstElemOfAutocomplete(elm_module_name_input);
//     browser.waitForAngular(); // ajout pour que l'autocompletion soit prise en compte au moment du test
//     utils.clickOnElement(element(by.id('e2e-search-module-add-module-button')));
//
//     // to display buttons, mouse has to be on element
//     utils.moveMouseOnElement(`e2e-tree-renderer-edit-module-button-${ moduleName }`,
//         `e2e-deployed-module-controls-add-instance-button-${ moduleName }`);
//
//     // add instance
//     utils.clickOnElement(element(by.id(`e2e-deployed-module-controls-add-instance-button-${ moduleName }`)));
//     element(by.id('e2e-add-instance-instance-name-input')).sendKeys(newInstanceName);
//
//     return element(by.id('e2e-add-instance-create-instance-button')).click().then(() =>
//         element(by.id(`e2e-tree-renderer-edit-module-button-${ data.new_module_name }`)).isPresent().then((isPresent) => {
//             expect(isPresent).toBe(true);
//             return utils.checkResponseStatusCode(`${ hesperides_url }/rest/files/applications/${ data.new_application }/platforms/${ data.new_platform }/%23${ data.logic_group_1 }%23${ data.logic_group_2 }/${ data.new_module_name }/${ data.new_module_version }/instances/${ data.new_instance_name }?isWorkingCopy=true`, 200);
//         })
//     );
// }
