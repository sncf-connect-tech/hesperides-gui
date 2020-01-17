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
angular.module('hesperides.application', [])


    .factory('Application', [
        'Platform', function (Platform) {
            var Application = function (data) {
                angular.extend(this, {
                    name: '',
                    platforms: [],
                }, data);

                // Object casting when application is created
                this.platforms = _.map(this.platforms, function (platform) {
                    return new Platform(platform);
                });
            };

            return Application;
        },
    ])

    .factory('Platform', [
        'ApplicationModule', 'Properties', function (Module, Properties) {
            var prettify_path = function (path) {
                // Remove the first '#' if present
                if (path.charAt(0) === '#') {
                    path = path.substring(1, path.length);
                }

                if (path.length === 0) {
                    return '';
                }

                var splitted_path = path.split('#');

                var last_pos = splitted_path.length - 1;

                var prettify_module = `${ splitted_path[last_pos - 2] }, ${ splitted_path[last_pos - 1]
                }${ splitted_path[last_pos] === 'WORKINGCOPY' ? ' (working copy) ' : '' }`;

                splitted_path = splitted_path.slice(0, splitted_path.length - 3);

                path = `${ splitted_path.join(' > ') } > ${ prettify_module }`;

                return path;
            };

            var Platform = function (data) {
                angular.extend(this, {
                    name: '',
                    application_name: '',
                    application_version: '',
                    modules: [],
                    global_properties: new Properties(),
                    global_properties_usage: null,
                    production: false,
                    version_id: -1,
                }, data);

                if (this.platform_name) { // When it comes from rest entity
                    this.name = this.platform_name;
                }

                // Object casting when application is created
                this.modules = _.map(this.modules, function (module) {
                    return new Module(module);
                });

                // Volontarly do not turn platform global properties to rest. Those are handled via the API Rest for properties
                this.to_rest_entity = function () {
                    return {
                        platform_name: this.name,
                        application_name: this.application_name,
                        application_version: this.application_version,
                        production: this.production,
                        modules: _.map(this.modules, function (module) {
                            return module.to_rest_entity();
                        }),
                        version_id: this.version_id,
                    };
                };

                this.prettify_path = prettify_path;
            };

            Platform.prettify_path = prettify_path;

            return Platform;
        },
    ])

    .factory('ApplicationModule', [
        'Instance', function (Instance) {
            var ApplicationModule = function (data) {
                angular.extend(this, {
                    id: 0,
                    name: '',
                    version: '',
                    is_working_copy: true,
                    instances: [],
                }, data);

                if (!_.isUndefined(data.working_copy)) { // When it is created through a rest entity
                    this.is_working_copy = data.working_copy;
                }

                /* Object casting when instance is created */
                this.instances = _.map(this.instances, function (instance) {
                    return new Instance(instance);
                });

                this.title = `${ this.name }, ${ this.version }${ this.is_working_copy ? ' (working copy)' : '' }`;

                this.create_new_instance = function (name) {
                    if (!_.find(this.instances, { name })) {
                        this.instances.push(new Instance({ name }));
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
                        path: this.path,
                        properties_path: this.properties_path,
                        instances: _.map(this.instances, function (instance) {
                            return instance.to_rest_entity();
                        }),
                    };
                };
            };

            return ApplicationModule;
        },
    ])

    .factory('InstanceModel', function () {
        var InstanceModel = function (data) {
            angular.extend(this, {
                keys: [],
            }, data);

            this.hasKey = function (name) {
                return this.keys.some(function (key) {
                    return key.name === name;
                });
            };
        };

        return InstanceModel;
    })

    .factory('EventHistoryModel', function () {
        const EventHistoryModel = function (data) {
            angular.extend(this, {
                author: '',
                comment: '',
                added_properties: [],
                updated_properties: [
                    {
                        name: '',
                        old_value: '',
                        new_value: '',
                    },
                ],
                removed_properties: [],
            }, data);
        };
        return EventHistoryModel;
    })

    .factory('Instance', function () {
        var Instance = function (data) {
            angular.extend(this, {
                name: '',
                key_values: [],
            }, data);

            this.hasKey = function (name) {
                return _.some(this.key_values, function (key) {
                    return key.name === name;
                });
            };

            this.mergeWithModel = function (model) {
                var instance = this;

                /* Mark key_values that are in the model */
                _.each(this.key_values, function (key_value) {
                    key_value.inModel = model.hasKey(key_value.name);
                });

                /* Add key_values that are only in the model */
                _.each(_.filter(model.keys, function (model_key_value) {
                    return !instance.hasKey(model_key_value.name);
                }), function (model_key_value) {
                    instance.key_values.push({
                        name: model_key_value.name,
                        comment: model_key_value.comment,
                        value: '',
                        inModel: true,
                    });
                });

                return this;
            };

            this.to_rest_entity = function () {
                return {
                    name: this.name,
                    key_values: _.map(this.key_values, function (keyValue) {
                        return {
                            name: keyValue.name,
                            comment: keyValue.comment,
                            value: keyValue.value,
                        };
                    }),
                };
            };
        };

        return Instance;
    })

    .factory('ApplicationService', [
        '$hesperidesHttp', 'Application', 'Platform', 'Properties', 'InstanceModel', 'EventHistoryModel', '$translate', '$location', 'notify',
        function ($http, Application, Platform, Properties, InstanceModel, EventHistoryModel, $translate, $location, notify) {
            return {
                get(name, unsecured) {
                    return $http.get(`rest/applications/${ encodeURIComponent(name) }?hide_platform=true`).then(function (response) {
                        var current_platform = _.find(response.data.platforms, { platform_name: $location.search().platform });
                        store.set('current_platform_versionID', current_platform ? current_platform.version_id : '');
                        return new Application(response.data);
                    }, function (error) {
                        if (!unsecured) {
                            notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in ApplicationService.get' });
                        }
                        throw error;
                    });
                },
                update_directory_groups(application) {
                    return $http.put(`rest/applications/${ encodeURIComponent(application.name) }/directory_groups`, application).then(function (response) {
                        return response.data;
                    }, function (error) {
                        notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in ApplicationService.update_directory_groups' });
                        throw error;
                    });
                },
                list_applications() {
                    return $http.get('rest/applications').then(function (response) {
                        return response.data;
                    }, function (error) {
                        notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in ApplicationService.list_applications' });
                        throw error;
                    });
                },
                with_name_like(name) {
                    return $http.get(`rest/applications/perform_search?name=${ encodeURIComponent(name) }`).then(function (response) {
                        return response.data;
                    }, function (error) {
                        notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in ApplicationService.with_name_like' });
                        throw error;
                    });
                },
                get_platform_name_of_application(application_name, platform_name) {
                    return $http.get(`rest/applications/platforms/perform_search?applicationName=${ encodeURIComponent(application_name)
                    }&platformName=${ encodeURIComponent(platform_name) }`).then(function (response) {
                        return response.data;
                    }, function (error) {
                        notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in ApplicationService.get_platform_name_of_application' });
                        throw error;
                    });
                },
                get_platform(application_name, platform_name, timestamp, unsecured) {
                    var appService = this;
                    var url = `rest/applications/${ encodeURIComponent(application_name) }/platforms/${ encodeURIComponent(platform_name) }`;
                    if (timestamp) {
                        url += `?timestamp=${ timestamp }`;
                    }
                    return $http.get(url).then(function (response) {
                        // Try to get the global properties
                        var platform = new Platform(response.data);
                        store.set('current_platform_versionID', platform.version_id || null);
                        appService.get_properties(application_name, platform_name, '#', timestamp).then(function (properties) {
                            platform.global_properties = properties;
                        });
                        return platform;
                    }, function (error) {
                        if (!unsecured) {
                            notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in ApplicationService.get_platform' });
                        }
                        throw error;
                    });
                },
                save_platform(platform, copyPropertiesOfUpdatedModules) {
                    var appService = this;
                    if (_.isUndefined(copyPropertiesOfUpdatedModules)) {
                        copyPropertiesOfUpdatedModules = false;
                    }
                    platform = platform.to_rest_entity();
                    if (platform.version_id < 0) {
                        return $http.post(`rest/applications/${ encodeURIComponent(platform.application_name) }/platforms`, platform).then(function (response) {
                            $translate('platform.event.created').then(function (label) {
                                notify({ classes: [ 'success' ], message: label });
                            });
                            // Try to get the global properties
                            platform = new Platform(response.data);
                            appService.get_properties(platform.application_name, platform.platform_name, '#').then(function (properties) {
                                platform.global_properties = properties;
                            });
                            return platform;
                        }, function (error) {
                            notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in ApplicationService.save_platform.post' });
                            throw error;
                        });
                    }
                    return $http.put(`rest/applications/${ encodeURIComponent(platform.application_name) }/platforms?copyPropertiesForUpgradedModules=${ copyPropertiesOfUpdatedModules }`, platform).then(function (response) {
                        $translate('platform.event.updated').then(function (label) {
                            notify({ classes: [ 'success' ], message: label });
                        });
                        // Try to get the global properties
                        platform = new Platform(response.data);
                        appService.get_properties(platform.application_name, platform.platform_name, '#').then(function (properties) {
                            platform.global_properties = properties;
                        });
                        return platform;
                    }, function (error) {
                        notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in ApplicationService.save_platform.put' });
                        throw error;
                    });
                },
                create_platform_from(platform, from_application, from_platform, copyInstancesAndProperties) {
                    var appService = this;
                    platform = platform.to_rest_entity();
                    var path = `rest/applications/${ encodeURIComponent(platform.application_name) }/platforms` +
                        `?from_application=${ encodeURIComponent(from_application) }&from_platform=${ encodeURIComponent(from_platform) }&copy_instances_and_properties=${ copyInstancesAndProperties }`;
                    return $http.post(path, platform).then(function (response) {
                        $translate('platform.event.created').then(function (label) {
                            notify({ classes: [ 'success' ], message: label });
                        });
                        // Try to get the global properties
                        platform = new Platform(response.data);
                        appService.get_properties(platform.application_name, platform.platform_name, '#').then(function (properties) {
                            platform.global_properties = properties;
                        });
                        return platform;
                    }, function (error) {
                        notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in ApplicationService.create_platform_from' });
                        throw error;
                    });
                },
                delete_platform(application_name, platform_name) {
                    return $http.delete(`rest/applications/${ encodeURIComponent(application_name) }/platforms/${ encodeURIComponent(platform_name) }`).then(() => {
                        $translate('platform.event.deleted').then(function (label) {
                            notify({ classes: [ 'success' ], message: label });
                        });
                    }).catch((error) => {
                        notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in ApplicationService.delete_platform' });
                        throw error;
                    });
                },
                restore_platform(application_name, platform_name) {
                    return $http.post(`rest/applications/${ encodeURIComponent(application_name) }/platforms/${ encodeURIComponent(platform_name) }/restore`).catch((error) => {
                        notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in ApplicationService.restore_platform' });
                        throw error;
                    });
                },
                get_diff(application_name, platform_name, path, to_application, to_platform, to_path, compare_stored_values, timestamp) {
                    var url = `rest/applications/${ encodeURIComponent(application_name) }/platforms/${ encodeURIComponent(platform_name) }/properties/diff?path=${ encodeURIComponent(path) }`;
                    url += `&to_application=${ encodeURIComponent(to_application) }&to_platform=${ encodeURIComponent(to_platform) }&to_path=${ encodeURIComponent(to_path) }&compare_stored_values=${ encodeURIComponent(compare_stored_values) }`;
                    if (timestamp) {
                        url += `&timestamp=${ timestamp }`;
                    }
                    return $http.get(url).then(function (response) {
                        return response.data;
                    }, function (error) {
                        notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in ApplicationService.get_diff' });
                        throw error;
                    });
                },
                get_properties(application_name, platform_name, path, timestamp) {
                    var url = `rest/applications/${ encodeURIComponent(application_name) }/platforms/${ encodeURIComponent(platform_name) }/properties?path=${ encodeURIComponent(path) }`;
                    if (timestamp) {
                        url += `&timestamp=${ timestamp }`;
                    }
                    return $http.get(url).then(function (response) {
                        return new Properties(response.data);
                    }, function (error) {
                        notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in ApplicationService.get_properties' });
                        throw error;
                    });
                },
                get_global_properties_usage(application_name, platform_name) {
                    var url = `rest/applications/${ encodeURIComponent(application_name) }/platforms/${ encodeURIComponent(platform_name) }/global_properties_usage`;
                    return $http.get(url).then(function (response) {
                        return response.data;
                    }, function (error) {
                        notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in ApplicationService.get_global_properties_usage' });
                        throw error;
                    });
                },
                save_properties(application_name, platform, properties, path, comment) {
                    properties = properties.to_rest_entity();

                    return $http.put(`rest/applications/${ encodeURIComponent(application_name)
                    }/platforms/${ encodeURIComponent(platform.name)
                    }/properties?path=${ encodeURIComponent(path)
                    }&platform_vid=${ encodeURIComponent(platform.version_id)
                    }&comment=${ encodeURIComponent(comment) }`, properties).then(function (response) {
                        $translate('properties.event.saved').then(function (label) {
                            notify({ classes: [ 'success' ], message: label });
                        });
                        store.set('current_platform_versionID', platform.version_id + 1);
                        return new Properties(response.data);
                    }, function (error) {
                        if (error.data) {
                            notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in ApplicationService.save_properties' });
                        } else {
                            $translate('properties.event.generic-error').then(function (label) {
                                notify({ classes: [ 'error' ], message: label });
                            });
                        }
                        throw error;
                    });
                },
                get_instance_model(application_name, platform, path) {
                    return $http.get(`rest/applications/${ encodeURIComponent(application_name) }/platforms/${ encodeURIComponent(platform.name) }/properties/instance_model?path=${ encodeURIComponent(path) }`).then(function (response) {
                        return new InstanceModel(response.data);
                    }, function () {
                        return new InstanceModel({});
                    });
                },
                cleanUnusedProperties(applicationName, platformName, propertiesPath) {
                    let url = `rest/applications/${ encodeURIComponent(applicationName) }/platforms/${ encodeURIComponent(platformName) }/properties/clean_unused_properties`;
                    if (propertiesPath) {
                        url += `?properties_path=${ encodeURIComponent(propertiesPath) }`;
                    }
                    return $http.delete(url).then(function () {
                        $translate('properties.platform.cleanUnusedProperties.success').then(function (label) {
                            notify({ classes: [ 'success' ], message: label });
                        });
                    }, function (error) {
                        notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in ApplicationService.cleanUnusedProperties' });
                        throw error;
                    });
                },

                /**
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
                updatePlatformConfig(platform, newVersion, newModulesConfig) {
                    var updatedModules = [];

                    // mise à jour de la version de la plateforme
                    platform.application_version = newVersion;

                    // mise à jour de la version des modules
                    platform.modules = _.map(platform.modules, function (platformModule) {
                        var newModuleConfig = _.find(newModulesConfig, { hesperidesModule: platformModule.name });

                        if (newModuleConfig) {
                            if (newModuleConfig.hesperidesVersion) {
                                platformModule.version = newModuleConfig.hesperidesVersion;
                            } else {
                                platformModule.version = newModuleConfig.version;
                            }
                            platformModule.is_working_copy = _.includes(newVersion, '-SNAPSHOT');

                            updatedModules.push(platformModule);
                        }

                        return platformModule;
                    });

                    return updatedModules;
                },

                // recuperer l'historique des évenements
                getEventHistory(applicationName, platformName, propertiesPath) {
                    return {
                        author: 'Monsieur test',
                        comment: 'j\'ai réalisé plein de changements',
                        added_properties: ['property-1', 'property-2'],
                        updated_properties: [
                            {
                                name: 'ma.prop.de.ouf',
                                old_value: 'ancienne valeur',
                                new_value: 'nouvelle valeur',
                            },
                        ],
                        removed_properties: [ 'ma.prop.qui.est.supprimee' ],
                    };
                    /* const url = `rest/applications/${ encodeURIComponent(applicationName) }/platforms/${ encodeURIComponent(platformName) }/properties/events?properties_path=${ encodeURIComponent(propertiesPath) }`;
                    return $http.get(url).then(function (response) {
                        return new EventHistoryModel(response.data);
                    }); */
                },
            };
        },
    ])

    .directive('propertiesGlobalesBox', function () {
        return {
            restrict: 'E',
            scope: {
                platform: '=',
                sortOrder: '=',
            },
            templateUrl: 'application/properties_globales.html',
            link(scope) {
                scope.isBox = true;
                scope.globalPropertiesKeyFilter = '';
                scope.globalPropertiesValueFilter = '';
            },
        };
    })


    .directive('propertiesGlobalesTree', function (ApplicationService) {
        return {
            restrict: 'E',
            scope: {
                // on pouvait faire un appel à getGlobalProperties() pour récupèrer les global_properties et supprimer
                // ce paramètre platform, mais cela serait une opération de trop car les propriétés globales sont déja
                // valorisées dans platform avec platform.global_properties, d'où l'idée de réutiliser ce paramètre
                platform: '=',
                platformName: '=',
                applicationName: '=',
                sortOrder: '=',
            },
            templateUrl: 'application/properties_globales.html',
            link(scope) {
                scope.isBox = false;
                scope.globalPropertiesKeyFilter = '';
                scope.globalPropertiesValueFilter = '';
                ApplicationService.get_global_properties_usage(scope.applicationName, scope.platformName, '#')
                    .then(function (globalPropertiesUsage) {
                        scope.globalPropertiesUsage = globalPropertiesUsage;
                    });
            },
        };
    })

    .directive('instanceProperties', function () {
        return {
            restrict: 'E',
            templateUrl: 'application/instance_properties.html',
            link(scope) {
                scope.isBox = true;
            },
        };
    });
