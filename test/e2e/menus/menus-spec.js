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

var rest = require('restling');
var vsct_utils = require('../lib/lib.js');

describe('Manage menus', function() {
    console.log("START describe Manage menus");
    it('should open help menu and check content "about"', function() {
        var elm_helpMenu = element(by.id("menu_help-menu"));
        vsct_utils.clickOnElement(elm_helpMenu);
        var elm_aboutMenu = element(by.id("menu_help-about-menu"));
        vsct_utils.clickOnElement(elm_aboutMenu);

        var elm = element(by.id('dialogContent_7'));
        vsct_utils.checkIfElementContainsText(elm,"About the");
    });
});
