angular.module('hesperides.module.propertiesList', [ 'hesperides.localChanges', 'cgNotify', 'hesperides.properties' ])
    .component('propertiesListComponent', {
        templateUrl: 'list-properties-modal.html',
        controller: 'PropertiesListController',
    })
    .controller('PropertiesListController',
        function ($scope, $q, $mdDialog, ModuleService, ApplicationService) {
            $scope.properties = [];
            $scope.onlyPropertiesWithBlankFinalValue = false;
            $scope.propertiesKeyFilter = '';

            function allPropertyNamesEqual(leftProperties, rightProperties) {
                return _.isEqual(new Set(_.map(leftProperties, 'name')), new Set(_.map(rightProperties, 'name')));
            }

            $scope.allPropertiesNameEquals = function (propertiesModel, givenProperties) {
                return allPropertyNamesEqual(propertiesModel.key_value_properties, givenProperties.key_value_properties);
            };

            // initialise le nombre d'utilisation d'une propriété dans un module, et
            // le nom des modules où la propriété est utilisé
            $scope.initModulesWhereUsedAndNbUsageOfProperties = function (properties) {
                if (properties.key_value_properties) {
                    properties.key_value_properties.forEach(function (property) {
                        if (!property.modulesWhereUsed) {
                            property.modulesWhereUsed = [ properties.moduleName ];
                            property.nbUsage = 1;
                        }
                    });
                }
            };

            $scope.mergeProperties = function (properties, propertiesTomergeWith) {
                $scope.initModulesWhereUsedAndNbUsageOfProperties(propertiesTomergeWith);
                $scope.initModulesWhereUsedAndNbUsageOfProperties(properties);
                if (properties.key_value_properties) {
                    propertiesTomergeWith.key_value_properties.forEach(function (property) {
                        if (properties.key_value_properties.some((element) => element.name === property.name)) {
                            for (var key_value in properties.key_value_properties) {
                                if (properties.key_value_properties[key_value].name === property.name) {
                                    properties.key_value_properties[key_value].nbUsage++;
                                    property.nbUsage++;
                                    properties.key_value_properties[key_value].modulesWhereUsed.push(propertiesTomergeWith.moduleName);
                                }
                            }
                        } else {
                            properties.key_value_properties.push(property);
                        }
                    });
                } else {
                    properties.key_value_properties = propertiesTomergeWith.key_value_properties.slice();
                }
            };

            // filter pour afficher uniquement les propriétés avec une valeur finale vide
            $scope.propertyWIthBlankFinalValueFilter = function (property) {
                var displayAllProperties = true;
                if ($scope.onlyPropertiesWithBlankFinalValue) {
                    displayAllProperties = (property.finalValue === '' || property.finalValue === null);
                }
                return displayAllProperties;
            };

            $scope.isGlobalValuationIsDiffrentWithModuleValuation = function (property) {
                var isNotEqual = false;
                if (property.valuedByAGlobal) {
                    if (property.storedValue) {
                        isNotEqual = property.storedValue !== property.finalValue;
                    } else {
                        isNotEqual = property.finalValue !== '';
                    }
                }
                return isNotEqual;
            };

            if ($scope.platform && _.get($scope.platform, 'modules')) {
                const propertyModelsPromises = [];
                const propertiesPromises = [];
                for (const module of $scope.platform.modules) {
                    propertyModelsPromises.push(ModuleService.get_model(module));
                    const properties = ApplicationService.get_properties($scope.platform.application_name, $scope.platform.name,
                        module.properties_path, { withDetails: true });
                    propertiesPromises.push({ moduleName: module.name, modulesProperties: properties });
                }

                $q.all({
                    globalProperties: ApplicationService.get_properties($scope.platform.application_name, $scope.platform.name, '#'),
                    globalPropertyUsages: ApplicationService.get_global_properties_usage($scope.platform.application_name, $scope.platform.name, '#'),
                    modelPropertyValuesPromises: propertyModelsPromises,
                    modulePropertyValuesPromises: propertiesPromises,
                }).then(({ globalProperties, globalPropertyUsages, modelPropertyValuesPromises, modulePropertyValuesPromises }) => {
                    $scope.platform.globalPropertyUsages = globalPropertyUsages;
                    modulePropertyValuesPromises.forEach(function (moduleProperties) {
                        moduleProperties.modulesProperties.then(function (moduleProperty) {
                            moduleProperty.mergeWithGlobalProperties(globalProperties);
                            moduleProperty.moduleName = moduleProperties.moduleName;
                            modelPropertyValuesPromises.forEach(function (modelProperty) {
                                modelProperty.then(function (modelProperties) {
                                    if ($scope.allPropertiesNameEquals(modelProperties, moduleProperty)) {
                                        moduleProperty.mergeWithModel(modelProperties);
                                        $scope.mergeProperties($scope.properties, moduleProperty);
                                    }
                                });
                            });
                        });
                    });
                });
            }

            $scope.closeDialog = function () {
                $mdDialog.cancel();
            };
        });
