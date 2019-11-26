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

/**
 * Global utility function for generation a unique id
 * each for iterable properties bloc.
 * This is used by :
    - mergeWithModel function
    - IterablePropertiesContainer directive
 */
var getIdentifier = function () {
    /**
     * Private function for getting
     * a random number between a min and a max
     *
     * This is used for calculating the unique identifier
     */
    var getRandomInt = function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    };

    // Calculate the unique identifier
    return (new Date()).getTime() + getRandomInt(100, 100000);
};


/**
 * Private function for adding the new empty value from the model
 * This makes use of recursion
 * This is used by :
      - mergeWithModel function
      - IterablePropertiesContainer directive
 * @param {Object} property : the property the value should be added to
 * @param {Object} model : the model of the property
 */
var addFromModel = function (property, model) {
    var value = {
        id: getIdentifier(),
        title: '',
        values: [],
    };

    _.each(model.fields, function (field) {
        if (_.isUndefined(field.fields)) {
            value.values.push({
                name: field.name,
                value: (field.required) ? null : '',
                inModel: true,
                comment: (field.comment) ? field.comment : '',
                password: (field.password) ? field.password : false,
                defaultValue: (field.defaultValue) ? field.defaultValue : '',
                required: (field.required) ? field.required : false,
                pattern: (field.pattern) ? field.pattern : '',
            });
        } else {
            // we add and then search just to make the object tracked by the browser.
            // No other way to do this yet ;)
            value.values.push({
                name: field.name,
                iterable_valorisation_items: [],
                inModel: true,
            });

            addFromModel(_.last(value.values), field);
        }
    });

    property.iterable_valorisation_items.unshift(value);
};

/**
 * Hesperides properties module
 */
angular.module('hesperides.properties', [ 'hesperides.diff', 'hesperides.localChanges', 'hesperides.modals', 'cgNotify', 'hesperides.module.propertiesList'])

    .controller('PlatformVersionController', [
        '$scope', '$mdDialog',
        function ($scope, $mdDialog) {
            $scope.$change = function (modal_data) {
                // sinon, on ne met à jour que la version de l'application
                $scope.platform.application_version = modal_data.new_version;

                // sauvegarde de la plateforme
                $scope.save_platform_from_box($scope.mainBox)
                    .then(function () {
                        $scope.properties = null;
                        $scope.instance = null;
                    });

                $mdDialog.cancel();
            };

            $scope.setItem = function (name, value) {
                $scope[name] = value;
            };
        },
    ])

    // eslint-disable-next-line max-statements
    .controller('PropertiesController', function ($scope, $routeParams, $mdDialog, $location, $route, $anchorScroll,
        ApplicationService, FileService, EventService, ModuleService, ApplicationModule, Page, $translate,
        $window, $http, Properties, HesperidesModalFactory, LocalChanges, $rootScope, notify, UserService, $document) {
        $scope.ctrl = $scope;

        // En définissant cette propriété dans ce scope chapeau,
        // on permet de conserver le même filtre .searchInTree entre plateformes - cf. #252
        $scope.parentScope = $scope.$parent.$parent;
        $scope.platform = $routeParams.platform;
        $scope.platforms = [];

        $scope.fileEntries = [];

        $scope.isPlatformOpen = 1;

        $scope.$closeDialog = function () {
            $mdDialog.cancel();
        };

        $scope.contain_empty_module_status = {};

        $scope.cached_empty_module = [];

        $scope.quickOpen = true;

        $scope.mainBox = null;

        $scope.new_instance_name = null;

        // The new global property info
        $scope.new_kv_name = '';
        $scope.new_kv_value = '';

        /**
         * An ugly copy for properties
         */
        $scope.oldProperties = null;

        /**
         * An ugly copy of global properties
         */
        $scope.oldGolbalProperties = null;

        $scope.boxModeUnfoldInstancesByDefault = store.get('unfoldInstancesByDefault');

        // Initialisés plus bas dans le constructeur :
        $scope.user = {};
        $scope.appGroupCNs = [];

        // #nomorebloc if (store.get('display_mode') === 'arbre') {
        $scope.box = false;
        $scope.tree = true;
        // } else {
        //     $scope.box = true;
        //     $scope.tree = false;
        // }

        var Box = function (data) {
            return angular.extend(this, {
                parent_box: null,
                name: '',
                children: {},
                modules: [],
                openBySearchFilter: true,
                isEmpty() {
                    return _.keys(this.children).length === 0 && this.modules.length === 0;
                },
                get_path() {
                    return (this.parent_box ? `${ this.parent_box.get_path() }#` : '') + this.name;
                },
                to_modules() {
                    var me = this;
                    _.forEach(this.modules, function (module) {
                        module.path = me.get_path();
                    });
                    return this.modules.concat(
                        _.flatten(_.map(this.children, function (box) {
                            return box.to_modules();
                        }))
                    );
                },
            }, data);
        };

        $scope.is_module_has_model = function (module) {
            return _.some($scope.cached_empty_module, {
                'name': module.name,
                'version': module.version,
                'is_working_copy': module.is_working_copy,
                'has_model': true,
            });
        };

        $scope.empty_module_status = function () {
            var return_value = false;

            Object.keys($scope.contain_empty_module_status).forEach(function (key) {
                if ($scope.contain_empty_module_status[key]) {
                    return_value = true;
                }
            });
            return return_value;
        };

        $scope.is_prod_flag_missing = function () {
            if (!$scope.platform) { // cette fonction peut être appelée avant que cette propriété ne soit initialisée
                return false;
            }
            return (_.startsWith($scope.platform.name, 'PRD') || _.startsWith($scope.platform.name, 'PROD')) && !$scope.platform.production;
        };

        $scope.productionPlatformContainsWorkingCopyModules = function () {
            if (!$scope.platform) { // cette fonction peut être appelée avant que cette propriété ne soit initialisée
                return false;
            }
            return $scope.platform.production && $scope.getPlatformWorkingCopyModules().length > 0;
        };

        $scope.getPlatformWorkingCopyModules = function () {
            return _.filter($scope.platform.modules, { is_working_copy: true });
        };

        $scope.contain_empty_module = function (box) {
            var return_value = '';

            if (box) {
                var check_modules_models = function (modules) {
                    _.forEach(modules, function (module) {
                        var ref = { 'name': module.name, 'version': module.version, 'is_working_copy': module.is_working_copy };

                        if (!_.some($scope.cached_empty_module, ref)) {
                            $scope.cached_empty_module.push(ref);
                            var elem = _.find($scope.cached_empty_module, ref);
                            if (elem) {
                                ModuleService.get(module.name, module.version, module.is_working_copy)
                                    .then(() => {
                                        elem.has_model = true;
                                    })
                                    .catch(() => {
                                        elem.has_model = false;
                                    });
                            }
                        }
                    });
                };

                check_modules_models(box.modules);

                _.forEach(box.children, function (child) {
                    check_modules_models(child.modules);
                });

                _.forEach(box.modules, function (module) {
                    if (_.some($scope.cached_empty_module, { 'name': module.name, 'version': module.version, 'is_working_copy': module.is_working_copy, 'has_model': false })) {
                        return_value = 'contain_empty_module';
                    }
                });

                _.forEach(box.children, function (child) {
                    _.forEach(child.modules, function (module) {
                        if (_.some($scope.cached_empty_module, { 'name': module.name, 'version': module.version, 'is_working_copy': module.is_working_copy, 'has_model': false })) {
                            return_value = 'contain_empty_module';
                        }
                    });
                });
            }

            $scope.contain_empty_module_status[box ? box.name : 'empty_key'] = Boolean(return_value.length);

            return return_value;
        };

        $scope.update_main_box = function (platform) {
            // Try to build the view depending on the different paths of the modules
            var mainBox = new Box({ parent_box: null });

            var oldMainBox = $scope.mainBox;

            var search_old_box = function (oldBoxes, box) {
                var currentBox = box;
                if (oldBoxes) {
                    var path = [];

                    // Recreate path
                    while (currentBox.parent_box) {
                        path.push(currentBox.name);
                        currentBox = currentBox.parent_box;
                    }

                    // Search box in path
                    currentBox = oldBoxes;
                    while (path.length && currentBox) {
                        currentBox = currentBox.children[path.pop()];
                    }
                }
                return currentBox;
            };

            var add_to_box = function (box, folders, level, module) {
                if (level > folders.length) {
                    throw new Error('Should have nether been here, wrong use of add_to_box recursive function');
                }

                var oldBox = null;

                if (level === folders.length) {
                    // Found terminal level
                    box.modules.push(module);

                    oldBox = search_old_box(oldMainBox, box);

                    if (oldBox && oldBox.modules && oldBox.modules.length > 0) {
                        var currentModule = _.filter(oldBox.modules, { name: module.name });
                        if (currentModule.length > 0) {
                            module.openBySearchFilter = currentModule[0].openBySearchFilter;
                        }
                    }
                } else {
                    var name = folders[level];

                    if (_.isUndefined(box.children[name])) {
                        var newBox = new Box({ parent_box: box, name });
                        box.children[name] = newBox;

                        oldBox = search_old_box(oldMainBox, newBox);

                        if (oldBox) {
                            newBox.openBySearchFilter = oldBox.openBySearchFilter;
                        }
                    }

                    add_to_box(box.children[name], folders, level + 1, module);
                }
            };

            _.each(platform.modules, function (module) {
                var path = module.path;
                if (path.charAt(0) === '#') { // Remove possible preceding #
                    path = path.substring(1, path.length);
                }
                var folders = path.split('#');
                add_to_box(mainBox, folders, 0, module);
            });
            $scope.mainBox = mainBox;
        };

        $scope.remove_box = function (name, box) {
            delete box.parent_box.children[name];
        };

        $scope.update_box_name = function (box, old_name, new_name) {
            if (old_name !== new_name) {
                box.name = new_name;
                box.parent_box.children[new_name] = box.parent_box.children[old_name];
                delete box.parent_box.children[old_name];
                $scope.save_platform_from_box($scope.mainBox, true);
            }
        };

        $scope.open_add_box_dialog = function (box) {
            var modalScope = $scope.$new();

            modalScope.addBox = function (logicGroupNames) {
                let parentBox = box;
                logicGroupNames.split('#').filter(_.identity) // Permet d'ignorer les chaines vides, par exemple si logicGroupNames=#A##B#
                    .forEach((logicGroupName) => {
                        parentBox.children[logicGroupName] = new Box({ parent_box: parentBox, name: logicGroupName.trim() });
                        parentBox = parentBox.children[logicGroupName];
                    });
                $mdDialog.cancel();
            };

            modalScope.okToAddNewLogicGroup = function (addComponentForm, logicGroupName) {
                return !(addComponentForm.$invalid || Object.keys(box.children).includes(logicGroupName));
            };

            $mdDialog.show({
                templateUrl: 'properties/add_box.html',
                clickOutsideToClose: true,
                scope: modalScope,
            });
        };

        $scope.open_add_instance_dialog = function (module) {
            var modalScope = $scope.$new();

            modalScope.$add = function (name) {
                $scope.add_instance(name, module);
                $mdDialog.cancel();
            };

            $mdDialog.show({
                templateUrl: 'properties/add_instance.html',
                clickOutsideToClose: true,
                scope: modalScope,
            });
        };

        /**
         * Met à jour la version de la plateforme.
         *
         * @param platform plateforme courante
         */
        $scope.change_platform_version = function (platform) {
            var modalScope = $scope.$new();
            modalScope.platform = platform;
            modalScope.onLoading = true;

            modalScope.isValid = function () {
                return !_.isUndefined(modalScope.newVersion) && !_.isEmpty(modalScope.newVersion);
            };

            $mdDialog.show({
                templateUrl: 'properties/change_platform_version.html',
                controller: 'PlatformVersionController',
                clickOutsideToClose: true,
                scope: modalScope,
                onComplete() {
                    // Use to prevent display list of version at wrong position
                    modalScope.onLoading = false;
                },
            });
        };

        $scope.search_module = function (box) {
            var modalScope = $scope.$new();
            modalScope.closeAddModuleDialog = function () {
                $mdDialog.cancel();
            };

            modalScope.addModule = function (module) {
                $scope.add_module(module.name, module.version, module.is_working_copy, box);
                $mdDialog.cancel();
            };

            $mdDialog.show({
                templateUrl: 'properties/search_module.html',
                clickOutsideToClose: true,
                scope: modalScope,
            });
        };

        $scope.change_module = function (module) {
            var modalScope = $scope.$new();
            modalScope.module = module;
            modalScope.copyProperties = store.get('copy_properties') || false;
            modalScope.searchText = `${ module.name } `;

            modalScope.$update = function (modal_data) {
                var new_module = modal_data.new_module;
                module.name = new_module.name;
                module.version = new_module.version;
                module.is_working_copy = new_module.is_working_copy;
                $scope.save_platform_from_box($scope.mainBox, modal_data.copy_properties).then(function () {
                    $scope.properties = null;
                    $scope.instance = null;
                    $mdDialog.cancel();
                });
            };

            $mdDialog.show({
                templateUrl: 'properties/change_module_version.html',
                clickOutsideToClose: true,
                scope: modalScope,
            });
        };

        $scope.showDialogPropertiesList = function (providedplatform) {
            var modalScope = $scope.$new();
            modalScope.platform = providedplatform;

            $mdDialog.show({
                templateUrl: 'module/properties-list/properties-list-modal.html',
                controller: 'PropertiesListController',
                clickOutsideToClose: true,
                scope: modalScope,
            });
        };

        $scope.diffProperties = function (fromModule) {
            const modalScope = $scope.$new();
            modalScope.fromPlatform = { application_name: $scope.platform.application_name, platform: $scope.platform.name };
            modalScope.fromModule = fromModule;
            $mdDialog.show({
                templateUrl: 'diff/properties_diff_wizard.html',
                controller: 'PropertiesDiffWizardController',
                clickOutsideToClose: true,
                scope: modalScope,
            });
        };

        $scope.diffGlobalProperties = function () {
            const modalScope = $scope.$new();
            modalScope.fromPlatform = { application_name: $scope.platform.application_name, platform: $scope.platform.name };
            $mdDialog.show({
                templateUrl: 'diff/global_properties_diff_wizard.html',
                controller: 'GlobalPropertiesDiffWizardController',
                clickOutsideToClose: true,
                scope: modalScope,
            });
        };

        $scope.quickDisplayInstance = function () {
            $scope.$broadcast(($scope.quickOpen ? 'quickHideInstanceDetails' : 'quickDisplayInstanceDetails'), {});
            $scope.quickOpen = !$scope.quickOpen;
        };

        $scope.resetOpenByClick = function () {
            $scope.$broadcast('resetOpenByClick', {});
        };

        $scope.find_modules_by_name = function (name) {
            return ModuleService.with_name_like(name);
        };

        $scope.add_module = function (name, version, is_working_copy, box) {
            if (!_.some(box.modules, { name, version, is_working_copy })) {
                box.modules.push(new ApplicationModule(
                    {
                        name,
                        version,
                        is_working_copy,
                        path: box.get_path(),
                    }
                ));

                $scope.save_platform_from_box($scope.mainBox).then(function () {
                    $scope.properties = null;
                    $scope.instance = null;
                });
            }
        };

        $scope.add_instance = function (name, module) {
            module.create_new_instance(name);
            $scope.save_platform_from_box($scope.mainBox);
        };

        /**
         * This is used to preview an instance data.
         */
        $scope.preview_instance = function (box, application, platform, instance, module, simulate) {
            simulate = simulate || false;

            var modalScope = $scope.$new();

            modalScope.codeMirrorOptions = {
                'readOnly': true,
                'autoRefresh': true,
            };

            instance = instance ? instance : { name: 'default' };
            modalScope.instance = instance;
            modalScope.isOpen = null;

            FileService.get_files_entries(application.name, platform.name, box.get_path(), module.name, module.version, instance.name, module.is_working_copy, simulate).then(function (entries) {
                modalScope.fileEntries = entries;

                $mdDialog.show({
                    templateUrl: 'file/file-modal.html',
                    clickOutsideToClose: true,
                    scope: modalScope,
                });
            });

            // Download all the files
            modalScope.download_all_instance_files = function () {
                FileService.download_files(modalScope.fileEntries, modalScope.instance.name);
            };

            // Manager accordion open/close
            modalScope.open = function (index) {
                modalScope.isOpen = (index === modalScope.isOpen) ? null : index;
            };
        };

        /**
         * This used to show the event lists.
         * Added by Tidiane SIDIBE on 08/03/2016
         */
        $scope.show_events = function (param1, param2, action) {
            var modalScope = $scope.$new(true);
            // used for events filtering
            modalScope.filtering = {};

            var page = 1; // the starting page is 1.
            var events = [];

            // used for events diff
            modalScope.selectedEvents = [];

            // Creating the stream name
            var stream = null;
            if (action === 'platform') {
                stream = `${ action }-${ param1.name }-${ param2.name }`;
                modalScope.title = `${ param1.name }-${ param2.name }`;
            } else {
                stream = `${ action }-${ param2.name }-${ param2.version }-`;
                if (param2.is_working_copy) {
                    stream = `${ stream }wc`;
                } else {
                    stream = `${ stream }release`;
                }

                modalScope.title = `${ param2.name }-${ param2.version }`;
            }

            /**
             * Private function to preload next events
             */
            var preloadNextEvents = function () {
                EventService.get(stream, page).then(function (nextEntries) {
                    events = nextEntries;
                    page++;
                });
            };

            /**
             * Private function for index calculation
             */
            var setIds = function (lengthOfAll, entries) {
                _.each(entries, (entry, index) => {
                    entry.id = lengthOfAll + index;
                });
                return entries;
            };

            // Get evevents
            EventService.get(stream, page).then(function (entries) {
                modalScope.eventEntries = setIds(0, entries);
                page++;

                /**
                 * Private function used to check if the events are selectabled or not
                  */
                modalScope.checkSelectStatus = function () {
                    // get the target items
                    var isGlobal = null;
                    if (modalScope.selectedEvents.length === 1) {
                        isGlobal = modalScope.selectedEvents[0].isGlobal;
                    }

                    _.each(modalScope.eventEntries, function (eventEntry) {
                        if (modalScope.selectedEvents.length === 2) {
                            if (_.isUndefined(_.find(modalScope.selectedEvents, { id: eventEntry.id }))) {
                                eventEntry.isSelectable = false;
                            }
                        } else {
                            eventEntry.isSelectable = !isGlobal || eventEntry.isGlobal === isGlobal;
                        }
                    });
                };

                //
                // Show the modal
                //
                $mdDialog.show({
                    templateUrl: 'event/event-modal.html',
                    clickOutsideToClose: true,
                    scope: modalScope,
                });

                // Preload the next page
                preloadNextEvents();

                modalScope.closeEventsDialog = function () {
                    $mdDialog.cancel();
                };

                /**
                 * Show more events
                 */
                modalScope.noMoreEvents = false;
                modalScope.msgMoreEvents = 'Plus encore ...';

                modalScope.showMoreEvents = function () {
                    if (events.length > 0) {
                        // adding IDs to events
                        events = setIds(modalScope.eventEntries.length, events);

                        // merging the events with the others
                        modalScope.eventEntries = _.union(modalScope.eventEntries, events);

                        // check status
                        modalScope.checkSelectStatus();

                        // disable filters
                        modalScope.filtering = {};

                        preloadNextEvents();
                    } else {
                        // no more events to load
                        modalScope.noMoreEvents = true;
                    }
                };

                /**
                 * This function show the diff page between the
                 * selected events.
                 * This show the diff page of both simple and global properties
                 */
                modalScope.showDiff = function () {
                    var from = modalScope.selectedEvents[0];
                    var to = modalScope.selectedEvents[1];

                    var urlParams = {
                        application: from.data.applicationName,
                        platform: from.data.platformName,
                        properties_path: from.data.path,
                        compare_application: to.data.applicationName,
                        compare_platform: to.data.platformName,
                        compare_path: to.data.path,
                    };

                    urlParams.origin_timestamp = from.timestamp;
                    if (to.timestamp) {
                        urlParams.timestamp = to.timestamp;
                    }
                    var url = `/#/diff?${ Object.keys(urlParams).map(function (key) {
                        return `${ encodeURIComponent(key) }=${ encodeURIComponent(urlParams[key]) }`;
                    }).join('&') }`;
                    $window.open(url, '_blank');
                };
            });
        };

        $scope.delete_instance = function (instance, module) {
            module.delete_instance(instance);
            $scope.save_platform_from_box($scope.mainBox);
        };

        $scope.update_instance_name = function (instance, new_name) {
            instance.name = new_name;
            $scope.save_platform_from_box($scope.mainBox);
        };

        $scope.delete_module = function (module, box) {
            _.remove(box.modules, function (existing) {
                return _.isEqual(existing, module);
            });
            $scope.save_platform_from_box($scope.mainBox);
        };

        /**
         * That function saves the instance properties
         */
        $scope.save_platform_from_box = function (box, copyPropertiesOfUpdatedModules) {
            $scope.platform.modules = box.to_modules();
            return ApplicationService.save_platform($scope.platform, copyPropertiesOfUpdatedModules).then(function (platform) {
                $scope.platform = platform;
                // Replace platforms in the list by the new one
                var existing_index = _.findIndex($scope.platforms, { name: platform.name });
                $scope.platforms[existing_index] = platform;

                // Updating reference of instance to keep it synchronized and thus to prevent loss of information in the next save
                if ($scope.instance) {
                    var matchingModule = _.filter(platform.modules, function (mod) {
                        return mod.properties_path === $scope.instance.properties_path;
                    })[0];

                    var matchingInstance = _.filter(matchingModule.instances, function (instance) {
                        return instance.name === ($scope.new_instance_name ? $scope.new_instance_name : $scope.instance.name);
                    })[0];

                    if (matchingInstance) {
                        matchingInstance.properties_path = $scope.instance.properties_path;

                        ApplicationService.get_instance_model($routeParams.application, $scope.platform, $scope.instance.properties_path).then(function (model) {
                            $scope.instance = matchingInstance.mergeWithModel(model);
                        });
                    }

                    $scope.new_instance_name = null;
                }

                // Update the view
                $scope.update_main_box(platform);
            }, function () {
                // If an error occurs, reload the platform, thus avoiding having a non synchronized $scope model object
                $location.url(`/properties/${ $scope.platform.application_name }`).search({ platform: $scope.platform.name });
                $route.reload(); // Force reload if needed
            });
        };

        $scope.on_edit_platform = function (platform) {
            $scope.$broadcast('quickHideInstanceDetails', {});
            $scope.quickOpen = false;
            $location.url(`/properties/${ platform.application_name }?platform=${ platform.name }`);

            ApplicationService.get_platform(platform.application_name, platform.name).then(function (searchPlatform) {
                $scope.platform = searchPlatform;
                $scope.selected_module = null;
                $scope.instance = null;
                $scope.properties = null;
                $scope.update_main_box(searchPlatform);
                store.set('current_platform_versionID', searchPlatform.version_id || null);
            });
        };

        $scope.edit_properties = function (platform, module) {
            if ($scope.platform.global_properties_usage === null) {
                $scope.refreshGlobalPropertiesData();
            }
            ApplicationService.get_properties($routeParams.application, platform.name, module.properties_path).then(function (properties) {
                ModuleService.get_model(module).then(function (model) {
                    $scope.properties = properties.mergeWithModel(model);
                    $scope.model = model;

                    // Merge with global properties
                    $scope.properties = properties.mergeWithGlobalProperties($scope.platform.global_properties);
                    $scope.oldProperties = angular.copy($scope.properties);

                    $scope.properties = LocalChanges.mergeWithLocalProperties($routeParams.application, platform.name, module.properties_path, $scope.properties);
                    $scope.oldProperties = LocalChanges.tagWithLocalProperties($routeParams.application, platform.name, module.properties_path, $scope.oldProperties);

                    $scope.selected_module = module;
                    $scope.instance = null; // hide the instance panel if opened
                    $scope.showGlobalProperties = null;
                    $scope.showButtonAndEye = null;

                    // Auto scroll to the properties list
                    $location.hash('propertiesDivHolder');
                    $anchorScroll();
                });
            });
        };

        /**
         * Clean properties.
         * Used to delete unsed properties in module template.
         */
        $scope.clean_properties = function (properties) {
            // Filter to keep properties only existing in model
            properties.filter_according_to_model();
        };

        /**
         * Clean instance properties.
         * Used to deleted unused instance properties.
         */
        $scope.clean_instance_properties = function (instance) {
            instance.key_values = _.filter(instance.key_values, function (item) {
                return item.inModel;
            });
        };

        $scope.save_global_properties = function (properties, save) {
            // Getting information with querySelector, this is because there is
            // a scope problem
            var nameEl = angular.element($document[0].querySelector('#new_kv_name'));
            var valueEl = angular.element($document[0].querySelector('#new_kv_value'));

            // Check if there is new global property then add before saving
            if (!_.isEmpty(nameEl.val().trim())) {
                properties.addKeyValue({ 'name': nameEl.val().trim(), 'value': valueEl.val(), 'comment': '' });

                // Clear contents
                nameEl.val('');
                valueEl.val('');
            }

            if (save) {
                if (_.isEqual(properties, $scope.oldGolbalProperties)) {
                    $translate('properties-not-changed.message').then(function (label) {
                        notify({ classes: [ 'warn' ], message: label });
                    });
                    return;
                }

                // Save the global properties
                HesperidesModalFactory.displaySavePropertiesModal($scope, $routeParams.application, function (comment) {
                    ApplicationService.save_properties($routeParams.application, $scope.platform, properties, '#', comment).then(function (savedProperties) {
                        if ($scope.properties) {
                            $scope.properties = $scope.properties.mergeWithGlobalProperties(savedProperties);
                        }

                        // Increase platform number
                        $scope.platform.version_id++;
                        $scope.refreshGlobalPropertiesData();

                        // Key the saved as old
                        $scope.oldGolbalProperties = angular.copy(savedProperties);
                    });
                });
            } else {
                // Triggrer event to refresh instantly the virtual container of global properties, instead of waiting really long time
                $scope.$broadcast('$md-resize');
            }
        };

        // Why United Nations ? They are solving conflicts, rights ? :D
        $scope.show_united_nations_modal = function () {
            var modalScope = $scope.$new(false);

            $scope.instance = null;
            $scope.properties = null;
            $scope.showGlobalProperties = null;
            $scope.showButtonAndEye = null;

            modalScope.dialog = $mdDialog.show({
                templateUrl: 'local_changes/united-nations-modal.html',
                controller: 'UnitedNationsController',
                clickOutsideToClose: false,
                escapeToClose: true,
                preserveScope: false, // requiered for not freez menu see https://github.com/angular/material/issues/5041
                scope: modalScope,
            });
        };

        $scope.platformLocalChangesCount = function () {
            return LocalChanges.platformLocalChangesCount($scope.platform);
        };

        $scope.delete_platform = function () {
            ApplicationService.delete_platform($scope.platform.application_name, $scope.platform.name)
                .then(() => {
                    $location.url(`/properties/${ $scope.platform.application_name }`);
                    _.remove($scope.platforms, (platform) => platform.name === $scope.platform.name);
                    $scope.platform = null;
                });
        };

        $scope.restore_platform = function (platformToRestore) {
            ApplicationService.restore_platform($routeParams.application, platformToRestore)
                .then(() => $location.search({ platform: platformToRestore }));
        };

        $scope.save_properties_locally = function (properties, module) {
            if (
                _.isEqual(properties.key_value_properties, $scope.oldProperties.key_value_properties) &&
        // we use angular copy for these to remove the $$hashKey
        _.isEqual(angular.copy(properties.iterable_properties), angular.copy($scope.oldProperties.iterable_properties))) {
                $translate('properties-not-changed.message').then(function (label) {
                    notify({ classes: [ 'warn' ], message: label });
                });
                return false;
            }

            var hasSavedLocalChange = false;

            store.set('current_platform_versionID', $scope.platform.version_id || null);

            properties.key_value_properties.forEach(function (elem) {
                if (('filtrable_value' in elem && elem.filtrable_value !== elem.value) ||
            (!('filtrable_value' in elem) && elem.value && elem.value.toString().length > 0 && !elem.valuedByAGlobal)) {
                    LocalChanges.addLocalChange($routeParams.application, $scope.platform.name, module.properties_path, elem.name, elem.value);
                    hasSavedLocalChange = true;
                }
            });

            if (hasSavedLocalChange) {
                LocalChanges.smartClearLocalChanges({ 'application_name': $routeParams.application, 'platform': $scope.platform.name, 'properties_path': module.properties_path }, properties);

                $translate('properties.module.editProperties.savedLocally').then((label) =>
                    notify({ classes: [ 'success' ], message: label })
                );
            }

            properties = LocalChanges.tagWithLocalProperties($routeParams.application, $scope.platform.name, module.properties_path, properties);
            return true;
        };

        $scope.hasLocalChanges = function (module) {
            return LocalChanges.hasLocalChanges($routeParams.application, $scope.platform ? $scope.platform.name : '', module ? module.properties_path : '');
        };

        $scope.hasDeletedProperties = function () {
            return _.filter($scope.properties ? $scope.properties.key_value_properties : [], function (prop) {
                return !prop.inModel;
            }).length > 0;
        };

        $scope.instanceHasDeletedProperties = function (instance) {
            return _.filter(instance ? instance.key_values : [], function (prop) {
                return !prop.inModel;
            }).length > 0;
        };

        $scope.cleanLocalChanges = function (module) {
            LocalChanges.clearLocalChanges({ 'application_name': $routeParams.application, 'platform': $scope.platform.name, 'properties_path': module.properties_path });
            $scope.properties = LocalChanges.mergeWithLocalProperties($routeParams.application, $scope.platform.name, module.properties_path, $scope.properties);
        };


        $scope.save_properties = function (properties, module) {
            if ($scope.save_properties_locally(properties, module)) {
                // Save properties
                HesperidesModalFactory.displaySavePropertiesModal($scope, $routeParams.application, function (comment) {
                    ApplicationService.save_properties($routeParams.application, $scope.platform, properties, module.properties_path, comment).then(function (savedProperties) {
                        // Merge properties with model
                        ModuleService.get_model(module).then(function (model) {
                            $scope.properties = savedProperties.mergeWithModel(model);

                            // Keep the saved properties as old
                            $scope.oldProperties = angular.copy($scope.properties);
                        });

                        // Merge with global properties
                        $scope.properties = savedProperties.mergeWithGlobalProperties($scope.platform.global_properties);

                        // Increase platform number
                        $scope.platform.version_id++;

                        // Specify that the global_properties_usage = null means that data may have become outdated.
                        // So next time user wants global_properties we reload then instead of using cached ones.
                        $scope.platform.global_properties_usage = null;

                        // Cleanning up local change because they have been saved already
                        LocalChanges.clearLocalChanges({
                            application_name: $routeParams.application,
                            platform: $scope.platform.name,
                            properties_path: module.properties_path,
                        });

                    // Dismiss the modal
                    // modalScope.$closeDialog();
                    }, function () {
                        // If an error occurs, reload the platform, thus avoiding having a non synchronized $scope model object
                        $location.url(`/properties/${ $scope.platform.application_name }`).search({ platform: $scope.platform.name });
                        $route.reload(); // Force reload if needed
                    });
                });
            }
        };

        $scope.edit_instance = function (instance, properties_path) {
            ApplicationService.get_instance_model($routeParams.application, $scope.platform, properties_path).then(function (model) {
                $scope.instance = instance.mergeWithModel(model);
                $scope.instance.properties_path = properties_path;
                $scope.instance.key_values.forEach(function (elem) {
                    if (elem.value.length) {
                        elem.filtrable_value = elem.value;
                    }
                });
                $scope.properties = null; // hide the properties panel if opened
                $scope.showGlobalProperties = null;
            });
        };

        $scope.refreshGlobalPropertiesData = function () {
            ApplicationService.get_properties($scope.platform.application_name, $scope.platform.name, '#').then(function (response) {
                $scope.platform.global_properties = response;
                // making a copy, for changes detection
                $scope.oldGolbalProperties = angular.copy($scope.platform.global_properties);
            });
            ApplicationService.get_global_properties_usage($scope.platform.application_name, $scope.platform.name, '#').then(function (response) {
                $scope.platform.global_properties_usage = response;
            });
        };

        $scope.showGlobalPropertiesDisplay = function () {
            // --- Testing retrive on demand
            // If the usage is already filled, we don't call the backend, and serve cache instead
            if ($scope.platform.global_properties_usage === null) {
                $scope.refreshGlobalPropertiesData();
            }

            $scope.instance = null;
            $scope.properties = null;
            $scope.showGlobalProperties = !$scope.showGlobalProperties;
            $scope.showButtonAndEye = !$scope.showButtonAndEye;
        };

        $scope.open_module_page = function (name, version, is_working_copy) {
            var url = `/module/${ name }/${ version }`;
            if (is_working_copy) {
                url += '?type=workingcopy';
            }
            $location.url(url);
            $route.reload(); // Force reload if needed
        };

        /**
         * This will display the properties in the box mode.
         */
        $scope.boxModeShow = function () {
            if (!$scope.box) {
                $rootScope.isLoading = true;
                $scope.box = true;
                $scope.tree = false;
                $scope.properties = null;
                $scope.instance = null;
            }
        };

        /**
         * This will display the properties in the tree mode.
         */
        $scope.treeModeShow = function () {
            if (!$scope.tree) {
                $rootScope.isLoading = true;
                $scope.box = false;
                $scope.tree = true;
                $scope.properties = null;
                $scope.instance = null;
            }
        };
        
        function ensureDirectoryGroupsNotEmpty() {
            if (!$scope.application.directoryGroups) {
                $scope.application.directoryGroups = {};
            }
            if (!$scope.application.directoryGroups[`${ $scope.application.name }_PROD_USER`]) {
                $scope.application.directoryGroups[`${ $scope.application.name }_PROD_USER`] = [];
            }
        }

        function setValidatedAppGroupCNs() { // Met à jour .appGroupCNs à partir de .application
            ensureDirectoryGroupsNotEmpty();
            // Cet attribut est employé comme ng-model :
            $scope.appGroupCNs = $scope.application.directoryGroups[`${ $scope.application.name }_PROD_USER`];
            // On préserve une liste valide de groupes :
            $scope.originalAppGroupCNs = _.clone($scope.appGroupCNs);
        }

        $scope.onGroupCNsChange = function () { // Gère les changements sur $scope.appGroupCNs :
            console.log('onGroupCNsChange - $scope.appGroupCNs:', $scope.appGroupCNs);
            ensureDirectoryGroupsNotEmpty();
            ApplicationService.update_directory_groups({ name: $scope.application.name, directoryGroups: $scope.application.directoryGroups }).then((directoryGroups) => {
                // En cas de groupCN invalide, une notification sera affichée
                // On récupère les nouveaux droits :
                console.log('NEW directoryGroups:', directoryGroups);
                $scope.application.directoryGroups = directoryGroups;
                setValidatedAppGroupCNs();
                $translate('properties.application.prodPerms.changeSuccess').then((label) =>
                    notify({ classes: [ 'success' ], message: label })
                );
            }).catch(() => {
                // Retrocompatibility: we handle the case of non-existing .directoryGroups
                if (!$scope.originalAppGroupCNs) {
                    return;
                }
                // On restaure les droits initiaux :
                $scope.application.directoryGroups[`${ $scope.application.name }_PROD_USER`] = $scope.originalAppGroupCNs;
                setValidatedAppGroupCNs();
            });
        };

        Page.setTitle('Properties');

        UserService.authenticate().then(function (user) {
            $scope.user = user;
            $scope.userHasProdRoleForApp = user.hasProdRoleForApp($routeParams.application);
        });

        ApplicationService.get($routeParams.application).then(function (application) {
            if (!$routeParams.platform) {
                return { application, platform: null };
            }
            var platform = _.find(application.platforms, { name: $routeParams.platform });
            if (!platform) {
                throw new Error('Selected platform not found !');
            }
            return ApplicationService.get_platform(platform.application_name, platform.name).then((ptf) => ({ application, platform: ptf }));
        }).then(function (match) {
            $scope.application = match.application;
            $scope.platforms = match.application.platforms;

            setValidatedAppGroupCNs();

            if ($routeParams.platform) {
                $scope.platform = match.platform;
                $scope.update_main_box($scope.platform);
            }
        }).catch(function (error) {
            notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in PropertiesController constructor' });
            throw error;
        });
    })

    /**
     * Directive for rendering properties on box mode.
     */
    .directive('boxProperties', [
        '$timeout', '$rootScope', function ($timeout, $rootScope) {
            return {
                restrict: 'E',
                templateUrl: 'properties/box_properties.html',
                link() {
                    $timeout(() => {
                        $rootScope.isLoading = false;
                    }, 0);
                },
            };
        },
    ])

    /**
     * Directive for rendering properties on tree mode.
     */
    .directive('treeProperties', [
        '$timeout', '$rootScope', function ($timeout, $rootScope) {
            return {
                restrict: 'E',
                templateUrl: 'properties/tree_properties.html',
                link() {
                    $timeout(() => {
                        $rootScope.isLoading = false;
                    }, 0);
                },
            };
        },
    ])

    /**
     * This directive will display only the simple properties list.
     * Added by Tidiane SIDIBE on 11/03/2016
     */
    .directive('simplePropertiesList', [
        'LocalChanges', function (LocalChanges) {
            return {
                restrict: 'E',
                scope: {
                    properties: '=',
                    platform: '=',
                    module: '=',
                },
                templateUrl: 'properties/simple-properties-list.html',
                link(scope) {
                    scope.propertiesKeyFilter = '';
                    scope.propertiesValueFilter = '';
                    scope.onlyRequiredPropertiesSwitchChanged = false;

                    scope.hasLocalChanges = function () {
                        return LocalChanges.hasLocalChanges(scope.platform.application_name, scope.platform.name, scope.module ? scope.module.properties_path : '');
                    };

                    scope.hasSyncedChanges = function () {
                        return LocalChanges.hasSyncedChanges({ 'key_value_properties': scope.properties });
                    };

                    scope.areFullySynced = function () {
                        var properties_path = scope.module ? scope.module.properties_path : '';
                        var platform = scope.platform;

                        return LocalChanges.areFullySynced(platform ? platform.application_name : '', platform ? platform.name : '', properties_path, { 'key_value_properties': scope.properties });
                    };

                    scope.cleanLocalChanges = function () {
                        LocalChanges.clearLocalChanges({ 'application_name': scope.platform.application_name, 'platform': scope.platform.name, 'properties_path': scope.module.properties_path });
                        scope.properties = LocalChanges.tagWithLocalProperties(scope.platform.application_nam, scope.platform.name, scope.module.properties_path, { 'key_value_properties': scope.properties }).key_value_properties;
                    };

                    scope.shownOnlyRequiredProperties = function(propertyIsRequired) {
                       return scope.onlyRequiredPropertiesSwitchChanged && !propertyIsRequired;
                    };
                },
            };
        },
    ])

    .directive('adjustHeightToTextContent', [
        '$timeout', function ($timeout) {
            return {
                restrict: 'A',
                scope: {
                    property: '=',
                },
                link(scope, element) {
                    scope.$watch('property', function () {
                        var textarea = element[0];
                        // Recipe from: https://stackoverflow.com/a/995374/636849
                        textarea.style.height = '1px';
                        $timeout(() => {
                            textarea.style.height = `${ textarea.scrollHeight }px`;
                        }, 0);
                    });
                },
            };
        },
    ])

    /**
     * This directive will display the properties list with contains :
     *  1. Simple properties
     *  2. Iterable probperties
     * Added by Tidiane SIDIBE on 11/03/2016
     */
    .directive('propertiesList', [
        'LocalChanges', function (LocalChanges) {
            return {
                restrict: 'E',
                scope: {
                    properties: '=',
                    propertiesModel: '=',
                    platform: '=',
                    module: '=',
                },
                templateUrl: 'properties/properties-list.html',
                link(scope) {
                    // Simple properties filters
                    scope.propertiesKeyFilter = '';
                    scope.propertiesValueFilter = '';

                    // Iterable properties filters
                    scope.iterablePropertiesNameFilter = '';
                    scope.iterablePropertiesValueFilter = '';

                    scope.isOpen = 1;
                    /**
                     * Gets the properties values from the model name.
                     * This is for iterable properties only.
                     */
                    scope.getValues = function (name) {
                        if (!scope.properties) {
                            return null;
                        }
                        var values = _.find(scope.properties.iterable_properties, { name });
                        if (!values) {
                            values = {
                                inModel: true,
                                iterable_valorisation_items: [],
                                name,
                            };
                            scope.properties.iterable_properties.push(values);
                        }
                        return values;
                    };

                    // Manager accordion open/close
                    scope.open = function (index) {
                        scope.isOpen = (index === scope.isOpen) ? null : index;
                    };

                    scope.hasLocalChange = function () {
                        var properties_path = scope.module ? scope.module.properties_path : '';
                        var platform = scope.platform;

                        return LocalChanges.hasLocalChanges(platform ? platform.application_name : '', platform ? platform.name : '', properties_path);
                    };
                },
            };
        },
    ])

    /**
     * Display the deleted properties button.
     * This is for simple properties.
     * @see toggleDeletedIterableProperties for iterable properties
     */
    .directive('toggleDeletedProperties', function () {
        return {
            restrict: 'E',
            scope: {
                keyValueProperties: '=',
                toggle: '=',
            },
            template: '<md-switch id="toggle-deleted-properties_switch" class="md-primary md-block" ' +
            'ng-model="toggle"' +
            'ng-init="toggle=false" ' +
            'ng-disabled="(getNumberOfDeletedProperties() <= 0)" ' +
            'aria-label="{{ \'properties.deletedOnes.switch\' | translate }}">' +
            '{{ \'properties.deletedOnes.switch\' | translate }} ({{ getNumberOfDeletedProperties() }})          ' +
            '</md-switch>',
            link(scope) {
                scope.getNumberOfDeletedProperties = function () {
                    var count = 0;

                    if (scope.keyValueProperties) {
                        for (var index = 0; index < scope.keyValueProperties.length; index++) {
                            if (!scope.keyValueProperties[index].inModel) {
                                count++;
                            }
                        }
                    }
                    if (count <= 0) {
                        scope.toggle = false;
                    }
                    return count;
                };
            },
        };
    })

    /**
     * Ths directive is for saving the global properties when the 'enter' key is pressed
     * on global properties fields.
     */
    .directive('focusSaveGlobalProperties', function () {
        return function (scope, element) {
            element.bind('keydown keypress', function (event) {
                if (event.which === 13) {
                    scope.$parent.save_global_properties(scope.$parent.platform.global_properties, false);
                    event.preventDefault();
                }
            });
        };
    })

    .factory('Properties', function () {
        var Properties = function (data) {
            angular.extend(this, {
                properties_version_id: 0,
                key_value_properties: [],
                iterable_properties: [],
                versionID: -1,
            }, data);

            // Add a property that allows to filter other properties values
            _.each(this.key_value_properties, function (kvp) {
                kvp.filtrable_value = kvp.value;
            });

            this.hasKey = function (name) {
                return _.some(this.key_value_properties, function (key) {
                    return key.name === name;
                });
            };

            this.hasIterable = function (name) {
                return _.some(this.iterable_properties, function (key) {
                    return key.name === name;
                });
            };

            this.addKeyValue = function (key_value_property) {
                if (!this.hasKey(key_value_property.name)) {
                    this.key_value_properties.push(key_value_property);
                }
            };

            this.deleteKeyValue = function (key_value_property) {
                _.remove(this.key_value_properties, key_value_property);
            };

            function buildTooltip(key_value) {
                return (key_value.defaultValue ? `[default=${ key_value.defaultValue }] ` : '') +
                       (key_value.pattern ? ` [pattern=${ key_value.pattern }] ` : '') +
                       (key_value.password ? ' *password*' : '') +
                       (key_value.comment ? ` ${ key_value.comment }` : '') +
                       (key_value.valuedByAGlobal ? ` [ Valued by a global property with same name: ${ key_value.globalValue } ]` : '') +
                       (_.isEmpty(key_value.globalsUsed) ? '' : ` [globals used: ${ _.map(key_value.globalsUsed, (value, name) => `${ name }=${ value }`).join(', ') }]`);
            }

            this.mergeWithGlobalProperties = function (global_properties) {
                // Here we just want to mark the one existing identical in the global properties,
                // because they wont be editable
                // Mark also the ones just using a global in their valorisation
                _.each(this.key_value_properties, function (key_value) {
                    // First clean, in case there has been updates from the server
                    key_value.valuedByAGlobal = Boolean(_.find(global_properties.key_value_properties, { name: key_value.name }));
                    if (key_value.valuedByAGlobal) {
                        key_value.globalValue = _.find(global_properties.key_value_properties, { name: key_value.name }).value;
                    }
                    key_value.globalsUsed = {};
                    _.forEach(global_properties.key_value_properties, (kvp) => {
                        if (new RegExp(`{{ *${ kvp.name } *}}`).test(key_value.value)) {
                            key_value.globalsUsed[kvp.name] = kvp.value;
                        }
                    });
                    // We refresh the tooltip to include those info:
                    key_value.tooltip = buildTooltip(key_value);
                });

                return this;
            };

            this.mergeWithModel = function (model) {
                /* Mark key_values that are in the model */
                _.each(this.key_value_properties, function (key_value) {
                    key_value.inModel = model.hasKey(key_value.name);

                    if (key_value.inModel) {
                    // Add required/default
                        var prop = _.find(model.key_value_properties, { name: key_value.name });

                        key_value.required = (prop.required) ? prop.required : false;
                        key_value.password = (prop.password) ? prop.password : false;
                        key_value.defaultValue = (prop.defaultValue) ? prop.defaultValue : '';
                        key_value.pattern = (prop.pattern) ? prop.pattern : '';
                    } else {
                        key_value.required = false;
                        key_value.password = false;
                        key_value.defaultValue = '';
                        key_value.pattern = '';
                    }
                    key_value.tooltip = buildTooltip(key_value);
                });

                // Add key_values that are only in the model
                var me = this;
                model.key_value_properties.filter(function (model_key_value) {
                    return !me.hasKey(model_key_value.name);
                }).forEach(function (model_key_value) {
                    me.key_value_properties.push({
                        name: model_key_value.name,
                        comment: model_key_value.comment,
                        value: (model_key_value.required) ? null : '', // 'null' to make difference with void string.
                        inModel: true,
                        required: (model_key_value.required) ? model_key_value.required : false,
                        password: (model_key_value.password) ? model_key_value.password : false,
                        defaultValue: (model_key_value.defaultValue) ? model_key_value.defaultValue : '',
                        pattern: (model_key_value.pattern) ? model_key_value.pattern : '',
                        tooltip: buildTooltip(model_key_value),
                    });
                });

                // Add iterable property that are only in the model
                _.each(this.iterable_properties, function (iterable) {
                    iterable.inModel = !_.isUndefined(_.find(model.iterable_properties, { name: iterable.name }));
                });

                /**
                 * Merge model and value for iterable value.
                 *
                 * @param iterable_properties -> array with properties
                 *                              {
                 *                                  comment: "",
                 *                                  defaultValue: "",
                 *                                  fields: Array[2],
                 *                                  name: "iterable",
                 *                                  password: false,
                 *                                  pattern: "",
                 *                                  required: false
                 *                              }
                 * @param current_item_value -> array with value of properties
                 *                              {
                 *                                  inModel: true,
                 *                                  iterable_valorisation_items: [
                 *                                      {
                 *                                          title: "blockOfProperties",
                 *                                          values: [
                 *                                              {
                 *                                                  iterable_valorisation_items: Array[1],
                 *                                                  name: "iterable2"
                 *                                              },
                 *                                              {
                 *                                                  name: "name2",
                 *                                                  value: "value2"
                 *                                              }
                 *                                          ]
                 *                                      }
                 *                                  ]
                 *                                  name: "iterable"
                 *                              }
                 */
                var scanIterableItems = function (iterable_model, iterable_properties) {
                    _.each(iterable_model, function (modelIterable) {
                    // Found iterable properties for iterable_model
                        var itProps = _.filter(iterable_properties, { name: modelIterable.name });

                        // For each item in iterable found
                        _.each(itProps, function (itProp) {
                        // For each valorisation of iterable
                            _.each(itProp.iterable_valorisation_items, function (val) {
                            // For each values in iterable
                                _.each(val.values, function (item) {
                                // give it an identifier
                                    val.id = getIdentifier();

                                    // clean the title if necessary
                                    if (_.isEqual(val.title, 'not used')) {
                                        val.title = '';
                                    }

                                    if (item.iterable_valorisation_items) {
                                    // New iterable
                                        _.each(_.filter(modelIterable.fields, { name: item.name }), (prop) => {
                                            item.inModel = true;
                                            scanIterableItems([ prop ], [ item ]);
                                        });
                                    } else {
                                    // Search model
                                        _.each(_.filter(modelIterable.fields, { name: item.name }), function (prop) {
                                            item.comment = prop.comment;
                                            item.inModel = true;
                                            item.required = (prop.required) ? prop.required : false;
                                            item.password = (prop.password) ? prop.password : false;
                                            item.defaultValue = (prop.defaultValue) ? prop.defaultValue : '';
                                            item.pattern = (prop.pattern) ? prop.pattern : '';
                                            item.tooltip = buildTooltip(item);
                                        });
                                    }
                                });

                                _.each(modelIterable.fields, function (prop) {
                                    if (!_.find(val.values, { name: prop.name })) {
                                    // is it an iterable ?
                                        if (prop.fields) {
                                            val.values.push({
                                                name: prop.name,
                                                iterable_valorisation_items: [],
                                                inModel: true,
                                            });
                                            // add iterable values based on the model
                                            addFromModel(_.last(val.values), prop);
                                        } else {
                                            val.values.push({
                                                name: prop.name,
                                                value: (prop.required) ? null : '',
                                                comment: prop.comment,
                                                inModel: true,
                                                required: (prop.required) ? prop.required : false,
                                                password: (prop.password) ? prop.password : false,
                                                defaultValue: (prop.defaultValue) ? prop.defaultValue : '',
                                                pattern: (prop.pattern) ? prop.pattern : '',
                                                tooltip: buildTooltip(prop),
                                            });
                                        }
                                    }
                                });
                            });
                        });
                    });
                };

                scanIterableItems(model.iterable_properties, this.iterable_properties);

                // Taking care of missing values
                // for each model in iterable
                _.each(model.iterable_properties, function (_model) {
                // find the values
                    var values = _.find(me.iterable_properties, { name: _model.name });

                    if (_.isUndefined(values)) {
                        values = {
                            inModel: true,
                            iterable_valorisation_items: [],
                            name: _model.name,
                        };

                        // add it
                        me.iterable_properties.push(values);
                    }
                });

                return this;
            };

            this.filter_according_to_model = function () {
                this.key_value_properties = _.filter(this.key_value_properties, function (property) {
                    return property.inModel;
                });

                // for iterable properties
                this.iterable_properties = _.filter(this.iterable_properties, function (property) {
                    if (!property.inModel) {
                        return false;
                    }
                    _.each(property.iterable_valorisation_items, function (valorisation) {
                        var inModelVals = null;
                        inModelVals = _.filter(valorisation.values, (val) => val.inModel);
                        // set by the filtered
                        valorisation.values = inModelVals;
                    });
                    return true;
                });
            };

            this.to_rest_entity = function () {
                return {
                    versionID: this.versionID,
                    properties_version_id: this.properties_version_id,
                    key_value_properties: _.map(this.key_value_properties, (kvp) => ({
                        name: kvp.name,
                        comment: kvp.comment,
                        value: kvp.value || '',
                    })),
                    iterable_properties: _.map(this.iterable_properties, (iterable) => ({
                        name: iterable.name,
                        iterable_valorisation_items: _.cloneDeep(iterable.iterable_valorisation_items),
                    })),
                };
            };
        };

        return Properties;
    })

/**
 * This is for filtering the deleted properties.
 * Used only for simple properties.
 */
    .filter('displayProperties', function () {
        return function (items, display) {
            return _.filter(items, function (item) {
                return (display ? !item.inModel : _.isUndefined(display) || display || item.inModel);
            });
        };
    })

    .filter('filterBox', function () {
        return function (boxes, searchString) {
            searchString = (searchString || '').toUpperCase();

            // A box is filtered by its name or its modules names or its children boxes
            var filterSingleBox = function (box) {
                box.openBySearchFilter = !searchString || _.includes(box.name.toUpperCase(), searchString);
                _.each(box.modules, (module) => {
                    if (searchString) {
                        module.openBySearchFilter = _.includes(module.name.toUpperCase(), searchString) ||
                                                    _.some(module.instances, (instance) => _.includes(instance.name.toUpperCase(), searchString));
                    } else {
                        module.openBySearchFilter = store.get('unfoldInstancesByDefault');
                    }
                    box.openBySearchFilter = box.openBySearchFilter || module.openBySearchFilter;
                });
                _.each(box.children, (boxChild) => {
                    box.openBySearchFilter = box.openBySearchFilter || filterSingleBox(boxChild);
                });
                return box.openBySearchFilter;
            };

            boxes.forEach(filterSingleBox);
            return boxes;
        };
    })

    .controller('LogicalGroupInTreeController', function ($scope) {
        $scope.$on('resetOpenByClick', function () {
            $scope.openByClick = null;
        });

        $scope.$on('quickDisplayInstanceDetails', function () {
            $scope.openByClick = true;
        });

        $scope.$on('quickHideInstanceDetails', function () {
            $scope.openByClick = false;
        });

        $scope.toggleLogicalGroupExpanded = function () {
            if ($scope.openByClick === null) {
                $scope.openByClick = !$scope.box.openBySearchFilter;
            } else {
                $scope.openByClick = !$scope.openByClick;
            }
        };

        $scope.openByClick = null; /* null => user never clicked / true => user clicked to open it / false => user clicked to close it */
    })

    .controller('ModulesInTreeController', function ($scope) {
        $scope.toggleModuleExpanded = function () {
            if ($scope.openByClick === null) {
                $scope.openByClick = !$scope.module.openBySearchFilter;
            } else {
                $scope.openByClick = !$scope.openByClick;
            }
        };

        /* null => user never clicked / true => user clicked to open it / false => user clicked to close it */
        $scope.openByClick = null;
    })


    .filter('orderObjectBy', function () {
        return function (items, field) {
            var filtered = [];
            angular.forEach(items, function (item) {
                filtered.push(item);
            });
            filtered.sort(function (item1, item2) {
                return item1[field].localeCompare(item2[field]);
            });
            return filtered;
        };
    })


    /**
     * This function will filter the iterable properties by values.
     * The filter text and by the simple text or a regex.
     * @see filterIterablePropertiesValues for value filtering
     */
    .filter('filterIterablePropertiesNames', function () {
        return function (items, filter) {
            if (!filter) {
                return items;
            }
            try {
                var regex_name = new RegExp(`.*${ filter.toLowerCase().split(' ').join('.*') }`, 'i');
                return _.filter(items, (item) => regex_name.test(item.name));
            } catch (error) {
                return items;
            }
        };
    })

    /**
     * Function wich filter the properties' display with string or regex.
     * Modified by Sahar CHAILLOU on 12/01/2016
     */
    .filter('filterProperties', function () {
        return function (input, filter) {
            if (!filter) {
                return input;
            }

            // Format the filters to construct the regex
            var regex_name = null;
            var regex_value = null;

            // Create the regex
            try {
                regex_name = new RegExp(`.*${ filter.name.toLowerCase().split(' ').join('.*') }`, 'i');
                regex_value = new RegExp(`.*${ filter.filtrable_value.toLowerCase().split(' ').join('.*') }`, 'i');
            } catch (error) {
                return input;
            }

            var applyNameFilter = function (inputList) {
                return _.filter(inputList, (item) => !filter.name || regex_name.test(item.name));
            };

            var applyValueFilter = function (inputList) {
                return _.filter(inputList, (item) => !filter.filtrable_value || regex_value.test(item.filtrable_value));
            };

            // make the filter
            return applyValueFilter(applyNameFilter(input));
        };
    })

    /**
     * This directive is for filtering only the unspecified properties.
     * This takes care of the hesperides predefined properties which will not be displayed
     * and then not counted even if they have not values.
     */
    .directive('toggleUnspecifiedProperties', function () {
        return {
            restrict: 'E',
            scope: {
                keyValueProperties: '=',
                toggle: '=',
            },
            template: '<md-switch id="toggle-unspecified-properties_switch" class="md-primary md-block" ' +
                  'ng-model="toggle"' +
                  'ng-init="toggle=false" ' +
                  'ng-disabled="(getNumberOfUnspecifiedProperties(keyValueProperties) <= 0)" ' +
                  'aria-label="{{ \'properties.unspecifiedValues.switch\' | translate }}">' +
                  '{{ \'properties.unspecifiedValues.switch\' | translate }} ({{ getNumberOfUnspecifiedProperties(keyValueProperties) }})' +
                  '</md-switch>',
            controller: [
                '$scope', '$filter', function ($scope, $filter) {
                    /**
             * This calculate the number of unspecified properties.
             */
                    $scope.getNumberOfUnspecifiedProperties = function (tab) {
                        var count = 0;

                        tab = $filter('hideHesperidesPredefinedProperties')(tab, true);

                        if (tab) {
                            for (var index = 0; index < tab.length; index++) {
                                // if default value is present, so the prop is not counted as unspecified
                                if ((!tab[index].filtrable_value && _.isEmpty(tab[index].defaultValue)) || (_.isEmpty(tab[index].value) && _.isEmpty(tab[index].defaultValue))) {
                                    count++;
                                }
                            }
                        }

                        if (count === 0) {
                            $scope.toggle = false;
                        }
                        return count;
                    };
                },
            ],
        };
    })

    /**
     * This directive is for sorting the properties list in asc and desc order of properties name
     * This is shared between all properties display :
            Global Properties, Simple Properties, Iterable Properties and Instance Properties.
     */
    .directive('toggleSortProperties', function () {
        return {
            restrict: 'E',
            scope: {
                sortOrder: '=',
            },
            templateUrl: '/shared/toggle-sort-properties.html',
            controller: [
                '$scope', function ($scope) {
                    /**
             * Inverse the sort order
             */
                    $scope.switchOrder = function () {
                        $scope.sortOrder = !$scope.sortOrder;
                    };
                },
            ],
        };
    })


    /**
     * This directive is for filtering only the no global properties.
     */
    .directive('toggleGlobalProperties', function () {
        return {
            restrict: 'E',
            scope: {
                keyValueProperties: '=',
                toggle: '=',
            },
            template: '<md-switch id="toggle-global-properties_switch" class="md-primary md-block" ' +
        'ng-model="toggle"' +
        'ng-disabled="(getNumberOfGlobalProperties(keyValueProperties) <= 0)" ' +
        'aria-label="{{ \'properties.globalPropertiesValues.switch\' | translate }}">' +
        '{{ \'properties.globalPropertiesValues.switch\' | translate }} ({{ getNumberOfGlobalProperties(keyValueProperties) }})' +
        '</md-switch>',
            controller: [
                '$scope', '$filter', function ($scope, $filter) {
                    /**
             * This calculate the number of global properties.
             */
                    $scope.getNumberOfGlobalProperties = function (tab) {
                        var count = 0;
                        tab = $filter('displayGlobalProperties')(tab, true);
                        if (tab) {
                            _.each(tab, function (item) {
                                if (item.valuedByAGlobal) {
                                    count++;
                                }
                            });
                        }
                        return count;
                    };
                },
            ],
        };
    })


    /**
     * Display only the 'empty' properties
     */
    .filter('displayUnspecifiedProperties', function () {
        return function (items, display) {
            return _.filter(items, function (item) {
                return _.isUndefined(display) ||
                !display ||
                (!item.filtrable_value && _.isEmpty(item.defaultValue)) ||
                (_.isEmpty(item.defaultValue) && _.isEmpty(item.value));
            });
        };
    })

    /**
     * Display only the not globals properties
     */
    .filter('displayGlobalProperties', function () {
        return function (items, display) {
            return _.filter(items, function (item) {
                return display || (!display && !item.valuedByAGlobal);
            });
        };
    })

    /**
     * This is used to filter the 'hesperides predefined properties'.
     * Definition of terms:
     *  'Hesperides predefined properties' are the properties whith are provided by the hesperides system.
     *  They always start by "hesperides.".
     *  Example :
     *      - hesperides.application.name : is the name of the current application.
     *      - hesperides.instance.name : is the name of the current instance
     */
    .filter('hideHesperidesPredefinedProperties', function () {
        return function (items) {
            return _.filter(items, function (item) {
                return !_.eq(item.name, 'hesperides.application.name') &&
                    !_.eq(item.name, 'hesperides.application.version') &&
                    !_.eq(item.name, 'hesperides.platform.name') &&
                    !_.eq(item.name, 'hesperides.module.name') &&
                    !_.eq(item.name, 'hesperides.module.version') &&
                    !_.startsWith(item.name, 'hesperides.module.path.') &&
                    !_.eq(item.name, 'hesperides.instance.name');
            });
        };
    })

    .directive('deployedModuleControls', function () {
        return {
            restrict: 'E',
            scope: true,
            templateUrl: 'properties/deployed-module-controls.html',
        };
    })

    .directive('deployedModuleControlsPopover', function ($mdUtil, $timeout, $rootElement) {
        return {
            restrict: 'E',
            scope: true,
            template: '<div class="popover"><deployed-module-controls></deployed-module-controls></div>',
            link(scope, element) {
                var parent = element.parent();
                var popover = element.children();

                // gestion d'un timer pour afficher la popup après 1 secondes (pour faciliter navigation mode arbre)
                var timer = null;

                // Display popup
                parent.on('mouseenter', function () {
                    timer = $timeout(
                        function () {
                            var tipRect = $mdUtil.offsetRect(popover, $rootElement);
                            var parentRect = $mdUtil.offsetRect(parent, $rootElement);

                            var newPosition = {
                                left: parentRect.left + (parentRect.width / 2) - (tipRect.width / 2),
                                top: parentRect.top - tipRect.height,
                            };

                            popover.css({
                                left: `${ newPosition.left }px`,
                                top: `${ newPosition.top }px`,
                            });

                            if (scope.currentPopup) {
                                scope.currentPopup.removeClass('popover-hover');
                            }

                            element.children().addClass('popover-hover');
                            scope.currentPopup = element.children();
                        },
                        1000
                    );
                });

                // Hide popup
                parent.on('mouseleave', function () {
                    $timeout.cancel(timer);
                    element.children().removeClass('popover-hover');
                    scope.currentPopup = null;
                });
            },
        };
    });
