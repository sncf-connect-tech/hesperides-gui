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
    .controller('LogicGroupController', function ($scope, $mdDialog, ApplicationModule, $translate) {
        $scope.getSuggestedLogicGroupDestinations = function () {
            return Object.values($scope.mainBox.children)
                .filter((logicGroup) => logicGroup.name !== $scope.box.name);
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

        $scope.copyLogicGroupToNewBox = function (logicGroupNames) {
            let parentBox = $scope.rootBox;
            const localLogicGroups = logicGroupNames.split('#').filter(_.identity);
            localLogicGroups.forEach((logicGroupName) => {
                if (!parentBox.children[logicGroupName]) {
                    parentBox.children[logicGroupName] = new $scope.Box({ parent_box: parentBox, name: logicGroupName.trim() });
                }
                parentBox = parentBox.children[logicGroupName];
            });
            $scope.copyLogicGroup($scope.box, parentBox);
        };

        $scope.copyLogicGroup = function (logicGroupSource, logicGroupDestination) {
            let shouldPerformPlatformUpdate = false;
            logicGroupSource.modules.forEach((module) => {
                if (!containModule(logicGroupDestination, module)) {
                    shouldPerformPlatformUpdate = true;
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
                            logicGroupDestination.modules.push(new ApplicationModule({
                                name: module.name,
                                version: module.version,
                                is_working_copy: module.is_working_copy,
                                path: logicGroupDestination.get_path(),
                            }));
                            $scope.save_platform_from_box($scope.rootBox).then(function () {
                                $scope.properties = null;
                                $scope.instance = null;
                            });
                        }
                    });
                }
            });
            if (shouldPerformPlatformUpdate) {
                $scope.save_platform_from_box($scope.rootBox).then(function () {
                    $scope.properties = null;
                    $scope.instance = null;
                });
            }
        };

        $scope.closeLogicGroupCopierDialog = function () {
            $mdDialog.cancel();
        };
    });
