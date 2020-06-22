function PlatformEventsModalController($mdDialog, $window, ApplicationService, UserService, applicationName, platformName) {
    const ctrl = this;
    const PAGE_SIZE = 20;
    const MAX_CHECKED_EVENTS_COUNT = 2;
    let pageNumber = 1;
    ctrl.loading = true;
    ctrl.loadingMore = false;
    ctrl.noMoreEvents = false;
    ctrl.events = [];

    ctrl.$onInit = function () {
        ctrl.applicationName = applicationName;
        ctrl.platformName = platformName;
        ctrl.loadMoreEvents();
        UserService.authenticate().then(function (data) {
            ctrl.currentUser = data.username;
        });
    };

    ctrl.loadMoreEvents = function () {
        ctrl.loadingMore = true;
        ApplicationService.getPlatformEvents(applicationName, platformName, pageNumber++, PAGE_SIZE).then((data) => {
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

    ctrl.printModule = function (propertiesPath) {
        const moduleInfos = propertiesPath.split('#');
        const modulePath = moduleInfos.slice(1, moduleInfos.length - 3).join(' / ');
        const moduleName = moduleInfos[moduleInfos.length - 3];
        const moduleVersion = moduleInfos[moduleInfos.length - 2];
        const versionType = moduleInfos[moduleInfos.length - 1].toLowerCase();
        return `${ modulePath } / ${ moduleName } ${ moduleVersion } (${ versionType })`;
    };

    ctrl.openDiff = function () {
        const checkedEvents = ctrl.findCheckedEvents();
        if (checkedEvents.length === MAX_CHECKED_EVENTS_COUNT) {
            const urlParams = {
                application: applicationName,
                platform: platformName,
                properties_path: '#',
                compare_application: applicationName,
                compare_platform: platformName,
                compare_path: '#',
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

function PlatformEventsController($mdDialog) {
    const ctrl = this;
    ctrl.showPlatformEventsModal = function () {
        $mdDialog.show({
            templateUrl: 'platform/events/platform-events-modal.html',
            controller: PlatformEventsModalController,
            controllerAs: '$ctrl',
            clickOutsideToClose: true,
            locals: {
                applicationName: ctrl.applicationName,
                platformName: ctrl.platformName,
            },
        });
    };
}

angular.module('hesperides.platformEvents', [ 'ngMaterial' ])
    .component('platformEvents', {
        templateUrl: 'platform/events/platform-events-button.html',
        controller: PlatformEventsController,
        bindings: {
            applicationName: '<',
            platformName: '<',
        },
    });
