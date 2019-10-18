angular.module('hesperides.module.propertiesList', [ 'hesperides.localChanges', 'cgNotify', 'hesperides.properties' ])
.component('propertiesListComponent', {
    templateUrl: 'list-properties-modal.html',
    controller: 'PropertiesListController'
  });