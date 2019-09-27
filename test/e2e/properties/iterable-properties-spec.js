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

const utils = require('../utils.js');
const until = protractor.ExpectedConditions;

function openIterableProperties() {
    utils.clickOnElement(element(by.id('e2e-properties-list_display-iterable-properties-button')));
}

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
        // we use random_string for at least 1 property to avoid saving plateform without changes for property values
        var randomString = utils.getRandomString(20);

        // Ensure required property has a value
        utils.clearAndSendkeys(element(by.id('e2e-simple-properties-list_value-property-input-prop_required')), data.simple_value);

        // Open iterable properties
        openIterableProperties();

        // Add a bloc
        utils.clickOnElement(element(by.id('e2e-iterable-property-iterable-add-bloc-button')));
        const bloc = element.all(by.css('.iterable-bloc')).get(0);
        bloc.getAttribute('id').then(function (itemId) {
            // always clear before sendKeys
            utils.clearAndSendkeys(element(by.id(`e2e-iterable-property-iterable-bloc-${ itemId }-value-i_comment`)), randomString);
            utils.clearAndSendkeys(element(by.id(`e2e-iterable-property-iterable-bloc-${ itemId }-value-i_password`)), data.simple_value);
            utils.clearAndSendkeys(element(by.id(`e2e-iterable-property-iterable-bloc-${ itemId }-value-i_pattern`)), data.value_prop_wrong_pattern);

            utils.clickOnElement(element(by.id('e2e-box-properties-save-module-properties-button')));
            // add comment for saving modifications
            const commentInput = element(by.id('e2e-save-properties-modal_input-comment-autocomplete'));
            browser.wait(until.presenceOf(commentInput), 1000, 'comment input is taking too long to appear in the DOM');
            commentInput.sendKeys(`${ data.comment_for_saving_iterable_properties }_${ randomString }`);
            utils.clickOnElement(element(by.id('e2e-save-properties-modal_save-comment-button')));
            utils.checkSuccessNotification('The properties have been saved');
        });
    });

    it('should check that unmatching @pattern value', () => {
        openIterableProperties();

        const bloc = element.all(by.css('.iterable-bloc')).get(0);
        bloc.getAttribute('id').then(function (itemId) {
            // we use randomString for at least 1 property to avoid saving plateform without changes for property values
            var randomString = utils.getRandomString(20);

            // always clear before sendKeys and try to save
            utils.clearAndSendkeys(element(by.id(`e2e-iterable-property-iterable-bloc-${ itemId }-value-i_pattern`)), randomString);

            utils.checkElementIsDisabled('e2e-box-properties-save-module-properties-button');
        });
    });

    it('should check that a bloc can be removed', () => {
        openIterableProperties();

        utils.clickOnElement(element(by.id('e2e-iterable-property-iterable-add-bloc-button')));

        const bloc = element.all(by.css('.iterable-bloc')).get(0);
        bloc.getAttribute('id').then(function (itemId) {
            utils.clickOnElement(element(by.id(`e2e-iterable-property-iterable-bloc-${ itemId }-remove-bloc-button`)));
            element.all(by.css('.iterable-bloc')).then(function (items) {
                expect(items.length).toBe(1);
            });
        });
    });

    it('should check that a bloc of second iterable property can be removed', () => {
        openIterableProperties();

        utils.clickOnElement(element(by.id('e2e-iterable-property-last_iterable-add-bloc-button')));

        const secondBloc = element.all(by.css('.iterable-bloc')).get(1);
        secondBloc.getAttribute('id').then(function (itemId) {
            utils.clickOnElement(element(by.id(`e2e-iterable-property-last_iterable-bloc-${ itemId }-remove-bloc-button`)));
            element.all(by.css('.iterable-bloc')).then(function (items) {
                expect(items.length).toBe(1);
            });
        });
    });
});
