var Jasmine2HtmlReporter = require('protractor-jasmine2-html-reporter');
var utils = require('./utils.js');

exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  framework: 'jasmine2',
  jasmineNodeOpts: {
    stopSpecOnExpectationFailure: true,
    showColors: true,
    defaultTimeoutInterval: 400000,
    isVerbose: true,
    includeStackTrace: true
  },
  allScriptsTimeout: 400000,
  getPageTimeout: 400000,
  capabilities: utils.getCapabilities(),

  // For authentication required hesperides platforms, I did'nt find a better trick than putting
  // the menus tests on create_platform and create_modules otherwise, it doesn't work a reason I ignore ...
  suites: {
    // L'ordre importe car, par exemple, platforms/*spec.js crée une plateforme employée par diff/*spec.js :
    all: [
        'menus/*spec.js',
        'technos/*spec.js',
        'modules/*spec.js',
        'platforms/*spec.js',
        /* WIP: 'diff/*spec.js',
        'logic-representation/*spec.js',
        'preview-files/*spec.js',
        'properties/*spec.js',
        'role_production/*spec.js',
        'settings/*spec.js'
    /**/]
  },
  onPrepare: function() {
    jasmine.getEnv().addReporter(
      new Jasmine2HtmlReporter({
        savePath: 'test-reports-e2e/'
      })
    );

    // Variable globales utilisées dans les scénarios:
    data = require('./config.json');
    hesperides_url = data.endpoint_protocol+"://"+data.auth_username+":"+data.auth_password+"@"+data.endpoint_host+":"+data.endpoint_port
    
    browser.get(hesperides_url);
  }
};
