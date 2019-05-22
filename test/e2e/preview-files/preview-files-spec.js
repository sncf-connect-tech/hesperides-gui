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

describe('Preview files', () => {

    beforeAll(() =>
        browser.get(hesperides_url+"/#/properties/"+data.new_application+"?platform="+data.new_platform)
    );

    it('should preview files (TREE MODE) and check if template has the right location', () => {
        // set tree mode
        utils.clickOnElement(element(by.id("properties_show-tree-mode-button")));

        // open the tree
        //utils.clickOnElement(element(by.id("e2e-tree-properties-quick-display-button")));
        //utils.clickOnElement(element(by.id("e2e-tree-renderer-tree-sign-"+data.new_module_name)));

        utils.moveMouseOnElement("e2e-tree-renderer-edit-properties-"+data.new_instance_name+"-button",
                                 "e2e-tree-renderer-preview-properties-"+data.new_instance_name+"-button");

        utils.clickOnElement(element(by.id("e2e-tree-renderer-preview-properties-"+data.new_instance_name+"-button")));

        // Preview the new template file
        utils.clickOnElement(element(by.id("e2e-file-modal-preview-"+data.new_template_filename+"-button")));

        expect(element(by.id("e2e-file-modal-template-section-header-path-"+data.new_template_filename)).getText()).toBe(data.new_template_location+"/"+data.new_template_filename);

        // Preview the Json template
        utils.clickOnElement(element(by.id("e2e-file-modal-preview-"+data.json_new_template_filename+"-button")));

        expect(element(by.id("e2e-file-modal-template-section-header-path-"+data.json_new_template_filename)).getText()).toBe(data.json_new_template_location+"/"+data.json_new_template_filename);
    });

    afterAll((done) => process.nextTick(done) );
});
