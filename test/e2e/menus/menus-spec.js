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

describe('Navbar', () => {
    it('should open help menu and check content of the "about" modal', () => {
        utils.clickOnElement(element(by.id('e2e-navbar-help')));
        utils.clickOnElement(element(by.id('e2e-navbar-help-about')));
        utils.checkIfElementContainsText(element(by.css('md-dialog-content')), 'API build time:');
    });
});
