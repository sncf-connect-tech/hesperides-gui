angular.module('hesperides.properties')

/**
 * This directive will display only the iterable properties
 * This support iterable of iterable properties !
 *
 * Added by Tidiane SIDIBE on 09/02/2017
 */
    .directive('iterablePropertiesContainer', [
        function () {
            return {
                restrict: 'E',
                scope: {
                    iterables: '=',
                    iterablesModel: '=',
                },
                templateUrl: 'properties/iterable-properties-container.html',
                controller: 'iterablePropertiesContainerController',
            };
        },
    ])

/**
 * The controller for iterablePropertiesContainer directive
 */
    .controller('iterablePropertiesContainerController', [
        '$scope', function ($scope) {
            /**
              * Private function for searching the iterable containing the item whose .id is id.
              * This makes use of recursion
              * @param {Object} iterable : the iterable property the item will be search in.
              * @param {Integer} id : the id of the item to be searched
              */
            var findInIterable = function (iterable, id) {
                var parent = null;
                _.each(iterable.iterable_valorisation_items, function (item) {
                    if (item.id === id) {
                        parent = iterable;
                    }
                    if (!_.isUndefined(parent)) {
                        return false;
                    }
                    // recur here : on values of iterable
                    _.each(item.values, function (value) {
                        parent = findInIterable(value, id);
                        return _.isUndefined(parent);
                    });
                    return true;
                });
                return parent;
            };

            /**
              * Private function for searching the parent of item whose .id is id
              * @param {Object} iterable : the iterable property the item will be search in.
              * @param {Integer} id : the id of the item to be searched
              */
            var findParent = function (iterables, id) {
                var parent = null;
                _.each(iterables, function (iterable) {
                    parent = findInIterable(iterable, id);
                    return _.isUndefined(parent);
                });
                return parent;
            };

            /**
              * Private function for searching the model in sub model fields.
              * This makes use of recursion
              * @param {Object} iterableModel : is the model of the sub iterable.
              * @param {String} name : is the name of the iterable to find
              */
            var findModelInFields = function (iterableModel, name) {
                var model = _.find(iterableModel.fields, { name });

                if (_.isUndefined(model)) {
                    _.each(iterableModel.fields, function (field) {
                        model = findModelInFields(field, name);
                        return _.isUndefined(model);
                    });
                }

                return model;
            };

            /**
              * Private function for searching the model in the fields.
              * @param {Object} iterableModel : is the model of the iterable.
              * @param {String} name : is the name of the iterable to find
              */
            var findModel = function (iterablesModel, name) {
                var model = _.find(iterablesModel, { name });

                if (_.isUndefined(model)) {
                    _.each(iterablesModel, function (iterableModel) {
                        model = findModelInFields(iterableModel, name);
                        return _.isUndefined(model);
                    });
                }

                return model;
            };

            /**
              * Function for adding a new bloc.
              * @param {Object} property : is the property the new bloc should be added to.
              */
            $scope.addOne = function (property) {
                // find the model
                var model = findModel($scope.iterablesModel, property.name);

                // add value from the model
                addFromModel(property, model); // exposé par properties.js :(
            };

            /**
              * Function for deleting a bloc.
              * @param {Object} item : is the property item to be deleted.
              */
            $scope.deleteOne = function (item) {
                // 1 - find the parent of this item
                var parent = findParent($scope.iterables, item.id);

                // 2 - delete the item
                if (_.isUndefined(parent)) {
                    console.error(`Item of id :${ item.id } was not found :(. This is an error !`);
                }

                _.remove(parent.iterable_valorisation_items, { id: item.id });
            };
        },
    ])

/**
 * This is the directive of the filter button for deleted iterable properties.
 * Added by Tidiane SIDIBE 14/03/2015
 * Updated by Tidiane SIDIBE on 07/03/2017
 */
    .directive('toggleDeletedIterableProperties', function () {
        return {
            restrict: 'E',
            scope: {
                iterableProperties: '=',
                toggle: '=',
            },
            template: '<md-switch id="toggle-deleted-iterable-properties_switch" class="md-primary md-block" style="margin-right:2%"' +
                    'ng-model="toggle"' +
                    'ng-init="toggle=false" ' +
                    'ng-disabled="(getNumberOfDeletedProperties() <= 0)" ' +
                    'aria-label="{{ \'properties.deletedOnes.switch\' | translate }}">' +
                    '{{ \'properties.deletedOnes.switch\' | translate }} ({{ getNumberOfDeletedProperties() }})          ' +
                    '</md-switch>',
            controller: [
                '$scope', function ($scope) {
                    var countForItems = null;
                    var countForValues = function (values) {
                        var count = 0;
                        _.each(values, function (value) {
                            if (_.isUndefined(value.iterable_valorisation_items)) {
                                // simple
                                if (!value.inModel) {
                                    count++;
                                }
                            } else {
                                count += countForItems(value.iterable_valorisation_items);
                            }
                        });

                        return count;
                    };
                    countForItems = function (items) {
                        var count = 0;

                        _.each(items, function (item) {
                            count += countForValues(item.values);
                        });

                        return count;
                    };

                    $scope.getNumberOfDeletedProperties = function () {
                        var count = 0;

                        if ($scope.iterableProperties) {
                            _.each($scope.iterableProperties, function (property) {
                                // is the group in model
                                count += countForItems(property.iterable_valorisation_items);
                            });
                        }

                        if (count <= 0) {
                            $scope.toggle = false;
                        }

                        return count;
                    };
                },
            ],
        };
    })

/**
 * This is the directive of the filter button for deleted iterable properties.
 * Added by Tidiane SIDIBE 14/03/2015
 * Updated by Tidiane SIDIBE on 07/03/2017
 */
    .directive('toggleUnspecifiedIterableProperties', function () {
        return {
            restrict: 'E',
            scope: {
                iterableProperties: '=',
                toggle: '=',
            },
            template: '<md-switch id="toggle-unspecified-iterable-properties_switch" class="md-primary md-block"' +
                          'ng-model="toggle"' +
                          'ng-init="toggle=false" ' +
                          'ng-disabled="(getNumberOfUnspecifiedProperties() <= 0)" ' +
                          'aria-label="{{ \'properties.unspecifiedValues.switch\' | translate }}">' +
                          '{{ \'properties.unspecifiedValues.switch\' | translate }} ({{ getNumberOfUnspecifiedProperties() }})' +
                          '</md-switch>',
            controller: [
                '$scope', function ($scope) {
                    $scope.getNumberOfUnspecifiedProperties = function () {
                        // This should be impleted just like the 'toggleDeletedIterableProperties' directive's controller !
                        $scope.toggle = false;
                        return 0;
                    };
                },
            ],
        };
    })

/**
 * This function will filter the iterable properties by values.
 * The filter text and by the simple text or a regex.
 * @see filterIterablePropertiesNames for name filtering
 */
    .filter('filterIterablePropertiesValues', function () {
        return function (items, filter) {
            if (!filter) {
                return items;
            }
            try {
                var regex_value = new RegExp(`.*${ filter.toLowerCase().split(' ').join('.*') }`, 'i');
                return _.filter(items, (item) => regex_value.test(item.value));
            } catch (error) {
                return items;
            }
        };
    });
