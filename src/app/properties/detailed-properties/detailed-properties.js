function DetailedPropertiesModalController($mdDialog, ApplicationService, Platform, applicationName, platformName) {
    const ctrl = this;
    ctrl.applicationName = applicationName;
    ctrl.platformName = platformName;
    ctrl.loading = true;
    ctrl.$onInit = function () {
        ApplicationService.getDetailedProperties(applicationName, platformName).then((data) => {
            ctrl.properties = data.detailed_properties;
            ctrl.globalProperties = data.global_properties;
            ctrl.loading = false;
        });
    };
    ctrl.buildPrettyPropertiesPath = function (propertiesPath) {
        return Platform.prettify_path(propertiesPath);
    };
    ctrl.closeModal = function () {
        $mdDialog.cancel();
    };
}

function DetailedPropertiesController($mdDialog) {
    const ctrl = this;
    ctrl.showDetailedPropertiesModal = function () {
        $mdDialog.show({
            templateUrl: 'properties/detailed-properties/detailed-properties-modal.html',
            controller: DetailedPropertiesModalController,
            controllerAs: '$ctrl',
            clickOutsideToClose: true,
            locals: {
                applicationName: ctrl.applicationName,
                platformName: ctrl.platformName,
            },
        });
    };
}

angular.module('hesperides.detailedProperties', [ 'ngMaterial' ])
    .component('detailedProperties', {
        templateUrl: 'properties/detailed-properties/detailed-properties-button.html',
        bindings: {
            applicationName: '<',
            platformName: '<',
        },
        controller: DetailedPropertiesController,
    });
