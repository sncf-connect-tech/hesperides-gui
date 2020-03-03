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
    cucumberOpts: { // Doc: https://github.com/cucumber/cucumber-js/blob/master/docs/cli.md
        // fail-fast: true,
        require: [
            'glue/*.js',
            'glue/scenarios/**/*.js',
        ],
        // retry: 1,
        strict: true, // fail if there are pending or undefined steps
        tags: '@wip',
    },
    onPrepare() {
        const { Given, Then, When } = require('cucumber');
        global.Given = Given;
        global.When = When;
        global.Then = Then;

        global.baseUrl = 'http://user:password@localhost';
        global.downloadsPath = downloadsPath;
        browser.driver.manage().window().maximize();
    },
};
