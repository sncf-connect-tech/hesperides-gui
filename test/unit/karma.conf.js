// Karma configuration
// Generated on Tue Dec 06 2016 10:06:28 GMT+0100 (Paris, Madrid)

module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        plugins: [
            'karma-coverage',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-verbose-reporter',
        ],

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: [ 'jasmine' ],

        // list of files / patterns to load in the browser
        files: [
            // libs : l'ordre importe ! + on exclut app.js / vendor.min.js
            '../../src/app/vendor.js',
            '../../src/app/utils.js',
            '../../src/app/hesperides/hesperides.js',
            '../../src/app/local_changes/localChanges.js', // doit venir avant les autres fichiers dans local_changes/
            '../../src/app/properties/properties.js', // doit venir avant iterable-properties-container.js
            '../../src/app/*/**/*.js',

            // mocks
            '../../node_modules/angular-mocks/angular-mocks.js',
            '../../node_modules/angular-material/angular-material-mocks.js',

            // hesperides karma testing utilities
            'utils.js',

            // tests
            '*.spec.js',
        ],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
        // On exclut app.js / vendor.js / vendor.min.js
            '../../src/app/*/**/*.js': [ 'coverage' ],
            '../../src/app/utils.js': [ 'coverage' ],
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: [ 'progress', 'coverage' ],

        coverageReporter: {
            dir: 'reports',
            reporters: [
                { type: 'lcov', subdir: 'coverage' },
                { type: 'cobertura', subdir: '.', file: 'cobertura.xml' },
                { type: 'text', subdir: '.', file: 'coverage.txt' },
            ],
        },

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: [ 'Firefox' ],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity,
    });
};
