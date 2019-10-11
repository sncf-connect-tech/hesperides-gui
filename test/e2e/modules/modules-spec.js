/* eslint-disable no-sync */
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

describe('Manage modules', () => {
    beforeAll(() => {
        browser.get(hesperides_url);
        // delete all modules for cleaning
        utils.deleteHttpRequest(`${ hesperides_url }/rest/modules/${ data.new_module_name }/${ data.new_module_version }/workingcopy`);
        utils.deleteHttpRequest(`${ hesperides_url }/rest/modules/${ data.new_module_name }/${ data.new_module_version }/release`);
        utils.deleteHttpRequest(`${ hesperides_url }/rest/modules/${ data.new_module_name }/${ data.new_module_version }_from/workingcopy`);
        // We delete any platforms that could be using modules:
        utils.deleteHttpRequest(`${ hesperides_url }/rest/applications/${ data.new_application }/platforms/${ data.new_platform }`);
        utils.deleteHttpRequest(`${ hesperides_url }/rest/applications/${ data.new_application }/platforms/${ data.new_platform }_from`);
    });

    it('should create module in working copy', () => {
        utils.clickOnElement(element(by.id('e2e-navbar-module')));
        utils.clickOnElement(element(by.id('e2e-navbar-module-create')));

        element(by.css('#e2e-modal-module-create input[name="moduleName"]')).sendKeys(data.new_module_name);
        element(by.css('#e2e-modal-module-create input[name="moduleVersion"]')).sendKeys(data.new_module_version);

        return element(by.css('#e2e-modal-module-create button[type="submit"]')).click().then(() => {
            utils.checkSuccessNotification('The working copy of the module has been created');
            element(by.id('e2e-module-create-release-button')).isPresent().then((isPresent) => {
                expect(isPresent).toBe(true);
                return utils.checkResponseStatusCode(`${ hesperides_url }/rest/modules/${ data.new_module_name }/${ data.new_module_version }/workingcopy`, 200);
            });
        });
    });

    it('should find module on autocomplete in menu "module"', () => {
        utils.clickOnElement(element(by.id('e2e-navbar-module')));

        element(by.id('input-2')).sendKeys(data.new_module_name);
        browser.waitForAngular();

        browser.driver.findElements(by.css('.md-autocomplete-suggestions li'))
            .then((elems) => expect(elems.length).toBeGreaterThan(0));
    });

    it('should add a template in a working copy module', () => {
        browser.get(`${ hesperides_url }/#/module/${ data.new_module_name }/${ data.new_module_version }?type=workingcopy`);

        utils.clickOnElement(element(by.id('e2e-template-list-create-template-button')));

        element(by.css('input[name="templateName"]')).sendKeys(data.new_template_title);
        element(by.css('input[name="templateFilename"]')).sendKeys(data.new_template_filename);
        element(by.css('input[name="templateLocation"]')).sendKeys(data.new_template_location);

        browser.executeScript(`document.getElementsByClassName('CodeMirror')[0].CodeMirror.setValue('${ data.new_template_content }');`);

        element(by.css('button[type="submit"]')).click().then(() => {
            utils.checkSuccessNotification('The template has been created');
            expect(element(by.css(`#e2e-template-list a[title="${ data.new_template_location }/${ data.new_template_filename }"]`)).isPresent()).toBe(true);
        });
    });

    it('should add a json template in a working copy module', () => {
        browser.get(`${ hesperides_url }/#/module/${ data.new_module_name }/${ data.new_module_version }?type=workingcopy`);

        utils.clickOnElement(element(by.id('e2e-template-list-create-template-button')));

        element(by.css('input[name="templateName"]')).sendKeys(data.json_new_template_title);
        element(by.css('input[name="templateFilename"]')).sendKeys(data.json_new_template_filename);
        element(by.css('input[name="templateLocation"]')).sendKeys(data.json_new_template_location);

        browser.executeScript(`document.getElementsByClassName('CodeMirror')[0].CodeMirror.setValue('${ data.json_new_template_content }');`);

        element(by.css('button[type="submit"]')).click().then(() => {
            utils.checkSuccessNotification('The template has been created');
            expect(element(by.css(`#e2e-template-list a[title="${ data.json_new_template_location }/${ data.json_new_template_filename }"]`)).isPresent()).toBe(true);
        });
    });

    it('should be able to download a module template as a file', () => {
        utils.clickOnElement(element(by.id(`e2e-template-list-download-button-for-${ data.json_new_template_title }`)));

        const filename = utils.getDownloadsPath() + data.json_new_template_filename;
        return browser.driver.wait(() =>
            // Wait until the file has been downloaded.
            // We need to wait thus as otherwise protractor has a nasty habit of
            // trying to do any following tests while the file is still being
            // downloaded and hasn't been moved to its final location.
            fs.existsSync(filename)
        , 2000).then(() => {
            // Do whatever checks you need here.  This is a simple comparison;
            // for a larger file you might want to do calculate the file's MD5
            // hash and see if it matches what you expect.
            console.log(`File ${ data.json_new_template_filename } downloaded`);
            return expect(fs.readFileSync(filename, { encoding: 'utf8' })).toEqual(
                data.json_new_template_content
            );
        }).then(() => utils.clickOnElement(element(by.id('e2e-template-list-download-all-button'))));
    });

    it('should add a template in a working copy module and delete it', () => {
        browser.get(`${ hesperides_url }/#/module/${ data.new_module_name }/${ data.new_module_version }?type=workingcopy`);

        // open modal
        utils.clickOnElement(element(by.id('e2e-template-list-create-template-button')));

        // fill in informations
        element(by.css('input[name="templateName"]')).sendKeys(`${ data.new_template_title }_to_delete`);
        element(by.css('input[name="templateFilename"]')).sendKeys(`${ data.new_template_filename }_to_delete`);
        element(by.css('input[name="templateLocation"]')).sendKeys(`${ data.new_template_location }_to_delete`);

        browser.executeScript(`document.getElementsByClassName('CodeMirror')[0].CodeMirror.setValue('${ data.new_template_content }');`);

        element(by.css('button[type="submit"]')).click().then(() => {
            utils.checkSuccessNotification('The template has been created');
            expect(element(by.css(`#e2e-template-list a[title="${ data.new_template_location }_to_delete/${ data.new_template_filename }_to_delete"]`)).isPresent()).toBe(true);
        });

        element(by.id(`e2e-template-list-trash-button-for-${ data.new_template_title }_to_delete`)).click().then(() => {
            browser.switchTo().alert().accept().then(() => {
                utils.checkSuccessNotification('The template has been deleted');
                expect(element(by.css(`#e2e-template-list a[title="${ data.new_template_location }_to_delete/${ data.new_template_filename }_to_delete"]`)).isPresent()).toBe(false);
            });
        });
    });

    it('should release an existing working copy module', () => {
        browser.get(`${ hesperides_url }/#/module/${ data.new_module_name }/${ data.new_module_version }?type=workingcopy`);

        // open modal
        utils.clickOnElement(element(by.id('e2e-module-create-release-button')));

        // fill in informations
        element(by.css('input[name="release-version"]')).sendKeys(data.new_module_version);
        return element(by.css('button[type="submit"]')).click().then(() =>
            // we have to handle the alert box "are you sure to create the release"
            browser.switchTo().alert().accept().then(
                () => element(by.id('e2e-module-associated-properties-button')).isPresent().then((isPresent) => {
                    expect(isPresent).toBe(true);
                    return utils.checkResponseStatusCode(`${ hesperides_url }/rest/modules/${ data.new_module_name }/${ data.new_module_version }/release`, 200);
                }),
                () => false
            )
        );
    });

    it('should create working copy module from an existing one', () => {
        utils.waitForNotificationToDisappear(); // La notif peut masquer le menu des modules de la navbar
        utils.clickOnElement(element(by.id('e2e-navbar-module')));
        utils.clickOnElement(element(by.id('e2e-navbar-module-create-from')));

        element(by.css('#e2e-modal-module-create-from input[name="moduleName"]')).sendKeys(`${ data.new_module_name }_from`);
        element(by.css('#e2e-modal-module-create-from input[name="moduleVersion"]')).sendKeys(data.new_module_version);
        element(by.css('md-autocomplete input#module-menu-modal-from_input-module-autocomplete')).sendKeys(`${ data.new_module_name } ${ data.new_module_version }`);
        browser.waitForAngular();// ajout pour que l'autocompletion soit prise en compte au moment du test

        browser.driver.findElements(by.css('.md-autocomplete-suggestions li'))
            .then((elems) => utils.clickOnElement(elems[0]));

        return element(by.css('#e2e-modal-module-create-from button[type="submit"]')).click().then(() =>
            element(by.id('e2e-module-create-release-button')).isPresent().then((isPresent) => {
                expect(isPresent).toBe(true);
                return utils.checkResponseStatusCode(`${ hesperides_url }/rest/modules/${ data.new_module_name }_from/${ data.new_module_version }/workingcopy`, 200);
            })
        );
    });

    afterEach(function cleanUp() {
        try {
            fs.unlinkSync(utils.getDownloadsPath() + data.json_new_template_content);
        // eslint-disable-next-line no-empty
        } catch (exception) {} // le fichier peut ne pas exister donc on ignore toute erreur
    });
});
