/*
 * This file is part of the Hesperides distribution.
 * (https://github.com/voyages-sncf-technologies/hesperides)
 * Copyright (c) 2016 VSCT.
 *
 * Hesperides is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as
 * published by the Free Software Foundation, version 3.
 *
 * Hesperides is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
var applicationModule = angular.module('hesperides.application', []);


applicationModule.factory('Application', ['Platform', function (Platform) {

    var Application = function (data) {

        var me = this;

        angular.extend(this, {
            name: "",
            platforms: []
        }, data);

        //Object casting when application is created
        this.platforms = _.map(this.platforms, function (data) {
            return new Platform(data);
        });

    };

    return Application;

}]);

applicationModule.factory('Platform', ['ApplicationModule', 'Properties', function (Module, Properties) {

    var _prettify_path = function (path) {
        // Remove the first '#' if present
        if (path.charAt(0) === '#') {
            path = path.substring(1, path.length);
        }

        if ( path.length == 0 ){
            return "";
        }

        splitted_path = path.split('#');

        last_pos = splitted_path.length - 1;

        prettify_module = splitted_path[last_pos - 2] + ', ' + splitted_path[last_pos - 1] +
        (splitted_path[last_pos] === 'WORKINGCOPY' ? ' (working copy) ' : '');

        splitted_path = splitted_path.slice(0, splitted_path.length - 3);

        path = splitted_path.join(' > ') + ' > ' + prettify_module;

        return path;
    };

    var Platform = function (data) {

        var me = this;

        angular.extend(this, {
            name: "",
            application_name: "",
            application_version: "",
            modules: [],
            global_properties: new Properties(),
            global_properties_usage: null,
            production: false,
            version_id: -1
        }, data);

        if (!_.isUndefined(this.platform_name)) {//When it comes from rest entity
            this.name = this.platform_name;
        }

        //Object casting when application is created
        this.modules = _.map(this.modules, function (data) {
            return new Module(data);
        });

        //Volontarly do not turn platform global properties to rest. Those are handled via the API Rest for properties
        this.to_rest_entity = function () {
            return {
                platform_name: this.name,
                application_name: this.application_name,
                application_version: this.application_version,
                production: this.production,
                modules: _.map(this.modules, function (module) {
                    return module.to_rest_entity();
                }),
                version_id: this.version_id
            };
        };

        this.prettify_path = _prettify_path;
    };

    Platform.prettify_path = _prettify_path;

    return Platform;

}]);

applicationModule.factory('ApplicationModule', ['Instance', function (Instance) {

    var ApplicationModule = function (data) {
        angular.extend(this, {
            id: 0,
            name: "",
            version: "",
            is_working_copy: true,
            opened: false,
            instances: []
        }, data);

        if (!_.isUndefined(data.working_copy)) { //When it is created through a rest entity
            this.is_working_copy = data.working_copy;
        }

        /* Object casting when instance is created */
        this.instances = _.map(this.instances, function (data) {
            return new Instance(data);
        });

        this.title = this.name + ', ' + this.version + (this.is_working_copy ? ' (working copy)' : '');

        this.create_new_instance = function (name) {
            if (!_.find(this.instances, function (instance) {
                    return instance.name === name;
                })) {
                this.instances.push(new Instance({name: name}));
            }
        };

        this.delete_instance = function (instance) {
            this.instances = _.without(this.instances, instance);
        };

        this.delete_instances = function () {
            this.instances = [];
        };

        this.to_rest_entity = function () {
            return {
                id: this.id,
                name: this.name,
                version: this.version,
                working_copy: this.is_working_copy,
                deployment_group: this.deployment_group,
                path: this.path,
                instances: _.map(this.instances, function (instance) {
                    return instance.to_rest_entity();
                })
            };
        };

    };

    return ApplicationModule;

}]);

applicationModule.factory('InstanceModel', function () {

    var InstanceModel = function (data) {

        angular.extend(this, {
            keys: []
        }, data);

        this.hasKey = function (name) {
            return this.keys.some(function (key) {
                return key.name === name;
            });
        };

    };

    return InstanceModel;

});

applicationModule.factory('Instance', function () {

    var Instance = function (data) {

        angular.extend(this, {
            name: "",
            key_values: []
        }, data);

        this.hasKey = function (name) {
            return _.some(this.key_values, function (key) {
                return key.name === name;
            });
        };

        this.mergeWithModel = function (model) {
            var me = this;

            /* Mark key_values that are in the model */
            _.each(this.key_values, function (key_value) {
                key_value.inModel = model.hasKey(key_value.name);
            });

            /* Add key_values that are only in the model */
            _(model.keys).filter(function (model_key_value) {
                return !me.hasKey(model_key_value.name);
            }).each(function (model_key_value) {
                me.key_values.push({
                    name: model_key_value.name,
                    comment: model_key_value.comment,
                    value: "",
                    inModel: true
                });
            });

            return this;
        };

        this.to_rest_entity = function () {
            return {
                name: this.name,
                key_values: _.map(this.key_values, function (kv) {
                    return {
                        name: kv.name,
                        comment: kv.comment,
                        value: kv.value
                    }
                })
            }
        }

    };

    return Instance;

});

applicationModule.service('ApplicationService', ['$hesperidesHttp', 'Application', 'Platform', 'Properties', 'InstanceModel', '$translate', '$location',
    function ($http, Application, Platform, Properties, InstanceModel, $translate, $location) {

    return {
        get: function (name, unsecured) {
            var me = this;
            me.unsecured = unsecured;

            return $http.get('rest/applications/' + encodeURIComponent(name)).then(function (response) {
                current_platform = _.find(response.data.platforms, { 'platform_name': $location.search().platform});
                store.set('current_platform_versionID', current_platform != undefined ? current_platform.version_id : '');
                return new Application(response.data);;
            }, function (error) {
                if (!me.unsecured) {
                    $.notify(error.data.message, "error");
                }
                throw error;
            });
        },
        with_name_like: function (name) {
            return $http.post('rest/applications/perform_search?name=' + encodeURIComponent(name)).then(function (response) {
                return response.data;
            }, function (error) {
                $.notify(error.data.message, "error");
                throw error;
            });
        },
        get_platform_name_of_application: function(application_name, platform_name){
            return $http.post('rest/applications/platforms/perform_search?applicationName=' + encodeURIComponent(application_name) +
                   "&platformName="+ encodeURIComponent(platform_name)).then(function (response) {
                return response.data;
            }, function (error) {
                $.notify(error.data.message, "error");
                throw error;
            });
        },
        get_platform: function (application_name, platform_name, timestamp, unsecured) {
            var me = this;
            me.unsecured = unsecured;
            if (_.isUndefined(timestamp)) {
                var url = 'rest/applications/' + encodeURIComponent(application_name) + '/platforms/' + encodeURIComponent(platform_name);
            } else {
                var url = 'rest/applications/' + encodeURIComponent(application_name) + '/platforms/' + encodeURIComponent(platform_name) + '?timestamp=' + timestamp;
            }
            return $http.get(url).then(function (response) {
                //Try to get the global properties
                var platform = new Platform(response.data);
                store.set('current_platform_versionID', platform.version_id);
                me.get_properties(application_name, platform_name, "#", timestamp).then(function (properties) {
                    platform.global_properties = properties;
                });
                return platform;
            }, function (error) {
                if (!me.unsecured) {
                    $.notify(error.data.message, "error");
                }
                throw error;
            });
        },
        save_platform: function (platform, copyPropertiesOfUpdatedModules) {
            var me = this;
            if (_.isUndefined(copyPropertiesOfUpdatedModules)) {
                copyPropertiesOfUpdatedModules = false;
            }
            platform = platform.to_rest_entity();
            if (platform.version_id < 0) {
                return $http.post('rest/applications/' + encodeURIComponent(platform.application_name) + '/platforms', platform).then(function (response) {
                    $translate('platform.event.created').then(function(label) {
                        $.notify(label, "success");
                    });
                    //Try to get the global properties
                    var platform = new Platform(response.data);
                    me.get_properties(platform.application_name, platform.platform_name, "#").then(function (properties) {
                        platform.global_properties = properties;
                    });
                    return platform;
                }, function (error) {
                    $.notify(error.data.message, "error");
                    throw error;
                });
            } else {
                return $http.put('rest/applications/' + encodeURIComponent(platform.application_name) + '/platforms?copyPropertiesForUpgradedModules=' + copyPropertiesOfUpdatedModules, platform).then(function (response) {
                    $translate('platform.event.updated').then(function(label) {
                        $.notify(label, "success");
                    });
                    //Try to get the global properties
                    var platform = new Platform(response.data);
                    me.get_properties(platform.application_name, platform.platform_name, "#").then(function (properties) {
                        platform.global_properties = properties;
                    });
                    return platform;
                }, function (error) {
                    $.notify(error.data.message, "error");
                    throw error;
                });
            }
        },
        create_platform_from: function (platform, from_application, from_platform) {
            var me = this;
            platform = platform.to_rest_entity();
            return $http.post('rest/applications/' + encodeURIComponent(platform.application_name) + '/platforms?from_application=' + encodeURIComponent(from_application) + '&from_platform=' + encodeURIComponent(from_platform), platform).then(function (response) {
                $translate('platform.event.created').then(function(label) {
                    $.notify(label, "success");
                });
                //Try to get the global properties
                var platform = new Platform(response.data);
                me.get_properties(platform.application_name, platform.platform_name, "#").then(function (properties) {
                    platform.global_properties = properties;
                });
                return platform;
            }, function (error) {
                $.notify(error.data.message, "error");
                throw error;
            });
        },
        delete_platform: function (application_name, platform_name) {
            return $http.delete('rest/applications/' + encodeURIComponent(application_name) + '/platforms/' + encodeURIComponent(platform_name));
        },
        get_properties: function (application_name, platform_name, path, timestamp) {
            if (_.isUndefined(timestamp)) {
                var url = 'rest/applications/' + encodeURIComponent(application_name) + '/platforms/' + encodeURIComponent(platform_name) + '/properties?path=' + encodeURIComponent(path);
            } else {
                var url = 'rest/applications/' + encodeURIComponent(application_name) + '/platforms/' + encodeURIComponent(platform_name) + '/properties?path=' + encodeURIComponent(path) + '&timestamp=' + timestamp;
            }
            return $http.get(url).then(function (response) {
                return new Properties(response.data);
            }, function (error) {
                $.notify(error.data.message, "error");
                throw error;
            });
        },
        get_global_properties_usage: function (application_name, platform_name) {

            var url = 'rest/applications/' + encodeURIComponent(application_name) + '/platforms/' + encodeURIComponent(platform_name) + '/global_properties_usage';
            return $http.get(url).then(function (response) {
                return response.data;
            }, function (error) {
                $.notify(error.data.message, "error");
                throw error;
            });
        },
        save_properties: function (application_name, platform, properties, path, comment) {
            properties = properties.to_rest_entity();
            return $http.post('rest/applications/' + encodeURIComponent(application_name) + '/platforms/' + encodeURIComponent(platform.name) + '/properties?path=' + encodeURIComponent(path) + '&platform_vid=' + encodeURIComponent(platform.version_id) + '&comment=' + encodeURIComponent(comment), properties).then(function (response) {
                $translate('properties.event.saved').then(function(label) {
                    $.notify(label, "success");
                });
                store.set('current_platform_versionID', platform.version_id + 1);
                return new Properties(response.data);
            }, function (error) {
                //$.notify(error.data.message, "error");
                $translate('properties.event.error').then(function(label) {
                    $.notify(label, "error");
                });                
                throw error;
            });
        },
        get_instance_model: function (application_name, platform, path) {
            return $http.get('rest/applications/' + encodeURIComponent(application_name) + '/platforms/' + encodeURIComponent(platform.name) + '/properties/instance_model?path=' + encodeURIComponent(path)).then(function (response) {
                return new InstanceModel(response.data);
            }, function (error) {
                return new InstanceModel({});
            });
        },

        /**a
         * Met à jour la configuration des modules d'une plateforme.
         * <p>
         * Attention, seule l'instance "locale" est modifiée. La modification n'est pas persistée.
         * </p>
         *
         * @param platform platforme à mettre à jour
         * @param newVersion nouvelle version de la plateforme
         * @param newModulesConfig nouvelle version des modules
         * @returns {Array} la liste des modules misà jour
         */
        updatePlatformConfig: function (platform, newVersion, newModulesConfig) {
            var updatedModules = [];

            // mise à jour de la version de la plateforme
            platform.application_version = newVersion;

            // mise à jour de la version des modules
            platform.modules = _.map(platform.modules, function (platformModule) {

                var newModuleConfig = _.find(newModulesConfig, function (module) {
                    return module.hesperidesModule === platformModule.name;
                });

                if (newModuleConfig !== undefined) {
                    if (newModuleConfig.hesperidesVersion) {
                        platformModule.version = newModuleConfig.hesperidesVersion;
                    } else {
                        platformModule.version = newModuleConfig.version;
                    }
                    platformModule.is_working_copy = newVersion.indexOf('-SNAPSHOT') > -1;

                    updatedModules.push(platformModule);
                }

                return platformModule;
            });

            return updatedModules;
        }
    };

}]);

applicationModule.directive('propertiesGlobalesBox', function () {
    return {
        restrict: 'E',
        scope: {
            platform: "=",
            sortOrder: "="
        },
        templateUrl: "application/properties/properties_globales.html",
        link: function (scope) {
            scope.isBox = true;
            scope.globalPropertiesKeyFilter = "";
            scope.globalPropertiesValueFilter = "";
        }
    };
});

applicationModule.directive('propertiesGlobalesTree', function () {
    return {
        restrict: 'E',
        scope: {
            platform: "=",
            sortOrder: "="
        },
        templateUrl: "application/properties/properties_globales.html",
        link: function (scope) {
            scope.isBox = false;
            scope.globalPropertiesKeyFilter = "";
            scope.globalPropertiesValueFilter = "";
        }
    };
});

applicationModule.directive('instanceProperties', function () {
    return {
        restrict: 'E',
        templateUrl: "application/properties/instance_properties.html",
        link: function (scope) {
            scope.isBox = true;
        }
    };
});
