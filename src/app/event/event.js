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
var eventModule = angular.module ('hesperides.event', []);

/**
 * Hesperides event data type
 *
 */
eventModule.factory('EventEntry', function ($translate){
    var EventEntry = function (data){
        var me = this;

        this.type = data.type;
        this.data = data.data;
        this.timestamp = data.timestamp;
        this.user = data.user;
        this.isGlobal = false; // indicates if this event is about global properties

        // For internal use
        this.id   = 0;
        this.isSelected = false;
        this.isSelectable = true;

        this.label = me.user + " "; // the event label : the displayable message. Used for filtering. Always starts by the user name

        // The simple type of the event
        var tab = data.type.split('.');
        this._type = tab[tab.length - 1];

        // Get the module name of the event if applicable
        if ( !_.isUndefined(this.data.path)){
            if (_.isEqual(this.data.path, '#')){
               if ( _.isEqual (this._type, 'PropertiesSavedEvent')){
                this.isGlobal = true;
               }
            }else{
                var pathsItems = this.data.path.split('#');
                if (!_.isUndefined(pathsItems [3])){
                    me.moduleName = pathsItems [3];
                }
                if (!_.isUndefined(pathsItems [4])){
                    me.moduleVersion = pathsItems [4];
                }
            }
        }

        /**
         * This method is for building the event label
         * This makes use of javascript generic arguments
         */
         this.buildLabel = function () {
            var _args = arguments;

            var _labelCode = _args[0];

            _.remove (arguments, function (item){
                return item == _labelCode;
            });

            $translate(_labelCode).then(function (label){

                var _lbl = me.user + " " + label;

                _(_args).each (function (arg){
                    _lbl += " " + arg;
                });

                me.label = _lbl;
            });
         };
    };

    return EventEntry;
});

/**
 * Hesperides event http service
 */
eventModule.service("EventService", ['$hesperidesHttp', 'EventEntry', 'hesperidesGlobals', function ($http, EventEntry, hesperidesGlobals){
    return {
        /**
         * Get events from the back.
         * @param {String} stream : is the name of the stream, application or module
         * @param {Integer} page : is the page number to retrieve.
         */
        get : function (stream, page) {
            var url = ENDPOINT + "/rest/events/" + encodeURIComponent(stream) + "?page=" + encodeURIComponent(page) + "&size=" + encodeURIComponent(hesperidesGlobals.eventPaginationSize);
            return $http.get(url).then (function (response){
               return response.data.map (function(item){
                    var event = new EventEntry(item);
                    return event;
               });
            }, function (error){
                $.notify(error.data.message, "error");
                throw error;
            });
        }
    }
}]);

/**
 * This is the list of directives used to display each type of events
 * with custom content.
 */

//
// Platforms
//

/* This is for platform creation event */
eventModule.directive('platformCreated', function (){
    return {
        restrict : 'E',
        scope : {
            event : '='
        },
        templateUrl : 'event/directives/platform/platform-created.html',
        controller: ['$scope', function ($scope){
            var _event = $scope.event;

            $scope.parseData = function (){
                _event.buildLabel('platform.event.createdByUser');
            };

            $scope.parseData();
        }]
    };
});

/* This is for platform creation from an existing event */
eventModule.directive('platformCreatedFromExisting', function (){
    return {
        restrict : 'E',
        scope : {
            event : '='
        },
        templateUrl : 'event/directives/platform/platform-created-from-existing.html',
        controller: ['$scope', function ($scope){
            var _event = $scope.event;

            $scope.parseData = function (){
                $scope.from = _event.data.originPlatform.key.entityName;
                _event.buildLabel('platform.event.createdFromExisting', $scope.from);
            };

            $scope.parseData();
        }]
    };
});


/* This is for platform update event */
eventModule.directive('platformUpdated', function (){
    return {
        restrict : 'E',
        scope : {
            event : '='
        },
        templateUrl : 'event/directives/platform/platform-updated.html',
        controller: ['$scope', function ($scope){
            var _event = $scope.event;

            $scope.parseData = function (){
                _event.buildLabel('platform.event.updatedByUser');
            };

            $scope.parseData();
        }]
    };
});

/* This is for platform deletion event */
eventModule.directive('platformDeleted', function (){
    return {
        restrict : 'E',
        scope : {
            event : '='
        },
        templateUrl : 'event/directives/platform/platform-deleted.html',
        controller: ['$scope', function ($scope){
            var _event = $scope.event;

            $scope.parseData = function (){
                _event.buildLabel('platform.event.deletedByUser');
            };

            $scope.parseData();
        }]
    };
});

//
// Modules
//

/* This is for module creation event */
eventModule.directive('moduleCreated', function (){
    return {
        restrict : 'E',
        scope : {
            event : '='
        },
        templateUrl : 'event/directives/module/module-created.html',
        controller: ['$scope', function ($scope){
            var _event = $scope.event;

            $scope.parseData = function (){
                _event.buildLabel('module.event.created');
            };

            $scope.parseData();
        }]
    };
});

/* This is for module update event */
eventModule.directive('moduleUpdated', function (){
    return {
        restrict : 'E',
        scope : {
            event : '='
        },
        templateUrl : 'event/directives/module/module-updated.html',
        controller: ['$scope', function ($scope){
            var _event = $scope.event;

            $scope.parseData = function (){
                _event.buildLabel('module.event.updatedByUser');
            };

            $scope.parseData();
        }]
    };
});

//
// Module Working Copy
//

/* This is for module working copy update event */
eventModule.directive('moduleWorkingCopyUpdated', function (){
    return {
        restrict : 'E',
        scope : {
            event : '='
        },
        templateUrl : 'event/directives/module-working-copy/module-working-copy-updated.html',
        controller: ['$scope', function ($scope){
            var _event = $scope.event;

            $scope.parseData = function (){
                _event.buildLabel('module.workingCopy.event.updatedByUser');
            };

            $scope.parseData();
        }]
    };
});

//
// Module Templates
//

/* This is for module template creation event */
eventModule.directive('moduleTemplateCreated', function (){
    return {
        restrict : 'E',
        scope : {
            event : '='
        },
        templateUrl : 'event/directives/module-template/module-template-created.html',
        controller: ['$scope', function ($scope){
            var _event = $scope.event;

            $scope.parseData = function (){
                _event.buildLabel('module.template.event.createdByUser');
            };

            $scope.parseData();
        }]
    };
});

/* This is for module template  update event */
eventModule.directive('moduleTemplateUpdated', function (){
    return {
        restrict : 'E',
        scope : {
            event : '='
        },
        templateUrl : 'event/directives/module-template/module-template-updated.html',
        controller: ['$scope', function ($scope){
            var _event = $scope.event;

            $scope.parseData = function (){
                _event.buildLabel('module.template.event.updatedByUser');
            };

            $scope.parseData();
        }]
    };
});

/* This is for module template  deletion event */
eventModule.directive('moduleTemplateDeleted', function (){
    return {
        restrict : 'E',
        scope : {
            event : '='
        },
        templateUrl : 'event/directives/module-template/module-template-deleted.html',
        controller: ['$scope', function ($scope){
            var _event = $scope.event;

            $scope.parseData = function (){
                _event.buildLabel('module.template.event.deletedByUser');
            };

            $scope.parseData();
        }]
    };
});

//
// Properties
//

/* This is for properties saved event */
eventModule.directive('propertiesSaved', function ($translate){
    return {
        restrict : 'E',
        scope : {
            event : '='
        },

        templateUrl : 'event/directives/properties/properties-saved.html',
        controller : ['$scope', function ($scope) {
            var _event = $scope.event;

            // Get the scope of the modal
            var modalScope = $scope.$parent.$parent.$parent;

            /**
             * Selectes or unselects the current events for diff.
             */
            $scope.selectOrUnselect = function (){
                if (_event.isSelected){
                    modalScope.selectedEvents.push(_event);
                }else{
                    _.remove(modalScope.selectedEvents, function (item){
                        return item.id == _event.id;
                    });
                }
                modalScope.checkSelectStatus();
            };

            $scope.parseData = function (){
                $scope.moduleName = _event.moduleName;
                $scope.moduleVersion = _event.moduleVersion;

                // get the event message for filtering

                if ( $scope.event.isGlobal ){
                    $scope.event.buildLabel('properties.event.savedGlobalByUser');
                }else{
                    $scope.event.buildLabel('properties.event.savedByUser', _event.moduleName, _event.moduleVersion);
                }
            }

            // Parsing data for this king of events
            $scope.parseData();
        }]
    };
});

//
// Templates (Techno)
//

/* This is for techno creation event */
eventModule.directive('templateCreated', function (){
    return {
        restrict : 'E',
        scope : {
            event : '='
        },
        templateUrl : 'event/directives/template/template-created.html',
        controller: ['$scope', function ($scope){
            var _event = $scope.event;

            $scope.parseData = function (){
                _event.buildLabel('techno.event.createdByUser');
            };

            $scope.parseData();
        }]
    };
});

/* This is for techno  update event */
eventModule.directive('templateUpdated', function (){
    return {
        restrict : 'E',
        scope : {
            event : '='
        },
        templateUrl : 'event/directives/template/template-updated.html',
        controller: ['$scope', function ($scope){
            var _event = $scope.event;

            $scope.parseData = function (){
                _event.buildLabel('techno.event.updatedByUser');
            };

            $scope.parseData();
        }]
    };
});

/* This is for techno  deletion event */
eventModule.directive('templateDeleted', function (){
    return {
        restrict : 'E',
        scope : {
            event : '='
        },
        templateUrl : 'event/directives/template/template-deleted.html',
        controller: ['$scope', function ($scope){
            var _event = $scope.event;

            $scope.parseData = function (){
                _event.buildLabel('techno.event.deletedByUser');
            };

            $scope.parseData();
        }]
    };
});

//
// Template Package (Techno)
//

/* This is for techno package deletion event */
eventModule.directive('templatePackageDeleted', function (){
    return {
        restrict : 'E',
        scope : {
            event : '='
        },
        templateUrl : 'event/directives/template-package/template-package-deleted.html',
        controller: ['$scope', function ($scope){
            var _event = $scope.event;

            $scope.parseData = function (){
                _event.buildLabel('techno.package.event.deletedByUser');
            };

            $scope.parseData();
        }]
    };
});

/**
 * This for event timestamp formatting and displaying
 */
/* This is for techno package deletion event */
eventModule.directive('eventTime', function (){
    return {
        restrict : 'E',
        scope : {
            timestamp : '='
        },
        templateUrl : 'event/directives/event-time.html'
    };
});

/**
 * This is the events filtering by :
 *  - module name and version
 *  - date
 *  - othor
 *  - event displayable message
 */
eventModule.filter ('evensFilter', function ($filter){
    return function(events, inputs){

        if ( _.isUndefined(inputs) || _.isEmpty(inputs)) {
            return events;
        }

        // Format the filters to construct the regex
        var _inputs = '.*' + inputs.split(' ').join('.*');

        // Create the regex
        try {
            var regex = new RegExp(_inputs, 'i');

            return _.filter(events, function (item){

                var inputs = item.moduleName ? item.moduleName + " " : "";
                inputs += item.moduleVersion ? item.moduleVersion : "";

                return regex.test(inputs) || regex.test(item.user) || regex.test(item.label) || regex.test($filter('date')(item.timestamp, 'd MMMM yyyy HH:mm')) || regex.test (item.data.comment);

            });
        } catch(e) {
            return events;
        }
    };
});

/**
 * This is the events filtering by user name or my events
 */
eventModule.filter ('myEventsFilter', function ($filter){
    return function(events, myevents){

        if ( myevents ) {
           // reuse a above filter
           return $filter('evensFilter')(events, hesperidesUser.username);
        }else{
            return events;
        }
    };
});