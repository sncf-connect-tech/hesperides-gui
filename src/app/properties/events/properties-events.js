function PropertiesEventsModalController($mdDialog, $window, ApplicationService, UserService, applicationName, platformName, propertiesPath, isGlobalProperties) {
    const ctrl = this;
    const PAGE_SIZE = 20;
    const MAX_CHECKED_EVENTS_COUNT = 2;
    let pageNumber = 1;
    ctrl.loading = true;
    ctrl.loadingMore = false;
    ctrl.noMoreEvents = false;
    ctrl.events = [];

    ctrl.$onInit = function () {
        ctrl.isGlobalProperties = isGlobalProperties;
        ctrl.loadMoreEvents();
        UserService.authenticate().then(function (data) {
            ctrl.currentUser = data.username;
        });
    };

    ctrl.loadMoreEvents = function () {
        ctrl.loadingMore = true;
        ApplicationService.getPropertiesEvents(applicationName, platformName, propertiesPath, pageNumber++, PAGE_SIZE).then((data) => {
            ctrl.loading = false;
            ctrl.loadingMore = false;
            if (data.length) {
                ctrl.events = ctrl.events.concat(data);
            }
            if (data.length < PAGE_SIZE) {
                ctrl.noMoreEvents = true;
            }
        });
    };

    ctrl.getModuleAsString = function () {
        const moduleInfos = propertiesPath.split('#');
        const moduleName = moduleInfos[moduleInfos.length - 3];
        const moduleVersion = moduleInfos[moduleInfos.length - 2];
        const versionType = moduleInfos[moduleInfos.length - 1].toLowerCase();
        return `${ moduleName } ${ moduleVersion } (${ versionType })`;
    };

    ctrl.expandAll = function (expanded) {
        ctrl.events.forEach((event) => {
            event.isOpen = !expanded;
        });
    };

    ctrl.filterUserEvents = function (event) {
        return !ctrl.onlyUserEvents || event.author === ctrl.currentUser;
    };

    ctrl.findCheckedEvents = function () {
        return ctrl.events.filter((event) => event.isChecked);
    };

    ctrl.disableCheckbox = function (currentEvent) {
        const checkedEvents = ctrl.findCheckedEvents();
        return checkedEvents.length >= MAX_CHECKED_EVENTS_COUNT && !checkedEvents.includes(currentEvent);
    };

    ctrl.enoughEventsChecked = function () {
        return ctrl.findCheckedEvents().length >= MAX_CHECKED_EVENTS_COUNT;
    };

    ctrl.openDiff = function () {
        const checkedEvents = ctrl.findCheckedEvents();
        if (checkedEvents.length === MAX_CHECKED_EVENTS_COUNT) {
            const urlParams = {
                application: applicationName,
                platform: platformName,
                properties_path: propertiesPath,
                compare_application: applicationName,
                compare_platform: platformName,
                compare_path: propertiesPath,
                compare_stored_values: false,
                timestamp: checkedEvents[0].timestamp,
                origin_timestamp: checkedEvents[1].timestamp,
            };
            const url = `/#/diff?${ Object.keys(urlParams).map(function (key) {
                return `${ encodeURIComponent(key) }=${ encodeURIComponent(urlParams[key]) }`;
            }).join('&') }`;
            $window.open(url, '_blank');
        }
    };

    ctrl.closeModal = function () {
        $mdDialog.cancel();
    };
}

function PropertiesEventsController($mdDialog) {
    const ctrl = this;
    ctrl.$onInit = function () {
        ctrl.propertiesPath = ctrl.propertiesPath || '#';
        ctrl.isGlobalProperties = ctrl.propertiesPath === '#';
    };
    ctrl.showPropertiesEventsModal = function () {
        $mdDialog.show({
            templateUrl: 'properties/events/properties-events-modal.html',
            controller: PropertiesEventsModalController,
            controllerAs: '$ctrl',
            clickOutsideToClose: true,
            locals: {
                applicationName: ctrl.applicationName,
                platformName: ctrl.platformName,
                propertiesPath: ctrl.propertiesPath,
                isGlobalProperties: ctrl.isGlobalProperties,
            },
        });
    };
}

angular.module('hesperides.propertiesEvents', [ 'ngMaterial' ])
    .component('propertiesEvents', {
        templateUrl: 'properties/events/properties-event-button.html',
        controller: PropertiesEventsController,
        bindings: {
            applicationName: '<',
            platformName: '<',
            propertiesPath: '<',
        },
    });
