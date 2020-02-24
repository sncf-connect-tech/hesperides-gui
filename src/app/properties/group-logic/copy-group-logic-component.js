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
        $scope.platform.modules.forEach((module) => {
            const group_name = module.properties_path.split('#')[1];
            if (group_name !== $scope.box.name) {
                $scope.logicGroups.push({ logicGroupName: group_name, module: module });
            }
        });

        $scope.copyLogicGroup = function (logicGroupToCopy) {
            console.log('logicGroupToCopy : ', logicGroupToCopy);
            if ($scope.$parent && _.isFunction($scope.$parent.add_module)) {
                const confirmation = confirm('Confirm!');
                if (confirmation) {
                    $scope.$parent.add_module(logicGroupToCopy.module.name, logicGroupToCopy.module.version, logicGroupToCopy.module.is_working_copy, $scope.box);
                }
            }
        };

        $scope.closeDialog = function () {
            $mdDialog.cancel();
        };
    });
