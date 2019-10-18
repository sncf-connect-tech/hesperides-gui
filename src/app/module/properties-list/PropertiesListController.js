function PropertiesListController($scope, $mdDialog, ModuleService, ApplicationService) {
    var ctrl = this;

    $scope.properties = null;

    $scope.getNbUsageOfGlobalProperty = function (property) {
        if ($scope.platform.global_properties_usage && property.valuedByAGlobal) {
            property.nbUsage = $scope.platform.global_properties_usage[property.name].length;
        }
        else {          
            property.nbUsage = 0;
        }
    };

    $scope.refreshGlobalPropertiesData = function () {
        ApplicationService.get_properties($scope.platform.application_name, $scope.platform.name, '#').then(function (response) {
            $scope.platform.global_properties = response;
            $scope.properties = response.mergeWithGlobalProperties($scope.platform.global_properties);            
        });
        ApplicationService.get_global_properties_usage($scope.platform.application_name, $scope.platform.name, '#').then(function (response) {
            $scope.platform.global_properties_usage = response;
        });       
    };

    if ($scope.platform.modules && $scope.platform.modules.length) {
        $scope.refreshGlobalPropertiesData();

        for (module of $scope.platform.modules) {
            ModuleService.get_model(module).then(function (model) {
                if ($scope.properties) {
                    $scope.properties.mergeWithModel(model);
                }
                for (property of $scope.properties.key_value_properties) {
                    $scope.getNbUsageOfGlobalProperty(property);
                }
            });
        }
    }    

    $scope.closeDialog = function () {
        $mdDialog.cancel();
    };

}