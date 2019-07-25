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
angular.module('hesperides.user', [])

    /**
     * The user entity
     */
    .factory('User', function () {
        var User = function (data) {
            _.assign(this, data);
            // For backward-compatibility:
            if (!_.isUndefined(this.prodUser)) {
                this.isProdUser = this.prodUser;
            }
        };
        return User;
    })

    /**
     * The authentication service for users.
     */
    .factory('UserService', [
        '$http', 'User', '$translate', 'notify', function ($http, User, $translate, notify) {
            var userCache = null;
            return {
                authenticate() {
                    if (userCache) {
                        return Promise.resolve(userCache);
                    }
                    return $http.get('/rest/users/auth').then(function (response) {
                        userCache = new User(response.data);
                        if (SENTRY_DSN) {
                            Sentry.configureScope((scope) =>
                                scope.setUser({ username: userCache.username })
                            );
                        }
                        return userCache;
                    }, function (errorResp) {
                        if (errorResp.data && errorResp.data.status === 401) return // évite de polluer les logs Sentry
                        var errorMsg = (errorResp.data && errorResp.data.message) || errorResp.data || 'Unknown API error in UserService.authenticate';
                        notify({ classes: [ 'error' ], message: errorMsg });
                        throw new Error(errorMsg);
                    });
                },
                logout() {
                    userCache = null;
                    return $http.get('/rest/users/auth?logout=true').then(() => {
                        $translate('auth.logout.success')
                            .then((label) => notify({ classes: [ 'success' ], message: label }))
                            .then(() => location.reload());
                    }).catch((errorResp) => {
                        var errorMsg = (errorResp.data && errorResp.data.message) || errorResp.data || 'Unknown API error in UserService.logout';
                        notify({ classes: [ 'error' ], message: errorMsg });
                        throw new Error(errorMsg);
                    });
                },
            };
        },
    ]);
