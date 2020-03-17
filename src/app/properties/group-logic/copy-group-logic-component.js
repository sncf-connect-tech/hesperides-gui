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

angular.module('hesperides.properties.logicGroup', [ 'hesperides.properties', 'cgNotify', 'hesperides.localChanges' ])
    .component('logicGroupComponent', {
        templateUrl: 'copy-group-logic-modal.html',
        controller: 'LogicGroupController',
    })
    .controller('LogicGroupController', function ($scope, $mdDialog, ApplicationModule, $translate, notify) {
        const extractedLogicGroups = [];
        $scope.shouldPerformPlatformUpdate = false;
        $scope.displayCopyOutline = false;
        $scope.destinationLogicGroup = null;
        $scope.suggestedLogicGroupButtonArray = [];

        function extractLogicGroups(logicGroupToExplode) {
            const logicGroupsList = Object.values(logicGroupToExplode.children);
            logicGroupsList.forEach((logicGroup) => {
                if (extractedLogicGroups.filter((extracted) => extracted.name === logicGroup.name).length === 0) {
                    extractedLogicGroups.push(logicGroup);
                }
                if (!_.isEmpty(logicGroup.children)) {
                    extractLogicGroups(logicGroup);
                }
            });
        }

        $scope.getSuggestedLogicGroupDestinations = function () {
            extractLogicGroups($scope.logicGroupsRoot);
            return extractedLogicGroups.filter((logicGroup) => logicGroup.name !== $scope.selectedLogicGroup.name);
        };

        $scope.getSuggestedLogicGroupButtons = function () {
            $scope.getSuggestedLogicGroupDestinations().forEach((logicGroup) => {
                $scope.suggestedLogicGroupButtonArray.push({ name: logicGroup.name, clicked: false });
            });
        };

        $scope.setClickedStatus = function (logicGroupName) {
            $scope.suggestedLogicGroupButtonArray.forEach(function (suggestedLogicGroupButton) {
                suggestedLogicGroupButton.clicked = suggestedLogicGroupButton.name === logicGroupName;
            });
        };

        $scope.getClickedStatus = function (logicGroupName) {
            return $scope.suggestedLogicGroupButtonArray
                .filter((suggestedLogicGroupButton) => suggestedLogicGroupButton.name === logicGroupName)[0].clicked;
        };

        function containModule(logicGroup, moduleToFind) {
            return _.filter(logicGroup.modules,
                { name: moduleToFind.name }).length > 0;
        }

        function containModuleWithDifferentVersionOrWorkingCopy(logicGroup, moduleToFind) {
            return _.filter(logicGroup.modules, function (module) {
                return (module.name === moduleToFind.name) && (module.version !== moduleToFind.version ||
                    module.is_working_copy !== moduleToFind.is_working_copy);
            }).length > 0;
        }

        $scope.prepareCopy = function (logicGroupSource, logicGroupDestination) {
            $scope.fromLogicGroup = logicGroupSource;
            $scope.destinationLogicGroup = logicGroupDestination;
            $scope.displayCopyOutline = true;
        };

        $scope.copyLogicGroupToNewBox = function (logicGroupNames) {
            let logicGroupsRoot = $scope.logicGroupsRoot;
            const localLogicGroups = logicGroupNames.split('#').filter(_.identity);
            localLogicGroups.forEach((logicGroupName) => {
                if (!logicGroupsRoot.children[logicGroupName]) {
                    logicGroupsRoot.children[logicGroupName] = new $scope.Box({ parent_box: logicGroupsRoot, name: logicGroupName.trim() });
                }
                logicGroupsRoot = logicGroupsRoot.children[logicGroupName];
            });
            // $scope.copyLogicGroup($scope.selectedLogicGroup, logicGroupsRoot);
            $scope.prepareCopy($scope.selectedLogicGroup, logicGroupsRoot);
        };

        $scope.copyLogicGroup = function (logicGroupSource, logicGroupDestination) {
            logicGroupSource.modules.forEach((module) => {
                if (!containModule(logicGroupDestination, module)) {
                    $scope.shouldPerformPlatformUpdate = true;
                    $scope.destinationLogicGroup = logicGroupDestination;
                    logicGroupDestination.modules.push(new ApplicationModule({
                        name: module.name,
                        version: module.version,
                        is_working_copy: module.is_working_copy,
                        path: logicGroupDestination.get_path(),
                    }));
                } else if (containModuleWithDifferentVersionOrWorkingCopy(logicGroupDestination, module)) {
                    $translate('properties.logicGroup.copy.with.existing.confirmation').then(function (label) {
                        const confirmation = confirm(label);
                        if (confirmation) {
                            $scope.shouldPerformPlatformUpdate = true;
                            $scope.destinationLogicGroup = logicGroupDestination;
                            logicGroupDestination.modules.push(new ApplicationModule({
                                name: module.name,
                                version: module.version,
                                is_working_copy: module.is_working_copy,
                                path: logicGroupDestination.get_path(),
                            }));
                        }
                    });
                } else {
                    $translate('properties.logicGroup.copy.message').then(function (label) {
                        notify({ classes: [ 'warn' ], message: label });
                    });
                }
            });
        };

        $scope.save = function () {
            $scope.copyLogicGroup($scope.fromLogicGroup, $scope.destinationLogicGroup);
            if ($scope.shouldPerformPlatformUpdate) {
                $scope.save_platform_from_box($scope.logicGroupsRoot).then(function () {
                    $scope.properties = null;
                    $scope.instance = null;
                });
                $scope.shouldPerformPlatformUpdate = false;
            }
        };

        $scope.closeLogicGroupCopierDialog = function () {
            $mdDialog.cancel();
        };
    });
