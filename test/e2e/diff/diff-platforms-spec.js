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

describe('Manage platform diff', () => {
    beforeAll(() => {
        browser.get(`${ hesperides_url }/#/properties/${ data.new_application }?platform=${ data.new_platform }`);
    });

    it('should display datepicker on compare two platform at a specific date switch', () => {
        // Mode 'arbre'
        utils.clickOnElement(element(by.id('e2e-properties-show-tree-mode-button')));
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
});
