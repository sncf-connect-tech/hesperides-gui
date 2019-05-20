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

describe('Manage modules', () => {

    beforeAll(() => {
        browser.get(hesperides_url);
        // delete module on hesperides for cleaning
        utils.deleteHttpRequest(hesperides_url+'/rest/modules/'+data.new_module_name+'/'+data.new_module_version+'/workingcopy');
        utils.deleteHttpRequest(hesperides_url+'/rest/modules/'+data.new_module_name+'/'+data.new_module_version+'/release');
        utils.deleteHttpRequest(hesperides_url+'/rest/modules/'+data.new_module_name+'/'+data.new_module_version+'_from/workingcopy');
    });

    it('should create module in working copy', () => {
        utils.clickOnElement(element(by.id("e2e-navbar-module")));
        utils.clickOnElement(element(by.id("e2e-navbar-module-create")));
        
        element(by.id('moduleName')).sendKeys(data.new_module_name);
        element(by.id('moduleVersion')).sendKeys(data.new_module_version);

        utils.clickToCreateAndCheckIfReallyCreated('module-menu-modal_create-button','module_create-release-button',hesperides_url+'/rest/modules/'+data.new_module_name+'/'+data.new_module_version+'/workingcopy');
    });

    it('should find module on autocomplete in menu "module"', () => {
        utils.clickOnElement(element(by.id("e2e-navbar-module")));

        element(by.id("input-2")).sendKeys(data.new_module_name);
        browser.waitForAngular();

        browser.driver.findElements(by.css('.md-autocomplete-suggestions li')).
            then(function(elems) {
                expect(elems.length).toBeGreaterThan(0);
            }
        );
    });

    it('should add a template in a working copy module', () => {
        browser.get(hesperides_url+"/#/module/"+data.new_module_name+"/"+data.new_module_version+"?type=workingcopy");

        // open modal
        utils.clickOnElement(element(by.id("e2e-template-list-create-template-button")));

        // fill in informations
        element(by.id("templateName")).sendKeys(data.new_template_title);
        element(by.id("templateFilename")).sendKeys(data.new_template_filename);
        element(by.id("templateLocation")).sendKeys(data.new_template_location);
        
        browser.executeScript("var editor = $('.CodeMirror')[0].CodeMirror;editor.setValue('"+data.new_template_content+"');");

        element(by.id("template-modal_save-and-close-template-button")).click().then(() => {
            expect(element(by.id("template-list_template-module-link-"+data.new_template_title)).getText()).toBe(data.new_template_location+"/"+data.new_template_filename);
        });
    });

    it('should add a json template in a working copy module', () => {
        browser.get(hesperides_url+"/#/module/"+data.new_module_name+"/"+data.new_module_version+"?type=workingcopy");

        // open modal
        utils.clickOnElement(element(by.id("e2e-template-list-create-template-button")));

        // fill in informations
        element(by.id("templateName")).sendKeys(data.json_new_template_title);
        element(by.id("templateFilename")).sendKeys(data.json_new_template_filename);
        element(by.id("templateLocation")).sendKeys(data.json_new_template_location);

        browser.executeScript("var editor = $('.CodeMirror')[0].CodeMirror;editor.setValue('"+data.json_new_template_content+"');");

        element(by.id("template-modal_save-and-close-template-button")).click().then(function(){
            expect(element(by.id("template-list_template-module-link-"+data.json_new_template_title))
                .getText()).toBe(data.json_new_template_location+"/"+data.json_new_template_filename);
        });
    });

    it('should download template file for a techno', function() {
        var filename = utils.getDownloadsPath()+data.json_new_template_filename;

        utils.clickOnElement(element(by.id("template-list_download-template-module-button-"+data.json_new_template_title)));

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

        utils.clickOnElement(element(by.id("template-list_download-all-template-button")));
    });

    it('should add a template in a working copy module and delete it', () => {
        browser.get(hesperides_url+"/#/module/"+data.new_module_name+"/"+data.new_module_version+"?type=workingcopy");

        // open modal
        utils.clickOnElement(element(by.id("e2e-template-list-create-template-button")));

        // fill in informations
        element(by.id("templateName")).sendKeys(data.new_template_title+"_to_delete");
        element(by.id("templateFilename")).sendKeys(data.new_template_filename+"_to_delete");
        (by.id("templateLocation")).sendKeys(data.new_template_location+"_to_delete");
        
        browser.executeScript("var editor = $('.CodeMirror')[0].CodeMirror;editor.setValue('"+data.new_template_content+"');");

        element(by.id("template-modal_save-and-close-template-button")).click().then(function(){
            expect(element(by.id("template-list_template-module-link-"+data.new_template_title+"_to_delete"))
                .getText()).toBe(data.new_template_location+"_to_delete/"+data.new_template_filename+"_to_delete");
        });

        element(by.id("template-list_trash-template-module-button-"+data.new_template_title+"_to_delete")).click().then(function(){
            browser.switchTo().alert().accept().then(
                function () {
                    expect(browser.isElementPresent(element(by.id("template-list_template-module-link-"+data.new_template_title+"_to_delete")))).toBe(false);
                },
                function () {return false;}
            );
        });
    });
    it('should release an existing working copy module', () => {
        browser.get(hesperides_url+"/#/module/"+data.new_module_name+"/"+data.new_module_version+"?type=workingcopy");

        // open modal
        utils.clickOnElement(element(by.id("module_create-release-button")));

        // fill in informations
        element(by.id("release_version")).sendKeys(data.new_module_version);
        element(by.id("create_release_create-button")).click().then(() => {
            // we have to handle the alert box "are you sure to create the release"
            browser.switchTo().alert().accept().then(
                () => {
                    element(by.id("module_associated-properties-button")).isPresent().then((isPresent) => {
                        if (isPresent) {
                            var path_to_released_module = hesperides_url+'/rest/modules/'+data.new_module_name+'/'+data.new_module_version+'/release';
                            utils.checkResponseStatusCode(path_to_released_module,200);
                            browser.waitForAngular();// ajout pour que le screenshot soit pris au bon moment
                        }
                    })
                },
                () => false
            );
        });
    });
    it('should create working copy module from an existing one', () => {
        utils.clickOnElement(element(by.id("e2e-navbar-module")));
        utils.clickOnElement(element(by.id("e2e-navbar-module-create-from")));
        
        element(by.id('moduleName')).sendKeys(data.new_module_name);
        element(by.id('moduleVersion')).sendKeys(data.new_module_version+"_from");
        element(by.css('md-autocomplete input#module-menu-modal-from_input-module-autocomplete')).sendKeys(data.new_module_name+" "+data.new_module_version);
        browser.waitForAngular();//ajout pour que l'autocompletion soit prise en compte au moment du test

        browser.driver.findElements(by.css('.md-autocomplete-suggestions li'))
            .then((elems) => utils.clickOnElement(elems[0]) );

        utils.clickToCreateAndCheckIfReallyCreated('module-menu-modal-from_create-button','module_create-release-button',hesperides_url+'/rest/modules/'+data.new_module_name+'/'+data.new_module_version+'_from/workingcopy');
    });

    afterAll((done) => process.nextTick(done) );

});
