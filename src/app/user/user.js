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
angular.module("hesperides.user", [])

/**
 * The user entity
 */
.factory ("User", function (){

    var User = function (data){
        var me = this;

        // The user name
        this.username = data.username;

        // Indicates if the user is an Ops or not.
        // Used for Ops dedicated actions.
        this.isProdUser = data.prodUser;

    };

    return User;
 })

/**
 * The authentication service for users.
 */
 .service("UserService", ["$http", "User", function ($http, User){
    return {
        authenticate : function (){
            return $http.get(ENDPOINT + '/rest/users/auth').then (function (response){
                return new User(response.data);
            }, function (error){
                throw error;
            })
        }
    }
 }]);
