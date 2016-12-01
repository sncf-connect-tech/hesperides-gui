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

if ( typeof String.prototype.startsWith != 'function' ) {
    String.prototype.startsWith = function( str ) {
        return str.length > 0 && this.substring( 0, str.length ) === str;
    }
};

var hesperidesModule = angular.module('hesperides', [
    'ngRoute',
    'hesperides.module',
    'hesperides.menu',
    'hesperides.properties',
    'hesperides.techno',
    'hesperides.template',
    'hesperides.components',
    'hesperides.user',
    'hesperides.localChanges',
    'ngMaterial',
    'ngAnimate',
    'xeditable',
    'ui.codemirror',
    'mgo-angular-wizard',
    'vs-repeat',
    'scDateTime',
    'angularjs-datetime-picker',
    'pascalprecht.translate',
    'ngCookies'
]).value('scDateTimeConfig', {
    defaultTheme: 'sc-date-time/hesperides.tpl',
    autosave: false,
    defaultMode: 'date',
    defaultDate: undefined, //should be date object!!
    displayMode: undefined,
    defaultOrientation: false,
    displayTwentyfour: true,
    compact: true,
    autosave:true
}).value('scDateTimeI18n', {
    weekdays: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
    calendar: 'Calendrier'
}).value('hesperidesGlobals', {
    versionName: 'ARES',
    eventPaginationSize: 25
});

var hesperidesConfiguration = {};

hesperidesModule.run(function (editableOptions, editableThemes, $rootScope, $http) {
    editableOptions.theme = 'default';

    // overwrite submit button template
    editableThemes['default'].submitTpl = '<md-button class="md-raised md-primary" ng-click="$form.$submit()"><i class="fa fa-check"></i></md-button>';
    editableThemes['default'].cancelTpl = '<md-button class="md-raised md-warn" ng-click="$form.$cancel()"><i class="fa fa-times"></i></md-button>';

    //Init bootstrap ripples
    /*$(document).ready(function () {
     $.material.init();
     });*/
    //Prevent anoying behavior of bootstrap with dropdowns
    $(document).unbind('keydown.bs.dropdown.data-api');

    /**
     * Hack to calculate correctly margin of calendar.
     *
     * @param calendar calendar var in scope of calendar
     * @param cssClass css class of fisrt day
     * @returns {string}
     */
    $rootScope.offsetMargin = function(calendar, cssClass) {
        var obj = $('.' + cssClass);
        var selectedObj;

        for (var index = 0; index < obj.length; index++) {
            selectedObj = obj[index];

            if (selectedObj.getAttribute("aria-label") === "1") {
                break;
            }
        }

        var calendarOffsetMagin;

        if (selectedObj && selectedObj.clientWidth) {
            calendarOffsetMagin = (new Date(calendar._year, calendar._month).getDay() * selectedObj.clientWidth);
        } else {
            calendarOffsetMagin = 0;
        }

        return calendarOffsetMagin + 'px';
    };

    $rootScope.setHesperidesConfiguration = function () {

        if (hesperidesConfiguration == undefined) {
            console.warn("[Hesperides] Config file not found or empty, applying default configuration");
            hesperidesConfiguration = {};
        }

        if (hesperidesConfiguration.nexusMode == undefined) {
            hesperidesConfiguration.nexusMode = false;
        }
        if (hesperidesConfiguration.localChangesTTL == undefined) {
            hesperidesConfiguration.localChangesTTL = 50;
        }
    }


    $http({
        method: 'GET',
        url: './config.json',
        transformResponse: [ function (data) {
            try {
                data = JSON.parse(data);
            } catch (e) {
                console.warn("[Hesperides] " + e);
                return undefined;
            }
            return data;
        }]
    }).then(function success(data) {
        hesperidesConfiguration = data.data;
        $rootScope.setHesperidesConfiguration();
    }, function error (response) {
        console.warn("[Hesperides] " + response);
        $rootScope.setHesperidesConfiguration();
    });
});


hesperidesModule.factory('Page', ['hesperidesGlobals', function (hesperidesGlobals) {
    var base  = 'Hesperides'
    var title = base;
    return {
        title: function () {
            return title;
        },
        setTitle: function (newTitle) {
            title = base + " > " + newTitle
        }
    }
}]);

var hesperidesUser = undefined;
hesperidesModule.controller("TitleCtrl", ['$scope', 'Page', 'UserService', function ($scope, Page, UserService) {
    $scope.Page = Page;

    // authenticate the user
    $scope.authenticate = function (){
        UserService.authenticate().then(function (user){
            hesperidesUser = user;
        });
    }
}]);

hesperidesModule.controller("WelcomeCtrl", ['$scope','$location', function ($scope, $location) {
    $scope.applications = store.get('applications');
    $scope.openApplication = function(app) {
        $location.path('/properties/'+app)
    }
}]);

hesperidesModule.config(['$routeProvider', '$mdThemingProvider', '$ariaProvider', '$mdIconProvider', '$translateProvider',
    function ($routeProvider, $mdThemingProvider, $ariaProvider, $mdIconProvider, $translateProvider) {
    $mdIconProvider.fontSet('fa', 'fontawesome');

    $translateProvider.useSanitizeValueStrategy('escaped');

    var configureTranslation = function(){
        $translateProvider.useStaticFilesLoader({
            prefix: '/i18n/label_',
            suffix: '.json'
        });
        if(store.get('language') == 'fr'){
            $translateProvider.preferredLanguage('fr');
            $translateProvider.fallbackLanguage('fr');
        }else{
            $translateProvider.preferredLanguage('en');
            $translateProvider.fallbackLanguage('en');
        }
    };

    $routeProvider.
    when('/module/:name/:version', {
        templateUrl: 'module/module.html',
        controller: 'ModuleCtrl'
    }).
    when('/properties/:application', {
        templateUrl: 'properties/properties.html',
        controller: 'PropertiesCtrl',
        reloadOnSearch: false
    }).
    when('/diff', {
        templateUrl: 'properties/diff.html',
        controller: 'DiffCtrl'
    }).
    when('/techno/:name/:version', {
        templateUrl: 'techno/techno.html',
        controller: 'TechnoCtrl'
    }).
    when('/help/swagger', {
        templateUrl: 'swagger/swagger.html'
    }).
    otherwise({
        templateUrl: 'welcome_screen.html',
        controller: 'WelcomeCtrl'
    });

    //Material design theming
    $mdThemingProvider.theme('default')
        .primaryPalette('teal')
        .accentPalette('orange');

    //Deactivate Aria
    $ariaProvider.config({
        ariaHidden: false,
        ariaLabel: false,
        ariaChecked: false,
        ariaDisabled: false,
        ariaRequired: false,
        ariaInvalid: false,
        ariaMultiline: false,
        ariaValue: false,
        tabindex: false,
        bindKeypress: false
    });

    configureTranslation();
}]);

hesperidesModule.directive('ngReallyClick', ['$mdDialog', '$timeout', function ($mdDialog, $timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.bind('click', function () {
                if (attrs.ngReallyMessage && confirm(attrs.ngReallyMessage)) {
                    scope.$apply(attrs.ngReallyClick);
                }

                /* Why some time working, sometime not working ?
                 if (attrs.ngReallyMessage) {
                 var confirm = $mdDialog.confirm()
                 .title('Question ?')
                 .textContent(attrs.ngReallyMessage)
                 .ariaLabel(attrs.ngReallyMessage)
                 //.targetEvent(ev)
                 .theme('confirm-hesperides-dialog')
                 .ok('Oui')
                 .cancel('Non');

                 $mdDialog.show(confirm).then(function() {
                 // To prevent '$digest already in progress' message
                 // see https://stackoverflow.com/questions/12729122/angularjs-prevent-error-digest-already-in-progress-when-calling-scope-apply
                 $timeout(function() {
                 scope.$apply(attrs.ngReallyClick);
                 });
                 }, function() {
                 //$scope.status = 'You decided to keep your debt.';
                 });
                 }*/
            });
        }
    }
}]);

hesperidesModule.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});

hesperidesModule.directive('newChildScope', function () {
    return {
        restrict: 'A',
        scope: true
    };
});

/**
 * Popover button.
 *
 * Partial code from Material Design.
 */
hesperidesModule.factory('$propertyToolButtonService', [function(){
    return { currentPopup: null };
}]);

hesperidesModule.directive('propertyToolButton', function ($mdUtil, $propertyToolButtonService) {
    return {
        restrict: 'E',
        scope: true,
        templateUrl: 'properties/property-tool-button.html'
    };
});

hesperidesModule.directive('propertyToolButtonOver', function ($mdUtil, $propertyToolButtonService,$timeout) {
    return {
        restrict: 'E',
        scope: true,
        template: '<div class="popover" ><property-tool-button /></div>',
        link: function (scope, element) {
            var parent = element.parent();
            var popover = element.children();

            // gestion d'un timer pour afficher la popup après 1 secondes (pour faciliter navigation mode arbre)
            var timer;

            // Display popup
            parent.on('mouseenter', function() {

                timer = $timeout(
                    function() {
                        var tooltipParent = angular.element(document.body);
                        var tipRect = $mdUtil.offsetRect(popover, tooltipParent);
                        var parentRect = $mdUtil.offsetRect(parent, tooltipParent);

                        var newPosition = {
                            left: parentRect.left + parentRect.width / 2 - tipRect.width / 2,
                            top: parentRect.top - tipRect.height
                        };

                        popover.css({
                            left: newPosition.left + 'px',
                            top: newPosition.top + 'px'
                        });

                        if ($propertyToolButtonService.currentPopup)  {
                            $propertyToolButtonService.currentPopup.removeClass('popover-hover');
                        }

                        element.children().addClass('popover-hover');
                        $propertyToolButtonService.currentPopup = element.children();
                    },
                    1000
                );
            });

            // Hide popup
            parent.on('mouseleave', function() {
                $timeout.cancel(timer);
                element.children().removeClass('popover-hover');
                $propertyToolButtonService.currentPopup = null;
            });
        }
    };
});

hesperidesModule.filter('interpolate', ['version', function (version) {
    return function (text) {
        return String(text).replace(/\%VERSION\%/mg, version);
    };
}]);

hesperidesModule.directive('konami', function() {
    return {
        restrict: 'E',
        scope: {name: '@'},
        link: function(scope, element, attrs) {
            var keys = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
            var i = 0;
            $(document).keydown(function(e) {
                if(e.keyCode === keys[i++]) {
                    if(i === keys.length) {
                        $(document).unbind('keydown', arguments.callee);
                        //Konami code is active, do some fun stuff here
                        element.append('<img src="img/' + scope.name + '" width="100%" />');
                    }
                } else {
                    i = 0;
                }
            });
        }
    }
});

hesperidesModule.factory('$hesperidesHttp', ['$http', '$q', function($http, $q){
    var returnResponseAndHideLoadingSucces = function(response) {
        $('#loading').hide();
        return $q.resolve(response);
    };

    var returnResponseAndHideLoadingError = function(response) {
        $('#loading').hide();
        return $q.reject(response);
    };

    return {
        get: function(url, config) {
            $('#loading').show();

            return $http.get(url, config).then(returnResponseAndHideLoadingSucces, returnResponseAndHideLoadingError);
        },
        head: function(url, config) {
            $('#loading').show();

            return $http.head(url, config).then(returnResponseAndHideLoadingSucces, returnResponseAndHideLoadingError);
        },
        post: function(url, data, config) {
            $('#loading').show();

            return $http.post(url, data, config).then(returnResponseAndHideLoadingSucces, returnResponseAndHideLoadingError);
        },
        put: function(url, data, config) {
            $('#loading').show();

            return $http.put(url, data, config).then(returnResponseAndHideLoadingSucces, returnResponseAndHideLoadingError);
        },
        delete: function(url, config) {
            $('#loading').show();

            return $http.delete(url, config).then(returnResponseAndHideLoadingSucces, returnResponseAndHideLoadingError);
        },
        jsonp: function(url, config) {
            $('#loading').show();

            return $http.jsonp(url, config).then(returnResponseAndHideLoadingSucces, returnResponseAndHideLoadingError);
        },
        patch: function(url, data, config) {
            $('#loading').show();

            return $http.patch(url, data, config).then(returnResponseAndHideLoadingSucces, returnResponseAndHideLoadingError);
        }
    };
}]);

/**
 * This is used to auto scroll to the bottom of the
 * page when edit button is clicked !
 * Added by Tidane SIDIBE on 04/04/2016
 *
 *
 hesperidesModule.directive('hesperidesScroll', function ($timeout){
    return {
        restrict: 'A',
        controller: ['$scope', '$location', '$anchorScroll', function ($scope, $location, $anchorScroll){
            $scope.scroll = function (){
                $location.hash('properties-list');
                $timeout(function (){
                    $anchorScroll();
                }, 500);
            }
        }],
        link: function (scope, element, attr){
            element.on('click', function (){
                scope.scroll();
            })
        }
    }
});
 **/
hesperidesModule.directive('hesperidesCompareDateTime', function (){
    return {
        scope: {
            ngModel: '=',
            isValid: '='
        },

        templateUrl: 'hesperides/hesperides-compare-date-time.html',
        link:function (scope){
            //-- date for start
            var date = new Date();
            var year = date.getFullYear();
            var month = date.getMonth()+1;
            var day = date.getDate();

            if(day < 10){
                day = '0' + day;
            }

            if(month < 10){
                month = '0' + month;
            }

            //all in scope !
            scope.year = year;
            scope.month = month;
            scope.day = day;
            scope.holder = date;

            // Private function for date validation
            var validate = function (){
                scope.isValid = false;
                if (scope.ngModel && scope.ngModel.length > 0)
                    scope.isValid = +moment(scope.ngModel, "YYYY-MM-DD HH:mm:ss Z") < (new Date()).getTime();
            };

            //Watch the model
            scope.$watch('ngModel', function (newVal, oldVal){
                validate();
            });
        },
        controller: ['$scope', function ($scope){

                $scope.isInFutur = function () {
                    return !$scope.isValid && $scope.ngModel && $scope.ngModel.length > 0;
                }
            }
        ]
    }
});

/**
 * A commom service for color calculation
 */
hesperidesModule.service ('PlatformColorService', function (){
    return {

        /**
         * Getting a color according to input.
         * @param {String} name : the input string
         */
        calculateColor: function (name, color){

            /**
             * Private utility function that calculates
             * a RGB color code according to the input string
             */
            pastelColour = function(name) {

                // These are the default colors
                var baseRed = 220;
                var baseGreen = 220;
                var baseBlue = 220;

               if(color != null){
                    baseRed = color.red;
                    baseGreen = color.green;
                    baseBlue = color.blue;
                }else{

                    var isColorSettingActive = store.get('color_active');

                    if ( isColorSettingActive === true ){

                            baseRed = store.get('color_red') || baseRed;
                            baseGreen = store.get('color_green') || baseGreen;
                            baseBlue = store.get('color_blue') || baseGreen;
                    }else{
                        return { red: 255, green: 255, blue: 255 };
                    }

                }

                //lazy seeded random hack to get values from 0 - 256
                //for seed just take bitwise XOR of first two chars
                var seed = name.charCodeAt(0) ^ name.charCodeAt(1) ^ name.charCodeAt(2);
                var rand_1 = Math.abs((Math.sin(seed++) * 10000)) % 256;
                var rand_2 = Math.abs((Math.sin(seed++) * 10000)) % 256;
                var rand_3 = Math.abs((Math.sin(seed) * 10000)) % 256;

                //build colour
                var red = Math.round((rand_1 + baseRed) / 2);
                var green = Math.round((rand_2 + baseGreen) / 2);
                var blue = Math.round((rand_3 + baseBlue) / 2);

                return { red: red, green: green, blue: blue };
            };

            // get the final color in rgb
            var bgColor;
            var rgb_pastel = pastelColour(name);
            bgColor = "rgb("+rgb_pastel.red+", "+rgb_pastel.green+", "+rgb_pastel.blue+")";
            return bgColor;
        }
    };
});

hesperidesModule.factory('Comment', [function() {

    var Comment = function (data){
        var me = this;

        // Attributes
        this.comment = data.comment || "~ ~ ~";

        this.date = moment();
        if (data.date != undefined) {
            this.date = moment(data.date, "YYYY-MM-DD HH:mm:ss Z")
        }

        // Methods
        this.prettify = function () {
//            return "[" + me.date.format("YYYY-MM-DD") + "] : " + me.comment;
            return me.comment;
        };

    };

    return Comment;
}]);

hesperidesModule.service('Comments', ['Comment', function(Comment) {

    RegExp.escape = function(s) {
        s = s || "";
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    };

    var local_storage_key = 'comments_history';
    var comments_history;

    function Comments() {

    };

    function get() {
        comments_history = store.get(local_storage_key);
        if (comments_history == undefined) {
            comments_history = {};
        }
    };

    function save() {
        store.set(local_storage_key, comments_history);
    }

    Comments.prototype = {
        getComments: function (application_name) {
            get();
            if (comments_history[application_name] && comments_history[application_name].length) {
                return comments_history[application_name].map(function (elem) {
                    return new Comment(elem);
                });
            }
            return [];
        },
        getCommentsLike: function (application_name, query) {
            query = RegExp.escape(query).split(' ').join('.*').toLowerCase();
            return _.filter(this.getComments(application_name), c => c.comment.toLowerCase().match('.*' + (query ? query : '') + '.*')).sort(function (a, b) {return b.date - a.date;});
        },
        commentExist: function (application_name, comment) {
            comments = this.getComments(application_name);
            return _.filter(comments, c => c.comment == comment).length > 0 ? true : false;
        },
        addComment: function (application_name, comment) {
            var comments = this.getComments(application_name);

            if (this.commentExist(application_name, comment) == false) {
                comments.push(new Comment({"comment": comment}));
            } else {
                _.map(comments, function (elem) {
                    if (elem.comment == comment) {
                        elem.date = moment();
                    }
                });
            }
            comments_history[application_name] = comments;
            save();
        },
        isCommentValid: function (comment) {
            if (comment == undefined) { return false; }
            _temp = comment.split (" ");
            return ( comment.length < 10 || _temp.length < 2 ) ? false : true;;
        }
    };
    return Comments;
}]);

/* Hesperides global modals module*/
angular.module ('hesperides.modals', [])

.factory('HesperidesModalFactory', ['$mdDialog', 'Comments', function ($mdDialog, Comments){
    return {
    
        displaySavePropertiesModal: function (scope, application, validationCallback){
            //
            // Show the modal
            //
            var modalScope = scope.$new(false);

            modalScope.comments = new Comments();
            modalScope.application_name = application;


            var modal = $mdDialog.show({
                templateUrl: 'application/properties/save-properties-modal.html',
                clickOutsideToClose:true,
                scope: modalScope
            });

            modalScope.sync_search_text = function (selected_comment) {
                modalScope.raw_comment = selected_comment && selected_comment.length > 0 ? selected_comment.comment : modalScope.raw_comment;
            }

            //
            // Close the events modal
            //
            modalScope.$closeDialog = function() {
                $mdDialog.cancel();
            };

            //
            // Validation action
            //
            modalScope.saveAction = function () {
                // Calling the callback function with the comment
                modalScope.comments.addComment(modalScope.application_name, modalScope.raw_comment)
                validationCallback( modalScope.raw_comment );

                modalScope.$closeDialog();
            }
        }
    };
}]);
