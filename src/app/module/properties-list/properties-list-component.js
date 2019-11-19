angular.module('hesperides.module.propertiesList', ['hesperides.localChanges', 'cgNotify', 'hesperides.properties'])
    .component('propertiesListComponent', {
        templateUrl: 'list-properties-modal.html',
        controller: 'PropertiesListController'
    })
    .controller('PropertiesListController',
        function ($scope, $q, $mdDialog, ModuleService, ApplicationService) {

            $scope.properties = [];
            $scope.oldGlobalProperties = null;
            $scope.onlyPropertiesWithBlankFinalValue = false;
            $scope.modulesProperties = [];
            $scope.properties.modulesProperties = [];
            $scope.modulePropertyModels = null;

            function isEmpty(str) {
                return (!str || 0 === str.length);
            }


            // copmpter le nombre de fois où la propriété globale a été réutilisé
            $scope.getNbUsageOfGlobalProperty = function (property) {
                if ($scope.platform.global_properties_usage && property.valuedByAGlobal) {
                    property.nbUsage = $scope.platform.global_properties_usage[property.name].length;
                }
                else {
                    property.nbUsage = 0;
                }
            };

            $scope.mergeWithModel = function (modulesProperties, modelPropertiesPromise) {
                modelPropertiesPromise.forEach(function (model) {
                    model.then(function (modelProperties) {
                        modulesProperties.mergeWithModel(modelProperties);
                    });
                });
            }
            
            $scope.isEqual = function (propertyTocompare, propertyToCompareWith) {
                var equal = false;
                if (propertyTocompare.name === propertyToCompareWith.name &&
                    propertyTocompare.defaultValue === propertyToCompareWith.defaultValue &&
                    propertyTocompare.finalValue === propertyToCompareWith.finalValue &&
                    propertyTocompare.password === propertyToCompareWith.password &&
                    propertyTocompare.required === propertyToCompareWith.required &&
                    propertyTocompare.pattern === propertyToCompareWith.pattern) {
                    equal = true;

                }
                return equal;
            }

            $scope.mergeProperties = function (properties, propertiesTomergeWith) {
                propertiesTomergeWith.key_value_properties.forEach(function (property) {
                    property.modulesWhereUsed = [propertiesTomergeWith.moduleName];
                    property.nbUsage = 1;
                });
                if (properties.key_value_properties) {
                    propertiesTomergeWith.key_value_properties.forEach(function (property) {
                        if (properties.key_value_properties.some(e => e.name === property.name)) {
                            for (var i in properties.key_value_properties) {
                                if ($scope.isEqual(properties.key_value_properties[i], property)) {
                                    properties.key_value_properties[i].nbUsage++;
                                    properties.key_value_properties[i].modulesWhereUsed.push(propertiesTomergeWith.moduleName);
                                } else if(properties.key_value_properties[i].name === property.name) {
                                    properties.key_value_properties[i].nbUsage++; 
                                    property.nbUsage ++;
                                    properties.key_value_properties[i].modulesWhereUsed.push(propertiesTomergeWith.moduleName);                                   
                                }
                            }
                        } else {
                            properties.key_value_properties.push(property);
                        }
                    });
                }
                else {
                    //console.log("undefined : ", properties.key_value_properties)
                    properties.key_value_properties = propertiesTomergeWith.key_value_properties.slice();
                }
            }

            $scope.propertyFilter = function (property) {
                displayAllProperties = true;
                if ($scope.onlyPropertiesWithBlankFinalValue) {
                    displayAllProperties = (property.finalValue === "" || property.finalValue === null);
                }
                return displayAllProperties;
            };

            $scope.isGlobalValuationIsDiffrentWithModuleValuation = function (property) {
                var isNotEqual;
                if (property.storedValue) {
                    isNotEqual = property.storedValue !== property.finalValue
                }
                else {
                    isNotEqual = property.finalValue !== "";
                }
                return isNotEqual;
            }

            if ($scope.platform.modules && $scope.platform.modules.length) {

                const propertyModelsPromises = [];
                const propertiesModulesPromies = [];
                propertiesPromises = [];
                for (const module of $scope.platform.modules) {
                    propertyModelsPromises.push(ModuleService.get_model(module));
                    modulesProperties = ApplicationService.get_properties($scope.platform.application_name, $scope.platform.name, module.properties_path, { withDetails: true })
                    propertiesPromises.push({ moduleName: module.name, modulesProperties: modulesProperties });
                }

                $q.all({
                    globalProperties: ApplicationService.get_properties($scope.platform.application_name, $scope.platform.name, '#'),
                    globalPropertyUsages: ApplicationService.get_global_properties_usage($scope.platform.application_name, $scope.platform.name, '#'),
                    modulePropertyModels: propertyModelsPromises,
                    modulesPromises: propertiesPromises
                }).then(({ globalProperties, globalPropertyUsages, modulePropertyModels, modulesPromises }) => {

                    $scope.modulePropertyModels = modulePropertyModels;
                    modulesPromises.forEach(function (moduleProp) {
                        moduleProp.modulesProperties.then(function (modulePropery) {

                            mergedProperties = modulePropery.mergeWithGlobalProperties(globalProperties);
                            mergedProperties.moduleName = moduleProp.moduleName;

                            $scope.properties.modulesProperties.push({
                                moduleName: mergedProperties.moduleName,
                                properties: mergedProperties.key_value_properties
                            });

                            $scope.platform.global_properties = globalProperties;
                            $scope.platform.global_properties_usage = globalPropertyUsages;

                                                   
                            $scope.mergeProperties($scope.properties, mergedProperties);                                                     
                        });
                    });
                });
                console.log("Properties : ", $scope.properties);
            }

            $scope.closeDialog = function () {
                $mdDialog.cancel();
            };

        });
