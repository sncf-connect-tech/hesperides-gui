const serveStatic = require('serve-static'),
      bundler = require('./bundler');

module.exports = function (grunt) {

    grunt.initConfig({

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
                base: 'src/app',
            },
            proxies: [
                {
                    context: '/rest',
                    host: 'localhost',
                    port: 8080
                }
            ],
            livereload: {
                options: {
                    open: true,
                    middleware: function (connect, options) {
                        return [
                            // Include the proxy first
                            require('grunt-connect-proxy/lib/utils').proxyRequest,
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

    /**
     * Registers the 'server' task.
     */
    grunt.registerTask('server', [
        'configureProxies:server',
        'connect:livereload',
        'watch'
    ]);
    //grunt.registerTask('bundler-generate-app-bundles', bundler.generateAppBundles);

};
