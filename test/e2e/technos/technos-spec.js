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
var fs = require('fs');

describe('Manage technos', function() {

    beforeAll(function() {
        console.log("START describe Manage technos");
        browser.get(hesperides_url);
        // delete techno on hesperides for cleaning
        var path_to_techno_wc = hesperides_url+'/rest/templates/packages/'+data.new_techno_name+'/'+data.new_techno_version+'/workingcopy';
        utils.deleteHttpRequest(path_to_techno_wc,200,rest_options);
        var path_to_techno_release = hesperides_url+'/rest/templates/packages/'+data.new_techno_name+'/'+data.new_techno_version+'/release';
        utils.deleteHttpRequest(path_to_techno_release,200,rest_options);
        var path_to_techno_from = hesperides_url+'/rest/templates/packages/'+data.new_techno_name+'/'+data.new_techno_version+'_from/workingcopy';
        utils.deleteHttpRequest(path_to_techno_from,200,rest_options);
    });
    it('should create techno in working copy', function() {
        var elm_technoMenu = element(by.id("e2e-navbar-techno"));
        utils.clickOnElement(elm_technoMenu);
        var elm_createtechnoMenu = element(by.id("e2e-navbar-techno-create"));
        utils.clickOnElement(elm_createtechnoMenu);
        
        var elm_technoName = element(by.id('technoName'));
        elm_technoName.sendKeys(data.new_techno_name);
        var elm_technoVersion = element(by.id('technoVersion'));
        elm_technoVersion.sendKeys(data.new_techno_version);

        utils.clickToCreateAndCheckIfReallyCreated('techno-menu-modal_create-button','techno_create-release-button',hesperides_url+'/rest/templates/packages/'+data.new_techno_name+'/'+data.new_techno_version+'/workingcopy');
    });

    it('should add a template file to the new techno', function() {
        var elm_btn_add_template = element(by.id("template-list_create-template-button"));
        utils.clickOnElement(elm_btn_add_template);

        var input_template_name = element(by.id("templateName"));
        input_template_name.sendKeys(data.new_techno_conf_name);
        browser.waitForAngular();

        var input_template_name = element(by.id("templateFilename"));
        input_template_name.sendKeys(data.new_techno_conf_filename);
        browser.waitForAngular();

        var input_template_name = element(by.id("templateLocation"));
        input_template_name.sendKeys(data.new_techno_conf_location);
        browser.waitForAngular();

        browser.executeScript("var editor = $('.CodeMirror')[0].CodeMirror;editor.setValue('"+data.new_techno_conf_content+"');");


        var elm_save_and_close_template_button = element(by.id("template-modal_save-and-close-template-button"));
        elm_save_and_close_template_button.click().then(function(){
            var elm_template_title= element(by.id("template-list_template-module-link-"+data.new_techno_conf_name));
            expect(elm_template_title.getText()).toBe(data.new_techno_conf_location+"/"+data.new_techno_conf_filename);
        });
    });

    it('should download template file for a techno', function() {
        var filename = utils.getDownloadsPath()+data.new_techno_conf_filename;

        var elm_btn_download_file=element(by.id("template-list_download-template-module-button-"+data.new_techno_conf_name));
        utils.clickOnElement(elm_btn_download_file);

        browser.driver.wait(function() {
            // Wait until the file has been downloaded.
            // We need to wait thus as otherwise protractor has a nasty habit of
            // trying to do any following tests while the file is still being
            // downloaded and hasn't been moved to its final location.
            return fs.existsSync(filename);
        }, 1000).then(function() {
            // Do whatever checks you need here.  This is a simple comparison;
            // for a larger file you might want to do calculate the file's MD5
            // hash and see if it matches what you expect.
            expect(fs.readFileSync(filename, { encoding: 'utf8' })).toEqual(
                data.new_techno_conf_content
            );
        });

        var elm_btn_download_all_file=element(by.id("template-list_download-all-template-button"));
        utils.clickOnElement(elm_btn_download_all_file);
    });

    it('should find techno on autocomplete in menu "techno"', function() {
        var elm_technoMenu = element(by.id("e2e-navbar-techno"));
        utils.clickOnElement(elm_technoMenu);

        var elm_technoMenu_autocomplete = element(by.id("e2e-navbar-techno-autocomplete"));
        elm_technoMenu_autocomplete.sendKeys(data.new_techno_conf_name);
        browser.waitForAngular();

        expect(element.all(by.cssContainingText(".highlight",data.new_techno_name)).get(0));
    });

    afterAll(function(done) {
        process.nextTick(done);
    });

});
