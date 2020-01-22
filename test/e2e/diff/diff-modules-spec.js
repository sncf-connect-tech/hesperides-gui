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

describe('Manage diff', () => {
    beforeAll(() => {
        browser.get(`${ hesperides_url }/#/properties/${ data.new_application }?platform=${ data.new_platform }`);
    });

    it('should display two platform for TEST_AUTO application', () => {
        browser.actions().mouseMove(element(by.id(`e2e-tree-renderer-edit-module-button-${ data.new_module_name }`))).perform();
        utils.clickOnElement(element(by.id(`e2e-deployed-module-controls-diff-properties-button-${ data.new_module_name }`)));

        expect(element.all(by.css('.cg-notify-message')).count()).toEqual(0);
        browser.sleep(1000);
        expect(element.all(by.css('.diff-platform-tag')).count()).not.toBeLessThan(2);
    });

    it('should display datepicker on compare two platform at a specific date switch', () => {
        utils.clickOnElement(element(by.id('e2e-properties-diff-wizard-switch')));

        var calendar = element.all(by.css('.angularjs-datetime-picker')).get(0);
        browser.wait(until.presenceOf(calendar), 1000, 'Calendar is taking too long to appear in the DOM');
        expect(element.all(by.css('.angularjs-datetime-picker')).count()).toEqual(1);

        utils.clickOnElement(element(by.css('.adp-prev')));
        // Sélectionne une date un mois plus tôt
        expect(element.all(by.css('.angularjs-datetime-picker')).count()).toEqual(1);

        utils.clickOnElement(element.all(by.cssContainingText('.adp-day.selectable', '1')).get(0));
        expect(element.all(by.css('.angularjs-datetime-picker')).count()).toEqual(0);
    });

    it('should not allow diff when platform did not exist at time', () => {
        utils.clickOnElement(element(by.id('e2e-properties-diff-next-button')));
        // La date est invalide car le la module n'existe pas un mois plus tôt
        utils.checkElementIsDisabled('e2e-properties-diff-runcomparison-button');
    });

    it('should display module diff page with proper timestamp when a valid date is selected', () => {
        // Clique sur bouton Previous
        utils.clickOnElement(element(by.id('e2e-properties-diff-previous-button')));

        // Sélectionne la jour courant
        utils.clickOnElement(element(by.id('look-past-date-time')));
        var calendar = element.all(by.css('.angularjs-datetime-picker')).get(0);
        browser.wait(until.presenceOf(calendar), 1000, 'Calendar is taking too long to appear in the DOM');
        utils.clickOnElement(element.all(by.css('div.adp-day.selectable.ng-binding.ng-scope.selected.today')).get(0));

        // Récupère la date sélectionnée
        element(by.id('look-past-date-time')).getAttribute('value').then(function (date) {
            const timestamp = Number(moment(date, 'YYYY-MM-DD HH:mm:ss Z'));
            // Clique sur Run comparison
            utils.clickOnElement(element(by.id('e2e-properties-diff-next-button')));
            utils.clickOnElement(element(by.id('e2e-properties-diff-runcomparison-button')));
            // Vérifie l'url appelée contient le bon timestamp dans la nouvelle fenêtre
            utils.switchBrowserToNewTab().then(function () {
                const newTabUrl = browser.getCurrentUrl();
                utils.switchBrowserBackToFirstTab();
                expect(newTabUrl).toContain(`&timestamp=${ timestamp }`);
            });
        });
    });
});
