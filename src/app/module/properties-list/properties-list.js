angular.module('hesperides.module.propertiesList', [ 'hesperides.localChanges', 'cgNotify', 'hesperides.properties' ])
    .controller('PropertiesListController', function ($scope,  $mdDialog) {

            $scope.show_dialog_properties_list = function(providedPlatform) {
                var modalScope = $scope.$new();
                console.log(providedPlatform);
                modalScope.platform=providedPlatform;
    
                $mdDialog.show({
                    templateUrl: 'module/properties-list/list-properties-modal.html',
                    controller: 'PropertiesListController',
                    clickOutsideToClose: true,               
                    scope: modalScope,
                });
            }

    })