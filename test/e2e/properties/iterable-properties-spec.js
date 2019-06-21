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

var openIterableProperties = function () {
    utils.clickOnElement(element(by.id('e2e-properties-list_display-iterable-properties-button')));
};

describe('Manage iterable properties and annotations (default, comment, required etc ...)', () => {
    beforeAll(() =>
        browser.get(`${ hesperides_url }/#/properties/${ data.new_application }?platform=${ data.new_platform }`)
    );

    beforeEach(() => {
        browser.get(`${ hesperides_url }/#/properties/${ data.new_application }?platform=${ data.new_platform }`);

        // open bloc mode
        utils.clickOnElement(element(by.id('e2e-properties-show-box-mode-button')));

        utils.clickOnElement(element(by.id(`e2e-box-renderer-edit-module-button-${ data.new_module_name }`)));
    });

    it('should fill in iterable properties with right values (BLOC MODE) and check if save event is correctly stored', () => {
        // 1- Open iterable properties
        openIterableProperties();

        // 2- Add a bloc
        utils.clickOnElement(element(by.id('e2e-iterable-property-iterable-add-bloc-button')));
        const bloc = element.all(by.css('.iterable-bloc')).get(0);
        bloc.getAttribute('id').then(function (itemId) {
            // we use random_string for at least 1 property to avoid saving plateform without changes for property values
            var random_string = utils.getRandomString(20);

            // always clear before sendKeys
            utils.clearAndSendkeys(element(by.id(`e2e-iterable-property-iterable-bloc-${ itemId }-value-i_comment`)), random_string);
            utils.clearAndSendkeys(element(by.id(`e2e-iterable-property-iterable-bloc-${ itemId }-value-i_password`)), data.simple_value);
            utils.clearAndSendkeys(element(by.id(`e2e-iterable-property-iterable-bloc-${ itemId }-value-i_pattern`)), data.value_prop_wrong_pattern);

            utils.clickOnElement(element(by.id('e2e-box-properties-save-module-properties-button')));
            // add comment for saving modifications
            element(by.id('e2e-save-properties-modal_input-comment-autocomplete')).sendKeys(`${ data.comment_for_saving_iterable_properties }_${ random_string }`);
            utils.clickOnElement(element(by.id('e2e-save-properties-modal_save-comment-button')));
            utils.checkSuccessNotification('The properties have been saved');

            // check events if modification is really saved
            // utils.clickOnElement(element(by.id('properties_show-platform-event-button')));
            // utils.checkIfElementContainsText(element(by.id('properties-saved_comment-span-' + data.comment_for_saving_iterable_properties + '_' + random_string)), data.comment_for_saving_iterable_properties + '_' + random_string);
            // search events by comment
            // utils.clearAndSendkeys(element(by.id('event-model-filter-input')), data.comment_for_saving_iterable_properties);
            // Expect only one property saved with this command
            // utils.checkIfElementIsPresentWithClass('.property-saved');
        });
    });

    it('should check that unmatching @pattern value', () => {
        // 0- Open
        openIterableProperties();

        const bloc = element.all(by.css('.iterable-bloc')).get(0);
        bloc.getAttribute('id').then(function (itemId) {
            // we use random_string for at least 1 property to avoid saving plateform without changes for property values
            var random_string = utils.getRandomString(20);

            // always clear before sendKeys and try to save
            utils.clearAndSendkeys(element(by.id(`e2e-iterable-property-iterable-bloc-${ itemId }-value-i_pattern`)), data.value_prop_good_pattern);

            utils.clickOnElement(element(by.id('e2e-box-properties-save-module-properties-button')));

            // add comment for saving modifications
            element(by.id('e2e-save-properties-modal_input-comment-autocomplete')).sendKeys(`${ data.comment_for_saving_iterable_properties }_${ random_string }`);

            utils.clickOnElement(element(by.id('e2e-save-properties-modal_save-comment-button')));

            // Click on save
            utils.clickOnElement(element(by.id('properties_show-platform-event-button')));

            // Expect the save has failed (no save with this comment)
            utils.checkIfElementIsMissing(`#properties-saved_comment-span-${ random_string }`);
        });
    });

    it('should check that a bloc can be removed', () => {
        // 0- Open
        openIterableProperties();

        // 1- Add a bloc
        utils.clickOnElement(element(by.id('e2e-iterable-property-iterable-add-bloc-button')));

        // 2- Remove a bloc
        const bloc = element.all(by.css('.iterable-bloc')).get(0);
        bloc.getAttribute('id').then(function (itemId) {
            utils.clickOnElement(element(by.id(`e2e-iterable-property-iterable-bloc-${ itemId }-remove-bloc-button`)));
            element.all(by.css('.iterable-bloc')).then(function (items) {
                expect(items.length).toBe(1);
            });
        });
    });

    it('should check that a bloc of second iterable property can be removed', () => {
        // 0- Open
        openIterableProperties();

        // 1- Add a bloc
        utils.clickOnElement(element(by.id('e2e-iterable-property-last_iterable-add-bloc-button')));

        // 2- Remove a bloc
        const secondBloc = element.all(by.css('.iterable-bloc')).get(1);
        secondBloc.getAttribute('id').then(function (itemId) {
            utils.clickOnElement(element(by.id(`e2e-iterable-property-last_iterable-bloc-${ itemId }-remove-bloc-button`)));
            element.all(by.css('.iterable-bloc')).then(function (items) {
                expect(items.length).toBe(1);
            });
        });
    });
});
