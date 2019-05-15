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
var utils = require('../utils.js');

describe('Preview files', function() {

    beforeAll(function() {
        console.log("START describe Preview files");
        browser.get(hesperides_url+"/#/properties/"+data.new_application+"?platform="+data.new_platform);
    });
    it('should preview files (TREE MODE) and check if template has the right location', function() {
        // set tree mode
        var elm_tree_mode = element(by.id("properties_show-tree-mode-button"));
        utils.clickOnElement(elm_tree_mode);

        // open the tree
        var elm_quick_tree_display = element(by.id("tree-properties_quick-display-button"));
        utils.clickOnElement(elm_quick_tree_display);
        var elm_module = element(by.id("tree-renderer_tree-sign-"+data.new_module_name));
        utils.clickOnElement(elm_module);

        utils.moveMouseOnElement("tree-renderer_edit-properties-"+data.new_instance_name+"-button",2000);

        var elm_preview_button = element(by.id("tree-renderer_preview-properties-"+data.new_instance_name+"-button"));
        utils.clickOnElement(elm_preview_button);

        // Preview the new template file
        var elm_template = element(by.id("file-modal_preview-"+data.new_template_filename+"-button"));
        utils.clickOnElement(elm_template);

        var elm_location_template = element(by.id("file-modal_template-section-header-path-"+data.new_template_filename));
        expect(elm_location_template.getText()).toBe(data.new_template_location+"/"+data.new_template_filename);

        // Preview the Json template
        var elm_json_template = element(by.id("file-modal_preview-"+data.json_new_template_filename+"-button"));
        utils.clickOnElement(elm_json_template);

        var elm_location_json_template = element(by.id("file-modal_template-section-header-path-"+data.json_new_template_filename));
        expect(elm_location_json_template.getText()).toBe(data.json_new_template_location+"/"+data.json_new_template_filename);
    });
    afterAll(function(done) {
        process.nextTick(done);
    });
});
