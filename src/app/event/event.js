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
angular.module('hesperides.event', [])

/**
 * Hesperides event data type
 *
 */
    .factory('EventEntry', function ($translate) {
        var EventEntry = function (data) {
            this.type = data.type;
            this.data = data.data;
            this.timestamp = data.timestamp;
            this.user = data.user;
            this.isGlobal = false; // indicates if this event is about global properties

            // For internal use
            this.id = 0;
            this.isSelected = false;
            this.isSelectable = true;

            this.label = `${ this.user } `; // the event label : the displayable message. Used for filtering. Always starts by the user name

            // The simple type of the event
            this.type = _.last(data.type.split('.'));

            // Get the module name of the event if applicable
            if (!_.isUndefined(this.data.path)) {
                if (_.isEqual(this.data.path, '#')) {
                    if (_.isEqual(this.type, 'PropertiesSavedEvent')) {
                        this.isGlobal = true;
                    }
                } else {
                    var pathsItems = this.data.path.split('#');
                    if (!_.isUndefined(pathsItems[3])) {
                        this.moduleName = pathsItems[3];
                    }
                    if (!_.isUndefined(pathsItems[4])) {
                        this.moduleVersion = pathsItems[4];
                    }
                }
            }

            /**
         * This method is for building the event label
         */
            this.buildLabel = function (...args) {
                var labelCode = args[0];

                _.remove(args, function (item) {
                    return item === labelCode;
                });

                var event = this;
                $translate(labelCode).then(function (label) {
                    label = `${ event.user } ${ label }`;
                    _.each(args, function (arg) {
                        label += ` ${ arg }`;
                    });
                    event.label = label;
                });
            };
        };

        return EventEntry;
    })

/**
 * Hesperides event http service
 */
    .factory('EventService', function ($http, EventEntry, notify) {
            return {
                /**
                 * Get events from the back.
                 * @param {String} stream : is the name of the stream, application or module
                 * @param {Integer} page : is the page number to retrieve.
                 */
                get(stream, page) {
                    var url = `rest/events/${ encodeURIComponent(stream) }?page=${ encodeURIComponent(page) }&size=${ EVENT_PAGINATION_SIZE }`;
                    return $http.get(url).then(function (response) {
                        return response.data.map(function (item) {
                            var event = new EventEntry(item);
                            return event;
                        });
                    }, function (error) {
                        notify({ classes: [ 'error' ], message: (error.data && error.data.message) || error.data || 'Unknown API error in EventService.get' });
                        throw error;
                    });
                },
            };
        })

/**
 * This is the list of directives used to display each type of events
 * with custom content.
 */

//
// Platforms
//

/* This is for platform creation event */
    .directive('platformCreated', function () {
        return {
            restrict: 'E',
            scope: {
                event: '=',
            },
            templateUrl: 'event/directives/platform/platform-created.html',
            controller: [
                '$scope', function ($scope) {
                    $scope.event.buildLabel('platform.event.createdByUser');
                },
            ],
        };
    })

/* This is for platform creation from an existing event */
    .directive('platformCreatedFromExisting', function () {
        return {
            restrict: 'E',
            scope: {
                event: '=',
            },
            templateUrl: 'event/directives/platform/platform-created-from-existing.html',
            controller: [
                '$scope', function ($scope) {
                    $scope.from = $scope.event.data.originPlatform.key.entityName;
                    $scope.event.buildLabel('platform.event.createdFromExisting', $scope.from);
                },
            ],
        };
    })


/* This is for platform update event */
    .directive('platformUpdated', function () {
        return {
            restrict: 'E',
            scope: {
                event: '=',
            },
            templateUrl: 'event/directives/platform/platform-updated.html',
            controller: [
                '$scope', function ($scope) {
                    $scope.event.buildLabel('platform.event.updatedByUser');
                },
            ],
        };
    })

/* This is for platform deletion event */
    .directive('platformDeleted', function () {
        return {
            restrict: 'E',
            scope: {
                event: '=',
            },
            templateUrl: 'event/directives/platform/platform-deleted.html',
            controller: [
                '$scope', function ($scope) {
                    $scope.event.buildLabel('platform.event.deletedByUser');
                },
            ],
        };
    })

/* This is for platform restore event */
    .directive('platformRestored', function () {
        return {
            restrict: 'E',
            scope: {
                event: '=',
            },
            templateUrl: 'event/directives/platform/platform-restored.html',
            controller: [
                '$scope', function ($scope) {
                    $scope.event.buildLabel('platform.event.restoredByuser');
                },
            ],
        };
    })

/* This is for module creation event */
    .directive('moduleCreated', function () {
        return {
            restrict: 'E',
            scope: {
                event: '=',
            },
            templateUrl: 'event/directives/module/module-created.html',
            controller: [
                '$scope', function ($scope) {
                    $scope.event.buildLabel('module.event.created');
                },
            ],
        };
    })

/* This is for module update event */
    .directive('moduleUpdated', function () {
        return {
            restrict: 'E',
            scope: {
                event: '=',
            },
            templateUrl: 'event/directives/module/module-updated.html',
            controller: [
                '$scope', function ($scope) {
                    $scope.event.buildLabel('module.event.updatedByUser');
                },
            ],
        };
    })

/* This is for module working copy update event */
    .directive('moduleWorkingCopyUpdated', function () {
        return {
            restrict: 'E',
            scope: {
                event: '=',
            },
            templateUrl: 'event/directives/module-working-copy/module-working-copy-updated.html',
            controller: [
                '$scope', function ($scope) {
                    $scope.event.buildLabel('module.workingCopy.event.updatedByUser');
                },
            ],
        };
    })

//
// Module Templates
//

/* This is for module template creation event */
    .directive('moduleTemplateCreated', function () {
        return {
            restrict: 'E',
            scope: {
                event: '=',
            },
            templateUrl: 'event/directives/module-template/module-template-created.html',
            controller: [
                '$scope', function ($scope) {
                    $scope.event.buildLabel('module.template.event.createdByUser');
                },
            ],
        };
    })

/* This is for module template  update event */
    .directive('moduleTemplateUpdated', function () {
        return {
            restrict: 'E',
            scope: {
                event: '=',
            },
            templateUrl: 'event/directives/module-template/module-template-updated.html',
            controller: [
                '$scope', function ($scope) {
                    $scope.event.buildLabel('module.template.event.updatedByUser');
                },
            ],
        };
    })

/* This is for module template  deletion event */
    .directive('moduleTemplateDeleted', function () {
        return {
            restrict: 'E',
            scope: {
                event: '=',
            },
            templateUrl: 'event/directives/module-template/module-template-deleted.html',
            controller: [
                '$scope', function ($scope) {
                    $scope.event.buildLabel('module.template.event.deletedByUser');
                },
            ],
        };
    })

//
// Properties
//

/* This is for properties saved event */
    .directive('propertiesSaved', function () {
        return {
            restrict: 'E',
            scope: {
                event: '=',
            },

            templateUrl: 'event/directives/properties/properties-saved.html',
            controller: [
                '$scope', function ($scope) {
                // Get the scope of the modal
                    var modalScope = $scope.$parent.$parent.$parent;

                    /**
             * Selectes or unselects the current events for diff.
             */
                    $scope.selectOrUnselect = function () {
                        if ($scope.event.isSelected) {
                            modalScope.selectedEvents.push($scope.event);
                        } else {
                            _.remove(modalScope.selectedEvents, function (item) {
                                return item.id === $scope.event.id;
                            });
                        }
                        modalScope.checkSelectStatus();
                    };

                    $scope.moduleName = $scope.event.moduleName;
                    $scope.moduleVersion = $scope.event.moduleVersion;

                    // get the event message for filtering

                    if ($scope.event.isGlobal) {
                        $scope.event.buildLabel('properties.event.savedGlobalByUser');
                    } else {
                        $scope.event.buildLabel('properties.event.savedByUser', $scope.event.moduleName, $scope.event.moduleVersion);
                    }
                },
            ],
        };
    })

//
// Templates (Techno)
//

/* This is for techno creation event */
    .directive('templateCreated', function () {
        return {
            restrict: 'E',
            scope: {
                event: '=',
            },
            templateUrl: 'event/directives/template/template-created.html',
            controller: [
                '$scope', function ($scope) {
                    $scope.event.buildLabel('techno.event.createdByUser');
                },
            ],
        };
    })

/* This is for techno  update event */
    .directive('templateUpdated', function () {
        return {
            restrict: 'E',
            scope: {
                event: '=',
            },
            templateUrl: 'event/directives/template/template-updated.html',
            controller: [
                '$scope', function ($scope) {
                    $scope.event.buildLabel('techno.event.updatedByUser');
                },
            ],
        };
    })

/* This is for techno  deletion event */
    .directive('templateDeleted', function () {
        return {
            restrict: 'E',
            scope: {
                event: '=',
            },
            templateUrl: 'event/directives/template/template-deleted.html',
            controller: [
                '$scope', function ($scope) {
                    $scope.event.buildLabel('techno.event.deletedByUser');
                },
            ],
        };
    })

//
// Template Package (Techno)
//

/* This is for techno package deletion event */
    .directive('templatePackageDeleted', function () {
        return {
            restrict: 'E',
            scope: {
                event: '=',
            },
            templateUrl: 'event/directives/template-package/template-package-deleted.html',
            controller: [
                '$scope', function ($scope) {
                    $scope.event.buildLabel('techno.package.event.deletedByUser');
                },
            ],
        };
    })

/**
 * This for event timestamp formatting and displaying
 */
/* This is for techno package deletion event */
    .directive('eventTime', function () {
        return {
            restrict: 'E',
            scope: {
                timestamp: '=',
            },
            templateUrl: 'event/directives/event-time.html',
        };
    })

/**
 * This is the events filtering by :
 *  - module name and version
 *  - date
 *  - othor
 *  - event displayable message
 */
    .filter('eventsFilter', function ($filter) {
        return function (events, inputs) {
            if (_.isUndefined(inputs) || _.isEmpty(inputs)) {
                return events;
            }

            try {
            // Format the filters to construct the regex
                var regex = new RegExp(`.*${ inputs.split(' ').join('.*') }`, 'i');

                return _.filter(events, function (event) {
                    var module = event.moduleName ? `${ event.moduleName } ` : '';
                    module += event.moduleVersion ? event.moduleVersion : '';

                    return regex.test(module) ||
                    regex.test(event.user) ||
                    regex.test(event.label) ||
                    regex.test($filter('date')(event.timestamp, 'd MMMM yyyy HH:mm')) ||
                    regex.test(event.data.comment);
                });
            } catch (error) {
                return events;
            }
        };
    })

/**
 * This is the events filtering by user name or my events
 */
    .filter('myEventsFilter', [
        '$filter', 'UserService', function ($filter, UserService) {
            var currentUser = null;
            UserService.authenticate().then(function (user) {
                currentUser = user;
            });
            return function (events, myevents) {
                if (myevents && currentUser) {
                    // reuse a above filter
                    return $filter('eventsFilter')(events, currentUser.username);
                }
                return events;
            };
        },
    ]);
