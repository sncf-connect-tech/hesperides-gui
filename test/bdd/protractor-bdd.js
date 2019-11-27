const path = require('path');
const downloadsPath = path.format({ dir: __dirname });

exports.config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    capabilities: {
        browserName: 'chrome',
        chromeOptions: {
            // Avoid "unknown error: DevToolsActivePort file doesn't exist"
            args: [ '--no-sandbox' ],
            prefs: {
                download: {
                    'prompt_for_download': false,
                    'default_directory': downloadsPath,
                },
            },
        },
    },

    framework: 'custom',
    frameworkPath: require.resolve('protractor-cucumber-framework'),

    specs: [ 'features/**/*.feature' ],
    cucumberOpts: {
        require: [
            'glue/*.js',
            'glue/scenarios/**/*.js',
        ],
    },
    onPrepare() {
        global.baseUrl = 'http://prod:password@localhost';
        global.downloadsPath = downloadsPath;

        const { Given, Then, When } = require('cucumber');
        global.Given = Given;
        global.When = When;
        global.Then = Then;

        return browser.get(global.baseUrl);
    },
};
