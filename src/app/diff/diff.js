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

function buildDiffDiffPageUrl(fromPlatform, toPlatform, fromPropertiesPath, toPropertiesPath, lookPast, date) {
    const urlParams = {
        application: fromPlatform.application_name,
        platform: fromPlatform.name,
        properties_path: fromPropertiesPath,
        compare_application: toPlatform.application_name,
        compare_platform: toPlatform.name,
        compare_path: toPropertiesPath,
    };
    if (lookPast) {
        urlParams.timestamp = date;
    }
    return `/#/diff?${ Object.keys(urlParams).map((key) => `${ encodeURIComponent(key) }=${ encodeURIComponent(urlParams[key]) }`).join('&') }`;
}

angular.module('hesperides.diff', [])

    .controller('DiffController', function ($filter, $scope, $routeParams, $timeout, $route, ApplicationService, ModuleService, $translate, HesperidesModalFactory, Platform, notify) {
        var DiffContainer = function (status, property_name, property_to_modify, property_to_compare_to) {
            // 0 -> only on to_modify
            // 1 -> on both and identical values
            // 2 -> on both and different values
            // 3 -> only on to_compare_to
            this.status = status;
            this.property_name = property_name;
            this.property_to_modify = property_to_modify;
            this.property_to_compare_to = property_to_compare_to;
            this.modified = false;
            this.selected = false;
        };

        $scope.application_name = $routeParams.application;
        $scope.platform_name = $routeParams.platform;

        $scope.compare_application = $routeParams.compare_application;
        $scope.compare_platform = $routeParams.compare_platform;

        $scope.origin_timestamp = $routeParams.origin_timestamp;
        $scope.timestamp = $routeParams.timestamp;

        $scope.show_only_modified = false;

        $scope.displayable_properties_path = Platform.prettify_path($routeParams.properties_path);
        $scope.displayable_compare_path = Platform.prettify_path($routeParams.compare_path);

        $scope.propertiesKeyFilter0 = '';
        $scope.propertiesKeyFilter1 = '';
        $scope.propertiesKeyFilter2 = '';
        $scope.propertiesKeyFilter3 = '';

        var splitedPropertiesPath = $routeParams.properties_path.split('#');
        $scope.module = {
            'name': splitedPropertiesPath[splitedPropertiesPath.length - 3],
            'version': splitedPropertiesPath[splitedPropertiesPath.length - 2],
            'is_working_copy': splitedPropertiesPath[splitedPropertiesPath.length - 1] === 'WORKINGCOPY',
        };

        var compareSplitedPath = $routeParams.compare_path.split('#');
        $scope.compare_module = {
            'name': compareSplitedPath[compareSplitedPath.length - 3],
            'version': compareSplitedPath[compareSplitedPath.length - 2],
            'is_working_copy': compareSplitedPath[compareSplitedPath.length - 1] === 'WORKINGCOPY',
        };

        // Get the platform to get the version id
        ApplicationService.get_platform($routeParams.application, $routeParams.platform).then((platform) => {
            $scope.platform = platform;
        });

        // Then get the properties, version id could have changed but it is really marginal
        ApplicationService.get_properties($routeParams.application, $routeParams.platform, $routeParams.properties_path).then(function (properties) {
            $scope.properties_to_modify = properties;
            if ($scope.module.name && $scope.module.version) {
                return ModuleService.get_model($scope.module).then(function (model) {
                    $scope.properties_to_modify = $scope.properties_to_modify.mergeWithModel(model);
                });
            }
            return Promise.resolve();
        })
            .then(() => ApplicationService.get_properties($routeParams.application, $routeParams.platform, '#'))
            .then(function (globalProperties) {
                $scope.properties_to_modify = $scope.properties_to_modify.mergeWithGlobalProperties(globalProperties);
                return ApplicationService.get_properties($routeParams.compare_application, $routeParams.compare_platform, $routeParams.compare_path, $routeParams.timestamp);
            })
            .then(function (properties) {
                $scope.properties_to_compare_to = properties;
                if ($scope.compare_module.name && $scope.compare_module.version) {
                    return ModuleService.get_model($scope.compare_module).then(function (model) {
                        $scope.properties_to_compare_to = $scope.properties_to_compare_to.mergeWithModel(model);
                    });
                }
                return Promise.resolve();
            })
            .then(() => ApplicationService.get_properties($routeParams.compare_application, $routeParams.compare_platform, '#'))
            .then(function (model) {
                $scope.properties_to_compare_to = $scope.properties_to_compare_to.mergeWithGlobalProperties(model);
                $scope.properties_to_modify = $scope.properties_to_modify.mergeWithDefaultValue();
                $scope.properties_to_compare_to = $scope.properties_to_compare_to.mergeWithDefaultValue();
                $scope.generate_diff_containers($routeParams.properties_path !== '#');
            });

        // Everything needs to be in scope for this function to work
        /**
         * Generate diff container.
         *
         * @param filterInModel Global properties are store in root path '#'. If we compare this path, don't remove properties are not in model.
         */
        $scope.generate_diff_containers = function (filterInModel) {
            $scope.diff_containers = [];
            // Group properties, this is a O(n^2) algo but is enough for the use case
            // Only focus on key/value properties
            // We set create a container for each property with a diff status, a property_to_modify, a property_to_compare_to
            // First we look in the properties to modify, for each try:
            //  - to check if value is empty -> status 3
            //  - to find a property to compare to
            //        - with identical value -> status 1
            //        - with different value -> status 2
            //  - if no matching property -> status 0
            if (filterInModel) {
                // There's not need to keep removed properties because readability is better without them
                $scope.properties_to_modify.key_value_properties = _.filter($scope.properties_to_modify.key_value_properties, { inModel: true });
                $scope.properties_to_compare_to.key_value_properties = _.filter($scope.properties_to_compare_to.key_value_properties, { inModel: true });
            }

            _.each($scope.properties_to_modify.key_value_properties, function (prop_to_modify) {
                // Search if property found on other platform
                var countItem = _.findIndex($scope.properties_to_compare_to.key_value_properties, prop_to_modify.name);

                if (countItem === 0) {
                    $scope.diff_containers.push(new DiffContainer(0, prop_to_modify.name, prop_to_modify, {}));
                    return;
                }

                // else try to find a matching prop_to_compare_to
                var prop_to_compare_to = _.find($scope.properties_to_compare_to.key_value_properties, { name: prop_to_modify.name });

                if (_.isUndefined(prop_to_compare_to)) {
                    $scope.diff_containers.push(new DiffContainer(0, prop_to_modify.name, prop_to_modify, {}));
                } else if (prop_to_modify.value === prop_to_compare_to.value) {
                    $scope.diff_containers.push(new DiffContainer(1, prop_to_modify.name, prop_to_modify, prop_to_compare_to));
                } else {
                    $scope.diff_containers.push(new DiffContainer(2, prop_to_modify.name, prop_to_modify, prop_to_compare_to));
                }
            });

            // Check properties remaining in compare_to (not existing or value equals to ''). The one we missed when iterating through properties_to_modify
            _.each($scope.properties_to_compare_to.key_value_properties, function (prop_to_compare_to) {
                var some = _.some($scope.properties_to_modify.key_value_properties, function (prop) {
                    return prop_to_compare_to.name === prop.name;
                });

                if (!some) {
                    // Avoid null pointer create prop to modify with an empty value
                    var prop_to_modify = angular.copy(prop_to_compare_to);
                    prop_to_modify.value = '';
                    $scope.diff_containers.push(new DiffContainer(3, prop_to_modify.name, prop_to_modify, prop_to_compare_to));
                }
            });
        };

        $scope.properties_compare_values_empty = '';

        $translate('properties.compare.values.empty').then(function (translation) {
            $scope.properties_compare_values_empty = translation;
        });

        $scope.formatProperty = function (property) {
            if (property.globalValue) {
                var compiled = property.value;

                Object.keys(property.globalValue).forEach(function (key) {
                    compiled = compiled.split(`{{${ key }}}`).join(property.globalValue[key]);
                });

                return compiled;
            }
            if (!property.value) {
                return $scope.properties_compare_values_empty;
            }

            return property.value;
        };

        // Helper for diff conainers ids
        $scope.dot_to_underscore = function (text) {
            return text.replace(/\./g, '_');
        };

        /*
         * Select the containers that corresponds to the filters (ex: status = 2).
         */
        $scope.toggle_selected_to_containers_with_filter = function (filter, selected, propertiesKeyFilter) {
            $scope.diff_containers.filter(function (container) {
                // If user filter the properties'diff by name or regex, we use this filter to make a first selection for the containers
                if (propertiesKeyFilter) {
                    try {
                        var regex_name = new RegExp(`.*${ propertiesKeyFilter.toLowerCase().split(' ').join('.*') }`, 'i');
                        if (!regex_name.test(container.property_name)) {
                            return false;
                        }
                    } catch (error) {
                        return false;
                    }
                }

                // We apply the other filters to select the containers that we want
                for (var key in filter) {
                    if (!_.isEqual(filter[key], container[key])) {
                        return false;
                    }
                }

                return true;
            }).forEach(function (container) {
                // Finally, we change the selection of the selected containers
                container.selected = selected;
            });
        };

        $scope.apply_diff = function () {
            /* Filter the diff container that have been selected
             depending on the status apply different behaviors
             if status == 0 : this should not happened because it is values that are only in the destination platform, so just ignore it
             if status == 1 : normaly the only selected containers should be the one that have been modified, but it does not really matter
             because the other ones have the same values. We can just apply the 'revert modification' mecanism
             if status == 2 : this is when we want to apply modification from sourc epltfm to destination pltfm
             if status == 3 : same behavior as status == 2
             */
            $scope.diff_containers.filter(function (diff_container) {
                return diff_container.selected;
            }).forEach(function (diff_container) {
                switch (diff_container.status) {
                case 0:
                    break;
                case 1:
                // Revert modifs
                    diff_container.property_to_modify.value = diff_container.property_to_modify.old_value;
                    delete diff_container.property_to_modify.old_value;

                    // Change status and reset markers. Keep selected for user experience
                    // Status depends on old_value, if it was empty status is 3 otherwise it is 2
                    diff_container.status = diff_container.property_to_modify.value === '' ? 3 : 2;
                    diff_container.modified = false;
                    break;
                case 2:
                // Store old value and apply modifs
                    diff_container.property_to_modify.old_value = diff_container.property_to_modify.value;
                    diff_container.property_to_modify.value = diff_container.property_to_compare_to.value;

                    // Change status and reset markers. Keep selected for user experience
                    diff_container.modified = true;
                    diff_container.status = 1;
                    break;
                case 3:
                // Same as 2, copy paste (bad :p )
                // Store old value and apply modifs
                    diff_container.property_to_modify.old_value = diff_container.property_to_modify.value;
                    diff_container.property_to_modify.value = diff_container.property_to_compare_to.value;

                    // Change status and reset markers. Keep selected for user experience
                    diff_container.modified = true;
                    diff_container.status = 1;
                    break;
                default:
                    console.error(`Diff container with invalid status -> ${ diff_container.status }. It will be ignored`);
                    break;
                }
            });
        };

        $scope.save_diff = function () {
            // Get all the properties modified
            var key_value_properties = $scope.diff_containers.filter(function (diff_container) {
                return diff_container.property_to_modify;
            }).map(function (diff_container) {
                return diff_container.property_to_modify;
            });

            // Is some diff item selected ?
            var hasSomeDiffSelected = _.some($scope.diff_containers, { selected: true });

            if (!hasSomeDiffSelected) {
                $translate('properties-not-changed.message').then(function (label) {
                    notify({ classes: [ 'error' ], message: label });
                });
                return;
            }

            $scope.properties_to_modify.key_value_properties = key_value_properties;

            // Save the properties
            HesperidesModalFactory.displaySavePropertiesModal($scope, $routeParams.application, function (comment) {
                ApplicationService.save_properties($routeParams.application, $scope.platform, $scope.properties_to_modify, $routeParams.properties_path, comment).then(function () {
                    $route.reload();
                });
            });
        };
    })

    .controller('PropertiesDiffWizardController', function ($scope, $window, $mdDialog, ApplicationService, PlatformColorService) {
        if (!$scope.fromPlatform) {
            throw new Error('.fromPlatform must be provided');
        }
        if (!$scope.fromModule) {
            throw new Error('.fromModule must be provided');
        }

        $scope.scope = $scope; // Pour permettre d'avoir un '.' dans les ng-model
        $scope.toPlatform = null;
        $scope.toModule = null;
        $scope.lookPast = false;
        $scope.date = null;

        // Get the list of platforms for an app
        $scope.getTargetPlatforms = function () {
            $scope.targetPlatforms = [];
            if ($scope.fromPlatform.application_name) {
                ApplicationService.get($scope.fromPlatform.application_name, true).then((application) => {
                    $scope.targetPlatforms = application.platforms;
                }).catch(_.noop);
            }
        };

        $scope.closePropertiesDiffWizard = function () {
            $mdDialog.cancel();
        };

        $scope.updatePlatformField = function (itemName) {
            $scope.fromPlatform.name = itemName;
        };

        $scope.backgroundColor = function (item) {
            return PlatformColorService.calculateColor(item.name);
        };

        $scope.getPlatformToCompare = function () {
            $scope.loadingComparePlatform = true;
            if ($scope.lookPast) {
                $scope.date = $scope.date ? Number(moment($scope.date, 'YYYY-MM-DD HH:mm:ss Z')) : new Date().getTime();
            } else {
                $scope.date = null;
            }
            ApplicationService.get_platform($scope.fromPlatform.application_name, $scope.fromPlatform.name, $scope.date).then(function (platformFetched) {
                $scope.loadingComparePlatform = false;
                $scope.toPlatform = platformFetched;
                $scope.toModule = _.find($scope.toPlatform.modules, { name: $scope.fromModule.name });
            });
        };

        $scope.isDiffAllowed = function () {
            const selectedPlatformInList = $scope.targetPlatforms && _.some($scope.targetPlatforms, { name: $scope.fromPlatform.name });
            return (!$scope.lookPast || $scope.dateValid) && selectedPlatformInList;
        };

        $scope.openDiffPage = function () {
            $mdDialog.hide();
            $window.open(buildDiffDiffPageUrl($scope.fromPlatform, $scope.toPlatform, $scope.fromModule.properties_path, $scope.toModule.properties_path, $scope.lookPast, $scope.date), '_blank');
        };

        // Construtor initialization:
        $scope.targetPlatforms = $scope.getTargetPlatforms();
    })

    .controller('GlobalPropertiesDiffWizardController', function ($scope, $window, $mdDialog, ApplicationService, PlatformColorService) {
        if (!$scope.fromPlatform) {
            throw new Error('.fromPlatform must be provided');
        }

        $scope.scope = $scope; // Pour permettre d'avoir un '.' dans les ng-model
        $scope.toPlatform = null;
        $scope.lookPast = false;
        $scope.date = null;

        // Get the list of platforms for an app
        $scope.getTargetPlatforms = function () {
            $scope.targetPlatforms = [];
            if ($scope.fromPlatform.application_name) {
                ApplicationService.get($scope.fromPlatform.application_name, true).then((application) => {
                    $scope.targetPlatforms = application.platforms;
                }).catch(_.noop);
            }
        };

        $scope.closeGlobalPropertiesDiffWizard = function () {
            $mdDialog.cancel();
        };

        $scope.updatePlatformField = function (itemName) {
            $scope.fromPlatform.name = itemName;
        };

        $scope.backgroundColor = function (item) {
            return PlatformColorService.calculateColor(item.name);
        };

        $scope.isDiffAllowed = function () {
            const selectedPlatformInList = $scope.targetPlatforms && _.some($scope.targetPlatforms, { name: $scope.fromPlatform.name });
            return (!$scope.lookPast || $scope.dateValid) && selectedPlatformInList;
        };

        $scope.openDiffPage = function () {
            $mdDialog.hide();
            $window.open(buildDiffDiffPageUrl($scope.fromPlatform, $scope.toPlatform, '#', '#', $scope.lookPast, $scope.date), '_blank');
        };

        // Construtor initialization:
        $scope.targetPlatforms = $scope.getTargetPlatforms();
    })

    .directive('moveFocusWhenEnabled', function ($document, $timeout) {
        return {
            restrict: 'A',
            scope: {
                ngModel: '<',
                target: '@',
            },
            link($scope, element) {
                element.on('click', () => {
                    $timeout(() => {
                        if ($scope.ngModel) {
                            angular.element($document[0].querySelector($scope.target)).focus();
                        }
                    });
                });
            },
        };
    })

    .directive('compareDateTime', function () {
        return {
            scope: {
                ngModel: '=',
                isValid: '=',
            },
            templateUrl: './compare-date-time.html',
            link(scope) {
            // -- date for start
                var date = new Date();
                var year = date.getFullYear();
                var month = date.getMonth() + 1;
                var day = date.getDate();

                if (day < 10) {
                    day = `0${ day }`;
                }

                if (month < 10) {
                    month = `0${ month }`;
                }

                // all in scope !
                scope.year = year;
                scope.month = month;
                scope.day = day;
                scope.holder = date;

                // Private function for date validation
                var validate = function () {
                    scope.isValid = false;
                    if (scope.ngModel && scope.ngModel.length > 0) {
                        scope.isValid = Number(moment(scope.ngModel, 'YYYY-MM-DD HH:mm:ss Z')) < (new Date()).getTime();
                    }
                };

                // Watch the model
                scope.$watch('ngModel', validate);
            },
            controller($scope) {
                $scope.isInFutur = function () {
                    return !$scope.isValid && $scope.ngModel && $scope.ngModel.length > 0;
                };
            },
        };
    })

    /**
     * Diplay warning message when value is same/or not and source of value is different.
     */
    .directive('warningValue', function () {
        return {
            restrict: 'E',
            scope: {
                propertyToModify: '=',
                propertyToCompareTo: '=',
            },
            template: '<span class="glyphicon glyphicon-exclamation-sign" ng-if="propertyToModify.inGlobal != propertyToCompareTo.inGlobal || propertyToModify.inDefault != propertyToCompareTo.inDefault">' +
        '<md-tooltip ng-if="propertyToModify.inGlobal != propertyToCompareTo.inGlobal">Valorisé depuis un propriété globale</md-tooltip>' +
        '<md-tooltip ng-if="propertyToModify.inDefault != propertyToCompareTo.inDefault">' +
        'La valeur sur l\'application' +
        'est valorisée depuis une valeur par défaut' +
        '</md-tooltip>' +
        '</span>',
        };
    });
