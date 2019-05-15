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
    menus: 'menus/*spec.js',
    create_technos: ['menus/*spec.js', 'technos/*spec.js'],
    create_platforms: ['menus/*spec.js', 'platforms/*spec.js'],
    create_modules: ['menus/*spec.js', 'modules/*spec.js'],
    logic_representation: 'logic-representation/*spec.js',
    createPlatforms_linkModules: ['platforms/*spec.js', 'modules/*spec.js', 'logic-representation/*spec.js'],
    createPlatforms_linkModules_fillProperties: ['platforms/*spec.js', 'modules/*spec.js', 'logic-representation/*spec.js','annotations/*spec.js'],
    preview_files : ['preview-files/*spec.js'],
    properties: ['menus/*spec.js', 'properties/*spec.js'],
    role_production: 'role_production/*spec.js',
    diff: 'diff/*spec.js',
    settings: 'settings/*spec.js',
    all: ['menus/*spec.js', 'technos/*spec.js', 'platforms/*spec.js',
          'modules/*spec.js', 'logic-representation/*spec.js',
          'properties/*spec.js', 'preview-files/*spec.js',
          'role_production/*spec.js', 'diff/*spec.js', 'settings/*spec.js']
  },
  onPrepare: function() {
    jasmine.getEnv().addReporter(
      new Jasmine2HtmlReporter({
        savePath: 'test-reports-e2e/'
      })
    );
    data = require('./config.json'); // variable globale utilisée dans les scénarios
    browser.get(data.endpoint_protocol+"://"+data.auth_username+":"+data.auth_password+"@"+data.endpoint_host+":"+data.endpoint_port);
  }
};
