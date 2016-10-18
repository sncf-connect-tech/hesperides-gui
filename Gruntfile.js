module.exports = function (grunt) {

    /**
     * Configuration
     */
    var config = {
        // localhost
        hesperides: {
            targetHost: 'localhost',
            targetPort: 8080
        },

        // daxmort
        //hesperides: {
        //    targetHost: 'daxmort',
        //    targetPort: 51000
        //},

        nexus: {
            targetHost: 'bloodymary.socrate.vsct.fr',
            targetPort: 50080
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
            sources: {
                files: [
                    'app/**/*.js',
                    'app/**/*.html',
                    'app/**/*.css',
                    '!app/bower_components/**/*.js'
                ],
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
                base: 'app'
            },
            proxies: [
                {
                    context: '/rest',
                    host: '<%= config.hesperides.targetHost %>',
                    port: '<%= config.hesperides.targetPort %>'
                },
                {
                    context: '/nexus-api',
                    host: '<%= config.nexus.targetHost %>',
                    port: '<%= config.nexus.targetPort %>',
                    rewrite: {
                        '^/nexus-api': '/nexus'
                    }
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

    /**
     * Registers the 'server' task.
     */
    grunt.registerTask('server', [
        'configureProxies:server',
        'connect:livereload',
        'watch'
    ]);

};
