// Karma configuration
// Generated on Tue Dec 06 2016 10:06:28 GMT+0100 (Paris, Madrid)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      // libs
      'src/app/bower_components/angular/angular.min.js',
      'src/app/bower_components/angular-animate/angular-animate.min.js',
      'src/app/bower_components/angular-aria/angular-aria.min.js',
      'src/app/bower_components/angular-translate/angular-translate.js',
      'src/app/bower_components/angular-cookies/angular-cookies.min.js',
      'src/app/bower_components/angular-route/angular-route.min.js',
      'src/app/bower_components/store.js/dist/store.js',
      'src/app/bower_components/angular-material/angular-material.min.js',
      'src/app/bower_components/hesperides-datetime-picker/angularjs-datetime-picker.js',
      'src/app/bower_components/sc-date-time/dist/sc-date-time.js',
      'src/app/bower_components/angular-vs-repeat/src/angular-vs-repeat.js',
      'src/app/bower_components/angular-wizard/dist/angular-wizard.js',
      'src/app/bower_components/angular-ui-codemirror/ui-codemirror.js',
      'src/app/bower_components/angular-xeditable/dist/js/xeditable.js',
      'src/app/bower_components/angular-aria/angular-aria.js',
      'src/app/bower_components/x2js/xml2json.js',
      'src/app/bower_components/angular-xml/angular-xml.js',
      'src/app/bower_components/jquery/dist/jquery.min.js',
      'src/app/lib/*.js',

      // mocks
      'src/app/bower_components/angular-mocks/angular-mocks.js',
      'src/app/bower_components/angular-material/angular-material-mocks.js',

      // app files
      'src/app/hesperides/hesperides.js',
      'src/app/menu/menu.js',
      'src/app/local_changes/localChanges.js',
      'src/app/local_changes/localChangeFactory.js',
      'src/app/local_changes/localChangesServices.js',
      'src/app/local_changes/localChangesControllers.js',
      'src/app/application/application.js',
      'src/app/file/file.js',
      'src/app/user/user.js',
      'src/app/event/event.js',
      'src/app/module/module.js',
      'src/app/model/model.js',
      'src/app/properties/properties.js',
      'src/app/techno/techno.js',
      'src/app/template/template.js',
      'src/app/shared/components.js',
      'src/app/nexus/nexus.js',

      // hesperides karma testing utilities
      'test/unit/utils.js',

      // tests
      'test/unit/*.spec.js'
    ],

    // list of files to exclude
    exclude: [
      'src/app/bower_components/**/index.js',
      'src/app/swagger/**/*.js'
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: { 'src/app/!(*bower_components)/!(*spec).js': ['coverage'] },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress','html', 'coverage'],

    coverageReporter: {
      dir: 'reports',
      reporters: [
        {type: 'lcov', subdir: 'coverage'},
        {type: 'cobertura', subdir: '.', file: 'cobertura.xml'}
      ]
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Firefox'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
