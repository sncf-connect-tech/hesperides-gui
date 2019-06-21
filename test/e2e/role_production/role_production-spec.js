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

describe('Checks around production role', () => {
    beforeEach(() =>
        browser.get(`${ hesperides_url }/#/properties/${ data.new_application }?platform=${ data.new_platform }`)
    );

    it('should check on logical representation page that switch "Production platform" is disabled for a "non production" user', () =>
        utils.checkIfElementIsDisabled('properties_isProduction-switch', 'true')
    );

    it('should check that a "non production" user cannot create a production platform', () => {
        utils.clickOnElement(element(by.id('e2e-navbar-app')));
        utils.clickOnElement(element(by.id('e2e-navbar-app-create')));

        utils.checkIfElementIsDisabled('e2e-modal-platform-create-is-prod-switch', 'true');
    });

    it('should check that a "non production" user cannot create a production platform from another one', () => {
        utils.clickOnElement(element(by.id('e2e-navbar-app')));
        utils.clickOnElement(element(by.id('e2e-navbar-app-create-from')));

        utils.checkIfElementIsDisabled('e2e-modal-platform-create-from-is-prod-switch', 'true');
    });
});
