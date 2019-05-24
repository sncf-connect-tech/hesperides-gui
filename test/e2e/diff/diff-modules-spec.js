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

describe('Manage diff', () => {

    beforeAll(() => {
        browser.get(hesperides_url+"/#/properties/"+data.new_application+"?platform="+data.new_platform);
    });

    it('should display two platform for TEST_AUTO application', () => {
        // set bloc mode (in case the default mode change)
        utils.clickOnElement(element(by.id("e2e-properties-show-box-mode-button")));

        utils.clickOnElement(element(by.id('e2e-deployed-module-controls-diff-properties-button-' + data.new_module_name)));

        expect(element.all(by.css(".cg-notify-message")).count()).toEqual(0);
        browser.sleep(1000);
        expect(element.all(by.css(".diff-platform-tag")).count()).toEqual(2);
    });

    it('should display datepicker on compare two platform at a specific date switch', () => {
        utils.clickOnElement(element(by.id('e2e-properties-diff-wizard-switch')));
        expect(element.all(by.css(".angularjs-datetime-picker")).count()).toEqual(1);

        utils.clickOnElement(element(by.css('.adp-prev')));
        expect(element.all(by.css(".angularjs-datetime-picker")).count()).toEqual(1);

        utils.clickOnElement(element.all(by.cssContainingText(".adp-day.selectable","1")).get(0));
        browser.sleep(1000);
        expect(element.all(by.css(".angularjs-datetime-picker")).count()).toEqual(0);
    });
});
