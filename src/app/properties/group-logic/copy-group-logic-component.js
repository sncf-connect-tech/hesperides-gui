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

angular.module('hesperides.properties.groupLogic', [ 'hesperides.properties', 'cgNotify', 'hesperides.localChanges' ])
    .component('groupLogicComponent', {
        templateUrl: 'copy-group-logic-modal.html',
        controller: 'GroupLogicController',
    })
    .controller('GroupLogicController', function ($scope, $mdDialog, ApplicationModule) {
        $scope.logicGroups = [];
        $scope.getBoxes = function () {
            const boxes = [];
            Object.keys($scope.mainBox.children).forEach(function (key) {
                const box = $scope.mainBox.children[key];
                if (box.name !== $scope.box.name) {
                    boxes.push(box);
                }
            });
            return boxes;
        };

        function containModule(box, moduleToFind) {
            return _.filter(box.modules, function (module) {
                return (_.isMatch(module, { name: moduleToFind.name, version: moduleToFind.version,
                    is_working_copy: moduleToFind.is_working_copy }));
            }).length > 0;
        }

        function containModuleWithDifferentVersionOrWorkingCopy(box, moduleToFind) {
            return _.filter(box.modules, function (module) {
                return (module.name === moduleToFind.name) && (module.version !== moduleToFind.version ||
                    module.is_working_copy !== moduleToFind.is_working_copy);
            }).length > 0;
        }

        $scope.copyLogicGroupToNewBox = function (logicGroupNames) {
            let parentBox = $scope.mainBox;
            const localLogicGroups = logicGroupNames.split('#').filter(_.identity);
            localLogicGroups.forEach((logicGroupName) => {
                if (!parentBox.children[logicGroupName]) {
                    parentBox.children[logicGroupName] = new $scope.Box({ parent_box: parentBox, name: logicGroupName.trim() });
                }
                parentBox = parentBox.children[logicGroupName];
            });
            $scope.copyLogicGroup($scope.box, parentBox);
        };

        $scope.copyLogicGroup = function (boxSource, boxDestination) {
            let isCopied = false;
            boxSource.modules.forEach((module) => {
                if (!containModule(boxDestination, module)) {
                    isCopied = true;
                    boxDestination.modules.push(new ApplicationModule({
                        name: module.name,
                        version: module.version,
                        is_working_copy: module.is_working_copy,
                        path: boxDestination.get_path(),
                    }));
                } else if (containModuleWithDifferentVersionOrWorkingCopy(boxDestination, module)) {
                    const confirmation = confirm('Confirmation!');
                    if (confirmation) {
                        isCopied = true;
                        boxDestination.modules.push(new ApplicationModule({
                            name: module.name,
                            version: module.version,
                            is_working_copy: module.is_working_copy,
                            path: boxDestination.get_path(),
                        }));
                    }
                }
            });
            if (isCopied) {
                $scope.save_platform_from_box($scope.mainBox).then(function () {
                    $scope.properties = null;
                    $scope.instance = null;
                });
            }
        };


        $scope.closeDialog = function () {
            $mdDialog.cancel();
        };
    });
