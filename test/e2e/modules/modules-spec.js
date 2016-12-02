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
var fs = require('fs');

describe('Manage modules', function() {

    beforeAll(function() {
        console.log("START describe Manage modules");
        browser.get(hesperides_url);
        // delete module on hesperides for cleaning
        var path_to_module_wc = hesperides_url+'/rest/modules/'+data.new_module_name+'/'+data.new_module_version+'/workingcopy';
        vsct_utils.deleteHttpRequest(path_to_module_wc,200,rest_options);
        var path_to_module_release = hesperides_url+'/rest/modules/'+data.new_module_name+'/'+data.new_module_version+'/release';
        vsct_utils.deleteHttpRequest(path_to_module_release,200,rest_options);
        var path_to_module_from = hesperides_url+'/rest/modules/'+data.new_module_name+'/'+data.new_module_version+'_from/workingcopy';
        vsct_utils.deleteHttpRequest(path_to_module_from,200,rest_options);
    });
    it('should create module in working copy', function() {
        var elm_moduleMenu = element(by.id("menu_module-menu"));
        vsct_utils.clickOnElement(elm_moduleMenu);
        var elm_createModuleMenu = element(by.id("menu_module-create-menu"));
        vsct_utils.clickOnElement(elm_createModuleMenu);
        
        var elm_moduleName = element(by.id('moduleName'));
        elm_moduleName.sendKeys(data.new_module_name);
        var elm_moduleVersion = element(by.id('moduleVersion'));
        elm_moduleVersion.sendKeys(data.new_module_version);

        vsct_utils.clickToCreateAndCheckIfReallyCreated('module-menu-modal_create-button','module_create-release-button',hesperides_url+'/rest/modules/'+data.new_module_name+'/'+data.new_module_version+'/workingcopy');
    });
    it('should find module on autocomplete in menu "module"', function() {
        var elm_moduleMenu = element(by.id("menu_module-menu"));
        vsct_utils.clickOnElement(elm_moduleMenu);

        var input_autocomplete_module = element(by.id("input-2"));
        input_autocomplete_module.sendKeys(data.new_module_name);
        browser.waitForAngular();

        browser.driver.findElements(by.css('.md-autocomplete-suggestions li')).
            then(function(elems) {
                expect(elems.length).toBeGreaterThan(0);
            }
        );
    });

    it('should add a template in a working copy module', function() {
        browser.get(hesperides_url+"/#/module/"+data.new_module_name+"/"+data.new_module_version+"?type=workingcopy");

        // open modal
        var elm_open_modal_add_template = element(by.id("template-list_create-template-button"));
        vsct_utils.clickOnElement(elm_open_modal_add_template);

        // fill in informations
        var elm_template_title= element(by.id("templateName"));
        elm_template_title.sendKeys(data.new_template_title);
        var elm_template_filename= element(by.id("templateFilename"));
        elm_template_filename.sendKeys(data.new_template_filename);
        var elm_template_location= element(by.id("templateLocation"));
        elm_template_location.sendKeys(data.new_template_location);
        
        browser.executeScript("var editor = $('.CodeMirror')[0].CodeMirror;editor.setValue('"+data.new_template_content+"');");

        var elm_save_and_close_template_button = element(by.id("template-modal_save-and-close-template-button"));
        elm_save_and_close_template_button.click().then(function(){
            var elm_template_title= element(by.id("template-list_template-module-link-"+data.new_template_title));
            expect(elm_template_title.getText()).toBe(data.new_template_location+"/"+data.new_template_filename);
        });
    });

    it('should add a json template in a working copy module', function() {
        browser.get(hesperides_url+"/#/module/"+data.new_module_name+"/"+data.new_module_version+"?type=workingcopy");

        // open modal
        var elm_open_modal_add_template = element(by.id("template-list_create-template-button"));
        vsct_utils.clickOnElement(elm_open_modal_add_template);

        // fill in informations
        var elm_template_title= element(by.id("templateName"));
        elm_template_title.sendKeys(data.json_new_template_title);
        var elm_template_filename= element(by.id("templateFilename"));
        elm_template_filename.sendKeys(data.json_new_template_filename);
        var elm_template_location= element(by.id("templateLocation"));
        elm_template_location.sendKeys(data.json_new_template_location);

        browser.executeScript("var editor = $('.CodeMirror')[0].CodeMirror;editor.setValue('"+data.json_new_template_content+"');");

        var elm_save_and_close_template_button = element(by.id("template-modal_save-and-close-template-button"));
        elm_save_and_close_template_button.click().then(function(){
            var elm_template_title= element(by.id("template-list_template-module-link-"+data.json_new_template_title));
            expect(elm_template_title.getText()).toBe(data.json_new_template_location+"/"+data.json_new_template_filename);
        });
    });

    it('should download template file for a techno', function() {
        var filename = vsct_utils.getDownloadsPath()+data.json_new_template_filename;

        var elm_btn_download_file=element(by.id("template-list_download-template-module-button-"+data.json_new_template_title));
        vsct_utils.clickOnElement(elm_btn_download_file);

        browser.driver.wait(function() {
            // Wait until the file has been downloaded.
            // We need to wait thus as otherwise protractor has a nasty habit of
            // trying to do any following tests while the file is still being
            // downloaded and hasn't been moved to its final location.
            return fs.existsSync(filename);
        }, 2000).then(function() {
            // Do whatever checks you need here.  This is a simple comparison;
            // for a larger file you might want to do calculate the file's MD5
            // hash and see if it matches what you expect.
            expect(fs.readFileSync(filename, { encoding: 'utf8' })).toEqual(
                data.json_new_template_content
            );
        });

        var elm_btn_download_all_file=element(by.id("template-list_download-all-template-button"));
        vsct_utils.clickOnElement(elm_btn_download_all_file);
    });

    it('should add a template in a working copy module and delete it', function() {
        browser.get(hesperides_url+"/#/module/"+data.new_module_name+"/"+data.new_module_version+"?type=workingcopy");

        // open modal
        var elm_open_modal_add_template = element(by.id("template-list_create-template-button"));
        vsct_utils.clickOnElement(elm_open_modal_add_template);

        // fill in informations
        var elm_template_title= element(by.id("templateName"));
        elm_template_title.sendKeys(data.new_template_title+"_to_delete");
        var elm_template_filename= element(by.id("templateFilename"));
        elm_template_filename.sendKeys(data.new_template_filename+"_to_delete");
        var elm_template_location= element(by.id("templateLocation"));
        elm_template_location.sendKeys(data.new_template_location+"_to_delete");
        
        browser.executeScript("var editor = $('.CodeMirror')[0].CodeMirror;editor.setValue('"+data.new_template_content+"');");

        var elm_save_and_close_template_button = element(by.id("template-modal_save-and-close-template-button"));
        elm_save_and_close_template_button.click().then(function(){
            var elm_template_title= element(by.id("template-list_template-module-link-"+data.new_template_title+"_to_delete"));
            expect(elm_template_title.getText()).toBe(data.new_template_location+"_to_delete/"+data.new_template_filename+"_to_delete");
        });

        var elm_delete_template_button = element(by.id("template-list_trash-template-module-button-"+data.new_template_title+"_to_delete"));
        elm_delete_template_button.click().then(function(){
            browser.switchTo().alert().accept().then(
                function () {
                    var elm_template_title= element(by.id("template-list_template-module-link-"+data.new_template_title+"_to_delete"));
                    expect(browser.isElementPresent(elm_template_title)).toBe(false);
                },
                function () {return false;}
            );
        });
    });
    it('should release an existing working copy module', function() {
        browser.get(hesperides_url+"/#/module/"+data.new_module_name+"/"+data.new_module_version+"?type=workingcopy");

        // open modal
        var elm_open_modal_release_button = element(by.id("module_create-release-button"));
        vsct_utils.clickOnElement(elm_open_modal_release_button);

        // fill in informations
        var elm_release_version_input = element(by.id("release_version"));
        elm_release_version_input.sendKeys(data.new_module_version);
        var elm_create_module_release_button = element(by.id("create_release_create-button"));
        elm_create_module_release_button.click().then(function(){
            // we have to handle the alert box "are you sure to create the release"
            browser.switchTo().alert().accept().then(
                function () {
                    var elm_toCheckIfPageIsCorrectlyLoaded = element(by.id("module_associated-properties-button"));
                    elm_toCheckIfPageIsCorrectlyLoaded.isPresent().then(function(boolElemDisplayed){
                        if (boolElemDisplayed) {
                            var path_to_released_module = hesperides_url+'/rest/modules/'+data.new_module_name+'/'+data.new_module_version+'/release';
                            vsct_utils.checkResponseStatusCode(path_to_released_module,200,rest_options);
                            browser.waitForAngular();// ajout pour que le screenshot soit pris au bon moment
                        }
                    })
                },
                function () {return false;}
            );
        });
    });
    it('should create working copy module from an existing one', function() {
        var elm_moduleMenu = element(by.id("menu_module-menu"));
        vsct_utils.clickOnElement(elm_moduleMenu);
        var elm_createModuleFromMenu = element(by.id("menu_module-create-from-menu"));
        vsct_utils.clickOnElement(elm_createModuleFromMenu);
        
        var elm_moduleName = element(by.id('moduleName'));
        elm_moduleName.sendKeys(data.new_module_name);
        var elm_moduleVersion = element(by.id('moduleVersion'));
        elm_moduleVersion.sendKeys(data.new_module_version+"_from");
        var elm_moduleFrom = element(by.css('md-autocomplete input#module-menu-modal-from_input-module-autocomplete'));
        elm_moduleFrom.sendKeys(data.new_module_name+" "+data.new_module_version);
        browser.waitForAngular();//ajout pour que l'autocompletion soit prise en compte au moment du test

        browser.driver.findElements(by.css('.md-autocomplete-suggestions li')).
            then(function(elems) {
                vsct_utils.clickOnElement(elems[0]);
            }
        );

        vsct_utils.clickToCreateAndCheckIfReallyCreated('module-menu-modal-from_create-button','module_create-release-button',hesperides_url+'/rest/modules/'+data.new_module_name+'/'+data.new_module_version+'_from/workingcopy');
    });

    afterAll(function(done) {
        process.nextTick(done);
    });

});
