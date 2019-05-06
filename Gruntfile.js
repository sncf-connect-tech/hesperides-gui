const packager = require('./packager');

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
                //tasks: ['packager-generate-app-bundles'],
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
                            // Serve static files.
                            connect.static(options.base[0]),
                            // Make empty directories browsable.
                            connect.directory(options.base[0])
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

    //grunt.registerTask('packager-generate-app-bundles', packager.generateAppBundles);

    /**
     * Registers the 'server' task.
     */
    grunt.registerTask('server', [
        'configureProxies:server',
        'connect:livereload',
        'watch'
    ]);

};
