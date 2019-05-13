const serveStatic = require('serve-static'),
      bundler = require('./bundler');

module.exports = function (grunt) {

    /**
     * Configuration
     */
    var config = {
        // localhost
        hesperides: {
            targetHost: 'localhost',
            targetPort: 8080
        }
    };

    /**
     * Grunt tasks configuration.
     */
    grunt.initConfig({

        /**
         * Project settings.
         */
        config: config,

        /**
         * Watches files for changes.
         */
        watch: {
            scripts: {
                files: [
                    'src/app/**/*.js',
                    'src/app/**/*.html',
                    'src/app/**/*.css',
                ],
                //tasks: ['bundler-generate-app-bundles'],
                options: {
                    livereload: true
                }
            }
        },

        /**
         * Launches a web server.
         */
        connect: {
            options: {
                hostname: 'localhost',
                port: 80,
                base: 'src/app'
            },
            proxies: [
                {
                    context: '/rest',
                    host: '<%= config.hesperides.targetHost %>',
                    port: '<%= config.hesperides.targetPort %>'
                }
            ],
            livereload: {
                options: {
                    open: true,
                    middleware: function (connect, options) {
                        var proxy = require('grunt-connect-proxy/lib/utils').proxyRequest;
                        return [
                            // Include the proxy first
                            proxy,
                            serveStatic(options.base[0]),
                        ];
                    }
                }
            }
        }
    });

    /**
     * Loads required Grunt tasks.
     */
    grunt.loadNpmTasks('grunt-connect-proxy');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');

    //grunt.registerTask('bundler-generate-app-bundles', bundler.generateAppBundles);

    /**
     * Registers the 'server' task.
     */
    grunt.registerTask('server', [
        'configureProxies:server',
        'connect:livereload',
        'watch'
    ]);

};
