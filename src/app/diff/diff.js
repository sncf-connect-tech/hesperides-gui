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

function buildDiffPageUrl(fromPlatform, toPlatform, fromPropertiesPath, toPropertiesPath, compareMode, lookPast, timestamp) {
    const urlParams = {
        application: fromPlatform.application_name,
        platform: fromPlatform.platform,
        properties_path: fromPropertiesPath,
        compare_application: toPlatform.application_name,
        compare_platform: toPlatform.platform,
        compare_path: toPropertiesPath,
        compare_stored_values: compareMode === 'stored',
    };
    if (lookPast) {
        urlParams.timestamp = timestamp;
    }
    return `/#/diff?${ Object.keys(urlParams).map((key) => `${ encodeURIComponent(key) }=${ encodeURIComponent(urlParams[key]) }`).join('&') }`;
}

function dateToTimestamp(lookPast, date) {
    var timestamp = null;
    if (lookPast) {
        timestamp = date ? Number(moment(date, 'YYYY-MM-DD HH:mm:ss Z')) : new Date().getTime();
    }
    return timestamp;
}

angular.module('hesperides.diff', [])

    .controller('DiffController', function ($filter, $scope, $routeParams, $timeout, $route, ApplicationService, ModuleService, $translate, HesperidesModalFactory, Platform, Properties, notify) {
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
        $scope.compareStoredValues = Boolean($routeParams.compare_stored_values && $routeParams.compare_stored_values !== 'false');

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

        $scope.togglePropertyDetails = false;

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

        $scope.previewChanges = function () {
            /* Filter the diff container that have been selected
             depending on the status apply different behaviors
                 if status == 0 : this should not happened because it is values that are only in the destination platform, so just ignore it
                 if status == 1 : normaly the only selected containers should be the one that have been modified, but it does not really matter
                    because the other ones have the same values. We can just apply the 'revert modification' mecanism
                 if status == 2 : this is when we want to apply modification from source platform to destination platform
                 if status == 3 : same behavior as status == 2
             */
            $scope.diff_containers.filter((diff_container) => diff_container.selected)
                .forEach((diff_container) => {
                    switch (diff_container.status) {
                    case 0: // only left
                        break;
                    case 1: // common
                        // Revert modifs
                        diff_container.property_to_modify.value = diff_container.property_to_modify.old_value;
                        delete diff_container.property_to_modify.old_value;

                        // Change status and reset markers. Keep selected for user experience
                        // Status depends on old_value, if it was empty status is 3 otherwise it is 2
                        diff_container.status = diff_container.property_to_modify.value ? 2 : 3;
                        diff_container.modified = false;
                        break;
                    case 2: // differing
                    case 3: // only right
                        // Store old value and apply modifs
                        diff_container.property_to_modify.old_value = diff_container.property_to_modify.value;
                        diff_container.property_to_modify.value = diff_container.property_to_compare_to.value;

                        // Change status and reset markers. Keep selected for user experience
                        diff_container.modified = true;
                        diff_container.status = 1;
                        break;
                    default:
                        throw new Error(`Diff container with invalid status -> ${ diff_container.status }. It will be ignored`);
                    }
                });
        };

        $scope.saveChanges = function () { // Is some diff item selected ?
            const hasSomeDiffSelected = _.some($scope.diff_containers, { selected: true });
            if (!hasSomeDiffSelected) {
                $translate('properties-not-changed.message').then(function (label) {
                    notify({ classes: [ 'error' ], message: label });
                });
                return;
            }

            // Get all the properties modified
            const keyValueProperties = $scope.diff_containers.filter((diff_container) => diff_container.property_to_modify)
                .map((diff_container) => ({ name: diff_container.property_name, value: diff_container.property_to_modify.value.storedValue }));

            // Save the properties
            HesperidesModalFactory.displaySavePropertiesModal($scope, $routeParams.application, (comment) =>
                // Retrieve the platform .version_id:
                ApplicationService.get_platform($routeParams.application, $routeParams.platform).then((platform) => {
                    console.log('SAVING properties: platform.name=', platform.name, 'platform.version_id=', platform.version_id, 'keyValueProperties=', keyValueProperties);
                    ApplicationService.save_properties($routeParams.application, platform, new Properties({ key_value_properties: keyValueProperties }), $routeParams.properties_path, comment).then(() => {
                        $route.reload();
                    });
                })
            );
        };

        $scope.loadingDiff = true;
        ApplicationService.get_diff($routeParams.application, $routeParams.platform, $routeParams.properties_path, $routeParams.compare_application, $routeParams.compare_platform, $routeParams.compare_path, $scope.compareStoredValues, $routeParams.timestamp).then((diff) => {
            console.log('/diff response:', diff);
            const diffContainers = [];
            diff.common.forEach((commonProperty) => {
                diffContainers.push(new DiffContainer(1, commonProperty.name, { value: commonProperty.left }, { value: commonProperty.right }));
            });
            diff.only_left.forEach((onlyLeftProperty) => {
                diffContainers.push(new DiffContainer(0, onlyLeftProperty.name, { value: onlyLeftProperty.value }, {}));
            });
            diff.only_right.forEach((onlyRightProperty) => {
                diffContainers.push(new DiffContainer(3, onlyRightProperty.name, {}, { value: onlyRightProperty.value }));
            });
            diff.differing.forEach((differingProperty) => {
                diffContainers.push(new DiffContainer(2, differingProperty.name, { value: differingProperty.left }, { value: differingProperty.right }));
            });
            $scope.diff_containers = diffContainers;
            $scope.loadingDiff = false;
        });
    })

    .controller('PropertiesDiffWizardController', function ($scope, $window, $mdDialog, ApplicationService, PlatformColorService) {
        if (!$scope.fromPlatform) {
            throw new Error('.fromPlatform must be provided');
        }
        if (!$scope.fromModule) {
            throw new Error('.fromModule must be provided');
        }

        $scope.formScope = $scope;
        $scope.compareMode = 'final';
        $scope.toPlatform = { application_name: $scope.fromPlatform.application_name, platform: $scope.fromPlatform.platform };
        $scope.toModule = null;
        $scope.lookPast = false;
        $scope.date = null;
        $scope.targetPlatforms = [];

        // Get the list of platforms for an app
        $scope.getTargetPlatforms = function () {
            $scope.targetPlatforms = [];
            if ($scope.toPlatform.application_name) {
                ApplicationService.get($scope.toPlatform.application_name, true).then((application) => {
                    if ($scope.diffForm) {
                        $scope.diffForm.$setValidity('matchingModule', true); // reset to default value
                        $scope.diffForm.toAppName.$setValidity('exist', true);
                    }
                    $scope.targetPlatforms = application.platforms;
                    $scope.checkToPlatformExist();
                }).catch(() => {
                    $scope.diffForm.toAppName.$setValidity('exist', false);
                });
            }
        };

        $scope.checkToPlatformExist = function () {
            if ($scope.diffForm) {
                $scope.diffForm.$setValidity('matchingModule', true); // reset to default value
                const appHasPlatform = _.some($scope.targetPlatforms, { name: $scope.toPlatform.platform });
                $scope.diffForm.$setValidity('toPlatformExist', appHasPlatform);
            }
        };

        $scope.closePropertiesDiffWizard = function () {
            $mdDialog.cancel();
        };

        $scope.backgroundColor = function (item) {
            return PlatformColorService.calculateColor(item.name);
        };

        $scope.getModuleToCompare = function () {
            $scope.loadingComparePlatform = true;
            const timestamp = dateToTimestamp($scope.lookPast, $scope.date);
            ApplicationService.get_platform($scope.toPlatform.application_name, $scope.toPlatform.platform, timestamp).then((platformFetched) => {
                $scope.loadingComparePlatform = false;
                $scope.toPlatform.modules = platformFetched.modules;
                $scope.toModule = _.find($scope.toPlatform.modules, { name: $scope.fromModule.name });
                if ($scope.diffForm) {
                    $scope.diffForm.$setValidity('toPlatformExistAtTime', true);
                    $scope.diffForm.$setValidity('matchingModule', Boolean($scope.toModule));
                }
            }).catch((resp) => {
                $scope.loadingComparePlatform = false;
                $scope.platformQueryError = resp.data;
                $scope.diffForm.$setValidity('toPlatformExistAtTime', false);
            });
        };

        $scope.isDateValid = function () {
            $scope.diffForm.$setValidity('toPlatformExistAtTime', true);
            return (!$scope.lookPast || $scope.dateValid);
        };

        $scope.selectToModule = function (module) {
            $scope.toModule = module;
            if ($scope.diffForm) {
                $scope.diffForm.$setValidity('matchingModule', true);
            }
        };

        $scope.openDiffPage = function () {
            $mdDialog.hide();
            const timestamp = dateToTimestamp($scope.lookPast, $scope.date);
            $window.open(buildDiffPageUrl($scope.fromPlatform, $scope.toPlatform, $scope.fromModule.properties_path, $scope.toModule.properties_path, $scope.compareMode, $scope.lookPast, timestamp), '_blank');
        };

        // Construtor initialization:
        $scope.targetPlatforms = $scope.getTargetPlatforms();
    })

    .controller('GlobalPropertiesDiffWizardController', function ($scope, $window, $mdDialog, ApplicationService, PlatformColorService) {
        if (!$scope.fromPlatform) {
            throw new Error('.fromPlatform must be provided');
        }

        $scope.formScope = $scope;
        $scope.compareMode = 'final';
        $scope.toPlatform = { application_name: $scope.fromPlatform.application_name, platform: $scope.fromPlatform.platform };
        $scope.lookPast = false;
        $scope.date = null;
        $scope.targetPlatforms = [];

        // Get the list of platforms for an app
        $scope.getTargetPlatforms = function () {
            $scope.targetPlatforms = [];
            if ($scope.fromPlatform.application_name) {
                ApplicationService.get($scope.fromPlatform.application_name, true).then((application) => {
                    if ($scope.diffForm) {
                        $scope.diffForm.toAppName.$setValidity('exist', true);
                    }
                    $scope.targetPlatforms = application.platforms;
                    $scope.checkToPlatformExist();
                }).catch(() => {
                    $scope.diffForm.toAppName.$setValidity('exist', false);
                });
            }
        };

        $scope.checkToPlatformExist = function () {
            if ($scope.diffForm) {
                const appHasPlatform = _.some($scope.targetPlatforms, { name: $scope.toPlatform.platform });
                $scope.diffForm.$setValidity('toPlatformExist', appHasPlatform);
            }
        };

        $scope.closeGlobalPropertiesDiffWizard = function () {
            $mdDialog.cancel();
        };

        $scope.backgroundColor = function (item) {
            return PlatformColorService.calculateColor(item.name);
        };

        $scope.isDateValid = function () {
            return (!$scope.lookPast || $scope.dateValid);
        };

        $scope.openDiffPage = function () {
            $mdDialog.hide();
            const timestamp = dateToTimestamp($scope.lookPast, $scope.date);
            $window.open(buildDiffPageUrl($scope.fromPlatform, $scope.toPlatform, '#', '#', $scope.compareMode, $scope.lookPast, timestamp), '_blank');
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
                    }, 100); // Nécessaire pour faire fonctionner le focus au premier essai
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
            templateUrl: 'diff/compare-date-time.html',
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
    });
