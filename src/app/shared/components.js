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
angular.module('hesperides.components', [])

    .filter('filterPlatform', function () {
        return function (items, filter) {
            return _.filter(items, function (item) {
                if (_.isUndefined(filter) || _.isEmpty(filter)) {
                    return item;
                }
                var regex_name = new RegExp(filter, 'i');
                return regex_name.test(item.name) || regex_name.test(item.application_version) ? item : null;
            });
        };
    })

    .directive('listOfItems', [
        '$parse', 'PlatformColorService', function ($parse, PlatformColorService) {
            return {
                restrict: 'E',
                scope: {
                    items: '=',
                    selectedItem: '=',
                    selectable: '=',
                    editable: '=',
                    filter: '=',
                },
                templateUrl: 'shared/list-of-items.html',
                link(scope, element, attrs) {
                    scope.typeahead = attrs.typeaheadexpression;
                    if (!_.isUndefined(scope.typeahead)) {
                        scope.type = 'search';
                    }
                    scope.size = attrs.size;
                    scope.input = {};
                    scope.tooltip = attrs.tooltip;

                    scope.cssClass = function (item) {
                        var listClass = '';

                        if (item === scope.selectedItem) {
                            listClass += ` ${ attrs.css }`;
                        } else {
                            listClass += ' md-clear';
                        }

                        if (scope.selectable) {
                            listClass += ' md-raised';
                        }

                        return listClass;
                    };

                    scope.backgroundColor = function (item) {
                        return PlatformColorService.calculateColor(item.name);
                    };

                    scope.selfLabel = function (item) {
                        return $parse(attrs.label)(scope.$parent, { $item: item });
                    };

                    scope.sortOn = function (item) {
                        return $parse(attrs.sorton)(scope.$parent, { $item: item });
                    };

                    scope.selfEdit = function (item) {
                        if (scope.selectable) {
                            $parse(attrs.onedit)(scope.$parent, { $item: item });
                            scope.selectedItem = item;
                        }
                    };

                    scope.selfDelete = function (item) {
                        scope.selectedItem = null;
                        $parse(attrs.ondelete)(scope.$parent, { $item: item });
                    };

                    scope.selfAdd = function (name) {
                        if (name) {
                            $parse(attrs.createfunction)(scope.$parent, { $name: name });
                            scope.resetAndHideInput();
                        }
                    };

                    scope.resetAndHideInput = function () {
                        scope.show_input = false;
                        scope.input.inputText = '';
                    };

                    scope.showInput = function () {
                        scope.show_input = true;
                    };
                },
            };
        },
    ])

    .directive('listOfLinks', [
        '$parse', 'PlatformColorService', '$window', function ($parse, PlatformColorService, $window) {
            return {
                restrict: 'E',
                scope: {
                    items: '=',
                    selectedItem: '=',
                    filter: '=',
                },
                templateUrl: 'shared/list-of-links.html',
                link(scope, element, attrs) {
                    scope.typeahead = attrs.typeaheadexpression;
                    if (!_.isUndefined(scope.typeahead)) {
                        scope.type = 'search';
                    }
                    scope.size = attrs.size;
                    scope.input = {};
                    scope.tooltip = attrs.tooltip;

                    scope.cssClass = function (item) {
                        var listClass = '';

                        if (item === scope.selectedItem) {
                            listClass += ` ${ attrs.css }`;
                        } else {
                            listClass += ' md-clear';
                        }

                        if (scope.selectable) {
                            listClass += ' md-raised';
                        }

                        return listClass;
                    };

                    scope.backgroundColor = function (item) {
                        return PlatformColorService.calculateColor(item.name);
                    };

                    scope.selfLabel = function (item) {
                        return $parse(attrs.label)(scope.$parent, { $item: item });
                    };

                    scope.sortOn = function (item) {
                        return $parse(attrs.sorton)(scope.$parent, { $item: item });
                    };

                    scope.openLink = function (item) {
                        $window.open(`/#${ $parse(attrs.href)(scope.$parent, { $item: item }) }`, '_blank');
                    };
                },
            };
        },
    ]);
