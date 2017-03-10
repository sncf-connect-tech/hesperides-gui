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

var vsct_utils = require('../lib/lib.js');
var fs = require('fs');

var emptyConfig = '{}';
var hipchatConfig = '{"feedbackRoomName": "Hesperides notification"}';
var configFile = vsct_utils.getConfigPath()+"config.json";
var backupConfigFile = vsct_utils.getConfigPath()+"config.json.backup";

describe('Manage feedback', function() {

    beforeAll(function() {
        console.log("START describe Manage feedback");

        // Backup config file if exists
        if (fs.existsSync(configFile)) {
            var backupConfig = fs.readFileSync(configFile,'utf8');

            fs.writeFileSync(backupConfigFile, backupConfig);
        }
    });
    it('should display/hide send feedback button', function() {
        // Send Feedback button display when config.json has feedbackRoomName
        // init config file with feedbackRoomName properties
        fs.writeFileSync(configFile, hipchatConfig);
        expect(element.all(by.css("#feedback-button-contact-us")).count()).toEqual(1);

        // Send Feedback button hide when config.json hasn't feedbackRoomName
        // empty config file
        fs.writeFileSync(configFile, emptyConfig);
        browser.refresh()
        expect(element.all(by.css("#feedback-button-contact-us")).count()).toEqual(0);
    });
    afterAll(function(done) {
        // Backup config file if exists
        if (fs.existsSync(backupConfigFile)) {
            var backupConfig = fs.readFileSync(backupConfigFile,'utf8');

            fs.writeFileSync(configFile, backupConfig);

            fs.unlinkSync(backupConfigFile);
        } else {
            fs.unlinkSync(configFile);
        }

        process.nextTick(done);
    });
});
