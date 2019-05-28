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

angular.module('hesperides', [
    'angularjs-datetime-picker',
    'mgo-angular-wizard',
    'ngRoute',
    'ngMaterial',
    'ngAnimate',
    'pascalprecht.translate',
    'scDateTime',
    'ui.codemirror',
    'vs-repeat',
    'xeditable',
    'hesperides.components',
    'hesperides.diff',
    'hesperides.localChanges',
    'hesperides.module',
    'hesperides.menu',
    'hesperides.properties',
    'hesperides.techno',
    'hesperides.template',
    'hesperides.user',
// cf. https://github.com/sc-date-time/sc-date-time#options pour les 2 configs ci-dessous :
]).value('scDateTimeConfig', {
    defaultTheme: 'sc-date-time/hesperides.tpl',
    autosave: true,
    displayTwentyfour: true,
    compact: true,
}).value('scDateTimeI18n', {
    weekdays: [ 'D', 'L', 'M', 'M', 'J', 'V', 'S' ],
    calendar: 'Calendrier',
})
    .config([
        '$routeProvider', '$mdThemingProvider', '$ariaProvider', '$mdIconProvider', '$translateProvider', '$locationProvider',
        function ($routeProvider, $mdThemingProvider, $ariaProvider, $mdIconProvider, $translateProvider, $locationProvider) {
            $mdIconProvider.fontSet('fa', 'fontawesome');

            $translateProvider.useSanitizeValueStrategy('escaped');

            $locationProvider.html5Mode(false).hashPrefix('');

            var configureTranslation = function () {
                $translateProvider.useStaticFilesLoader({
                    prefix: '/i18n/label_',
                    suffix: '.json',
                });
                if (store.get('language') === 'fr') {
                    $translateProvider.preferredLanguage('fr');
                    $translateProvider.fallbackLanguage('fr');
                } else {
                    $translateProvider.preferredLanguage('en');
                    $translateProvider.fallbackLanguage('en');
                }
            };

            $routeProvider
                .when('/module/:name/:version', {
                    templateUrl: 'module/module.html',
                    controller: 'ModuleController',
                })
                .when('/properties/:application', {
                    templateUrl: 'properties/properties.html',
                    controller: 'PropertiesController',
                    reloadOnSearch: false, // "reload route when only $location.search() or $location.hash() changes." - cf. routeUpdateListener au-dessus
                })
                .when('/diff', {
                    templateUrl: 'diff/diff.html',
                    controller: 'DiffController',
                })
                .when('/techno/:name/:version', {
                    templateUrl: 'techno/techno.html',
                    controller: 'TechnoController',
                })
                .otherwise({
                    templateUrl: 'welcome_screen.html',
                    controller: 'WelcomeController',
                });

            // Material design theming
            $mdThemingProvider.theme('default')
                .primaryPalette('teal')
                .accentPalette('orange');

            // Deactivate Aria
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
                bindKeypress: false,
            });

            configureTranslation();
        },
    ])

    .run(function (editableOptions, editableThemes, $rootScope, $http, $location, $route, $document, UserService, notify) {
        editableOptions.theme = 'default';

        // overwrite submit button template
        editableThemes.default.submitTpl = '<md-button class="md-raised md-primary" ng-click="$form.$submit()"><i class="fa fa-check"></i></md-button>';
        editableThemes.default.cancelTpl = '<md-button class="md-raised md-warn" ng-click="$form.$cancel()"><i class="fa fa-times"></i></md-button>';

        /**
         * Hack to calculate correctly margin of calendar.
         *
         * @param calendar calendar var in scope of calendar
         * @param cssClass css class of fisrt day
         * @returns {string}
         */
        $rootScope.offsetMargin = function (calendar, cssClass) {
            var objs = $document[0].querySelectorAll(`.${ cssClass }`);
            var selectedObj = null;
            for (var index = 0; index < objs.length; index++) {
                selectedObj = objs[index];

                if (selectedObj.getAttribute('aria-label') === '1') {
                    break;
                }
            }
            var calendarOffsetMagin = 0;
            if (selectedObj && selectedObj.clientWidth) {
            // eslint-disable-next-line no-underscore-dangle
                calendarOffsetMagin = (new Date(calendar._year, calendar._month).getDay() * selectedObj.clientWidth);
            }
            return `${ calendarOffsetMagin }px`;
        };

        // reloadOnSearch ne fait pas de distinction entre $location.search() & $location.hash()
        // Or nous voulons uniquement déclencher un reload en cas de changement de search :
        var lastHash = null;
        $rootScope.$on('$routeUpdate', function routeUpdateListener(ngEvent, current) {
            if (current.loadedTemplateUrl !== 'properties/properties.html') {
                throw new Error('Unexpected $routeUpdate - Cet événement ne devrait être déclenché que lorsque reloadOnSearch == false');
            }
            var triggerReload = !$location.hash() || $location.hash() === lastHash;
            // console.log('$routeUpdate', lastHash, triggerReload, $location.hash());
            if (triggerReload) {
            // cf. https://github.com/angular/angular.js/blob/master/src/ngRoute/route.js#L635
                $route.reload();
            }
            lastHash = $location.hash();
        });

        // On tente de se connecter systématiquement :
        UserService.authenticate();

        // eslint-disable-next-line angular/module-getter
        notify.config({ position: 'right' });
    })


    .factory('Page', function () {
        var base = 'Hesperides';
        var title = base;
        return {
            title() {
                return title;
            },
            setTitle(newTitle) {
                title = `${ base } > ${ newTitle }`;
            },
        };
    })

    .controller('TitleController', [
        '$scope', 'Page', function ($scope, Page) {
            $scope.Page = Page;
        },
    ])

    .controller('WelcomeController', [
        '$scope', '$location', function ($scope, $location) {
            $scope.applications = store.get('applications');
            $scope.openApplication = function (app) {
                $location.path(`/properties/${ app }`);
            };
        },
    ])

    .directive('ngReallyClick', function () {
        return {
            restrict: 'A',
            link(scope, element, attrs) {
                element.bind('click', function () {
                    if (attrs.ngReallyMessage && confirm(attrs.ngReallyMessage)) {
                        scope.$apply(attrs.ngReallyClick);
                    }
                });
            },
        };
    })

    .directive('ngEnter', function () {
        return function (scope, element, attrs) {
            element.bind('keydown keypress', function (event) {
                if (event.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attrs.ngEnter);
                    });

                    event.preventDefault();
                }
            });
        };
    })

    .filter('interpolate', [
        'version', function (version) {
            return function (text) {
                return String(text).replace(/%VERSION%/mg, version);
            };
        },
    ])

    .directive('konami', function ($rootElement) {
        return {
            restrict: 'E',
            scope: { name: '@' },
            link(scope, element) {
                var keys = [ 38, 38, 40, 40, 37, 39, 37, 39, 66, 65 ];
                var seqIndex = 0;
                $rootElement.on('keydown', function (event) {
                    if (event.keyCode === keys[seqIndex++]) {
                        if (seqIndex === keys.length) {
                        // eslint-disable-next-line no-caller
                            $rootElement.off('keydown', arguments.callee);
                            // Konami code is active, do some fun stuff here
                            element.append(`<img src="img/${ scope.name }" width="100%" />`);
                        }
                    } else {
                        seqIndex = 0;
                    }
                });
            },
        };
    })

    .factory('$hesperidesHttp', [
        '$http', '$q', '$rootScope', function ($http, $q, $rootScope) {
            var returnResponseAndHideLoadingSucces = function (response) {
                $rootScope.isLoading = false;
                return $q.resolve(response);
            };

            var returnResponseAndHideLoadingError = function (response) {
                $rootScope.isLoading = false;
                return $q.reject(response);
            };

            return {
                get(url, config) {
                    $rootScope.isLoading = true;
                    return $http.get(url, config).then(returnResponseAndHideLoadingSucces, returnResponseAndHideLoadingError);
                },
                head(url, config) {
                    $rootScope.isLoading = true;
                    return $http.head(url, config).then(returnResponseAndHideLoadingSucces, returnResponseAndHideLoadingError);
                },
                post(url, data, config) {
                    $rootScope.isLoading = true;
                    return $http.post(url, data, config).then(returnResponseAndHideLoadingSucces, returnResponseAndHideLoadingError);
                },
                put(url, data, config) {
                    $rootScope.isLoading = true;
                    return $http.put(url, data, config).then(returnResponseAndHideLoadingSucces, returnResponseAndHideLoadingError);
                },
                delete(url, config) {
                    $rootScope.isLoading = true;
                    return $http.delete(url, config).then(returnResponseAndHideLoadingSucces, returnResponseAndHideLoadingError);
                },
                jsonp(url, config) {
                    $rootScope.isLoading = true;
                    return $http.jsonp(url, config).then(returnResponseAndHideLoadingSucces, returnResponseAndHideLoadingError);
                },
                patch(url, data, config) {
                    $rootScope.isLoading = true;
                    return $http.patch(url, data, config).then(returnResponseAndHideLoadingSucces, returnResponseAndHideLoadingError);
                },
            };
        },
    ])

    /**
     * A commom service for color calculation
     */
    .factory('PlatformColorService', function () {
        return {

            /**
         * Getting a color according to input.
         * @param {String} name : the input string
         */
            calculateColor(name, color) {
                var rgbPastel = { red: 255, green: 255, blue: 255 };
                if (color || store.get('color_active')) {
                    var baseRed = store.get('color_red') || 220;
                    var baseGreen = store.get('color_green') || 220;
                    var baseBlue = store.get('color_blue') || 220;
                    if (color) {
                        baseRed = color.red;
                        baseGreen = color.green;
                        baseBlue = color.blue;
                    }
                    // lazy seeded random hack to get values from 0 - 256
                    // for seed just take bitwise XOR of first two chars
                    // eslint-disable-next-line no-bitwise
                    var seed = name.charCodeAt(0) ^ name.charCodeAt(1) ^ name.charCodeAt(2);
                    var rand_1 = Math.abs((Math.sin(seed++) * 10000)) % 256;
                    var rand_2 = Math.abs((Math.sin(seed++) * 10000)) % 256;
                    var rand_3 = Math.abs((Math.sin(seed) * 10000)) % 256;
                    // build colour
                    var red = Math.round((rand_1 + baseRed) / 2);
                    var green = Math.round((rand_2 + baseGreen) / 2);
                    var blue = Math.round((rand_3 + baseBlue) / 2);
                    rgbPastel = { red, green, blue };
                }
                return `rgb(${ rgbPastel.red }, ${ rgbPastel.green }, ${ rgbPastel.blue })`;
            },
        };
    })

    .factory('Comment', function () {
        return function Comment(data) {
            this.comment = data.comment || '~ ~ ~';
            this.date = data.date ? moment(data.date, 'YYYY-MM-DD HH:mm:ss Z') : moment();
            this.prettify = () => this.comment;
        };
    })

    .factory('Comments', [
        'Comment', function (Comment) {
            var local_storage_key = 'comments_history';
            var comments_history = {};

            function Comments() {}

            function get() {
                comments_history = store.get(local_storage_key) || {};
            }

            function save() {
                store.set(local_storage_key, comments_history || null);
            }

            Comments.prototype = {
                getComments(application_name) {
                    get();
                    if (comments_history[application_name] && comments_history[application_name].length) {
                        return comments_history[application_name].map(function (elem) {
                            return new Comment(elem);
                        });
                    }
                    return [];
                },
                getCommentsLike(application_name, query) {
                    query = (query || '').replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&').split(' ').join('.*').toLowerCase();
                    return _.filter(this.getComments(application_name), function (item) {
                        return item.comment.toLowerCase().match(`.*${ query ? query : '' }.*`);
                    }).sort((comment1, comment2) => comment2.date - comment1.date);
                },
                commentExist(application_name, comment) {
                    var comments = this.getComments(application_name);
                    return _.filter(comments, function (item) {
                        return item.comment === comment;
                    }).length > 0;
                },
                addComment(application_name, comment) {
                    var comments = this.getComments(application_name);

                    if (this.commentExist(application_name, comment)) {
                        _.map(comments, function (elem) {
                            if (elem.comment === comment) {
                                elem.date = moment();
                            }
                        });
                    } else {
                        comments.push(new Comment({ comment }));
                    }
                    comments_history[application_name] = comments;
                    save();
                },
                isCommentValid(comment) {
                    if (!comment) {
                        return false;
                    }
                    var splittedComment = comment.split(' ');
                    return !((comment.length < 10 || splittedComment.length < 2));
                },
            };
            return Comments;
        },
    ]);

/* Hesperides global modals module*/
angular.module('hesperides.modals', []).factory('HesperidesModalFactory', [
    '$mdDialog', 'Comments', function ($mdDialog, Comments) {
        return {

            displaySavePropertiesModal(scope, application, validationCallback) {
            //
            // Show the modal
            //
                var modalScope = scope.$new(false);

                modalScope.comments = new Comments();
                modalScope.application_name = application;

                $mdDialog.show({
                    templateUrl: 'hesperides/save-properties-modal.html',
                    clickOutsideToClose: true,
                    scope: modalScope,
                });

                modalScope.sync_search_text = function (selected_comment) {
                    modalScope.raw_comment = selected_comment && selected_comment.length > 0 ? selected_comment.comment : modalScope.raw_comment;
                };

                //
                // Close the events modal
                //
                modalScope.$closeDialog = function () {
                    $mdDialog.cancel();
                };

                //
                // Validation action
                //
                modalScope.saveAction = function () {
                // Calling the callback function with the comment
                    modalScope.comments.addComment(modalScope.application_name, modalScope.raw_comment);
                    validationCallback(modalScope.raw_comment);

                    modalScope.$closeDialog();
                };
            },
        };
    },
]);
