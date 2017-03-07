var module = angular.module ('hesperides.properties');

/**
 * This directive will display only the iterable properties
 * This support iterable of iterable properties !
 *
 * Added by Tidiane SIDIBE on 09/02/2017
 */
module.directive('iterablePropertiesContainer', [function (){

    return {
         restrict: 'E',
         scope: {
            iterables: '=',
            iterablesModel: '='
         },

         templateUrl: 'properties/iterable-properties-container.html',
         controller : ['$scope', function ($scope){

            /**
             * Private function for searching the iterable containing the item that's _id is id.
             * This makes use of recursion
             * @param {Object} iterable : the iterable property the item will be search in.
             * @param {Integer} id : the id of the item to be searched
             */
            var findInIterable = function (iterable, id){

               var parent = undefined;

                _(iterable.iterable_valorisation_items).each(function (item){
                    if ( item._id == id ){
                        parent = iterable;
                    }

                    if ( !_.isUndefined (parent) ){
                        return false;
                    }

                    // recur here : on values of iterable
                    _( item.values ).each (function ( value ){
                        parent = findInIterable ( value, id );

                        if ( !_.isUndefined (parent) ){
                            return false;
                        }
                    });
                });

                return parent;
            };

            /**
             * Private function for searching the parent of item that's _id is id
             * @param {Object} iterable : the iterable property the item will be search in.
             * @param {Integer} id : the id of the item to be searched
             */
            var findParent = function(iterables, id){
                var parent = undefined;

                _(iterables).each(function (iterable){
                    parent = findInIterable (iterable, id);

                    if ( !_.isUndefined (parent) ){
                        return false;
                    }
                });

                return parent;
            };

            /**
             * Private function for searching the model in sub model fields.
             * This makes use of recursion
             * @param {Object} iterableModel : is the model of the sub iterable.
             * @param {String} name : is the name of the iterable to find
             */
            var findModelInFields = function (iterableModel, name){
                var model = _.find(iterableModel.fields, {name: name});

                if ( _.isUndefined (model) ){
                    _(iterableModel.fields).each(function (field){
                        model = findModelInFields (field, name);

                        if ( !_.isUndefined (model) ){
                            return false;
                        }
                    })
                }

                return model;
            };

            /**
             * Private function for searching the model in the fields.
             * @param {Object} iterableModel : is the model of the iterable.
             * @param {String} name : is the name of the iterable to find
             */
            var findModel = function (iterablesModel, name){
                var model = _.find(iterablesModel, {name : name});

                if ( _.isUndefined (model) ){
                    _(iterablesModel).each(function(iterableModel){
                        model = findModelInFields (iterableModel, name);
                        if ( !_.isUndefined(model) ){
                            return false;
                        }
                    });
                }

                return model;
            };

            /**
             * Function for adding a new bloc.
             * @param {Object} property : is the property the new bloc should be added to.
             */
            $scope.addOne = function (property){
                // find the model
                var model = findModel ($scope.iterablesModel, property.name);

                // add value from the model
                addFromModel (property, model);

            };

            /**
             * Function for deleting a bloc.
             * @param {Object} item : is the property item to be deleted.
             */
            $scope.deleteOne = function (item){

                // 1 - find the parent of this item
                var parent = findParent($scope.iterables, item._id);

                // 2 - delete the item
                if ( _.isUndefined (parent) ){
                    console.error("Item of id :" + item._id + " was not found :(. This is an error !");
                }

                _.remove(parent.iterable_valorisation_items, {_id: item._id});

            };
         }],

         link: function (scope, element, attrs){

         }
     };
}])

/**
 * This is the directive of the filter button for deleted iterable properties.
 * Added by Tidiane SIDIBE 14/03/2015
 * Updated by Tidiane SIDIBE on 07/03/2017
 */
.directive('toggleDeletedIterableProperties', function () {

    return {
        restrict: 'E',
        scope: {
            iterableProperties: '=',
            toggle: '='
        },
        template: '<md-switch id="toggle-deleted-iterable-properties_switch" class="md-primary md-block" style="margin-right:2%"' +
                    'ng-model="toggle"' +
                    'ng-init="toggle=false" ' +
                    'ng-disabled="(getNumberOfDeletedProperties() <= 0)" ' +
                    'aria-label="{{ \'properties.deletedOnes.switch\' | translate }}">' +
                    '{{ \'properties.deletedOnes.switch\' | translate }} ({{ getNumberOfDeletedProperties() }})          ' +
                    '</md-switch>',
        controller : ['$scope', function ($scope){

            var countForValues = function (values){
                var count = 0;
                _(values).each(function (value){
                    if ( _.isUndefined (value.iterable_valorisation_items) ){
                        // simple
                        if ( !value.inModel ){
                            count ++;
                        }
                    }else {
                        count += countForItems (value.iterable_valorisation_items);
                    }
                });

                return count;
            };

            var countForItems = function (items){
                var count = 0;

                _(items).each(function (item){
                     count += countForValues (item.values);
                });

                return count;
            };

            $scope.getNumberOfDeletedProperties = function (tab) {
                var count = 0;

                if ($scope.iterableProperties) {
                    _($scope.iterableProperties).each(function (property){
                        //is the group in model
                        count += countForItems (property.iterable_valorisation_items);
                    });
                }

                if (count <= 0) {
                    $scope.toggle = false;
                }

                return count;
            };
        }],
        link: function (scope, element, attrs) {

        }
    }
})

/**
 * This is the directive of the filter button for deleted iterable properties.
 * Added by Tidiane SIDIBE 14/03/2015
 * Updated by Tidiane SIDIBE on 07/03/2017
 */
.directive('toggleUnspecifiedIterableProperties', function () {

    return {
        restrict: 'E',
        scope: {
            iterableProperties: '=',
            toggle: '='
        },
        template: '<md-switch id="toggle-unspecified-iterable-properties_switch" class="md-primary md-block"' +
                          'ng-model="toggle"' +
                          'ng-init="toggle=false" ' +
                          'ng-disabled="(getNumberOfUnspecifiedProperties() <= 0)" ' +
                          'aria-label="{{ \'properties.unspecifiedValues.switch\' | translate }}">' +
                          '{{ \'properties.unspecifiedValues.switch\' | translate }} ({{ getNumberOfUnspecifiedProperties() }})' +
                          '</md-switch>',
        controller : ['$scope', function ($scope){
            $scope.getNumberOfUnspecifiedProperties = function () {
                var count = 0;

                // TODO : This should be impleted just like the 'toggleDeletedIterableProperties' directive's controller !

                if (count == 0) {
                    $scope.toggle = false;
                }
                return count;
            };
        }],
        link: function (scope, element, attrs) {

        }
    }
})

/**
 * This is for filtering the deleted properties.
 * Used for iterable properties.
 * NOTE :
 *  This is not working for now, we get a $digest error from angular
 */
.filter('displayIterableProperties', function () {

    /**
     * Private function for filtering values
     * @param {Array} _values : filtered values
     * @param {Array} values : values to be filtered
     */
    var doFilterForValues = function (_values, values){
        _(values).each(function (value){
            if ( _.isUndefined (value.iterable_valorisation_items) ){
                // simple
                if ( !value.inModel ){
                    _values.push(value);
                }
            }else {
                // iterable
                if ( value.inModel ){
                    _values.push({
                        name: value.name,
                        iterable_valorisation_items: [],
                        inModel: value.inModel
                    });

                    doFilterForItems (_values[_values.length - 1].iterable_valorisation_items, value.iterable_valorisation_items);
                }
            }
        });
    }

    /**
     * Private function for filtering iterable items
     * @param {Array} _items : filtered items
     * @param {Array} values : items to be filtered
     */
    var doFilterForItems = function (_items, items){
        _(items).each(function (item){
            _items.push ({
                _id: item._id,
                title: item.title,
                values: []
            });

            // filter the values of that item
            doFilterForValues (_items[_items.length - 1].values, item.values);
        });
    }

    return function (values, display) {
        var filtered = [];
        if ( display ) {
            doFilterForValues (filtered, values)
            console.log(filtered);
            return filtered;
        }else{
            return values;
        }
    };

})

/**
 * This function will filter the iterable properties by values.
 * The filter text and by the simple text or a regex.
 * @see filterIterablePropertiesNames for name filtering
 */
.filter('filterIterablePropertiesValues', function (){
    return function (items, filter){

        if (!filter){
            return items;
        }

        var _value = '.*' + filter.toLowerCase().split(' ').join('.*');
        var regex_value  = undefined;

        try {
            regex_value = new RegExp(_value, 'i');
        }catch (e){
            return items;
        }

        var filtered = [];
        _(items).each (function (item){
            if (regex_value.test(item.value)){
                filtered.push(item);
            }
        });

        return filtered;
    };
});

