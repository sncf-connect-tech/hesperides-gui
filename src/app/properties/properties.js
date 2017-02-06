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
 
var propertiesModule = angular.module('hesperides.properties', ['hesperides.nexus', 'hesperides.modals', 'hesperides.localChanges']);

propertiesModule.controller('PlatformVersionModule', ['$scope', '$mdDialog', 'NexusService', 'ApplicationService', 'TechnoService', '$translate',
    function ($scope, $mdDialog, NexusService, ApplicationService, TechnoService, $translate) {
    $scope.$change = function (modal_data) {
        if (modal_data.use_ndl === true && hesperidesConfiguration.nexusMode === true) {
            // on met à jour les modules de l'application à partir des infos de la ndl
            NexusService.getNdl($scope.platform.application_name, modal_data.new_version)
                .then(function (ndl) {
                    return ApplicationService.updatePlatformConfig($scope.platform, modal_data.new_version, ndl.NDL_pour_rundeck.packages);
                })
                .then(function (updatedModules) {
                    // sauvegarde de la plateforme
                    $scope.save_platform_from_box($scope.mainBox, modal_data.copy_properties)
                        .then(function () {
                            $scope.properties = undefined;
                            $scope.instance = undefined;

                            // notification des modules mis à jour
                            _.each(updatedModules, function (updatedModule) {
                                $translate('module.event.updated.details', {name:updatedModule.name}).then(function(label) {
                                    $.notify(label, "success");
                                });                                
                            })
                        });
                });

        } else {
            // sinon, on ne met à jour que la version de l'application
            $scope.platform.application_version = modal_data.new_version;

            // sauvegarde de la plateforme
            $scope.save_platform_from_box($scope.mainBox)
                .then(function () {
                    $scope.properties = undefined;
                    $scope.instance = undefined;
                });
        }

        $mdDialog.cancel();
    };

    $scope.setItem = function(name, value) {
        $scope[name] = value;
    }
}]);


propertiesModule.controller('PropertiesCtrl', ['$scope', '$routeParams', '$mdDialog', '$location', '$route', '$anchorScroll', '$timeout', 'ApplicationService', 'FileService', 'EventService', 'ModuleService', 'ApplicationModule', 'Page', 'PlatformColorService', 'NexusService', '$translate', '$window', '$http', 'Properties', 'HesperidesModalFactory', 'LocalChanges',
    function ($scope, $routeParams, $mdDialog, $location, $route, $anchorScroll, $timeout, ApplicationService, FileService, EventService, ModuleService, Module, Page, PlatformColorService, NexusService, $translate, $window, $http, Properties, HesperidesModalFactory, LocalChanges) {
    Page.setTitle("Properties");

    $scope.platform = $routeParams.platform;
    $scope.platforms = [];

    $scope.fileEntries = [];

    $scope.isPlatformOpen = 1;

    $scope.isInstanceOpen = 0;

    $scope.$closeDialog = function() {
        $mdDialog.cancel();
    };

    var Box = function (data) {
        return angular.extend(this, {
            parent_box: null,
            name: "",
            children: {},
            modules: [],
            opened: false,
            isEmpty: function () {
                return _.keys(this.children).length === 0 && this.modules.length === 0;
            },
            get_path: function () {
                return (this.parent_box == null ? "" : (this.parent_box.get_path() + "#")) + this.name;
            },
            to_modules: function () {
                var me = this;
                _.forEach(this.modules, function (module) {
                    module.path = me.get_path();
                });
                return this.modules.concat(
                    _.flatten(_.map(this.children, function (box) {
                        return box.to_modules();
                    }))
                );
            }
        }, data);
    };

    $scope.contain_empty_module_status = {};

    $scope.cached_empty_module = [];

    $scope.test_obj = {"name": "demoKatana-war", "version": "1.1.2", "working_copy": false, "status": "toDO"};

    function check_modules_models(modules) {
        _.forEach(modules, function (module) {
            var ref = {"name": module.name, "version": module.version, "working_copy": module.working_copy};

            if (!_.some($scope.cached_empty_module, ref)) {
                $scope.cached_empty_module.push(ref);
                var elem = _.find($scope.cached_empty_module, ref);

                ModuleService.search(module.name + " " + module.version + " " + module.working_copy).then(function (response) {
                    if (elem && response)
                        elem.has_model = true;
                    else if (elem)
                        elem.has_model = false;
                });
            }
        })
    }

    $scope.is_module_has_model = function (module) {
        return _.some($scope.cached_empty_module, {"name": module.name, "version": module.version, "working_copy": module.working_copy, "has_model": true});
    }

    $scope.empty_module_status = function () {
        var return_value = false;

        Object.keys($scope.contain_empty_module_status).forEach(function (key) {
            if ($scope.contain_empty_module_status[key]) {
                return_value = true;
            }
        });
        return return_value;
    }

    $scope.contain_empty_module = function (box) {

        var return_value = "";

        if (box) {

            check_modules_models(box.modules);

            _.forEach(box.children, function (child) {
                check_modules_models(child.modules)
            });

            _.forEach(box.modules, function (module) {
                if (_.some($scope.cached_empty_module, {"name": module.name, "version": module.version, "working_copy": module.working_copy, "has_model": false}))
                    return_value =  "contain_empty_module";
            });

            _.forEach(box.children, function (child) {
                _.forEach(child.modules, function (module) {
                    if (_.some($scope.cached_empty_module, {"name": module.name, "version": module.version, "working_copy": module.working_copy, "has_model": false}))
                        return_value =  "contain_empty_module";
                });
            });

        }

        $scope.contain_empty_module_status[box ? box.name : "empty_key"] = return_value.length ? true : false;

        return return_value;

    }

    $scope.update_main_box = function (platform) {

        //Try to build the view depending on the different paths of the modules
        var mainBox = new Box({parent_box: null});

        var oldMainBox = $scope.mainBox;

        var search_old_box = function(oldBoxes, box) {
            var currentBox = box;

            if (oldBoxes) {
                var path = [];

                // Recreate path
                while (currentBox.parent_box) {
                    path.push(currentBox.name);
                    currentBox = currentBox.parent_box;
                }

                // Search box in path
                var currentName;
                currentBox = oldBoxes;

                while (path.length && currentBox) {
                    currentName = path.pop();
                    currentBox = currentBox["children"][currentName];
                }
            }
            return currentBox;
        };

        var update_modules = function(module, oldModules) {
            var currentModule;

            currentModule = _.filter(oldModules, { name: module.name });

            if (currentModule.length > 0) {
                module.opened = currentModule[0].opened;
            }
        }

        var add_to_box = function (box, folders, level, module) {
            if (level > folders.length) {
                throw "Should have nether been here, wrong use of add_to_box recursive function";
            }

            var oldBox;

            if (level === folders.length) {
                //Found terminal level
                box.modules.push(module);

                oldBox = search_old_box(oldMainBox, box);

                if (oldBox && oldBox.modules && oldBox.modules.length > 0) {
                    update_modules(module, oldBox.modules);
                }
            } else {
                var name = folders[level];

                if (_.isUndefined(box["children"][name])) {
                    var newBox = new Box({parent_box: box, name: name});
                    box["children"][name] = newBox;

                    oldBox = search_old_box(oldMainBox, newBox);

                    if (oldBox) {
                        newBox.opened = oldBox.opened;
                    }
                }

                return add_to_box(box["children"][name], folders, level + 1, module);
            }
        };

        _.each(platform.modules, function (module) {
            var path = module.path;
            if (path.charAt(0) === '#') { //Remove possible preceding #
                path = path.substring(1, path.length);
            }
            var folders = path.split('#');
            add_to_box(mainBox, folders, 0, module);
        });
       $scope.mainBox = mainBox;
    };

    $scope.add_box = function (name, box) {
        box["children"][name] = new Box({parent_box: box, name: name});
        return box["children"][name];
    };

    $scope.remove_box = function (name, box) {
        delete box.parent_box["children"][name];
    };

    $scope.update_box_name = function (box, old_name, new_name) {
        if (!(old_name === new_name)) {
            box.name = new_name;
            box.parent_box["children"][new_name] = box.parent_box["children"][old_name];
            delete box.parent_box["children"][old_name];
            $scope.save_platform_from_box($scope.mainBox, true);
        }
    };

    $scope.open_add_box_dialog = function (box) {
        var modalScope = $scope.$new();

        modalScope.$add = function(name) {
            $scope.add_box(name, box);
            $mdDialog.cancel();
        };

        $mdDialog.show({
            templateUrl: 'application/add_box.html',
            clickOutsideToClose:true,
            scope: modalScope
        });
    };

    /**
     * This function will determine if the authenticated user
     * is a production user or not.
     * See hesperides.js for more details about : hesperidesUser
     */
     $scope.isProductionUser = function (){
        return !_.isUndefined(hesperidesUser) ? hesperidesUser.isProdUser : false;
     };

    $scope.open_add_instance_dialog = function (module) {
        var modalScope = $scope.$new();

        modalScope.$add = function(name) {
            $scope.add_instance(name, module);
            $mdDialog.cancel();
        };

        $mdDialog.show({
            templateUrl: 'application/add_instance.html',
            clickOutsideToClose:true,
            scope: modalScope
        });
    };

    /**
     * Met à jour la version de la plateforme.
     *
     * @param platform plateforme courante
     */
    $scope.change_platform_version = function (platform) {
        var dialogNdl = function (ndlVersions) {
            var modalScope = $scope.$new();
            modalScope.platform = platform;
            modalScope.sourceFromNdl = _.isArray(ndlVersions) && ndlVersions.length != 0;

            modalScope.ndlVersions = modalScope.sourceFromNdl ? ndlVersions : [];
            modalScope.onLoading = true;

            modalScope.isValid = function (){
                return !_.isUndefined(modalScope.newVersion) && !_.isEmpty(modalScope.newVersion);
            }

            $mdDialog.show({
                templateUrl: 'application/change_platform_version.html',
                controller: 'PlatformVersionModule',
                clickOutsideToClose:true,
                scope:modalScope,
                onComplete: function() {
                    // Use to prevent display list of version at wrong position
                    modalScope.onLoading = false;
                }
            });
        };

        if (hesperidesConfiguration.nexusMode) {
            // récupération des versions des ndl de l'application
            NexusService.getNdlVersions(platform.application_name)
                .then(dialogNdl, dialogNdl);
        } else {
            dialogNdl();
        }

    };

    $scope.search_module = function (box) {
        var modalScope = $scope.$new();

        modalScope.$add = function(module) {
            $scope.add_module(module.name, module.version, module.is_working_copy, box);
            $mdDialog.cancel();
        };

        $mdDialog.show({
            templateUrl: 'application/search_module.html',
            clickOutsideToClose:true,
            scope: modalScope
        });
    };

    $scope.change_module = function (module) {

        var modalScope = $scope.$new();
        modalScope.module = module;
        modalScope.copyProperties = store.get('copy_properties');
        modalScope.searchText = module.name + ' ';

        modalScope.$update = function (modal_data) {
            var new_module = modal_data.new_module;
            module.name = new_module.name;
            module.version = new_module.version;
            module.is_working_copy = new_module.is_working_copy;
            $scope.save_platform_from_box($scope.mainBox, modal_data.copy_properties).then(function () {
                $scope.properties = undefined;
                $scope.instance = undefined;
                $mdDialog.cancel();
            });
        };

        $mdDialog.show({
            templateUrl: 'application/change_module_version.html',
            clickOutsideToClose:true,
            scope: modalScope
        });

    };

    $scope.diff_properties = function (compare_module) {
        // Need to be in global scope !
        $scope.compare_module = compare_module;

        var modalScope = $scope.$new();

        // From platform info
        modalScope.from = {
           application: $scope.platform.application_name,
           platform: $scope.platform.name,
           date: undefined,
           lookPast: false
        }

        // Get the list of platforms for an app
        modalScope.get_target_platforms = function (application_name){
           if ( !_.isUndefined(application_name)){
               ApplicationService.get(application_name, true).then(function (application){
                   modalScope.target_platforms = application.platforms;
               }, function (error){
                   modalScope.target_platforms = [];
               });
           }else {
               modalScope.target_platforms = [];
           }
        }

       modalScope.target_platforms = modalScope.get_target_platforms(modalScope.from.application);

        modalScope.$diff = function() {
            $mdDialog.hide();
        }

        modalScope.updatePlatformField = function(itemName) {
             modalScope.from.platform = itemName;
        };

        modalScope.backgroundColor = function(item) {
            //if(!$scope.$$phase) {
                return PlatformColorService.calculateColor(item.name);
            //}
        };

        modalScope.from.lookPast = false;
        modalScope.switched = function (){
            if ( !modalScope.from.lookPast){
                $timeout(function (){
                    var el = angular.element(document.querySelector("#look-past-date-time"));
                    el.focus();
                }, 200)
            }
        };

        modalScope.pltfm_not_in_list = function () {
            return !_.some(modalScope.target_platforms, { 'name': modalScope.from.platform });;
        }

        var t = $mdDialog.show({
            templateUrl: 'application/properties_diff_wizard.html',
            clickOutsideToClose:true,
            scope: modalScope
        });

        t.then(function() {
            $scope.open_diff_page();
        }, function() {
            // Cancel
        });
    };

    $scope.open_diff_page = function () {
        //Everything is set in the scope by the modal when calling this
        //Not very safe but easier to manage with all scopes generated
        var urlParams = {
            application: $scope.platform.application_name,
            platform: $scope.platform.name,
            properties_path: $scope.compare_module.properties_path,
            compare_application: $scope.compare_platform.application_name,
            compare_platform: $scope.compare_platform.name,
            compare_path: $scope.compare_platform.chosen_module.properties_path
        };
        if (!_.isUndefined($scope.compare_platform.timestamp)) {
            urlParams.timestamp = $scope.compare_platform.timestamp;
        }

        $window.open('/#/diff?' + $.param(urlParams), '_blank');
    };

    $scope.diff_global_properties = function () {

        var modalScope = $scope.$new();

        // From platform info
        modalScope.from = {
            application: $scope.platform.application_name,
            platform: $scope.platform.name,
            date: undefined,
            lookPast: false
        }

        // Get the list of platforms for an app
        modalScope.get_target_platforms = function (application_name){
            if ( !_.isUndefined(application_name)){
                ApplicationService.get(application_name).then(function (application){
                    modalScope.target_platforms = application.platforms;
                }, function (error){
                    modalScope.target_platforms = [];
                });
            }else {
                modalScope.target_platforms = [];
            }
        }

        modalScope.target_platforms = modalScope.get_target_platforms(modalScope.from.application);

        modalScope.updatePlatformField = function(itemName) {
             modalScope.from.platform = itemName;
        };

        modalScope.backgroundColor = function(item) {
            return PlatformColorService.calculateColor(item.name);
        };

        modalScope.$diff = function(from) {
            $mdDialog.cancel();
            $scope.open_global_diff_page(from);
        };

        modalScope.from.lookPast = false;
        modalScope.switched = function (){
            if ( !modalScope.from.lookPast){
                $timeout(function (){
                    var el = angular.element(document.querySelector("#look-past-date-time"));
                    el.focus();
                }, 200)
            }
        };

        modalScope.pltfm_not_in_list = function () {
            return !_.some(modalScope.target_platforms, { 'name': modalScope.from.platform });;
        }

        $mdDialog.show({
            templateUrl: 'application/global_properties_diff_wizard.html',
            clickOutsideToClose:true,
            scope: modalScope
        });
    };

    $scope.open_global_diff_page = function (from) {
        //Everything is set in the scope by the modal when calling this
        //Not very safe but easier to manage with all scopes generated
        var urlParams = {
            application: $scope.platform.application_name,
            platform: $scope.platform.name,
            properties_path: '#',
            compare_application: from.application,
            compare_platform: from.platform,
            compare_path: '#'
        };

        if (!_.isUndefined(from.date)) {
            urlParams.timestamp = +moment(from.date, "YYYY-MM-DD HH:mm:ss Z");
        }

        $window.open('/#/diff?' + $.param(urlParams), '_blank');
    };

    $scope.quickOpen = false;
    $scope.quickDisplayInstance = function () {
        $scope.$broadcast((!$scope.quickOpen ? 'quickDisplayInstanceDetails' : 'quickHideInstanceDetails'), {})
        $scope.quickOpen = !$scope.quickOpen;
    };

    $scope.find_modules_by_name = function (name) {
        return ModuleService.with_name_like(name);
    };

    $scope.add_module = function (name, version, is_working_copy, box) {
        if (!_.some(box.modules, {'name': name, 'version': version, 'is_working_copy': is_working_copy})) {
            box.modules.push(new Module(
                {
                    name: name,
                    version: version,
                    is_working_copy: is_working_copy,
                    deployment_group: "",
                    path: box.get_path()
                }
            ));

            $scope.save_platform_from_box($scope.mainBox).then(function (response) {
                $scope.properties = undefined;
                $scope.instance = undefined;
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
    $scope.preview_instance = function (box, application, platform, instance, module) {
        $scope.preview_instance(box, application, platform, instance, module, false);
    }

    $scope.preview_instance = function (box, application, platform, instance, module, simulate) {
        var modalScope = $scope.$new();

        modalScope.codeMirrorOptions = {
            'readOnly' : true,
            'autoRefresh' : true
        };

        instance = instance == undefined ? {"name": "default"} : instance;
        modalScope.instance = instance;
        modalScope.isOpen = undefined;

        FileService.get_files_entries(application.name, platform.name, box.get_path(), module.name, module.version, instance.name, module.is_working_copy, simulate).then(function (entries){
            modalScope.fileEntries = entries;

            var modal = $mdDialog.show({
                templateUrl: 'file/file-modal.html',
                clickOutsideToClose:true,
                scope: modalScope
            });
        });

        // Download all the files
        modalScope.download_all_instance_files = function (){
            FileService.download_files (modalScope.fileEntries, modalScope.instance.name);
        };

        // Manager accordion open/close
        modalScope.open = function (index){
            if ( index === modalScope.isOpen){
                modalScope.isOpen = undefined;
            }else{
                modalScope.isOpen = index;
            }
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
        var stream = undefined;
        if ( action === 'platform'){
            stream = action + '-' + param1.name + '-' + param2.name;
            modalScope.title = param1.name + '-' + param2.name;
        }else {
            stream = action + '-' + param2.name + '-' + param2.version + '-';
            if (param2.is_working_copy){
                stream = stream + 'wc';
            }else{
                stream = stream + 'release';
            }

            modalScope.title =  param2.name + '-' + param2.version;
        }

        /**
         * Private function to preload next events
         */
        var preloadNextEvents = function (){
            _events = [];
            EventService.get(stream, page).then(function (nextEntries){
                events = nextEntries;
                page ++;
            });
        };

        /**
         * Private function for index calculation
         */
        var _setIds = function(lengthOfAll, entries){
            for (var i = 0; i < entries.length; i ++){
                entries[i].id = lengthOfAll + i;
            }

            return entries;
        }

        // Get evevents
        EventService.get(stream, page).then (function (entries){

            modalScope.eventEntries = _setIds(0, entries);
            page ++;

            /**
             * Private function used to check if the events are selectabled or not
              */
            modalScope.checkSelectStatus = function (){

                // get the target items
                var isGlobal = undefined;
                if ( modalScope.selectedEvents.length == 1){
                    isGlobal = modalScope.selectedEvents[0].isGlobal;
                }

                _(modalScope.eventEntries).each (function (e){
                    if ( modalScope.selectedEvents.length == 2 ){
                        if ( _.isUndefined(_.find(modalScope.selectedEvents, {id: e.id})) ){
                            e.isSelectable = false;
                        }
                    }else{
                        if ( !_.isUndefined(isGlobal) && e.isGlobal != isGlobal ){
                            e.isSelectable = false;
                        }else{
                            e.isSelectable = true;
                        }
                    }
                });
            };

            //
            // Show the modal
            //
            var modal = $mdDialog.show({
                templateUrl: 'event/event-modal.html',
                clickOutsideToClose:true,
                scope: modalScope
            });

            // Preload the next page
            preloadNextEvents();

            //
            // Close the events modal
            //
            modalScope.$closeDialog = function() {
                $mdDialog.cancel();
            };

            /**
             * Show more events
             */
            modalScope.noMoreEvents = false;
            modalScope.msgMoreEvents = "Plus encore ...";

            modalScope.showMoreEvents = function (){
                if (events.length > 0) {

                    // adding IDs to events
                    events = _setIds(modalScope.eventEntries.length, events);

                    // merging the events with the others
                    modalScope.eventEntries = _.union(modalScope.eventEntries, events);

                    // check status
                    modalScope.checkSelectStatus();

                    // disable filters
                    modalScope.filtering = {};

                    preloadNextEvents();
                }else {
                    // no more events to load
                    modalScope.noMoreEvents = true;
                }
            };

            /**
             * This function show the diff page between the
             * selected events.
             * This show the diff page of both simple and global properties
             */
            modalScope.showDiff = function (){

                var from = modalScope.selectedEvents[0];
                var to = modalScope.selectedEvents[1];

                var urlParams = {
                    application: from.data.applicationName,
                    platform: from.data.platformName,
                    properties_path: from.data.path,
                    compare_application: to.data.applicationName,
                    compare_platform: to.data.platformName,
                    compare_path: to.data.path
                };

                urlParams.origin_timestamp = from.timestamp;
                if (!_.isUndefined(to.timestamp)) {
                    urlParams.timestamp = to.timestamp;
                }
                $window.open('/#/diff?' + $.param(urlParams), '_blank');

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

    $scope.new_instance_name = undefined;

    /**
     * That function saves the instance properties
     */
    $scope.save_platform_from_box = function (box, copyPropertiesOfUpdatedModules) {
        $scope.platform.modules = box.to_modules();
        return ApplicationService.save_platform($scope.platform, copyPropertiesOfUpdatedModules).then(function (platform) {
            $scope.platform = platform;
            //Replace platforms in the list by the new one
            var existing_index = 0;
            _.find($scope.platforms, function (existing_platform, index) {
                existing_index = index;
                return existing_platform.name === platform.name;
            });
            $scope.platforms[existing_index] = platform;

            // Updating reference of instance to keep it synchronized and thus to prevent loss of information in the next save
            if ($scope.instance != undefined) {

                module = _.filter(platform.modules, module => module.properties_path == $scope.instance.properties_path)[0];

                tmp_instance = _.filter(module.instances, instance => instance.name == ($scope.new_instance_name != undefined ? $scope.new_instance_name : $scope.instance.name))[0];
                tmp_instance.properties_path = $scope.instance.properties_path;

                ApplicationService.get_instance_model($routeParams.application, $scope.platform, $scope.instance.properties_path).then(function (model) {
                    $scope.instance = tmp_instance.mergeWithModel(model);
                });

                $scope.new_instance_name = undefined;
            }

            //Update the view
            $scope.update_main_box(platform);
        }, function () {
            //If an error occurs, reload the platform, thus avoiding having a non synchronized $scope model object
            $location.url('/properties/' + $scope.platform.application_name).search({platform: $scope.platform.name});
            $route.reload(); //Force reload if needed
        });
    };

    $scope.on_edit_platform = function (platform) {
        //http://hesperides:51100
        $scope.$broadcast('quickHideInstanceDetails', {});
        $scope.quickOpen = false;
        $location.url('/properties/' + platform.application_name + '?platform=' + platform.name);

        $scope.platform = platform;
        $scope.selected_module = undefined;
        $scope.instance = undefined;
        $scope.properties = undefined;
        $scope.update_main_box(platform);
        store.set('current_platform_versionID', platform.version_id);
    };

    /**
     * An ungly copy for properties
     */
    $scope.oldProperites = undefined;

    $scope.edit_properties = function (platform, module) {
        if ($scope.platform.global_properties_usage === null) {
            $scope.refreshGlobalPropertiesData();
        }
        ApplicationService.get_properties($routeParams.application, platform.name, module.properties_path).then(function (properties) {
            ModuleService.get_model(module).then(function (model) {
                $scope.properties = properties.mergeWithModel(model);
                $scope.model = model;

                //Merge with global properties
                $scope.properties = properties.mergeWithGlobalProperties($scope.platform.global_properties);
                $scope.oldProperites = angular.copy($scope.properties);

                $scope.properties = LocalChanges.mergeWithLocalProperties($routeParams.application, platform.name, module.properties_path, $scope.properties);
                $scope.oldProperites = LocalChanges.tagWithLocalProperties($routeParams.application, platform.name, module.properties_path, $scope.oldProperites);

                $scope.selected_module = module;
                $scope.instance = undefined; //hide the instance panel if opened
                $scope.showGlobalProperties = undefined;
                $scope.showButtonAndEye = undefined;

                // Auto scroll to the properties list
                $location.hash('properties-list');
                $anchorScroll();
            });
        });
    };

    $scope.movePropertiesDivHolderToCursorPosition = function(event){
        var specificOffset = 10;
        var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

        if(isChrome) {
            specificOffset += 11;
        }

        var offset = $('#propertiesDivHolder').parent().offset();

        // This function is call in box view also, but not working
        if (!_.isUndefined(offset)) {
            var parentY = offset.top;
            var clickedElementPosition = event.target.getBoundingClientRect().top + window.pageYOffset;
            var padding = clickedElementPosition - parentY - specificOffset;
            $('#propertiesDivHolder').css('padding-top', padding);

            //Scroll to properties
            $timeout(function () {
                $('html, body').animate({
                    scrollTop: clickedElementPosition - 15
                }, 1000, 'swing');
            }, 0);
        }
    };

    /**
     * Clean properties.
     * Used to delete unsed properties in module template.
     */
    $scope.clean_properties = function (properties) {
        //Filter to keep properties only existing in model
        properties.filter_according_to_model();
    };

    /**
     * Clean instance properties.
     * Used to deleted unused instance properties.
     */
    $scope.clean_instance_properties = function (instance) {
        instance.key_values = _.filter (instance.key_values, function (item) {
            return item.inModel;
        });
    };

    // The new global property info
    $scope.new_kv_name = '';
    $scope.new_kv_value = '';

    $scope.save_global_properties = function (properties, save) {
        // Getting information with querySelector, this is because there is
        // a scope problem
        var nameEl = angular.element(document.querySelector('#new_kv_name'));
        var valueEl = angular.element(document.querySelector('#new_kv_value'));

        // Check if there is new global property then add before saving
        if ( !_.isEmpty(nameEl.val().trim())){
            properties.addKeyValue({'name':  nameEl.val().trim(), 'value': valueEl.val(),'comment': ''});

            // Clear contents
            nameEl.val("");
            valueEl.val("");
        }

        if (save) {

            if ( _.isEqual(properties, $scope.oldGolbalProperties) ){
                $translate('properties-not-changed.message').then(function(label) {
                    $.notify(label, "warn");
                });
                return;
            }

            // Save the global properties
            HesperidesModalFactory.displaySavePropertiesModal($scope, $routeParams.application, function ( comment ){
                ApplicationService.save_properties($routeParams.application, $scope.platform, properties, '#', comment ).then(function (properties) {
                    if (!_.isUndefined($scope.properties)) {
                        $scope.properties = $scope.properties.mergeWithGlobalProperties(properties);
                    }

                    //Increase platform number
                    $scope.platform.version_id = $scope.platform.version_id + 1;
                    $scope.refreshGlobalPropertiesData();

                    // Key the saved as old
                    $scope.oldGolbalProperties = angular.copy( properties );
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

        $scope.instance = undefined;
        $scope.properties = undefined;
        $scope.showGlobalProperties = undefined;
        $scope.showButtonAndEye = undefined;

        modalScope.dialog = $mdDialog.show({
            templateUrl: 'local_changes/united-nations-modal.html',
            controller: 'UnitedNationsController',
            clickOutsideToClose: false,
            escapeToClose: true,
            preserveScope: false, // requiered for not freez menu see https://github.com/angular/material/issues/5041
            scope:modalScope
        });
    }

    $scope.platformLocalChangesCount = function () {
        return LocalChanges.platformLocalChangesCount($scope.platform);
    }

    $scope.save_properties_locally = function (properties, module) {

        if(
            _.isEqual(properties.key_value_properties, $scope.oldProperites.key_value_properties) &&
            // we use angular copy for these to remove the $$hashKey
            _.isEqual(angular.copy(properties.iterable_properties), angular.copy($scope.oldProperites.iterable_properties)) ){
            $translate('properties-not-changed.message').then(function(label) {
                $.notify(label, "warn");
            });
            return false;
        }

        var hasSavedLocalChange = false;

        store.set('current_platform_versionID', $scope.platform.version_id);

        properties.key_value_properties.forEach( function (elem) {

            if (('filtrable_value' in elem && elem['filtrable_value'] != elem['value']) ||
                (!('filtrable_value' in elem) && elem['value'] && elem['value'].toString().length > 0 && !elem['inGlobal'])) {
                    LocalChanges.addLocalChange($routeParams.application, $scope.platform.name, module.properties_path, elem['name'], elem['value']);
                    hasSavedLocalChange = true;
            }
        });

        if (hasSavedLocalChange) {

            LocalChanges.smartClearLocalChanges({'application_name': $routeParams.application, 'platform': $scope.platform.name, 'properties_path': module.properties_path}, properties);

            $translate('properties.module.editProperties.savedLocally').then(function(label) {
                $.notify(label, "success");
            });
        }

        properties = LocalChanges.tagWithLocalProperties($routeParams.application, $scope.platform.name, module.properties_path, properties);
        return true;
    }

    $scope.hasLocalChanges = function (module) {
        return LocalChanges.hasLocalChanges($routeParams.application, $scope.platform ? $scope.platform.name : '', module ? module.properties_path : '');
    }

    $scope.hasDeletedProperties = function () {
        return _.filter($scope.properties ? $scope.properties.key_value_properties : [] , prop => prop.inModel==false).length > 0 ? true :false;
    }

    $scope.instanceHasDeletedProperties = function (instance) {
        return _.filter(instance ? instance.key_values : [] , prop => prop.inModel==false).length > 0 ? true :false;
    }

    $scope.cleanLocalChanges = function (module) {
        LocalChanges.clearLocalChanges({'application_name': $routeParams.application, 'platform': $scope.platform.name, 'properties_path': module.properties_path});
        $scope.properties = LocalChanges.mergeWithLocalProperties($routeParams.application, $scope.platform.name, module.properties_path, $scope.properties);
    }


    $scope.save_properties = function (properties, module) {

        if ($scope.save_properties_locally(properties, module)) {
            // Save properties
            HesperidesModalFactory.displaySavePropertiesModal($scope, $routeParams.application, function ( comment ){
                ApplicationService.save_properties($routeParams.application, $scope.platform, properties, module.properties_path, comment).then(function (properties) {
                    //Merge properties with model
                    ModuleService.get_model(module).then(function (model) {
                        $scope.properties = properties.mergeWithModel(model);

                        // Keep the saved properties as old
                        $scope.oldProperites = angular.copy($scope.properties);
                    });

                    //Merge with global properties
                    $scope.properties = properties.mergeWithGlobalProperties($scope.platform.global_properties);

                    //Increase platform number
                    $scope.platform.version_id = $scope.platform.version_id + 1;

                    //Specify that the global_properties_usage = null means that data may have become outdated.
                    // So next time user wants global_properties we reload then instead of using cached ones.
                    $scope.platform.global_properties_usage = null;

                    //Cleanning up local change because they have been saved already
                    LocalChanges.clearLocalChanges({'application_name': $routeParams.application, 'platform': $scope.platform.name, 'properties_path': module.properties_path});

                    // Dismiss the modal
                    //modalScope.$closeDialog();

                }, function () {
                    //If an error occurs, reload the platform, thus avoiding having a non synchronized $scope model object
                    $location.url('/properties/' + $scope.platform.application_name).search({platform: $scope.platform.name});
                    $route.reload(); //Force reload if needed
                });
            });
        }
    };

    $scope.edit_instance = function (instance, properties_path) {
        ApplicationService.get_instance_model($routeParams.application, $scope.platform, properties_path).then(function (model) {
            $scope.instance = instance.mergeWithModel(model);
            $scope.instance.properties_path = properties_path;
            $scope.instance.key_values.forEach(function (elem) {
                if (elem.value.length)
                    elem.filtrable_value = elem.value;
            })
            $scope.properties = undefined; //hide the properties panel if opened
            $scope.showGlobalProperties = undefined;
        });
    };

    $scope.refreshGlobalPropertiesData = function() {
        var platform = $scope.platform;
        var url = 'rest/applications/' + encodeURIComponent(platform.application_name) + '/platforms/' + encodeURIComponent(platform.name) + '/properties?path=#';

        $http.get(url).then(function (response) {
            return new Properties(response.data);
        }, function (error) {
            $.notify(error.data.message, "error");
            throw error;
        }).then(function (response) {
            platform.global_properties = response;

            // making a copy, for changes detection
            $scope.oldGolbalProperties = angular.copy($scope.platform.global_properties);
        });

        var url = 'rest/applications/' + encodeURIComponent(platform.application_name) + '/platforms/' + encodeURIComponent(platform.name) + '/global_properties_usage';

        $http.get(url).then(function (response) {
            return response.data;
        }, function (error) {
            $.notify(error.data.message, "error");
            throw error;
        }).then(function (response) {
            platform.global_properties_usage = response;
        });
    }

    /**
     * A ungly copy of global properties
     */
    $scope.oldGolbalProperties = undefined;

    $scope.showGlobalPropertiesDisplay = function () {
        // --- Testing retrive on demand
        // If the usage is already filled, we don't call the backend, and serve cache instead
        if ($scope.platform.global_properties_usage === null) {
            $scope.refreshGlobalPropertiesData();
        }

        $scope.instance = undefined;
        $scope.properties = undefined;
        $scope.showGlobalProperties = !$scope.showGlobalProperties;
        $scope.showButtonAndEye = !$scope.showButtonAndEye;
    };

    $scope.get_platform_to_compare = function (application, platform, lookPast, date) {
        $scope.loading_compare_platform = true;
        if (lookPast) {
            if (_.isUndefined(date)) {
                date = (new Date().getTime());
            }else{
                date = +moment(date, "YYYY-MM-DD HH:mm:ss Z");
            }
            var platform_promise = ApplicationService.get_platform(application, platform, date);
        } else {
            var platform_promise = ApplicationService.get_platform(application, platform);
        }

        platform_promise.then(function (platform) {
            $scope.compare_platform = platform;
            $scope.loading_compare_platform = false;
        }).then(function () {
            //Try to detect module
            $scope.compare_platform.chosen_module = _.find($scope.compare_platform.modules, function (module) {
                return module.name == $scope.compare_module.name;
            });
        });
    };

    $scope.open_module_page = function (name, version, is_working_copy) {
        var url;

        if(is_working_copy){
            url = '/module/' + name + '/' + version + '?type=workingcopy';
        } else {
            url = '/module/' + name + '/' + version + '?';
        }

        $location.url(url);
        $route.reload(); //Force reload if needed
    };

    /**
     * Instances display relative vars
     * The hide mode is displayed by default
     */
    if(store.get('instance_properties') == true){
        $scope.isInstanceOpen = 1;
    }else{
        $scope.isInstanceOpen = 0;
    }

    /**
     * Box and tree display relative vars
     * The tree mode is displayed by default
     */
    if(store.get('display_mode') == 'arbre'){
        $scope.box = false;
        $scope.tree = true;
    }else{
        $scope.box = true;
        $scope.tree = false;
    }

    /**
     * This will display the properties in the box mode.
     */
    $scope.boxModeShow = function (){
        if (!$scope.box){
            $("#loading").show();
            $scope.box = true;
            $scope.tree = false;
            $scope.properties = undefined;
            $scope.instance = undefined;
        }
    }

    /**
     * This will display the properties in the tree mode.
     */
    $scope.treeModeShow = function (){
        if (!$scope.tree){
            $("#loading").show();
            $scope.box = false;
            $scope.tree = true;
            $scope.properties = undefined;
            $scope.instance = undefined;
        }
    }

    /* Get the application */
    ApplicationService.get($routeParams.application).then(function (application) {
        $scope.application = application;
        $scope.platforms = application.platforms;
        /* If platform was mentionned in the route, try to find it */
        /* If it does not exist show error */
        if ($routeParams.platform) {
            var selected_platform = _.find($scope.platforms, function (platform) {
                return platform.name === $routeParams.platform;
            });
            if (_.isUndefined(selected_platform)) {
                $translate('properties.event.notExist.error').then(function(label) {
                    $.notify(label, "error");
                });
            } else {
                $scope.platform = selected_platform;
                $scope.update_main_box(selected_platform);
            }
        }
    });
}]);

/**
 * Directive for rendering properties on box mode.
 */
propertiesModule.directive('boxProperties', function ($timeout){
    return {
        restrict : 'E',
        templateUrl: 'application/box_properties.html',
        link: function ($scope, element, attrs, ctrl){
            $timeout(function (){
                $("#loading").hide();
                }, 0);
        }
    }
});

/**
 * Directive for rendering properties on tree mode.
 */
propertiesModule.directive('treeProperties', function ($timeout){
    return {
        restrict : 'E',
        templateUrl: 'application/tree_properties.html',
        link: function ($scope, element, attrs, ctrl){
            $timeout(function (){
                $("#loading").hide();
                }, 0);
        }
    }
});

propertiesModule.controller('DiffCtrl', ['$filter', '$scope', '$routeParams', '$timeout', '$route', 'ApplicationService', 'ModuleService', '$translate', 'HesperidesModalFactory', 'Platform', function ($filter, $scope, $routeParams, $timeout, $route, ApplicationService, ModuleService, $translate, HesperidesModalFactory, Platform) {

    var DiffContainer = function (status, property_name, property_to_modify, property_to_compare_to) {
        // 0 -> only on to_modify
        // 1 -> on both and identical values
        // 2 -> on both and different values
        // 3 -> only on to_compare_to
        this.status = status;
        this.property_name = property_name;
        this.property_to_modify = property_to_modify;
        this.property_to_compare_to = property_to_compare_to;
        this.modified = false;
        this.selected = false;
    };

    $scope.application_name = $routeParams.application;
    $scope.platform_name = $routeParams.platform;
    $scope.properties_path = $routeParams.properties_path;
    $scope.splited_properties_path = $routeParams.properties_path.split('#');
    $scope.module = "";
    $scope.compare_application = $routeParams.compare_application;
    $scope.compare_platform = $routeParams.compare_platform;
    $scope.compare_path = $routeParams.compare_path;
    $scope.compare_splited_path = $routeParams.compare_path.split('#');
    $scope.compare_module = "";

    $scope.origin_timestamp = $routeParams.origin_timestamp;
    $scope.timestamp = $routeParams.timestamp;

    $scope.show_only_modified = false;

    $scope.displayable_properties_path = Platform.prettify_path($routeParams.properties_path);
    $scope.displayable_compare_path = Platform.prettify_path($routeParams.compare_path);

    $scope.propertiesKeyFilter0 = "";
    $scope.propertiesKeyFilter1 = "";
    $scope.propertiesKeyFilter2 = "";
    $scope.propertiesKeyFilter3 = "";

    $scope.module = {
        "name": $scope.splited_properties_path[3],
        "version": $scope.splited_properties_path[4],
        "is_working_copy": $scope.splited_properties_path[5] == "WORKINGCOPY" ? true : false
    }

    $scope.compare_module = {
        "name": $scope.compare_splited_path[3],
        "version": $scope.compare_splited_path[4],
        "is_working_copy": $scope.compare_splited_path[5] == "WORKINGCOPY" ? true : false
    };

    //Get the platform to get the version id
    //Then get the properties, version id could have changed but it is really marginal
    ApplicationService.get_platform($routeParams.application, $routeParams.platform).then(function (platform) {
        $scope.platform = platform;
    }).then(function () {
        return ApplicationService.get_properties($routeParams.application, $routeParams.platform, $routeParams.properties_path);
    }).then(function (properties) {
        $scope.properties_to_modify = properties;
    }).then(function () {
        return ModuleService.get_model($scope.module);
    }).then(function (model) {
        $scope.properties_to_modify = $scope.properties_to_modify.mergeWithModel(model);
    }).then(function () {
        // Get global properties
        return ApplicationService.get_properties($routeParams.application, $routeParams.platform, '#');
    }).then(function (model) {
        $scope.properties_to_modify = $scope.properties_to_modify.mergeWithGlobalProperties(model);
    }).then(function () {
        return ApplicationService.get_properties($routeParams.compare_application, $routeParams.compare_platform, $routeParams.compare_path, $routeParams.timestamp);
    }).then(function (properties) {
        $scope.properties_to_compare_to = properties;
    }).then(function () {
        return ModuleService.get_model($scope.compare_module);
    }).then(function (model) {
        $scope.properties_to_compare_to = $scope.properties_to_compare_to.mergeWithModel(model);
    }).then(function () {
        // Get global properties
        return ApplicationService.get_properties($routeParams.compare_application, $routeParams.compare_platform, '#');
    }).then(function (model) {
        $scope.properties_to_compare_to = $scope.properties_to_compare_to.mergeWithGlobalProperties(model);
    }).then(function () {
        $scope.properties_to_modify = $scope.properties_to_modify.mergeWithDefaultValue();
        $scope.properties_to_compare_to = $scope.properties_to_compare_to.mergeWithDefaultValue();
        $scope.generate_diff_containers($routeParams.properties_path !== '#');
    });

    //Everything needs to be in scope for this function to work
    /**
     * Generate diff container.
     *
     * @param filterInModel Global properties are store in root path '#'. If we compare this path, don't remove properties are not in model.
     */
    $scope.generate_diff_containers = function (filterInModel) {
        $scope.diff_containers = [];
        //Group properties, this is a O(n^2) algo but is enough for the use case
        //Only focus on key/value properties
        //We set create a container for each property with a diff status, a property_to_modify, a property_to_compare_to
        //First we look in the properties to modify, for each try:
        //  - to check if value is empty -> status 3
        //  - to find a property to compare to
        //        - with identical value -> status 1
        //        - with different value -> status 2
        //  - if no matching property -> status 0
        if (filterInModel) {
            // There's not need to keep removed properties because readability is better without them
            $scope.properties_to_modify.key_value_properties = _.filter($scope.properties_to_modify.key_value_properties, {inModel: true});
            $scope.properties_to_compare_to.key_value_properties = _.filter($scope.properties_to_compare_to.key_value_properties, {inModel: true});
        }

        _.each($scope.properties_to_modify.key_value_properties, function (prop_to_modify) {

            // Search if property found on other platform
            var countItem = _.findIndex($scope.properties_to_compare_to.key_value_properties, prop_to_modify.name);

            if (countItem === 0) {
                //Avoid null pointer create prop to compare to with an empty value
                var prop_to_compare_to = angular.copy(prop_to_modify);
                prop_to_compare_to.value = '';
                $scope.diff_containers.push(new DiffContainer(0, prop_to_modify.name, prop_to_modify, {}));
                return;
            }

            //else try to find a matching prop_to_compare_to
            var prop_to_compare_to = _.find($scope.properties_to_compare_to.key_value_properties, function (prop) {
                return prop_to_modify.name === prop.name;
            });

            if (_.isUndefined(prop_to_compare_to)) {
                //Avoid null pointer create prop to compare to with an empty value
                var prop_to_compare_to = angular.copy(prop_to_modify);
                prop_to_compare_to.value = '';
                $scope.diff_containers.push(new DiffContainer(0, prop_to_modify.name, prop_to_modify, {}));
            } else if (prop_to_modify.value === prop_to_compare_to.value) {
                $scope.diff_containers.push(new DiffContainer(1, prop_to_modify.name, prop_to_modify, prop_to_compare_to));
            } else {
                $scope.diff_containers.push(new DiffContainer(2, prop_to_modify.name, prop_to_modify, prop_to_compare_to));
            }
        });

        //Check properties remaining in compare_to (not existing or value equals to ''). The one we missed when iterating through properties_to_modify
        _.each($scope.properties_to_compare_to.key_value_properties, function (prop_to_compare_to) {
            var some = _.some($scope.properties_to_modify.key_value_properties, function (prop) {
                return prop_to_compare_to.name === prop.name;
            });

            if (!some) {
                //Avoid null pointer create prop to modify with an empty value
                var prop_to_modify = angular.copy(prop_to_compare_to);
                prop_to_modify.value = '';
                $scope.diff_containers.push(new DiffContainer(3, prop_to_modify.name, prop_to_modify, prop_to_compare_to));
            }
        });
    }

    $scope.properties_compare_values_empty = "";

    $translate('properties.compare.values.empty').then(function (translation) {
        $scope.properties_compare_values_empty = translation;
    });

    $scope.formatProperty = function (property) {

        if (property.globalValue) {

            compiled = property.value;

            Object.keys(property.globalValue).forEach(function(key,index) {
                compiled = compiled.split("{{"+ key + "}}").join(property.globalValue[key]);
            });

            return compiled;
        }
        if (!property.value) {
            return $scope.properties_compare_values_empty;
        }

        return property.value;

    }

    //Helper for diff conainers ids
    $scope.dot_to_underscore = function (string) {
        return string.replace(/\./g, '_');
    }

    /*
     * Select the containers that corresponds to the filters (ex: status = 2).
     */
    $scope.toggle_selected_to_containers_with_filter = function (filter, selected, propertiesKeyFilter) {
        _($scope.diff_containers).filter(function (container) {
            //If user filter the properties'diff by name or regex, we use this filter to make a first selection for the containers
            if (propertiesKeyFilter) {
                var name = '.*' + propertiesKeyFilter.toLowerCase().split(' ').join('.*');
                try {
                    var regex_name = new RegExp(name, 'i');
                } catch(e) {
                }
                if (!regex_name.test(container.property_name)) {
                    return false;
                }
            }

            //We apply the other filters to select the containers that we want
            for (var key in filter) {
                if (!_.isEqual(filter[key], container[key])) return false;
            }

            return true;
        }).each(function (container) {
            //Finally, we change the selection of the selected containers
            container.selected = selected;
        });
    };

    $scope.apply_diff = function () {
        /* Filter the diff container that have been selected
         depending on the status apply different behaviors
         if status == 0 : this should not happened because it is values that are only in the destination platform, so just ignore it
         if status == 1 : normaly the only selected containers should be the one that have been modified, but it does not really matter
         because the other ones have the same values. We can just apply the 'revert modification' mecanism
         if status == 2 : this is when we want to apply modification from sourc epltfm to destination pltfm
         if status == 3 : same behavior as status == 2
         */
        _($scope.diff_containers).filter(function (diff_container) {
            return diff_container.selected
        }).each(function (diff_container) {
            switch (diff_container.status) {
                case 0:
                    break;
                case 1:
                    //Revert modifs
                    diff_container.property_to_modify.value = diff_container.property_to_modify.old_value;
                    delete diff_container.property_to_modify.old_value;

                    //Change status and reset markers. Keep selected for user experience
                    //Status depends on old_value, if it was empty status is 3 otherwise it is 2
                    diff_container.status = diff_container.property_to_modify.value != '' ? 2 : 3;
                    diff_container.modified = false;
                    break;
                case 2:
                    //Store old value and apply modifs
                    diff_container.property_to_modify.old_value = diff_container.property_to_modify.value;
                    diff_container.property_to_modify.value = diff_container.property_to_compare_to.value;

                    //Change status and reset markers. Keep selected for user experience
                    diff_container.modified = true;
                    diff_container.status = 1;
                    break;
                case 3:
                    //Same as 2, copy paste (bad :p )
                    //Store old value and apply modifs
                    diff_container.property_to_modify.old_value = diff_container.property_to_modify.value;
                    diff_container.property_to_modify.value = diff_container.property_to_compare_to.value;

                    //Change status and reset markers. Keep selected for user experience
                    diff_container.modified = true;
                    diff_container.status = 1;
                    break;
                default:
                    console.error("Diff container with invalid status -> " + container.status + ". It will be ignored");
                    break;
            }
        });

    };

    $scope.save_diff = function () {
        //Get all the properties modified
        var key_value_properties = _($scope.diff_containers).filter(function (diff_container) {
            return diff_container.property_to_modify != null;
        }).map(function (diff_container) {
            return diff_container.property_to_modify;
        }).value();

        // Is some diff item selected ?
        var hasSomeDiffSelected = _.some($scope.diff_containers, {selected : true});

        if ( !hasSomeDiffSelected ){
            $translate('properties-not-changed.message').then(function(label) {
                $.notify(label, "warn");
            });
            return;
        }

        $scope.properties_to_modify.key_value_properties = key_value_properties;

        // Save the properties
        HesperidesModalFactory.displaySavePropertiesModal($scope, $routeParams.application, function ( comment ){
            ApplicationService.save_properties($scope.application_name, $scope.platform, $scope.properties_to_modify, $scope.properties_path, comment ).then(function (properties) {
                $route.reload();
            });
        });
    };

}]);

/**
 * This directive will display only the simple properties list.
 * Added by Tidiane SIDIBE on 11/03/2016
 */
 propertiesModule.directive('simplePropertiesList', ['LocalChanges', function (LocalChanges) {

     return {
         restrict: 'E',
         scope: {
             properties: '=',
             platform: '=',
             module: '='
         },
         templateUrl: "properties/simple-properties-list.html",
         link: function (scope, element, attrs) {
             scope.propertiesKeyFilter = "";
             scope.propertiesValueFilter = "";

             scope.hasLocalChanges = function () {
                return LocalChanges.hasLocalChanges(scope.platform.application_name, scope.platform.name, scope.module ? scope.module.properties_path : '');
             }

             scope.hasSyncedChanges = function () {
                return LocalChanges.hasSyncedChanges({'key_value_properties' :scope.properties});
             }

             scope.areFullySynced = function () {
                var properties_path = scope.module ? scope.module.properties_path : '';
                var platform = scope.platform;

                return LocalChanges.areFullySynced(platform != undefined ? platform.application_name : '', platform != undefined ? platform.name : '', properties_path, {'key_value_properties': scope.properties});
             }

             scope.cleanLocalChanges = function () {
                LocalChanges.clearLocalChanges({'application_name': scope.platform.application_name, 'platform': scope.platform.name, 'properties_path': scope.module.properties_path});
                scope.properties = LocalChanges.tagWithLocalProperties(scope.platform.application_nam, scope.platform.name, scope.module.properties_path, {'key_value_properties': scope.properties}).key_value_properties;
             }

         }
     };
 }]);

/**
 * This directive will display only the iterable properties
 * Added by Tidiane SIDIBE on 11/03/2016
 */
 propertiesModule.directive('iterablePropertiesList', function () {

     return {
         restrict: 'E',
         scope: {
             modelProperty: '=',
             valueProperty: '=',
             filterDeleted: '=',
             filterUnspecified: '=',
             filterValues: '=',
             filterNames: '=',
             sortOrder: '='
         },
         templateUrl: 'properties/iterable-properties-list.html',
         controller : 'iterablePropertiesListController',
         link: function (scope, element, attrs){

         }
     };
 });

/**
 * This is a private function of checking if a value
 * is in the model
 * @param {Object} model : the model from the scope.
 * @param {String} name : the value name field.
 * @return true if it's in, false otherwise.
 */
var isInModel = function (model, name){
    var _model = _.find(model.fields, {name : name});
    return !_.isUndefined(_model);
};


/**
 * Private function for merging values
 * @param {JSON Object} model : the model of the iterable block
 * @param {JSON Object} values : the values of the iterable block
 */
var mergeValue = function (model, values){

    // for each valorisation block
    _(values.iterable_valorisation_items).each (function (value){

        // for each model fields
        _(model.fields).each (function (field){
            //is the block containing value for this filed
            var exists = !_.isUndefined(_.find(value.values, {name : field.name}));

            if ( exists ){
                //The value exits, juste merge.
                _(value.values).each (function (val){
                    //is it in the mode ?
                    val.inModel = isInModel(model, val.name);
                });
            }
            else{
                // not existing existing value found, then add one
                value.values.push({
                    name: field.name,
                    value: (field.required) ? undefined : "", // 'required' to make difference with void string.
                    comment: (field.comment) ? field.comment : "",
                    password: (field.password) ? field.password : false,
                    defaultValue: (field.defaultValue) ? field.defaultValue : "",
                    required: (field.required) ? field.required : false,
                    inModel:true,
                    pattern: (field.pattern) ? field.pattern : ""
                });
            }
        });
    });

};

/**
 * This is the controller for iterable properties list directive
 * Added by Tidiane SIDIBE 14/03/2015
 */
 propertiesModule.controller('iterablePropertiesListController', function($scope) {

    // call the merge
    mergeValue($scope.modelProperty, $scope.valueProperty);

    /**
     * Adds the new void iterable block
     */
    $scope.addValue = function(model, values) {

        /**
         * Private method for adding new void fields from the model.
         * @param {JSON Object} model : the model of the iterable block
         * @param {JSON Object} values : the values for the iterable block
         */
        var addSimple = function (model, values){
            var modelFields = model.fields;

            // This from the click
            var iterableValue = {};
            iterableValue.title     = "not used";
            iterableValue.values    = [];

            _(model.fields).each (function (field){
                iterableValue.values.push({
                    name: field.name,
                    value: (field.required) ? undefined : "",
                    inModel: true,
                    comment: (field.comment) ? field.comment : "",
                    password: (field.password) ? field.password : false,
                    defaultValue: (field.defaultValue) ? field.defaultValue : "",
                    required: (field.required) ? field.required : false,
                    pattern: (field.pattern) ? field.pattern : ""
                });
            });

            values.iterable_valorisation_items.push(iterableValue);
        };

        //
        // The initial call is make with data from the scope
        //
        if (_.isUndefined(model) && _.isUndefined(values)){
            addSimple($scope.modelProperty, $scope.valueProperty);
        }
    };

    /**
     * Delete the selected block.
     * @param {Integeger} index : the block id in the values.
     */
    $scope.removeValue = function (index){
        $scope.valueProperty.iterable_valorisation_items.splice(index, 1);
    };

 });

/**
 * This is the directive of the filter button for deleted iterable properties.
 * Added by Tidiane SIDIBE 14/03/2015
 */
propertiesModule.directive('toggleDeletedIterableProperties', function () {

    return {
        restrict: 'E',
        scope: {
            iterableProperties: '=',
            toggle: '='
        },
        template: '<md-switch id="toggle-deleted-iterable-properties_switch" class="md-primary md-block" style="margin-right:2%"' +
                    'ng-model="toggle"' +
                    'ng-init="toggle=false" ' +
                    'ng-disabled="(getNumberOfDeletedProperties() <= 0)" ' +
                    'aria-label="{{ \'properties.deletedOnes.switch\' | translate }}">' +
                    '{{ \'properties.deletedOnes.switch\' | translate }} ({{ getNumberOfDeletedProperties() }})          ' +
                    '</md-switch>',
        controller : ['$scope', function ($scope){
            $scope.getNumberOfDeletedProperties = function (tab) {
                var count = 0;

                if ($scope.iterableProperties) {
                    _($scope.iterableProperties).each(function (item){
                        //is the group in model
                        if (item.inModel){
                            _(item.iterable_valorisation_items).each(function (valorisation){
                                _(valorisation.values).each (function (value){
                                    if (!value.inModel){
                                        count ++;
                                    }
                                });
                            });
                        }
                    });
                }
                if (count <= 0) {
                    $scope.toggle = false;
                }
                return count;
            };
        }],
        link: function (scope, element, attrs) {

        }
    }
});

/**
 * This is the directive of the filter button for deleted iterable properties.
 * Added by Tidiane SIDIBE 14/03/2015
 */
propertiesModule.directive('toggleUnspecifiedIterableProperties', function () {

    return {
        restrict: 'E',
        scope: {
            iterableProperties: '=',
            toggle: '='
        },
        template: '<md-switch id="toggle-unspecified-iterable-properties_switch" class="md-primary md-block"' +
                          'ng-model="toggle"' +
                          'ng-init="toggle=false" ' +
                          'ng-disabled="(getNumberOfUnspecifiedProperties() <= 0)" ' +
                          'aria-label="{{ \'properties.unspecifiedValues.switch\' | translate }}">' +
                          '{{ \'properties.unspecifiedValues.switch\' | translate }} ({{ getNumberOfUnspecifiedProperties() }})' +
                          '</md-switch>',
        controller : ['$scope', function ($scope){
            $scope.getNumberOfUnspecifiedProperties = function () {
                var count = 0;

                if ($scope.iterableProperties) {
                    _($scope.iterableProperties).each(function (item){
                        //is the group in model
                        if (item.inModel){
                            _(item.iterable_valorisation_items).each(function (valorisation){
                                _(valorisation.values).each (function (value){
                                    if (value.inModel && _.isEmpty(value.value) && _.isEmpty(value.defaultValue)) {
                                        count++;
                                    }
                                });
                            });
                        }
                    })
                }
                if (count == 0) {
                    $scope.toggle = false;
                }
                return count;
            };
        }],
        link: function (scope, element, attrs) {

        }
    }
});

/**
 * This directive will display the properties list with contains :
 *  1. Simple properties
 *  2. Iterable probperties
 * Added by Tidiane SIDIBE on 11/03/2016
 */
propertiesModule.directive('propertiesList', ['LocalChanges', function (LocalChanges) {

    return {
        restrict: 'E',
        scope: {
            properties: '=',
            propertiesModel: '=',
            platform: '=',
            module: '='
        },
        templateUrl: "properties/properties-list.html",
        link: function (scope) {
            //Simple properties filters
            scope.propertiesKeyFilter = "";
            scope.propertiesValueFilter = "";

            //Iterable properties filters
            scope.iterablePropertiesNameFilter =  "";
            scope.iterablePropertiesValueFilter = "";

            scope.isOpen = 1;
            /**
             * Gets the properties values from the model name.
             * This is for iterable properties only.
             */
            scope.getValues = function (name){
                if (scope.properties){
                    var values = _.find(scope.properties.iterable_properties, {name : name});
                    if(!values) {
                        values = {
                            inModel: true,
                            iterable_valorisation_items: [],
                            name: name
                        };
                        scope.properties.iterable_properties.push(values);
                    }
                    return values;
                }
            };

            // Manager accordion open/close
            scope.open = function (index){
                if ( index === scope.isOpen){
                    scope.isOpen = undefined;
                }else{
                    scope.isOpen = index;
                }
            };

            scope.hasLocalChange = function () {

                var properties_path = scope.module ? scope.module.properties_path : '';
                var platform = scope.platform;

                return LocalChanges.hasLocalChanges(platform != undefined ? platform.application_name : '', platform != undefined ? platform.name : '', properties_path);

            };
        }
    };
}]);

/**
 * Display the deleted properties button.
 * This is for simple properties.
 * @see toggleDeletedIterableProperties for iterable properties
 */
propertiesModule.directive('toggleDeletedProperties', function () {

    return {
        restrict: 'E',
        scope: {
            keyValueProperties: '=',
            toggle: '='
        },
        template: '<md-switch id="toggle-deleted-properties_switch" class="md-primary md-block" ' +
            'ng-model="toggle"' +
            'ng-init="toggle=false" ' +
            'ng-disabled="(getNumberOfDeletedProperties() <= 0)" ' +
            'aria-label="{{ \'properties.deletedOnes.switch\' | translate }}">' +
            '{{ \'properties.deletedOnes.switch\' | translate }} ({{ getNumberOfDeletedProperties() }})          ' +
            '</md-switch>',
        link: function (scope) {
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
        }
    }

});

/**
 * Ths directive is for saving the global properties when the 'enter' key is pressed
 * on global properties fields.
 */
propertiesModule.directive('focusSaveGlobalProperties', function () {
    return function (scope, element) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$parent.save_global_properties(scope.$parent.platform.global_properties, false);
                event.preventDefault();
            }
        });
    };
});

/**
 * Diplay warning message when value is same/or not and source of value is different.
 */
propertiesModule.directive('warningValue', function () {

    return {
        restrict: 'E',
        scope: {
            propertyToModify: '=',
            propertyToCompareTo: '='
        },
        template: '<span class="glyphicon glyphicon-exclamation-sign" ng-if="propertyToModify.inGlobal != propertyToCompareTo.inGlobal || propertyToModify.inDefault != propertyToCompareTo.inDefault">' +
        '<md-tooltip ng-if="propertyToModify.inGlobal != propertyToCompareTo.inGlobal">Valorisé depuis un propriété globale</md-tooltip>' +
        '<md-tooltip ng-if="propertyToModify.inDefault != propertyToCompareTo.inDefault">' +
        'La valeur sur l\'application' +
        'est valorisée depuis une valeur par défaut' +
        '</md-tooltip>' +
        '</span>'
    }

});

propertiesModule.factory('Properties', function () {
    var Properties = function (data) {

        angular.extend(this, {
            key_value_properties: [],
            iterable_properties: [],
            versionID: -1
        }, data);

        //Add a property that allows to filter other properties values
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
        }

        this.deleteKeyValue = function (key_value_property) {
            var index = this.key_value_properties.indexOf(key_value_property);
            if (index > -1) {
                this.key_value_properties.splice(index, 1);
            }
        }

        this.mergeWithGlobalProperties = function (global_properties) {
            //Here we just want to mark the one existing identical in the global properties,
            //because they wont be editable
            //Mark also the ones just using a global in their valorisation
            _.each(this.key_value_properties, function (key_value) {
                //First clean, in case there has been updates from the server
                key_value.inGlobal = false;
                key_value.useGlobal = false;

                var existing_global_property = _.find(global_properties.key_value_properties, function (kvp) {
                    return key_value.name === kvp.name;
                }, 'value');
                if (!_.isUndefined(existing_global_property)) {
                    key_value.inGlobal = true;
                    key_value.value = existing_global_property.value;
                } else {
                    //Try to check if it uses a global in the valorisation
                    if (_.some(global_properties.key_value_properties, function (kvp) {
                        return !_.isUndefined(key_value.value) && key_value.value.indexOf("{{" + kvp.name + "}}") > -1;
                    })) {
                        key_value.useGlobal = true;
                        key_value.globalValue = {};

                        _.forEach(global_properties.key_value_properties, function (kvp) {
                                                                    if (key_value.value.indexOf('{{' + kvp.name + '}}') != -1) {
                                                                       key_value.globalValue[kvp.name] = kvp.value;
                                                                    }
                                                                });
                    }
                }
            });

            return this;
        }

        this.mergeWithModel = function (model) {
            var me = this;
            /* Mark key_values that are in the model */
            _.each(this.key_value_properties, function (key_value) {
                key_value.inModel = model.hasKey(key_value.name);

                if (key_value.inModel) {
                    // Add required/default
                    var prop = _.find(model.key_value_properties, function (kvp) {
                        return kvp.name === key_value.name;
                    });

                    key_value.required = (prop.required) ? prop.required : false;
                    key_value.password = (prop.password) ? prop.password : false;
                    key_value.defaultValue = (prop.defaultValue) ? prop.defaultValue : "";
                    key_value.pattern = (prop.pattern) ? prop.pattern : "";
                } else {
                    key_value.required = false;
                    key_value.password = false;
                    key_value.defaultValue = "";
                    key_value.pattern = "";
                }
            });

            _.each(this.iterable_properties, function (iterable) {
                iterable.inModel = model.hasIterable(iterable.name);
            });

            /* Add key_values that are only in the model */
            _(model.key_value_properties).filter(function (model_key_value) {
                return !me.hasKey(model_key_value.name);
            }).each(function (model_key_value) {
                me.key_value_properties.push({
                    name: model_key_value.name,
                    comment: model_key_value.comment,
                    value: (model_key_value.required) ? undefined : "", // 'undefined' to make difference with void string.
                    inModel: true,
                    required: (model_key_value.required) ? model_key_value.required : false,
                    password: (model_key_value.password) ? model_key_value.password : false,
                    defaultValue: (model_key_value.defaultValue) ? model_key_value.defaultValue : "",
                    pattern: (model_key_value.pattern) ? model_key_value.pattern : ""
                });
            });

            /**
             * Merge model and value for iterate value.
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
                _(iterable_model).each(function (model_iterable) {
                    // Found iterate properties for iterable_model
                    var it = _(iterable_properties).filter({name: model_iterable.name});
                    // Get current model part
                    var currentModel = model_iterable.fields;

                    // For each item in iterate found
                    it.each(function (itProp) {
                        // For each valorisation of iterate
                        _(itProp.iterable_valorisation_items).each(function (val) {
                            // For each values in iterate
                            _(val.values).each(function (item) {
                                if (item.iterable_valorisation_items) {
                                    // New iterate
                                    _(currentModel).filter({name: item.name}).each(function (prop) {
                                        item.iterable_valorisation_items.inModel = true;

                                        scanIterableItems([prop], [item]);
                                    });
                                } else {
                                    // Search model
                                    _(currentModel).filter({name: item.name}).each(function (prop) {
                                        item.comment = prop.comment;
                                        item.inModel = true;
                                        item.required = (prop.required) ? prop.required : false;
                                        item.password = (prop.password) ? prop.password : false;
                                        item.defaultValue = (prop.defaultValue) ? prop.defaultValue : "";
                                        item.pattern = (prop.pattern) ? prop.pattern : "";
                                    });
                                }
                            });
                        });
                    });
                });
            };

            scanIterableItems(model.iterable_properties, me.iterable_properties);

            // Taking care of missing values

            // for each model in iterable
            _(model.iterable_properties).each(function(_model){
                // find the values
                var values = _.find(me.iterable_properties, {name : _model.name});

                if (_.isUndefined(values)){
                    values = {
                        inModel: true,
                        iterable_valorisation_items: [],
                        name: name
                    };
                }

                // then merge
                mergeValue(_model, values);
          });

          return this;

        };

        this.filter_according_to_model = function () {
            this.key_value_properties = _.filter(this.key_value_properties, function (property) {
                return property.inModel;
            });

            // for iterable properties
            this.iterable_properties = _.filter(this.iterable_properties, function (property) {
                if (property.inModel){

                    _(property.iterable_valorisation_items).each (function (valorisation){
                        var inModelVals = undefined;
                        inModelVals = _.filter(valorisation.values, function (val){
                            return val.inModel;
                        });

                        // set by the filtered
                        valorisation.values = inModelVals;
                    });

                    return true;
                }
            });
        }

        this.to_rest_entity = function () {
            return {
                versionID: this.versionID,
                key_value_properties: _.map(this.key_value_properties, function (kvp) {
                    return {
                        name: kvp.name,
                        comment: kvp.comment,
                        value: kvp.value
                    }
                }),
                iterable_properties: _.map(this.iterable_properties, function (ip) {
                    return {
                        name: ip.name,
                        iterable_valorisation_items: ip.iterable_valorisation_items
                    }
                })
            }
        }

        this.mergeWithDefaultValue = function () {
            var me = this;

            _.each(me.key_value_properties, function (key_value) {
                if (key_value.inModel) {
                    // Default value are not avaible for deleted properties
                    if (_.isString(key_value.value) && _.isEmpty(key_value.value)
                        && _.isString(key_value.defaultValue) && !_.isEmpty(key_value.defaultValue)) {
                        key_value.inDefault = true;
                        key_value.value = key_value.defaultValue;
                    } else {
                        key_value.inDefault = false;
                    }
                }
            });

            // Merge default values for iterable properties
            // Updated by tidiane_sidibe on 29/02/2016
            var mergeWithDefaultValueOfIterable = function (iterable_props) {
                _.each(iterable_props, function (iterable) {
                    if ( iterable.inModel ){
                        _.each (iterable.iterable_valorisation_items, function (item){
                           if (!_.isUndefined(item.iterable_valorisation_items)){
                               // Recur again on the item
                               mergeWithDefaultValueOfIterable(item);
                           }else {
                               _(item.values).each(function (field){
                                    if (_.isString(field.value) && _.isEmpty(field.value) && _.isString(field.defaultValue) && !_.isEmpty(field.defaultValue)){
                                      field.inDefault = true;
                                      field.value = item.defaultValue;
                                   }else {
                                      field.inDefault = false;
                                   }
                               });
                           }
                        });
                    }
                });
            };

            // Start the merge with default for iterable
            mergeWithDefaultValueOfIterable(me.iterable_properties);

            return this;
        }
    };

    return Properties;
});

/**
 * This is for filtering the deleted properties.
 * Used for simple and iterable properties.
 */
propertiesModule.filter('displayProperties', function () {
    return function (items, display) {
        return _.filter(items, function(item) {
            return (display ? !item.inModel : _.isUndefined(display) || display || item.inModel);
        });
    };
});

propertiesModule.filter('filterBox', function () {
    return function (boxes_object, searchString) {
        //A box is filtered by its name or its modules names or its children boxes
        var filter_one_box = function(box) {
            //See if the parent box was previously fitered thanks to its name
            if(!_.isUndefined(box.parent_box) && box.parent_box.name_filtered == true){
                //If the parent box was filtered by its name, we want to display the children boxes, just return true
                return true;
            }

            //See if this box can be filtered by its name
            if(box.name.toUpperCase().indexOf(searchString) > -1) {

                //If so, hold a boolean on that box. It will be helpful when the filter will be called by one of the box's children
                box.name_filtered = true;

                return true;
            }

            //We couldn't filter by name so we try to iterate over the modules directly located in that box and filter by their name
            var found_matching_module = false;

            _(box.modules).each(function(module) {
                if(module.name.toUpperCase().indexOf(searchString) > -1) {

                    found_matching_module = true;
                } else {
                    // Search in each instance
                    _(module.instances).each(function(instance) {
                        if (instance.name.toUpperCase().indexOf(searchString) > -1) {
                            found_matching_module = true;
                            module.opened = true;
                        }
                    });
                }
            });

            if(found_matching_module) {
                box.name_filtered = false;
                return true;
            }

            var found_matching_children_box = false;

            _(box.children).each(function(box){
                if(filter_one_box(box)) {
                    box.opened = true;
                    found_matching_children_box = true;
                }
            });

            box.name_filtered = false;

            return found_matching_children_box;
        };

        if (!_.isEmpty(searchString)) {
            searchString = searchString.toUpperCase();

            var picked = _.pick(boxes_object, function(box) {
                box.opened = filter_one_box(box);

                return box.opened;
            });

            return picked;
        } else {
            return boxes_object;
        }
    };
});

propertiesModule.directive('initInstanceFunctions', function () {
    return {
        restrict: 'E',
        replace: true,
        template: "<div></div>",
        scope: false,
        link: function (scope, element, attrs) {
            var setSign = function() {
                scope.treedisplay = scope.ngModel.opened;
                scope.sign = scope.ngModel.opened ? '-' : '+';
            };

            var displayInstanceDetails = function () {
                scope.ngModel.opened = !scope.ngModel.opened;

                setSign();
            };

            scope.$on('quickDisplayInstanceDetails',function(event, data){
                scope.ngModel.opened = true;

                Object.keys(scope.ngModel.children).forEach(function (key) {
                   scope.ngModel.children[key].opened = true;
                });

                setSign();
            });

            scope.$on('quickHideInstanceDetails',function(event, data){
                scope.ngModel.opened = false;

                Object.keys(scope.ngModel.children).forEach(function (key) {
                   scope.ngModel.children[key].opened = false;
                });

                setSign();
            });


            // We can't use isolate scope. We take attribut and parse it.
            if(attrs.ngModel){
                scope.ngModel = scope.$eval(attrs.ngModel);
            }

            scope.displayInstanceDetails = displayInstanceDetails;

            setSign();
        }
    }
});

propertiesModule.directive('initInstances', function () {
    return {
        restrict: 'E',
        replace: true,
        template: "<div></div>",
        link: function (scope, element, attrs) {
            var setSign = function() {
                scope.instancedisplay = scope.ngModel.opened;
                scope.sign = scope.ngModel.opened ? '-' : '+';
            };

            var displayInstances = function () {
                scope.ngModel.opened = !scope.ngModel.opened;

                setSign();
            };

            // We can't use isolate scope. We take attribut and parse it.
            if(attrs.ngModel){
                scope.ngModel = scope.$eval(attrs.ngModel);

                // Watch attribut for filter
                scope.$watch('ngModel.opened', function() {
                    setSign();
                });
            }

            scope.displayInstances = displayInstances;

            setSign();
            if (scope.isInstanceOpen) {
                displayInstances();
                scope.ngModel.opened = true;
            }
        }
    }
});


propertiesModule.filter('orderObjectBy', function() {
    return function(items, field) {
        // items as an object 'children' where key is name
        var filtered = [];

        angular.forEach(items, function(item) {
            filtered.push(item);
        });

        filtered.sort(function (a, b) {
            return a[field].localeCompare(b[field]);
        });

        return filtered;
    };
});


/**
 * This function will filter the iterable properties by values.
 * The filter text and by the simple text or a regex.
 * @see filterIterablePropertiesValues for value filtering
 */
propertiesModule.filter('filterIterablePropertiesNames', function (){
    return function (items, filter){

        if (!filter){
            return items;
        }

        var _name = '.*' + filter.toLowerCase().split(' ').join('.*');
        var regex_name  = undefined;

        try {
            regex_name = new RegExp(_name, 'i');
        }catch (e){
            return items;
        }

        var filtered = [];
        _(items).each (function (item){
            if (regex_name.test(item.name)){
                filtered.push(item);
            }
        });

        return filtered;
    };
});

/**
 * This function will filter the iterable properties by values.
 * The filter text and by the simple text or a regex.
 * @see filterIterablePropertiesNames for name filtering
 */
propertiesModule.filter('filterIterablePropertiesValues', function (){
    return function (items, filter){

        if (!filter){
            return items;
        }

        var _value = '.*' + filter.toLowerCase().split(' ').join('.*');
        var regex_value  = undefined;

        try {
            regex_value = new RegExp(_value, 'i');
        }catch (e){
            return items;
        }

        var filtered = [];
        _(items).each (function (item){
            if (regex_value.test(item.value)){
                filtered.push(item);
            }
        });

        return filtered;
    };
});

/**
 * Function wich filter the properties' display with string or regex.
 * Modified by Sahar CHAILLOU on 12/01/2016
 */
propertiesModule.filter('filterProperties', function() {
    return function(input, filter) {
        if (!filter) {
            return input;
        }

        // Format the filters to construct the regex
        var name = '.*' + filter.name.toLowerCase().split(' ').join('.*');
        var value = '.*' + filter.filtrable_value.toLowerCase().split(' ').join('.*');

        // Create the regex
        try {
            var regex_name = new RegExp(name, 'i');
            var regex_value = new RegExp(value, 'i');
        } catch(e) {
            return input;
        }

        /**
         * Private function for filtering by name.
         */
        var applyNameFilter = function (input) {
            var output = [];

            angular.forEach(input, function(item) {

                if (!_.isEmpty(filter.name)){
                    if (regex_name.test(item.name)){
                        output.push(item);
                    }
                }else{
                    output.push(item);
                }
            });

            return output;
        };

        /**
         * Private function for filtering by value.
         */
        var applyValueFilter = function (input) {
            var output = [];

            angular.forEach(input, function(item) {

                if ( !_.isEmpty(filter.filtrable_value) ) {
                    if (regex_value.test(item.filtrable_value)){
                        output.push(item);
                    }
                }else{
                    output.push(item);
                }
            });

            return output;
        };

        // make the filter
        return applyValueFilter(applyNameFilter(input));

    };
});

/**
 * This directive is for filtering only the unspecified properties.
 * This takes care of the hesperides predefined properties which will not be displayed
 * and then not counted even if they have not values.
 */
propertiesModule.directive('toggleUnspecifiedProperties', function ($filter) {
    return {
        restrict: 'E',
        scope: {
            keyValueProperties: '=',
            toggle: '='
        },
        template: '<md-switch id="toggle-unspecified-properties_switch" class="md-primary md-block" ' +
                  'ng-model="toggle"' +
                  'ng-init="toggle=false" ' +
                  'ng-disabled="(getNumberOfUnspecifiedProperties(keyValueProperties) <= 0)" ' +
                  'aria-label="{{ \'properties.unspecifiedValues.switch\' | translate }}">' +
                  '{{ \'properties.unspecifiedValues.switch\' | translate }} ({{ getNumberOfUnspecifiedProperties(keyValueProperties) }})' +
                  '</md-switch>',
        controller: ['$scope', '$filter', function ($scope, $filter){
            /**
             * This calculate the number of unspecified properties.
             */
            $scope.getNumberOfUnspecifiedProperties = function (tab) {
                var count = 0;

                tab = $filter('hideHesperidesPredefinedProperties')(tab, true);

                if (tab) {
                    for (var index = 0; index < tab.length; index++) {
                        // if default value is present, so the prop is not counted as unspecified
                        if ((!tab[index].filtrable_value && _.isEmpty(tab[index].defaultValue))|| (_.isEmpty(tab[index].value) && _.isEmpty(tab[index].defaultValue))) {
                            count++;
                        }
                    }
                }

                if (count == 0) {
                    $scope.toggle = false;
                }
                return count;
            };
        }]
    }
});

/**
 * This directive is for sorting the properties list in asc and desc order of properties name
 * This is shared between all properties display :
        Global Properties, Simple Properties, Iterable Properties and Instance Properties.
 */
propertiesModule.directive('toggleSortProperties', function (){
    return {
        restrict : 'E',
        scope: {
            sortOrder: "="
        },
        templateUrl: '/shared/toggle-sort-properties.html',
        controller: ['$scope', function ($scope){
            /**
             * Inverse the sort order
             */
            $scope.switchOrder = function (){
               $scope.sortOrder = !$scope.sortOrder;
            }
        }]
    }
});

/**
 * Display only the 'empty' properties
 */
propertiesModule.filter('displayUnspecifiedProperties', function () {
    return function (items, display) {
        return _.filter(items, function(item) {
            return _.isUndefined(display) || !display || !item.filtrable_value && _.isEmpty(item.defaultValue) || _.isEmpty(item.defaultValue) && _.isEmpty(item.value);
        });
    };
});

/**
 * This is used to filter the 'hesperides predefined properties'.
 * Definition of terms:
 *  'Hesperides predefined properties' are the properties whith are provided by the hesperides system.
 *  They always start by "hesperides.".
 *  Example :
 *      - hesperides.application.name : is the name of the current application.
 *      - hesperides.instance.name : is the name of the current instance
 */
propertiesModule.filter('hideHesperidesPredefinedProperties', function () {
    return function (items) {
        return _.filter(items, function(item) {
            return !item.name.startsWith("hesperides.");
        });
    };
});

propertiesModule.filter('orderObjectBy', function() {
  return function(items, field) {
    var filtered = [];
    angular.forEach(items, function(item) {
      filtered.push(item);
    });
    filtered.sort(function (a, b) {
      return (a[field] > b[field] ? 1 : -1);
    });
    return filtered;
  };
});
