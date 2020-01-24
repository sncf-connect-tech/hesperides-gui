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
angular.module('hesperides.module', [ 'hesperides.application' ])


    .controller('ModuleController', [
        '$scope', '$routeParams', '$location', '$mdDialog', 'TechnoService', 'ModuleService', 'HesperidesTemplateModal', 'Template', 'Page',
        'FileService', 'Platform', '$translate', '$window',
        function ($scope, $routeParams, $location, $mdDialog, TechnoService, ModuleService, HesperidesTemplateModal, Template, Page,
            FileService, Platform, $translate, $window) {
            Page.setTitle('Module');

            $scope.is_workingcopy = ($routeParams.type === 'workingcopy');
            $scope.is_release = !$scope.is_workingcopy;

            $scope.refreshModel = function () {
                $scope.loading_model = true;
                ModuleService.get_model($scope.module).then(function (model) {
                    $scope.model = model;
                    $scope.loading_model = false;
                });
                ModuleService.get_platforms($scope.module).then(function (platforms) {
                    $scope.platforms = platforms;
                });
            };

            /* Try to find the corresponding module */
            ModuleService.get($routeParams.name, $routeParams.version, $scope.is_workingcopy).then(function (module) {
                $scope.module = module;
            }).then(function () {
                return ModuleService.get_all_templates($scope.module);
            }).then(function (templateEntries) {
                $scope.templateEntries = templateEntries;
            }).then(function () {
                $scope.refreshModel();
            });

            $scope.add_template = function () {
                HesperidesTemplateModal.edit_template({
                    template: new Template(),
                    isReadOnly: false,
                    onSave: $scope.save_template,
                    add: true,
                });
            };

            $scope.download_template = function (template_entry) {
                download(template_entry.content, template_entry.filename, template_entry.mediaType);
            };

            $scope.download_all_template = function (templateEntries) {
                // The JSZip Object
                var zip = new JSZip();
                // Adding files to zip
                templateEntries.forEach(function (template) {
                    if (!template.on_error) {
                        zip.file(template.filename, template.content);
                    }
                });
                // Generate and save the zip file
                zip.generateAsync({ type: 'blob' }).then((content) =>
                    saveAs(content, `${ $scope.module.title }.zip`),
                );
            };

            $scope.edit_template = function (name) {
                ModuleService.get_template($scope.module, name).then(function (template) {
                    HesperidesTemplateModal.edit_template({
                        template,
                        isReadOnly: !$scope.module.is_working_copy,
                        onSave: $scope.save_template,
                        add: false,
                    });
                });
            };

            $scope.save_template = function (template) {
                return ModuleService.save_template($scope.module, template).then(function (savedTemplate) {
                    // MAJ liste de templates
                    var entry = _.find($scope.templateEntries, { name: savedTemplate.name });

                    if (entry) { // It was an update
                        entry.name = savedTemplate.name;
                        entry.location = savedTemplate.location;
                        entry.filename = savedTemplate.filename;
                        entry.rights = FileService.files_rights_to_string(savedTemplate.rights);
                        if (entry.rights < 0) {
                            $translate('template.rights.none').then(function (label) {
                                entry.rights = label;
                            });
                        }
                    } else {
                        var right = FileService.files_rights_to_string(savedTemplate.rights);
                        var new_entry = {
                            name: savedTemplate.name,
                            content: savedTemplate.content,
                            location: savedTemplate.location,
                            filename: savedTemplate.filename,
                            rights: right,
                        };
                        if (right < 0) {
                            $translate('template.rights.none').then(function (label) {
                                new_entry.rights = label;
                            });
                        }
                        $scope.templateEntries.push(new_entry);
                    }
                    $scope.refreshModel();
                    return savedTemplate;
                });
            };

            $scope.delete_template = function (name) {
                ModuleService.delete_template($scope.module, name).then(function () {
                    $scope.templateEntries = _.reject($scope.templateEntries, function (templateEntry) {
                        return (templateEntry.name === name); // MAJ de la liste de templates
                    });
                    $scope.refreshModel();
                });
            };

            /* This function is used to save the module */
            $scope.save = function (module) {
                return ModuleService.save(module).then(function (mod) {
                    $scope.module = mod;
                });
            };

            /* This function is used to find technos not already chosen */
            $scope.search_technos = function (name) {
                return TechnoService.with_name_like(name).then(function (technos) {
                    return _.filter(technos, function (techno) {
                        return !$scope.module.has_techno(techno);
                    });
                });
            };

            $scope.add_techno = function (techno) {
                $scope.module.add_techno(techno);
                $scope.save($scope.module).then(function () {
                    $scope.refreshModel();
                });
            };

            $scope.open_techno_page = function (name, version, is_working_copy) {
                var url = `/#/techno/${ name }/${ version }`;
                if (is_working_copy) {
                    url += '?type=workingcopy';
                }
                $window.open(url, '_blank');
            };

            $scope.delete_techno = function (techno) {
                $scope.module.remove_techno(techno);
                $scope.save($scope.module).then(function () {
                    $scope.refreshModel();
                });
            };

            $scope.create_release = function (module, release_version) {
                ModuleService.create_release(module, release_version).then(function () {
                    $location.path(`/module/${ module.name }/${ release_version }`).search({});
                });
            };

            $scope.open_create_release_dialog = function (module) {
                var modalScope = $scope.$new(true);

                modalScope.closeCreateReleaseDialog = function () {
                    $mdDialog.cancel();
                };

                modalScope.saveReleaseAndClose = function (release_version) {
                    $scope.create_release(module, release_version);
                    $mdDialog.cancel();
                };

                $mdDialog.show({
                    templateUrl: 'module/create_release.html',
                    controller: 'ModuleController',
                    clickOutsideToClose: true,
                    scope: modalScope,
                });
            };
        },
    ])

    .factory('Module', [
        'Techno', function (Techno) {
            var Module = function (data) {
                angular.extend(this, {
                    name: '',
                    version: '',
                    is_working_copy: true,
                    technos: [],
                    version_id: -1,
                }, data);

                if (!_.isUndefined(data.working_copy)) { // When it is created through a rest entity
                    this.is_working_copy = data.working_copy;
                }

                /* Object casting when instance is created */
                this.technos = _.map(this.technos, function (techno) {
                    return new Techno(techno.name, techno.version, techno.working_copy);
                });

                this.title = `${ this.name }, ${ this.version }${ this.is_working_copy ? ' (working copy)' : '' }`;
            };

            Module.prototype.add_techno = function (techno) {
                if (!_.some(this.technos, { 'name': techno.name, 'version': techno.version, 'is_working_copy': techno.is_working_copy })) {
                    this.technos.push(techno);
                }
                return techno;
            };

            Module.prototype.remove_techno = function (techno) {
                _.remove(this.technos, function (existing) {
                    return _.isEqual(existing, techno);
                });
            };

            Module.prototype.has_techno = function (techno) {
                return _.some(this.technos, { 'name': techno.name, 'version': techno.version, 'is_working_copy': techno.is_working_copy });
            };

            Module.prototype.to_rest_entity = function () {
                return {
                    name: this.name,
                    version: this.version,
                    working_copy: this.is_working_copy,
                    version_id: this.version_id,
                    technos: _.map(this.technos, function (techno) {
                        return techno.to_rest_entity();
                    }),
                };
            };

            // Class methods:
            Module.fromPropertiesPath = function (propertiesPath) {
                let pathFragments = propertiesPath.split('#');
                let name = pathFragments[pathFragments.length - 3];
                let version = pathFragments[pathFragments.length - 2];
                let moduleType = pathFragments[pathFragments.length - 1];
                if (pathFragments[0] !== '' || pathFragments.length < 5 || !['RELEASE', 'WORKINGCOPY'].includes(moduleType)) {
                    throw new Error(`Invalid propertiesPath provided: ${propertiesPath}`);
                }
                return new Module({
                    name, version,
                    is_working_copy: moduleType === 'WORKINGCOPY',
                    properties_path: propertiesPath,
                });
            };

            return Module;
        },
    ])

    .factory('ModuleService', [
        '$hesperidesHttp', '$q', 'Module', 'Template', 'TemplateEntry', 'Properties', 'FileService', '$translate', 'Platform', 'notify',
        function ($http, $q, Module, Template, TemplateEntry, Properties, FileService, $translate, Platform, notify) {
            return {
                get(name, version, is_working_copy) {
                    return $http.get(`rest/modules/${ encodeURIComponent(name) }/${ encodeURIComponent(version) }/${ is_working_copy ? 'workingcopy' : 'release' }`).then(function (response) {
                        return new Module(response.data);
                    }, function (error) {
                        notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in ModuleService.get' });
                        throw error;
                    });
                },
                save(module) {
                    if (!module.is_working_copy) {
                        $translate('module.workingCopy.event.error').then(function (label) {
                            notify({ classes: [ 'error' ], message: label });
                        });
                        throw new Error('Operation not possible. A release can only be created from a working copy and can not be edited', module);
                    }
                    module = module.to_rest_entity();
                    if (module.version_id < 0) {
                        return $http.post('rest/modules', module).then(function (response) {
                            $translate('module.workingCopy.event.created').then(function (label) {
                                notify({ classes: [ 'success' ], message: label });
                            });
                            return new Module(response.data);
                        }, function (error) {
                            notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in ModuleService.save.post' });
                        });
                    }
                    return $http.put('rest/modules', module).then(function (response) {
                        $translate('module.workingCopy.event.updated').then(function (label) {
                            notify({ classes: [ 'error' ], message: label });
                        });
                        return new Module(response.data);
                    }, function (error) {
                        notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in ModuleService.save.put' });
                    });
                },
                get_model(module) {
                    return $http.get(`rest/modules/${ encodeURIComponent(module.name) }/${ encodeURIComponent(module.version) }/${ module.is_working_copy ? 'workingcopy' : 'release' }/model`).then(function (response) {
                        return new Properties(response.data);
                    }, function () {
                        return new Properties({});
                    });
                },
                get_platforms(module) {
                    return $http.get(`rest/applications/using_module/${ encodeURIComponent(module.name) }/${ encodeURIComponent(module.version) }/${ module.is_working_copy ? 'workingcopy' : 'release' }`).then(function (response) {
                        return response.data.map(function (current) {
                            return new Platform(current);
                        });
                    }, function () {
                        return new Platform([]);
                    });
                },
                get_template(module, template_name) {
                    return $http.get(`rest/modules/${ encodeURIComponent(module.name) }/${ encodeURIComponent(module.version) }/${ module.is_working_copy ? 'workingcopy' : 'release' }/templates/${ encodeURIComponent(template_name) }`).then(function (response) {
                        return new Template(response.data);
                    }, function (error) {
                        notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in ModuleService.get_template' });
                        throw error;
                    });
                },
                get_all_templates(module) {
                    var baseUrl = `rest/modules/${ encodeURIComponent(module.name) }/${ encodeURIComponent(module.version) }/${ module.is_working_copy ? 'workingcopy' : 'release' }/templates`;

                    return $http.get(baseUrl).then(function (response) {
                        return response.data.map(function (data) {
                            var entry = new TemplateEntry(data);
                            var url = `${ baseUrl }/${ encodeURIComponent(entry.name) }`;

                            entry.getTemplate(url).then(function (template) {
                                entry.rights = FileService.files_rights_to_string(template.rights);
                                if (entry.rights < 0) {
                                    $translate('template.rights.none').then(function (label) {
                                        entry.rights = label;
                                    });
                                }
                                entry.content = template.content;
                                entry.filename = template.filename;
                            });
                            entry.setMediaType();
                            entry.url = url;
                            return entry;
                        }, function (error) {
                            if (error.status === 404) {
                                return [];
                            }
                            notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in ModuleServic.get_all_templates' });
                            throw error;
                        });
                    });
                },
                save_template(module, template) {
                    if (!module.is_working_copy) {
                        $translate('module.workingCopy.event.error').then(function (label) {
                            notify({ classes: [ 'error' ], message: label });
                        });
                        throw new Error('Operation not possible. A release can only be created from a working copy and can not be edited', module);
                    }
                    template = template.toHesperidesEntity();
                    if (template.version_id < 0) {
                        return $http.post(`rest/modules/${ encodeURIComponent(module.name) }/${ encodeURIComponent(module.version) }/workingcopy/templates`, template).then(function (response) {
                            $translate('template.event.created').then(function (label) {
                                notify({ classes: [ 'success' ], message: label });
                            });
                            return new Template(response.data);
                        }, function (error) {
                            if (error.data) {
                                notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in ModuleService.save_template.post' });
                            } else if (error.status === 409) {
                                $translate('template.event.error').then(function (label) {
                                    notify({ classes: [ 'error' ], message: label });
                                });
                            }
                            throw error;
                        });
                    }
                    return $http.put(`rest/modules/${ encodeURIComponent(module.name) }/${ encodeURIComponent(module.version) }/workingcopy/templates`, template).then(function (response) {
                        $translate('template.event.updated').then(function (label) {
                            notify({ classes: [ 'success' ], message: label });
                        });
                        return new Template(response.data);
                    }, function (error) {
                        notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in ModuleService.save_template.put' });
                        throw error;
                    });
                },
                delete_template(module, template_name) {
                    if (!module.is_working_copy) {
                        $translate('module.workingCopy.event.error').then(function (label) {
                            notify({ classes: [ 'error' ], message: label });
                        });
                        throw new Error('Operation not possible. A release can only be created from a working copy and can not be edited', module);
                    }
                    return $http.delete(`rest/modules/${ encodeURIComponent(module.name) }/${ encodeURIComponent(module.version) }/workingcopy/templates/${ encodeURIComponent(template_name) }`).then(function (response) {
                        $translate('template.event.deleted').then(function (label) {
                            notify({ classes: [ 'success' ], message: label });
                        });
                        return response;
                    }, function (error) {
                        notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in ModuleService.delete_template' });
                        throw error;
                    });
                },
                create_release(module, release_version) {
                    if (!module.is_working_copy) {
                        $translate('release.event.error').then(function (label) {
                            notify({ classes: [ 'error' ], message: label });
                        });
                        throw new Error('Operation not possible. A release can only be created from a working copy', module);
                    }
                    return $http.post(`rest/modules/create_release?module_name=${ encodeURIComponent(module.name) }&module_version=${ encodeURIComponent(module.version) }&release_version=${ encodeURIComponent(release_version) }`).then(function (response) {
                        $translate('release.event.created', { name: module.name, version: release_version }).then(function (label) {
                            notify({ classes: [ 'success' ], message: label });
                        });
                        return new Module(response.data);
                    }, function (error) {
                        notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in ModuleService.create_release' });
                        throw error;
                    });
                },
                create_workingcopy_from(name, version, fromModule) {
                    var newModule = new Module({ name, version }).to_rest_entity();
                    return $http.post(`rest/modules?from_module_name=${ encodeURIComponent(fromModule.name) }&from_module_version=${ encodeURIComponent(fromModule.version) }&from_is_working_copy=${ encodeURIComponent(fromModule.is_working_copy) }`, newModule).then(function (response) {
                        $translate('workingCopy.event.created.details', { name, version }).then(function (label) {
                            notify({ classes: [ 'success' ], message: label });
                        });
                        return new Module(response.data);
                    }, function (error) {
                        notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in ModuleService.create_workingcopy_from' });
                        throw error;
                    });
                },
                with_name_like(name) {
                    if (_.isUndefined(name) || name.length <= 2) { // prevent search with too few characters
                        var deferred = $q.defer();
                        deferred.resolve([]);
                        return deferred.promise;
                    }
                    return $http.get(`rest/modules/perform_search?terms=${ encodeURIComponent(name) }`).then(function (response) {
                        var modules = _.map(response.data, function (module) {
                            return new Module(module);
                        });
                        var swaping = true;
                        // Preserving order version descending sort grouped by name
                        while (swaping) {
                            swaping = false;
                            // eslint-disable-next-line id-length
                            for (var i in modules) {
                                if (i > 0) {
                                    if (modules[i].name === modules[i - 1].name) {
                                        if (modules[i].version > modules[i - 1].version) {
                                            swaping = true;
                                            var tmpModule = modules[i];
                                            modules[i] = modules[i - 1];
                                            modules[i - 1] = tmpModule;
                                        }
                                    }
                                }
                            }
                        }
                        return modules;
                    });
                },
            };
        },
    ]);

/** global method to get module or techno type : {workingcopy, release} */
/* eslint-disable no-undef*/
getVersionType = function (isWorkingCopy) {
    return isWorkingCopy ? 'workingcopy' : 'release';
};
