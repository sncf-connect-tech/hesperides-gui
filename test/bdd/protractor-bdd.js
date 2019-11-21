exports.config = {
    seleniumAddress: 'http://localhost:4444/wd/hub',
    capabilities: {
        browserName: 'chrome',
        chromeOptions: {
            // Avoid "unknown error: DevToolsActivePort file doesn't exist"
            args: [ '--no-sandbox' ],
        },
    },

    framework: 'custom',
    frameworkPath: require.resolve('protractor-cucumber-framework'),

    specs: [ 'features/**/*.feature' ],
    cucumberOpts: {
        require: [
            'glue/*.js',
            'glue/scenarios/commons.steps.js',
            'glue/scenarios/**/*.steps.js',
        ],
    },
    onPrepare() {
        global.baseUrl = 'http://prod:password@localhost';

        const { Given, Then, When } = require('cucumber');
        global.Given = Given;
        global.When = When;
        global.Then = Then;

        return browser.get(global.baseUrl);
    },
};
