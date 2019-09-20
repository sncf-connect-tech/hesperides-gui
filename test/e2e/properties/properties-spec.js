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

describe('Manage properties (global, module, instance) and annotations (default, comment, required etc ...)', () => {
    beforeAll(() =>
        browser.get(`${ hesperides_url }/#/properties/${ data.new_application }?platform=${ data.new_platform }`)
    );

    beforeEach(function () {
        browser.get(`${ hesperides_url }/#/properties/${ data.new_application }?platform=${ data.new_platform }`);

        // set tree mode
        utils.clickOnElement(element(by.id('e2e-properties-show-tree-mode-button')));

        // on déroule l'arbre
        utils.clickOnElement(element(by.id('e2e-tree-properties-quick-display-button')));

        utils.clickOnElement(element(by.id(`e2e-tree-renderer-edit-module-button-${ data.new_module_name }`)));
    });

    it('should fill in properties with right values (TREE MODE) and check if save event is correctly stored', () => {
        // we use random_string for at least 1 property to avoid saving plateform without changes for property values
        var random_string = utils.getRandomString(20);

        // always clear before sendKeys
        utils.clearAndSendkeys(element(by.id('e2e-simple-properties-list_value-property-isnotglobale-input-prop_comment')), random_string);
        utils.clearAndSendkeys(element(by.id('e2e-simple-properties-list_value-property-isnotglobale-input-prop_password')), data.simple_value);
        utils.clearAndSendkeys(element(by.id('e2e-simple-properties-list_value-property-isnotglobale-input-prop_pattern')), data.value_prop_good_pattern);
        utils.clearAndSendkeys(element(by.id('e2e-simple-properties-list_value-property-isnotglobale-input-prop_required')), data.simple_value);
        utils.clearAndSendkeys(element(by.id('e2e-simple-properties-list_value-property-isnotglobale-input-prop_simple')), data.simple_value);

        utils.clickOnElement(element(by.id('e2e-tree-properties-save-module-properties-button')));

        // add comment for saving modifications
        element(by.id('e2e-save-properties-modal_input-comment-autocomplete')).sendKeys(`${ data.comment_for_saving_properties }_${ random_string }`);
        utils.clickOnElement(element(by.id('e2e-save-properties-modal_save-comment-button')));
        utils.checkSuccessNotification('The properties have been saved');

        // check events if modification is really saved
        // utils.clickOnElement(element(by.id('properties_show-platform-event-button')));
        // utils.checkIfElementContainsText(element(by.id('properties-saved_comment-span-' + data.comment_for_saving_properties + '_' + random_string)), data.comment_for_saving_properties + '_' + random_string);
        // search events by comment
        // utils.clearAndSendkeys(element(by.id('event-model-filter-input')), data.comment_for_saving_properties);
        // utils.checkIfElementIsPresentWithClass('.property-saved');
    });

    it('should not save properties with a value not matching its @pattern (TREE MODE)', () => {
        // always clear before sendKeys
        utils.clearAndSendkeys(element(by.id('e2e-simple-properties-list_value-property-isnotglobale-input-prop_pattern')), data.value_prop_wrong_pattern);
        utils.checkElementIsDisabled('e2e-tree-properties-save-module-properties-button');
    });

    it('should not save properties without a @required value (TREE MODE)', () => {
        // always clear before sendKeys
        element(by.id('e2e-simple-properties-list_value-property-isnotglobale-input-prop_required')).clear();
        utils.checkElementIsDisabled('e2e-tree-properties-save-module-properties-button');
    });

    it('should find default value for the property with a default value (TREE MODE)', () => {
        element(by.id('e2e-simple-properties-list_value-property-isnotglobale-input-prop_default')).getAttribute('placeholder').then(function (element) {
            // attention aux 2 espaces après le crochet ...
            expect(element).toEqual('[default=default_value] ');
        });
    });

    it('should add a global property and check that valuation of module property with the same name is set (TREE MODE)', function () {
        utils.clickOnElement(element(by.id('e2e-tree-properties-display-global-properties-button')));

        element(by.id('new_kv_name')).sendKeys(data.global_property_key);
        element(by.id('new_kv_value')).sendKeys(data.global_property_value);

        utils.clickOnElement(element(by.id('e2e-tree-properties-save-global-properties-button')));

        // add comment for saving modifications
        element(by.id('e2e-save-properties-modal_input-comment-autocomplete')).sendKeys(data.comment_for_saving_global_properties);
        utils.clickOnElement(element(by.id('e2e-save-properties-modal_save-comment-button')));

        utils.checkIfElementIsPresent(`properties-globales_key-property-label-${ data.global_property_key }`);
    });
});
