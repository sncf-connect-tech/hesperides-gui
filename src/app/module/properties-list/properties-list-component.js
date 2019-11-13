angular.module('hesperides.module.propertiesList', [ 'hesperides.localChanges', 'cgNotify', 'hesperides.properties' ])
.component('propertiesListComponent', {
  templateUrl: 'list-properties-modal.html',
  controller: 'PropertiesListController'
})
.controller('PropertiesListController', 
function ($scope, $q, $mdDialog, ModuleService, ApplicationService) {
    
  $scope.properties = null;
  $scope.oldGlobalProperties = null;
  $scope.onlyPropertiesWithBlankFinalValue = false;

  $scope.getNbUsageOfGlobalProperty = function (property) {
      if ($scope.platform.global_properties_usage && property.valuedByAGlobal) {
          property.nbUsage = $scope.platform.global_properties_usage[property.name].length;
      }
      else {          
          property.nbUsage = 0;
      }
  };

  $scope.displayOnlyPropertiesWithBlankFinalValue = function(property) {
      var isBlank = false;
      if(property.finalValue==="" || property.finalValue===null) {
          isBlank = true;
      }
      return $scope.onlyPropertiesWithBlankFinalValue && !isBlank;
  }

  $scope.isGlobalValuationIsDiffrentWithModuleValuation = function(property) {
      return property.storedValue !== property.finalValue
  } 

  if ($scope.platform.modules && $scope.platform.modules.length) {
      console.log('propertiesListController $scope.platform=', $scope.platform);   
       
      const propertyModelsPromises = [];
      const propertiesModulesPromies = [];
      for (const module of $scope.platform.modules) {
          propertyModelsPromises.push(ModuleService.get_model(module));
          propertiesModulesPromies.push(ApplicationService.get_properties($scope.platform.application_name, $scope.platform.name, module.properties_path, {withDetails: true}))
      }
      
      $q.all({
          globalProperties: ApplicationService.get_properties($scope.platform.application_name, $scope.platform.name, '#'),
          globalPropertyUsages: ApplicationService.get_global_properties_usage($scope.platform.application_name, $scope.platform.name, '#'),
          modulePropertyModels: propertyModelsPromises,
          moduleProperties: propertiesModulesPromies
      }).then(({ globalProperties, globalPropertyUsages, modulePropertyModels, moduleProperties }) => {
                  
          console.log('Properties :', moduleProperties);
          console.log('Global properties:', globalProperties);
          moduleProperties.forEach(function (modulePropery) {
              modulePropery.then( function (properties) {
                  $scope.properties = properties.mergeWithGlobalProperties(globalProperties); 
                  modulePropertyModels.forEach(function (model) {                
                      model.then(function(modelProperties) {
                          $scope.properties = properties.mergeWithModel(modelProperties);                           
                          $scope.platform.global_properties = globalProperties;
                          $scope.platform.global_properties_usage = globalPropertyUsages;    
                          console.log('Properties :', $scope.properties);
                          for (const property of $scope.properties.key_value_properties) {
                              $scope.getNbUsageOfGlobalProperty(property);
                          }           
                      });                           
                  });                                   
              });
          });           
      })
  }    

  $scope.closeDialog = function () {
      $mdDialog.cancel();
  };

});
