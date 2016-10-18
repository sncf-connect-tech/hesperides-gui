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
var applicationModule = angular.module('hesperides.module', ['hesperides.application']);


applicationModule.controller('ModuleCtrl', [
    '$scope', '$routeParams', '$location', '$mdDialog', 'TechnoService', 'ModuleService', 'HesperidesTemplateModal', 'Template', 'Page',
    'FileService', 'Platform', '$translate',
    function ($scope, $routeParams, $location, $mdDialog, TechnoService, ModuleService, HesperidesTemplateModal, Template, Page,
              FileService, Platform, $translate) {

    Page.setTitle('Module');

    $scope.is_workingcopy = ($routeParams.type == "workingcopy");
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
    }).then(function(){
        return ModuleService.get_all_templates($scope.module);
    }).then(function(templateEntries){
        $scope.templateEntries = templateEntries;
    }).then(function(){
        $scope.refreshModel();
    });

    $scope.add_template = function () {
        HesperidesTemplateModal.edit_template({
            template: new Template(),
            isReadOnly: false,
            onSave: $scope.save_template,
            add: true
        });
    };

    $scope.edit_template = function (name) {
        ModuleService.get_template($scope.module, name).then(function (template) {
            HesperidesTemplateModal.edit_template({
                template: template,
                isReadOnly: !$scope.module.is_working_copy,
                onSave: $scope.save_template,
                add: false
            });
        });
    };

    $scope.save_template = function (template) {
        return ModuleService.save_template($scope.module, template).then(function (savedTemplate) {
            //MAJ liste de templates
            var entry = _.find($scope.templateEntries, function (templateEntry) {
                return (templateEntry.name === savedTemplate.name);
            });

            if (entry) { //It was an update
                entry.name = savedTemplate.name;
                entry.location = savedTemplate.location;
                entry.filename = savedTemplate.filename;
                entry.rights = FileService.files_rights_to_string(savedTemplate.rights);
                if (entry.rights < 0)
                    $translate('template.rights.none').then(function (label) { entry.rights = label; });

            } else {
                right = FileService.files_rights_to_string(savedTemplate.rights);
                var new_entry = {
                    name: savedTemplate.name,
                    location: savedTemplate.location,
                    filename: savedTemplate.filename,
                    rights: right
                };
                if (right < 0)
                    $translate('template.rights.none').then(function (label) { new_entry.rights = label; });
                $scope.templateEntries.push(new_entry);
            }
            $scope.refreshModel();
            return savedTemplate;
        });
    };

    $scope.delete_template = function (name) {
        ModuleService.delete_template($scope.module, name).then(function () {
            $scope.templateEntries = _.reject($scope.templateEntries, function (templateEntry) {
                return (templateEntry.name === name); //MAJ de la liste de templates
            });
            $scope.refreshModel();
        });
    };

    /* This function is used to save the module */
    $scope.save = function (module) {
        return ModuleService.save(module).then(function (module) {
            $scope.module = module;
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
        $scope.save($scope.module).then(function(){
            $scope.refreshModel();
        });
    };

    $scope.delete_techno = function (techno) {
        $scope.module.remove_techno(techno);
        $scope.save($scope.module).then(function(){
            $scope.refreshModel();
        });
    };

    $scope.create_release = function(module, release_version){
        ModuleService.create_release(module, release_version).then(function(){
            $location.path('/module/' + module.name + '/' + release_version).search({});
        });
    };

    $scope.open_create_release_dialog = function(module){
        var modalScope = $scope.$new(true);

        modalScope.$closeDialog = function() {
            $mdDialog.cancel();
        };

        modalScope.$save = function(release_version) {
            $scope.create_release(module, release_version);
            $mdDialog.cancel();
        };

        $mdDialog.show({
            templateUrl: 'module/create_release.html',
            controller: 'ModuleCtrl',
            clickOutsideToClose:true,
            scope:modalScope
        });
    };

    /**
     * Affiche la liste des propriétés associées à un module.
     */
    $scope.open_associated_properties_dialog = function(module){
        var modalScope = $scope.$new(true);

        modalScope.$closeDialog = function() {
            $mdDialog.cancel();
        };

        modalScope.$save = function(release_version) {
            $scope.create_release(module, release_version);
            $mdDialog.cancel();
        };

        $mdDialog.show({
            templateUrl: 'model/model-modal.html',
            controller: 'ModuleCtrl',
            clickOutsideToClose:true,
            scope:modalScope
        });
    };

}]);

applicationModule.factory('Module', ['Techno', function (Techno) {

    var Module = function (data) {
        angular.extend(this, {
            name: "",
            version: "",
            is_working_copy: true,
            technos: [],
            version_id: -1
        }, data);

        if (!_.isUndefined(data.working_copy)) { //When it is created through a rest entity
            this.is_working_copy = data.working_copy;
        }

        /* Object casting when instance is created */
        this.technos = _.map(this.technos, function (data) {
            return new Techno(data.name, data.version, data.working_copy);
        });

        this.title = this.name + ', ' + this.version + (this.is_working_copy ? ' (working copy)' : '');

        this.add_techno = function (techno) {
            if (!_.some(this.technos, {'name': techno.name, 'version': techno.version, 'is_working_copy': techno.is_working_copy})) {
                this.technos.push(techno);
            }
            return techno;
        };

        this.remove_techno = function (techno) {
            _.remove(this.technos, function (existing) {
                return _.isEqual(existing, techno)
            });
        };

        this.has_techno = function (techno) {
            return _.some(this.technos, {'name': techno.name, 'version': techno.version, 'is_working_copy': techno.is_working_copy});
        };

        this.to_rest_entity = function () {
            return {
                name: this.name,
                version: this.version,
                working_copy: this.is_working_copy,
                version_id: this.version_id,
                technos: _.map(this.technos, function (techno) {
                    return techno.to_rest_entity();
                })
            };
        };

        this.get_properties_path = function(){
            return this.path +'#'+this.name+'#'+this.version+'#'+(this.is_working_copy ? "WORKINGCOPY" : "RELEASE");
        };

    };

    return Module;

}]);

applicationModule.factory('ModuleService', [
    '$hesperidesHttp', '$q', 'Module', 'Template', 'TemplateEntry', 'Properties', 'FileService', '$translate', 'Platform',
    function ($http, $q, Module, Template, TemplateEntry, Properties, FileService, $translate, Platform) {

    return {
        get: function (name, version, is_working_copy) {
            return $http.get('rest/modules/' + encodeURIComponent(name) + '/' + encodeURIComponent(version) + "/" + (is_working_copy ? "workingcopy" : "release")).then(function (response) {
                return new Module(response.data);
            }, function (error) {
                $.notify(error.data.message, "error");
                throw error;
            });
        },
        save: function (module) {
            if (!module.is_working_copy) {
                $translate('module.workingCopy.event.error').then(function(label) {
                    $.notify(label, "error");
                });                
                throw module;
            } else {
                module = module.to_rest_entity();
                if (module.version_id < 0) {
                    return $http.post('rest/modules', module).then(function (response) {
                        $translate('module.workingCopy.event.created').then(function(label) {
                            $.notify(label, "success");
                        });
                        return new Module(response.data);
                    }, function (error) {
                        $.notify(error.data.message, "error");
                    });
                } else {
                    return $http.put('rest/modules', module).then(function (response) {
                        $translate('module.workingCopy.event.updated').then(function(label) {
                            $.notify(label, "success");
                        });
                        return new Module(response.data);
                    }, function (error) {
                        $.notify(error.data.message, "error");
                    });
                }
            }
        },
        get_model: function (module){
            return $http.get('rest/modules/' + encodeURIComponent(module.name) + '/' + encodeURIComponent(module.version) + '/' + (module.is_working_copy ? "workingcopy" : "release") + '/model').then(function(response){
                return new Properties(response.data);
            }, function () {
                return new Properties({});
            });
        },
        get_platforms: function (module){
            return $http.get('rest/applications/using_module/' + encodeURIComponent(module.name) + '/' + encodeURIComponent(module.version) + '/'+ (module.is_working_copy ? "workingcopy" : "release")).then(function(response){
                return response.data.map(function (current) {
                                           return new Platform(current);
                                       });
            }, function () {
                return new Platform([]);
            });
        },
        get_template: function (module, template_name) {
            return $http.get('rest/modules/' + encodeURIComponent(module.name) + '/' + encodeURIComponent(module.version) + '/'+ (module.is_working_copy ? "workingcopy" : "release") +'/templates/' + encodeURIComponent(template_name)).then(function (response) {
                return new Template(response.data);
            }, function (error) {
                $.notify(error.data.message, "error");
                throw error;
            });
        },
        get_all_templates: function (module) {
            var baseUrl = 'rest/modules/' + encodeURIComponent(module.name) + '/' + encodeURIComponent(module.version) + '/'+ (module.is_working_copy ? "workingcopy" : "release") +'/templates';

            return $http.get(baseUrl).then(function (response) {
                return response.data.map(function (data) {
                    var entry = new TemplateEntry(data);
                    var url = baseUrl + '/' + encodeURIComponent(entry.name);

                    entry.getRights(url).then (function (template){
                        entry.rights = FileService.files_rights_to_string(template.rights);
                        if (entry.rights < 0)
                            $translate('template.rights.none').then(function (label) { entry.rights = label; });
                    });
                    return entry;
                }, function (error) {
                    if (error.status != 404) {
                        $.notify(error.data.message, "error");
                        throw error;
                    } else {
                        return [];
                    }
                });
            });
        },
        save_template: function (module, template) {
            if (!module.is_working_copy) {
                $translate('module.template.event.error').then(function(label) {
                    $.notify(label, "error");
                });
                throw module;
            } else {
                template = template.toHesperidesEntity();
                if (template.version_id < 0) {
                    return $http.post('rest/modules/' + encodeURIComponent(module.name) + '/' + encodeURIComponent(module.version) + '/workingcopy/templates', template).then(function (response) {
                        $translate('template.event.created').then(function(label) {
                            $.notify(label, "success");
                        })
                        return new Template(response.data);
                    }, function (error) {
                        if (error.status === 409) {
                            $translate('template.event.error').then(function(label) {
                                $.notify(label, "error");
                            })
                        } else {
                            $.notify(error.data.message, "error");
                        }
                        throw error;
                    });
                } else {
                    return $http.put('rest/modules/' + encodeURIComponent(module.name) + '/' + encodeURIComponent(module.version) + '/workingcopy/templates', template).then(function (response) {
                        $translate('template.event.updated').then(function(label) {
                            $.notify(label, "success");
                        });
                        return new Template(response.data);
                    }, function (error) {
                        $.notify(error.data.message, "error");
                        throw error;
                    });
                }
            }
        },
        delete_template: function (module, template_name) {
            if (!module.is_working_copy) {
                $translate('module.workingCopy.event.error').then(function(label) {
                    $.notify(label, "error");
                });                
                throw module;
            } else {
                return $http.delete('rest/modules/' + encodeURIComponent(module.name) + '/' + encodeURIComponent(module.version) + '/workingcopy/templates/' + encodeURIComponent(template_name)).then(function (response) {
                    $translate('template.event.deleted').then(function(label) {
                        $.notify(label, "success");
                    })
                    return response;
                }, function (error) {
                    $.notify(error.data.message, "error");
                    throw error;
                });
            }
        },
        create_release: function (module, release_version) {
            if (!module.is_working_copy) {
                $translate('release.event.error').then(function(label) {
                    $.notify(label, "error");
                });                
                throw module;
            } else {
                return $http.post('rest/modules/create_release?module_name=' + encodeURIComponent(module.name) + '&module_version=' + encodeURIComponent(module.version) + '&release_version=' + encodeURIComponent(release_version)).then(function (response) {
                    $translate('release.event.created', {name:module.name, version:release_version}).then(function(label) {
                        $.notify(label, "success");
                    });
                    return new Module(response.data);
                }, function (error) {
                    $.notify(error.data.message, "error");
                    throw error;
                });
            }
        },
        create_workingcopy_from: function(name, version, fromModule) {
            var newModule = new Module({name: name, version:version}).to_rest_entity();
            return $http.post('rest/modules?from_module_name='+encodeURIComponent(fromModule.name)+'&from_module_version='+encodeURIComponent(fromModule.version)+'&from_is_working_copy='+encodeURIComponent(fromModule.is_working_copy), newModule).then(function(response){
                $translate('workingCopy.event.created.details', {name:name, version:version}).then(function(label) {
                    $.notify(label, "success");
                });                
                return new Module(response.data);
            }, function (error) {
                $.notify(error.data.message, "error");
                throw error;
            });
        },
        with_name_like: function (name) {
            if (!_.isUndefined(name)){
                if(name.length > 2) { //prevent search with too few characters
                    return $http.post('rest/modules/perform_search?terms=' + encodeURIComponent(name)).then(function (response) {

                        items = _.map(response.data, function (module) {
                            return new Module(module);
                        });

                        var swaping = true;

                        // Preserving order version descending sort grouped by name
                        while (swaping) {
                            swaping = false;
                            for (x in items) {
                                if (x > 0) {
                                    if (items[x].name === items[x-1].name) {
                                        if (items[x].version > items[x-1].version) {
                                            swaping = true;
                                            var temp = items[x];
                                            items[x] = items[x-1];
                                            items[x-1] = temp;
                                        }
                                    }
                                }
                            }
                        }

                        return items;
                    });
                } else {
                    var deferred = $q.defer();
                    deferred.resolve([]);
                    return deferred.promise;
                }
            }
        },
        search: function (name) {
            if (!_.isUndefined(name)){
                return $http.post('rest/modules/search?terms=' + encodeURIComponent(name.toLowerCase())).then(function (response) {
                    return response.data;
                }, function () {
                    return null;
                });
             }
         }
    };

}]);
