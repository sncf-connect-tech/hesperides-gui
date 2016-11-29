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

localChangesModule.factory('LocalChange', [function() {

    var LocalChange = function (data){
        var me = this;

        // Attributes
        this.properties_name = data.properties_name;
        this.properties_value = data.properties_value == undefined ? "" : data.properties_value;
        this.version_id = data.version_id == undefined ? store.get('current_platform_versionID') : data.version_id;

        // Methods
        this.prettify = function () {
            return me.properties_name;
        };

    };

    return LocalChange;

}]);