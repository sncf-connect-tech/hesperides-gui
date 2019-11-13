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
            $scope.modulesPerPropertyName = [];

            function toSet(properties) {
                return new Set(_.map(properties, 'name'));
            }

            $scope.allPropertiesNameEquals = function (propertiesModel, givenProperties) {
                return _.isEqual(toSet(propertiesModel.key_value_properties), toSet(givenProperties.key_value_properties));
            };

            // compte le nombre de modules où une propriété est utilisé
            $scope.findModulesWherePropertyUsed = function (properties) {
                if (properties.key_value_properties) {
                    properties.key_value_properties.forEach(function (property) {
                        if (_.find($scope.modulesPerPropertyName, function (prop) {
                            return prop.propertyName === property.name;
                        })) {
                            $scope.modulesPerPropertyName.forEach(function (moduleProperty) {
                                if (moduleProperty.propertyName === property.name) {
                                    moduleProperty.modulesWhereUsed.push(properties.moduleName);
                                }
                            });
                        } else {
                            $scope.modulesPerPropertyName.push({ 'propertyName': property.name, 'modulesWhereUsed': new Array(properties.moduleName) });
                        }
                    });
                }
            };

            $scope.getModulesWherePropertyUsed = function (property) {
                var moduleWhereUsed = [];
                if ($scope.modulesPerPropertyName) {
                    $scope.modulesPerPropertyName.forEach(function (moduleProperty) {
                        if (property.name === moduleProperty.propertyName) {
                            moduleWhereUsed = moduleProperty.modulesWhereUsed;
                        }
                    });
                }
                return `${ moduleWhereUsed.length } : ${ moduleWhereUsed }`;
            };

            $scope.mergeProperties = function (properties, propertiesTomergeWith) {
                $scope.findModulesWherePropertyUsed(propertiesTomergeWith);
                if (properties.key_value_properties) {
                    propertiesTomergeWith.key_value_properties.forEach(function (property) {
                        if (!properties.key_value_properties.some((element) => element.name === property.name)) {
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

        
