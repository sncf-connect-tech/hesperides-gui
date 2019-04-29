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
var menuModule = angular.module('hesperides.menu', ['hesperides.techno', 'hesperides.application', 'hesperides.file', 'hesperides.event', 'hesperides.properties']);

menuModule.controller('MenuTechnoCtrl', ['$scope', '$mdDialog', '$location', '$timeout', 'TechnoService', function ($scope, $mdDialog, $location, $timeout, TechnoService) {

    $scope.closeDialog = function() {
        $mdDialog.cancel();
    };

    $scope.find_technos_by_name = function (name) {
        return TechnoService.with_name_like(name);
    };

    $scope.open_create_techno_dialog = function () {
        $mdDialog.show({
            templateUrl: 'techno/techno-menu-modal.html',
            controller: 'MenuTechnoCtrl',
            clickOutsideToClose:true,
            preserveScope: true, // requiered for not freez menu see https://github.com/angular/material/issues/5041
            scope:$scope
        });
    };

    $scope.open_create_techno_from_dialog = function () {
        $mdDialog.show({
            templateUrl: 'techno/techno-menu-modal-from.html',
            controller: 'MenuTechnoCtrl',
            clickOutsideToClose:true,
            preserveScope: true // requiered for not freez menu
            // Remove scope cause else with autocomplete, window is closed
            //scope:$scope
        });
    };

    $scope.create_techno_from = function (name, version, fromName, fromVersion, isFromWorkingCopy) {
        TechnoService.create_workingcopy(name, version, fromName, fromVersion, isFromWorkingCopy).then(function(){
            $scope.open_techno_page(name, version, true);
        });
    };

    $scope.open_techno_page = function (name, version, is_working_copy, fakeButton) {
        if(is_working_copy) {
            $location.path('/techno/' + name + '/' + version).search({type : "workingcopy"});
        } else {
            $location.path('/techno/' + name + '/' + version).search({});
        }
        $scope.technoSearched = "";
        $mdDialog.cancel();

        // Very bad trick to close menu :-(
        if (fakeButton) {
            $timeout(function() {
                $(fakeButton).click();
            }, 0);
        }
    }

}]);

menuModule.controller('MenuModuleCtrl', ['$scope', '$mdDialog', '$location', '$timeout', 'ModuleService', 'Module',  function ($scope, $mdDialog, $location, $timeout, ModuleService, Module) {

    $scope.closeDialog = function() {
        $mdDialog.cancel();
    };

    $scope.selectedItemChange = function(item) {
        $log.info('Item changed to ' + JSON.stringify(item));
    }

    $scope.find_modules_by_name = function (name) {
        return ModuleService.with_name_like(name);
    };

    $scope.create_module = function(name, version){
        var module = new Module({name: name, version: version});
        ModuleService.save(module).then(function(module){
            $scope.open_module_page(module.name, module.version, module.is_working_copy);
        });
    };

    $scope.create_module_from = function (name, version, moduleFrom) {
        ModuleService.create_workingcopy_from(name, version, moduleFrom).then(function(){
            $scope.open_module_page(name, version, true);
            $mdDialog.cancel();
        });
    };

    $scope.open_module_page = function (name, version, is_working_copy, fakeButton) {
        if(is_working_copy){
            $location.path('/module/' + name + '/' + version).search({type : "workingcopy"});
        } else {
            $location.path('/module/' + name + '/' + version).search({});
        }
        $scope.moduleSearched = "";
        $mdDialog.cancel();

        // Very bad trick to close menu :-(
        if (fakeButton) {
            $timeout(function() {
                $(fakeButton).click();
            }, 0);
        }
    };

    $scope.open_create_module_dialog = function () {
        $mdDialog.show({
            templateUrl: 'module/module-menu-modal.html',
            controller: 'MenuModuleCtrl',
            clickOutsideToClose:true,
            preserveScope: true, // requiered for not freez menu
            scope:$scope
        });
    };

    $scope.open_create_module_from_dialog = function () {
        $mdDialog.show({
            templateUrl: 'module/module-menu-modal-from.html',
            controller: 'MenuModuleCtrl',
            clickOutsideToClose:true,
            preserveScope: true // requiered for not freez menu
            // Remove scope cause else with autocomplete, window is closed
            //scope:$scope
        });
    };


}]);


menuModule.controller('MenuPropertiesCtrl', ['$hesperidesHttp', '$scope', '$mdDialog', '$location', '$timeout', 'ApplicationService', 'Platform', function ($http, $scope, $mdDialog, $location, $timeout, ApplicationService, Platform) {

    $scope.closeDialog = function() {
        $mdDialog.cancel();
    };

    var properties;
    var apps;

    ApplicationService.list_applications().then(function (response) {
        apps = response.map(function (elem) { return elem.name })
    });

    $scope.find_applications_by_name = function (name) {
        return ApplicationService.with_name_like(name);
    };

    $scope.find_platforms_of_application = function (application_name, filter_env) {
        return ApplicationService.get_platform_name_of_application(application_name, filter_env.toLowerCase());
    };

    $scope.open_properties_page = function (application_name, platform_name, fakeButton, forceOpenEvenIfAppUnknown) {
        if (!forceOpenEvenIfAppUnknown && apps.indexOf(application_name) == -1) {
            return;
        }

        var path = '/properties/' + application_name;
        $scope.applicationSearched = "";
        $mdDialog.cancel();
        $location.path(path).search({platform: platform_name})
    };

    $scope.create_platform = function(application_name, platform_name, production, application_version){
        var platform = new Platform({name: platform_name, application_name: application_name, application_version: application_version, production: production || false});
        ApplicationService.save_platform(platform).then((platform) =>
            $scope.open_properties_page(platform.application_name, platform.platform_name)
        );
    };

    /**
     * Create a new platform from existing platform by copying all the characteristics.
     * This function presents two options to the user: copying the instances or not.
     * Modified by Sahar CHAILLOU on 25/01/2016.
    */
    $scope.create_platform_from = function(application_name, platform_name, production, application_version, from_application, from_platform, copyInstances){
        var platform;

        if ($scope.new_platform_already_exist && $scope.new_platform.override_existing) {
            ApplicationService.delete_platform(application_name, platform_name);
        }

        if (copyInstances) {
            // Clone the platform
            platform = new Platform({name: platform_name, application_name: application_name, application_version: application_version, production: production});
            ApplicationService.create_platform_from(platform, from_application, from_platform).then((platform) =>
                $scope.open_properties_page(platform.application_name, platform.name)
            );


        } else {
            //Get the existing platform
            $http.get('rest/applications/' + encodeURIComponent(from_application) + '/platforms/'+ encodeURIComponent(from_platform)).then(function (response) {
                // Create a new platform from the get's response and change the main properties with the target values
                platform = new Platform(response.data);
                platform.name = platform_name;
                platform.application_name = application_name;
                platform.production = production;
                platform.application_version = application_version;
                platform.version_id = -1;

                //Empty the instances for each module (we don't want to copy the instances)
                _.each(platform.modules, (module) => module.delete_instances() );

                // Saving the platform as a creation
                ApplicationService.save_platform(platform, true);
                platform.version_id = 0;

                // Save the properties for each module
                _.each(platform.modules, function (module) {
                    var module_type;

                    //Get the module's type
                    if(module.is_working_copy){
                        module_type = 'WORKINGCOPY';
                    }else{
                        module_type = 'RELEASE';
                    }

                    // Instantiate the properties path
                    var path = module.path + '#'+module.name + '#' + module.version + '#' + module_type;

                    // Get the properties from the existing platform
                    ApplicationService.get_properties(from_application, from_platform, path).then(function (properties) {
                        properties = properties.to_rest_entity();
                        // Save the properties for the new platform
                        $http.post('rest/applications/' + encodeURIComponent(platform.application_name) + '/platforms/' + encodeURIComponent(platform.name) + '/properties?path=' + encodeURIComponent(path) + '&platform_vid=' + encodeURIComponent(platform.version_id), properties);
                    });

                });

                $scope.open_properties_page(platform.application_name, platform.name);
            }, function (error) {
                $.notify((error.data && error.data.message) || error.data || 'Unknown API error in MenuPropertiesCtrl.create_platform_from', "error");
                throw error;
            })
        }
    };

    $scope.open_create_platform_dialog = function () {

        /**
         * This function will determine if the authenticated user
         * is a production user or not.
         * See user.js for more details about : HesperidesAuthenticator
         */
         $scope.isProductionUser = function (){
            return !_.isUndefined(hesperidesUser) ? hesperidesUser.isProdUser : false;
         };

        $mdDialog.show({
            templateUrl: 'properties/platform-menu-modal.html',
            controller: 'MenuPropertiesCtrl',
            clickOutsideToClose:true,
            preserveScope: true, // requiered for not freez menu
            scope:$scope
        });
    };

    $scope.open_create_platform_from_dialog = function () {
        var modalScope = $scope.$new(true);

        modalScope.applicationSearched = "";

        modalScope.isProductionUser = function (){
            return !_.isUndefined(hesperidesUser) ? hesperidesUser.isProdUser : false;
        };

        $mdDialog.show({
            templateUrl: 'properties/platform-menu-modal-from.html',
            controller: 'MenuPropertiesCtrl',
            clickOutsideToClose:true,
            preserveScope: true, // requiered for not freez menu
            scope:modalScope
        });
    };

    $scope.new_platform_already_exist = false;

    $scope.check_new_platform_already_exist = function () {
       return ApplicationService.get_platform_name_of_application($scope.new_platform.application_name ? $scope.new_platform.application_name.toLowerCase() : '',
                                                                  $scope.new_platform.platform_name ? $scope.new_platform.platform_name.toLowerCase() : '', false).then(function (response) {

            if (_.some(response, {"name" :  $scope.new_platform.platform_name})) {
                ApplicationService.get_platform($scope.new_platform.application_name, $scope.new_platform.platform_name, undefined, true).then(function () {
                    $scope.new_platform_already_exist = true;
                }, function () {
                    $scope.new_platform_already_exist = false;
                });
            } else {
                $scope.new_platform_already_exist = false;
            }
        });
    }

}]);

menuModule.directive('disableEditing', function(){
   return {
       link:function(scope, element){
           element.on('cut copy paste keypress', function (event) {
             event.preventDefault();
           });
       }
   };
});

menuModule.controller('MenuHelpCtrl', ['$scope', '$mdDialog', '$hesperidesHttp', 'hesperidesGlobals', '$translate', 'PlatformColorService', '$parse', 'ApplicationService', function($scope, $mdDialog, $http, hesperidesGlobals, $translate, PlatformColorService, $parse, ApplicationService){
    $scope.config = hesperidesConfiguration;

    $scope.closeDialog = function() {
        $mdDialog.cancel();
    };

    $scope.change_language = function(langKey) {
        $translate.use(langKey);

        if( langKey == "en" ){
            $.getScript("bower_components/angular-i18n/en-us.js");
        }
        else {
            $.getScript("bower_components/angular-i18n/fr-fr.js");
        }
        store.set('language',langKey);
    };

     //Refactoring TO DO
     $scope.find_applications_by_name = function (name) {
        return ApplicationService.with_name_like(name).then(function (apps){
            // Already loved apps shouldn't be displayed
            return _.filter(apps, function (item){
                return !_.some($scope.applications, function (love){
                    return love === item.name
                })
            });
        });
     };

     $scope.display_hesperides_documentation = function() {
         window.open(hesperidesConfiguration.documentationLink);
     };

    $scope.display_hesperides_informations = function(){

        $scope.front_build_time = BUILD_TIME || 'unknown';
        $scope.release = hesperidesGlobals.versionName;

        //Get the backend versions
        $http.get('rest/versions').then(function(response){
            $scope.api_version = response.data.version || response.data.api_version || 'unknown';
            $scope.api_build_time = response.data.build_time || 'unknown';
        }, function (error) {
            throw error;
        });

        $mdDialog.show({
            templateUrl: 'hesperides/help-menu-modal.html',
            controller: 'MenuHelpCtrl',
            clickOutsideToClose:true,
            preserveScope: true, // requiered for not freez menu
            scope:$scope
        });

    };

    /**
     * That is the user settings modal.
     * It's used to customize user relative settings on hesperides.
     *
     * Added by Sahar CHAILLOU
     */
    $scope.display_settings = function(){
        $scope.settings_instance = store.get('instance_properties');
        $scope.settings_copy = store.get('copy_properties');
        $scope.settings_color = store.get('color_active');
        $scope.settings_display = store.get('display_mode');
        $scope.settings_language = store.get('language');
        $scope.items = [{name:'USN1'}, {name:'INT1'}, {name:'REC1'}];
        if(!store.get('applications')){
            $scope.applications = [];
        }else {
            $scope.applications = store.get('applications');
        }
        $scope.color = {};
        if(!store.get('color_red')){
            $scope.color.red = 220;
        }else{
            $scope.color.red = store.get('color_red');
        }
        if(!store.get('color_green')){
             $scope.color.green = 220;
        }else{
             $scope.color.green = store.get('color_green');
        }
        if(!store.get('color_blue')){
             $scope.color.blue = 220;
        }else{
             $scope.color.blue = store.get('color_blue');
        }

        $scope.backgroundColor = function(item) {
            return PlatformColorService.calculateColor(item.name, $scope.color);
        }

        $scope.addApplication = function(application) {
           if($scope.applications.indexOf(application.name) == -1){
                $scope.applications.push(application.name);
           }
        }

        $scope.removeApplication = function() {
               var index = $scope.applications.indexOf($scope.app);
               $scope.applications.splice(index-1, 1);
        }

        $scope.saveSettings = function() {
               store.set('display_mode',$scope.settings_display);
               store.set('language',$scope.settings_language);
               store.set('instance_properties',$scope.settings_instance);
               store.set('copy_properties',$scope.settings_copy);
               store.set('color_active',$scope.settings_color);
               store.set('color_red',$scope.color.red);
               store.set('color_green',$scope.color.green);
               store.set('color_blue',$scope.color.blue);
               store.set('applications',$scope.applications);
               location.reload();
               $mdDialog.cancel();
        }
        $mdDialog.show({
            templateUrl: 'hesperides/settings-modal.html',
            controller: 'MenuHelpCtrl',
            clickOutsideToClose:true,
            preserveScope: true, // requiered for not freez menu
            scope:$scope
        });

    };

    $scope.display_swagger = function() {
        window.open(hesperidesConfiguration.swaggerLink);
    }

}]);