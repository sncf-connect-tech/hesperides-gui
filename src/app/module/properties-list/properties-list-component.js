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
  $scope.modulesProperties =[];

  $scope.getNbUsageOfGlobalProperty = function (property) {
      if ($scope.platform.global_properties_usage && property.valuedByAGlobal) {
          property.nbUsage = $scope.platform.global_properties_usage[property.name].length;
      }
      else {          
          property.nbUsage = 0;
      }
  };

  $scope.getNbModuleDefinitionsOfProperty = function(property) {
    property.nbUsage = 0;
    property.modulesWhereDefine = [];
    $scope.properties.forEach(function(prop) {
        if(property.name ===prop.name) {
            property.nbUsage +=1;
            property.modulesWhereDefine.push();
        }
    }) 
  }

  $scope.propertyFilter = function (property) {  
    displayAllProperties = true;     
    if($scope.onlyPropertiesWithBlankFinalValue) {
        displayAllProperties = (property.finalValue==="" || property.finalValue===null);
    }
    return displayAllProperties;
  };

  $scope.isGlobalValuationIsDiffrentWithModuleValuation = function(property) {
      return property.storedValue !== property.finalValue
  } 

  if ($scope.platform.modules && $scope.platform.modules.length) {
           
      const propertyModelsPromises = [];
      const propertiesModulesPromies = [];
      for (const module of $scope.platform.modules) {
          propertyModelsPromises.push(ModuleService.get_model(module));
          propertiesModulesPromies.push(ApplicationService.get_properties($scope.platform.application_name, $scope.platform.name, module.properties_path, {withDetails: true}))
          propertiesModulesPromies.forEach(function(propertyPromise) {
            propertyPromise.moduleName = module.name;
          })
        }
      
      $q.all({
          globalProperties: ApplicationService.get_properties($scope.platform.application_name, $scope.platform.name, '#'),
          globalPropertyUsages: ApplicationService.get_global_properties_usage($scope.platform.application_name, $scope.platform.name, '#'),
          modulePropertyModels: propertyModelsPromises,
          moduleProperties: propertiesModulesPromies
      }).then(({ globalProperties, globalPropertyUsages, modulePropertyModels, moduleProperties }) => {
          moduleProperties.forEach(function (modulePropery) {
              console.log("Module Properties : " , modulePropery);
              modulePropery.then( function (properties) {                 
                  $scope.properties = properties.mergeWithGlobalProperties(globalProperties);    
                  newProperties = properties.mergeWithGlobalProperties(globalProperties);
                  newProperties.moduleName = modulePropery.moduleName;             
                  $scope.properties.moduleName = modulePropery.moduleName;  
                                                
                  modulePropertyModels.forEach(function (model) {                
                      model.then(function(modelProperties) {
                          $scope.properties = properties.mergeWithModel(modelProperties); 
                          newProperties = properties.mergeWithModel(modelProperties); 
                          $scope.modulesProperties.push(newProperties);                          
                          $scope.platform.global_properties = globalProperties;
                          $scope.platform.global_properties_usage = globalPropertyUsages;                    
                          for (const property of $scope.properties.key_value_properties) {
                              $scope.getNbUsageOfGlobalProperty(property);
                          }   
                          
                          console.log("ALL PROPERTIES : ",   $scope.modulesProperties);        
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
