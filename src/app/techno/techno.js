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
angular.module('hesperides.techno', [ 'hesperides.template', 'hesperides.properties', 'hesperides.model' ])

    .controller('TechnoController',
        [
            '$scope', '$location', '$mdDialog', '$routeParams', 'Techno', 'Page', 'TechnoService', 'HesperidesTemplateModal', 'Template', 'TemplateEntry', 'FileService', '$translate',
            function ($scope, $location, $mdDialog, $routeParams, Techno, Page, TechnoService, HesperidesTemplateModal, Template, TemplateEntry, FileService, $translate) {
                Page.setTitle('Technos');

                $scope.isWorkingCopy = $routeParams.type === 'workingcopy';
                $scope.isRelease = !$scope.isWorkingCopy;
                $scope.techno = new Techno($routeParams.name, $routeParams.version, ($routeParams.type === 'workingcopy'));
                $scope.templateEntries = [];

                // Label for rights
                $scope.rights = [
                    { label: '<default>', value: null },
                    { label: 'O', value: true },
                    { label: 'N', value: false },
                ];

                if ($scope.techno.is_working_copy) {
                    TechnoService.get_all_templates_from_workingcopy($scope.techno.name, $scope.techno.version).then(function (templateEntries) {
                        $scope.templateEntries = templateEntries;
                    });
                } else {
                    TechnoService.get_all_templates_from_release($scope.techno.name, $scope.techno.version).then(function (templateEntries) {
                        $scope.templateEntries = templateEntries;
                    });
                }

                $scope.refreshModel = function () {
                    TechnoService.get_model($scope.techno.name, $scope.techno.version, $scope.techno.is_working_copy).then(function (model) {
                        $scope.model = model;
                    });
                    
                    TechnoService.get_all_modules_using_this_techno($scope.techno).then(function(modules) {
                        $scope.modules = modules;
                    });
                };

                $scope.refreshModel();

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
                        saveAs(content, `${ $scope.techno.title }.zip`)
                    );
                };

                $scope.edit_template = function (name) {
                    if ($scope.techno.is_working_copy) {
                        TechnoService.get_template_from_workingcopy($scope.techno.name, $scope.techno.version, name).then(function (template) {
                            HesperidesTemplateModal.edit_template({
                                template,
                                isReadOnly: false,
                                onSave: $scope.save_template,
                                add: false,
                            });
                            $scope.refreshModel();
                        });
                    } else {
                        TechnoService.get_template_from_release($scope.techno.name, $scope.techno.version, name).then(function (template) {
                            HesperidesTemplateModal.edit_template({
                                template,
                                isReadOnly: true,
                                onSave: $scope.save_template,
                                add: false,
                            });
                            $scope.refreshModel();
                        });
                    }
                };

                $scope.save_template = function (template) {
                    return TechnoService.save_template_in_workingcopy($scope.techno.name, $scope.techno.version, template).then(function (savedTemplate) {
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
                            var new_entry = new TemplateEntry({
                                name: savedTemplate.name,
                                content: savedTemplate.content,
                                location: savedTemplate.location,
                                filename: savedTemplate.filename,
                                rights: right,
                            });
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
                    TechnoService.delete_template_in_workingcopy($scope.techno.name, $scope.techno.version, name).then(function () {
                        $scope.templateEntries = _.reject($scope.templateEntries, function (templateEntry) {
                            return (templateEntry.name === name); // MAJ de la liste de templates
                        });
                        $scope.refreshModel();
                    });
                };

                $scope.create_release = function (r_name, r_version) {
                    TechnoService.create_release(r_name, r_version).then(function () {
                        $location.path(`/techno/${ r_name }/${ r_version }`).search({});
                    });
                };

                /**
     * Affiche la liste des propriétés associées à un module.
     */
                $scope.open_associated_properties_dialog = function () {
                    var modalScope = $scope.$new(true);

                    modalScope.$closeDialog = function () {
                        $mdDialog.cancel();
                    };

                    modalScope.$save = function (release_version) {
                        $scope.create_release(module, release_version);
                        $mdDialog.cancel();
                    };

                    $mdDialog.show({
                        templateUrl: 'techno/techno-modal.html',
                        controller: 'TechnoController',
                        clickOutsideToClose: true,
                        scope: modalScope,
                    });
                };

                $scope.getModuleUrl = function(module) {
                     /*eslint-disable no-undef*/
                    return  '/module/' 
                            + module.module_name 
                            + '/' + module.module_version 
                            + '?type=' 
                            + getVersionType(module.is_working_copy);;
                };
               
            },
        ])

    .controller('TechnoSearchController', [
        '$scope', 'TechnoService', 'Page', function ($scope, TechnoService, Page) {
            Page.setTitle('Technos');

            /* Load technos list */
            TechnoService.all().then(function (technos) {
                $scope.technos = technos;
            });
        },
    ])

    .factory('Techno', function () {
        var Techno = function (name, version, is_working_copy) {
            this.name = name;
            this.version = version;
            this.is_working_copy = is_working_copy;
            this.title = `${ this.name }, ${ this.version }${ this.is_working_copy ? ' (working copy)' : '' }`;


            this.to_rest_entity = function () {
                return {
                    name: this.name,
                    version: this.version,
                    working_copy: this.is_working_copy,
                };
            };
        };

        return Techno;
    })

    .factory('TechnoService',
        function ($hesperidesHttp, $q, Techno, Module, Template, TemplateEntry, Properties, FileService, $translate, notify) {
            return {
                get_model(name, version, isWorkingCopy) {
                    return $hesperidesHttp.get(`rest/technos/${ encodeURIComponent(name) }/${ encodeURIComponent(version) }/${ isWorkingCopy ? 'workingcopy' : 'release' }/model`).then(function (response) {
                        return new Properties(response.data);
                    }, function () {
                        return new Properties({});
                    });
                },
                get_template_from_workingcopy(wc_name, wc_version, template_name) {
                    return $hesperidesHttp.get(`rest/technos/${ encodeURIComponent(wc_name) }/${ encodeURIComponent(wc_version) }/workingcopy/templates/${ encodeURIComponent(template_name) }`).then(function (response) {
                        return new Template(response.data);
                    }, function (error) {
                        notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in TechnoService.get_template_from_workingcopy' });
                        throw error;
                    });
                },
                get_template_from_release(wc_name, wc_version, template_name) {
                    return $hesperidesHttp.get(`rest/technos/${ encodeURIComponent(wc_name) }/${ encodeURIComponent(wc_version) }/release/templates/${ encodeURIComponent(template_name) }`).then(function (response) {
                        return new Template(response.data);
                    }, function (error) {
                        notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in TechnoService.get_template_from_release' });
                        throw error;
                    });
                },
                get_all_templates_from_workingcopy(wc_name, wc_version) {
                    var baseUrl = `rest/technos/${ encodeURIComponent(wc_name) }/${ encodeURIComponent(wc_version) }/workingcopy/templates`;

                    return $hesperidesHttp.get(baseUrl).then(function (response) {
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
                            return entry;
                        }, function (error) {
                            if (error.status === 404) {
                                return [];
                            }
                            notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in TechnoService.get_all_templates_from_workingcopy' });
                            throw error;
                        });
                    });
                },
                get_all_templates_from_release(r_name, r_version) {
                    return $hesperidesHttp.get(`rest/technos/${ encodeURIComponent(r_name) }/${ encodeURIComponent(r_version) }/release/templates`).then(function (response) {
                        return response.data.map(function (data) {
                            var entry = new TemplateEntry(data);
                            var url = `rest/technos/${ encodeURIComponent(r_name) }/${ encodeURIComponent(r_version) }/release/templates/${ encodeURIComponent(entry.name) }`;
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
                            return entry;
                        }, function (error) {
                            if (error.status === 404) {
                                return [];
                            }
                            notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in TechnoService.get_all_templates_from_release' });
                            throw error;
                        });
                    });
                },
                get_all_modules_using_this_techno(techno) {
                     /*eslint-disable no-undef*/
                    return $hesperidesHttp.get(`rest/modules/using_techno/${ encodeURIComponent(techno.name) }/${ encodeURIComponent(techno.version) }/${ getVersionType(techno.is_working_copy) }`).then(function (response) {
                        return response.data.map(function (current) {
                            return new Module(current);
                        });
                    }, function () {
                        return new Module([]);
                    });
                },
                save_template_in_workingcopy(wc_name, wc_version, template) {
                    template = template.toHesperidesEntity();
                    if (template.version_id < 0) {
                        return $hesperidesHttp.post(`rest/technos/${ encodeURIComponent(wc_name) }/${ encodeURIComponent(wc_version) }/workingcopy/templates`, template).then(function (response) {
                            $translate('template.event.created').then(function (label) {
                                notify({ classes: [ 'success' ], message: label });
                            });
                            return new Template(response.data);
                        }, function (error) {
                            if (error.data) {
                                notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in TechnoService.save_template_in_workingcopy.post' });
                            } else if (error.status === 409) {
                                $translate('template.event.error').then(function (label) {
                                    notify({ classes: [ 'error' ], message: label });
                                });
                            }
                            throw error;
                        });
                    }
                    return $hesperidesHttp.put(`rest/technos/${ encodeURIComponent(wc_name) }/${ encodeURIComponent(wc_version) }/workingcopy/templates`, template).then(function (response) {
                        $translate('template.event.updated').then(function (label) {
                            notify({ classes: [ 'success' ], message: label });
                        });
                        return new Template(response.data);
                    }, function (error) {
                        notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in TechnoService.save_template_in_workingcopy.put' });
                        throw error;
                    });
                },
                delete_template_in_workingcopy(wc_name, wc_version, template_name) {
                    return $hesperidesHttp.delete(`rest/technos/${ encodeURIComponent(wc_name) }/${ encodeURIComponent(wc_version) }/workingcopy/templates/${ encodeURIComponent(template_name) }`).then(function (response) {
                        $translate('template.event.deleted').then(function (label) {
                            notify({ classes: [ 'success' ], message: label });
                        });
                        return response;
                    }, function (error) {
                        notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in TechnoService.delete_template_in_workingcopy' });
                        throw error;
                    });
                },
                create_release(techno_name, techno_version) {
                    return $hesperidesHttp.post(`rest/technos/create_release?techno_name=${ encodeURIComponent(techno_name) }&techno_version=${ encodeURIComponent(techno_version) }`).then(function (response) {
                        if (response.status === 201) {
                            $translate('release.event.created', { name: techno_name, version: techno_version }).then(function (label) {
                                notify({ classes: [ 'success' ], message: label });
                            });
                        } else {
                            notify({ classes: [ 'warn' ], message: response.data });
                        }
                    }, function (error) {
                        notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in TechnoService.create_release' });
                        throw error;
                    });
                },
                create_workingcopy(wc_name, wc_version, from_name, from_version, is_from_workingcopy) {
                    var url = `rest/technos?from_name=${ encodeURIComponent(from_name) }` +
                         `&from_version=${ encodeURIComponent(from_version) }` +
                         `&from_is_working_copy=${ is_from_workingcopy }`;
                    // Backward-compatibility:
                    url += `&from_package_name=${ encodeURIComponent(from_name) }` +
                           `&from_package_version=${ encodeURIComponent(from_version) }`;
                    var postBody = { name: encodeURIComponent(wc_name), version: encodeURIComponent(wc_version), working_copy: true };
                    return $hesperidesHttp.post(url, postBody).then(function (response) {
                        if (response.status === 201) {
                            $translate('workingCopy.event.created').then(function (label) {
                                notify({ classes: [ 'success' ], message: label });
                            });
                        } else {
                            notify({ classes: [ 'warn' ], message: response.data });
                        }
                    }, function (error) {
                        notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in TechnoService.create_workingcopy' });
                        throw error;
                    });
                },
                with_name_like(name) {
                    if (name && name.length > 2) { // prevent search with too few characters
                        return $hesperidesHttp.get(`rest/technos/perform_search?terms=${ encodeURIComponent(name.replace(' ', '#')) }`).then(function (response) {
                            return _.map(response.data, function (techno) {
                                return new Techno(techno.name, techno.version, techno.working_copy);
                            });
                        });
                    }
                    var deferred = $q.defer();
                    deferred.resolve([]);
                    return deferred.promise;
                },
            };
        }
    );
