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

describe('Manage diff', function() {

    beforeAll(function() {
        console.log("START describe Manage diff");
        browser.get(hesperides_url+"/#/properties/"+data.new_application+"?platform="+data.new_platform);
    });

    it('should not send notification on non-existing application name in from.application input', function() {

        // set bloc mode (in case the default mode change)
        var elm_bloc_mode = element(by.id("properties_show-box-mode-button"));
        vsct_utils.clickOnElement(elm_bloc_mode);

        var elm_diff = element(by.id("property-tool-button_diff-properties-button-"+data.new_module_name));
        vsct_utils.clickOnElement(elm_diff);

        var elm_from_app = element(by.model("from.application"));

        elm_from_app.sendKeys(protractor.Key.BACK_SPACE);

        expect(element.all(by.css(".notifyjs-wrapper.notifyjs-hidable")).count()).toEqual(0);
        expect(element.all(by.css(".diff-platform-tag")).count()).toEqual(0);

        vsct_utils.clearAndSendkeys(elm_from_app, "foo");

        expect(element.all(by.css(".notifyjs-wrapper.notifyjs-hidable")).count()).toEqual(0);
        expect(element.all(by.css(".diff-platform-tag")).count()).toEqual(0);

    });

    it('should display two platform for TEST_AUTO application', function() {

        var elm_from_app = element(by.model("from.application"));

        vsct_utils.clearAndSendkeys(elm_from_app, data.new_application);

        expect(element.all(by.css(".notifyjs-wrapper.notifyjs-hidable")).count()).toEqual(0);
        expect(element.all(by.css(".diff-platform-tag")).count()).toEqual(2);

    });


});