angular.module('hesperides.module.propertiesList', [ 'hesperides.localChanges', 'cgNotify', 'hesperides.properties' ])
    .controller('PropertiesListController', function ($scope, $mdDialog, ModuleService) {

        $scope.properties = $scope.platform.global_properties.key_value_properties;
        $scope.oldProperties = null;
        $scope.oldGolbalProperties = null;
        $scope.global_properties_usage = null;

        if ($scope.platform.modules && $scope.platform.modules.length) {
            console.log($scope.platform);
            $scope.refreshGlobalPropertiesData();
            console.log($scope.platform);
            for ( module of $scope.platform.modules) {
                ModuleService.get_model(module).then(function (model) {
                    $scope.platform.global_properties.mergeWithModel(model);
                    // Keep the saved properties as old
                    $scope.oldProperties = angular.copy($scope.properties);
                });
            }
           
        }
        
        $scope.closeDialog = function () {
            $mdDialog.cancel();
        };

        $scope.refreshGlobalPropertiesData = function () {
            ApplicationService.get_properties($scope.platform.application_name, $scope.platform.name, '#').then(function (response) {
                $scope.platform.global_properties = response;
                // making a copy, for changes detection
                $scope.oldGolbalProperties = angular.copy($scope.platform.global_properties);
            });
            ApplicationService.get_global_properties_usage($scope.platform.application_name, $scope.platform.name, '#').then(function (response) {
                $scope.platform.global_properties_usage = response;
                $scope.global_properties_usage = response.length;
            });
        };

       
    })