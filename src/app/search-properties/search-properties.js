function SearchPropertiesController($document, $location, $routeParams, ApplicationService, Platform) {
    const ctrl = this;
    // `ctrl.submittedName` et `ctrl.submittedValue` sont les valeurs soumises alors que `ctrl.form.name`
    // et `ctrl.form.value` sont les valeurs saisies. On distingue les deux parce qu'on se sert de la valeur
    // soumise entre autres pour l'affiche du tableau et on ne veut pas qu'il soit impacté par la saisie en cours.
    ctrl.form = {};
    ctrl.submittedName = '';
    ctrl.submittedValue = '';
    ctrl.loading = false;
    ctrl.properties = [];
    ctrl.selectedOrder = '';

    const setFocus = function () {
        const inputId = ctrl.submittedValue ? 'search_property_value' : 'search_property_name';
        $document[0].getElementById(inputId).focus();
    };

    const setInitialOrder = function () {
        // Le tri dépend de la recherche :
        // * Recherche par nom : tri sur la valeur, puis le module, la plateforme et l'application
        // * Recherche par valeur : tri sur le nom, puis le module, la plateforme et l'application
        // * Recherche par nom et valeur : tri sur le module, la plateforme et l'application
        if (ctrl.submittedName && ctrl.submittedValue) {
            ctrl.selectedOrder = 'propertiesPath';
        } else if (ctrl.submittedName) {
            ctrl.selectedOrder = 'propertyValue';
        } else {
            ctrl.selectedOrder = 'propertyName';
        }
    };

    ctrl.$onInit = function () {
        setFocus();
        ctrl.submittedName = $routeParams.name || '';
        ctrl.submittedValue = $routeParams.value || '';
        if (ctrl.submittedName || ctrl.submittedValue) {
            ctrl.form.name = ctrl.submittedName;
            ctrl.form.value = ctrl.submittedValue;
            ctrl.loading = true;
            ApplicationService.searchProperties(ctrl.submittedName, ctrl.submittedValue).then((properties) => {
                ctrl.properties = properties;
                ctrl.loading = false;
                setFocus();
                setInitialOrder();
            });
        }
    };

    ctrl.submitSearch = function () {
        ctrl.submittedName = ctrl.form.name;
        ctrl.submittedValue = ctrl.form.value;
        // `requestParameters` ne prend en compte que les paramètres renseignés pour
        // éviter d'avoir le cas suivant dans l'URL `search-properties?name=&value=foo`
        const requestParameters = {};
        if (ctrl.submittedName) {
            requestParameters.name = ctrl.submittedName;
        }
        if (ctrl.submittedValue) {
            requestParameters.value = ctrl.submittedValue;
        }
        $location.search(requestParameters);
    };

    ctrl.buildPrettyPropertiesPath = function (propertiesPath) {
        return Platform.prettify_path(propertiesPath);
    };

    ctrl.sortResultTable = function () {
        const sortArray = [];
        sortArray.push(ctrl.selectedOrder);

        if (!ctrl.selectedOrder.includes('propertyName')) {
            sortArray.push('propertyName');
        }
        if (!ctrl.selectedOrder.includes('propertyValue')) {
            sortArray.push('propertyValue');
        }
        if (!ctrl.selectedOrder.includes('propertiesPath')) {
            sortArray.push('propertiesPath');
        }
        if (!ctrl.selectedOrder.includes('platformName')) {
            sortArray.push('platformName');
        }
        if (!ctrl.selectedOrder.includes('applicationName')) {
            sortArray.push('applicationName');
        }
        return sortArray;
    };

    ctrl.changeOrder = function (selectedOrder) {
        if (ctrl.selectedOrder === selectedOrder) {
            ctrl.selectedOrder = `-${ selectedOrder }`;
        } else {
            ctrl.selectedOrder = selectedOrder;
        }
    };
}

angular.module('hesperides.searchProperties', [])
    .component('searchProperties', {
        templateUrl: 'search-properties/search-properties.html',
        controller: SearchPropertiesController,
    });
