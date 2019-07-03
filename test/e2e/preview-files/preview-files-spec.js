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

var fs = require('fs');
var util = require('util');
var JSZip = require('jszip');
var utils = require('../utils.js');

describe('Preview files', () => {
    beforeEach(() =>
        browser.get(`${ hesperides_url }/#/properties/${ data.new_application }?platform=${ data.new_platform }`)
    );

    it('should be able to preview files (TREE MODE) and check if template has the right location', () => {
        // set tree mode
        utils.clickOnElement(element(by.id('e2e-properties-show-tree-mode-button')));
        utils.clickOnElement(element(by.id(`e2e-tree-renderer-tree-sign-${ data.new_module_name }`)));

        utils.moveMouseOnElement(`e2e-tree-renderer-edit-instance-button-${ data.new_instance_name }`,
            `e2e-tree-renderer-preview-properties-${ data.new_instance_name }-button`);

        utils.clickOnElement(element(by.id(`e2e-tree-renderer-preview-properties-${ data.new_instance_name }-button`)));

        // Preview the new template file
        utils.clickOnElement(element(by.id(`e2e-file-modal-preview-${ data.new_template_title }-button`)));

        expect(element(by.id(`e2e-file-modal-template-section-header-path-${ data.new_template_title }`)).getText()).toBe(`${ data.new_template_location }/${ data.new_template_filename }`);

        // Preview the Json template
        utils.clickOnElement(element(by.id(`e2e-file-modal-preview-${ data.json_new_template_title }-button`)));

        expect(element(by.id(`e2e-file-modal-template-section-header-path-${ data.json_new_template_title }`)).getText()).toBe(`${ data.json_new_template_location }/${ data.json_new_template_filename }`);
    });

    it('should be able to download a single instance file (TREE MODE)', () => {
        // set tree mode
        utils.clickOnElement(element(by.id('e2e-properties-show-tree-mode-button')));
        utils.clickOnElement(element(by.id(`e2e-tree-renderer-tree-sign-${ data.new_module_name }`)));

        utils.moveMouseOnElement(`e2e-tree-renderer-edit-instance-button-${ data.new_instance_name }`,
            `e2e-tree-renderer-preview-properties-${ data.new_instance_name }-button`);

        utils.clickOnElement(element(by.id(`e2e-tree-renderer-preview-properties-${ data.new_instance_name }-button`)));

        utils.clickOnElement(element(by.id(`e2e-file-modal-template-download-button-${ data.json_new_template_title }`)));

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
                '{"user" : "", "role" : ""}'
            );
        });
    });

    it('should be able to download all files for an instance (TREE MODE)', () => {
        // set tree mode
        utils.clickOnElement(element(by.id('e2e-properties-show-tree-mode-button')));
        utils.clickOnElement(element(by.id(`e2e-tree-renderer-tree-sign-${ data.new_module_name }`)));

        utils.moveMouseOnElement(`e2e-tree-renderer-edit-instance-button-${ data.new_instance_name }`,
            `e2e-tree-renderer-preview-properties-${ data.new_instance_name }-button`);

        utils.clickOnElement(element(by.id(`e2e-tree-renderer-preview-properties-${ data.new_instance_name }-button`)));

        utils.clickOnElement(element(by.id('e2e-file-modal-template-download-all-button')));

        const downloadedZipFilepath = `${ utils.getDownloadsPath() }${ data.new_instance_name }.zip`;
        return browser.driver.wait(() =>
            // Wait until the file has been downloaded.
            // We need to wait thus as otherwise protractor has a nasty habit of
            // trying to do any following tests while the file is still being
            // downloaded and hasn't been moved to its final location.
            fs.existsSync(downloadedZipFilepath)
        , 2000).then(() => {
            // Do whatever checks you need here.  This is a simple comparison;
            // for a larger file you might want to do calculate the file's MD5
            // hash and see if it matches what you expect.
            console.log(`File ${ data.new_instance_name }.zip downloaded`);
            return expect(util.promisify(fs.readFile)(downloadedZipFilepath)
                .then(JSZip.loadAsync)
                .then((loadedZip) => loadedZip.file(data.json_new_template_filename).async('string'))
            ).toEqual(
                '{\n    "user": "",\n    "role": ""\n}'
            );
        });
    });

    afterEach(function cleanUp() {
        try {
            fs.unlinkSync(utils.getDownloadsPath() + data.json_new_template_filename);
        // eslint-disable-next-line no-empty
        } catch (exception) {} // le fichier peut ne pas exister donc on ignore toute erreur
    });
});
