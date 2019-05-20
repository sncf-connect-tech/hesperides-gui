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
var fs = require('fs');

describe('Manage technos', () => {

    beforeAll(() => {
        browser.get(hesperides_url);
        // delete techno on hesperides for cleaning
        utils.deleteHttpRequest(hesperides_url+'/rest/templates/packages/'+data.new_techno_name+'/'+data.new_techno_version+'/workingcopy');
        utils.deleteHttpRequest(hesperides_url+'/rest/templates/packages/'+data.new_techno_name+'/'+data.new_techno_version+'/release');
        utils.deleteHttpRequest(hesperides_url+'/rest/templates/packages/'+data.new_techno_name+'/'+data.new_techno_version+'_from/workingcopy');
    });

    it('should create techno in working copy', () => {
        utils.clickOnElement(element(by.id("e2e-navbar-techno")));
        utils.clickOnElement(element(by.id("e2e-navbar-techno-create")));

        element(by.css('#e2e-modal-techno-create input[name="technoName"]')).sendKeys(data.new_techno_name);
        element(by.css('#e2e-modal-techno-create input[name="technoVersion"]')).sendKeys(data.new_techno_version);

        element(by.css('#e2e-modal-techno-create button[type="submit"]')).click().then(() => {
            element(by.id('e2e-techno-create-release-button')).isPresent().then((isPresent) => {
                if (isPresent) {
                    utils.checkResponseStatusCode(hesperides_url+'/rest/templates/packages/'+data.new_techno_name+'/'+data.new_techno_version+'/workingcopy',200);
                }
            })
        });
    });

    it('should add a template file to the new techno', () => {
        utils.clickOnElement(element(by.id("e2e-template-list-create-template-button")));

        element(by.id("templateName")).sendKeys(data.new_techno_conf_name);
        browser.waitForAngular();

        element(by.id("templateFilename")).sendKeys(data.new_techno_conf_filename);
        browser.waitForAngular();

        element(by.id("templateLocation")).sendKeys(data.new_techno_conf_location);
        browser.waitForAngular();

        browser.executeScript("document.getElementsByClassName('CodeMirror')[0].CodeMirror.setValue('"+data.new_techno_conf_content+"');");

        element(by.id("template-modal_save-and-close-template-button")).click().then(() => {
            expect(element(by.id("template-list_template-module-link-"+data.new_techno_conf_name))
                .getText()).toBe(data.new_techno_conf_location+"/"+data.new_techno_conf_filename);
        });
    });

    it('should download template file for a techno', () => {
        var filename = utils.getDownloadsPath()+data.new_techno_conf_filename;

        utils.clickOnElement(element(by.id("template-list_download-template-module-button-"+data.new_techno_conf_name)));

        browser.driver.wait(() => {
            // Wait until the file has been downloaded.
            // We need to wait thus as otherwise protractor has a nasty habit of
            // trying to do any following tests while the file is still being
            // downloaded and hasn't been moved to its final location.
            return fs.existsSync(filename);
        }, 1000).then(() => {
            // Do whatever checks you need here.  This is a simple comparison;
            // for a larger file you might want to do calculate the file's MD5
            // hash and see if it matches what you expect.
            expect(fs.readFileSync(filename, { encoding: 'utf8' })).toEqual(
                data.new_techno_conf_content
            );
        });

        utils.clickOnElement(element(by.id("template-list_download-all-template-button")));
    });

    it('should find techno on autocomplete in menu "techno"', () => {
        utils.clickOnElement(element(by.id("e2e-navbar-techno")));

        element(by.id("e2e-navbar-techno-autocomplete")).sendKeys(data.new_techno_conf_name);
        browser.waitForAngular();

        expect(element.all(by.cssContainingText(".highlight",data.new_techno_name)).get(0));
    });

    afterAll((done) => process.nextTick(done) );

});
