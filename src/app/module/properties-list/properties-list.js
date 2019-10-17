angular.module('hesperides.module.propertiesList', [ 'hesperides.localChanges', 'cgNotify', 'hesperides.properties' ])
    .controller('PropertiesListController', function ($scope, $mdDialog, ModuleService, ApplicationService) {

        $scope.properties = null;        
        $scope.oldGolbalPropertiesUsages = $scope.platform.global_properties_usage;
        $scope.oldProperties = null;
        $scope.nbGlobalPropertyUsages = 0;       

        console.log($scope.platform); 
        $scope.refreshGlobalPropertiesData = function () {
            ApplicationService.get_properties($scope.platform.application_name, $scope.platform.name, '#').then(function (response) {
                $scope.platform.global_properties = response;
                $scope.properties = response.mergeWithGlobalProperties($scope.platform.global_properties);
                console.log($scope.properties); 
            });
            ApplicationService.get_global_properties_usage($scope.platform.application_name, $scope.platform.name, '#').then(function (response) {
                $scope.platform.global_properties_usage = response;                          
            });
        };   

        if ($scope.platform.modules && $scope.platform.modules.length) {           
            $scope.refreshGlobalPropertiesData();       
            
            for ( module of $scope.platform.modules) {
                ModuleService.get_model(module).then(function (model) {
                    if( $scope.properties) {
                        $scope.properties.mergeWithModel(model);
                    }                   
                });
            }           
        }
        
        $scope.getUsageOfGlobalProperty = function (property) {
           
            if($scope.platform.global_properties_usage && property.valuedByAGlobal) {
                console.log(property.name);
                console.log($scope.platform.global_properties_usage);
                property.nbUsage = $scope.platform.global_properties_usage[property.name].length;               
            }
            else{
                console.log($scope.platform.global_properties_usage);
                property.nbUsage = 0;
            }
           
        };
       
        
        $scope.closeDialog = function () {
            $mdDialog.cancel();
        };

            
    })