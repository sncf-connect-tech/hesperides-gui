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
localChangesModule.controller('UnitedNationsController', ['$scope', 'Comments', 'ApplicationService', 'LocalChanges', 'LocalChangesUtils', 'ModuleService', '$mdDialog',
                                function($scope, Comments, ApplicationService, LocalChanges, LocalChangesUtils, ModuleService, $mdDialog) {

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

            ApplicationService.save_properties($scope.platform.application_name, $scope.platform, properties.model, properties.module.properties_path, properties.comment ).then(function (new_properties) {
                // Removing local changes sinces they have been saved
                LocalChanges.clearLocalChanges({'application_name': $scope.platform.application_name, 'platform': $scope.platform.name, 'properties_path': properties.module.properties_path});
                // Increase platform number
                $scope.platform.version_id = $scope.platform.version_id + 1;
                // Recursive call to empty '$scope.properties_to_save' stack
                $scope.save_properties();
            });
        } else {
            $mdDialog.hide($scope.modal);
        }
    }

    $scope.saveAllChanges = function () {

        _.forEach($scope.localChanges, function (localChange) { localChange.comment = $scope.raw_comment ;});

        $scope.properties_to_save = angular.copy( $scope.localChanges )

        $scope.comments.addComment($scope.platform.application_name, $scope.raw_comment)
        $scope.raw_comment = '';

        $scope.save_properties();

    }

    $scope.save_one = function (properties) {

        _.forEach(properties.properties, function (property) { property.value = property.applied_value != undefined ? property.applied_value : property.value ;});
        properties.model.key_value_properties = angular.copy(properties.properties);

        ApplicationService.save_properties($scope.platform.application_name, $scope.platform, properties.model, properties.module.properties_path, properties.comment ).then(function (new_properties) {
            // Removing local changes sinces they have been saved
            LocalChanges.clearLocalChanges({'application_name': $scope.platform.application_name, 'platform': $scope.platform.name, 'properties_path': properties.module.properties_path});
            // Increase platform number
            $scope.platform.version_id = $scope.platform.version_id + 1;

            $scope.localChanges = _.filter($scope.localChanges , function (localChange) { return localChange.module.properties_path != properties.module.properties_path;});

            if ($scope.localChanges.length == 0) {
                $mdDialog.hide($scope.modal);
            }

        });
    }

    $scope.loadLocalChanges = function (platform) {

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

                    tmpProperties = LocalChanges.mergeWithLocalProperties(curApplicationName, curPlatformName, curPropertiesPath, tmpProperties);
                    $scope.localChanges.push({
                        'properties': tmpProperties.key_value_properties,
                        'model': model,
                        'module': module
                    })
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