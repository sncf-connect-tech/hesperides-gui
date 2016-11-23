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
localChangesModule.controller('UnitedNationsController', ['$scope', 'Comments', function($scope, Comments) {

    $scope.comments = new Comments();

    $scope.sync_search_text = function (selected_comment) {
        $scope.raw_comment = selected_comment && selected_comment.length > 0 ? selected_comment.comment : $scope.raw_comment;
    }

    $scope.saveAllChanges = function () {

        $scope.comments.addComment($scope.platform.application_name, $scope.raw_comment)
        $scope.raw_comment = '';

    }

}]);