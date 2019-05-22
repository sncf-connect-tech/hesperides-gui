var HtmlReporter = require('protractor-jasmine2-html-reporter');
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
        'logic-representation/*spec.js',
        'diff/*spec.js',
        'preview-files/*spec.js',
        'role_production/*spec.js',
        /* WIP: 'properties/*spec.js',
        'settings/*spec.js'*/
    ]
  },
  onPrepare: function() {
    jasmine.getEnv().addReporter(
      new HtmlReporter({
        savePath: 'test-reports-e2e/'
      })
    );

    // Variable globales utilisées dans les scénarios:
    data = require('./config.json');
    //data.new_module_properties_path = '#' + data.logic_group_1 + '#' + data.logic_group_2 + '#' + data.new_module_name + '#' + data.new_module_version + '#WORKINGCOPY';
    hesperides_url = data.endpoint_protocol+"://"+data.auth_username+":"+data.auth_password+"@"+data.endpoint_host+":"+data.endpoint_port
    
    browser.get(hesperides_url);
  }
};
