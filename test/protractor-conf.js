var Jasmine2HtmlReporter = require('protractor-jasmine2-html-reporter');
var lib = require('./e2e/lib/lib.js');

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
  params: {
    data_json: "data/data_hesperides.json"
  },
  capabilities: lib.getCapabilities(),

  // For authentication required hesperides platforms, I did'nt find a better trick than putting
  // the menus tests on create_platform and create_modules otherwise, it doesn't work a reason I ignore ...
  suites: {
    menus: 'test/e2e/menus/*spec.js',
    create_technos: ['e2e/menus/*spec.js', 'e2e/technos/*spec.js'],
    create_platforms: ['e2e/menus/*spec.js', 'e2e/platforms/*spec.js'],
    create_modules: ['e2e/menus/*spec.js', 'e2e/modules/*spec.js'],
    logic_representation: 'e2e/logic-representation/*spec.js',
    createPlatforms_linkModules: ['e2e/platforms/*spec.js', 'e2e/modules/*spec.js', 'e2e/logic-representation/*spec.js'],
    createPlatforms_linkModules_fillProperties: ['e2e/platforms/*spec.js', 'e2e/modules/*spec.js', 'e2e/logic-representation/*spec.js','e2e/annotations/*spec.js'],
    preview_files : ['e2e/preview-files/*spec.js'],
    properties: ['e2e/menus/*spec.js', 'e2e/properties/*spec.js'],
    role_production: 'e2e/role_production/*spec.js',
    diff: 'e2e/diff/*spec.js',
    all: ['e2e/menus/*spec.js', 'e2e/technos/*spec.js', 'e2e/platforms/*spec.js',
          'e2e/modules/*spec.js', 'e2e/logic-representation/*spec.js',
          'e2e/properties/*spec.js', 'e2e/preview-files/*spec.js',
          'e2e/role_production/*spec.js', 'e2e/diff/*spec.js']
  },
  onPrepare: function() {
    jasmine.getEnv().addReporter(
      new Jasmine2HtmlReporter({
        savePath: 'reports/'
      })
    );
    // load data from json and display for info
    data=require('./'+browser.params.data_json)
    console.log("Using following datas : "+JSON.stringify(data))

    // hesperides_connect_url : init connexion with LDAP username/password
    hesperides_connect_url = data.hesperides_protocol+"://"+data.hesperides_SA_username+":"+data.hesperides_SA_password+"@"+data.hesperides_host+":"+data.hesperides_port;

    hesperides_url = data.hesperides_protocol+"://"+data.hesperides_host+":"+data.hesperides_port;

    rest_options = {"headers": { 'Authorization': data.hesperides_token_auth}};

    // init connexion to hesperides (particularly to authorize user)
    browser.get(hesperides_connect_url);
  }
};
