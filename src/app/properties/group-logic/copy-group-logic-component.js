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
    .controller('GroupLogicController', function ($scope, $mdDialog) {
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

        $scope.copyLogicGroupToNewBox = function (logicGroupNames) {
            let parentBox = $scope.mainBox;
            const localLogicGroups = logicGroupNames.split('#').filter(_.identity);
            localLogicGroups.forEach((logicGroupName) => {
                parentBox.children[logicGroupName] = new $scope.Box({ parent_box: parentBox, name: logicGroupName.trim() });
                parentBox = parentBox.children[logicGroupName];
            });
            $scope.copyLogicGroup($scope.box, parentBox);
        };

        $scope.copyLogicGroup = function (boxSource, boxDestination) {
            if ($scope.$parent && _.isFunction($scope.$parent.add_module)) {
                const confirmation = confirm('Confirm!');
                if (confirmation) {
                    if (boxSource && boxSource.modules) {
                        boxSource.modules.forEach((module) => {
                            $scope.$parent.add_module(module.name, module.version, module.is_working_copy, boxDestination);
                        });
                    }
                }
            }
        };

        $scope.closeDialog = function () {
            $mdDialog.cancel();
        };
    });
