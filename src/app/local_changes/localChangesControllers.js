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

var localChangesModule = angular.module('hesperides.localChanges');


// Why United Nations ? They are solving conflicts, rights ? :D
localChangesModule.controller('UnitedNationsController', ['$scope', 'Comments', 'ApplicationService', 'LocalChanges', 'LocalChangesUtils', 'ModuleService', '$mdDialog', '$translate',
                                function($scope, Comments, ApplicationService, LocalChanges, LocalChangesUtils, ModuleService, $mdDialog, $translate) {

    $scope.comments = new Comments();
    $scope.localChanges = [];

    $scope.sync_search_text = function (selected_comment, raw_comment) {
        raw_comment = selected_comment && selected_comment.length > 0 ? selected_comment.comment : raw_comment;
    }

    $scope.save_properties = function () {

        if ($scope.properties_to_save.length > 0) {

            var properties = $scope.properties_to_save.pop();

            _.forEach(properties.properties, function (property) { property.value = property.applied_value != undefined ? property.applied_value : property.value ;});
            properties.model.key_value_properties = angular.copy(properties.properties);

            if (_.some(properties.model.key_value_properties, property => property.filtrable_value && property.value != property.filtrable_value)) {
                ApplicationService.save_properties($scope.platform.application_name, $scope.platform, properties.model, properties.module.properties_path, properties.comment ).then(function (new_properties) {
                    // Removing local changes sinces they have been saved
                    LocalChanges.clearLocalChanges({'application_name': $scope.platform.application_name, 'platform': $scope.platform.name, 'properties_path': properties.module.properties_path});
                    $scope.clear_localChanges_from_scope(properties.module.properties_path);
                    // Increase platform number
                    $scope.platform.version_id = $scope.platform.version_id + 1;
                    // Recursive call to empty '$scope.properties_to_save' stack
                    $scope.save_properties();
                }).catch(function () {$scope.save_properties();});
            } else {
                LocalChanges.clearLocalChanges({'application_name': $scope.platform.application_name, 'platform': $scope.platform.name, 'properties_path': properties.module.properties_path});
                $scope.clear_localChanges_from_scope(properties.module.properties_path);
                $translate('properties-not-changed.message').then(function(label) {
                    $.notify(label + "\n-> " + properties.module.properties_path , "warn");
                });
                // Recursive call to empty '$scope.properties_to_save' stack
                $scope.save_properties();
            }
        } else {
            $scope.smart_exit_united_nation_popup();
        }
    }

    $scope.saveAllChanges = function () {

        _.forEach($scope.localChanges, function (localChange) { localChange.comment = $scope.raw_comment ;});

        $scope.properties_to_save = angular.copy( $scope.localChanges )

        $scope.comments.addComment($scope.platform.application_name, $scope.raw_comment)
        $scope.raw_comment = '';

        $scope.save_properties();
    }

    $scope.smart_exit_united_nation_popup = function () {
        if (LocalChanges.platformLocalChanges($scope.platform).length == 0) {
            $mdDialog.hide($scope.modal);
        }
    }

    $scope.clear_localChanges_from_scope = function(properties_path) {
        $scope.localChanges = _.filter($scope.localChanges ,  (localChange) => localChange.module.properties_path != properties_path);
    }

    $scope.save_one = function (properties) {

        _.forEach(properties.properties, function (property) { property.value = property.applied_value != undefined ? property.applied_value : property.value ;});
        properties.model.key_value_properties = angular.copy(properties.properties);

        if (_.some(properties.model.key_value_properties, property => property.filtrable_value && property.value != property.filtrable_value)) {
            ApplicationService.save_properties($scope.platform.application_name, $scope.platform, properties.model, properties.module.properties_path, properties.raw_comment).then(function (new_properties) {
                // Removing local changes sinces they have been saved
                LocalChanges.clearLocalChanges({'application_name': $scope.platform.application_name, 'platform': $scope.platform.name, 'properties_path': properties.module.properties_path});
                $scope.clear_localChanges_from_scope(properties.module.properties_path);
                // Increase platform number
                $scope.platform.version_id = $scope.platform.version_id + 1;
                $scope.smart_exit_united_nation_popup(properties);
            });
        } else {
            // Removing local changes since they already are identical with the remote value
            LocalChanges.clearLocalChanges({'application_name': $scope.platform.application_name, 'platform': $scope.platform.name, 'properties_path': properties.module.properties_path});
            $scope.clear_localChanges_from_scope(properties.module.properties_path);
            $translate('properties-not-changed.message').then(function(label) {
                $.notify(label + "\n-> " + properties.module.properties_path , "warn");
            });
            $scope.smart_exit_united_nation_popup(properties);
        }
    }

    $scope.loadLocalChanges = function (platform) {

        ApplicationService.get_platform(platform.application_name, platform.name).then(function (response) {
            platform.version_id = response.version_id;
        });
        _.forEach(LocalChanges.platformLocalChanges(platform), function (full_path) {

            var curApplicationName = LocalChangesUtils.extractApplicationName(full_path);
            var curPlatformName = LocalChangesUtils.extractPlatformName(full_path);
            var curPropertiesPath = LocalChangesUtils.extractPropertiesPath(full_path);

            ApplicationService.get_properties(curApplicationName, curPlatformName, curPropertiesPath).then(function (properties) {

                var module = _.filter(platform.modules, function (module) { return module.properties_path === curPropertiesPath;})[0];

                ModuleService.get_model(module).then(function (model) {
                    var tmpProperties = properties.mergeWithModel(model);

                    //Merge with global properties
                    tmpProperties = properties.mergeWithGlobalProperties(platform.global_properties);
                    model.iterable_properties = angular.copy(tmpProperties.iterable_properties);

                    if (LocalChanges.smartClearLocalChanges({'application_name': $scope.platform.application_name, 'platform': $scope.platform.name, 'properties_path': module.properties_path}, tmpProperties)) {
                        $translate('localChange.deleted.smart').then(function(label) {
                            $.notify(label + "\n-> " + module.properties_path , {"className": "warn", "autoHideDelay": 12000});
                        });
                        $scope.smart_exit_united_nation_popup();
                    }

                    if (LocalChanges.hasLocalChanges(curApplicationName, curPlatformName, curPropertiesPath))
                    {
                        tmpProperties = LocalChanges.mergeWithLocalProperties(curApplicationName, curPlatformName, curPropertiesPath, tmpProperties);
                        $scope.localChanges.push({
                            'properties': tmpProperties.key_value_properties,
                            'model': model,
                            'module': module
                        })
                    }
                });
            });
        });
    }

    $scope.open = function (index) {
        if ( index === $scope.isOpen ) {
            $scope.isOpen = undefined;
        } else {
            $scope.isOpen = index;
        }
    }

    $scope.getConflict = function (properties) {
        return _.filter(properties, function (property) { return property.inLocal == true; });
    }
}]);