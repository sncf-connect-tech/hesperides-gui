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

var moment = require('moment');
var utils = require('../utils.js');
var until = protractor.ExpectedConditions;

var addGlobalProperty = function (name, value) {
    element(by.id('new_kv_name')).sendKeys(name);
    element(by.id('new_kv_value')).sendKeys(value);
    element(by.id('new_kv_value')).sendKeys(protractor.Key.ENTER);
};

var saveGlobalProperties = function (comment) {
    utils.clickOnElement(element(by.id('e2e-tree-properties-save-global-properties-button')));
    element(by.id('e2e-save-properties-modal_input-comment-autocomplete')).sendKeys(comment);
    utils.clickOnElement(element(by.id('e2e-save-properties-modal_save-comment-button')));
};

describe('Manage platform diff', () => {
    beforeAll(() => {
        browser.get(`${ hesperides_url }/#/properties/${ data.new_application }?platform=${ data.new_platform }`);
    });

    it('should display datepicker on compare two platform at a specific date switch', () => {
        // Affiche le modal de diff
        utils.clickOnElement(element(by.id('e2e-tree-properties-display-global-properties-diff-button')));
        // Active le calendrier
        utils.clickOnElement(element(by.id('e2e-global-properties-diff-select-date-switch')));

        var calendar = element.all(by.css('.angularjs-datetime-picker')).get(0);
        browser.wait(until.presenceOf(calendar), 1000, 'Calendar is taking too long to appear in the DOM');
        expect(element.all(by.css('.angularjs-datetime-picker')).count()).toEqual(1);

        utils.clickOnElement(element(by.css('.adp-prev')));
        // Sélectionne une date un mois plus tôt
        expect(element.all(by.css('.angularjs-datetime-picker')).count()).toEqual(1);

        utils.clickOnElement(element.all(by.cssContainingText('.adp-day.selectable', '1')).get(0));
        expect(element.all(by.css('.angularjs-datetime-picker')).count()).toEqual(0);
    });

    it('should display platform diff page with proper timestamp when a date is selected', () => {
        // Récupère la date sélectionnée
        element(by.id('look-past-date-time')).getAttribute('value').then(function (date) {
            const timestamp = Number(moment(date, 'YYYY-MM-DD HH:mm:ss Z'));
            // Clique sur Run comparison
            utils.clickOnElement(element(by.id('e2e-global-properties-diff-runcomparison-button')));
            // Vérifie l'url appelée contient le bon timestamp dans la nouvelle fenêtre
            utils.switchBrowserToNewTab().then(function () {
                const newTabUrl = browser.getCurrentUrl();
                utils.switchBrowserBackToFirstTab();
                expect(newTabUrl).toContain(`&timestamp=${ timestamp }`);
            });
        });
    });

    it('should display platform diff page with proper global properties diff', () => {
        // Affiche la seconde plateforme
        browser.get(`${ hesperides_url }/#/properties/${ data.new_application }?platform=${ data.new_platform }_from`);
        // Affiche la liste des propriétés globales
        utils.clickOnElement(element(by.id('e2e-tree-properties-display-global-properties-button')));
        addGlobalProperty('global_common', 'common_value');
        addGlobalProperty('global_diff', 'right_value');
        addGlobalProperty('global_right', 'value');
        saveGlobalProperties('save global properties for second platform');

        // Affiche la première plateforme
        browser.get(`${ hesperides_url }/#/properties/${ data.new_application }?platform=${ data.new_platform }`);
        // Affiche la liste des propriétés globales
        utils.clickOnElement(element(by.id('e2e-tree-properties-display-global-properties-button')));
        addGlobalProperty('global_common', 'common_value');
        addGlobalProperty('global_diff', 'left_value');
        addGlobalProperty('global_left', 'value');
        saveGlobalProperties('save global properties for first platform');

        // Récupère la fenêtre de diff entre les 2 plateformes sans timestamp
        browser.get(`${ hesperides_url }/#/diff?application=${ data.new_application }&platform=${ data.new_platform }&properties_path=%23&compare_application=${ data.new_application }&compare_platform=${ data.new_platform }_from&compare_path=%23&compare_stored_values=false`);

        // Pour chaque section, ouvre et vérifier que les tableaux contiennent les propriétés finales

        utils.clickOnElement(element(by.id('e2e-diff-onlyleft-toggle-button')));
        var leftPropertyName = element(by.id('e2e-diff-onlyleft-properties')).element(by.css('.diff-property-name'));
        expect(leftPropertyName.getText()).toEqual('global_left');
        var leftPropertyFinalValue = element(by.id('e2e-diff-onlyleft-properties')).element(by.css('.diff-property-final-value'));
        expect(leftPropertyFinalValue.getText()).toEqual('value');

        utils.clickOnElement(element(by.id('e2e-diff-common-toggle-button')));
        var commonPropertyName = element(by.id('e2e-diff-common-properties')).element(by.css('.diff-property-name'));
        expect(commonPropertyName.getText()).toEqual('global_common');
        var commonPropertyFinalValueLeft = element(by.id('e2e-diff-common-properties')).element(by.css('.diff-property-final-value-left'));
        expect(commonPropertyFinalValueLeft.getText()).toEqual('common_value');
        var commonPropertyFinalValueRight = element(by.id('e2e-diff-common-properties')).element(by.css('.diff-property-final-value-right'));
        expect(commonPropertyFinalValueRight.getText()).toEqual('common_value');

        utils.clickOnElement(element(by.id('e2e-diff-differing-toggle-button')));
        var differingPropertyName = element(by.id('e2e-diff-differing-properties')).element(by.css('.diff-property-name'));
        expect(differingPropertyName.getText()).toEqual('global_diff');
        var differingPropertyFinalValueLeft = element(by.id('e2e-diff-differing-properties')).element(by.css('.diff-property-final-value-left'));
        expect(differingPropertyFinalValueLeft.getText()).toEqual('left_value');
        var differingPropertyFinalValueRight = element(by.id('e2e-diff-differing-properties')).element(by.css('.diff-property-final-value-right'));
        expect(differingPropertyFinalValueRight.getText()).toEqual('right_value');

        utils.clickOnElement(element(by.id('e2e-diff-onlyright-toggle-button')));
        var rightPropertyName = element(by.id('e2e-diff-onlyright-properties')).element(by.css('.diff-property-name'));
        expect(rightPropertyName.getText()).toEqual('global_right');
        var rightPropertyFinalValue = element(by.id('e2e-diff-onlyright-properties')).element(by.css('.diff-property-final-value'));
        expect(rightPropertyFinalValue.getText()).toEqual('value');
    });
});
