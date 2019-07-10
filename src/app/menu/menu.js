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
angular.module('hesperides.menu', [ 'hesperides.techno', 'hesperides.application', 'hesperides.file', 'hesperides.event', 'hesperides.properties' ])

    .controller('MenuTechnoController', function ($scope, $mdDialog, $mdMenu, $location, $timeout, TechnoService) {
        $scope.find_technos_by_name = function (name) {
            return TechnoService.with_name_like(name);
        };

        $scope.open_create_techno_dialog = function () {
            $mdDialog.show({
                templateUrl: 'menu/techno-menu-modal.html',
                controller: 'MenuTechnoController',
                clickOutsideToClose: true,
                preserveScope: true, // requiered for not freez menu see https://github.com/angular/material/issues/5041
                scope: $scope,
            });
        };

        $scope.open_create_techno_from_dialog = function () {
            $mdDialog.show({
                templateUrl: 'menu/techno-menu-modal-from.html',
                controller: 'MenuTechnoController',
                clickOutsideToClose: true,
                preserveScope: true, // requiered for not freez menu
                // Remove scope cause else with autocomplete, window is closed
                // scope:$scope
            });
        };

        $scope.create_techno_from = function (name, version, fromName, fromVersion, isFromWorkingCopy) {
            TechnoService.create_workingcopy(name, version, fromName, fromVersion, isFromWorkingCopy).then(function () {
                $scope.open_techno_page(name, version, true);
            });
        };

        $scope.open_techno_page = function (name, version, is_working_copy) {
            if (is_working_copy) {
                $location.path(`/techno/${ name }/${ version }`).search({ type: 'workingcopy' });
            } else {
                $location.path(`/techno/${ name }/${ version }`).search({});
            }
            $scope.technoSearched = '';
            $mdMenu.cancel(); // dans le cas où on est appelé par l'autocomplete de menu.html
            $scope.closeTechnoDialog(); // dans le cas où on est appelé par techno-menu-modal*.html
        };

        $scope.closeTechnoDialog = function () {
            $mdDialog.cancel();
        };
    })

    .controller('MenuModuleController', function ($scope, $mdDialog, $mdMenu, $location, $timeout, ModuleService, Module) {
        $scope.find_modules_by_name = function (name) {
            return ModuleService.with_name_like(name);
        };

        $scope.create_module = function (name, version) {
            var module = new Module({ name, version });
            ModuleService.save(module).then(function (mod) {
                $scope.closeModuleDialog();
                $scope.open_module_page(mod.name, mod.version, mod.is_working_copy);
            });
        };

        $scope.create_module_from = function (name, version, moduleFrom) {
            ModuleService.create_workingcopy_from(name, version, moduleFrom).then(function () {
                $scope.closeModuleDialog();
                $scope.open_module_page(name, version, true);
            });
        };

        $scope.open_module_page = function (name, version, is_working_copy) {
            $location.path(`/module/${ name }/${ version }`).search({});
            if (is_working_copy) {
                $location.search({ type: 'workingcopy' });
            }
            $scope.moduleSearched = '';
            $mdMenu.cancel();
        };

        $scope.open_create_module_dialog = function () {
            $mdDialog.show({
                templateUrl: 'menu/module-menu-modal.html',
                controller: 'MenuModuleController',
                clickOutsideToClose: true,
                preserveScope: true, // requiered for not freez menu
                scope: $scope,
            });
        };

        $scope.open_create_module_from_dialog = function () {
            $mdDialog.show({
                templateUrl: 'menu/module-menu-modal-from.html',
                controller: 'MenuModuleController',
                clickOutsideToClose: true,
                preserveScope: true, // requiered for not freez menu
                // Remove scope cause else with autocomplete, window is closed
                // scope:$scope
            });
        };

        $scope.closeModuleDialog = function () {
            $mdDialog.cancel();
        };
    })

    .controller('MenuPropertiesController', function ($http, $scope, $mdDialog, $mdMenu, $location, $timeout, ApplicationService, Platform, notify, UserService) {
        $scope.find_applications_by_name = function (name) {
            return ApplicationService.with_name_like(name);
        };

        $scope.find_platforms_of_application = function (application_name, filter_env) {
            return ApplicationService.get_platform_name_of_application(application_name, filter_env.toLowerCase());
        };

        $scope.open_properties_page = function (application_name, platform_name) {
            $location.path(`/properties/${ application_name }`);
            if (platform_name) {
                $location.search({ platform: platform_name });
            } else {
                $location.search({});
            }
            $scope.applicationSearched = '';
            $mdMenu.cancel();
        };

        $scope.create_platform = function (application_name, platform_name, production, application_version) {
            var platform = new Platform({
                name: platform_name,
                application_name,
                application_version,
                production: production || false,
            });
            ApplicationService.save_platform(platform).then((ptf) => {
                $mdDialog.cancel();
                $scope.open_properties_page(ptf.application_name, ptf.platform_name);
            });
        };

        $scope.create_platform_from = function (application_name, platform_name, production, application_version, from_application, from_platform, copyInstancesAndProperties) {
            if ($scope.new_platform_already_exist && $scope.new_platform.override_existing) {
                ApplicationService.delete_platform(application_name, platform_name);
            }
            var platform = new Platform({ name: platform_name, application_name, application_version, production });
            ApplicationService.create_platform_from(platform, from_application, from_platform, copyInstancesAndProperties || false)
                .then((ptf) => {
                    $mdDialog.cancel();
                    $scope.open_properties_page(ptf.application_name, ptf.name);
                })
                .catch(function (error) {
                    notify({
                        classes: [ 'error' ],
                        message: (error.data && error.data.message) || error.data || 'Unknown API error in MenuPropertiesController.create_platform_from',
                    });
                    throw error;
                });
        };

        $scope.open_create_platform_dialog = function () {
            $scope.user = {};
            UserService.authenticate().then(function (user) {
                $scope.user = user;
            });

            $mdDialog.show({
                templateUrl: 'menu/platform-menu-modal.html',
                controller: 'MenuPropertiesController',
                clickOutsideToClose: true,
                preserveScope: true, // requiered for not freez menu
                scope: $scope,
            });
        };

        $scope.open_create_platform_from_dialog = function () {
            var modalScope = $scope.$new(true);

            modalScope.applicationSearched = '';
            modalScope.user = {};
            UserService.authenticate().then(function (user) {
                modalScope.user = user;
            });

            $mdDialog.show({
                templateUrl: 'menu/platform-menu-modal-from.html',
                controller: 'MenuPropertiesController',
                clickOutsideToClose: true,
                preserveScope: true, // requiered for not freez menu
                scope: modalScope,
            });
        };

        $scope.new_platform_already_exist = false;

        $scope.check_new_platform_already_exist = function () {
            return ApplicationService.get_platform_name_of_application($scope.new_platform.application_name ? $scope.new_platform.application_name.toLowerCase() : '',
                $scope.new_platform.platform_name ? $scope.new_platform.platform_name.toLowerCase() : '', false).then(function (response) {
                if (_.some(response, { 'name': $scope.new_platform.platform_name })) {
                    ApplicationService.get_platform($scope.new_platform.application_name, $scope.new_platform.platform_name, null, true).then(function () {
                        $scope.new_platform_already_exist = true;
                    }, function () {
                        $scope.new_platform_already_exist = false;
                    });
                } else {
                    $scope.new_platform_already_exist = false;
                }
            });
        };

        $scope.closePlatformDialog = function () {
            $mdDialog.cancel();
        };
    })

    .directive('disableEditing', function () {
        return {
            link(scope, element) {
                element.on('cut copy paste keypress', function (event) {
                    event.preventDefault();
                });
            },
        };
    })

    .controller('MenuHelpController', function ($scope, $mdDialog, $http, $translate, $parse, $window, ApplicationService, PlatformColorService, UserService, notify) {
        $scope.supportUrl = SUPPORT_URL;
        $scope.swaggerLink = SWAGGER_LINK;
        $scope.logout = UserService.logout;

        $scope.change_language = function (langKey) {
            $translate.use(langKey);
            store.set('language', langKey || null);
        };

        // Refactoring TO DO
        $scope.find_applications_by_name = function (name) {
            return ApplicationService.with_name_like(name).then(function (apps) {
                // Already loved apps shouldn't be displayed
                return _.filter(apps, function (item) {
                    return !_.some($scope.applications, function (love) {
                        return love === item.name;
                    });
                });
            });
        };

        $scope.display_hesperides_documentation = function () {
            $window.open(DOCUMENTATION_LINK);
        };

        $scope.display_swagger = function () {
            $window.open($scope.swaggerLink);
        };

        $scope.display_hesperides_informations = function () {
            $scope.frontInfo = { BUILD_TIME, GIT_BRANCH, GIT_COMMIT, GIT_TAG };

            // Get the backend versions
            $http.get('rest/versions').then(function (response) {
                $scope.apiInfo = response.data;
            }, function (errorResp) {
                var errorMsg = (errorResp.data && errorResp.data.message) || errorResp.data || 'Unknown API error in UserService.authenticate';
                notify({ classes: [ 'error' ], message: errorMsg });
                throw new Error(errorMsg);
            });

            $mdDialog.show({
                templateUrl: 'menu/help-menu-modal.html',
                controller: 'MenuHelpController',
                clickOutsideToClose: true,
                preserveScope: true, // requiered for not freez menu
                scope: $scope,
            });
        };

        $scope.closeAboutDialog = function () {
            $mdDialog.cancel();
        };

        $scope.closeSettingsDialog = function () {
            $mdDialog.cancel();
        };

        /**
         * That is the user settings modal.
         * It's used to customize user relative settings on hesperides.
         *
         * Added by Sahar CHAILLOU
         */
        $scope.display_settings = function () {
            $scope.settings_unfoldInstancesByDefault = store.get('unfoldInstancesByDefault');
            $scope.settings_copy = store.get('copy_properties');
            $scope.settings_color = store.get('color_active');
            $scope.settings_display = store.get('display_mode');
            $scope.settings_language = store.get('language');
            $scope.items = [ { name: 'USN1' }, { name: 'INT1' }, { name: 'REC1' } ];
            $scope.applications = [];
            if (store.get('applications')) {
                $scope.applications = store.get('applications');
            }
            $scope.color = {
                red: store.get('color_red') || 220,
                green: store.get('color_green') || 200,
                blue: store.get('color_blue') || 220,
            };

            $scope.backgroundColor = function (item) {
                return PlatformColorService.calculateColor(item.name, $scope.color);
            };

            $scope.addApplication = function (application) {
                if (!_.includes($scope.applications, application.name)) {
                    $scope.applications.push(application.name);
                }
            };

            $scope.removeApplication = function () {
                var index = $scope.applications.indexOf($scope.app);
                $scope.applications.splice(index - 1, 1);
            };

            $scope.saveSettings = function () {
                store.set('display_mode', $scope.settings_display || null);
                store.set('language', $scope.settings_language || null);
                store.set('unfoldInstancesByDefault', $scope.settings_unfoldInstancesByDefault || null);
                store.set('copy_properties', $scope.settings_copy || null);
                store.set('color_active', $scope.settings_color || null);
                store.set('color_red', $scope.color.red || null);
                store.set('color_green', $scope.color.green || null);
                store.set('color_blue', $scope.color.blue || null);
                store.set('applications', $scope.applications || null);
                location.reload();
                $mdDialog.cancel();
            };
            $mdDialog.show({
                templateUrl: 'menu/settings-modal.html',
                controller: 'MenuHelpController',
                clickOutsideToClose: true,
                preserveScope: true, // requiered for not freez menu
                scope: $scope,
            });
        };
    });
