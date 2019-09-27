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
            'stepDefinitions/*.js',
            'stepDefinitions/**/*.steps.js',
        ],
    },
    onPrepare() {
        global.baseUrl = 'http://user:password@localhost';
        global.testModuleName = 'module-ptor';
        global.testModuleVersion = '1.0';

        const { Given, Then, When, Before } = require('cucumber');
        global.Given = Given;
        global.When = When;
        global.Then = Then;
        global.Before = Before;

        return browser.get(global.baseUrl);
    },
};
